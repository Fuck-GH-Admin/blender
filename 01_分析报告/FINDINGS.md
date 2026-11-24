# 全量镜像的新发现（相对之前只拆爱芮）

分析对象：**30 个角色 / 450 个 surface / 30 份材质契约**。

---

## 1. 原版 shader 一共 8 个，之前只知道 4 个

| shader | 用量 | 备注 |
|---|---:|---|
| `miHoYo/Character/NapAvatarStandard` | 299 | 主体（身体/衣服/头发/武器） |
| `miHoYo/Character/NapAvatarStandardFace` | 66 | 面部 SDF |
| `miHoYo/Character/NapAvatarStandardEye` | 28 | 眼部 |
| `miHoYo/Character/NapStencilShadowCaster` | 28 | 发影（只写 stencil） |
| `miHoYo/Character/NapAvatarStandardTransparent` | 20 | **新**：透明/半透明版本 |
| `miHoYo/Character/NapAvatarScreen` | 5 | **新**：屏幕/全息面板 |
| `Standard（Unity 原生）` | 2 | **新**：完全退回 Unity PBR |
| `miHoYo/Character/NapAvatarStandardGunEye` | 1 | **新**：武器眼 |

`NapAvatarStandardTransparent` 是**独立 shader**（不是同一文件的 keyword 变体），
出现在 `queue: "transparent"` 的材质上（如 anby-demara 的 `MAT_Anbi_Body_PlasticPack`），
并额外绑 `_StretchMask` + `_TransitionTex`。

---

## 2. mode 码：定义了 13 种，实际只用到 7 种

从 JS 的运行期校验数组里拿到完整合法列表：

```
flat, lit-albedo, flat-normal, e021, e021b, e3, e037,
e039, stencil-shadow, gun-eye, particles-dissolve,
unity-standard, nap-avatar-screen
```

| 使用情况 | mode | 用量 | 说明 |
|---|---|---:|---|
| ✅ | `e039` | 319 | 身体/衣服/头发/武器 |
| ✅ | `e021b` | 92 | 面部/眉/眼（SDF） |
| ✅ | `stencil-shadow` | 28 | 发影 |
| 🆕 | `nap-avatar-screen` | 5 | 屏幕面板（`_ScreenImage=0`） |
| 🆕 | `flat` | 2 | 面部但 **SDF 不可用**，退化成无光照 |
| 🆕 | `unity-standard` | 2 | Unity Standard PBR |
| 🆕 | `gun-eye` | 1 | 武器眼（调色板按 `_GunEyeState` 轮换） |
| ❌ | `e021 / e3 / e037` | 0 | 老版本变体，这批角色不用 |
| ❌ | `lit-albedo / flat-normal` | 0 | 诊断用兜底模式 |
| ❌ | `particles-dissolve` | 0 | 溶解（对应 `_TransitionTex`） |

> 关键：**`particles-dissolve` 有定义但没启用**，这就是 `_TransitionTex` 只存不用的原因。

---

## 3. 贴图 kind 多出两类：`X` 和 `T`

### `X` —— 未分类的附加贴图（31 个唯一资源 / 120 次绑定，覆盖 7 个槽位）

| 槽位 | 绑定次数 | 实测内容（看图判定） |
|---|---:|---|
| `_TransitionTex` | 106 | 紫底绿斑的噪声团 → **溶解/切换的 threshold mask** |
| `_StretchMask` | 5 | 红绿黄色块 → 拉伸/挤压形变遮罩（RGB 分包） |
| `_SecondaryEmissionMaskTex` | 5 | 近黑底 + 白斑 → 二级自发光遮罩 |
| `_BlockMaskTex` | 1 | 灰阶条带 → 块状遮罩 |
| `_ScreenMask` | 1 | 高对比黑白流线 → 屏幕扫描线/流光遮罩 |
| `_ScreenTex` | 1 | 近黑 + 稀疏点 → 屏幕内容图 |
| `_SecondaryEmissionTex` | 1 | 柔和圆形辉光 → 二级自发光贴图 |

### `T` —— 仅 1 个

`_TransmissionTexture`：remielle 的翅膀材质，2048²，叶脉/羽状图案。
对应 `transmission.state = "adapted"`，**站点自己承认不是游戏公式**：

> "_RenderType 4 (TRANSMISSION): Standard branch plus an adapted back-light term
> coloured by _TransmissionTexture (not the game formula; intensity 1.0 chosen by
> the renderer and approved visually)"

---

## 4. 新的 capability 组

| 组 | 用量 | 内容 |
|---|---:|---|
| `crystal` | 2 | "NapAvatarStandardCrystal CharacterToonDeferred (ps blob 2708): tangent parallax, 4x HDR MatCap, A=1, MatCap Fresnel, dielectric F0, unclamped backlight" —— 钻石/水晶材质 |
| `transmission` | 1 | 见上，adapted |
| `napAvatarScreen` | 5 | `_Color/_MainTex/_Emission/_Roughness/_Metallic` 映射到 MeshStandardMaterial |
| `unityStandard` | 2 | Unity Standard PBR 全参数（renderMode/metallic/glossiness/bumpScale/occlusionStrength…） |
| `gunEye` | 1 | 调色板按 `_GunEyeState` 轮换、圆环 `0.02·Σalpha`、`y×(1−0.9·_BumpScale)`、背面 + COLOR.x 描边混合 |

---

## 5. 数据质量信号（这站点做得挺诚实）

| status | 数量 |
|---|---:|
| complete | 329 |
| partial | 120 |
| fallback | 1 |

`issues` Top 前缀：

| 次数 | issue |
|---:|---|
| 36 | No verified Unity mesh/UV/normal correspondence |
| 36 | Material assignment without verified geometry |
| 28 | Stencil-only hair shadow (no colour in game) |
| 16 | Outline vertex data unavailable |
| 5 | NapAvatarScreen adapted；游戏 deferred/bloom 后期不同 |
| 2 | Facial SDF unavailable: anatomical frame contradicts verified face normals |
| 2 | Unity Standard PBR adapted；viewer IBL 与游戏不同 |
| 1 | Ring centre approximated（`_GunEyeToLocalMatrixL/R` 由游戏脚本设置，未序列化） |
| 1 | Source MatCap enabled but not rendered |
| 1 | Eye ramp unavailable |
| 1 | **Original material JSON missing** |

---

## 6. 唯一一个 fallback：yixuan `Eff_Materials_FX_003`

全 450 个 surface 里**只有这一个** `status: "fallback"`：

```json
{ "mode": null, "supported": null, "capabilities": {},
  "issues": ["Original material JSON missing"] }
```

另外它的 `evidence.geometry.transform` 是 `{axes:[0,1,2], signs:[1,1,1]}`，
而其他所有 surface 都是 `{axes:[0,2,1], signs:[-1,1,-1]}` —— 说明这一个是靠
**相似变换拟合**临时对的，连坐标系都没走标准路径。

---

## 7. 这批新东西说明什么

1. **ZZZ 角色材质体系比之前看到的更宽**：至少 4 类特效 shader（透明/屏幕/武器眼/晶体）
   加 1 类完全退回 Unity 的兜底。只拆爱芮等于只看了「标准角色」这一条路。
2. **`_TransitionTex` + `particles-dissolve` 是配套的**：溶解 mask 已随材质导出，
   但站点没实现该模式。要做完整复刻，这是明确待补的拼图。
3. **`crystal` 是第二个提到 `ps blob 2708` 的组**（rim 是 `blob 2700`），
   说明游戏角色 shader 有多个 blob（入口点），站点是逐个转写的。
4. **最该复查的是 `flat`**：它是 `NapAvatarStandardFace` 材质，但 SDF 被判定不可用
   （"anatomical frame contradicts verified face normals"）→ **有些角色的脸用不了 SDF**，
   站点直接退成无光照。这可能是这批模型里最明显的观感损失。
