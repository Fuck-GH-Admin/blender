#version 310 es
precision highp float;
precision highp int;
// =============================================================================
// 92_outline.vert — 描边 pass（反向外扩壳）
// -----------------------------------------------------------------------------
// 渲染状态（与游戏一致）：
//   Cull Front / ZWrite On / Blend Off / Queue Geometry+1
// contract.outline: enabled=true, mode="region-map", width=1, zOffset=0.01,
//                   unityScale=0.01, unityScale 说明宽度以 Unity 米为单位
//
// stride-7 顶点缓冲布局（12 个缓冲实测，共 28,171 顶点）：
//   offset 0..11  : position.xyz
//   offset 12..23 : normal.xyz
//   offset 24..27 : outlineWeight (1 float)
// 运行时硬校验：buffer.length === position.count * 7
// =============================================================================

#define MAX_JOINTS 256

in vec3 aPosition;
in vec3 aNormal;
in vec2 aUv0;
in float aOutlineWeight;    // ← stride-7 的第 7 个 float（预烘焙外扩权重）
in uvec4 aJoints0;
in vec4 aWeights0;

uniform mat4 uModel;
uniform mat4 uViewProj;
uniform mat3 uNormalMatrix;
uniform mat4 uJoints[MAX_JOINTS];

// 描边参数
uniform float zzzUnit;          // 世界单位 / Unity 米（0.01）
uniform float zzzWidth;         // UI: outlineThickness（默认 1，范围 0.25..2.5）
uniform float zzzWidthScale;
uniform float zzzZOffset;       // 默认 0.01

uniform sampler2D zzzRegionMap; // 区域图（与主 pass 同一张）
uniform mat3  zzzRegionUV;
uniform vec2  zzzRegionMapSize;

out vec2  vUv;
out float vRegion;              // 区域值，供片元选色
out vec3  vNormalW;

void main() {
    mat4 skin =
        uJoints[aJoints0.x] * aWeights0.x +
        uJoints[aJoints0.y] * aWeights0.y +
        uJoints[aJoints0.z] * aWeights0.z +
        uJoints[aJoints0.w] * aWeights0.w;

    vec4 posLocal = skin * vec4(aPosition, 1.0);
    vec4 posWorld = uModel * posLocal;
    vec3 nWorld   = normalize(uNormalMatrix * mat3(skin) * aNormal);

    // 外扩：宽度 × 单位换算 × **烘焙权重**（不是统一 1.0）
    float w = zzzWidth * zzzWidthScale * zzzUnit * aOutlineWeight;
    posWorld.xyz += nWorld * w;

    // 区域采样（顶点级即可：描边色按区域分，不需要逐像素）
    vRegion = textureLod(zzzRegionMap,
                         (zzzRegionUV * vec3(aUv0, 1.0)).xy / max(zzzRegionMapSize, vec2(1.0)),
                         0.0).r;
    vUv      = aUv0;
    vNormalW = nWorld;

    vec4 clip = uViewProj * posWorld;
    // Z 偏移：把壳往相机方向压一点，避免描边被自身表面遮住
    clip.z -= zzzZOffset * zzzUnit * clip.w;

    gl_Position = clip;
}
