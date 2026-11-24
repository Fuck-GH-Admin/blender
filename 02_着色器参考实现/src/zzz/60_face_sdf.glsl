// =============================================================================
// 60_face_sdf.glsl — 面部 SDF 着色（mode e021b）
// -----------------------------------------------------------------------------
// 这是 MMD 完全无法复刻的一块，也是“脸好不好看”的决定因素。
//
// 【最大诚实点】contract 明确写了面部这块是社区适配、不是游戏原始实现：
//   capabilities.sdf.state = "bound"
//   faceProfile.frameProvenance =
//     "Community SDF adaptation: anatomical eye pair + head/parent bind matrices,
//      corroborated by face normals; not captured Nap globals"
//   法线对齐度 normalAlignment = 0.9878600890989083
// 也就是说：SDF 贴图本身是真的（F 类 256×256），但“用什么坐标系去查它”
// 是社区反推的（用左右眼骨骼 + 头骨绑定矩阵构造，而非游戏的 Nap globals）。
//
// 依赖的顶点数据（contract 全部已验证）：
//   TEXCOORD3 (uv3) —— 面部专用 UV，160 个 float 已逐值与原始 Mesh 比对
//   color_1         —— srgb-to-linear-byte，maxByteError 0.1
//   头骨 forward/right 帧（Bip001_Head + parent Bip001_Neck）
// =============================================================================
#ifndef ZZZ_FACE_SDF_GLSL
#define ZZZ_FACE_SDF_GLSL

#include "00_common.glsl"
#include "10_ramp.glsl"   // 复用 e021RegionMap / e021UVTransform

// e021RegionMap (F 类贴图 _LightTex) 与 e021UVTransform 已在 10_ramp.glsl 声明
uniform vec3  e021HeadForward;        // 头骨前向（世界空间）
uniform vec3  e021HeadRight;          // 头骨右向（世界空间）
uniform float e021FaceEnabled;
uniform vec3  e021FaceSmooth;
uniform float e021FaceEye;

in float vFaceRegion;            // 来自 color_1
in float vFaceMask;
in float vFaceColorA;
in vec3  vFaceUv3;               // TEXCOORD3

// -----------------------------------------------------------------------------
// 头顶朝向对 SDF 的偏移  [R]
// SDF 是“正面视角”下的阴影形状；头一歪就必须按头顶朝向重新投影，
// 否则转头时脸部阴影不会跟着走（这是 SDF 方案最典型的穿帮点）。
// 这里用头骨前/右向构造一个 2D 偏移，参数语义来自 contract.faceProfile。
// -----------------------------------------------------------------------------
vec2 zzzFaceSdfOffset(vec3 Nw, vec3 Vw) {
    // 把世界方向投到头骨的 (right, forward) 平面上
    vec2 dir = vec2(dot(Vw, e021HeadRight), dot(Vw, e021HeadForward));
    float len = length(dir);
    if (len < 1e-5) return vec2(0.0);
    return dir / len;
}

// -----------------------------------------------------------------------------
// SDF 阴影取值  [R]
// 面部贴图通道语义（来自 HoyoToon 官方 help 文本，可交叉验证）：
//   R = SDF（面部阴影阈值图）
//   G = 脸颊/鼻高光
//   B = 描边阈值（1.7 后移入顶点色）
//   A = 下巴下 AO
// -----------------------------------------------------------------------------
float zzzFaceSdfShadow(vec3 Nw, vec3 Vw, vec3 Lw, vec2 uv3) {
    if (e021FaceEnabled < 0.5) return 1.0;

    // 光方向在面部平面里的投影 → 决定 SDF 图里取哪一列
    vec3 Lp = normalize(vec3(dot(Lw, e021HeadRight),
                             dot(Lw, e021HeadForward),
                             dot(Lw, vec3(0.0, 1.0, 0.0)) + 1e-4));
    float sdfU = Lp.x * 0.5 + 0.5;

    vec4 sdf = texture(e021RegionMap, vec2(sdfU, uv3.y));
    // R 通道就是阈值图；与当前 NdotL 比较得到软阴影
    float nl = dot(Nw, Lw) * 0.5 + 0.5;
    float soft = max(e021FaceSmooth.x, 1e-4);
    return smoothstep(sdf.r - soft, sdf.r + soft, nl);
}

// 脸颊/鼻高光（G 通道）  [R]
float zzzFaceHighlight(vec2 uv3) {
    return texture(e021RegionMap, uv3).g;
}

// 下巴下 AO（A 通道）  [R]
float zzzFaceChinAO(vec2 uv3) {
    return texture(e021RegionMap, uv3).a;
}

#endif // ZZZ_FACE_SDF_GLSL
