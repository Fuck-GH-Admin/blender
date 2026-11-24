// =============================================================================
// 10_ramp.glsl — 色阶 / 暗部塑形 / 角色光曲线   (mode e021 / e039 共用)
// -----------------------------------------------------------------------------
// 这是 ZZZ 角色着色最核心、也最容易被 MMD toon 做错的一块。
// 三个函数全部 [V] 逐字还原：
//   zzzShadeAlbedo   ← e021ShadeAlbedo    (Standard lines 508-545 / Face 638-666 / Eye 520-540)
//   zzzCharLight     ← e021CharLight      (_CharacterLightTonemapParams × _CharacterAmbient)
//   zzzShadowColor / zzzShallowColor      ← e021Shadow / e021Shallow
// =============================================================================
#ifndef ZZZ_RAMP_GLSL
#define ZZZ_RAMP_GLSL

#include "00_common.glsl"

// 每个材质最多 5 个区域（region 0..4），由 zzzRegion5() 从区域图取值索引。
uniform vec3  e021ShadowColors[5];      // 阴影色板（5 区）
uniform vec3  e021ShallowColors[5];     // 浅阴影（half-shadow）色板（5 区）
uniform vec3  e021SkinTints[6];         // _Skin*Tint     引擎全局（皮肤）
uniform vec3  e021GlobalTints[6];       // _Post*Tint     引擎全局（其余）
uniform vec3  e021ColorTint;
uniform vec3  e021RimShadowColor;
uniform float e021SkinMatId;            // _SkinMatId：哪个材质算“皮肤”
uniform float e021Crystal;
uniform float e021RimShadowAlpha;
uniform float e021EntityShadow;
uniform float e021FadeByZ;
uniform float e021UnitScale;
uniform float e021AlbedoShade;          // 输出级：是否做暗部反照率塑形
uniform vec3  e021CharCurve;            // x=threshold  y=maximum  z=enabled
uniform vec3  e021CharAmbient;          // _CharacterAmbient
uniform vec4  e021B;                    // x=shadow on, y=shallow on, z=?, w=color decode on
uniform vec4  e021A;
uniform float e021Smoothness;
uniform vec4  e021SmoothnessRegions;
uniform sampler2D e021RegionMap;
uniform mat3  e021UVTransform;
uniform vec3  e02Light;                 // 主光方向（视图空间）

bool e021IsSkin = false;                // 由调用方按 e021SkinMatId 设置

// -----------------------------------------------------------------------------
// 暗部反照率塑形  [V]
// 游戏原文注释（站点保留）：
//   "Albedo in the unlit part (Standard lines 508-545, Face 638-666, Eye 520-540):
//    skin keeps it; hair takes a fixed power; the rest is darkened and saturated by
//    pow(albedo, mix(1.4375 + 0.2875 lum, 1, s)) where the light does not reach."
// 三套分支：
//   hair   —— 固定幂 (1 + 0.4·lum)，再乘 (1.05 - 0.05·lum) 轻微提亮
//   skin   —— 调用方直接跳过（保留原色），这是 MMD 做不对的头号原因
//   other  —— 幂指数在 (1.4375 + 0.2875·lum) 与 1.0 之间按受光量 s 插值
// -----------------------------------------------------------------------------
vec3 zzzShadeAlbedo(vec3 a, float nl, float nlv, bool hair) {
    float lum = zzzLumShaping(a);
    if (hair) {
        return pow(max(a, vec3(0.0)), vec3(1.0 + 0.4 * lum)) * (1.05 - 0.05 * lum);
    }
    float d = clamp(1.0 - 3.0 * (nlv - nl), 0.0, 1.0);
    float g = min(2.0 * d * sqrt(d), 1.0);
    float s = ((nl * 0.5 + 0.5) * g + clamp(nl, 0.0, 1.0)) * 0.5;
    float mx = max(a.r, max(a.g, a.b));
    // HDR 反照率先归一化再做幂运算，避免 >>1 的分量把对比度拉到无意义
    vec3  p = pow(max(mx > 1.0 ? a / mx : a, vec3(0.0)), vec3(mix(1.4375 + 0.2875 * lum, 1.0, s)));
    return mix((p + a) * 0.5, p, clamp(nlv, 0.0, 1.0));
}

// -----------------------------------------------------------------------------
// 角色光曲线  [V]
// _CharacterLightTonemapParams：x = threshold，y = maximum，作用在
// 「色阶亮度 + _CharacterAmbient」上。注意 ambient 只进亮度，不直接加到颜色里：
// 站点注释 "the ambient only enters the luminance, it is not added to the colour"
// -----------------------------------------------------------------------------
vec3 zzzCharLight(vec3 ramp) {
    if (e021CharCurve.z < 0.5) return ramp;
    float lum = zzzLumRec709(ramp + e021CharAmbient);
    float t = e021CharCurve.x;
    float m = max(e021CharCurve.y, t + 0.00001);
    float c = lum < t ? lum : m - (m - t) / ((lum - t) / (m - t) + 1.0);
    return ramp * (c / (lum + 0.0001));
}

// -----------------------------------------------------------------------------
// 色板取值  [V]
// flag 关闭时返回白色（= 不做该级调色），与原版 e021Shadow/e021Shallow 一致
// -----------------------------------------------------------------------------
vec3 zzzShadowColor(int id)  { return e021B.x > 0.5 ? zzzDecode(e021ShadowColors[id],  e021B.w) : vec3(1.0); }
vec3 zzzShallowColor(int id) { return e021B.y > 0.5 ? zzzDecode(e021ShallowColors[id], e021B.w) : vec3(1.0); }

// _Skin*Tint / _Post*Tint：皮肤走 SkinTints，其余走 GlobalTints  [V]
vec3 zzzPostTint(int id) {
    return zzzDecode(e021IsSkin ? e021SkinTints[id] : e021GlobalTints[id], e021B.w);
}

// -----------------------------------------------------------------------------
// 色阶合成骨架  [R]
// 站点没有把完整的主 pass 拼装逻辑以单个模板串暴露出来（分散在多个插值片段里），
// 以下按 contract 的参数语义 + 上述三个 [V] 函数重建：
//   region  ← 区域图（_LightTex 的对应通道，具体通道随 mode 变）
//   nl      ← dot(N, L)，受光量
//   shade   ← toonShadowIntensity 控制的二值/软阶跃
// 站点可调参数 toonShadowIntensity 默认 0.72，范围 0..1.2。
// -----------------------------------------------------------------------------
float zzzToonShade(float nl, float intensity) {
    // [R] 软阶跃：intensity 越大，暗部扩张越多
    float edge = mix(0.1, 0.9, clamp(intensity, 0.0, 1.2) / 1.2);
    return smoothstep(edge - 0.05, edge + 0.05, nl * 0.5 + 0.5);
}

vec3 zzzRamp(vec3 albedo, float nl, int region, float shade, bool hair) {
    vec3 shadow  = zzzShadowColor(region);
    vec3 shallow = zzzShallowColor(region);

    // 暗部：反照率塑形（皮肤跳过）
    vec3 unlit = e021AlbedoShade > 0.5 && !e021IsSkin
               ? zzzShadeAlbedo(albedo, nl, nl, hair)
               : albedo;
    // 三色带：阴影 / 浅阴影 / 受光
    vec3 col = mix(unlit * shadow, albedo * shallow, smoothstep(0.0, 0.5, shade));
    col = mix(col, albedo, smoothstep(0.5, 1.0, shade));

    // 输出级调色
    col *= zzzPostTint(region);
    return zzzCharLight(col);
}

#endif // ZZZ_RAMP_GLSL
