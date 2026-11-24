// =============================================================================
// 40_rim.glsl — 边缘光（Transcribed Rim）+ NdotV 边缘项
// -----------------------------------------------------------------------------
// [V] 逐字还原，体量最大也最容易做错的一块。
//
// 站点注释（原文）：
//   "Transcribed rim (docs/rim-transcribed-20261112.md): CharacterToonDeferred
//    blob 2700, lines 617–732. The game writes it to a second render target
//    composed by a pass that is not exported; here it is added before tone mapping."
//
// 关键情报：**游戏把 rim 写到第二个 render target，再由一个没被导出的 pass 合成。**
// 所以 rim 的正确合成方式（叠加还是 lerp、在 tone mapping 之前还是之后）
// 在游戏资产里根本看不到 —— 站点也只能选择“在 tone mapping 之前相加”。
// 这是一处原理性的不可还原点，做参考实现时必须承认。
//
// contract 里 rim 的状态也印证了这点：
//   rim.sun = [null x 5], rim.width = null
//   reasons: "missing regional _UISunColor", "missing _RimWidth",
//            "active rim hue path unknown or unimplemented"
// =============================================================================
#ifndef ZZZ_RIM_GLSL
#define ZZZ_RIM_GLSL

#include "00_common.glsl"
#include "10_ramp.glsl"

uniform float e021RimOn;
uniform float e021RimEnabled;
uniform float e021RimIntensity;
uniform float e021HairBit;
uniform float e021Metallic;
uniform vec4  e021RimStyle;        // x=vertical  y=metal  z=style blend  w=chroma
uniform vec3  e021RimTint;
uniform vec3  e021RimColors[5];
uniform vec3  e021LightColor;

// -----------------------------------------------------------------------------
// 逐字还原  [V]
// 参数：
//   N, V, L      —— 法线 / 视线 / 光向（视图空间，已归一化）
//   mr, mg       —— _OtherDataTex 的 R（区域）与 G（金属度）
//   base         —— 反照率
//   rampLight    —— 已算好的色阶光照色
//   shadow       —— 阴影权重
//   dist         —— 相机距离（Unity 米）
//
// 结构上分三段：
//   1) 垂直梯度 vertical —— 沿法线 Y 做 5 次幂塑形；皮肤用线性 y，其余用 y²
//      （这就是为什么皮肤的边缘光更“贴边”、布料更“包裹”）
//   2) 角度项 m —— 视线·光线 + 法线·光线 + 金属度修正
//   3) 菲涅尔项 e —— NdotV 随距离变化的软阈值（皮肤 0.75/5.0，其余 0.5/3.33）
// -----------------------------------------------------------------------------
vec3 zzzTranscribedRim(vec3 N, vec3 V, vec3 L,
                       float mr, float mg, vec3 base,
                       vec3 rampLight, float shadow, float dist) {
    // ---- 1) 垂直梯度 ----
    float vl = clamp(0.5 - 0.5 * dot(V, L), 0.0, 1.0);

    float y = N.y * 0.5 + 0.5;
    y = e021IsSkin ? y : y * y;                       // 皮肤线性，其余平方
    float t = clamp((y - 0.2) * 1.25, 0.0, 1.0);
    float s = t * t * (3.0 - 2.0 * t);                // smoothstep
    float s5 = s * s * s * s * s;                     // 5 次幂

    float vertical = e021RimStyle.x
                   * (s * (e021IsSkin ? 1.0 - 0.7 * s5 : 0.5 + 0.5 * s5) - 0.1)
                   + 0.1;

    // ---- 2) 角度项 ----
    float m = vertical
            * (vl * 0.8 + 0.2)
            * ((dot(N, L) * 0.5 + 0.5) * shadow * 1.4 + 0.1)
            * clamp(shadow + 0.6, 0.0, 1.0);

    float metal = mg * e021Metallic;
    // 头发 bit 打开时用固定 4.5 代替金属度曲线
    m *= e021RimStyle.y
       * (clamp(-V.y, 0.0, 1.0) * (e021HairBit > 0.5 ? 4.5 : metal + 2.5) - 0.5)
       + 1.0;

    // ---- 3) 菲涅尔 ----
    float dn  = min(dist * 0.083333, 1.0);            // 1/12
    float ndv = 1.0 - dot(V, N);
    float e = e021IsSkin
            ? clamp((ndv - (0.5 - 0.3 * dn)) * 3.333333, 0.0, 1.0)
            : clamp((ndv - (0.6 - 0.3 * dn)) * 5.0,      0.0, 1.0);
    e = e * e * (3.0 - 2.0 * e);

    // ---- 光色：取 8 次幂后的“高光部分”，再按 33%/70% 归一 ----
    vec3 lc = e021LightColor;
    vec3 p8 = pow(max(lc, vec3(0.0)), vec3(8.0));
    vec3 nl = p8 * (dot(lc, vec3(0.33)) / max(dot(p8, vec3(0.7)), 0.01));

    vec3 lt = mix(rampLight, nl, shadow);
    lt = mix(lt, rampLight, pow(vl * vl, 20.0));       // 逆光时回到色阶色
    lt = rampLight + e021RimStyle.z * (lt - rampLight); // style 插值

    // ---- 基础色：金属度越高越不用反照率 ----
    vec3 diffuse = base * (0.96 - 0.96 * metal);
    float mean = (diffuse.r + diffuse.g + diffuse.b) * 0.33;
    vec3 chroma = pow(clamp(diffuse, 0.0, 1.0), vec3(0.2));
    chroma *= inversesqrt(max(dot(chroma, chroma), 0.000061));   // 归一化色相

    vec3 col = mix(chroma * (1.0 - 0.2 * mean * mean * e021RimStyle.w) * 0.1,
                   mix(vec3(0.04), base, metal),
                   metal) * e021RimIntensity;

    col *= lt * (m * e);

    // ---- 区域色 ----
    int id = mr < 0.2 ? 4 : (mr < 0.4 ? 3 : (mr < 0.6 ? 2 : (mr < 0.8 ? 1 : 0)));
    col *= zzzSrgbDecode(e021RimColors[id]);

    // ---- 距离衰减 + 高亮增益 ----
    col *= 1.0 - 0.7 * clamp(dist * 0.2 - 1.0, 0.0, 1.0);
    float sum = col.r + col.g + col.b;
    col *= sum * sum * 0.05 + 1.0;                     // 亮部二次增益

    col *= e021HairBit > 0.5 ? 0.5 : 1.0;
    return col * zzzSrgbDecode(e021RimTint) * e021RimEnabled;
}

// -----------------------------------------------------------------------------
// e0310 的 NdotV 边缘项  [V]
// 与 rim 同源思路但独立实现（用于皮肤/非皮肤的两种曲线），
// 并带屏幕空间偏移与阴影比较。
// -----------------------------------------------------------------------------
uniform vec4  e0310Flags;
uniform float e0310Diagnostic, e0310Skin;
uniform vec3  e0310Sun[5], e0310Colors[5];
uniform sampler2D e0310Depth;
uniform vec4  e0310Camera;         // x=near y=far z=? w=?
uniform vec2  e0310Resolution;

vec3 zzzNdotv0310(vec3 n, vec3 v, vec3 l, float mr) {
    bool skin = int(4.0 - floor(4.5 * mr)) == int(e0310Skin);

    float vl = pow(pow(dot(v, -l) * -0.5 + 0.5, 2.0), 2.0);
    float z = mix(n.y, 1.0, 0.5) * 0.5 + 0.5;
    z = clamp(skin ? z : z * z, 0.0, 1.0);
    z = z * z * (3.0 - 2.0 * z);

    float vertical = (pow(z, 5.0) * (skin ? -0.5 : 0.1) + (skin ? 1.0 : 0.9)) * z;

    float edge = clamp((1.0 - dot(v, n) - (skin ? 0.75 - 0.5 * 0.0833333358
                                                : 0.5  - 0.5 * 0.0833333358))
                       * (skin ? 5.00000048 : 3.33333325), 0.0, 1.0);
    edge = edge * edge * (3.0 - 2.0 * edge);

    int id = zzzRegion5(mr);
    vec3 sun = e03ParameterColor(e0310Sun[id]);
    if (!skin) sun = vec3(zzzLumShaping(sun));      // 非皮肤先转灰度

    float grey = dot(sun, skin ? vec3(0.330000013) : vec3(0.300000012, 0.600000024, 0.100000001));
    sun = pow(sun, vec3(8.0));
    sun *= grey / (6.10351563e-5 + dot(sun, vec3(0.7)));
    sun = mix(sun, vec3(1.0), pow(vl, 20.0));

    float base = (vl * 0.5 + 0.5) * vertical * (0.949999988 + 0.0500000007) * edge;
    float mean = 0.330000013 * (3.0 * base);
    return vec3(base) * (mean * mean * 0.5 + 1.0) * sun * e03ParameterColor(e0310Colors[id]);
}

// 屏幕空间偏移  [V]
vec2 zzzScreenOffset0310(vec3 vn, float distanceToCamera, float fov, float width) {
    float range = clamp(fov, 0.0, 150.0) / 180.0;
    return vn.xy * (width * 0.0025 * mix(0.5, 0.45, range)
                    * clamp(1.0 / distanceToCamera, 0.0, 1.0) / range);
}

float zzzScreenCompare0310(float d, float od, vec3 n, vec3 l) {
    return clamp((od - d) * dot(n, l) * 2.5, 0.0, 1.0);
}

#endif // ZZZ_RIM_GLSL
