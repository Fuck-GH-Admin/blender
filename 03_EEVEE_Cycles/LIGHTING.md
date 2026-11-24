# 灯光：网页到底用的是什么？世界光能不能用？

## 1. 网页的灯光（实测，非推测）

方法：Chrome CDP 注入脚本 hook `WebGL2RenderingContext.prototype.getUniformLocation`，
收集 shader 实际声明过的 uniform 名。灯光的**类型**会直接变成 three.js 的 uniform 名，
所以这是决定性证据（而不是看 UI 猜）。

结果（163 个 uniform 里）：

```
directionalLights[0].color        directionalLights[0].direction
directionalLights[1].color        directionalLights[1].direction
directionalShadowMap[0]           directionalShadowMatrix[0]
directionalLightShadows[0].shadowMapSize
ambientLightColor
hemisphereLights[0].skyColor      hemisphereLights[0].groundColor   hemisphereLights[0].direction
```

点光 / 聚光 / 面光：**0 个**
环境贴图 `envMap` / PMREM：**0 个**

### 结论

| 项 | 网页实际情况 |
|---|---|
| 主光 | **平行光（DirectionalLight）×2**，带阴影 |
| 填充 | **AmbientLight ×1** + **HemisphereLight ×1**（有天/地两色） |
| 环境贴图 | **没有** |
| 灯位来源 | `lightAzimuth = 38.7°`、`lightElevation = 47.6°`（设置里的两个滑块） |

所以：**是"日光"（方向光），不是世界光。** 世界光只用来做填充，不是主力。

---

## 2. 为什么它必须是方向光（原理）

ZZZ 的色阶靠这条链路：

```
NdotL(=dot(N, e02Light))  →  zzzRegion5() 5 段阈值  →  索引阴影/浅阴影色板
```

`e02Light` 是一个**方向向量**。把它换成均匀环境光之后：

- NdotL 在所有方向上几乎相同 → 阈值判断结果恒定 → 只有一个色带被选中
- 结果就是：整片一个颜色，色阶断层消失

**这不是 Blender 的限制，是这套着色模型的前提。**

---

## 3. 实测：纯世界光渲官模

`pmx_render.py` 里两种光照各渲一张：

| 图 | 光照 | 结果 |
|---|---|---|
| `out/pmx_sun.png` | 2 平行光 + 环境/半球填充（还原网页） | 有色阶、有立体感、明暗分界清楚 |
| `out/pmx_world.png` | 纯 World 均匀照明（0.55 灰 ×1.0），无任何方向光 | **整片发白、无色阶、立体感基本丢失** |
| `out/pmx_lighting_compare.png` | 上面两张并排 | — |

世界光确实做到了"受光均匀"，但**卡通感正是因为不均匀才成立**。两者是矛盾的。

---

## 4. 如果真要"更均匀"，该调什么

世界光不是正确答案。要均匀但保留色阶，正确做法是按优先级：

1. **`toonShadowIntensity`（网页默认 0.72）** —— 这才是控制"阴影占多少"的正规旋钮。
   调小 → 阴影带变窄、整体更亮更均匀；调大 → 暗部扩张。范围 0–1.2。
2. **降低主光仰角、抬高填充比例** —— 保持两个方向光，但把填充光强度从 0.5 提到 1.0+
   且放在对侧。这样 NdotL 仍有变化，但暗部不会死黑。
3. **加一盏背面轮廓光** —— 网页其实已经在用第二盏平行光做这件事。
4. **`lightingIntensity`（默认 1，范围 0.25–2）** 与 `exposure`（默认 0.9）配合，
   先提曝光再加填充，比单纯加环境光更安全。

> 一句话：**均匀感来自"填充比例"，不是"去掉方向"。**

---

## 5. 顺带：官模 PMX 直接进 Blender 的方案

Blender 5.3 没有原生 PMX 导入器，`mmd_tools` 对 5.x 支持不确定，所以**自己写了导入器**
（`pmx_render.py`，纯标准库 + bpy，约 350 行）。

解析结果与之前独立分析完全一致，可作交叉验证：

```
AriaIdol / PMX v2.0 / 顶点 35865 / 索引 143202 / 材质 20 / 贴图 9 / 附加UV 2 组
高 17.72 单位
```

只解析到「材质」段就够渲染，不需要骨骼/物理/表情。

### 导入时踩到的 3 个坑

| 坑 | 现象 | 原因 |
|---|---|---|
| **坐标系** | 模型跑到画面外 | PMX 是 **Y-up**，Blender 是 Z-up → 要绕 X 转 +90°；且 PMX 面向 **−Z**，还要再绕 Z 转 180° 才正面朝相机 |
| **透明用错通道** | 整张脸消失，露出头部内壁 | 我一开始拿**贴图 alpha** 做透明混合。MMD 的透明其实来自**材质 `diffuse.a`**；`颜.png` 虽有 alpha 通道但那不是不透明度 |
| **加算叠层** | 头发前帘糊成一块黑 | 「髮+」这个材质 `sphere_mode = 2`（additive），用近乎全黑的 `sp.png` 做发丝高光。当不透明渲染就糊黑，必须跳过或改成加算 |

另外一个非 PMX 问题的坑：**Blender 5.x 默认 AgX 视图变换会大幅去饱和**，
渲卡通材质必须改成 `view_transform = "Standard"`，否则颜色整体发灰发白。

---

## 6. 复现

```bash
cd /home/miku/Work/Blender/zzz_eevee_cycles
blender -b --factory-startup --python pmx_render.py
# → out/pmx_sun.png, out/pmx_world.png
```

灯光参数在 `setup_scene(M, mode)` 里，`mode` 取 `sun` / `world`。
