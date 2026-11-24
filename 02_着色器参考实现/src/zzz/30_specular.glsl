// =============================================================================
// 30_specular.glsl — 宽高光 / 菲涅尔 / 塑形高光（mode e03 的一部分）
// -----------------------------------------------------------------------------
// 全部 [V]。MMD 的 specular 只有 (RGB, power) 两个标量，这里是一整套：
//   zzzSpecularFresnel   —— 基于反照率亮度的金属菲涅尔
//   zzzShapedHighlight   —— 用遮罩 B 通道做“角度阈值”的塑形高光
// 对应 contract：capabilities.wideSpecular{glossiness, regions[5]{shape,toon,modelSize}}
// =============================================================================
#ifndef ZZZ_SPECULAR_GLSL
#define ZZZ_SPECULAR_GLSL

#include "00_common.glsl"
#include "20_matcap.glsl"   // e03Shape / e03Metallic / e03SpecIntensity / e03SpecColor / e03Crystal

// -----------------------------------------------------------------------------
// 菲涅尔  [V]
// 站点注释："Specular scaled as the original pass
//            spec · (mask · _SpecIntensity) · _SpecularColor · F0"
// 特点：F0 不是常数 0.04，而是随**反照率亮度**变化 —— 亮度高的部位幂指数小，
// 高光更“散”；亮度低的部位更集中。这是丝袜/皮靴和皮肤反光差异的来源。
// -----------------------------------------------------------------------------
vec3 e03SpecularFresnel(vec3 N, vec3 L, vec3 base, vec3 M) {
    if (e03Crystal > 0.5) {
        return mix(vec3(0.0399999991), base, clamp(e03Metallic * M.g, 0.0, 1.0));
    }
    float nl = dot(N, L);
    float ns = clamp(nl, 0.0, 1.0);
    // 亮度驱动的幂指数：注意系数 0.2875 与 1.4375 与暗部塑形同一组常数
    float luminance  = zzzLumShaping(base) * 0.287499994 + 1.4375;
    float lightWeight = ((nl * 0.5 + 0.5) - ns) * 0.5 + ns;
    float power = lightWeight * (1.0 - luminance) + luminance;

    float peak = max(base.r, max(base.g, base.b));
    vec3 contrast = pow(peak > 1.0 ? base / peak : base, vec3(power));
    vec3 halfway  = (contrast - base) * 0.5 + base;
    vec3 someColor = ns * (contrast - halfway) + halfway;
    return (e03Metallic * M.g) * (someColor - vec3(0.0399999991)) + vec3(0.0399999991);
}

// -----------------------------------------------------------------------------
// 塑形高光  [V]
// _OtherDataTex.B 是遮罩（头发高光区），用半角向量的角度和一个阈值比较，
// 阈值随阴影量 shad 移动 —— 所以高光会随光照方向“流动”，而不是固定位置。
//   Shape[id].y = 软度（0 则做硬阶跃）
//   Shape[id].z = range（角半径）
// -----------------------------------------------------------------------------
vec3 e03ShapedHighlight(vec3 N, vec3 V, vec3 L, vec3 base, vec3 M, float shad, int id) {
    if (e03Shape[id].x < 0.5) return vec3(0.0);

    vec3 sum = V + L;
    float len = length(sum);
    if (len == 0.0) return vec3(0.0);       // V 与 L 相反时的退化保护
    vec3 H = sum / len;

    float nl = dot(N, L);
    vec3 fresnel = e03SpecularFresnel(N, L, base, M);

    float shade = clamp(shad * 1.5 + 0.5, 0.0, 1.0);
    float threshold = 1.0 - clamp(dot(N, H) * 0.5 + 0.5, 0.0, 1.0) * shade;

    float softness = e03Shape[id].y;
    float mask = softness > 0.0
               ? clamp((M.b - threshold) / softness, 0.0, 1.0)
               : step(threshold, M.b);

    float range = e03Shape[id].z;
    float lh = clamp(dot(L, H) * range * 0.75 + 0.25, 0.0, 1.0);
    float denom = max(0.100000001, lh * lh);
    // 100.0 是原版的强度归一常数，不是笔误
    float angular = 100.0 * min(1.0, 0.166663334 / denom)
                  * clamp(range * nl * 0.75 + 0.25, 0.0, 1.0);

    return angular * e03SpecIntensity * mask * e03HdrColor(e03SpecColor[id]) * fresnel;
}

#endif // ZZZ_SPECULAR_GLSL
