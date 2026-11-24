// =============================================================================
// 20_matcap.glsl — 分层 MatCap（mode e03）
// -----------------------------------------------------------------------------
// 全部 [V] 逐字还原自 e03 块。这是 MMD 完全没有的东西：最多 5 层球面贴图叠加，
// 每层有自己的混合方程、色相突发系数、平铺变换、折射参数。
//
// 对应 contract：capabilities.matcaps.regions[0..4] + capabilities.reflection
//   _MatCapTex2..5 (C 类 256x256)  ← regions[2..4] 在爱芮身上是启用的
// =============================================================================
#ifndef ZZZ_MATCAP_GLSL
#define ZZZ_MATCAP_GLSL

#include "00_common.glsl"

uniform sampler2D e03Amap, e03Map0, e03Map1, e03Map2, e03Map3, e03Map4;
uniform mat3   e03AUVTransform;
uniform vec2   e03RegionMapSize;
uniform vec4   e03Flags;            // x=?, y=?, z=matcap sRGB decode, w=?
uniform vec4   e03Blend[5];         // x=blend mode(0/1/2)  y=colorBurst  z=alphaBurst  w=?
uniform vec4   e03Shape[5];         // x=shape on  y=softness  z=range  w=?
uniform vec4   e03UVTransforms[5];
uniform float  e03UVMatcaps;
uniform vec2   e03Speed[5];
uniform float  e03Time, e03UV0Flip;
uniform vec4   e03Refract[5], e03RefractParam[5];
uniform vec3   e03Tint[5], e03SpecColor[5];
uniform vec3   e03Scopes;
uniform float  e03RegionFamily[5];
uniform float  e03Enabled, e03Diagnostic, e03Metallic, e03SpecIntensity, e03SkinId, e03DiscreteIds;
uniform float  e03Crystal, e03UseMatCapMask, e03TintAlpha[5];

// 区域/ID 读取的纹素中心对齐（opt-in）。
// 站点注释：只对 region/ID 这类离散值开启；连续遮罩、渐变、法线、颜色
// 必须保留原始线性过滤，否则边缘会出现中间区域。 [V]
vec2 e03SnapRegionUV(vec2 uv) {
    return (floor(uv * e03RegionMapSize) + vec2(0.5)) / e03RegionMapSize;
}

// 参数颜色的 sRGB 解码由 e021B.w 统一控制 [V]
vec3 e03ParameterColor(vec3 c) { return e021B.w > 0.5 ? zzzSrgbDecode(c) : c; }
vec3 e03HdrColor(vec3 c)       { return max(c.r, max(c.g, c.b)) > 1.0 ? c : e03ParameterColor(c); }

// -----------------------------------------------------------------------------
// 分层采样  [V]
// 坑点（站点注释）：区域 ID 逐像素变化，导致采样落在非一致控制流里，
// 隐式 LOD 的导数未定义 —— 区域边界上的 quad 会随机挑 mip，相机/姿势一动就闪
// （原例：Eff_Matcap_Evelyn_WhiskeyGlass_1 高对比球图上出现闪烁）。
// 解法：显式 textureGrad，导数由一致控制流提供。
// -----------------------------------------------------------------------------
vec4 e03Sample(int id, vec2 uv, vec2 gx, vec2 gy) {
    if (id == 1) return textureGrad(e03Map1, uv, gx, gy);
    if (id == 2) return textureGrad(e03Map2, uv, gx, gy);
    if (id == 3) return textureGrad(e03Map3, uv, gx, gy);
    if (id == 4) return textureGrad(e03Map4, uv, gx, gy);
    return textureGrad(e03Map0, uv, gx, gy);
}

// -----------------------------------------------------------------------------
// 单层合成  [V]
// 三种混合模式：
//   mode 0 —— 线性插值：(tinted*burst - base) * a + base
//   mode 1 —— 加性：    tinted * a * burst + base
//   mode 2 —— 上游 overlay：用**原始** matcap alpha*mask（不是 alphaBurst），
//             且 tint 项翻倍；再按 base 是否 >0.5 分两段 overlay
// -----------------------------------------------------------------------------
vec3 e03MatcapScaled(vec3 base, vec4 texel, float mask, int id, float texBoost) {
    vec3 rgb = (e03Flags.z > 0.5 ? zzzSrgbDecode(texel.rgb) : texel.rgb) * texBoost;
    vec3 tinted = rgb * e03HdrColor(e03Tint[id]);
    float alpha = clamp(texel.a * mask, 0.0, 1.0);
    float burst = e03Blend[id].y;
    float a = clamp(e03Blend[id].z * alpha, 0.0, 1.0);

    if (e03Blend[id].x < 0.5) return a * (tinted * burst - base) + base;
    if (e03Blend[id].x < 1.5) return tinted * a * burst + base;

    vec3 blend = mix(vec3(0.5), clamp(tinted * burst + tinted, 0.0, 1.0), alpha);
    return mix(2.0 * base * blend,
               1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
               step(vec3(0.5), base));
}

vec3 e03Matcap(vec3 base, vec4 texel, float mask, int id) {
    return e03MatcapScaled(base, texel, mask, id, 1.0);
}

#endif // ZZZ_MATCAP_GLSL
