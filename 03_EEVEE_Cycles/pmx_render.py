#!/usr/bin/env python3
"""
pmx_render.py — 把官模 PMX 直接导进 Blender 渲染，对比「日光」vs「世界光」

为什么要自己写 PMX 解析：
  Blender 5.3 没有原生 PMX 导入器，mmd_tools 插件对 5.x 支持不确定。
  PMX 格式明确，解析到「材质」这一段就够渲染网格了，不需要物理/骨骼/表情。

用法：
  blender -b --factory-startup --python pmx_render.py
产出：
  out/pmx_sun.png    平行光（还原站点的日光配置）
  out/pmx_world.png  纯世界光（均匀照明，验证是否更均匀）
"""

import math
import os
import struct

import bpy
from mathutils import Vector

BASE = "/home/miku/Work/Blender/zzz_eevee_cycles/out"
PMX_DIR = "/tmp/zzz/pmx"
PMX_FILE = os.path.join(PMX_DIR, "爱芮.pmx")
os.makedirs(BASE, exist_ok=True)


# =============================================================================
# PMX 解析（只到材质，够渲染）
# =============================================================================
class Reader:
    def __init__(self, data):
        self.d = data
        self.o = 0

    def take(self, n):
        v = self.d[self.o:self.o + n]
        self.o += n
        return v

    def u8(self):
        return struct.unpack_from("<B", self.take(1))[0]

    def i32(self):
        return struct.unpack_from("<i", self.take(4))[0]

    def u16(self):
        return struct.unpack_from("<H", self.take(2))[0]

    def f32(self):
        return struct.unpack_from("<f", self.take(4))[0]

    def f32s(self, n):
        return struct.unpack_from("<" + "f" * n, self.take(4 * n))

    def text(self, enc):
        n = self.i32()
        raw = self.take(n)
        return raw.decode("utf-16-le" if enc == 0 else "utf-8", errors="replace")

    def idx(self, size):
        """PMX 顶点/材质/骨骼索引：有符号，-1 表示无。"""
        if size == 1:
            return struct.unpack_from("<b", self.take(1))[0]
        if size == 2:
            return struct.unpack_from("<h", self.take(2))[0]
        return struct.unpack_from("<i", self.take(4))[0]


def parse_pmx(path):
    r = Reader(open(path, "rb").read())
    magic = r.take(4)
    assert magic == b"PMX ", f"not PMX: {magic!r}"
    version = r.f32()
    hsize = r.u8()
    enc = r.u8()
    add_uv = r.u8()
    vidx, tidx, midx, bidx, moidx, ridx = (r.u8() for _ in range(6))
    r.take(max(0, hsize - 8))          # 剩余 globals

    name = r.text(enc)
    name_en = r.text(enc)
    comment = r.text(enc)
    r.text(enc)                        # comment_en

    # ---- 顶点 ----
    nv = r.i32()
    verts = [0.0] * (nv * 3)
    uvs = [0.0] * (nv * 2)
    for i in range(nv):
        verts[i * 3:i * 3 + 3] = r.f32s(3)
        r.f32s(3)                      # normal
        uvs[i * 2:i * 2 + 2] = r.f32s(2)
        if add_uv:
            r.f32s(4 * add_uv)         # 附加 UV（游戏 lightmap UV）
        wt = r.u8()
        if wt == 0:
            r.idx(bidx)
        elif wt == 1:
            r.idx(bidx); r.idx(bidx); r.f32()
        elif wt == 2:
            for _ in range(4):
                r.idx(bidx)
            r.f32s(4)
        elif wt in (3, 4):
            r.idx(bidx); r.idx(bidx); r.f32(); r.f32s(6)
            if wt == 4:
                for _ in range(2):
                    r.idx(bidx)
                r.f32s(2)
        r.f32()                        # edge scale

    # ---- 面（索引流） ----
    nf = r.i32()
    total_idx = nf
    faces = [r.idx(vidx) for _ in range(total_idx)]

    # ---- 贴图 ----
    nt = r.i32()
    tex = [r.text(enc) for _ in range(nt)]

    # ---- 材质 ----
    nm = r.i32()
    mats = []
    for _ in range(nm):
        m = {
            "name": r.text(enc),
            "name_en": r.text(enc),
            "diffuse": r.f32s(4),
            "specular": r.f32s(3),
            "spec_power": r.f32(),
            "ambient": r.f32s(3),
            "flags": r.u8(),
            "edge_color": r.f32s(4),
            "edge_size": r.f32(),
            "tex": r.idx(tidx),
            "sphere": r.idx(tidx),
            "sphere_mode": r.u8(),
            "toon_shared": r.u8(),
        }
        if m["toon_shared"] == 0:
            m["toon"] = r.idx(tidx)
        else:
            r.take(1)                  # 内嵌 toon 值
        r.text(enc)                    # memo
        m["surface_count"] = r.i32()
        mats.append(m)

    return {
        "version": version, "name": name, "name_en": name_en, "comment": comment,
        "verts": verts, "uvs": uvs, "faces": faces, "textures": tex, "materials": mats,
        "add_uv": add_uv,
    }


# =============================================================================
# 建 Blender 网格
# =============================================================================
def resolve_tex(pmx_path):
    """PMX 里存的是 `tex\\体.png` 这种反斜杠相对路径。"""
    rel = pmx_path.replace("\\", "/")
    return os.path.join(PMX_DIR, rel)


def build_mesh(M):
    me = bpy.data.meshes.new("AriaPMX")
    verts = [tuple(M["verts"][i * 3:i * 3 + 3]) for i in range(len(M["verts"]) // 3)]
    uvs = [tuple(M["uvs"][i * 2:i * 2 + 2]) for i in range(len(M["uvs"]) // 2)]
    faces = M["faces"]

    # 每个材质占连续的 surface_count 个索引
    groups, off = [], 0
    for mi, m in enumerate(M["materials"]):
        n = m["surface_count"]
        groups.append((mi, off, off + n))
        off += n
    assert off == len(faces), f"索引不匹配: {off} vs {len(faces)}"

    # 跳过加算叠层材质（sphere_mode=2，如「髮+」用近乎全黑的 sp.png 做发丝高光）。
    # 这类在 MMD 里是 additive 混合层，当不透明渲会把头发糊黑。
    additive = {i for i, m in enumerate(M["materials"]) if m["sphere_mode"] == 2}

    # 顶点没有被面引用的会报错，过滤掉退化面
    tris = []
    for _mi, a, b in groups:
        if _mi in additive:
            continue
        for i in range(a, b - 2, 3):
            f = (faces[i], faces[i + 1], faces[i + 2])
            if len(set(f)) == 3 and min(f) >= 0:
                tris.append(f)

    me.from_pydata(verts, [], tris)
    me.update()

    # UV
    uvl = me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        for li in poly.loop_indices:
            vi = me.loops[li].vertex_index
            if vi < len(uvs):
                uvl.data[li].uv = (uvs[vi][0], 1.0 - uvs[vi][1])   # PMX 的 V 需要翻转

    # 材质槽 + 面归属
    for mi, m in enumerate(M["materials"]):
        me.materials.append(make_material(m))
    ptr = 0
    for poly in me.polygons:
        poly.material_index = 0
    # 重新按材质分组赋 index（用面中心不好判定，改用重建顺序）
    # from_pydata 保留了输入顺序，所以直接按累计三角形数切
    pi = 0
    for mi, _a, _b in groups:
        cnt = sum(1 for _ in range(_a, _b - 2, 3))
        for _ in range(cnt):
            if pi < len(me.polygons):
                me.polygons[pi].material_index = mi
            pi += 1

    for poly in me.polygons:
        poly.use_smooth = True
    return me


def make_material(m):
    name = m["name"] or f"mat{m['sphere']}"
    mat = bpy.data.materials.get(name)
    if mat:
        return mat
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial"); out.location = (700, 0)
    emit = nt.nodes.new("ShaderNodeEmission"); emit.location = (500, 0)

    uv = nt.nodes.new("ShaderNodeTexCoord"); uv.location = (-800, 0)
    ti = m["tex"]
    if 0 <= ti < len(bpy.data.images) + 100:
        pass
    tex_node = None
    if ti >= 0:
        p = resolve_tex(m["texure_path"] if "texure_path" in m else "")
        tex_node = None
    # 用外部传入的路径（见 build_mesh 之前注入）
    path = m.get("_tex_path")
    if path and os.path.exists(path):
        tex_node = nt.nodes.new("ShaderNodeTexImage")
        tex_node.image = bpy.data.images.load(path, check_existing=True)
        tex_node.location = (-600, 200)
        nt.links.new(uv.outputs["UV"], tex_node.inputs["Vector"])

    albedo = tex_node.outputs["Color"] if tex_node else None
    if albedo is None:
        rgb = m["diffuse"][:3]
        albedo_node = nt.nodes.new("ShaderNodeRGB"); albedo_node.location = (-600, 200)
        albedo_node.outputs[0].default_value = (*rgb, 1)
        albedo = albedo_node.outputs[0]

    # ---- 3 带 toon（PMX 没有区域图，用固定 3 档近似） ----
    diff = nt.nodes.new("ShaderNodeBsdfDiffuse"); diff.location = (-800, -300)
    diff.inputs["Color"].default_value = (1, 1, 1, 1)
    s2r = nt.nodes.new("ShaderNodeShaderToRGB"); s2r.location = (-600, -300)
    nt.links.new(diff.outputs["BSDF"], s2r.inputs["Shader"])

    ramp = nt.nodes.new("ShaderNodeValToRGB"); ramp.location = (-350, -300)
    cr = ramp.color_ramp
    cr.interpolation = "EASE"
    cr.elements[0].position = 0.30; cr.elements[0].color = (0.62, 0.66, 0.72, 1)  # 阴影（偏冷）
    cr.elements[1].position = 0.58; cr.elements[1].color = (0.88, 0.90, 0.94, 1)  # 浅阴影
    e3 = cr.elements.new(0.75); e3.color = (1, 1, 1, 1)
    nt.links.new(s2r.outputs["Color"], ramp.inputs["Fac"])

    mix = nt.nodes.new("ShaderNodeMixRGB"); mix.location = (100, 0)
    mix.blend_type = "MULTIPLY"
    mix.inputs["Fac"].default_value = 1.0
    nt.links.new(albedo, mix.inputs["Color1"])
    nt.links.new(ramp.outputs["Color"], mix.inputs["Color2"])

    nt.links.new(mix.outputs["Color"], emit.inputs["Color"])

    # 透明走材质 diffuse.a（MMD 惯例），不要用贴图 alpha ——
    # 颜.png 虽然带 alpha 通道，但它的 alpha 不是不透明度，误用会让整张脸消失
    _alpha = m["diffuse"][3] if len(m["diffuse"]) > 3 else 1.0
    if _alpha < 0.999:
        transp = nt.nodes.new("ShaderNodeBsdfTransparent"); transp.location = (500, -250)
        shmix = nt.nodes.new("ShaderNodeMixShader"); shmix.location = (620, 0)
        shmix.inputs["Fac"].default_value = _alpha
        nt.links.new(transp.outputs["BSDF"], shmix.inputs[1])
        nt.links.new(emit.outputs["Emission"], shmix.inputs[2])
        nt.links.new(shmix.outputs["Shader"], out.inputs["Surface"])
        if hasattr(mat, "surface_render_method"):
            mat.surface_render_method = "BLENDED"
    else:
        nt.links.new(emit.outputs["Emission"], out.inputs["Surface"])
    return mat


# =============================================================================
# 场景 / 渲染
# =============================================================================
def setup_scene(M, mode):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene

    # 注入材质贴图路径
    for m in M["materials"]:
        ti = m["tex"]
        m["_tex_path"] = resolve_tex(M["textures"][ti]) if 0 <= ti < len(M["textures"]) else None

    me = build_mesh(M)
    ob = bpy.data.objects.new("Aria", me)
    sc.collection.objects.link(ob)
    # PMX 是 Y-up，Blender 是 Z-up → 绕 X 转 +90°
    ob.rotation_euler = (math.radians(90), 0, math.radians(180))

    h = max(v for i, v in enumerate(M["verts"]) if i % 3 == 1)
    print(f"[pmx] 高 {h:.2f} 单位, {len(me.vertices)} 顶点, {len(me.polygons)} 三角, {len(M['materials'])} 材质")

    world = bpy.data.worlds.new("W"); sc.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]

    if mode == "sun":
        # 还原站点：2 平行光 + 环境光 + 半球光（无环境贴图）
        bg.inputs["Color"].default_value = (0.05, 0.05, 0.06, 1)
        bg.inputs["Strength"].default_value = 1.0

        def sun(name, energy, az, el, color=(1, 1, 1)):
            d = bpy.data.lights.new(name, type="SUN")
            d.energy = energy; d.color = color; d.angle = math.radians(1.0)
            o = bpy.data.objects.new(name, d)
            sc.collection.objects.link(o)
            # 方位角/仰角 → 方向
            a, e = math.radians(az), math.radians(el)
            direction = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
            o.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
            return o

        sun("Key", 2.0, 38.7, 47.6)                       # 站点默认 az/el
        sun("Fill", 0.5, -120.0, 15.0, (0.80, 0.86, 1.0))  # 补光（冷）
        # 环境光 + 半球光
        aw = bpy.data.worlds["W"]
        bg.inputs["Color"].default_value = (0.10, 0.11, 0.13, 1)
        bg.inputs["Strength"].default_value = 0.9
    else:
        # 纯世界光：均匀环境照明，无任何方向性光源
        bg.inputs["Color"].default_value = (0.55, 0.57, 0.62, 1)
        bg.inputs["Strength"].default_value = 1.0

    cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 50
    cam = bpy.data.objects.new("Cam", cam_data); sc.collection.objects.link(cam)
    cam.location = (0, -h * 1.62, h * 0.54)     # 竖幅，50mm，距离按身高算
    cam.rotation_euler = (math.radians(90), 0, 0)
    sc.camera = cam

    # Blender 5.x 默认 AgX 会把画面大幅去饱和 —— 卡通材质必须用 Standard
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0.0

    sc.render.engine = "BLENDER_EEVEE"
    sc.eevee.taa_render_samples = 48
    sc.render.resolution_x = 700
    sc.render.resolution_y = 1000
    sc.render.film_transparent = False
    return sc


if __name__ == "__main__":
    M = parse_pmx(PMX_FILE)
    print(f"[pmx] {M['name']} / v{M['version']} / 顶点 {len(M['verts'])//3} / "
          f"索引 {len(M['faces'])} / 材质 {len(M['materials'])} / 贴图 {len(M['textures'])} / addUV {M['add_uv']}")
    for mode in ("sun", "world"):
        sc = setup_scene(M, mode)
        p = os.path.join(BASE, f"pmx_{mode}.png")
        sc.render.filepath = p
        bpy.ops.render.render(write_still=True)
        print(f"[render] {mode} → {p}")
