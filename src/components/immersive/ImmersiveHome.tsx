import { useEffect, useMemo, useRef, useState } from "react";
import { projects } from "@/data/projects";
import portraitImg from "@/assets/portrait.jpg";

type Palette = {
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
  energy: number;
  scale: number;
};

const PALETTES: Palette[] = [
  { a: [0.015, 0.018, 0.025], b: [0.76, 0.83, 0.93], c: [0.43, 0.68, 1.0], energy: 0.78, scale: 1.05 },
  { a: [0.018, 0.012, 0.025], b: [0.94, 0.45, 0.74], c: [0.52, 0.35, 1.0], energy: 1.18, scale: 1.42 },
  { a: [0.005, 0.03, 0.035], b: [0.25, 0.94, 0.82], c: [0.06, 0.42, 0.56], energy: 1.05, scale: 1.25 },
  { a: [0.03, 0.018, 0.005], b: [1.0, 0.69, 0.22], c: [0.95, 0.26, 0.12], energy: 1.24, scale: 1.12 },
  { a: [0.008, 0.015, 0.04], b: [0.31, 0.57, 1.0], c: [0.56, 0.22, 0.98], energy: 0.94, scale: 1.65 },
  { a: [0.02, 0.02, 0.018], b: [0.92, 0.92, 0.84], c: [0.6, 0.72, 0.47], energy: 0.72, scale: 0.92 },
];

const VERTEX = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main(){
  v_uv = a_position * .5 + .5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
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
  for(int i=0;i<5;i++){ v += amp*noise(p); p=r*p*2.03+11.7; amp*=.5; }
  return v;
}

void main(){
  vec2 uv=v_uv;
  vec2 p=(uv-.5)*vec2(u_resolution.x/u_resolution.y,1.0);
  vec2 m=(u_pointer-.5)*vec2(u_resolution.x/u_resolution.y,1.0);
  float t=u_time*.075;
  float vel=clamp(abs(u_velocity)*.018,0.0,1.0);

  float pointerGlow=exp(-3.6*length(p-m));
  vec2 q=vec2(
    fbm(p*u_scale + vec2(t, -t*.61)),
    fbm(p*u_scale + vec2(-t*.43, t*.87)+3.1)
  );
  vec2 r=vec2(
    fbm(p*u_scale + 3.8*q + vec2(1.7,-4.2) + t*.35),
    fbm(p*u_scale + 3.2*q + vec2(8.3,2.8) - t*.22)
  );

  float warp=fbm(p*(1.35+u_chaos*.55)*u_scale + (4.5+u_chaos*2.0)*r);
  float folds=sin((p.x*.78+p.y*.22+warp*1.7+r.x*.95+u_scroll*.00034)*8.0);
  folds=.5+.5*folds;
  folds=smoothstep(.16,.92,folds);

  float field=mix(q.x,r.y,.62)+warp*.72;
  field += pointerGlow*(.18+.20*u_chaos);
  field += vel*.11;

  vec3 color=mix(u_a,u_b,smoothstep(.12,1.05,field));
  color=mix(color,u_c,folds*(.25+.25*u_energy));
  color += u_c*pointerGlow*.18*u_energy;

  float vignette=smoothstep(1.12,.15,length(p*.72));
  color*=.58+.58*vignette;

  float grain=(hash(gl_FragCoord.xy+fract(u_time)*100.0)-.5)*.035;
  color += grain;
  color=pow(max(color,0.0),vec3(.92));
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

function ShaderField({ scene, chaos }: { scene: number; chaos: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef(scene);
  const chaosRef = useRef(chaos);

  useEffect(() => { sceneRef.current = scene; }, [scene]);
  useEffect(() => { chaosRef.current = chaos; }, [chaos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
    if (!gl) {
      canvas.classList.add("shader-fallback");
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const position = gl.getAttribLocation(program, "a_position");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const loc = (name: string) => gl.getUniformLocation(program, name);
    const uniforms = {
      resolution: loc("u_resolution"), pointer: loc("u_pointer"), time: loc("u_time"),
      scroll: loc("u_scroll"), velocity: loc("u_velocity"), energy: loc("u_energy"),
      scale: loc("u_scale"), chaos: loc("u_chaos"), a: loc("u_a"), b: loc("u_b"), c: loc("u_c"),
    };

    let pointerX=.5, pointerY=.5, targetX=.5, targetY=.5;
    let previousScroll=window.scrollY, velocity=0;
    let palette = { ...PALETTES[0], a:[...PALETTES[0].a] as [number,number,number], b:[...PALETTES[0].b] as [number,number,number], c:[...PALETTES[0].c] as [number,number,number] };
    let raf=0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr=Math.min(window.devicePixelRatio || 1, window.innerWidth < 760 ? 1.05 : 1.45);
      const w=Math.floor(window.innerWidth*dpr), h=Math.floor(window.innerHeight*dpr);
      if(canvas.width!==w || canvas.height!==h){ canvas.width=w; canvas.height=h; gl.viewport(0,0,w,h); }
    };
    const move=(e: PointerEvent)=>{ targetX=e.clientX/window.innerWidth; targetY=1-e.clientY/window.innerHeight; };
    window.addEventListener("resize",resize,{passive:true});
    window.addEventListener("pointermove",move,{passive:true});
    resize();

    const start=performance.now();
    const render=(now:number)=>{
      const target=PALETTES[sceneRef.current % PALETTES.length];
      const smooth=.035;
      for(let i=0;i<3;i++){
        palette.a[i]=lerp(palette.a[i],target.a[i],smooth);
        palette.b[i]=lerp(palette.b[i],target.b[i],smooth);
        palette.c[i]=lerp(palette.c[i],target.c[i],smooth);
      }
      palette.energy=lerp(palette.energy,target.energy,smooth);
      palette.scale=lerp(palette.scale,target.scale,smooth);
      pointerX=lerp(pointerX,targetX,.045); pointerY=lerp(pointerY,targetY,.045);
      const sy=window.scrollY; velocity=lerp(velocity,sy-previousScroll,.12); previousScroll=sy;

      gl.uniform2f(uniforms.resolution,canvas.width,canvas.height);
      gl.uniform2f(uniforms.pointer,pointerX,pointerY);
      gl.uniform1f(uniforms.time,(now-start)/1000);
      gl.uniform1f(uniforms.scroll,sy);
      gl.uniform1f(uniforms.velocity,velocity);
      gl.uniform1f(uniforms.energy,palette.energy);
      gl.uniform1f(uniforms.scale,palette.scale);
      gl.uniform1f(uniforms.chaos,chaosRef.current?1:0);
      gl.uniform3fv(uniforms.a,palette.a); gl.uniform3fv(uniforms.b,palette.b); gl.uniform3fv(uniforms.c,palette.c);
      gl.drawArrays(gl.TRIANGLES,0,6);
      if(!reduced) raf=requestAnimationFrame(render);
    };
    render(performance.now());
    return()=>{ cancelAnimationFrame(raf); window.removeEventListener("resize",resize); window.removeEventListener("pointermove",move); };
  },[]);

  return <canvas ref={canvasRef} className="ih-shader" aria-hidden="true" />;
}

function Pointer() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const el=ref.current; if(!el) return;
    let x=-100,y=-100,tx=x,ty=y,raf=0;
    const move=(e:PointerEvent)=>{tx=e.clientX;ty=e.clientY;};
    const tick=()=>{x=lerp(x,tx,.18);y=lerp(y,ty,.18);el.style.transform=`translate3d(${x}px,${y}px,0)`;raf=requestAnimationFrame(tick);};
    window.addEventListener("pointermove",move,{passive:true}); tick();
    return()=>{window.removeEventListener("pointermove",move);cancelAnimationFrame(raf);};
  },[]);
  return <div ref={ref} className="ih-pointer" aria-hidden="true"><span /></div>;
}

function MagneticLink({ href, children, className="", external=false }: { href:string; children:React.ReactNode; className?:string; external?:boolean }) {
  const ref=useRef<HTMLAnchorElement>(null);
  const onMove=(e:React.PointerEvent<HTMLAnchorElement>)=>{
    if(window.matchMedia("(pointer: coarse)").matches) return;
    const r=e.currentTarget.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*.16, y=(e.clientY-r.top-r.height/2)*.16;
    e.currentTarget.style.transform=`translate(${x}px,${y}px)`;
  };
  return <a ref={ref} href={href} className={`ih-magnetic ${className}`} onPointerMove={onMove} onPointerLeave={(e)=>e.currentTarget.style.transform=""} target={external?"_blank":undefined} rel={external?"noopener noreferrer":undefined}>{children}</a>;
}

function ProjectScene({ project, index }: { project:(typeof projects)[number]; index:number }) {
  const ref=useRef<HTMLElement>(null);
  const mediaRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=ref.current, media=mediaRef.current; if(!el||!media) return;
    const onScroll=()=>{
      const r=el.getBoundingClientRect(); const vh=window.innerHeight;
      const p=Math.max(-1,Math.min(1,(vh*.5-(r.top+r.height*.5))/vh));
      media.style.setProperty("--project-shift",`${p*42}px`);
      media.style.setProperty("--project-tilt",`${p*2.2}deg`);
    };
    onScroll(); window.addEventListener("scroll",onScroll,{passive:true});
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);
  return <section ref={ref} className="ih-project ih-scene" data-scene={String((index%5)+1)} id={`project-${project.slug}`}>
    <div className="ih-project-sticky">
      <div className="ih-project-meta">
        <span>0{index+1}</span><span>{project.category}</span><span>{project.timeframe}</span>
      </div>
      <div className="ih-project-title-wrap">
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
      </div>
      <div ref={mediaRef} className="ih-project-media">
        <img src={project.img.src} width={project.img.width} height={project.img.height} alt={`${project.title} interface`} loading={index>1?"lazy":"eager"} />
        <div className="ih-project-scan" aria-hidden="true" />
        <div className="ih-project-readout">
          <span>ROLE / {project.role}</span>
          <span>{project.stack.slice(0,4).join(" · ")}</span>
        </div>
      </div>
      <div className="ih-project-outcome">
        <span>OUTCOME</span><p>{project.outcome}</p>
        <div className="ih-project-actions">
          <MagneticLink href={`/work/${project.slug}`}>Case study ↗</MagneticLink>
          <MagneticLink href={project.live} external>Run system ↗</MagneticLink>
          <MagneticLink href={project.github} external>Source ↗</MagneticLink>
        </div>
      </div>
    </div>
  </section>;
}

export default function ImmersiveHome() {
  const [scene,setScene]=useState(0);
  const [chaos,setChaos]=useState(false);
  const [copied,setCopied]=useState(false);
  const selected=useMemo(()=>{
    const preferred=["studentops-data-platform","hybrid-ml-intrusion-detection","threatlens","cosmic-keys","phishing-detection-platform"];
    return preferred.map(slug=>projects.find(p=>p.slug===slug)).filter(Boolean) as typeof projects;
  },[]);

  useEffect(()=>{
    document.documentElement.classList.add("ih-active");
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content","#050608");
    const sections=[...document.querySelectorAll<HTMLElement>(".ih-scene")];
    const observer=new IntersectionObserver((entries)=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible){ const n=Number((visible.target as HTMLElement).dataset.scene||0); setScene(n); }
    },{threshold:[.2,.45,.7],rootMargin:"-10% 0px -10% 0px"});
    sections.forEach(s=>observer.observe(s));
    return()=>{observer.disconnect();document.documentElement.classList.remove("ih-active");};
  },[]);

  const copyEmail=async()=>{
    await navigator.clipboard?.writeText("vikrantsharma892@gmail.com");
    setCopied(true); window.setTimeout(()=>setCopied(false),1600);
  };

  return <div className={`immersive-home ${chaos?"is-chaos":""}`}>
    <ShaderField scene={scene} chaos={chaos}/><Pointer/>
    <div className="ih-grain" aria-hidden="true"/>
    <div className="ih-vignette" aria-hidden="true"/>

    <header className="ih-nav">
      <a className="ih-mark" href="#top" aria-label="Vikrant Sharma, home"><span>69G</span><b>VIKRANT SHARMA</b></a>
      <nav aria-label="Portfolio"><a href="#work">WORK</a><a href="#profile">PROFILE</a><a href="/blog">FIELD NOTES</a></nav>
      <button className="ih-signal" type="button" aria-pressed={chaos} onClick={()=>setChaos(v=>!v)}><i/>{chaos?"STABILISE":"AMPLIFY SIGNAL"}</button>
    </header>

    <section className="ih-hero ih-scene" data-scene="0" id="top">
      <div className="ih-hero-kicker">ML / DATA / SECURITY <span>ADL · AU</span></div>
      <h1><span className="ih-solid">VIKRANT</span><span className="ih-outline">SHARMA</span></h1>
      <div className="ih-hero-copy">
        <p>I build systems that turn messy signals into decisions: data platforms, ML threat detection and security tooling that actually ships.</p>
        <div><MagneticLink href="#work" className="ih-pill">Enter the work <b>↘</b></MagneticLink><MagneticLink href="/resume" className="ih-plain">Resume ↗</MagneticLink></div>
      </div>
      <div className="ih-portrait-orbit" aria-hidden="true">
        <div className="ih-orbit ih-orbit-a"/><div className="ih-orbit ih-orbit-b"/>
        <img src={portraitImg.src} width={portraitImg.width} height={portraitImg.height} alt="" />
      </div>
      <div className="ih-scroll-cue"><span>SCROLL TO DEFORM</span><i/></div>
    </section>

    <section className="ih-work-intro ih-scene" data-scene="1" id="work">
      <p className="ih-index">001 / SELECTED SYSTEMS</p>
      <h2>NOT PROJECTS.<br/><em>OPERATING SYSTEMS.</em></h2>
      <p className="ih-side-copy">Five systems, built end-to-end. Move through them like exhibits. The background field changes with each engineering problem.</p>
    </section>

    {selected.map((project,index)=><ProjectScene key={project.slug} project={project} index={index}/>) }

    <section className="ih-profile ih-scene" data-scene="5" id="profile">
      <div className="ih-profile-top"><span>002 / OPERATING RANGE</span><span>ADELAIDE, SOUTH AUSTRALIA</span></div>
      <h2>I WORK IN THE<br/><span>OVERLAP.</span></h2>
      <div className="ih-ranges">
        <article><b>01</b><h3>Threat Detection ML</h3><p>Anomaly detection, imbalanced classification and ensemble models mapped back to attacker behaviour.</p><span>PyTorch · scikit-learn · XGBoost · MITRE ATT&CK</span></article>
        <article><b>02</b><h3>Data Engineering</h3><p>Layered warehouses, orchestration and pipelines that make analytical systems boringly dependable.</p><span>Python · SQL · Postgres · dbt · Prefect · Snowflake</span></article>
        <article><b>03</b><h3>Security Operations</h3><p>Detection grounded in what SOC work actually looks like: noisy alerts, incomplete evidence and hard prioritisation.</p><span>SIEM · OWASP · NIST CSF · Suricata · Wireshark</span></article>
        <article><b>04</b><h3>Production Delivery</h3><p>APIs, containers, observability and public deployments. A model that cannot be used is still just an experiment.</p><span>FastAPI · Docker · Cloudflare · GitHub Actions</span></article>
      </div>
    </section>

    <section className="ih-proof ih-scene" data-scene="2">
      <div className="ih-proof-marquee" aria-hidden="true"><span>NASA GLOBAL FINALIST · AWS DATA ENGINEER · OCI DATA SCIENCE · SEVEN PUBLIC DEPLOYMENTS · </span><span>NASA GLOBAL FINALIST · AWS DATA ENGINEER · OCI DATA SCIENCE · SEVEN PUBLIC DEPLOYMENTS · </span></div>
      <div className="ih-proof-grid">
        <div><strong>07</strong><span>PUBLIC SYSTEMS</span></div><div><strong>03</strong><span>CORE DOMAINS</span></div><div><strong>02</strong><span>INDUSTRY ROLES</span></div><div><strong>∞</strong><span>THINGS LEFT TO BUILD</span></div>
      </div>
    </section>

    <section className="ih-journey ih-scene" data-scene="3">
      <p className="ih-index">003 / TRAJECTORY</p>
      <div className="ih-journey-line"><span>2023</span><h3>CYBERSECURITY<br/>JUNIOR ANALYST</h3><p>At SecurDI · SIEM, incident response, OWASP, ISO 27001, NIST CSF.</p></div>
      <div className="ih-journey-line"><span>2024</span><h3>DATA<br/>ENGINEER</h3><p>Nagarro · Redshift, Snowflake, ETL and dimensional modelling.</p></div>
      <div className="ih-journey-line"><span>2025—27</span><h3>MASTER OF<br/>INFORMATION TECHNOLOGY</h3><p>UniSC Adelaide · building ML, data and security systems in public.</p></div>
    </section>

    <section className="ih-notes ih-scene" data-scene="4">
      <div><p className="ih-index">004 / FIELD NOTES</p><h2>READ WHAT<br/>I’M <i>THINKING.</i></h2></div>
      <div className="ih-note-links">
        <a href="/blog/lastpass-breach-third-time-this-decade"><span>26.06.26</span><b>LastPass breach number three</b><i>↗</i></a>
        <a href="/blog/mcp-security-report-2026"><span>12.07.26</span><b>The MCP security audit nobody asked for</b><i>↗</i></a>
        <a href="/blog"><span>INDEX</span><b>All field notes</b><i>↗</i></a>
      </div>
    </section>

    <footer className="ih-contact ih-scene" data-scene="0" id="contact">
      <p>005 / OPEN CHANNEL</p>
      <h2>LET’S BUILD<br/><em>SOMETHING REAL.</em></h2>
      <div className="ih-contact-bottom">
        <button type="button" onClick={copyEmail}>{copied?"COPIED":"VIKRANTSHARMA892@GMAIL.COM"}<span>↗</span></button>
        <div><a href="https://github.com/Vikrant892" target="_blank" rel="noopener noreferrer">GITHUB ↗</a><a href="https://www.linkedin.com/in/vik892/" target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a><a href="/resume">RESUME ↗</a></div>
      </div>
      <small>© 2026 VIKRANT SHARMA · ADELAIDE, AUSTRALIA</small>
    </footer>
  </div>;
}
