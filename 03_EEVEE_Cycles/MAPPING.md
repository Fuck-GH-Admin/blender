# ZZZ 渲染方案 → EEVEE / Cycles 参数映射

**先回答那个问题：PBR 引擎能不能渲这种二次元材质？**

标准的 PBR BRDF（Principled BSDF / GGX）**不能**——它按物理能量守恒把光照积分成连续渐变，
而 ZZZ 的做法是"拿受光量当索引，去查一张 5 段色板"。这两件事在数学上不是一回事。

**但 EEVEE 和 Cycles 各自都留了后门：**

| 引擎 | 后门 | 能到什么程度 |
|---|---|---|
| **EEVEE** | `Shader to RGB` 节点（EEVEE 专有） | **约 80%**。它把光照结果变成可读的颜色值，于是你能接 ColorRamp / Math 做任意色阶、区域调色板、阴影塑形 |
| **Cycles** | `Toon BSDF`（Cycles 专有） | **约 40%**。原生 2 带阶梯，但**没有 Shader to RGB**，拿不到受光量 → 无法做区域调色板 / 暗部塑形 / 加权叠加 |

**结论：要复刻 ZZZ，用 EEVEE。Cycles 只能做"气氛接近的卡通"，做不出参数级复刻。**
Blender 的 Material 是共享的，所以两个引擎通常得各做一套材质。

（EEVEE Next / Blender 4.2+ 里 `BLENDER_EEVEE` 这个 id 不变，`Shader to RGB` 仍在。
本文全部结论在 **Blender 5.3.0** 上实测验证。）

---

## 1. 逐特性可行性

| ZZZ 特性 | 在引擎里的角色 | EEVEE | Cycles | 说明 |
|---|---|---|---|---|
| 色阶 / toon 分带 | 核心 | ✅ 完整 | ⚠️ 只有 2 带 | EEVEE: Diffuse → Shader to RGB → ColorRamp |
| **5 区域阴影色板** | 核心 | ✅ | ❌ | 需要受光量去索引调色板；Cycles 取不到该中间量 |
| 暗部反照率塑形（三套曲线） | 核心 | ✅ 纯 Math | ✅ 纯 Math | 这是反照率数学，与引擎无关，**两个引擎都能做** |
| 角色光曲线（tonemap） | 输出级 | ✅ Math | ✅ Math | 同上 |
| MatCap 分层 | 高光 | ⚠️ 要手搓 | ⚠️ 要手搓 | 用 Layer Weight / 视空间法线 → UV 查球图；做不出逐区域混合 |
| 塑形高光（遮罩阈值） | 高光 | ⚠️ 近似 | ⚠️ 近似 | 需要 N·H 与遮罩比较，可做但缺逐区域 shape/softness |
| 宽高光 wideSpecular | 高光 | ❌ | ❌ | 依赖 Unity 的 GGX 变体，Blender 无对应 |
| 边缘光 rim | 边缘 | ✅ 近似 | ✅ 近似 | Layer Weight(Facing)^n × 颜色 |
| 区域自发光 | 发光 | ✅ | ❌ | 依赖受光量索引 5 区域 → Cycles 做不到 |
| **面部 SDF** | 脸 | ⚠️ 勉强 | ⚠️ 勉强 | 需要固定光向 + TEXCOORD3；Blender 里没有"头部坐标系"概念，得手摆 |
| 描边（反向外扩壳） | 边缘 | ✅ | ⚠️ 换写法 | 见 §3 的坑 |
| 发影 stencil | 阴影 | ❌ | ❌ | Blender 材质系统没有 **stencil buffer** |
| GI | 全局 | ❌ | ❌ | 源数据本身 `unavailable`，没得抄 |
| 多 RT 合成（rim 写第二张图） | 合成 | ❌ | ❌ | Blender 材质无法多目标输出 |

**真正"两个引擎都做不到"的只有 4 项**：stencil 发影、GI、多 RT 合成、wideSpecular。
其余大多是"EEVEE 能做、Cycles 打折"。

---

## 2. 参数翻译表

从 `contract.json` 的字段 → Blender 节点/数值。注意前三层（shader/材质/引擎全局）的区分
见 `zzz_shader_ref/README.md` §2。

| contract 字段 | Blender 落点 | 备注 |
|---|---|---|
| `sourceState.Cull = 0` | `mat.use_backface_culling = False` + `side=Both` | |
| `sourceState.ZWrite / queue` | `mat.surface_render_method`（EEVEE Next: DITHERED/BLENDED） | |
| `lighting.shadow[0..4]` | ColorRamp(CONSTANT) 5 元素，位置 0.8/0.6/0.4/0.2/0 | 见 §4 的区域映射 |
| `lighting.shallow[0..4]` | 第二个同构 ColorRamp | |
| `lighting.smoothness` | 控制 ColorRamp 插值硬度 / Map Range 软度 | 0.05 ≈ 很硬 |
| `outline.width = 1` | Solidify `thickness`（乘 unityScale 0.01 → 0.01 量级） | 实际用 0.03–0.05 才看得出 |
| `outline.zOffset = 0.01` | Solidify `offset` 或材质里的深度偏移 | |
| `outline.colours[0]` | 描边材质 Emission 颜色 | `[1, 0.2167, 0.2167]` 爱芮红 |
| `outline.tint` | 描边颜色的乘数（Mix MULTIPLY） | 引擎全局，站点里默认 1 |
| `emission.primary.colors[0..4]` | Emission 颜色（按区域查表） | Cycles 做不了 |
| `capabilities.matcaps.regions[k].colorBurst` | Mix 的 Fac / 强度乘数 | `0.5 / 0.48 / 0.5` |
| `reflection.glossiness = 1` | Roughness ≈ 0（高光锐） | |
| `reflection.specIntensity = 0.1` | 高光强度乘数 | |
| `baseBinding.bumpScale = 1` | Normal Map 节点 `Strength` | |
| GLB 的 `roughnessFactor = 0.5527864` | **别用** | 9 个材质全同 → 导出占位值 |

### 区域映射（最容易错的一步）

`zzzRegion5(v)`: `v≥0.8 → 0`、`≥0.6 → 1`、`≥0.4 → 2`、`≥0.2 → 3`、`else → 4`。

在 Blender 里用 **CONSTANT 插值**的 ColorRamp，元素位置与颜色的对应关系是：

| ColorRamp 位置 | 应放的颜色（区域号） |
|---|---|
| 0.0 | `shadow[4]` |
| 0.2 | `shadow[3]` |
| 0.4 | `shadow[2]` |
| 0.6 | `shadow[1]` |
| 0.8 | `shadow[0]` |

**顺序是反的**——因为区域号 0 是"受光最强"。写反了会得到完全错误的调色。

---

## 3. 实测踩到的 4 个坑

这四条都是我在 Blender 5.3 上真跑出来的，不是查来的。

### 坑 1：Cycles 完全忽略 `use_backface_culling`

`Material.use_backface_culling` 是 **EEVEE 限定**属性。Cycles 直接无视它。
后果：反向外扩壳两面全渲染，**整个模型被描边色糊死**。
证据：`out/cycles_outline_fail.png`（那是刻意复现的故障图，不是渲染出错）。

修法：Cycles 要改用 `Geometry.Backfacing → Mix Shader(Transparent, Emission)`。

### 坑 2：两个方案混在同一个材质里会互相抵消

EEVEE 用"背面剔除"，Cycles 用"Backfacing 混合"——听起来可以一个材质两用。
**实测不行**：表面存活下来之后，`Backfacing` 的极性和剔除的极性相反而互相抵消，
结果是描边完全不出现（我试过，得到一张没有描边的图）。

结论：**两套材质，按引擎切换。**

### 坑 3：Solidify 的厚度方向决定成败

- `thickness = -x` + `use_flip_normals = True` → 壳缩小、法线朝内 → **轮廓处露出背面** ✅
- `thickness = +x` + `use_flip_normals = False` → 壳放大、法线朝外 → EEVEE 里轮廓**消失**

必须配合"只渲染背面"才成立。

### 坑 4：`Mix Shader` 的 Fac 极性

`Fac = 0` 取第 1 个 shader，`Fac = 1` 取第 2 个。我一开始把 Toon BSDF 连到第 1 槽却设
`Fac = 1`，第 2 槽是空的 → **渲染出纯黑球**。排查了半天才发现是接线极性。

---

## 4. 对照图

| 图 | 内容 |
|---|---|
| `out/eevee_compare.png` | EEVEE：PBR 基线 / Shader-to-RGB 版 / Toon BSDF 版 |
| `out/cycles_compare.png` | Cycles：同上三个材质（已关闭描边，单独看 Toon BSDF） |
| `out/cycles_outline_fail.png` | **故障证据**：Cycles + Solidify + 背面剔除材质 → 被描边色糊死 |

观察到的现象（如实记录）：

- **PBR 基线**：明暗连续过渡，没有色阶断层，高光是一团模糊。这就是"物理正确"的样子。
- **S2RGB 版（EEVEE）**：出现明显的色阶断层 + 硬边阴影，加上描边后接近 ZZZ 观感。
- **Toon BSDF 版**：Cycles 下出现干净的 2 带硬阶梯——卡通感有了，但**没有区域色板**，
  所以阴影只是"变暗"而不是"变成青灰色"，这正是 §1 表格里说的能力缺口。
- 在 EEVEE 下渲 Toon BSDF 会退化成普通漫反射（该节点是 Cycles 限定）。

---

## 5. 建议的工作流

```
                    ┌─ EEVEE（推荐，能到 80%）
ZZZ contract.json ──┤    · Diffuse → Shader to RGB → ColorRamp(5区色板) → ×albedo
   │                │    · + Emission(区域自发光) + LayerWeight(rim)
   │                │    · Solidify(负厚度+翻法线) + 背面剔除描边
   │                └─ Cycles（只能到 40%）
   │                     · Toon BSDF(Size/Smooth) —— 2 带
   │                     · 想再进一步？只能 bake：先用 EEVEE 渲一版，
   │                       把色阶结果烘进顶点色或贴图，Cycles 再读
   └─ 老实说：要做参数级复刻，别用 Cycles。
```

如果目标是**给你的 PMX / MMD 模型套上这套效果**，路线是：

1. 用 `zzz_shader_ref/params.md` 把 contract 参数导成每个材质的色板（5 组阴影色 + 1 组描边色）
2. 在 Blender 里建上面那套 EEVEE 节点（`build_and_render.py` 里的 `build_toon_eevee()` 可直接抄）
3. 区域图（`_OtherDataTex.r`）如果模型没有，就用贴图手画或用 Albedo 亮度近似
4. 描边用 Solidify，注意 §3 坑 3 的方向

---

## 6. 复现

```bash
cd /home/miku/Work/Blender/zzz_eevee_cycles
blender -b --factory-startup --python build_and_render.py
# 产物在 out/
```

脚本里所有数值都从 `contract.json` 读（`load_params()`），没有硬编码颜色。
贴图用的是从站点抓下来的真实通道：`D`(漫反射) `M`(区域/金属度/高光遮罩) `A`(自发光遮罩) `C`(matcap)。

> 注意：脚本目前渲染的是**测试球**，不是爱芮本体。要做真实模型，
> 需要 `bpy.ops.import_scene.gltf()` 导入 `model.glb` 并按 20 个 surface 逐个赋材质
> —— 这是我下一步可以做的东西。
