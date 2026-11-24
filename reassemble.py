#!/usr/bin/env python3
"""还原分卷 + sha256 校验。用法: python3 reassemble.py [--verify]"""
import glob, hashlib, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
NAME = "blender-5.3.0-linux-x64.tar.xz"
EXPECT_SHA = "dacb8264197a3f7fda6001285a5a506fc97ee943881261c2c3bd63c882f22e05"
EXPECT_SIZE = 406944100


def sha256(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for c in iter(lambda: f.read(1 << 20), b""):
            h.update(c)
    return h.hexdigest()


parts = sorted(glob.glob(os.path.join(ROOT, "package", NAME + ".part*")))
if not parts:
    sys.exit("找不到分卷")
out = os.path.join(ROOT, NAME)
with open(out, "wb") as fo:
    for p in parts:
        with open(p, "rb") as fi:
            while True:
                b = fi.read(8 << 20)
                if not b:
                    break
                fo.write(b)
size, digest = os.path.getsize(out), sha256(out)
print(f"拼出 {len(parts)} 段 → {out}")
print(f"  大小 {size:,} B  {'OK' if size == EXPECT_SIZE else 'MISMATCH'}")
if "--verify" in sys.argv:
    print(f"  sha256 {digest}")
    print(f"  {'OK' if digest == EXPECT_SHA else 'MISMATCH'}")
sys.exit(0 if size == EXPECT_SIZE and (("--verify" not in sys.argv) or digest == EXPECT_SHA) else 1)
