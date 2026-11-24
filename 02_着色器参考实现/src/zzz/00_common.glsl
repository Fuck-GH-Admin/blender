// =============================================================================
// 00_common.glsl — 共用工具
// -----------------------------------------------------------------------------
// 证据等级标记：
//   [V] verbatim  — 从 zzz-studio.app 的 WebGL bundle 中逐字提取，未改动语义
//   [R] reconstructed — 依据 contract.json 参数语义 + 代码注释重建，站点未提供完整实现
//   [I] inferred  — 我为可运行性补的胶水代码（命名、结构、缺省值），非游戏逻辑
// =============================================================================
#ifndef ZZZ_COMMON_GLSL
#define ZZZ_COMMON_GLSL

// -----------------------------------------------------------------------------
// 颜色空间
// 游戏侧约定（见 contract.lighting.colorContract）："ShaderLab Color -> linear
// when enabled; original game serialization/color-space contract unconfirmed"。
// 因此所有进入 shader 的参数颜色都先过一遍可选的 sRGB 解码，由 flag 控制。 [V]
// -----------------------------------------------------------------------------
vec3 zzzSrgbDecode(vec3 c) {
    return vec3(
        c.r <= 0.04045 ? c.r / 12.92 : pow((c.r + 0.055) / 1.055, 2.4),
        c.g <= 0.04045 ? c.g / 12.92 : pow((c.g + 0.055) / 1.055, 2.4),
        c.b <= 0.04045 ? c.b / 12.92 : pow((c.b + 0.055) / 1.055, 2.4));
}

// [V] e021Decode / e03Decode / p4Decode 三处实现完全等价，统一到这里。
//     flag 关闭时原样返回（游戏里老版本走这条路径）。
vec3 zzzDecode(vec3 c, float enabled) {
    return enabled > 0.5 ? zzzSrgbDecode(c) : c;
}

// [V] 关键防坑点：HDR 颜色（任一分量 > 1，例如 Ben 的 91.6）在游戏里是线性值，
//     不能再做 sRGB 解码 —— 否则 91.6 会被解成 ~45000，1/255 的压缩噪声
//     直接放大成白块。站点注释原文：
//     "HDR emission colours (a channel above 1, e.g. Ben 91.6) are linear:
//      the sRGB decode turned 91.6 into ~45 000, so a 1/255 compression-noise
//      mask became a white block."
vec3 zzzHdrColor(vec3 c, float decodeEnabled) {
    return max(c.r, max(c.g, c.b)) > 1.0 ? c : zzzDecode(c, decodeEnabled);
}

// -----------------------------------------------------------------------------
// 区域映射（5 区）
// 两处原始写法互为等价，这里统一：
//   e039Region(mb){ return mb>=0.8?0 : mb>=0.6?1 : mb>=0.4?2 : mb>=0.2?3 : 4; }   [V]
//   e0310Region(mr){ return mr<0.2?4 : mr<0.4?3 : mr<0.6?2 : mr<0.8?1 : 0; }      [V]
// 区域号 0..4 用于索引：MatCap 槽位、描边色、阴影色、浅阴影色、Rim 色。
// -----------------------------------------------------------------------------
int zzzRegion5(float v) {
    return v >= 0.8 ? 0 : (v >= 0.6 ? 1 : (v >= 0.4 ? 2 : (v >= 0.2 ? 3 : 4)));
}

// -----------------------------------------------------------------------------
// 亮度系数
// 两套并存，别混用： [V]
//   0.29 / 0.60 / 0.11  —— 游戏塑形用（e021ShadeAlbedo、e03SpecularFresnel、
//                            e0310 里的灰度）
//   0.212673 / 0.715152 / 0.072175 —— 标准 Rec.709，只用在角色光曲线
//                            e021CharLight 上
// -----------------------------------------------------------------------------
float zzzLumShaping(vec3 c) { return dot(c, vec3(0.29, 0.60, 0.11)); }
float zzzLumRec709(vec3 c)  { return dot(c, vec3(0.212673, 0.715152, 0.072175)); }

// [V] zzzRgbToHsv —— 描边色相位偏移用（HoyoToon 的 _OutlineHue1..5 同源需求）
vec3 zzzRgbToHsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    return vec3(q.z + (q.w - q.y) / (6.0 * d + 0.0001), d / (q.x + 0.0001), q.x);
}

vec3 zzzHsvToRgb(vec3 c) {                              // [I] zzzRgbToHsv 的逆
    vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
    return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

// -----------------------------------------------------------------------------
// 线性深度（避免近/远平面在高比例相机下抵消）
// [V] e0310Linear / p5Linear / p5 同式：
//     z 为 NDC 深度，camera.x = near, camera.y = far
// -----------------------------------------------------------------------------
float zzzLinearDepth(float z, vec2 nearFar) {
    return nearFar.x / (1.0 - z + z * nearFar.x / nearFar.y);
}

#endif // ZZZ_COMMON_GLSL
