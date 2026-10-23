// Software rasterizers: ANGLE's SwiftShader, Mesa's llvmpipe/softpipe, the Windows fallback driver
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i;

// Whether the browser is rendering with a real GPU. Without one, WebGL runs on the CPU and every
// animation is composited in software. Also false without WebGL2, which three.js requires.
export function hasHardwareGpu() {
  let gl: WebGL2RenderingContext | null = null;
  try {
    // Asks the browser for no context at all rather than a software-emulated one
    gl = document
      .createElement('canvas')
      .getContext('webgl2', { failIfMajorPerformanceCaveat: true });
  } catch {}
  if (!gl) return false;

  // Firefox and Safari report the real renderer here; Chrome reports a generic name and needs
  // the debug extension, which Firefox warns is deprecated if it's requested there
  let renderer = String(gl.getParameter(gl.RENDERER));
  if (/^webkit webgl$/i.test(renderer)) {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    if (info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
  }
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return !SOFTWARE_RENDERER.test(renderer);
}
