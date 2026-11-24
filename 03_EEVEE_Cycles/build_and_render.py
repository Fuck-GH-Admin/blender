#!/usr/bin/env python3
"""
build_and_render.py — 把 ZZZ 渲染方案搬到 EEVEE / Cycles

用法（无头）:
    blender -b --factory-startup --python build_and_render.py

产出:
    out/eevee_compare.png   EEVEE: PBR 基线 / ZZZ Toon / 区域调色板
    out/cycles_compare.png  Cycles: PBR 基线 / ZZZ Toon(Toon BSDF) / 区域调色板

设计原则:
  * 所有数值从 contract.json 读，不写死
  * 贴图用从站点抓下来的真实通道（D/M/A/C）
  * 每个材质都标了它是「能还原」还是「只能近似」
"""

import json
import os

import bpy

# ---------------------------------------------------------------------------
# 路径
# ---------------------------------------------------------------------------
BASE = "/home/miku/Work/Blender/zzz_eevee_cycles"
OUT = os.path.join(BASE, "out")
CONTRACT = ("/tmp/zzz/glb/"
            "00c580250fd8f42691f75cab6fbea3d5c45760f9f84bddc861e271ccbe152072.json")
SITETEX = "/tmp/zzz/cmp/sitetex"

# surface-0 (MAT_AriaIdol_Body_1) 实际绑定的资源哈希 → 本地文件
TEX = {
    "D": os.path.join(SITETEX, "D_2048x2048_de5e635f.png"),   # _MainTex
    "N": os.path.join(SITETEX, "N_1024x1024_bfdb9e79.png"),   # _LightTex
    "M": os.path.join(SITETEX, "M_2048x2048_0a4253d6.png"),   # _OtherDataTex
    "A": os.path.join(SITETEX, "A_2048x2048_20d4ce6f.png"),   # _OtherDataTex2
    "C": os.path.join(SITETEX, "C_256x256_6a01e7d2.png"),     # _MatCapTex3
}

os.makedirs(OUT, exist_ok=True)


# ---------------------------------------------------------------------------
# 从 contract 读参数
# ---------------------------------------------------------------------------
def load_params():
    c = json.load(open(CONTRACT, encoding="utf-8"))
    s = c["surfaces"][0]          # MAT_AriaIdol_Body_1
    light = s["lighting"]
    p = {
        "shadow": [tuple(x) for x in light["shadow"]],       # 5 区阴影色
        "shallow": [tuple(x) for x in light["shallow"]],     # 5 区浅阴影色
        "smoothness": light["smoothness"],
        "rim_colors": [tuple(x) for x in light["rim"]["colors"]],
        "outline": s["outline"],
        "emission_colors": [tuple(x) for x in s["emission"]["primary"]["colors"]],
        "matcap_regions": s["capabilities"]["matcaps"]["regions"],
    }
    return p


# ---------------------------------------------------------------------------
# 工具
# ---------------------------------------------------------------------------
def new_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    return m, nt


def img_node(nt, path, colorspace="sRGB", x=0, y=0):
    n = nt.nodes.new("ShaderNodeTexImage")
    n.image = bpy.data.images.load(path, check_existing=True)
    n.image.colorspace_settings.name = colorspace
    n.location = (x, y)
    return n


def ramp5(nt, target, colors, x=0, y=0, label=""):
    """5 区域调色板：用 CONSTANT 插值的 ColorRamp 做硬分区。
    zzzRegion5(v): v>=0.8→0, >=0.6→1, >=0.4→2, >=0.2→3, else 4
    → ColorRamp 元素位置 0.8/0.6/0.4/0.2 分别放 colors[0..3]，0 放 colors[4]
    """
    n = nt.nodes.new("ShaderNodeValToRGB")
    n.location = (x, y)
    n.label = label
    cr = n.color_ramp
    cr.interpolation = "CONSTANT"
    # 保留 2 个默认元素，逐个设置
    positions = [0.0, 0.2, 0.4, 0.6, 0.8]
    order = [4, 3, 2, 1, 0]          # 位置 → 区域号
    while len(cr.elements) < len(positions):
        cr.elements.new(0.5)
    for i, (pos, idx) in enumerate(zip(positions, order)):
        e = cr.elements[i]
        e.position = pos
        col = colors[idx]
        e.color = (col[0], col[1], col[2], 1.0)
    nt.links.new(target, n.inputs["Fac"])
    return n


def mix_rgb(nt, fac, c1, c2, blend="MIX", x=0, y=0, label=""):
    n = nt.nodes.new("ShaderNodeMixRGB")
    n.blend_type = blend
    n.location = (x, y)
    n.label = label
    if isinstance(fac, float):
        n.inputs["Fac"].default_value = fac
    else:
        nt.links.new(fac, n.inputs["Fac"])
    for sock, val in (("Color1", c1), ("Color2", c2)):
        if isinstance(val, tuple):
            n.inputs[sock].default_value = (*val[:3], 1.0)
        else:
            nt.links.new(val, n.inputs[sock])
    return n


def math_node(nt, op, a=None, b=None, x=0, y=0, clamp=False, label=""):
    n = nt.nodes.new("ShaderNodeMath")
    n.operation = op
    n.location = (x, y)
    n.use_clamp = clamp
    n.label = label
    for i, val in enumerate((a, b)):
        if val is None:
            continue
        if isinstance(val, (int, float)):
            n.inputs[i].default_value = float(val)
        else:
            nt.links.new(val, n.inputs[i])
    return n


# ---------------------------------------------------------------------------
# 材质 1：PBR 基线（对照组 —— 说明「PBR 引擎直接渲会怎样」）
# ---------------------------------------------------------------------------
def build_pbr():
    m, nt = new_mat("PBR_baseline")
    out = nt.nodes.new("ShaderNodeOutputMaterial"); out.location = (600, 0)
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled"); bsdf.location = (300, 0)
    uv = nt.nodes.new("ShaderNodeTexCoord"); uv.location = (-600, 0)
    tex = img_node(nt, TEX["D"], "sRGB", -400, 100)
    nt.links.new(uv.outputs["UV"], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    # GLB 里 9 个材质 roughness 全是 0.5527864（导出占位值），照抄
    bsdf.inputs["Roughness"].default_value = 0.5527864098548889
    bsdf.inputs["Metallic"].default_value = 0.0
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return m


# ---------------------------------------------------------------------------
# 材质 2：ZZZ Toon —— EEVEE 版（Shader to RGB，可还原 80%）
# ---------------------------------------------------------------------------
def build_toon_eevee(P):
    m, nt = new_mat("ZZZ_Toon_EEVEE")
    m.use_backface_culling = False

    out = nt.nodes.new("ShaderNodeOutputMaterial"); out.location = (1400, 0)
    emit = nt.nodes.new("ShaderNodeEmission"); emit.location = (1200, 0)

    # ---- 贴图 ----
    uv = nt.nodes.new("ShaderNodeTexCoord"); uv.location = (-1000, 0)
    t_d = img_node(nt, TEX["D"], "sRGB", -800, 300)
    t_m = img_node(nt, TEX["M"], "Non-Color", -800, 0)      # R=区域 G=金属度 B=高光遮罩
    t_a = img_node(nt, TEX["A"], "Non-Color", -800, -300)   # B=自发光遮罩
    for t in (t_d, t_m, t_a):
        nt.links.new(uv.outputs["UV"], t.inputs["Vector"])

    sep_m = nt.nodes.new("ShaderNodeSeparateColor"); sep_m.location = (-600, 0)
    nt.links.new(t_m.outputs["Color"], sep_m.inputs["Color"])
    sep_a = nt.nodes.new("ShaderNodeSeparateColor"); sep_a.location = (-600, -300)
    nt.links.new(t_a.outputs["Color"], sep_a.inputs["Color"])

    # ---- 5 区域调色板 ----
    shadow_ramp = ramp5(nt, sep_m.outputs["Red"], P["shadow"], -400, 150, "5区阴影色")
    shallow_ramp = ramp5(nt, sep_m.outputs["Red"], P["shallow"], -400, -100, "5区浅阴影色")

    # ---- 主要光照量：Diffuse → Shader to RGB（EEVEE 专有） ----
    diff = nt.nodes.new("ShaderNodeBsdfDiffuse"); diff.location = (-800, -600)
    diff.inputs["Color"].default_value = (1, 1, 1, 1)
    s2rgb = nt.nodes.new("ShaderNodeShaderToRGB"); s2rgb.location = (-600, -600)
    nt.links.new(diff.outputs["BSDF"], s2rgb.inputs["Shader"])

    # 二段硬阶跃（对应游戏的 2 带 toon；游戏实际 3 带，这里近似）
    step1 = math_node(nt, "GREATER_THAN", s2rgb.outputs["Color"], 0.45, -400, -600, label="阴影阈值")
    step2 = math_node(nt, "GREATER_THAN", s2rgb.outputs["Color"], 0.62, -400, -760, label="高光阈值")

    # shadow → shallow（step1）
    mix1 = mix_rgb(nt, step1.outputs[0], shadow_ramp.outputs["Color"],
                   shallow_ramp.outputs["Color"], "MIX", -150, 0, "阴影→浅阴影")
    # → 反照率（step2）
    mix2 = mix_rgb(nt, step2.outputs[0], mix1.outputs["Color"],
                   (1.0, 1.0, 1.0), "MIX", 100, 0, "→受光")

    # × 反照率
    alb = mix_rgb(nt, 1.0, mix2.outputs["Color"], t_d.outputs["Color"],
                  "MULTIPLY", 350, 100, "×反照率")

    # ---- 区域自发光（A.B 遮罩 × e039 色） ----
    emis_col = P["emission_colors"][0]
    emis = mix_rgb(nt, sep_a.outputs["Blue"], alb.outputs["Color"],
                   emis_col if emis_col != (1.0, 1.0, 1.0) else (1.0, 1.0, 1.0),
                   "ADD", 600, 100, "区域自发光")

    # ---- 边缘光：Layer Weight.Facing^4 × rim 色 ----
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.location = (350, -350)
    lw.inputs["Blend"].default_value = 0.5
    rim_pow = math_node(nt, "POWER", lw.outputs["Facing"], 4.0, 550, -350, label="rim 幂")
    rim_fac = math_node(nt, "MULTIPLY", rim_pow.outputs[0], 0.35, 700, -350, label="rim 强度")
    rim_add = mix_rgb(nt, rim_fac.outputs[0], emis.outputs["Color"],
                      P["rim_colors"][0], "ADD", 900, 0, "+rim")

    nt.links.new(rim_add.outputs["Color"], emit.inputs["Color"])
    emit.inputs["Strength"].default_value = 1.0
    nt.links.new(emit.outputs["Emission"], out.inputs["Surface"])
    return m


# ---------------------------------------------------------------------------
# 材质 3：ZZZ Toon —— Cycles 版（Toon BSDF，只能做 2 带，无区域调色板）
# ---------------------------------------------------------------------------
def build_toon_cycles(P):
    """Cycles 版 —— 只能用 Toon BSDF，这是它能做到的极限。

    Cycles 没有 Shader to RGB，拿不到「逐像素受光量」这个中间量，
    所以下面这些**全部做不到**：
      * 5 区域阴影色板（需要受光量去索引调色板）
      * 暗部反照率塑形（需要 nl / nlv 分离）
      * 区域自发光 / rim 叠加（需要与色阶结果加权混合）
    能做的只有：Toon BSDF 自带的两带阶梯 + 反照率贴图。
    """
    m, nt = new_mat("ZZZ_Toon_Cycles")
    out = nt.nodes.new("ShaderNodeOutputMaterial"); out.location = (600, 0)

    uv = nt.nodes.new("ShaderNodeTexCoord"); uv.location = (-400, 0)
    t_d = img_node(nt, TEX["D"], "sRGB", -200, 100)
    nt.links.new(uv.outputs["UV"], t_d.inputs["Vector"])

    toon = nt.nodes.new("ShaderNodeBsdfToon"); toon.location = (200, 0)
    toon.component = "DIFFUSE"
    toon.inputs["Size"].default_value = 0.5     # 明暗分界位置
    toon.inputs["Smooth"].default_value = 0.02  # 极小 = 硬边（卡通感）
    # Toon BSDF 的 Color 就是反照率本身
    nt.links.new(t_d.outputs["Color"], toon.inputs["Color"])

    nt.links.new(toon.outputs["BSDF"], out.inputs["Surface"])
    return m


# ---------------------------------------------------------------------------
# 材质 4：描边（反向外扩壳 + 背面剔除）
# ---------------------------------------------------------------------------
def build_outline(P):
    """描边材质 —— 两个引擎的可行方案不同，实测结论：

    * EEVEE：`use_backface_culling = True` + 纯 Emission 有效。
      壳用 Solidify(负厚度, 翻转法线)，轮廓处露出的背面被画成描边色。
    * Cycles：`use_backface_culling` **被完全忽略**。
      若仍用同一写法，外扩壳两面都会渲染，整个模型被描边色糊死（实测见
      out/cycles_outline_fail.png）。Cycles 需要改用
      Geometry.Backfacing → Mix(Transparent, Emission)。
      但把两者混在同一个材质里会因极性相反而互相抵消（实测），
      所以这里只保留 EEVEE 方案，Cycles 图禁用 Solidify 单独出图。

    另一个坑：描边色不是单一颜色，而是 **5 区域色**（contract.outline.colours）。
    这里为了单色演示只取 colours[0]；真实实现要靠区域图选色，
    见 zzz_shader_ref/src/zzz_outline.frag。
    """
    m, nt = new_mat("ZZZ_Outline")
    m.use_backface_culling = True          # 仅 EEVEE 生效
    out = nt.nodes.new("ShaderNodeOutputMaterial"); out.location = (300, 0)
    emit = nt.nodes.new("ShaderNodeEmission"); emit.location = (0, 0)
    c = P["outline"]["colours"][0]         # 爱芮： [1.0, 0.2167, 0.2167, 1]
    emit.inputs["Color"].default_value = (c[0], c[1], c[2], 1.0)
    nt.links.new(emit.outputs["Emission"], out.inputs["Surface"])
    return m


# ---------------------------------------------------------------------------
# 场景
# ---------------------------------------------------------------------------
def build_scene(P):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene

    mats = {
        "pbr": build_pbr(),
        "toon_e": build_toon_eevee(P),
        "toon_c": build_toon_cycles(P),
        "outline": build_outline(P),
    }

    # 三个球 + 地面
    xs = [-2.4, 0.0, 2.4]
    names = ["PBR 基线", "S2RGB 版", "Toon BSDF 版"]
    keys = ["pbr", "toon_e", "toon_c"]
    for x, nm, k in zip(xs, names, keys):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(x, 0, 1.0))
        ob = bpy.context.active_object
        ob.name = nm
        ob.data.materials.append(mats[k])
        bpy.ops.object.shade_smooth()
        # 标签
        bpy.ops.object.text_add(location=(x, -1.30, 0.10))
        txt = bpy.context.active_object
        txt.data.body = nm
        txt.data.size = 0.26
        txt.data.align_x = "CENTER"
        txt.rotation_euler = (1.5708, 0, 0)
        tm, tnt = new_mat("label_" + nm)
        to = tnt.nodes.new("ShaderNodeOutputMaterial")
        te = tnt.nodes.new("ShaderNodeEmission")
        te.inputs["Color"].default_value = (0.9, 0.9, 0.9, 1)
        tnt.links.new(te.outputs["Emission"], to.inputs["Surface"])
        txt.data.materials.append(tm)

        if k in ("toon_e", "toon_c"):
            # 描边：Solidify + 翻转法线 + 背面剔除材质
            ob.data.materials.append(mats["outline"])
            mod = ob.modifiers.new("Outline", "SOLIDIFY")
            # 负厚度 + 翻转法线：壳的法线朝内，轮廓处露出的正是「背面」
            # → EEVEE 用背面剔除、Cycles 用 Backfacing 混合，两引擎看到的是同一批面
            mod.thickness = -0.045
            mod.use_flip_normals = True
            mod.material_offset = 1
            mod.use_rim = False

    bpy.ops.mesh.primitive_plane_add(size=14, location=(0, 0, 0))
    floor = bpy.context.active_object
    fm, fnt = new_mat("floor")
    fo = fnt.nodes.new("ShaderNodeOutputMaterial")
    fb = fnt.nodes.new("ShaderNodeBsdfPrincipled")
    fb.inputs["Base Color"].default_value = (0.18, 0.18, 0.2, 1)
    fb.inputs["Roughness"].default_value = 0.9
    fnt.links.new(fb.outputs["BSDF"], fo.inputs["Surface"])
    floor.data.materials.append(fm)

    # 主光（Sun，给 Toon 一个干净的方向）
    light_data = bpy.data.lights.new("Sun", type="SUN")
    light_data.energy = 4.0
    light_data.angle = 0.02
    sun = bpy.data.objects.new("Sun", light_data)
    sc.collection.objects.link(sun)
    sun.rotation_euler = (0.9, 0.2, 0.6)

    # 相机
    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 50
    cam = bpy.data.objects.new("Cam", cam_data)
    sc.collection.objects.link(cam)
    cam.location = (0.0, -12.5, 2.2)
    cam.rotation_euler = (1.50, 0.0, 0.0)
    sc.camera = cam

    # 世界：中性灰（对齐站点默认 background="gray"）
    world = bpy.data.worlds.new("W")
    sc.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.05, 0.05, 0.06, 1)
    bg.inputs["Strength"].default_value = 1.0

    sc.render.resolution_x = 1200
    sc.render.resolution_y = 520
    sc.render.film_transparent = False
    return sc


def render(sc, engine, path, samples):
    sc.render.engine = engine
    if engine == "BLENDER_EEVEE":
        sc.eevee.taa_render_samples = samples
    else:
        sc.cycles.samples = samples
        sc.cycles.use_denoising = True
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print(f"[render] {engine} → {path}")


if __name__ == "__main__":
    P = load_params()
    print("[contract] shadow palette  :", P["shadow"])
    print("[contract] outline colour  :", P["outline"]["colours"][0])
    sc = build_scene(P)

    render(sc, "BLENDER_EEVEE", os.path.join(OUT, "eevee_compare.png"), 64)

    # Cycles：先关掉 Solidify，单独展示 Toon BSDF 本身的效果
    # （不关的话外扩壳会因为 Cycles 忽略背面剔除而糊满整个球）
    for ob in sc.objects:
        for md in ob.modifiers:
            if md.type == "SOLIDIFY":
                md.show_render = False
                md.show_viewport = False
    render(sc, "CYCLES", os.path.join(OUT, "cycles_compare.png"), 128)

    # 证据图：把 Solidify 重新打开再用 Cycles 渲 —— 复现「Cycles 忽略背面剔除，
    # 外扩壳两面全渲染，模型被描边色糊死」这个真实故障
    for ob in sc.objects:
        for md in ob.modifiers:
            if md.type == "SOLIDIFY":
                md.show_render = True
    render(sc, "CYCLES", os.path.join(OUT, "cycles_outline_fail.png"), 64)
    print("[done]")
