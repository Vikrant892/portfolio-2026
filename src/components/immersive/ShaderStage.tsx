import { useEffect, useRef } from "react";

type Palette = {
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  energy: number;
  scale: number;
};

const PALETTES: Palette[] = [
  {
    a: [0.24, 0.3, 0.4],
    b: [0.52, 0.66, 0.88],
    c: [0.36, 0.72, 1],
    energy: 0.62,
    scale: 0.92,
  },
  {
    a: [0.4, 0.18, 0.34],
    b: [0.9, 0.38, 0.72],
    c: [0.55, 0.4, 1],
    energy: 0.74,
    scale: 1.12,
  },
  {
    a: [0.12, 0.42, 0.38],
    b: [0.28, 0.92, 0.84],
    c: [0.06, 0.48, 0.65],
    energy: 0.7,
    scale: 1.02,
  },
  {
    a: [0.45, 0.28, 0.1],
    b: [1, 0.64, 0.2],
    c: [0.99, 0.25, 0.12],
    energy: 0.76,
    scale: 0.95,
  },
  {
    a: [0.16, 0.26, 0.46],
    b: [0.34, 0.59, 1],
    c: [0.64, 0.26, 1],
    energy: 0.66,
    scale: 1.28,
  },
  {
    a: [0.33, 0.36, 0.3],
    b: [0.76, 0.82, 0.67],
    c: [0.48, 0.67, 0.5],
    energy: 0.56,
    scale: 0.82,
  },
];

const VERTEX = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main(){
  v_uv = a_position * .5 + .5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
#define OCT 5
#define WARP2 1
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_scroll;
uniform float u_velocity;
uniform float u_energy;
uniform float u_scale;
uniform float u_chaos;
uniform vec3 u_a;
uniform vec3 u_b;
uniform vec3 u_c;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.0; float amp=.5;
  mat2 r=mat2(.80,-.60,.60,.80);
  for(int i=0;i<OCT;i++){ v += amp*noise(p); p=r*p*2.03+11.7; amp*=.5; }
  return v;
}

void main(){
  vec2 uv=v_uv;
  vec2 p=(uv-.5)*vec2(u_resolution.x/u_resolution.y,1.0);
  vec2 m=(u_pointer-.5)*vec2(u_resolution.x/u_resolution.y,1.0);
  float t=u_time*.055;
  float vel=clamp(abs(u_velocity)*.012,0.0,1.0);

  float pointerGlow=exp(-4.2*length(p-m));
  vec2 q=vec2(
    fbm(p*u_scale + vec2(t, -t*.51)),
    fbm(p*u_scale + vec2(-t*.38, t*.72)+3.1)
  );
#if WARP2
  vec2 r=vec2(
    fbm(p*u_scale + 3.2*q + vec2(1.7,-4.2) + t*.28),
    fbm(p*u_scale + 2.9*q + vec2(8.3,2.8) - t*.18)
  );
#else
  vec2 r=q.yx + vec2(.32*sin(t*.53 + q.x*4.0), .26*cos(t*.41 + q.y*4.0));
#endif

  float warp=fbm(p*(1.22+u_chaos*.38)*u_scale + (4.8+u_chaos*1.6)*r);
  float folds=sin((p.x*.72+p.y*.19+warp*1.45+r.x*.78+u_scroll*.00022)*7.0);
  folds=.5+.5*folds;
  folds=smoothstep(.34,.72,folds);

  float field=mix(q.x,r.y,.58)+warp*.57;
  field += pointerGlow*(.12+.16*u_chaos);
  field += vel*.07;

  vec3 color=mix(u_a,u_b,smoothstep(.06,.66,field));
  color=mix(color,u_c,folds*(.38+.30*u_energy));
  color += u_c*pointerGlow*.11*u_energy;

  float vignette=smoothstep(1.10,.14,length(p*.72));
  color*=.70+.42*vignette;

  float grain=(hash(gl_FragCoord.xy+fract(u_time)*100.0)-.5)*.018;
  color += grain;
  color=pow(max(color,0.0),vec3(.96));
  outColor=vec4(color,1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Shader allocation failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation failed");
  }
  return shader;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Fullscreen WebGL fluid background. Runs as its own island: watches the
 * static [data-scene] sections for palette switching and listens for the
 * AMPLIFY SIGNAL toggle via the "ih:chaos" window event.
 *
 * prefers-reduced-motion renders a single static frame (no animation loop),
 * re-rendered only when the scene palette or chaos state changes.
 */
export default function ShaderStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("ih-active");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", "#050608");

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      canvas.classList.add("shader-fallback");
      return () => {
        document.documentElement.classList.remove("ih-active");
      };
    }

    const rendererInfo = (() => {
      try {
        const ext = gl.getExtension("WEBGL_debug_renderer_info");
        return String(
          ext
            ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)
            : gl.getParameter(gl.RENDERER),
        );
      } catch {
        return "";
      }
    })();
    const forcedPerf = new URLSearchParams(window.location.search).get("perf");
    const softwareGpu =
      forcedPerf === "low" ||
      (forcedPerf !== "high" &&
        /basic render|swiftshader|llvmpipe|software/i.test(rendererInfo));
    const MIN_PIXEL_BUDGET = 280_000;
    let pixelBudget = softwareGpu ? 520_000 : 3_400_000;

    if (softwareGpu) document.documentElement.classList.add("ih-lowpower");

    const fragmentSource = softwareGpu
      ? FRAGMENT.replace("#define OCT 5", "#define OCT 3").replace(
          "#define WARP2 1",
          "#define WARP2 0",
        )
      : FRAGMENT;

    const program = gl.createProgram();
    if (!program) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const position = gl.getAttribLocation(program, "a_position");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const loc = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      resolution: loc("u_resolution"),
      pointer: loc("u_pointer"),
      time: loc("u_time"),
      scroll: loc("u_scroll"),
      velocity: loc("u_velocity"),
      energy: loc("u_energy"),
      scale: loc("u_scale"),
      chaos: loc("u_chaos"),
      a: loc("u_a"),
      b: loc("u_b"),
      c: loc("u_c"),
    };

    let scene = 0;
    let chaos = false;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let targetX = 0.5;
    let targetY = 0.5;
    let previousScroll = window.scrollY;
    let velocity = 0;
    const basePalette = PALETTES[0] as Palette;
    const palette = {
      ...basePalette,
      a: [...basePalette.a] as [number, number, number],
      b: [...basePalette.b] as [number, number, number],
      c: [...basePalette.c] as [number, number, number],
    };
    let raf = 0;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const resize = () => {
      const mobile = window.innerWidth < 760;
      const capped = Math.min(window.devicePixelRatio || 1, mobile ? 1.1 : 1.5);
      const area = Math.max(1, window.innerWidth * window.innerHeight);
      const dpr = Math.min(capped, Math.sqrt(pixelBudget / area));
      const w = Math.max(320, Math.floor(window.innerWidth * dpr));
      const h = Math.max(180, Math.floor(window.innerHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const move = (e: PointerEvent) => {
      targetX = e.clientX / window.innerWidth;
      targetY = 1 - e.clientY / window.innerHeight;
    };

    const onChaos = (event: Event) => {
      chaos = Boolean((event as CustomEvent).detail);
      if (reduced) drawFrame(performance.now(), 1);
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("ih:chaos", onChaos);
    resize();

    // Palette follows whichever static section is dominant in the viewport.
    const sections = [
      ...document.querySelectorAll<HTMLElement>("[data-scene]"),
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          scene = Number((visible.target as HTMLElement).dataset.scene || 0);
          visible.target.classList.add("is-inview");
          if (reduced) {
            snapPalette();
            drawFrame(performance.now(), 1);
          }
        }
      },
      { threshold: [0.18, 0.4, 0.68], rootMargin: "-8% 0px -8% 0px" },
    );
    sections.forEach((section) => observer.observe(section));

    const snapPalette = () => {
      const target = PALETTES[scene % PALETTES.length] ?? basePalette;
      for (let i = 0; i < 3; i++) {
        palette.a[i] = target.a[i] ?? 0;
        palette.b[i] = target.b[i] ?? 0;
        palette.c[i] = target.c[i] ?? 0;
      }
      palette.energy = target.energy;
      palette.scale = target.scale;
    };

    const start = performance.now();
    const drawFrame = (now: number, smoothOverride?: number) => {
      const target = PALETTES[scene % PALETTES.length] ?? basePalette;
      const smooth = smoothOverride ?? 0.07;

      for (let i = 0; i < 3; i++) {
        palette.a[i] = lerp(palette.a[i] ?? 0, target.a[i] ?? 0, smooth);
        palette.b[i] = lerp(palette.b[i] ?? 0, target.b[i] ?? 0, smooth);
        palette.c[i] = lerp(palette.c[i] ?? 0, target.c[i] ?? 0, smooth);
      }
      palette.energy = lerp(palette.energy, target.energy, smooth);
      palette.scale = lerp(palette.scale, target.scale, smooth);
      pointerX = lerp(pointerX, targetX, 0.035);
      pointerY = lerp(pointerY, targetY, 0.035);

      const sy = window.scrollY;
      velocity = lerp(velocity, sy - previousScroll, 0.1);
      previousScroll = sy;

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.pointer, pointerX, pointerY);
      gl.uniform1f(uniforms.time, (now - start) / 1000);
      gl.uniform1f(uniforms.scroll, sy);
      gl.uniform1f(uniforms.velocity, velocity);
      gl.uniform1f(uniforms.energy, palette.energy);
      gl.uniform1f(uniforms.scale, palette.scale);
      gl.uniform1f(uniforms.chaos, chaos ? 1 : 0);
      gl.uniform3fv(uniforms.a, palette.a);
      gl.uniform3fv(uniforms.b, palette.b);
      gl.uniform3fv(uniforms.c, palette.c);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    let lastFrame = start;
    let frameCount = 0;
    let frameAccum = 0;
    let frameSamples = 0;
    let skipToggle = false;

    const renderLoop = (now: number) => {
      if (softwareGpu) {
        skipToggle = !skipToggle;
        if (skipToggle) {
          raf = requestAnimationFrame(renderLoop);
          return;
        }
      }

      const dt = now - lastFrame;
      lastFrame = now;
      frameCount++;
      if (frameCount > 10 && dt < 2000) {
        frameAccum += dt;
        frameSamples++;
        if (frameSamples >= 12) {
          const avg = frameAccum / frameSamples;
          frameAccum = 0;
          frameSamples = 0;
          if (avg > (softwareGpu ? 80 : 45) && pixelBudget > MIN_PIXEL_BUDGET) {
            const factor = avg > 160 ? 0.4 : 0.6;
            pixelBudget = Math.max(MIN_PIXEL_BUDGET, pixelBudget * factor);
            resize();
          }
        }
      }

      drawFrame(now);
      raf = requestAnimationFrame(renderLoop);
    };

    if (reduced) {
      // Static frame for reduced motion: draw once, redraw only on
      // scene/chaos changes (handled above), never loop.
      snapPalette();
      drawFrame(performance.now(), 1);
    } else {
      renderLoop(performance.now());
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("ih:chaos", onChaos);
      document.documentElement.classList.remove("ih-active");
      document.documentElement.classList.remove("ih-lowpower");
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className="ih-shader" aria-hidden="true" />;
}
