// =============================================================================
// 70_outline.glsl — 反向外扩壳描边
// -----------------------------------------------------------------------------
// 关键差异：站点不是常见的「沿法线外扩」，而是用**预烘焙的描边顶点缓冲**。
//
// contract.vertexBuffers 实测：12 个缓冲，kind="outline"，stride=7
//   = position.xyz(3) + normal.xyz(3) + outlineWeight(1)
//   合计 28,171 顶点 / 788,788 字节
// 运行时强制校验：buffer.length === position.count * 7，否则整条描边丢弃。
//
// 为什么预烘焙权重比实时法线外扩好：
//   硬边/接缝处法线会分裂，实时外扩会在转角裂开或穿插；
//   烘焙时可以对每个顶点单独算“安全外扩方向+长度”。
//
// 描边本身是独立一遍：Cull Front + ZWrite，颜色由 **5 区域色** 决定。
//   contract.outline.colours[0] = [1.0, 0.2167, 0.2167, 1]  ← 爱芮的红色描边
//   contract.outline.width = 1, zOffset = 0.01, unityScale = 0.01
//   mode = "region-map"（区域图决定用哪个区域色）
//
// 与 HoyoToon 的对应：它有 _OutlineWidth/_OutlineZOff/_OutlineColor1..5/
// _OutlineHue1..5/_OutlineMaskSource，是同一套设计。
// =============================================================================
#ifndef ZZZ_OUTLINE_GLSL
#define ZZZ_OUTLINE_GLSL

#include "00_common.glsl"

// -----------------------------------------------------------------------------
// 顶点阶段
// stride-7 布局的语义（与站点 attribute 名严格对应）
// -----------------------------------------------------------------------------
uniform float zzzUnit;          // 世界单位 / Unity 米（GN 里是 0.01）
uniform float zzzWidth;         // 描边宽度（UI: outlineThickness, 默认 1, 0.25..2.5）
uniform float zzzWidthScale;
uniform float zzzZOffset;       // 默认 0.01
uniform vec4  zzzColors[5];     // 5 区域描边色
uniform vec4  zzzTint;          // _PostOutlineTint 引擎全局（默认 1,1,1,1）
uniform float zzzMetallic;
uniform float zzzEngineTint;
uniform float zzzAmbient;
uniform vec3  zzzLightDir, zzzLightColor;
uniform sampler2D zzzRegionMap; // 区域图（与主 pass 共用）
uniform mat3  zzzRegionUV;
uniform float zzzWidthUsesUnit;

// [R] 外扩：依据 contract 的 stride-7 语义重建。
//     站点把 baked 权重放在第 7 个 float，这里显式传参。
vec3 zzzOutlineExtrude(vec3 posWs, vec3 normalWs, float bakedWeight, mat4 viewProj) {
    // 宽度以 Unity 米为单位，乘 unit 换到当前单位制
    float w = zzzWidth * zzzWidthScale * zzzUnit * bakedWeight;
    vec3 ws = posWs + normalize(normalWs) * w;
    vec4 clip = viewProj * vec4(ws, 1.0);
    // zOffset：把壳往相机方向推一点，压掉深度冲突（避免描边被自己遮住）
    clip.z -= zzzZOffset * zzzUnit * clip.w;
    return clip.xyz;
}

// -----------------------------------------------------------------------------
// 片元阶段：区域色 × 色调偏移  [R]
// HoyoToon 的 _OutlineHue1..5 说明描边色会做色相旋转；站点用 zzzColors 直接给
// 5 个色值。两种写法等价，这里同时支持。
// -----------------------------------------------------------------------------
uniform float zzzOutlineHue[5];

vec3 zzzOutlineColor(float regionValue, vec2 uv, float hueShift) {
    int id = zzzRegion5(regionValue);
    vec3 c = zzzColors[id].rgb;
    if (abs(hueShift) > 1e-4) {
        vec3 hsv = zzzRgbToHsv(c);
        hsv.x = fract(hsv.x + hueShift);
        c = zzzHsvToRgb(hsv);
    }
    // 描边色本身也吃 _PostOutlineTint 这张引擎全局
    return zzzDecode(c, 1.0) * zzzTint.rgb * zzzTint.a;
}

#endif // ZZZ_OUTLINE_GLSL
