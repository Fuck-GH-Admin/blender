# 溯源与已知缺口

这份文件的作用：**说清楚哪一行是原版的、哪一行是我猜的。**
一个"参考实现"如果不说清楚这个，就没法被信任。

标注：**V** 逐字还原 / **C** contract 实读 / **H** HoyoToon / **R** 依据语义重建 / **I** 为可运行补的胶水 / **？** 原理性不可还原

---

## 1. 证据链

```
游戏 Unity 资产 (Unity 6 / Built-in RP)
   │  miHoYo/Character/NapAvatarStandard      pathId 3888839570379262989
   │  miHoYo/Character/NapAvatarStandardFace   pathId 8174284373312262851
   │  miHoYo/Character/NapAvatarStandardEye    pathId 7755011506878469506
   │  miHoYo/Character/NapStencilShadowCaster  pathId 9078208572821743001
   │
   ├──(A)──> 社区转写  HoyoToon@d9e5ca2f312bf16fba89dee67d32c08b482dcda4
   │          · Unity Built-in RP
   │          · 5 Pass：Character / Stencil / Character Light / Outline / Shadow
   │          · 有 _LightTex / _OtherDataTex / _OtherDataTex2 通道语义文档
   │          · 无 e039 / _CharacterLightTonemapParams / _Post*Tint
   │
   └──(B)──> zzz-studio.app 的 WebGL 转写（three.js r186）
              · 20 个 surface 的 global-contract（本次分析的主要依据）
              · 引入了 e021/e039/e03/e0310 等较新分支
              · 用 onBeforeCompile 把逻辑塞进 MeshStandardMaterial
              ·
              └──(C)──> 本参考实现
                         · 从 (B) 的 bundle 中提取 71 段 GLSL（去重后），
                           其中 16 段是 ZZZ 专属（19 KB）
                         · 用 (B) 的 contract.json 提供参数结构
                         · 用 (A) 的 help 文本交叉验证贴图通道语义
```

**重要**：本实现是 **(B) 的转写的再整理**，不是从游戏二进制直接反编译。
所以它继承 (B) 的全部判断，也继承 (B) 的已知偏差。

---

## 2. 逐函数溯源

| 函数 | 文件 | 等级 | 原始出处 |
|---|---|---|---|
| `zzzSrgbDecode` | 00_common | **V** | `e021Decode` / `e03Decode` / `p4Decode` 三处等价实现 |
| `zzzHdrColor` | 00_common | **V** | `e021HdrColor` / `e039HdrColor` / `e03HdrColor` |
| `zzzRegion5` | 00_common | **V** | `e039Region` / `e0310Region` 两处等价实现 |
| `zzzRgbToHsv` | 00_common | **V** | `zzzRgbToHsv` 原函数 |
| `zzzHsvToRgb` | 00_common | **I** | 我自己补的逆变换 |
| `zzzLinearDepth` | 00_common | **V** | `e0310Linear` / `p5Linear` |
| `zzzShadeAlbedo` | 10_ramp | **V** | `e021ShadeAlbedo`（注释引自 Standard lines 508-545） |
| `zzzCharLight` | 10_ramp | **V** | `e021CharLight`（注释引自 lines 555-568 / 668-684） |
| `zzzShadowColor` / `zzzShallowColor` / `zzzPostTint` | 10_ramp | **V** | `e021Shadow` / `e021Shallow` / `e021Post` |
| `zzzToonShade` | 10_ramp | **R** | 站点未公开主 pass 拼装；按 `toonShadowIntensity` 语义重建 |
| `zzzRamp` | 10_ramp | **R** | 同上（三色带合成） |
| `e03SnapRegionUV` / `e03Sample` | 20_matcap | **V** | `e03SnapRegionUV` / `e03Sample`（含 textureGrad 防闪烁注释） |
| `e03MatcapScaled` | 20_matcap | **V** | 三种混合模式，含 "upstream overlay" 注释 |
| `e03SpecularFresnel` | 30_specular | **V** | 完整 |
| `e03ShapedHighlight` | 30_specular | **V** | 完整（含 `100.0`、`0.166663334` 常数） |
| `zzzTranscribedRim` | 40_rim | **V** | `e021TranscribedRim`（注释引自 blob 2700 lines 617-732） |
| `zzzNdotv0310` / `zzzScreenOffset0310` / `zzzScreenCompare0310` | 40_rim | **V** | `e0310Ndotv` / `e0310Offset` / `e0310Screen` |
| `zzzEmissionMask` / `zzzEmissionFiltered` | 50_emission | **V** | `e039Mask` / `e039Filtered` |
| `zzzFaceSdfShadow` / `zzzFaceHighlight` / `zzzFaceChinAO` | 60_face_sdf | **R** | contract 给了数据和坐标帧，采样逻辑按 SDF 语义重建 |
| `zzzOutlineExtrude` | 70_outline | **R** | contract 给了 stride-7 布局与 width/zOffset；外扩公式重建 |
| `zzzOutlineColor` | 70_outline | **R** | 5 区域色（C）+ 色相偏移（H） |
| `zzzHairShadowProject` | 80_hair_shadow | **R** | 只有 uniform 声明，函数体未公开（surface 标 partial） |
| `zzzReconstructNormal` | 90_character | **R** | contract: "RG reconstruction is the existing shared community adaptation" |
| 主 pass 合成顺序 | 90_character | **R** | 见下 §3 |

---

## 3. 不可还原点（这些是硬缺口，不是没做完）

### 3.1 边缘光写进了第二个 render target ？

站点注释原文：

> "Transcribed rim (docs/rim-transcribed-20261112.md): CharacterToonDeferred
> blob 2700, lines 617–732. **The game writes it to a second render target
> composed by a pass that is not exported**; here it is added before tone mapping."

也就是说：
- 游戏里 rim 是**独立一个 RT**，由某个**没有导出**的 pass 合成
- 合成方式（叠加 / lerp / 是否在 tonemap 前后）**在资产里看不到**
- 站点只能选择"在 tone mapping 之前直接相加"

→ 本实现沿用站点的选择，并明确标注为 **？**

### 3.2 面部 SDF 的坐标系是社区反推的

contract 原文：

> `faceProfile.frameProvenance`: "Community SDF adaptation: anatomical eye pair +
> head/parent bind matrices, corroborated by face normals; **not captured Nap globals**"

- SDF 贴图（F 类 256²）是**真的**
- 面部 UV（TEXCOORD3）是**逐值验证过的**（160 个 float 与原始 Mesh 全等）
- 但"用哪个坐标系去查这张图"是社区用 `Skn_L_Eye` / `Skn_R_Eye` + `Bip001_Head` /
  `Bip001_Neck` 绑定矩阵推出来的，法线对齐度 0.9879
- 游戏真实的 Nap globals 没有导出

→ **？** 无法保证和游戏逐像素一致

### 3.3 头发投影只有 uniform 没有函数体

contract surface-17 标 `partial`，理由三条（见 `80_hair_shadow.glsl` 头注释）。
游戏里这遍**不输出颜色**，只写 stencil —— 所以即便公式对，也没法通过颜色验证。

→ **？** 重建部分

### 3.4 GI 完全没有

contract: `capabilities.gi.state = "unavailable"`
理由："Original probes/globals not present; no synthetic source data generated"

→ 本实现**故意不实现**，而不是用假的近似

### 3.5 边缘光缺两个关键全局

contract: `rim.sun = [null × 5]`、`rim.width = null`
reasons: "missing regional _UISunColor"、"missing _RimWidth"、
"active rim hue path unknown or unimplemented"

→ 所以 `zzzTranscribedRim` 里 `e021LightColor` 要从环境光/主光自己凑

### 3.6 法线 B 通道是重建的

contract: `normalRG.convention` = "the existing shared community adaptation,
**not visual approval**"

→ 游戏只存 RG，B 靠 `sqrt(1 - x² - y²)` 重建

### 3.7 头部球面高光没做

contract: `reflection.headSphere` = "**not reconstructed**: runtime center unavailable;
geometric/bumped normal branch only"

→ 爱芮的头发该有个以头骨为中心的球面高光，缺中心点所以没做

### 3.8 合成顺序整体是重建的

站点把主 pass 分散在多个 JS 模板串里，我提取到的 71 段中有若干以 `}` 或 `${...}`
结尾（插值拼接），**无法还原单一完整 main**。所以 `90_character.frag` 的调用顺序
（色阶 → matcap → 高光 → rim → 自发光）是依据 contract 的参数语义排的，不是原版顺序。

**这一项对最终观感影响最大，也最可能和原版有系统性偏差。**

---

## 4. 与 HoyoToon 的差异清单

同源，但站点（=本实现的依据）更新。

| 特性 | HoyoToon `d9e5ca2` | 站点 / 本实现 |
|---|---|---|
| 5 Pass 结构 | ✅ Character/Stencil/Light/Outline/Shadow | ✅ 同构 |
| `_LightTex` 通道语义 | ✅ 有文档 | ✅ 沿用 + 实测确认 |
| `_OtherDataTex(2)` 通道 | ✅ 有文档 | ✅ 沿用 |
| 5 区域描边色 | ✅ `_OutlineColor1..5` | ✅ `zzzColors[5]` |
| 描边色相偏移 | ✅ `_OutlineHue1..5` | ✅ 本实现已含 |
| `_MaterialType` 7 型 | ✅ Base/Face/Eye/Shadow/Hair/EyeHighlight/EyeShadow | 站点用 mode 码 `e039`/`e021b` |
| **`e039` 区域自发光** | ❌ 无 | ✅ 有（含 2×2 超采样） |
| **`_CharacterLightTonemapParams`** | ❌ 无 | ✅ 有 |
| **`_CharacterAmbient`** | ❌ 无 | ✅ 有 |
| **`_Post*Tint` / `_PostOutlineTint`** | ❌ 无 | ✅ 有 |
| **`_ShadowColorFadeByZ`** | ❌ 无 | ✅ 有 |
| **`_RimGlowIntensityForChara`** | ❌ 无 | ✅ 有 |
| **wideSpecular** | ❌ 无 | ✅ 有 |
| **预烘焙 stride-7 描边缓冲** | ❌ 实时法线外扩 | ✅ 预烘焙权重 |
| GI | ❌ | ⚠️ 有字段但 unavailable |

---

## 5. 怎么验证对不对

1. **语法/类型**：`python3 validate.py src/*.vert src/*.frag` —— 六份全部通过（glslc）
2. **数值回归**：用 `contract.json` 里 20 个 surface 的参数喂进去，与站点截图逐区域对比
3. **函数级单测**：`zzzShadeAlbedo` / `zzzCharLight` / `zzzEmissionMask` 都是纯函数，
   可以直接用固定输入算期望值（建议拿 skin / hair / other 三个分支各一个用例）
4. **已知不可验证**：§3 里 8 项都无法用数值验证，只能靠观感
