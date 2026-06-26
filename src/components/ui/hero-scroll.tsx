import { motion, useReducedMotion } from "motion/react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import idsImg from "@/assets/projects/ids-project.png";
import portraitImg from "@/assets/portrait.jpg";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
});

export function HeroScroll() {
  const reduceMotion = useReducedMotion();

  return (
    <ContainerScroll
      titleComponent={
        <>
          <motion.div {...fadeUp(0)} className="flex justify-center">
            <img
              src={portraitImg.src}
              alt="Vikrant Sharma"
              width={256}
              height={256}
              className="h-28 w-28 rounded-full border-2 border-[var(--color-bg-elevated)] object-cover shadow-[var(--shadow-card)] md:h-32 md:w-32"
              loading="eager"
              draggable={false}
            />
          </motion.div>

          <motion.div {...fadeUp(0.08)} className="mt-6">
            <span className="t-display block text-3xl text-[var(--color-ink)] sm:text-5xl">
              Machine learning,
            </span>
            <span className="t-display t-gradient mt-2 block text-[clamp(2.75rem,9vw,6.5rem)] leading-none">
              built to hunt threats.
            </span>
          </motion.div>

          {/* Drawn underline stroke beneath the tagline */}
          <motion.svg
            {...fadeUp(0.12)}
            className="mx-auto mt-5 h-4 w-64 sm:w-80"
            viewBox="0 0 320 16"
            fill="none"
            aria-hidden="true"
          >
            <motion.path
              d="M6 11C58 4 130 3 178 7.5c38 3.6 92 5 136-3.5"
              stroke="var(--color-accent)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: reduceMotion ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.7 }}
            />
          </motion.svg>

          <motion.p
            {...fadeUp(0.16)}
            className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-[var(--color-ink-muted)] sm:text-lg"
          >
            Data platforms, ML systems and security tooling that run in
            production, not in notebooks. The dashboard below is one of seven
            public deployments, all open source.
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
