// =============================================================================
// 50_emission.glsl — 区域自发光（mode e039）
// -----------------------------------------------------------------------------
// 全部 [V]。这是站点相对 HoyoToon 更新的部分之一（HoyoToon 没有 e039）。
//
// 两个坑，站点注释都写明了，非常值得抄作业：
//
// 坑 1 —— 区域插值会发明中间区域
//   "Interpolating M.r across a region edge invents intermediate regions
//    (Ben: ×91.6 colour on the decal borders)"
//   ⇒ 要过滤**自发光结果**，不是过滤区域 ID。所以 zzzEmissionFiltered()
//     做 2×2 超采样：每个 tap 各自取区域→取色→再按权重混合。
//
// 坑 2 —— HDR 颜色不能做 sRGB 解码
//   见 00_common.glsl 的 zzzHdrColor()。
// =============================================================================
#ifndef ZZZ_EMISSION_GLSL
#define ZZZ_EMISSION_GLSL

#include "00_common.glsl"
#include "20_matcap.glsl"      // 复用 e03ParameterColor / e03HdrColor / e021RegionMap

uniform vec4  e039Flags;        // y=mask on  z=mask on  w=remap mode
uniform float e039Mode;         // 0 = HoyoToon 读法(M.b, 亮色)；1 = 原版读法(M.r, 自发光·反照率)
uniform vec3  e039Colors[5];
uniform float e039Diagnostic;

// 自发光遮罩  [V]
//   ab 是 _OtherDataTex2.B（自发光遮罩）
//   0.02 以下直接判 0；否则做 1.25*(ab-0.2) 的重映射
//   flags.y 与 flags.z 必须同时开启，flags.w 决定用重映射值还是原值
float zzzEmissionMask(float ab) {
    if (ab <= 0.02) return 0.0;
    float transformed = clamp(1.25 * (ab - 0.200000003), 0.0, 1.0);
    return (e039Flags.y > 0.5 && e039Flags.z > 0.5)
         ? (e039Flags.w > 0.5 ? transformed : ab)
         : 0.0;
}

// 2×2 超采样版（推荐）  [V]
// 注意 UV 的还原：区域图采样点在 tap 上，颜色图要采回原始 UV ——
// 用区域图的 scale 反推，避免两套 UV 变换不一致。
vec3 zzzEmissionFiltered(vec3 albedo, vec2 mUV, vec2 uv0) {
    vec2 size = vec2(textureSize(e021RegionMap, 0));
    vec2 st   = mUV * size - 0.5;
    vec2 base = floor(st);
    vec2 fr   = st - base;
    vec2 mScale = vec2(e021UVTransform[0][0], e021UVTransform[1][1]);

    vec3 sum = vec3(0.0);
    for (int j = 0; j < 2; ++j) {
        for (int i = 0; i < 2; ++i) {
            vec2 tap = (base + vec2(float(i), float(j)) + 0.5) / size;
            vec2 uvT = uv0 + (tap - mUV) / mScale;
            float mr = textureLod(e021RegionMap, tap, 0.0).r;
            float ab = textureLod(e03Amap, (e03AUVTransform * vec3(uvT, 1.0)).xy, 0.0).b;
            float w = (i == 0 ? 1.0 - fr.x : fr.x) * (j == 0 ? 1.0 - fr.y : fr.y);
            sum += w * e03HdrColor(e039Colors[zzzRegion5(mr)]) * zzzEmissionMask(ab);
        }
    }
    return albedo * sum;
}

// 无超采样版（单点）  [V]
vec3 zzzEmissionContribution(vec3 incoming, float ab, float mb) {
    return incoming * e03ParameterColor(e039Colors[zzzRegion5(mb)]) * zzzEmissionMask(ab);
}

#endif // ZZZ_EMISSION_GLSL
