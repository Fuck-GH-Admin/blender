# zzz-studio.app 资源镜像 · 分析索引

镜像时间 2026-11-24 · 来源 `https://zzz-studio.app/` + `https://assets.zzz-studio.app/`

## 体量

| 目录 | 文件数 | 大小 | 内容 |
|---|---:|---:|---|
| `site/` | 97 | 10.8 MB | SPA 外壳：index.html / JS(40) / CSS / 图标 / 贴纸 / 立绘 / 字体 |
| `models/` | 30 | 451.4 MB | 30 个角色的 model.glb |
| `contracts/` | 30 | 6.6 MB | 每个模型的材质契约（文件名 = GLB 的 sha256） |
| `textures/` | 585 | 575.4 MB | 契约引用的贴图，按内容哈希去重 |
| `buffers/` | 345 | 25.6 MB | 描边壳顶点缓冲（stride 7） |
| **合计** | **1091** | **1070.0 MB** | |

## 30 个角色的契约概览

| 角色 | surface | 材质 | 贴图 | 描边buf | coverage(完/部分/兜底) | mode 码 | GLB sha256(前12) |
|---|---:|---:|---:|---:|---|---|---|
| alice | 14 | 9 | 18 | 9 | 8/6/0 | e039×9, e021b×3, stencil-shadow×1, nap-avatar-screen×1 | `f617539ba815` |
| anby-demara | 8 | 7 | 20 | 4 | 5/3/0 | e039×5, e021b×2, stencil-shadow×1 | `a25351f9d899` |
| aria | 20 | 9 | 21 | 12 | 14/6/0 | e039×15, e021b×4, stencil-shadow×1 | `00c580250fd8` |
| aria-robot | 16 | 6 | 19 | 9 | 11/5/0 | e039×13, nap-avatar-screen×1, e021b×2 | `12edc40e35dc` |
| astra | 15 | 13 | 45 | 12 | 12/3/0 | e039×11, e021b×3, stencil-shadow×1 | `9efd87f26ef5` |
| brujas | 14 | 11 | 24 | 9 | 8/6/0 | e039×9, e021b×3, stencil-shadow×1, gun-eye×1 | `4d3bcec6dd40` |
| burnice | 9 | 9 | 18 | 6 | 6/3/0 | e039×5, e021b×3, stencil-shadow×1 | `134e5b0f7472` |
| cissia | 22 | 9 | 27 | 19 | 17/5/0 | e039×16, e021b×5, stencil-shadow×1 | `98ba2ad7e214` |
| claret-original | 13 | 10 | 20 | 10 | 8/5/0 | e039×7, e021b×5, stencil-shadow×1 | `6403afc0f3c6` |
| dracaene | 11 | 7 | 17 | 9 | 7/4/0 | e039×6, e021b×4, stencil-shadow×1 | `c1ed68401f39` |
| evelyn | 16 | 8 | 21 | 12 | 13/3/0 | e039×12, e021b×3, stencil-shadow×1 | `f5b57acb3888` |
| harumasa | 17 | 8 | 27 | 15 | 14/3/0 | e039×14, e021b×2, stencil-shadow×1 | `df564aab9cb7` |
| hugo-vlad | 17 | 10 | 28 | 14 | 14/3/0 | e039×13, flat×2, e021b×1, stencil-shadow×1 | `39410f8a89df` |
| janedoe | 11 | 8 | 21 | 9 | 8/3/0 | e039×7, e021b×3, stencil-shadow×1 | `5966cf11a10e` |
| lucy | 13 | 10 | 22 | 11 | 10/3/0 | e039×9, e021b×3, stencil-shadow×1 | `17f5722f803d` |
| nangong-yu | 14 | 11 | 18 | 10 | 8/6/0 | e039×7, e021b×4, stencil-shadow×1, unity-standard×2 | `ec316002e09d` |
| piper | 8 | 7 | 18 | 5 | 5/3/0 | e039×5, e021b×2, stencil-shadow×1 | `ea095318f005` |
| promeia | 16 | 9 | 24 | 14 | 12/4/0 | e039×11, e021b×4, stencil-shadow×1 | `5df68680fbcd` |
| qingyi | 10 | 8 | 18 | 6 | 5/5/0 | e039×6, e021b×3, stencil-shadow×1 | `289d34cf53ab` |
| remielle | 31 | 13 | 39 | 26 | 27/4/0 | e039×26, e021b×4, stencil-shadow×1 | `cbf41b914c70` |
| rina | 11 | 8 | 24 | 9 | 9/2/0 | e039×8, e021b×2, stencil-shadow×1 | `6cdf06528606` |
| seed | 18 | 15 | 49 | 14 | 13/5/0 | e039×14, e021b×3, stencil-shadow×1 | `f32e3e44eda9` |
| sigrid | 14 | 8 | 19 | 11 | 10/4/0 | e039×9, e021b×4, stencil-shadow×1 | `78ad8c4f3067` |
| sp-billy | 18 | 7 | 36 | 18 | 18/0/0 | e039×18 | `4e3bbb7965a6` |
| sunbringer-original | 12 | 8 | 21 | 10 | 8/4/0 | e039×7, e021b×4, stencil-shadow×1 | `b11b4385d8d5` |
| sunna | 21 | 13 | 35 | 17 | 14/7/0 | e039×13, nap-avatar-screen×2, e021b×5, stencil-shadow×1 | `8045fbf24755` |
| vivian | 13 | 9 | 23 | 10 | 10/3/0 | e039×9, e021b×3, stencil-shadow×1 | `b41acfeab2ee` |
| yixuan | 14 | 11 | 35 | 10 | 10/3/1 | e039×9, e021b×3, None×1, stencil-shadow×1 | `165bc7ac7e01` |
| yuzuha | 12 | 9 | 24 | 8 | 9/3/0 | e039×8, e021b×3, stencil-shadow×1 | `53c58d322037` |
| zhuyuan | 22 | 9 | 27 | 17 | 16/6/0 | e039×18, e021b×2, stencil-shadow×1, nap-avatar-screen×1 | `0bcee1c17437` |

## 全局统计

**mode 码分布**（这是 shader 变体体系，共 7 种 + 1 个空值）：

| mode | 出现次数 | 含义 |
|---|---:|---|
| `e039` | 319 | 身体/衣服/头发/武器主体 |
| `e021b` | 92 | 面部/眉/眼（SDF 分支） |
| `stencil-shadow` | 28 | 头发投影（无颜色，只写模板） |
| `nap-avatar-screen` | 5 | **首次出现**：屏幕/UI 类叠加（5 次） |
| `flat` | 2 | **首次出现**：平面/unlit（hugo-vlad，2 次） |
| `unity-standard` | 2 | **首次出现**：退回 Unity 标准光照（nangong-yu，2 次） |
| `gun-eye` | 1 | **首次出现**：武器眼（brujas，1 次） |
| `None` | 1 | **1 处为空**（yixuan） |

**贴图通道 kind 分布**：

| kind | 数量 | 语义 |
|---|---:|---|
| `C` | 168 | MatCap 球图 |
| `D` | 148 | 漫反射 _MainTex |
| `N` | 118 | 法线 _LightTex(RG) |
| `A` | 118 | 打包数据 _OtherDataTex2(R=透明 G=平滑度 B=自发光遮罩) |
| `M` | 117 | 打包数据 _OtherDataTex(R=材质ID G=金属度 B=高光遮罩) |
| `X` | 31 | **首次出现**：未知通道（31 次） |
| `F` | 29 | 面部 SDF |
| `E` | 28 | 眼部色阶 LUT(16×16) |
| `T` | 1 | **首次出现**：仅 1 次 |

## 值得优先看的几处

1. **`X` 类贴图（31 次）** —— 爱芮身上完全没出现。可能是新版本的 mask/LUT，值得先看 `textures/<hash>.png` 的实际内容。
2. **`nap-avatar-screen` 模式（5 次）** —— 爱芮有 0 次。屏幕类材质说明这套 shader 还管 UI/全息投影。
3. **`unity-standard` 与 `flat`** —— 说明有些角色有材质退回不了游戏 shader，站点自己标了兜底。
4. **`yixuan` 有 1 个 fallback** —— 全 30 个模型里唯一一个 `fallback > 0` 的，可能暴露站点解析失败的情况。
5. **`sp-billy` 是 18/0/0 单模式** —— 全部 surface 都是 e039，没有面部 SDF，值得看它怎么处理脸。

## 怎么用

```python
import json, hashlib
h = hashlib.sha256(open("models/aria/model.glb","rb").read()).hexdigest()
c = json.load(open(f"contracts/{h}.json"))
# c["surfaces"][i]["capabilities"] / ["lighting"] / ["outline"] …
```

贴图按内容哈希命名（`textures/<hash>.png`），同一个 matcap 在多个角色间共享，已自动去重。

## 合规

原游戏资源版权归 miHoYo / HoYoverse；此镜像是为技术分析做的本地副本，**请勿再分发**。
