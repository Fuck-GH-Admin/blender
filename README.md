# 爱芮（Aria）渲染研究 · 总索引

研究对象：**Zenless Zone Zero** 角色「爱芮 / Aria」的官方模型 PBR/卡通渲染差异，
以及 `zzz-studio.app` 这个 Web 查看器如何复刻游戏原版渲染方案。

整理时间：2026-11-24 · 总计约 **4.0 GB**

---

## 目录

| 目录 | 内容 | 大小 |
|---|---|---:|
| [`01_分析报告/`](#01_分析报告) | 四份分析文档 + 一张贴图图谱 | 340 KB |
| [`02_着色器参考实现/`](#02_着色器参考实现) | 独立 GLSL 参考实现（1324 行） | 136 KB |
| [`03_EEVEE_Cycles/`](#03_eevee_cycles) | Blender 引擎映射 + 渲染脚本 + 渲染图 | 4.8 MB |
| [`04_站点镜像/`](#04_站点镜像) | 站点完整资源镜像（30 角色 + 29 动画 / 3004 clips） | 3.8 GB |
| [`05_官方模型/`](#05_官方模型) | 官方 MMD 模型原包 | 47 MB |
| [`archives/`](#archives) | 网页留档（源码包 + MHTML 快照） | 13 MB |

---

## 01_分析报告

| 文件 | 内容 |
|---|---|
| `爱芮_渲染参数与改动对比.md` | 主报告：站点渲染参数 vs 官模 PMX 的逐项对比。含术语分层（着色器 / 材质 / 多 Pass / 引擎全局 / 预烘焙几何）、7 类贴图通道、20 个 surface、模型改动（骨架 270→525、403 刚体、头发复制验证） |
| `ANALYSIS.md` | 30 个角色的跨模型统计索引：每个角色的 surface/材质/贴图/coverage/mode 构成 |
| `FINDINGS.md` | 全量镜像后的新发现：8 个原版 shader（之前只知 4 个）、13 种 mode 码定义、`X`/`T` 贴图通道解密、新 capability 组（crystal / transmission / gunEye / napAvatarScreen / unityStandard） |
| `X_kinds.png` | `X`/`T` 类贴图的实际内容图谱（8 个槽位各一张示例 + 像素统计） |

## 02_着色器参考实现

从站点 WebGL 代码里提取、整理、并**通过 glslc 语法校验**的独立 GLSL 实现。

```
src/zzz/00_common.glsl        色彩空间 / 5 区域映射 / 亮度 / HSV
src/zzz/10_ramp.glsl          暗部塑形（头发/皮肤/其他三套）+ 角色光曲线
src/zzz/20_matcap.glsl        分层 MatCap（3 种混合模式）
src/zzz/30_specular.glsl      亮度驱动菲涅尔 + 塑形高光
src/zzz/40_rim.glsl           边缘光（175 行，最复杂）
src/zzz/50_emission.glsl      区域自发光（2×2 超采样）
src/zzz/60_face_sdf.glsl      面部 SDF
src/zzz/70_outline.glsl       描边
src/zzz/80_hair_shadow.glsl   发影
src/zzz_character.{vert,frag} 主 pass
src/zzz_outline.{vert,frag}   描边 pass
src/zzz_hair_shadow.{vert,frag} 发影 pass
validate.py                   用 glslc 做语法/类型校验
params.md                     完整参数手册（默认值/范围/来源层级）
PROVENANCE.md                 逐函数溯源 + 8 项不可还原点
```

代码里每个函数都标了 **`[V]` 逐字还原 / `[R]` 重建 / `[I]` 胶水代码**。

## 03_EEVEE_Cycles

把渲染方案搬到 Blender 两个引擎的参数映射与实测。

| 文件 | 内容 |
|---|---|
| `MAPPING.md` | 逐特性可行性表 + 参数翻译表 + 实测 4 个坑 |
| `LIGHTING.md` | **网页灯光取证**（CDP hook `getUniformLocation`）+ 世界光实测 + 官方模型导入方案 |
| `build_and_render.py` | 测试球对照渲染（PBR / Shader-to-RGB / Toon BSDF） |
| `pmx_render.py` | **自写的 PMX 导入器**（纯标准库，Blender 5.3 无原生支持）+ 日光/世界光双渲染 |
| `out/` | 6 张渲染结果 |

核心结论：**EEVEE 能到 80%（有 Shader to RGB），Cycles 只能到 40%（没有 Shader to RGB）**。

## 04_站点镜像

`https://zzz-studio.app/` 的完整离线副本，**1116 个文件 / 3.8 GB**。

```
site/                     SPA 外壳（12 MB，97 文件）
models/<slug>/model.glb       30 个角色模型（452 MB）
models/<slug>/animations.glb  29 个动画文件（2776 MB，共 3004 个 clip）
contracts/<sha256>.json   材质契约（文件名 = GLB 的 sha256）
textures/<hash>.png       贴图（577 MB，按内容哈希去重）
buffers/<hash>.bin        描边壳顶点缓冲（27 MB，stride 7）
characters.json           30 个角色 slug
MANIFEST.json             全量清单（路径/URL/字节数）
mirror.py                 镜像脚本（断点续传）
```

契约与模型的对应：`sha256(model.glb)` 就是契约文件名。

## 05_官方模型

`爱芮_人形_PMX_官模原包.zip` —— 官方 MMD 模型（制作者观海子），含 `爱芮.pmx`、
`武器.pmx`、`爱芮_机器人.pmx`、贴图、spa、lightmap、GIFMME 表情。

**版权提醒**：readme 明确禁止二次配布 / 商业用途 / 拆件改造。
原游戏资产版权归 miHoYo / HoYoverse。本目录仅供技术分析。

## archives

| 文件 | 内容 |
|---|---|
| `zzz-studio.app_site_20261124.tar.zst` | **网页源码留档**（7.0 MB）。解包后 `python3 -m http.server` 即可本地浏览 |
| `zzz-studio.app_aria-loaded_20261124.mhtml` | 爱芮页面渲染完成后的 MHTML 快照（631 KB），可用浏览器直接打开 |
| `zzz_eevee_cycles.zip` | 03 目录的打包版（分发用） |
| `zzz_shader_ref.zip` | 02 目录的打包版（分发用） |

---

## 关键结论速览

1. **网页灯光是日光不是世界光**：2 盏 DirectionalLight（带阴影）+ AmbientLight + HemisphereLight，
   **无环境贴图**。实测纯世界光会让卡通色阶失效（整片发白）。
2. **"着色器"要分层说**：`NapAvatarStandard` 只是第①层；完整效果还包含材质数据、多 Pass 路径、
   引擎全局变量（`_PostOutlineTint` 等，**不在导出资产里**）、预烘焙描边壳几何。
3. **官模 vs 站点是同一套资产的两个下游**：4 张漫反射逐像素同源（相关 0.99+），
   面部三角数精确相等（4228 = 4228）；但官模丢了全部 N/M/A/C/F/E 通道，
   并额外复制了整份头发做加算叠层（`髮+`，顶点 100% 重合）。
4. **PBR 引擎不能直接渲这种材质**，但 EEVEE 的 `Shader to RGB` 是逃生口；Cycles 的 `Toon BSDF` 只够近似。

## 动画数据说明

`models/<slug>/animations.glb` 是站点按角色单独提供的动画包，**29/30 有**
（`sunbringer-original` 站点上就没有，返回 404）。

- 合计 **3004 个 animation clip**，2776 MB
- clip 命名沿用游戏内部格式，例如
  `Avatar_Female_Size01_AriaIdol_Ani_Attack_ExSpecial_01`、
  `…_Ani_Walk_Loop`、`…_Ani_TurnBack`、`…_Ani_UI_DtoS1`
- 单个角色最多 **remielle 157 clips**，最少 **aria-robot 17 clips**
- 文件本身还带 2 个 mesh + 完整骨架节点（aria: 274 nodes）

抽检确认全部是合法 glTF 2.0 容器（magic/长度/JSON 块均正确）。

## 已发现但未纳入的范围

| 项 | 规模 | 说明 |
|---|---|---|
| `particles-dissolve` 模式 | — | 站点定义了但未实现，配套的 `_TransitionTex` 已随材质导出 |
| 站点其它角色以外的资产 | — | 敌人 / NPC / 场景等，本站点只做可玩角色 |
