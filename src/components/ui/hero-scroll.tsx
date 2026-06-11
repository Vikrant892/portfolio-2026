import { motion } from "motion/react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import idsImg from "@/assets/projects/ids-project.png";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
});

export function HeroScroll() {
  return (
    <ContainerScroll
      titleComponent={
        <>
          <motion.p {...fadeUp(0)} className="t-eyebrow">
            Vikrant Sharma · Adelaide, Australia
          </motion.p>

          <motion.h1 {...fadeUp(0.08)} className="mt-6">
            <span className="t-display block text-3xl text-[var(--color-ink)] sm:text-5xl">
              Machine learning,
            </span>
            <span className="t-display t-gradient mt-2 block text-[clamp(2.75rem,9vw,6.5rem)] leading-none">
              built to hunt threats.
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-[var(--color-ink-muted)] sm:text-lg"
          >
            Intrusion detection, threat triage and fraud models that run in
            production, not in notebooks. Seven systems live, all open source.
            This dashboard is one of them.
          </motion.p>

          <motion.div
            {...fadeUp(0.24)}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <a href="#work" className="btn btn-primary">
              View selected work
            </a>
            <a href="/resume" className="btn btn-secondary">
              Resume <span aria-hidden="true">→</span>
            </a>
          </motion.div>

          <motion.p
            {...fadeUp(0.32)}
            className="mono mt-7 inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.16em] text-[var(--color-ink-dim)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            </span>
            Open to internships and part-time work now
          </motion.p>
        </>
      }
    >
      <img
        src={idsImg.src}
        alt="Live hybrid ML intrusion detection dashboard built by Vikrant Sharma"
        width={idsImg.width}
        height={idsImg.height}
        className="h-full w-full object-cover object-left-top"
        draggable={false}
        loading="eager"
        fetchPriority="high"
      />
    </ContainerScroll>
  );
}
