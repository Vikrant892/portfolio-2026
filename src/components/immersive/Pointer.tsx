import { useEffect, useRef } from "react";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Decorative cursor ring. The native cursor stays visible and handles all
 * interactive affordances; this ring simply trails it on fine pointers.
 */
export default function Pointer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
