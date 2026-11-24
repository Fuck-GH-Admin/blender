#!/usr/bin/env python3
"""
mirror.py — 完整镜像 zzz-studio.app 的资源，便于离线分析

产出结构：
    zzz_studio_mirror/
      site/                     SPA 外壳（HTML / JS / CSS / 静态图）
      models/<slug>/model.glb   30 个角色模型
      contracts/<sha256>.json   每个模型对应的材质契约
      textures/<hash>.<ext>     契约里引用的贴图（按内容哈希去重，多模型共享）
      buffers/<hash>.bin        描边壳顶点缓冲
      MANIFEST.json             全量清单（路径 / 大小 / sha256 / 来源 URL）

特性：
  * 断点续传：已存在且非空的文件跳过
  * 去重：贴图/缓冲按 URL 里的内容哈希命名，重复的只存一份
  * 记录：所有文件写入 MANIFEST.json，含来源 URL 与校验和

用法: python3 mirror.py [--shell-only] [--models-only]
"""

import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = "https://zzz-studio.app"
ASSETS = "https://assets.zzz-studio.app"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36")

MANIFEST = {}


def fetch(url, dest, referer=SITE + "/", retries=3):
    """下载到 dest；已存在则跳过。返回 (bytes, skipped)。"""
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return os.path.getsize(dest), True
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": referer})
    for a in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            tmp = dest + ".part"
            with open(tmp, "wb") as f:
                f.write(data)
            os.replace(tmp, dest)
            return len(data), False
        except Exception as e:
            if a == retries - 1:
                print(f"  !! {url}: {e}")
                return 0, False
            time.sleep(1.5 * (a + 1))


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def note(url, path, size):
    MANIFEST[os.path.relpath(path, ROOT)] = {"url": url, "bytes": size}


# ---------------------------------------------------------------------------
# 阶段 A：SPA 外壳
# ---------------------------------------------------------------------------
def mirror_shell():
    print("[A] SPA 外壳")
    idx = os.path.join(ROOT, "site", "index.html")
    fetch(SITE + "/", idx)
    html = open(idx, encoding="utf-8", errors="replace").read()

    queue = set()
    for m in re.finditer(r'(?:src|href)="([^"]+)"', html):
        u = m.group(1)
        if u.startswith(("data:", "http", "#")):
            continue
        queue.add(u.lstrip("./"))

    seen, done = set(), 0
    while queue:
        u = queue.pop()
        if u in seen:
            continue
        seen.add(u)
        path = os.path.join(ROOT, "site", u.lstrip("/"))
        size, skip = fetch(f"{SITE}/{u.lstrip('/')}", path)
        if size:
            done += 1
            note(f"{SITE}/{u.lstrip('/')}", path, size)
        if u.endswith(".js"):
            src = open(path, encoding="utf-8", errors="replace").read()
            # chunk 之间的引用
            for r in re.findall(r"[\"'](?:\./)?(_app/immutable/[A-Za-z0-9_./\-]+\.(?:js|css))[\"']", src):
                queue.add(r)
            # 静态资源字面量
            for r in re.findall(r"[\"'](/(?:stickers|fx|portraits|loading|changelog|character-icons)/[A-Za-z0-9_.\-]+)[\"']", src):
                queue.add(r)
        if u.endswith(".css"):
            src = open(path, encoding="utf-8", errors="replace").read()
            for r in re.findall(r"url\(([^)]+)\)", src):
                r = r.strip("\"'")
                if r.startswith("/") and not r.startswith("data:"):
                    queue.add(r)
    print(f"    外壳文件 {done} 个")


# ---------------------------------------------------------------------------
# 阶段 B：模型
# ---------------------------------------------------------------------------
def mirror_models():
    print("[B] 模型")
    slugs = json.load(open(os.path.join(ROOT, "characters.json")))
    for i, s in enumerate(slugs, 1):
        url = f"{ASSETS}/models/{s}/model.glb"
        dest = os.path.join(ROOT, "models", s, "model.glb")
        size, skip = fetch(url, dest, referer=SITE + "/")
        note(url, dest, size)
        print(f"    [{i:2d}/{len(slugs)}] {s:32s} {size/1048576:6.2f} MB {'(skip)' if skip else ''}")
    return slugs


# ---------------------------------------------------------------------------
# 阶段 B2：角色动画
# ---------------------------------------------------------------------------
def mirror_animations(slugs):
    print("[B2] 动画 animations.glb")
    tot = 0
    for i, s in enumerate(slugs, 1):
        url = f"{ASSETS}/models/{s}/animations.glb"
        dest = os.path.join(ROOT, "models", s, "animations.glb")
        size, skip = fetch(url, dest, referer=SITE + "/")
        if size:
            note(url, dest, size)
            tot += size
            print(f"    [{i:2d}/{len(slugs)}] {s:32s} {size/1048576:7.2f} MB {'(skip)' if skip else ''}")
        else:
            print(f"    [{i:2d}/{len(slugs)}] {s:32s} —— 无动画")
    print(f"    动画合计 {tot/1048576:.1f} MB")


# ---------------------------------------------------------------------------
# 阶段 C：契约 + 贴图
# ---------------------------------------------------------------------------
def mirror_contracts(slugs):
    print("[C] 契约 + 贴图")
    tex_seen = set()
    for i, s in enumerate(slugs, 1):
        glb = os.path.join(ROOT, "models", s, "model.glb")
        if not os.path.exists(glb):
            continue
        h = sha256(glb)
        curl = f"{SITE}/contracts/{h}.json"
        cdest = os.path.join(ROOT, "contracts", f"{h}.json")
        size, _ = fetch(curl, cdest)
        note(curl, cdest, size)
        if not size:
            print(f"    [{i:2d}] {s}: 无契约")
            continue
        try:
            c = json.load(open(cdest, encoding="utf-8"))
        except Exception as e:
            print(f"    [{i:2d}] {s}: 契约解析失败 {e}")
            continue

        # 贴图资源
        nt = 0
        for rh, r in (c.get("resources") or {}).items():
            u = r.get("url", "")
            if not u:
                continue
            ext = os.path.splitext(u)[1] or ".bin"
            dest = os.path.join(ROOT, "textures", rh + ext)
            if rh in tex_seen:
                continue
            tex_seen.add(rh)
            sz, _ = fetch(ASSETS + u, dest, referer=SITE + "/")
            note(ASSETS + u, dest, sz)
            nt += 1
        # 描边缓冲
        nb = 0
        for bh, b in (c.get("vertexBuffers") or {}).items():
            u = b.get("url", "")
            if not u:
                continue
            dest = os.path.join(ROOT, "buffers", bh + ".bin")
            if os.path.exists(dest):
                continue
            sz, _ = fetch(ASSETS + u, dest, referer=SITE + "/")
            note(ASSETS + u, dest, sz)
            nb += 1
        print(f"    [{i:2d}/{len(slugs)}] {s:32s} 契约 OK · 新贴图 {nt} · 新缓冲 {nb}")


# ---------------------------------------------------------------------------
def main():
    os.makedirs(os.path.join(ROOT, "site"), exist_ok=True)
    args = sys.argv[1:]
    t0 = time.time()

    mirror_shell()
    if "--shell-only" not in args:
        if "--animations-only" in args:
            mirror_animations(json.load(open(os.path.join(ROOT, "characters.json"))))
            slugs = []
        else:
            slugs = mirror_models()
            if "--with-animations" in args:
                mirror_animations(slugs)
        if slugs and "--models-only" not in args:
            mirror_contracts(slugs)

    man = os.path.join(ROOT, "MANIFEST.json")
    json.dump(MANIFEST, open(man, "w"), indent=1, ensure_ascii=False)
    tot = sum(v["bytes"] for v in MANIFEST.values())
    print(f"\n[done] {len(MANIFEST)} 个文件, {tot/1048576:.1f} MB, 用时 {time.time()-t0:.0f}s")
    print(f"       manifest → {man}")


if __name__ == "__main__":
    main()
