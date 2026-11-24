#!/usr/bin/env python3
"""
validate.py — 用 glslc 做语法校验（仅为校验，不产出可用 SPIR-V）

为什么需要这层胶水：
  glslc 只会编译到 SPIR-V，而 SPIR-V 要求所有非不透明 uniform 显式声明
  layout(location=N)。本项目的 shader 面向 WebGL / three.js（GLSL ES 3.00），
  正常写法不带 location。所以这里：
    1) 手动递归内联 #include（与 glslc -I 结果一致，但便于后处理）
    2) 把所有 `uniform T name;` 补成 `layout(location=N) uniform T name;`
    3) 交给 glslc 编译，从而校验真正的语法/类型/函数体

用法: python3 validate.py <entry.frag|vert> [...]
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

SRC = Path(__file__).resolve().parent / "src"

INC = re.compile(r'^\s*#include\s+"([^"]+)"\s*(?://.*)?$')


def inline(path: Path, seen: set) -> str:
    out = []
    for line in path.read_text(encoding="utf-8").splitlines():
        m = INC.match(line)
        if m:
            target = SRC / "zzz" / m.group(1)
            if target.name in seen:
                out.append(f"// [skipped duplicate include] {target.name}")
                continue
            seen.add(target.name)
            out.append(f"// ---- begin {target.name} ----")
            out.append(inline(target, seen))
            out.append(f"// ---- end {target.name} ----")
        else:
            out.append(line)
    return "\n".join(out)


def _split_declarators(rest: str):
    """把 'a, b[5], c' 按顶层逗号切开（忽略 [] 内的逗号）。"""
    out, depth, cur = [], 0, []
    for ch in rest:
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
        if ch == ',' and depth == 0:
            out.append(''.join(cur).strip()); cur = []
        else:
            cur.append(ch)
    if cur:
        out.append(''.join(cur).strip())
    return [d for d in out if d]


_SIZE = {'float': 1, 'int': 1, 'uint': 1, 'bool': 1,
         'vec2': 1, 'vec3': 1, 'vec4': 1,
         'ivec2': 1, 'ivec3': 1, 'ivec4': 1,
         'uvec2': 1, 'uvec3': 1, 'uvec4': 1,
         'mat2': 2, 'mat3': 3, 'mat4': 4,
         'mat2x2': 2, 'mat3x3': 3, 'mat4x4': 4}


def _slots(typ, decl, macros=None):
    """一个 declarator 实际占用多少个 location（数组按元素数展开）。"""
    n = _SIZE.get(typ, 1)
    m = re.search(r'\[(\w+)\]', decl)
    if m:
        tok = m.group(1)
        cnt = int(tok) if tok.isdigit() else int((macros or {}).get(tok, 1))
        n *= cnt
    return n


def add_locations(src: str, stage: str = 'frag') -> str:
    """给 uniform / in / out 补 location，仅为通过 SPIR-V 校验（WebGL 不需要）。"""
    cursor = {'loc': 0, 'bind': 0, 'in': 0, 'out': 0}
    # 收集 #define NAME 123，用于展开数组长度（如 MAX_JOINTS）
    macros = {m.group(1): m.group(2)
              for m in re.finditer(r'(?m)^\s*#define\s+(\w+)\s+(\d+)\s*$', src)}

    def repl_uniform(m):
        indent, rest = m.group(1), m.group(2)
        parts = rest.strip().rstrip(';').strip().split(None, 1)
        if len(parts) != 2:
            return m.group(0)
        typ, decls = parts
        is_sampler = typ.startswith('sampler') or typ.startswith('texture')
        out = []
        for d in _split_declarators(decls):
            if is_sampler:
                out.append(f'{indent}layout(binding={cursor["bind"]}) uniform {typ} {d};')
                cursor['bind'] += 1
            else:
                out.append(f'{indent}layout(location={cursor["loc"]}) uniform {typ} {d};')
                cursor['loc'] += _slots(typ, d, macros)
        return '\n'.join(out)

    src = re.sub(r'(?m)^(\s*)uniform\s+(?!.*\blayout\b)([^;]+;)', repl_uniform, src)

    def repl_io(m):
        indent, kind, rest = m.group(1), m.group(2), m.group(3)
        out = []
        for d in _split_declarators(rest.rstrip().rstrip(';')):
            base = d.split('[')[0].strip()
            out.append(f'{indent}layout(location={cursor[kind]}) {kind} {d};')
            cursor[kind] += 1
        return '\n'.join(out)

    # 顶点阶段 in/out 都要 location；片元阶段只给 in
    kinds = 'in|out' if stage == 'vert' else 'in'
    src = re.sub(r'(?m)^(\s*)(%s)\s+(?!.*\blayout\b)((?:lowp|mediump|highp\s+)?\w[^;]*;)' % kinds,
                 repl_io, src)

    # 片元输出
    return re.sub(r'(?m)^(\s*)out\s+(vec4\s+fragColor;)', r'\1layout(location=0) out \2', src)


def validate(entry: str) -> bool:
    p = Path(entry)
    flat = inline(p, set())
    flat = add_locations(flat, stage=("frag" if p.suffix == ".frag" else "vert"))
    stage = "frag" if p.suffix == ".frag" else "vert"
    with tempfile.NamedTemporaryFile("w", suffix=".glsl", delete=False) as f:
        f.write(flat)
        tmp = f.name
    cmd = ["glslc", f"-fshader-stage={stage}", "--target-env=opengl", tmp, "-o", "/dev/null"]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(f"FAIL {entry}")
        # 把临时文件名换回可读名
        err = r.stderr.replace(tmp, f"<flattened {p.name}>")
        print("\n".join(err.splitlines()[:40]))
        return False
    print(f"OK   {entry}")
    return True


if __name__ == "__main__":
    entries = sys.argv[1:] or ["src/zzz_character.frag"]
    ok = all([validate(e) for e in entries])
    sys.exit(0 if ok else 1)
