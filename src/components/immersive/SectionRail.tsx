import { useEffect, useState } from "react";

const RAIL_SECTIONS = [
  { id: "work", n: "01", label: "WORK" },
  { id: "profile", n: "02", label: "CAPABILITY" },
  { id: "proof", n: "03", label: "PROOF" },
  { id: "trajectory", n: "04", label: "EXPERIENCE" },
  { id: "education", n: "05", label: "EDUCATION" },
  { id: "notes", n: "06", label: "FIELD NOTES" },
  { id: "contact", n: "07", label: "CONTACT" },
];

/**
 * Fixed side index so a recruiter can jump to any section without scrolling
 * the whole page. Stays on screen; highlights the section in view.
 */
export default function SectionRail() {
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
          aria-current={active === section.id ? "true" : undefined}
        >
          <span>{section.n}</span>
          <b>{section.label}</b>
        </a>
      ))}
      <a href="https://vikrantsharma.info/blog" className="ih-rail-blog">
        <span>08</span>
        <b>BLOG ↗</b>
      </a>
    </nav>
  );
}
