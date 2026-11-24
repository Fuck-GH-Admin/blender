# ZZZ 角色渲染方案 — 独立 GLSL 参考实现

绝区零（Zenless Zone Zero）角色着色器的参考实现，从 `zzz-studio.app` 的 WebGL
转写中提取、整理、补全为可直接阅读/移植的 GLSL ES 3.10 代码。

**这不是从游戏二进制反编译的**，溯源链见 `PROVENANCE.md`。

---

## 1. 为什么不用现成的

社区确实有开源实现，但都不适用这个场景：

| 项目 | 平台 | ★ | 对本用途的问题 |
|---|---|---:|---|
| [Hoyotoon/HoyoToon](https://github.com/Hoyotoon/HoyoToon) | Unity Built-in RP | 780 | 有 ZZZ 分支且质量高，但**缺** `e039` 区域自发光、`_CharacterLightTonemapParams`、`_Post*Tint`、`_ShadowColorFadeByZ`、wideSpecular、预烘焙描边壳 |
| [Hoyotoon/HoyoToon-Blender](https://github.com/Hoyotoon/HoyoToon-Blender) | Blender **Goo Engine** | 7 | 作者明示 "**not the MMD variants**"（不支持 MMD 模型） |
| [Infused-Doggo/Zenlight](https://github.com/Infused-Doggo/Zenlight) | MME / HLSL | 17 | 唯一面向 MMD 的，但 2024-07 停更，覆盖有限 |

本实现的增量价值：把**较新的 `e0xx` 分支**（当前只有站点在做）和
**完整的参数结构**（20 个 surface 的 material contract）整理成可移植代码。

---

## 2. 先搞清楚层级（这是最容易混淆的地方）

"ZZZ 的着色器"这句话有歧义。实际有 5 层：

| 层 | 内容 | 在本实现里 |
|---|---|---|
| **① Shader 资产** | `NapAvatarStandard` / `…Face` / `…Eye` / `NapStencilShadowCaster` | `src/*.vert` `src/*.frag` |
| **② 材质数据** | 贴图绑定、mode 变体（`e039`/`e021b`）、颜色值 | `params.md` §2–3 |
| **③ 多 Pass 路径** | Character / Stencil(发影) / Outline(描边) / Shadow | 主 pass + 2 个附加 pass |
| **④ 引擎全局** | `_UISunColor`、`_RimWidth`、`_CharacterLightTonemapParams`、`_Post*Tint`… | `params.md` §4（**不在导出资产里**） |
| **⑤ 预烘焙几何** | 12 个 stride-7 描边壳缓冲（28,171 顶点） | `src/zzz_outline.vert` |

④ 是为什么"照抄材质参数也做不出原效果"的根本原因。站点原话：
`_PostOutlineTint` — "global engine parameter, **not stored in exported data**"。

---

## 3. 文件结构

```
zzz_shader_ref/
├── README.md              ← 本文件
├── params.md              ← 完整参数手册（含默认值/范围/来源层级）
├── PROVENANCE.md          ← 逐函数溯源 + 8 项不可还原点
├── validate.py            ← 用 glslc 做语法/类型校验
└── src/
    ├── zzz_character.vert     ← 蒙皮 + 属性透传（含 flipV、Y-up）
    ├── zzz_character.frag     ← 主着色（**合成层，标注为 R**）
    ├── zzz_outline.vert       ← 描边壳（stride-7 预烘焙权重）
    ├── zzz_outline.frag       ← 描边色（5 区域 + 色相偏移）
    ├── zzz_hair_shadow.vert   ← 发影投影体
    ├── zzz_hair_shadow.frag   ← 发影（stencil / 可视化两用）
    └── zzz/                   ← 可 include 的模块
        ├── 00_common.glsl         sRGB / HDR / 5 区域 / 亮度 / HSV
        ├── 10_ramp.glsl           暗部塑形 + 角色光曲线 + 色板
        ├── 20_matcap.glsl         分层 MatCap（3 种混合模式）
        ├── 30_specular.glsl       亮度驱动菲涅尔 + 塑形高光
        ├── 40_rim.glsl            边缘光（逐字）+ e0310 NdotV
        ├── 50_emission.glsl       区域自发光（2×2 超采样）
        ├── 60_face_sdf.glsl       面部 SDF
        ├── 70_outline.glsl        描边（参考实现）
        └── 80_hair_shadow.glsl    发影（参考实现）
```

代码里的注释标记：

- **`[V]`** 从站点 bundle 逐字提取，语义未改
- **`[R]`** 依据 contract 参数语义 + 注释重建
- **`[I]`** 我为可运行补的胶水

---

## 4. 快速开始

### 校验

```bash
python3 validate.py src/zzz_character.vert src/zzz_character.frag \
                    src/zzz_outline.vert   src/zzz_outline.frag \
                    src/zzz_hair_shadow.vert src/zzz_hair_shadow.frag
# 期望输出：6 行 OK
```

> `validate.py` 为什么要预处理：glslc 只编译到 SPIR-V，而 SPIR-V 强制要求所有
> uniform 显式 `layout(location=)`、sampler 要 `layout(binding=)`。这些是
> Vulkan 的限制，WebGL 不需要。脚本会自动补上再校验，从而验证真正的
> 语法/类型/函数体。

### 在 three.js 里用

推荐 `RawShaderMaterial`（`glslVersion: THREE.GLSL3`），因为本实现用的是
`#version 310 es` 而不是 three 的 chunk 体系：

```js
const mat = new THREE.RawShaderMaterial({
  glslVersion: THREE.GLSL3,
  vertexShader:   vertSrc,   // src/zzz_character.vert
  fragmentShader: fragSrc,   // src/zzz_character.frag（先把 #include 展开）
  uniforms: { /* 按 params.md §3 填，从 contract.json 直接映射 */ },
  side: THREE.DoubleSide,    // contract: Cull = 0
});
```

注意：`#include "…"` 需要自己展开（三行正则，或者把模块拼成一个字符串）。
`validate.py` 里的 `inline()` 可以直接借用。

### 参数从哪来

`contract.json` → `params.md` §3 的映射是 1:1 的：

| contract 路径 | uniform |
|---|---|
| `surfaces[i].capabilities.sourceState.Cull` | `side`（0 → DoubleSide） |
| `surfaces[i].capabilities.outline.*` | `zzzWidth` / `zzzZOffset` / `zzzColors[5]` / `zzzTint` |
| `surfaces[i].lighting.shadow[0..4]` | `e021ShadowColors[5]` |
| `surfaces[i].lighting.shallow[0..4]` | `e021ShallowColors[5]` |
| `surfaces[i].lighting.rim.colors[0..4]` | `e021RimColors[5]` |
| `surfaces[i].reflection.regions[k]` | `e03Blend[k]` / `e03Shape[k]` / `e03TintAlpha[k]` |
| `surfaces[i].capabilities.matcaps.regions[k]` | `e03Map0..4` 绑定 |
| `surfaces[i].capabilities.emission.primary.colors[0..4]` | `e039Colors[5]` |

---

## 5. 三个最容易做错的点

1. **暗部塑形分三套，皮肤保留原色。**
   `zzzShadeAlbedo()` 里 `hair` / `skin` / `other` 三条分支不同。MMD toon 通常
   一套通吃，这是皮肤"发灰"的主因。

2. **HDR 颜色不能做 sRGB 解码。**
   任一分量 > 1 时（例如 `e039Colors` 里的 91.6）必须原样用线性值，
   否则会被解成 ~45000，遮罩里 1/255 的压缩噪声直接放大成白块。

3. **区域 ID 不能在非一致控制流里隐式求 LOD。**
   区域逐像素变化 → 边界 quad 的 mip 未定义 → 相机一动就闪。
   必须用 `textureGrad`（见 `e03Sample`）。

---

## 6. 已知缺口（详见 PROVENANCE.md §3）

| # | 缺口 | 影响 |
|---|---|---|
| 1 | 边缘光在游戏里写第二个 RT，合成 pass 未导出 | 叠加方式不可知 |
| 2 | 面部 SDF 坐标系是社区反推（法线对齐 0.9879） | 脸可能对不齐 |
| 3 | 发影只有 uniform 无函数体，且不输出颜色 | 无法用颜色验证 |
| 4 | GI 状态 unavailable | 完全未实现 |
| 5 | `_UISunColor` / `_RimWidth` 是 null | 边缘光需自凑 |
| 6 | 法线 B 通道靠 sqrt 重建 | 细节偏差 |
| 7 | 头部球面高光缺中心点 | 头发高光缺失 |
| 8 | **主 pass 合成顺序是重建的** | **系统性偏差最可能来源** |

第 8 项最重要：站点把主 pass 分散在多个 JS 模板串里（有若干以 `}` 或 `${…}`
结尾的插值片段），无法还原单一完整 `main`。所以 `src/zzz_character.frag` 的
调用顺序是按 contract 参数语义排的，不是原版顺序。

---

## 7. 许可与合规

- 本实现是**互操作性的技术研究**：不含任何游戏资源文件（贴图/网格/动画），
  只有着色数学。
- 官模 MMD 包 readme 明确：**禁止二次配布、禁止商业用途、禁止拆件改造其他模型**。
- 原游戏资产版权归 miHoYo / HoYoverse。使用请自行确认授权范围。
