#version 310 es
precision highp float;
precision highp int;
// =============================================================================
// 91_character.vert — 角色主 pass 顶点阶段
// -----------------------------------------------------------------------------
// 职责：
//   1) 蒙皮（游戏骨架 270 joints；contract: skin "Bone_Root"，IBM 中位缩放 100）
//   2) 输出 COLOR_0 / COLOR_1 / UV0 / UV2(光照图) / UV3(面部)
//   3) Y-up 转换
//
// 注意 contract 里记录的两条实测事实：
//   * 根节点 `Avatar_Female_Size01_AriaIdol_Model` scale = 0.01，rot = X+90°
//   * `geometry.transform = {axes:[0,2,1], signs:[-1,1,-1], order:[2,1,0], flipV:true}`
//     → UV 的 V 是翻转的，采样时必须处理
// =============================================================================

#define MAX_JOINTS 256

in vec3 aPosition;
in vec3 aNormal;
in vec4 aTangent;      // xyz=切线, w=手性
in vec2 aUv0;
in vec2 aUv2;          // 光照图 UV（游戏 UV2，非零顶点 21,413/35,865）
in vec2 aUv3;          // 面部 UV（游戏 UV3 / TEXCOORD3，非零顶点 6,314/35,865）
in vec4 aColor0;       // COLOR_0
in vec4 aColor1;       // COLOR_1（srgb-to-linear-byte）
in uvec4 aJoints0;
in vec4 aWeights0;

uniform mat4 uModel;
uniform mat4 uViewProj;
uniform mat3 uNormalMatrix;
uniform mat4 uJoints[MAX_JOINTS];

out vec3 vNormalW;
out vec3 vTangentW;
out vec2 vUv0;
out vec2 vUv2;
out vec2 vUv3;
out vec4 vColor0;
out vec4 vColor1;
out vec3 vPosW;
out vec3 vCamPosW;

uniform vec3 uCamPos;

void main() {
    // ---------------- 蒙皮 ----------------
    mat4 skin =
        uJoints[aJoints0.x] * aWeights0.x +
        uJoints[aJoints0.y] * aWeights0.y +
        uJoints[aJoints0.z] * aWeights0.z +
        uJoints[aJoints0.w] * aWeights0.w;

    vec4 posLocal = skin * vec4(aPosition, 1.0);
    vec4 posWorld = uModel * posLocal;

    vPosW    = posWorld.xyz;
    vCamPosW = uCamPos;
    vNormalW  = normalize(uNormalMatrix * mat3(skin) * aNormal);
    vTangentW = normalize(uNormalMatrix * mat3(skin) * aTangent.xyz);

    // ---------------- UV ----------------
    // contract: flipV = true —— 贴图导出自 Unity（V 向上），WebGL（V 向下）
    vUv0 = vec2(aUv0.x, 1.0 - aUv0.y);
    vUv2 = aUv2;                 // 光照图 UV 不做翻转（图集已按游戏坐标烘焙）
    vUv3 = aUv3;                 // 面部 UV 同理

    // ---------------- 顶点属性 ----------------
    vColor0 = aColor0;
    vColor1 = aColor1;

    gl_Position = uViewProj * posWorld;
}
