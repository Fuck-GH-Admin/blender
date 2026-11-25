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


---

## 工作区协作：GitHub Actions → ChatGPT 本地工作区

本仓库按“**GitHub 保存版本与原始证据；本地工作区负责文件处理；Actions 作为可复现的远程执行节点**”协作。不要把 Vercel Sandbox 当作唯一工作目录。

### 分支职责

| 分支 | 职责 |
|---|---|
| `zzz-research-aria` | 研究主入口：分析报告、GLSL 参考实现、Blender 脚本、GLB、材质契约、贴图与 PMX 原包 |
| `blender-5.3.0-package` | Blender 5.3.0 Linux x64 官方发行包的五段归档与 SHA-256 校验 |
| `ops/aria-blender-transfer-20261124` | 临时自动化分支：资源搬运、Blender 预览渲染和 Artifact 上传；不合并到研究分支 |

### 资源搬运流程

1. 在 GitHub Actions Runner 中分别对研究分支和 Blender 包分支执行 sparse checkout，只取当前任务需要的文件。
2. 对 Blender 分卷执行 `python3 reassemble.py --verify`，必须核对文件大小 **406,944,100 B** 和 SHA-256 `dacb8264197a3f7fda6001285a5a506fc97ee943881261c2c3bd63c882f22e05`。
3. Runner 将模型、契约、被契约引用的贴图、PMX 原包、脚本和 Blender 压缩包组合为工作包，生成 `MANIFEST.sha256`。
4. 使用 `actions/upload-artifact@v4` 上传 Artifact（短期周转，不作为长期档案）。
5. 在 GitHub 连接器中按顺序获取 Workflow Run、调用 `fetch_workflow_run_artifacts` 找到 Artifact ID，再调用 `download_workflow_artifact` 下载 ZIP。
6. 下载结果会作为当前会话文件交付；在自动挂载的工作区中直接访问其实际路径（通常在 `/mnt/data`）。先用 `ls -lh`、`stat`、`unzip -t`、`sha256sum -c` 核验，再解压到项目工作目录。

**重要：** 如果下载结果已自动挂载，不要再调用 Files 的 `materialize` 复制同一个大文件。当前会话上传文件有自动挂载路径；Files materialize 对大文件另有大小限制。普通文件读写、解压和 Blender 执行应直接使用本地 Shell / Python，不需要经过 Files 服务。

### 本地工作区健康检查

在开始大文件搬运或渲染前，先执行：

```bash
pwd
df -h / /mnt/data
ls -lah /mnt/data
stat /mnt/data/<artifact.zip>
unzip -t /mnt/data/<artifact.zip>
```

若 `container`、Python Kernel 等多个本地执行入口在命令启动前统一返回 `ClientError`，这只能说明执行运行时暂时不可用，**不能据此判断磁盘损坏、文件丢失或权限错误**。不要反复 materialize 或重新下载来掩盖执行服务故障；先保留已下载文件，必要时改用 GitHub Actions 执行任务，待本地运行时恢复后再继续。

### Blender 执行与结果回传

- 本地优先：解压 Blender 官方包，使用 `blender -b -t <线程数> --python <脚本>` 执行；EEVEE 无 GPU 时可在 Xvfb + Mesa llvmpipe 下做软件渲染，Cycles 使用 CPU。
- 本地执行环境不可用时：在隔离的 ops 分支中运行 Actions。日志必须注明 Runner、软件 OpenGL / CPU 等实际后端，不能把 Actions 渲染描述为本地 GPU 渲染。
- 结果使用 Artifact 回传，包含原始单张 PNG、可编辑 `.blend`、脚本、运行日志、尺寸检查和 SHA-256。**不要只给缩小拼图**；联系图只作索引，用户验图必须提供独立原图。
- Artifact 是短期交付物；长期研究结论、脚本与可复现方法再整理回研究分支。PMX 原包的作者声明及非商业 / 禁止二次配布限制继续适用，不要将临时研究 Artifact 变成公开再分发包。

### 本次实验入口

- 资源搬运 Workflow：[`.github/workflows/aria-blender-transfer.yml`](https://github.com/Fuck-GH-Admin/blender/blob/ops/aria-blender-transfer-20261124/.github/workflows/aria-blender-transfer.yml)
- Blender 渲染 Workflow：[`.github/workflows/aria-blender-render.yml`](https://github.com/Fuck-GH-Admin/blender/blob/ops/aria-blender-transfer-20261124/.github/workflows/aria-blender-render.yml)
- 渲染脚本：[`scripts/aria_blender_ablation.py`](https://github.com/Fuck-GH-Admin/blender/blob/ops/aria-blender-transfer-20261124/scripts/aria_blender_ablation.py)
