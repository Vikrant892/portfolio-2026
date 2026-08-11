import { useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/data/projects";
import portraitImg from "@/assets/portrait.jpg";
import certAws from "@/assets/certs/aws-data-engineer-associate.png";
import certOci from "@/assets/certs/oracle.png";
import certNasa from "@/assets/certs/tot-02.png";
import certConf from "@/assets/certs/tot-01.png";
import certTcs from "@/assets/certs/tot-14.png";
import certBackend from "@/assets/certs/tot-12.png";

type BlogPost = {
  title: string;
  link: string;
  pubDate: string;
};

type Palette = {
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  energy: number;
  scale: number;
};

type CapabilityKey = "ml" | "data" | "security" | "delivery";

const PALETTES: Palette[] = [
  {
    a: [0.24, 0.3, 0.4],
    b: [0.52, 0.66, 0.88],
    c: [0.36, 0.72, 1.0],
    energy: 0.62,
    scale: 0.92,
  },
  {
    a: [0.4, 0.18, 0.34],
    b: [0.9, 0.38, 0.72],
    c: [0.55, 0.4, 1.0],
    energy: 0.74,
    scale: 1.12,
  },
  {
    a: [0.12, 0.42, 0.38],
    b: [0.28, 0.92, 0.84],
    c: [0.08, 0.5, 0.66],
    energy: 0.7,
    scale: 1.02,
  },
  {
    a: [0.45, 0.28, 0.1],
    b: [1.0, 0.64, 0.2],
    c: [0.98, 0.26, 0.13],
    energy: 0.76,
    scale: 0.95,
  },
  {
    a: [0.16, 0.26, 0.46],
    b: [0.35, 0.58, 1.0],
    c: [0.63, 0.27, 1.0],
    energy: 0.66,
    scale: 1.28,
  },
  {
    a: [0.33, 0.36, 0.3],
    b: [0.74, 0.8, 0.66],
    c: [0.48, 0.66, 0.5],
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
  color*=.80+.34*vignette;

  float grain=(hash(gl_FragCoord.xy+fract(u_time)*100.0)-.5)*.018;
  color += grain;
  color=pow(max(color,0.0),vec3(.96));
  outColor=vec4(color,1.0);
}`;

const capabilities: Record<
  CapabilityKey,
  {
    n: string;
    title: string;
    desc: string;
    evidence: string;
    tools: string[];
  }
> = {
  ml: {
    n: "01",
    title: "Threat Detection ML",
    desc: "Anomaly detection, imbalanced classification and ensemble models for security data, with alerts mapped back to MITRE ATT&CK where the project calls for it.",
    evidence:
      "Evidence: Hybrid ML Intrusion Detection and Credit Card Fraud Detection.",
    tools: ["Python", "PyTorch", "scikit-learn", "XGBoost", "SMOTE"],
  },
  data: {
    n: "02",
    title: "Data Engineering",
    desc: "Dimensional modelling, ETL pipelines and warehouse work on AWS Redshift and Snowflake, plus layered Postgres/dbt systems in public projects.",
    evidence:
      "Evidence: Data Engineer at Nagarro and StudentOps Data Platform.",
    tools: ["SQL", "Snowflake", "Redshift", "Postgres", "dbt", "Prefect"],
  },
  security: {
    n: "03",
    title: "Security Operations",
    desc: "SIEM monitoring, alert triage, OWASP testing and compliance work against ISO 27001 and NIST CSF. Detection work is grounded in operational security, not only model metrics.",
    evidence:
      "Evidence: seven months as Cybersecurity Junior Analyst at AT SecurDI.",
    tools: ["SIEM", "Wireshark", "Suricata", "OWASP", "NIST CSF"],
  },
  delivery: {
    n: "04",
    title: "Production Delivery",
    desc: "APIs, dashboards, containers and deployment pipelines that put systems in front of real users instead of leaving them in notebooks.",
    evidence:
      "Evidence: seven public deployments, all with source available from the portfolio.",
    tools: ["FastAPI", "Flask", "Docker", "Cloudflare", "GitHub Actions"],
  },
};

const certs = [
  {
    img: certAws,
    title: "AWS Certified Data Engineer – Associate",
    issuer: "Amazon Web Services · 2026",
  },
  {
    img: certOci,
    title: "OCI Data Science Professional",
    issuer: "Oracle · 2025",
  },
  {
    img: certNasa,
    title: "NASA Galactic Problem Solver",
    issuer: "NASA Space Apps Challenge · 2023",
  },
  {
    img: certConf,
    title: "icSoftComp Intl. Conference",
    issuer: "Springer and CHARUSAT · 2022",
  },
  {
    img: certTcs,
    title: "TCS iON Career Edge",
    issuer: "Tata Consultancy Services · 2023",
  },
  {
    img: certBackend,
    title: "Backend Web Dev, Express and Node",
    issuer: "DevTown, GDSC KIIT, AWS CB · 2023",
  },
];

const experience = [
  {
    period: "Aug 2026—Present",
    role: "Industry Placement",
    org: "Voxon",
    location: "Adelaide, Australia",
    body: "Working on AI capabilities in VoxelOS as part of the Master's industry placement.",
  },
  {
    period: "Dec 2024—Feb 2025",
    role: "Data Engineering Intern",
    org: "Nagarro",
    location: "Gurugram, India (remote)",
    body: "ETL pipelines turning high-volume transactional data into analyst-ready dimensional tables on AWS Redshift and Snowflake, delivered in Agile sprints.",
  },
  {
    period: "May—Dec 2023",
    role: "Cybersecurity Junior Analyst",
    org: "AT SecurDI",
    location: "Ahmedabad, India",
    body: "SIEM monitoring, alert triage, incident-response runbooks, OWASP Top 10 testing, and ISO 27001 / NIST CSF audit work.",
  },
];

const education = [
  {
    period: "Feb 2025—Aug 2027",
    role: "Master of Information Technology",
    org: "University of the Sunshine Coast, Adelaide",
    location: "Adelaide, Australia",
    body: "Postgraduate study across data systems, software engineering and cybersecurity research, including the deployed hybrid ML intrusion-detection capstone.",
  },
  {
    period: "2021—2024",
    role: "Bachelor of Computer Applications",
    org: "CHARUSAT, CMPICA",
    location: "Gujarat, India",
    body: "Undergraduate computing degree. NASA Space Apps Global Finalist and class representative during this period.",
  },
];

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

function ShaderField({ scene, chaos }: { scene: number; chaos: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(scene);
  const chaosRef = useRef(chaos);

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);
  useEffect(() => {
    chaosRef.current = chaos;
  }, [chaos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });

    if (!gl) {
      canvas.classList.add("shader-fallback");
      return;
    }

    // Adaptive quality: machines without GPU acceleration (software WebGL)
    // get a cheaper shader (3 octaves, single warp), a lower starting
    // resolution and no costly CSS blurs. `?perf=low` / `?perf=high`
    // override detection for testing.
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

    let pointerX = 0.5;
    let pointerY = 0.5;
    let targetX = 0.5;
    let targetY = 0.5;
    let previousScroll = window.scrollY;
    let velocity = 0;
    const basePalette = PALETTES[0] as Palette;
    let palette = {
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

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    resize();

    const start = performance.now();
    let lastFrame = start;
    let frameCount = 0;
    let frameAccum = 0;
    let frameSamples = 0;
    let skipToggle = false;

    const render = (now: number) => {
      // Software renderers draw every second frame: a steady ~30fps cadence
      // reads smoother than an oscillating full-rate attempt and halves CPU.
      if (softwareGpu) {
        skipToggle = !skipToggle;
        if (skipToggle) {
          raf = requestAnimationFrame(render);
          return;
        }
      }
      // Frame-time watchdog: after a short warmup, average frame duration
      // over 40-frame windows; while it stays above ~45ms (22fps), shrink
      // the pixel budget until the animation runs smoothly.
      const dt = now - lastFrame;
      lastFrame = now;
      frameCount++;
      if (frameCount > 10 && dt < 2000) {
        frameAccum += dt;
        frameSamples++;
        // Adapt quickly: judge every 12 frames so even a 5fps machine
        // reaches its stable budget within a few seconds.
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

      const target =
        PALETTES[sceneRef.current % PALETTES.length] ?? basePalette;
      const smooth = 0.07;

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
      gl.uniform1f(uniforms.time, ((now - start) / 1000) * (reduced ? 0.5 : 1));
      gl.uniform1f(uniforms.scroll, sy);
      gl.uniform1f(uniforms.velocity, velocity);
      gl.uniform1f(uniforms.energy, palette.energy);
      gl.uniform1f(uniforms.scale, palette.scale);
      gl.uniform1f(uniforms.chaos, chaosRef.current ? 1 : 0);
      gl.uniform3fv(uniforms.a, palette.a);
      gl.uniform3fv(uniforms.b, palette.b);
      gl.uniform3fv(uniforms.c, palette.c);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Reduced-motion visitors still get the field, just as a slow calm
      // drift (0.3x time) instead of a hard freeze.
      raf = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("ih-lowpower");
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className="ih-shader" aria-hidden="true" />;
}

const RAIL_SECTIONS = [
  { id: "work", n: "01", label: "WORK" },
  { id: "profile", n: "02", label: "CAPABILITY" },
  { id: "proof", n: "03", label: "PROOF" },
  { id: "trajectory", n: "04", label: "EXPERIENCE" },
  { id: "education", n: "05", label: "EDUCATION" },
  { id: "notes", n: "06", label: "FIELD NOTES" },
  { id: "contact", n: "07", label: "CONTACT" },
];

// Fixed side index so a recruiter can jump to any section without scrolling
// the whole page. Stays on screen; highlights the section in view.
function SectionRail() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const targets = RAIL_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { threshold: [0.25, 0.5], rootMargin: "-10% 0px -10% 0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="ih-rail" aria-label="Section index">
      {RAIL_SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={active === section.id ? "is-active" : ""}
        >
          <span>{section.n}</span>
          <b>{section.label}</b>
        </a>
      ))}
      <a href="https://vikrant69g.com/blog" className="ih-rail-blog">
        <span>08</span>
        <b>BLOG ↗</b>
      </a>
    </nav>
  );
}

function Pointer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;

    let x = -100;
    let y = -100;
    let tx = x;
    let ty = y;
    let raf = 0;

    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const tick = () => {
      x = lerp(x, tx, 0.4);
      y = lerp(y, ty, 0.4);
      el.style.transform = `translate3d(${x}px,${y}px,0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", move, { passive: true });
    tick();

    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="ih-pointer" aria-hidden="true">
      <span />
    </div>
  );
}

function MagneticLink({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  const onMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.12;
    const y = (e.clientY - r.top - r.height / 2) * 0.12;
    e.currentTarget.style.transform = `translate(${x}px,${y}px)`;
  };

  return (
    <a
      href={href}
      className={`ih-magnetic ${className}`}
      onPointerMove={onMove}
      onPointerLeave={(e: React.PointerEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.transform = "";
      }}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function ProjectScene({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const media = mediaRef.current;
    if (!el || !media) return;

    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(
        -1,
        Math.min(1, (vh * 0.5 - (r.top + r.height * 0.5)) / vh),
      );
      media.style.setProperty("--project-shift", `${p * 22}px`);
      media.style.setProperty("--project-tilt", `${p * 1.1}deg`);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={ref}
      className="ih-project ih-scene"
      data-scene={String((index % 5) + 1)}
      id={`project-${project.slug}`}
    >
      <div className="ih-project-sticky">
        <div className="ih-project-meta">
          <span>0{index + 1}</span>
          <span>{project.category}</span>
          <span>{project.timeframe}</span>
        </div>

        <div className="ih-project-copy-shell">
          <div className="ih-project-title-wrap">
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
          </div>

          <div className="ih-project-evidence">
            <span>ENGINEERING DECISIONS</span>
            <ul>
              {project.highlights.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div ref={mediaRef} className="ih-project-media">
          <img
            src={project.img.src}
            width={project.img.width}
            height={project.img.height}
            alt={`${project.title} interface`}
            loading={index > 1 ? "lazy" : "eager"}
          />
          <div className="ih-project-scan" aria-hidden="true" />
          <div className="ih-project-readout">
            <span>ROLE / {project.role}</span>
            <span>{project.stack.slice(0, 4).join(" · ")}</span>
          </div>
        </div>

        <div className="ih-project-outcome">
          <span>OUTCOME</span>
          <p>{project.outcome}</p>
          <div className="ih-project-actions">
            <MagneticLink href={`/work/${project.slug}`}>
              Case study ↗
            </MagneticLink>
            <MagneticLink href={project.live} external>
              Run system ↗
            </MagneticLink>
            <MagneticLink href={project.github} external>
              Source ↗
            </MagneticLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function CapabilityOverlap() {
  const [active, setActive] = useState<CapabilityKey>("ml");
  const current = capabilities[active];

  return (
    <section className="ih-capability ih-scene" data-scene="5" id="profile">
      <div className="ih-section-head">
        <p className="ih-index">002 / CAPABILITY OVERLAP</p>
        <p>Four domains. Every one anchored to a project or industry role.</p>
      </div>

      <div className="ih-capability-grid">
        <div
          className="ih-capability-map"
          aria-label="Interactive capability map"
        >
          <button
            className={active === "ml" ? "is-active" : ""}
            onClick={() => setActive("ml")}
            type="button"
          >
            <b>ML</b>
            <span>Threat detection</span>
          </button>
          <button
            className={active === "data" ? "is-active" : ""}
            onClick={() => setActive("data")}
            type="button"
          >
            <b>DATA</b>
            <span>Pipelines & models</span>
          </button>
          <button
            className={active === "security" ? "is-active" : ""}
            onClick={() => setActive("security")}
            type="button"
          >
            <b>SEC</b>
            <span>Operations & triage</span>
          </button>
          <button
            className={active === "delivery" ? "is-active" : ""}
            onClick={() => setActive("delivery")}
            type="button"
          >
            <b>SHIP</b>
            <span>Production delivery</span>
          </button>
          <div className="ih-capability-core">
            <span>THE</span>
            <strong>OVERLAP</strong>
          </div>
          <svg viewBox="0 0 600 600" aria-hidden="true">
            <circle cx="300" cy="300" r="224" />
            <circle cx="300" cy="300" r="150" />
            <path d="M300 72v456M72 300h456M140 140l320 320M460 140 140 460" />
          </svg>
        </div>

        <div className="ih-capability-detail" key={active}>
          <span>{current.n}</span>
          <h2>{current.title}</h2>
          <p>{current.desc}</p>
          <b>{current.evidence}</b>
          <ul>
            {current.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function MoreSystems({ featuredSlugs }: { featuredSlugs: string[] }) {
  const remaining = projects.filter(
    (project) => !featuredSlugs.includes(project.slug),
  );
  if (remaining.length === 0) return null;

  return (
    <section className="ih-more-systems ih-scene" data-scene="5">
      <div className="ih-section-head">
        <p className="ih-index">001.B / MORE SYSTEMS</p>
        <p>
          The flagship work gets the cinematic treatment. The rest still gets a
          direct route to evidence.
        </p>
      </div>
      <div className="ih-more-grid">
        {remaining.map((project, i) => (
          <a href={`/work/${project.slug}`} key={project.slug}>
            <span>0{i + 6}</span>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            <b>{project.stack.slice(0, 4).join(" · ")}</b>
            <i>OPEN CASE STUDY ↗</i>
          </a>
        ))}
      </div>
    </section>
  );
}

function ProofSection() {
  return (
    <section className="ih-proof ih-scene" data-scene="2" id="proof">
      <div className="ih-section-head ih-proof-head">
        <p className="ih-index">003 / PROOF</p>
        <p>
          Only claims already present in the existing portfolio source are used
          here.
        </p>
      </div>

      <div className="ih-proof-marquee" aria-hidden="true">
        <span>
          NASA GLOBAL FINALIST · AWS DATA ENGINEER · OCI DATA SCIENCE · SEVEN
          PUBLIC DEPLOYMENTS ·{" "}
        </span>
        <span>
          NASA GLOBAL FINALIST · AWS DATA ENGINEER · OCI DATA SCIENCE · SEVEN
          PUBLIC DEPLOYMENTS ·{" "}
        </span>
      </div>

      <div className="ih-proof-grid">
        <article>
          <strong>07</strong>
          <span>PUBLIC DEPLOYMENTS</span>
          <p>Portfolio résumé states all seven are public and open source.</p>
        </article>
        <article>
          <strong>10</strong>
          <span>MONTHS INDUSTRY EXPERIENCE</span>
          <p>
            Seven months in security analysis plus three months in data
            engineering.
          </p>
        </article>
        <article>
          <strong>04</strong>
          <span>OPERATING DOMAINS</span>
          <p>
            Threat detection ML, data engineering, security operations and
            production delivery.
          </p>
        </article>
        <article>
          <strong>2023</strong>
          <span>NASA GLOBAL FINALIST</span>
          <p>
            Team Eklavya, planetary-data sonification project that became Cosmic
            Keys.
          </p>
        </article>
      </div>

      <div className="ih-proof-credentials">
        <span>AWS Certified Data Engineer – Associate</span>
        <span>OCI Data Science Professional</span>
        <span>NASA Space Apps Global Finalist</span>
      </div>

      <div className="ih-certs">
        <p className="ih-certs-title">003.B / CERTIFICATES ON THE WALL</p>
        <div className="ih-certs-grid">
          {certs.map((cert, index) => (
            <a
              key={cert.title}
              href={cert.img.src}
              target="_blank"
              rel="noopener noreferrer"
              className="ih-cert-card"
              data-tilt={index % 3}
              aria-label={`View ${cert.title} certificate`}
            >
              <span className="ih-cert-media">
                <img
                  src={cert.img.src}
                  width={cert.img.width}
                  height={cert.img.height}
                  alt={`${cert.title} certificate`}
                  loading="lazy"
                />
              </span>
              <span className="ih-cert-caption">
                <b>{cert.title}</b>
                <i>{cert.issuer}</i>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineSection({
  id,
  scene,
  heading,
  tagline,
  steps,
}: {
  id: string;
  scene: string;
  heading: string;
  tagline: string;
  steps: typeof experience;
}) {
  return (
    <section className="ih-journey ih-scene" data-scene={scene} id={id}>
      <div className="ih-section-head">
        <p className="ih-index">{heading}</p>
        <p>{tagline}</p>
      </div>

      <div className="ih-journey-list">
        {steps.map((step, index) => (
          <article key={`${step.period}-${step.role}`}>
            <div className="ih-journey-index">
              <span>0{index + 1}</span>
              <i />
            </div>
            <p>{step.period}</p>
            <div>
              <h3>{step.role}</h3>
              <b>{step.org}</b>
            </div>
            <div>
              <span>{step.location}</span>
              <p>{step.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NotesSection({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="ih-notes ih-scene" data-scene="4" id="notes">
      <div className="ih-notes-title">
        <p className="ih-index">006 / FIELD NOTES</p>
        <h2>
          READ WHAT
          <br />
          I’M <i>THINKING.</i>
        </h2>
        <p>
          The items are supplied by the same build-time RSS feed used by the
          existing portfolio. No hard-coded guessed article slugs.
        </p>
      </div>

      <div className="ih-note-links">
        {posts.length > 0 ? (
          posts.map((post) => (
            <a href={post.link} key={`${post.link}-${post.title}`}>
              <span>{post.pubDate}</span>
              <b>{post.title}</b>
              <i>↗</i>
            </a>
          ))
        ) : (
          <a href="https://vikrant69g.com/blog">
            <span>INDEX</span>
            <b>Open all field notes</b>
            <i>↗</i>
          </a>
        )}
        <a href="https://vikrant69g.com/blog">
          <span>ALL</span>
          <b>Field notes archive</b>
          <i>↗</i>
        </a>
      </div>
    </section>
  );
}

export default function ImmersiveHome({ posts = [] }: { posts?: BlogPost[] }) {
  const [scene, setScene] = useState(0);
  const [chaos, setChaos] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [stats, setStats] = useState<{
    unique: number;
    since: string;
  } | null>(null);

  // Anonymous unique-visitor ping: one POST per browser session. The server
  // stores only a salted hash of the IP, never the address itself.
  useEffect(() => {
    if (window.sessionStorage.getItem("ih-visit")) return;
    window.sessionStorage.setItem("ih-visit", "1");
    fetch("/api/track", { method: "POST" }).catch(() => {});
  }, []);

  // Hidden owner shortcut: Ctrl+Alt+H toggles the visitor counter overlay.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        setStatsOpen((open) => {
          if (!open) {
            fetch("/api/stats")
              .then((res) => (res.ok ? res.json() : null))
              .then((data) => setStats(data))
              .catch(() => setStats(null));
          }
          return !open;
        });
      }
      if (event.key === "Escape") setStatsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const featuredSlugs = useMemo(
    () => [
      "studentops-data-platform",
      "hybrid-ml-intrusion-detection",
      "threatlens",
      "cosmic-keys",
      "phishing-detection-platform",
    ],
    [],
  );

  const selected = useMemo(
    () =>
      featuredSlugs
        .map((slug) => projects.find((project) => project.slug === slug))
        .filter(Boolean) as typeof projects,
    [featuredSlugs],
  );

  useEffect(() => {
    document.documentElement.classList.add("ih-active");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", "#050608");

    const sections = [...document.querySelectorAll<HTMLElement>(".ih-scene")];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const n = Number((visible.target as HTMLElement).dataset.scene || 0);
          setScene(n);
          (visible.target as HTMLElement).classList.add("is-inview");
        }
      },
      { threshold: [0.18, 0.4, 0.68], rootMargin: "-8% 0px -8% 0px" },
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("ih-active");
    };
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard?.writeText("vikrantsharma892@gmail.com");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = "mailto:vikrantsharma892@gmail.com";
    }
  };

  return (
    <div className={`immersive-home ${chaos ? "is-chaos" : ""}`}>
      <ShaderField scene={scene} chaos={chaos} />
      <Pointer />
      <SectionRail />
      <div className="ih-scrim" aria-hidden="true" />
      <div className="ih-grain" aria-hidden="true" />
      <div className="ih-vignette" aria-hidden="true" />

      <header className="ih-nav">
        <a className="ih-mark" href="#top" aria-label="Vikrant Sharma, home">
          <span>69G</span>
          <b>VIKRANT SHARMA</b>
        </a>
        <button
          className="ih-signal"
          type="button"
          aria-pressed={chaos}
          onClick={() => setChaos((value) => !value)}
        >
          <i />
          {chaos ? "STABILISE" : "AMPLIFY SIGNAL"}
        </button>
      </header>

      <section className="ih-hero ih-scene" data-scene="0" id="top">
        <div className="ih-hero-kicker">
          <span className="ih-kicker-left">
            ML / DATA / SECURITY
            <a href="/recruiter" className="ih-recruiter-link">
              RECRUITER VIEW ↗
            </a>
          </span>
          <span>ADL · AU</span>
        </div>
        <h1>
          <span className="ih-solid">VIKRANT</span>
          <span className="ih-outline">SHARMA</span>
        </h1>

        <div className="ih-hero-copy">
          <p>
            I build systems that turn messy signals into decisions: data
            platforms, ML threat detection and security tooling that actually
            ships.
          </p>
          <div>
            <MagneticLink href="#work" className="ih-pill">
              Enter the work <b>↘</b>
            </MagneticLink>
            <MagneticLink href="/resume" className="ih-plain">
              Resume ↗
            </MagneticLink>
          </div>
        </div>

        <div className="ih-portrait-card">
          <div className="ih-portrait-glow" aria-hidden="true" />
          <div className="ih-portrait-ring ih-ring-a" aria-hidden="true" />
          <div className="ih-portrait-ring ih-ring-b" aria-hidden="true" />
          <div className="ih-portrait-frame">
            <img
              src={portraitImg.src}
              width={portraitImg.width}
              height={portraitImg.height}
              alt="Vikrant Sharma"
            />
          </div>
        </div>

        <div className="ih-scroll-cue">
          <span>SCROLL TO DEFORM</span>
          <i />
        </div>
      </section>

      <section className="ih-work-intro ih-scene" data-scene="1" id="work">
        <p className="ih-index">001 / FLAGSHIP SYSTEMS</p>
        <h2>
          NOT PROJECTS.
          <br />
          <em>OPERATING SYSTEMS.</em>
        </h2>
        <p className="ih-side-copy">
          Five systems get full cinematic scenes. The shader remains present,
          but content now sits on controlled contrast layers so nothing
          disappears into the artwork.
        </p>
      </section>

      {selected.map((project, index) => (
        <ProjectScene key={project.slug} project={project} index={index} />
      ))}
      <MoreSystems featuredSlugs={featuredSlugs} />
      <CapabilityOverlap />
      <ProofSection />
      <TimelineSection
        id="trajectory"
        scene="3"
        heading="004 / EXPERIENCE"
        tagline="Security operations first, then data engineering, now AI systems work at Voxon."
        steps={experience}
      />
      <TimelineSection
        id="education"
        scene="5"
        heading="005 / EDUCATION"
        tagline="Undergraduate computing in India, postgraduate IT in Adelaide."
        steps={education}
      />
      <NotesSection posts={posts} />

      <footer className="ih-contact ih-scene" data-scene="0" id="contact">
        <div className="ih-contact-top">
          <p>007 / OPEN CHANNEL</p>
          <span>ADELAIDE, SOUTH AUSTRALIA</span>
        </div>
        <h2>
          LET’S BUILD
          <br />
          <em>SOMETHING REAL.</em>
        </h2>
        <p className="ih-contact-copy">
          Machine learning, data engineering, automation, agentic AI tooling and
          security engineering are the current operating range shown in the
          existing portfolio.
        </p>

        <div className="ih-contact-bottom">
          <button type="button" onClick={copyEmail}>
            {copied ? "COPIED" : "VIKRANTSHARMA892@GMAIL.COM"}
            <span>↗</span>
          </button>
          <div>
            <a
              href="https://github.com/Vikrant892"
              target="_blank"
              rel="noopener noreferrer"
            >
              GITHUB ↗
            </a>
            <a
              href="https://www.linkedin.com/in/vik892/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LINKEDIN ↗
            </a>
            <a href="/resume">RESUME ↗</a>
            <a href="https://vikrant69g.com/blog">FIELD NOTES ↗</a>
          </div>
        </div>
        <small>© 2026 VIKRANT SHARMA · ADELAIDE, AUSTRALIA</small>
      </footer>

      {statsOpen && (
        <div
          className="ih-stats-overlay"
          role="dialog"
          aria-label="Visitor statistics"
        >
          <p>SIGNAL RECEIVED</p>
          <strong>{stats ? stats.unique : "—"}</strong>
          <span>UNIQUE VISITORS</span>
          <i>{stats ? `TRACKING SINCE ${stats.since}` : "STATS UNAVAILABLE"}</i>
          <b>ESC TO CLOSE</b>
        </div>
      )}
    </div>
  );
}
