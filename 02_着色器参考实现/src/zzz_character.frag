#version 310 es
precision highp float;
precision highp int;
// =============================================================================
// 90_character.frag — 角色主着色 合成骨架
// -----------------------------------------------------------------------------
// 【重要】这个文件是**合成层**，不是从站点逐字还原的代码。
//
// 站点把主 pass 的拼装逻辑分散在多个 JS 模板串里（我提取到的 71 段里有若干
// 以 `}` 或 `${...}` 插值结尾的片段，无法还原出单一完整的 main 函数）。
// 因此本文件的职责是：
//   1) 把前面各模块里 [V] 逐字还原的函数按**合理的顺序**调用起来
//   2) 把 contract.json 的材质参数接到对应槽位
//   3) 把不确定的地方显式标注出来，而不是假装确定
//
// 标注约定见 00_common.glsl 顶部（[V] / [R] / [I]）。
//
// 与游戏真实差异的已知缺口（详见 PROVENANCE.md）：
//   * rim 在游戏里写到**第二个 render target**，由未导出的 pass 合成；
//     真正的叠加方式不可知，这里按“tone mapping 之前相加”处理。
//   * 面部 SDF 的查询坐标系是社区反推的，不是游戏的 Nap globals。
//   * 头发投影在游戏里**不输出颜色**，只写 stencil；这里仅保留强度可视化。
//   * GI（e038）在 contract 里是 unavailable，未实现。
// =============================================================================

#include "00_common.glsl"
#include "10_ramp.glsl"
#include "20_matcap.glsl"
#include "30_specular.glsl"
#include "40_rim.glsl"
#include "50_emission.glsl"
#include "60_face_sdf.glsl"

// -----------------------------------------------------------------------------
// 顶点传入（由 .vert 提供）
// -----------------------------------------------------------------------------
in vec3 vNormalW;        // 世界法线
in vec3 vTangentW;       // 世界切线（法线贴图重建用）
in vec2 vUv0;            // TEXCOORD_0
in vec2 vUv2;            // 光照图 UV（游戏 UV2）
in vec2 vUv3;            // 面部 UV（游戏 UV3，TEXCOORD3）
in vec4 vColor0;         // COLOR_0
in vec4 vColor1;         // COLOR_1（srgb-to-linear-byte）
in vec3 vPosW;

in vec3 vCamPosW;

// -----------------------------------------------------------------------------
// 贴图
//   contract.resources.kind 语义（已实测）：
//     D = 漫反射         → _MainTex
//     N = 法线           → _LightTex（RG 重建）
//     M = 打包数据       → _OtherDataTex   (R=材质ID, G=金属度, B=高光遮罩)
//     A = 打包数据       → _OtherDataTex2  (R=透明, G=平滑度, B=自发光遮罩)
//     C = MatCap         → _MatCapTex2..5
//     F = 面部 SDF       → 面部 _LightTex
//     E = 眼部 LUT       → _EyeColorMap (16x16)
// -----------------------------------------------------------------------------
uniform sampler2D _MainTex;      // D
uniform sampler2D _LightTex;     // N / F
uniform sampler2D _OtherDataTex; // M
uniform sampler2D _OtherDataTex2;// A
uniform sampler2D _MatCapTex2, _MatCapTex3, _MatCapTex4, _MatCapTex5;

uniform float _BumpScale;        // contract.baseBinding.bumpScale，默认 1
uniform float _Smoothness;       // contract.lighting.smoothness，默认 0.05
uniform float _AlbedoSmoothness;
uniform int   _MaterialType;     // 0=Base 1=Face 2=Eye 3=Shadow 4=Hair 5=EyeHighlight 6=EyeShadow
uniform float _OutlineEnabled;
uniform vec3  _ShadowTintFadeByZ;
uniform float _FadeByZDistance;  // 站点: "returns to original color beyond ~2.3 m"

out vec4 fragColor;

// -----------------------------------------------------------------------------
// 法线贴图 RG 重建  [R]
// contract.normalRG.convention 原文：
//   "RG reconstruction is the existing shared community adaptation,
//    not visual approval"
// 即：游戏的 _LightTex 只存 RG 两通道，B 是重建出来的。
// -----------------------------------------------------------------------------
vec3 zzzReconstructNormal(vec2 rg, vec3 nW, vec3 tW, float bumpScale) {
    vec2 xy = rg * 2.0 - 1.0;
    xy *= bumpScale;
    float z = sqrt(max(1.0 - dot(xy, xy), 0.0));
    vec3 nT = normalize(vec3(xy, z));
    vec3 bW = normalize(cross(nW, tW));
    mat3 tbn = mat3(normalize(tW), bW, normalize(nW));
    return normalize(tbn * nT);
}

// -----------------------------------------------------------------------------
// 主入口
// -----------------------------------------------------------------------------
void main() {
    // ---------------- 输入整理 ----------------
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vCamPosW - vPosW);
    vec3 L = normalize(e02Light);            // [I] e02Light 为视图/世界空间主光向
    float dist = length(vCamPosW - vPosW);

    e021IsSkin = (abs(float(_MaterialType) - float(e021SkinMatId)) < 0.5);

    // ---------------- 贴图采样 ----------------
    vec3 albedo = texture(_MainTex, vUv0).rgb;
    vec4 lightTex = texture(_LightTex, vUv0);
    vec4 otherM   = texture(_OtherDataTex, vUv0);   // R=材质ID G=金属度 B=高光遮罩
    vec4 otherA   = texture(_OtherDataTex2, vUv0);  // R=透明  G=平滑度 B=自发光遮罩

    // 区域图：身体/头发取 _OtherDataTex.r（材质 ID），面部取 _LightTex.r（SDF）
    float regionValue = (_MaterialType == 1 || _MaterialType == 2) ? lightTex.r : otherM.r;
    int   region      = zzzRegion5(regionValue);

    // 法线：身体/头发用 _LightTex 的 RG；面部/眼睛不用法线贴图
    if (_MaterialType == 0 || _MaterialType == 4) {
        vec3 nBumped = zzzReconstructNormal(lightTex.rg, N, vTangentW, _BumpScale);
        N = nBumped;
    }

    // ---------------- 光照 ----------------
    float nl = dot(N, L);
    float nl01 = nl * 0.5 + 0.5;

    // [I] toonShadowIntensity 由调用方塞进 e021A.x（站点默认 0.72）
    float shade = zzzToonShade(nl, e021A.x);

    // ---------------- 面部（SDF）与身体（色阶）分路 ----------------
    vec3 color;
    if (_MaterialType == 1) {
        // 面部：SDF 阴影 + 下巴 AO，皮肤保留原色（不做暗部塑形）
        float sdf = zzzFaceSdfShadow(N, V, L, vUv3);
        float chinAO = zzzFaceChinAO(vUv3);
        color = albedo * mix(zzzShadowColor(region), vec3(1.0), sdf);
        color *= mix(1.0, chinAO, 0.35);
        color += albedo * zzzFaceHighlight(vUv3) * 0.15;
    } else {
        bool hair = (_MaterialType == 4);
        color = zzzRamp(albedo, nl01, region, shade, hair);
    }

    // ---------------- MatCap 分层 ----------------
    // contract: 爱芮的 body surface 启用 regions 2/3/4
    if (e03Enabled > 0.5) {
        // [I] 球面 UV：用视空间法线投影，站点用 e03UVTransforms 做每层变换
        vec3 nV = normalize((vec4(N, 0.0)).xyz);
        vec2 capUv = nV.xy * 0.5 + 0.5;

        vec2 gx = dFdx(capUv), gy = dFdy(capUv);   // 一致控制流，供 textureGrad 用
        for (int i = 0; i < 5; ++i) {
            if (i == 0 || i == 1) continue;         // 爱芮 regions 0/1 未启用
            vec4 texel = e03Sample(i, e03UVTransforms[i].xy * capUv
                                        + e03UVTransforms[i].zw, gx, gy);
            color = e03Matcap(color, texel, e03TintAlpha[i], i);
        }
    }

    // ---------------- 塑形高光 ----------------
    color += e03ShapedHighlight(N, V, L, albedo, otherM.rgb, shade, region);

    // ---------------- 边缘光 ----------------
    if (e021RimEnabled > 0.5) {
        vec3 rim = zzzTranscribedRim(N, V, L, otherM.r, otherM.g, albedo,
                                     color, shade, dist);
        color += rim;      // ← 已知不可还原点，见文件头
    }

    // ---------------- 区域自发光 ----------------
    if (_MaterialType == 0 || _MaterialType == 4) {
        color = zzzEmissionFiltered(color, vUv2, vUv0);
    }

    // ---------------- 阴影色随距离恢复 ----------------
    if (e021FadeByZ > 0.5) {
        float t = clamp(dist / max(_FadeByZDistance, 1e-3), 0.0, 1.0);
        color = mix(color, color * _ShadowTintFadeByZ, t);
    }

    // ---------------- 输出 ----------------
    // [V] 部分材质是 BLEND（alphaMode=BLEND），透明来自 _OtherDataTex2.r
    float alpha = (_MaterialType == 4) ? otherA.r : 1.0;
    fragColor = vec4(color, alpha);
}
