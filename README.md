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
