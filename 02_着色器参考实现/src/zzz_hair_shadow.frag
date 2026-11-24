#version 310 es
precision highp float;
precision highp int;
// =============================================================================
// 95_hair_shadow.frag — 头发投影片元（stencil 写入）
// -----------------------------------------------------------------------------
// 游戏里这遍没有颜色输出，只做模板写入。
// 下面同时给出两种用法：
//   A) 严格复刻：只写 stencil，discard 掉不需要的区域
//   B) 可视化：输出半透明黑，用来调试“投影到底盖在哪”
// 用 hsDebugVisualise 切换。
// =============================================================================

in float vShadow;

uniform float hsDebugVisualise;   // 0 = 严格 stencil，1 = 可视化
uniform float hsThreshold;

out vec4 fragColor;

void main() {
    // 强度低于阈值直接丢弃，避免把整颗头都算进投影
    if (vShadow < hsThreshold) discard;

    if (hsDebugVisualise > 0.5) {
        // 可视化：越强越黑
        fragColor = vec4(vec3(0.0), clamp(vShadow, 0.0, 1.0) * 0.5);
    } else {
        // 严格模式：不写颜色（由 stencil 状态完成）
        fragColor = vec4(0.0);
    }
}
