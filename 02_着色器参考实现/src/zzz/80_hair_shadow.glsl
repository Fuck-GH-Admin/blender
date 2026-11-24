// =============================================================================
// 80_hair_shadow.glsl — 头发投影（stencil 方案）
// -----------------------------------------------------------------------------
// 站点 mode 码 "stencil-shadow"，独立 shader：miHoYo/Character/NapStencilShadowCaster
// contract: surface-17 / MAT_HairShadow
//   maps = {}                      ← 没有贴图！
//   status = "partial"
//   issues:
//     "No verified Unity mesh/UV/normal correspondence"
//     "Material assignment without verified geometry: original vertex colors,
//      recovered tangents and extra UV correspondence remain unavailable"
//     "Stencil-only hair shadow (no colour in game): reproduced from the original
//      vertex program; marks the face area the face shadow pass darkens"
//
// 关键情报：**游戏里这遍不输出颜色**，只写 stencil 标记，
// 用来告诉面部 pass “这块脸要被头发压暗”。
// GLB 里为了可视化才保留了一个 1,414 顶点的几何体（AriaIdol_HairShadow，2,764 三角）。
//
// 顶点属性（[V] 逐字）：
//   attribute float hairShadowR;    ← 每个顶点的阴影强度
//   uniform vec3 hsLight;
//   uniform vec3 hsAxis;
//   uniform vec4 hsParams;  // x=_Length  y=_XOffsetNew  z=_ZOffset  w=_YOffset
//   uniform float hsUnit;   // 每 Unity 米的单位数（骨骼世界缩放；登记的 GLB 里是 0.01）
// =============================================================================
#ifndef ZZZ_HAIR_SHADOW_GLSL
#define ZZZ_HAIR_SHADOW_GLSL

#include "00_common.glsl"

uniform vec3  hsLight;
uniform vec3  hsAxis;
uniform vec4  hsParams;
uniform float hsUnit;

// -----------------------------------------------------------------------------
// 沿固定轴投影  [R]
// 语义来自 hsParams 的四个分量命名（_Length / _XOffsetNew / _ZOffset / _YOffset），
// 站点只暴露了 uniform 声明，未公开函数体（这是 partial 的原因）。
// 这里按命名与 intent 重建：沿 hsAxis 把头发顶点推出去，形成一块“假投影体”。
// -----------------------------------------------------------------------------
vec3 zzzHairShadowProject(vec3 posWs, float r) {
    float len   = hsParams.x * r;
    float xOff  = hsParams.y;
    float zOff  = hsParams.z;
    float yOff  = hsParams.w;

    vec3 axis = normalize(hsAxis);
    // 沿轴伸展 + 三个方向偏移（单位换算成 Unity 米）
    return posWs
         + axis * (len  * hsUnit)
         + vec3(xOff, 0.0, 0.0) * hsUnit
         + vec3(0.0, yOff, 0.0) * hsUnit
         + vec3(0.0, 0.0, zOff) * hsUnit;
}

// 光照朝向的衰减：背光侧不该投影
float zzzHairShadowFalloff(vec3 nWs) {
    return clamp(dot(normalize(nWs), normalize(hsLight)) * 0.5 + 0.5, 0.0, 1.0);
}

#endif // ZZZ_HAIR_SHADOW_GLSL
