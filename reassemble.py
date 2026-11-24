#!/usr/bin/env python3
"""
reassemble.py — 还原被切分的动画文件

GitHub 单文件上限 100 MB，本归档里 16 个 animations.glb（100–219 MB）被切成
90 MB 分卷存放在 `split/` 下。运行本脚本即可还原为原始目录结构。

用法：
    python3 TOOLS/reassemble.py            # 还原到当前目录
    python3 TOOLS/reassemble.py --verify   # 还原后校验 sha256

还原后会自检 sha256 与 split_manifest.json 是否一致。
"""
import hashlib
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "TOOLS", "split_manifest.json")


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()


def main():
    verify = "--verify" in sys.argv
    entries = json.load(open(MANIFEST, encoding="utf-8"))
    print(f"待还原 {len(entries)} 个文件")

    for e in entries:
        rel, size, digest, n = e["path"], e["bytes"], e["sha256"], e["parts"]
        out = os.path.join(ROOT, rel)
        # 已存在且校验和正确就跳过
        if os.path.exists(out) and os.path.getsize(out) == size and sha256(out) == digest:
            print(f"  skip  {rel}  （已存在且校验通过）")
            continue

        os.makedirs(os.path.dirname(out), exist_ok=True)
        with open(out, "wb") as fo:
            for i in range(n):
                part = os.path.join(ROOT, "split", f"{rel}.part{i:02d}")
                if not os.path.exists(part):
                    print(f"  !! 缺少分卷 {part}")
                    return 1
                with open(part, "rb") as fi:
                    shutil_copy(fi, fo)

        got = os.path.getsize(out)
        ok = got == size and (not verify or sha256(out) == digest)
        flag = "OK " if ok else "BAD"
        print(f"  {flag}   {rel}  {got/1048576:.1f} MB")
        if not ok:
            return 1

    print("\n完成。分卷可以删除： rm -rf split/")
    return 0


def shutil_copy(fi, fo):
    while True:
        buf = fi.read(8 << 20)
        if not buf:
            break
        fo.write(buf)


if __name__ == "__main__":
    sys.exit(main())
