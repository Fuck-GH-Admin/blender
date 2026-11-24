#version 310 es
precision highp float;
precision highp int;
// =============================================================================
// 93_outline.frag — 描边片元
// -----------------------------------------------------------------------------
// 游戏做法：描边色由 **5 区域色** 决定（不是单一颜色），另受引擎全局
// _PostOutlineTint 调制。HoyoToon 的同源设计是 _OutlineColor1..5 +
// _OutlineHue1..5 + _OutlineMaskSource。
//
// contract 实测（爱芮 body）：
//   outline.colours = [[1.0, 0.2167, 0.2167, 1], [1,1,1,1] x4]
//   → region 0 是红色描边，其余白（实际由区域图决定用哪一档）
//   outline.tint    = [1,1,1,1]（_PostOutlineTint，站点原话：
//                     "global engine parameter, not stored in exported data"）
// =============================================================================

#include "00_common.glsl"

in vec2  vUv;
in float vRegion;
in vec3  vNormalW;

uniform vec4  zzzColors[5];
uniform vec4  zzzTint;
uniform float zzzOutlineHue[5];   // 可选色相偏移（HoyoToon 的 _OutlineHue1..5）
uniform float zzzWidth;           // 仅用于诊断可视化

out vec4 fragColor;

void main() {
    int id = zzzRegion5(vRegion);
    vec3 c = zzzColors[id].rgb;

    // 色相偏移（可选）
    float hue = zzzOutlineHue[id];
    if (abs(hue) > 1e-4) {
        vec3 hsv = zzzRgbToHsv(c);
        hsv.x = fract(hsv.x + hue);
        c = zzzHsvToRgb(hsv);
    }

    // 描边色同样吃 _PostOutlineTint
    // contract.lighting.colorContract: "ShaderLab Color -> linear when enabled"
    vec3 col = zzzSrgbDecode(c) * zzzTint.rgb * zzzTint.a;

    fragColor = vec4(col, 1.0);
}
