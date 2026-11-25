# Blender 5.3.0 Linux x64 — 归档

单个官方发行包留档。

| 项 | 值 |
|---|---|
| 文件名 | `blender-5.3.0-linux-x64.tar.xz` |
| 原始大小 | 406,944,100 B（388.1 MiB） |
| sha256 | `dacb8264197a3f7fda6001285a5a506fc97ee943881261c2c3bd63c882f22e05` |
| 归档条目数 | 6,672 |
| 来源 | `/home/miku/下载/blender-5.3.0-linux-x64.tar.xz` |

## 为什么是分卷

GitHub 单文件硬限 100 MB，原始包 388 MB。切成 5 个 90 MB 分卷，
`package/` 下命名 `blender-5.3.0-linux-x64.tar.xz.partNN`。

## 还原

```bash
cat package/blender-5.3.0-linux-x64.tar.xz.part* > blender-5.3.0-linux-x64.tar.xz
sha256sum blender-5.3.0-linux-x64.tar.xz
# 期望：dacb8264197a3f7fda6001285a5a506fc97ee943881261c2c3bd63c882f22e05
```

或：

```bash
python3 reassemble.py --verify
```

## 解开使用

```bash
tar -xJf blender-5.3.0-linux-x64.tar.xz
./blender-5.3.0-linux-x64/blender --version
# Blender 5.3.0
```


---

## 与爱芮研究分支协作 / 将 Blender 拉入工作区

本分支只保存 Blender 5.3.0 Linux x64 官方发行包的分卷，不保存角色模型、材质契约或研究脚本。完整实验数据位于 `zzz-research-aria`。

### 分支分工

- `blender-5.3.0-package`：Blender 官方二进制分卷及还原脚本。
- `zzz-research-aria`：爱芮模型、GLB、材质契约、21 张引用贴图、PMX 原包、渲染研究与脚本。
- `ops/aria-blender-transfer-20261124`：临时 Actions 自动化分支，负责跨分支拉取、校验、渲染和 Artifact 回传；不合并到本分支。

### 本地还原 Blender

在本分支完整 checkout 后：

```bash
python3 reassemble.py --verify
# 必须得到 406,944,100 B
# SHA-256 必须为：
# dacb8264197a3f7fda6001285a5a506fc97ee943881261c2c3bd63c882f22e05
tar -xJf blender-5.3.0-linux-x64.tar.xz
./blender-5.3.0-linux-x64/blender --version
```

如果不希望把五个 90 MB 分卷逐个通过连接器读取，可由 GitHub Actions Runner 对本分支执行 sparse checkout、拼接和 SHA-256 校验，再将完整包作为 Artifact 上传。

### GitHub Actions Artifact → 当前工作区

1. Runner 分别 checkout 本分支与 `zzz-research-aria`，只拉取当前任务所需路径。
2. Runner 用本分支的 `reassemble.py --verify` 还原 Blender，并核验固定大小与 SHA-256。
3. Runner 将 Blender、研究资产和清单打成一个 ZIP，通过 `actions/upload-artifact@v4` 上传。
4. GitHub 连接器先查询 Workflow Run 和 Artifact 列表，再按 Artifact ID 下载。
5. 下载后的 ZIP 作为会话文件交付；如果已自动挂载，直接从实际路径（通常为 `/mnt/data`）用 Shell / Python 操作。先检查 `ls -lh`、`stat`、`unzip -t`、`sha256sum -c`，再解压到工作目录。

不要把已自动挂载的文件再交给 Files `materialize` 重复复制；大文件还可能触及该服务的单文件限制。**工作区文件读写由本地 Shell / Python 完成，不依赖 Files 服务。**

### 本地执行故障与远程回退

先检查：

```bash
pwd
df -h / /mnt/data
ls -lah /mnt/data
```

若 Shell 与 Python 两个执行入口都在命令启动前返回 `ClientError`，应先判定为工作区执行运行时不可用；没有磁盘命令输出时，不要推断磁盘损坏或权限错误。已下载文件先保留，临时使用 Actions Runner 执行 Blender；日志需注明实际是 EEVEE + Mesa llvmpipe 软件 OpenGL，还是 Cycles CPU，不能声称使用了本地 GPU。

### 渲染结果交付约定

- 预检阶段输出 8 张独立 PNG，不能以缩小拼图代替原图。
- 每张图片写入尺寸和文件大小检查；同时提供运行日志、脚本和 SHA-256。仅在来源许可允许时附带可编辑 `.blend`；PMX 原作者禁止二次配布时，不把嵌入 PMX 网格的 `.blend` 放入公开 Artifact。
- 预检通过并由用户确认后，才升级到 2K+ 正式渲染。
- Actions Artifact 用于短期周转；长期保留的实验方法、脚本和结论回写研究分支。PMX 原包作者的非商业 / 禁止二次配布限制仍然适用。
