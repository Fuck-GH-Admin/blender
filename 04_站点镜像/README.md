# zzz-studio.app 完整资源镜像

`https://zzz-studio.app/` 的离线副本，用于分析 ZZZ 角色渲染方案、材质契约与模型结构。

镜像时间：**2026-11-24**（动画于当日补全）· 共 **1116 个文件 / 约 3.8 GB**

---

## 1. 目录结构

```
zzz_studio_mirror/
├── site/                    SPA 外壳（12 MB，61 个文件）
│   ├── index.html
│   ├── _app/immutable/      入口 / 路由 / chunks（40 个 .js）
│   │   ├── chunks/          ← 着色器代码在这里（chunk_BAfVqM9q 一类）
│   │   ├── entry/  nodes/
│   │   └── assets/          CSS / 字体
│   ├── character-icons/     30 张角色图标
│   ├── stickers/ fx/ portraits/ loading/   运行时加载的 webp 图
│   └── favicon / manifest
├── models/<slug>/model.glb  30 个角色模型（452 MB）
├── models/<slug>/animations.glb  29 个动画文件（2776 MB，sunbringer-original 站上无动画）
├── contracts/<sha256>.json  材质契约（6.7 MB，文件名 = 对应 GLB 的 sha256）
├── textures/<hash>.<ext>    契约引用的贴图（577 MB，按内容哈希去重）
├── buffers/<hash>.bin       描边壳顶点缓冲（27 MB，stride 7）
├── characters.json          30 个角色 slug
├── MANIFEST.json            全量清单（路径 / 来源 URL / 字节数）
├── ANALYSIS.md              跨模型统计与索引 ← 先看这个
└── mirror.py                镜像脚本（可断点续传，重跑只补缺失）
```

### 契约与模型的对应关系

契约文件名就是模型文件的 sha256，所以不需要额外索引：

```python
import hashlib, json
h = hashlib.sha256(open("models/aria/model.glb", "rb").read()).hexdigest()
contract = json.load(open(f"contracts/{h}.json"))
```

### 贴图去重

`textures/` 里的文件按 URL 里的内容哈希命名。**同一个 matcap / 法线图在多个角色之间是共享的**，
已自动去重（585 个文件覆盖了 30 个模型的全部引用，平均每模型约 20 张，若不去重会是 600+）。

---

## 2. 内容速览

| 项 | 数量 |
|---|---|
| 角色 | 30 |
| GLB 模型 | 30（452 MB，单个 9.8–27.9 MB） |
| 动画 GLB | 29（2776 MB，单个 72–219 MB，**共 3004 个 animation clip**） |
| 材质契约 | 30 |
| surface（材质表面）总数 | 449 |
| 贴图 | 585 |
| 描边缓冲 | 345 |
| JS chunk | 40 |
| 静态图（图标/贴纸/立绘） | 46 |
| **合计** | **1116 个文件 / 3.8 GB** |

详细统计见 **`ANALYSIS.md`**，包含每个角色的 surface 数、材质数、贴图数、
coverage 分布和 mode 码构成。

---

## 3. 本轮新发现（相对之前只分析爱芮）

之前只拆过 `aria`，拿到全量后发现还有 4 种没见过的 mode 码和 2 种没见过的贴图通道：

| 新东西 | 出现 | 说明 |
|---|---|---|
| `nap-avatar-screen` | 5 次 | 屏幕 / 全息类材质，爱芮身上没有 |
| `gun-eye` | 1 次 | 武器眼（brujas） |
| `flat` | 2 次 | unlit 平面（hugo-vlad） |
| `unity-standard` | 2 次 | 退回 Unity 标准光照（nangong-yu） |
| 贴图 `X` 类 | 31 次 | 未知通道，爱芮身上 0 次 |
| 贴图 `T` 类 | 1 次 | 仅 1 次 |

另外 `yixuan` 是 30 个模型里**唯一一个有 fallback 材质**的（`fallback = 1`），
可能是站点解析失败或该材质无法还原，值得单独看。

---

## 4. 怎么更新 / 补全

```bash
cd zzz_studio_mirror
python3 mirror.py              # 断点续传，已存在的文件跳过
python3 mirror.py --shell-only # 只更新 SPA 外壳
python3 mirror.py --models-only # 只更新模型，跳过契约和贴图
python3 mirror.py --with-animations   # 模型 + 动画
python3 mirror.py --animations-only   # 只补动画
```

脚本特性：
- 已存在且非空的文件直接跳过 → 重跑只补增量
- `.part` 临时文件 + 原子替换，中断不会留半截文件
- 失败重试 3 次，指数退避
- 所有下载写入 `MANIFEST.json`，含来源 URL 和字节数

> 注意：`site/` 的静态图（`stickers/`、`fx/`、`portraits/`、`loading/`）路径是 JS 运行时
> 拼出来的，静态扫描拿不到。这些是用 Chrome 实际加载页面、抓 `performance` 请求列表补下的。
> 如果站点更新了贴纸/特效，需要重新跑一遍浏览器抓取。

---

## 5. 合规提醒

- 原游戏资源版权归 **miHoYo / HoYoverse**。
- 站点本身是粉丝项目，非官方。
- 官方 MMD 模型包 readme 明确：**禁止二次配布、禁止商业用途、禁止拆件改造**。
- 本镜像仅为**本地技术分析**用途，**请勿分发**。
