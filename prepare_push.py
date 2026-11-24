#!/usr/bin/env python3
"""
prepare_push.py — 把 ZZZ_研究/ 变成适合推送 GitHub 的布局

为什么要这一层：
  GitHub 单文件硬限 100 MB，而我方有 16 个 100–219 MB 的 animations.glb。
  zstd 最高只能压到 66%，仍然过线，所以必须**分卷**。
  分卷脚本随仓库一起提交，任何人 clone 后一条命令就能还原。

产物：
  /tmp/zzz_push/            ← 待推送的 git 工作区内容
      <原目录结构>          ← 小文件原样复制
      split/<原始相对路径>.partNN  ← 大文件分卷
      TOOLS/split_manifest.json     ← 分卷清单（原始大小 + sha256）
      TOOLS/reassemble.py           ← 还原脚本
"""
import hashlib
import json
import os
import shutil

SRC = "/home/miku/Work/Blender/ZZZ_研究"
DST = "/tmp/zzz_push"
LIMIT = 95 * 1024 * 1024
CHUNK = 90 * 1024 * 1024
SKIP_NAMES = {"__pycache__", ".DS_Store"}
SKIP_EXT = {".pyc", ".log"}


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()


def main():
    os.makedirs(os.path.join(DST, "TOOLS"), exist_ok=True)
    manifest = []
    copied = split_n = 0
    total = 0

    for dp, dn, fn in os.walk(SRC):
        dn[:] = [d for d in dn if d not in SKIP_NAMES and d != "archives"]
        for f in fn:
            if os.path.splitext(f)[1] in SKIP_EXT:
                continue
            sp = os.path.join(dp, f)
            rel = os.path.relpath(sp, SRC)
            if rel.startswith("archives"):
                continue
            size = os.path.getsize(sp)
            total += size

            if size <= LIMIT:
                dp2 = os.path.join(DST, rel)
                os.makedirs(os.path.dirname(dp2), exist_ok=True)
                shutil.copy2(sp, dp2)
                copied += 1
                continue

            # 分卷
            digest = sha256(sp)
            n = 0
            with open(sp, "rb") as fi:
                while True:
                    buf = fi.read(CHUNK)
                    if not buf:
                        break
                    part = f"split/{rel}.part{n:02d}"
                    dp2 = os.path.join(DST, part)
                    os.makedirs(os.path.dirname(dp2), exist_ok=True)
                    with open(dp2, "wb") as fo:
                        fo.write(buf)
                    n += 1
            manifest.append({"path": rel, "bytes": size, "sha256": digest, "parts": n})
            split_n += 1
            print(f"  split {size/1048576:7.1f} MB → {n} parts  {rel}")

    json.dump(manifest, open(os.path.join(DST, "TOOLS", "split_manifest.json"), "w"),
              indent=1, ensure_ascii=False)
    shutil.copy2(os.path.join(os.path.dirname(os.path.abspath(__file__)),
                              "reassemble.py"),
                 os.path.join(DST, "TOOLS", "reassemble.py"))

    print(f"\n[prepare] 原样复制 {copied} 个，分卷 {split_n} 个文件，源合计 {total/1073741824:.2f} GB")


if __name__ == "__main__":
    main()
