#version 310 es
precision highp float;
precision highp int;
// =============================================================================
// 94_hair_shadow.vert — 头发投影（stencil caster）
// -----------------------------------------------------------------------------
// 游戏行为（contract 原文）：
//   "Stencil-only hair shadow (no colour in game): reproduced from the original
//    vertex program; marks the face area the face shadow pass darkens"
// 也就是说这遍**不产生颜色**，只把 stencil 写成某个值，
// 后续面部 pass 读到该值就把那块脸压暗。
//
// 顶点属性（[V] 逐字）：
//   attribute float hairShadowR;
//   uniform vec3  hsLight;
//   uniform vec3  hsAxis;
//   uniform vec4  hsParams;   // x=_Length y=_XOffsetNew z=_ZOffset w=_YOffset
//   uniform float hsUnit;     // 每 Unity 米的单位数（0.01）
//
// 【诚实点】contract 把 surface-17 标为 partial，理由：
//   "No verified Unity mesh/UV/normal correspondence"
//   "Material assignment without verified geometry: original vertex colors,
//    recovered tangents and extra UV correspondence remain unavailable"
// 所以这里的投影公式是依据 hsParams 四个分量的命名语义**重建**的 [R]，
// 不是逐字还原。
// =============================================================================

#define MAX_JOINTS 256

in vec3  aPosition;
in vec3  aNormal;
in float aHairShadowR;      // ← 逐顶点阴影强度
in uvec4 aJoints0;
in vec4  aWeights0;

uniform mat4 uModel;
uniform mat4 uViewProj;
uniform mat3 uNormalMatrix;
uniform mat4 uJoints[MAX_JOINTS];

uniform vec3  hsLight;
uniform vec3  hsAxis;
uniform vec4  hsParams;
uniform float hsUnit;

out float vShadow;

void main() {
    mat4 skin =
        uJoints[aJoints0.x] * aWeights0.x +
        uJoints[aJoints0.y] * aWeights0.y +
        uJoints[aJoints0.z] * aWeights0.z +
        uJoints[aJoints0.w] * aWeights0.w;

    vec4 posWorld = uModel * skin * vec4(aPosition, 1.0);
    vec3 nWorld   = normalize(uNormalMatrix * mat3(skin) * aNormal);

    // 沿固定轴推出“假投影体”，位移量与逐顶点强度 aHairShadowR 成正比
    vec3  axis = normalize(hsAxis);
    float len  = hsParams.x * aHairShadowR;

    posWorld.xyz += axis * (len * hsUnit)
                  + vec3(hsParams.y, 0.0, 0.0) * hsUnit
                  + vec3(0.0, hsParams.w, 0.0) * hsUnit
                  + vec3(0.0, 0.0, hsParams.z) * hsUnit;

    // 背光侧不该投影
    vShadow = clamp(dot(nWorld, normalize(hsLight)) * 0.5 + 0.5, 0.0, 1.0) * aHairShadowR;

    gl_Position = uViewProj * posWorld;
}
