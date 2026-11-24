# 参数手册 — ZZZ 角色渲染方案

本表把**每一层**参数分清楚，这是做对复刻的前提。层级定义见 `README.md` §2。

图例：**V** = 从站点 bundle 逐字提取 / **C** = 从 `contract.json` 实读取 / **H** = 来自 HoyoToon ZZZ 分支（commit `d9e5ca2`）/ **R** = 依据命名语义重建 / **？** = 不可还原

---

## 1. 着色器变体（第 ② 层：材质数据）

游戏的 `e0xx` 不是"另一个 shader"，是**同一个 shader 文件的 keyword 变体**。

| 变体码 | 含义 | 站点 surface | 关键开关 | 证据 |
|---|---|---|---|---|
| `e039` | 身体 / 衣服 / 头发 / 武器主体 | 15 个 | M.r 区域 + **M.b 自发光遮罩**（HoyoToon 读法） | V |
| `e021b` | 面部 / 眉 / 眼（SDF 分支） | 4 个 | `_LightTex.r` = SDF | V |
| `stencil-shadow` | 头发投影（无颜色） | 1 个 | 只写模板 | C |

`runtimeOptions`（site 内部结构，V）：

```jsonc
// e039
{ "mode":"e039", "variant":"rg++",
  "e021": { "normalize": false, "postTints": false, "composition": "albedo" },
  "e03":  { "uvMatcaps": false, "matcapSRGB": true },
  "e035": { "compensateUV": false, "output": "bypass" },
  "e038": { "enabled": false, "environment": "neutral", "gi": 0 },
  "e039": { "primary": false } }

// e021b
{ "mode":"e021b",
  "e021": { "normal": false, "bias": false, "postTints": false,
            "normalize": false, "composition": "albedo" },
  "e021b": { "faceRevision": true, "facePalette": true,
             "outputTransform": false, "nose": false, "faceHighlight": false } }
```

---

## 2. 贴图槽位（第 ② 层）

`kind` 语义已用像素内容实测 + HoyoToon help 文本双向确认。

| 槽位 | kind | 分辨率 | 张数 | 通道语义 |
|---|---|---|---|---|
| `_MainTex` | D | 2048² sRGB | 4 | RGB 反照率，A 视材质而定 |
| `_LightTex`（身体/头发） | N | 1024² | 3 | **R,G = 法线 RG**（B 需重建）；G 兼作阴影图 |
| `_LightTex`（面部） | F | 256² | 1 | **R = SDF**、G = 脸颊/鼻高光、B = 描边阈值（1.7 后移入顶点色）、A = 下巴下 AO |
| `_OtherDataTex` | M | 2048² | 3 | **R = 材质 ID / 区域**、G = 金属度、B = 高光遮罩（头发高光区）、A 未用 |
| `_OtherDataTex2` | A | 2048² | 3 | **R = 透明**、G = 平滑度、B = 自发光遮罩、A 未用 |
| `_MatCapTex2..5` | C | 256² | 6 | 球面贴图（matcap） |
| `_EyeColorMap` | E | 16² | 1 | 眼部色阶 LUT |
| 描边缓冲 | — | — | 12 个 .bin | stride **7** = pos.xyz + normal.xyz + weight |

> 通道语义出处：`_LightTex` / `_OtherDataTex` / `_OtherDataTex2` 三条 help 文本为 HoyoToon
> `HoyoToonZenlessZoneZero.shader` 第 20–24 行原文；与我对站点贴图的实测一致。

---

## 3. 每材质参数（第 ② 层，来自 `contract.json`，全部为 C）

以 `MAT_AriaIdol_Body_1`（surface-0）为例，其余材质结构相同：

### 3.1 光照 / 色阶

| 字段 | 值 |
|---|---|
| `lighting.smoothness` | 0.05 |
| `lighting.faceSmoothness` | [0.05, 0.03, 0.05] |
| `lighting.smoothnessRegions` | [0.03, 0.05, 0.05, 0.05] |
| `lighting.skinMatId` | 0 |
| `lighting.shadow[0..4]` | `[0.945,0.898,0.898]` / `[0.841,0.857,0.926]` / `[0.72,0.80,0.791]` / `[0.80,0.754,0.72]` / `[0.80,0.80,0.80]` |
| `lighting.shallow[0..4]` | `[1.00,0.961,0.949]` / `[0.919,0.927,0.96]` / `[0.812,0.902,0.892]` / `[0.90,0.848,0.81]` / `[0.90,0.90,0.90]` |
| `lighting.rim` | `{enabled: true, colors: [0.55,0.55,0.55]×5, metallic: 1}` |

### 3.2 反射 / MatCap

| 字段 | 值 |
|---|---|
| `reflection.glossiness` | 1 |
| `reflection.specIntensity` | 0.1 |
| `reflection.metallic` | 1 |
| `reflection.regions[2]` | `capEnabled: true`, `colorBurst: 0.5`, `alphaBurst: 0.5`, `blend: 1`(加性), `softness: 0.1` |
| `reflection.regions[3]` | `capEnabled: true`, `colorBurst: 0.48`, `alphaBurst: 0.43`, `blend: 1` |
| `reflection.regions[4]` | `capEnabled: true`, `colorBurst: 0.5`, `alphaBurst: 0.5`, `blend: 1` |
| `reflection.regions[0..1]` | `capEnabled: false` |
| `reflection.headSphere` | **不可还原**："runtime center unavailable" |

### 3.3 宽高光

| 字段 | 值 |
|---|---|
| `wideSpecular.glossiness` | 1 |
| 每区域 `shape` | 0 |
| 每区域 `toon` | 0.01 |
| 每区域 `modelSize` | 1 |

### 3.4 描边

| 字段 | 值 |
|---|---|
| `enabled` | true |
| `mode` | `"region-map"` |
| `width` | 1 |
| `zOffset` | 0.01 |
| `unityScale` | 0.01 |
| `colours[0]` | `[1.0, 0.2167, 0.2167, 1.0]` ← 爱芮的红色描边 |
| `colours[1..4]` | `[1,1,1,1]` |
| `tint` | `[1,1,1,1]`（`_PostOutlineTint`，**引擎全局**） |
| `data` | `dc80c708…`（12 个描边缓冲之一） |
| `metallic` | 1 |
| `hairBit` | false |

### 3.5 自发光

| 字段 | 值 |
|---|---|
| `emission.primary.enabled` | false（该材质无自发光） |
| `emission.primary.useMask` | true |
| `emission.primary.hueDisabled` | true |
| 备注 | "Exported original shader declares no hue-shift property" |
| `emission.secondary` | `implemented: false` — "samplers are null in current sources" |

### 3.6 渲染状态

| 字段 | 值 |
|---|---|
| `sourceState.Cull` | 0（双面） |
| `sourceState.ZWrite` | 1 |
| `sourceState.alphaClip` | 0 |
| `sourceState.queue` | `"opaque"` |
| `sourceState.blendSource` | `"engine"` |
| （眼睛 surface-5） | `ZWrite: 0`, `SrcBlend: 1`, `DstBlend: 10`, `queue: "blended"`, `blendSource: "material"` |
| （头发投影 surface-17） | `ZWrite: 1`, `SrcBlend: 1`, `DstBlend: 0` |

### 3.7 顶点缓冲

| 字段 | 值 |
|---|---|
| `baseBinding.bumpScale` | 1 |
| `baseBinding.maps` | `{N, M, A}` 三个资源哈希 |

---

## 4. 引擎全局变量（第 ④ 层 —— **不在导出资产里**）

这一层是为什么"照抄材质参数也做不出原效果"的根本原因。站点原话：

- `_PostOutlineTint` — "**global engine parameter, not stored in exported data**"
- `zzzShadowStrength` — "Key light shadow intensity inside the ramp; **set per character by the game and omitted in export data**"
- `_RimGlowIntensityForChara` — "48 · global engine parameter"
- `_CharacterLightTonemapParams` — 角色光曲线，含 `_CharacterAmbient`
- `_ShadowColorFadeByZ` — "palette normalizes near the camera and returns to original color **beyond ~2.3 m**"
- `_UISunColor`（区域 5 组）、`_RimWidth` — **contract 里直接是 null**

| 变量 | 站点默认 | 可调范围 | 说明 |
|---|---|---|---|
| `_PostOutlineTint` | 1 | 0 – 2（步 0.05） | 描边色乘数 |
| `_ShadowColorFadeByZ` | true | 开关 | 近景归一化，>2.3 m 恢复原色 |
| `_CharacterAmbient` | `#000000` | — | **只进亮度曲线，不加到颜色上** |
| `_CharacterLightTonemapParams` | 关闭 | 阈值 0 – 3、上限 0.1 – 4 | `zzzCharCurve` 默认 false |
| `_RimGlowIntensityForChara` | 10 | 0 – 30（步 0.5） | 边缘光强度 |
| `_Skin*Tint[6]` | `#ffffff` ×6 | — | 皮肤调色 |
| `_Post*Tint[6]` | `#ffffff` ×6 | — | 全局调色 |
| `_EntityShadow` | 1 | 0 – 1 | 阴影权重缩放 |
| `_AlbedoShade` | true | 开关 | 暗部反照率塑形总开关 |

---

## 5. 观众可调参数（站点 UI，实测默认值 + 范围）

| 参数 | 默认 | 范围 / 选项 |
|---|---|---|
| 渲染方案 `profile` | `zzz-global` | ZZZ Global / ZZZ Stylized / GLB Original / Raw |
| 画质 `quality` | `high` | auto/high/balanced/economy/low/minimal |
| 灯光强度 `lightingIntensity` | 1 | 0.25 – 2（0.05） |
| 曝光 `exposure` | 0.9 | 0.35 – 1.5（0.025） |
| Toon 阴影强度 `toonShadowIntensity` | 0.72 | 0 – 1.2（0.05） |
| 描边粗细 `outlineThickness` | 1 | 0.25 – 2.5（0.05） |
| 描边开关 `outlineEnabled` | true | — |
| 边缘光 `rimLightEnabled` | true | — |
| 阴影 `shadowsEnabled` | true | — |
| 边缘光强度 `zzzRimIntensity` | 10 | 0 – 30（0.5） |
| 边缘光色 `zzzRimColor` | `#ffffff` | — |
| 描边色调 `zzzOutlineTint` | 1 | 0 – 2（0.05） |
| 阴影强度 `zzzShadowStrength` | 1 | 0 – 1 |
| 实体阴影 `zzzEntityShadow` | 1 | 0 – 1 |
| 眼影浓度 `eyeShadowOpacity` | 0.18 | 0.05 – 0.5（0.01） |
| 眼影中性 `eyeShadowNeutrality` | 1 | 0 – 1（0.01） |
| 光方位 `lightAzimuth` | 38.7° | −180 – 180 |
| 光仰角 `lightElevation` | 47.6° | −85 – 85 |
| 曲线阈值 `zzzCharCurveThreshold` | 0.8 | 0 – 3（0.05） |
| 曲线上限 `zzzCharCurveMax` | 1.2 | 0.1 – 4（0.05） |

---

## 6. 关键常数速查（做复刻时最常对不上的）

| 常数 | 值 | 出现位置 |
|---|---|---|
| 塑形亮度 | `0.29, 0.60, 0.11` | 暗部塑形 / 菲涅尔 / e0310 |
| Rec.709 亮度 | `0.212673, 0.715152, 0.072175` | **仅**角色光曲线 |
| 塑形幂基 | `1.4375`，系数 `0.2875` | 暗部塑形 + 菲涅尔 |
| 头发固定幂 | `1.0 + 0.4·lum`，提亮 `1.05 − 0.05·lum` | 暗部塑形 |
| 区域阈值 | `0.8 / 0.6 / 0.4 / 0.2` | 5 区域映射 |
| 自发光遮罩重映射 | `1.25 · (ab − 0.2)`，下限 `0.02` | e039 |
| 菲涅尔 F0 | `0.04` | 塑形高光 / rim |
| 高光归一 | `100.0`、`0.166663334`、`0.75/0.25` | 塑形高光 |
| rim 距离系数 | `0.083333`（1/12）、`0.2 - 1.0` 衰减、`0.7` 幅度 | rim |
| rim 亮部增益 | `sum² · 0.05 + 1.0` | rim |
| outline unityScale | `0.01` | 描边 |
