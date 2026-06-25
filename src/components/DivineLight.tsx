// ═══════════════════════════════════════════════════════════════
//  Divine Light — a WebGL altarpiece behind the whole Sanctuary.
//  God-rays from on high, gold aurora curtains, drifting motes of
//  incense and dust, over warm vellum and a hem of red velvet.
//  "God is light, and in Him is no darkness at all." — 1 John 1:5
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_res;

// hash + value noise + fbm
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0));
  float d = hash(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v = 0.0; float amp = 0.5;
  for(int i=0;i<5;i++){ v += amp*noise(p); p *= 2.03; amp *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = (gl_FragCoord.xy - 0.5*u_res.xy) / u_res.y;
  float t = u_time * 0.05;

  // palette
  vec3 vellum   = vec3(0.965, 0.918, 0.835);
  vec3 gold     = vec3(0.86, 0.66, 0.22);
  vec3 goldHot  = vec3(1.0, 0.88, 0.52);
  vec3 velvet   = vec3(0.30, 0.04, 0.07);

  vec3 col = vellum;

  // soft warm glow descending from on high (top-center)
  vec2 src = vec2(0.0, 0.95);
  float d = distance(p, src);
  float halo = exp(-d*1.05);
  col = mix(col, goldHot, halo*0.55);

  // crepuscular god-rays: angular streaks from the source
  vec2 dir = p - src;
  float ang = atan(dir.x, -dir.y);
  float rays = fbm(vec2(ang*6.0, length(dir)*2.2 - t*1.2));
  rays = pow(rays, 2.0);
  float rayMask = smoothstep(1.4, 0.1, d);
  col += gold * rays * rayMask * 0.30;

  // gold aurora curtains drifting (domain-warped fbm)
  vec2 q = vec2(fbm(p*1.5 + vec2(0.0, t)), fbm(p*1.5 + vec2(5.2, -t)));
  float curtain = fbm(p*2.2 + q*1.8 + vec2(t*0.6, 0.0));
  curtain = smoothstep(0.55, 0.95, curtain);
  col = mix(col, goldHot, curtain * 0.22 * smoothstep(-0.2, 0.9, p.y));

  // hem of red velvet along the lower edge and corners
  float hem = smoothstep(0.35, -0.55, p.y);
  col = mix(col, velvet, hem * 0.5);
  float corner = smoothstep(0.9, 0.2, length(p - vec2(-0.9,-0.7))) + smoothstep(0.9, 0.2, length(p - vec2(0.9,-0.7)));
  col = mix(col, velvet, clamp(corner,0.0,1.0)*0.25);

  // floating motes of light (dust / incense)
  float motes = 0.0;
  for(int i=0;i<3;i++){
    float fi = float(i);
    vec2 gp = p*vec2(8.0+fi*3.0, 8.0+fi*3.0);
    gp.y += t*(2.0+fi);
    vec2 cell = floor(gp);
    float h = hash(cell+fi*13.7);
    vec2 f = fract(gp)-0.5;
    float m = smoothstep(0.06, 0.0, length(f)) * step(0.93, h);
    motes += m * (0.6+0.4*sin(u_time*2.0+h*30.0));
  }
  col += goldHot * motes * 0.5;

  // gentle vignette + grain
  float vig = smoothstep(1.4, 0.2, length(p));
  col *= 0.85 + 0.15*vig;
  col += (hash(uv+fract(u_time))-0.5)*0.012;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("shader error:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function DivineLight() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_res");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const drawFrame = (tSec: number) => {
      gl.uniform1f(uTime, tSec);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const resize = () => {
      const w = Math.max(1, Math.floor(window.innerWidth * dpr));
      const h = Math.max(1, Math.floor(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        drawFrame((performance.now() - start) / 1000); // keep a full-size frame even if RAF is throttled
      }
    };

    let raf = 0;
    const start = performance.now();
    let running = true;
    const render = () => {
      if (!running) return;
      resize();
      drawFrame((performance.now() - start) / 1000);
      raf = requestAnimationFrame(render);
    };
    // defer initial sizing until after layout settles, then animate
    resize();
    requestAnimationFrame(() => { resize(); render(); });

    window.addEventListener("resize", resize);
    const onVis = () => {
      running = !document.hidden;
      if (running) render();
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={ref} className="divine-bg" aria-hidden="true" style={{ width: "100vw", height: "100vh" }} />;
}
