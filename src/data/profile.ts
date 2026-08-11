import type { ImageMetadata } from "astro";
import certAws from "../assets/certs/aws-data-engineer-associate.png";
import certOci from "../assets/certs/oracle.png";
import certNasa from "../assets/certs/tot-02.png";
import certConf from "../assets/certs/tot-01.png";
import certTcs from "../assets/certs/tot-14.png";
import certBackend from "../assets/certs/tot-12.png";

/**
 * Single source of truth for identity, positioning, experience, education,
 * availability and credential claims. The homepage, recruiter view and
 * layout schema all read from here — edit facts in this file only.
 */

export const identity = {
  name: "Vikrant Sharma",
  /** Positioning: data engineering and ML first, security-aware. */
  jobTitle: "Data Engineer & Machine Learning Engineer",
  headline: "Data Engineering, Machine Learning & Security",
  kicker: "DATA / ML / SECURITY",
  tagline:
    "I build systems that turn messy signals into decisions: data platforms, ML threat detection and security tooling that actually ships.",
  location: "Adelaide, Australia",
  locationShort: "ADL · AU",
  email: "vikrantsharma892@gmail.com",
  github: "https://github.com/Vikrant892",
  linkedin: "https://www.linkedin.com/in/vik892/",
  blog: "https://vikrant69g.com/blog",
};

/**
 * Work-rights truth (subclass 500): capped hours in trimester, unlimited in
 * scheduled breaks, 485 post-study work stream on graduation Aug 2027.
 * Never claim "full working rights", permanent residency or citizenship.
 */
export const availability = {
  line: "Open to internships now and graduate roles from August 2027.",
  detail:
    "International student (subclass 500): unlimited hours during course breaks, capped during trimester. Eligible for the post-study work visa (485) on graduation in August 2027.",
};

export interface ExperienceEntry {
  period: string;
  role: string;
  org: string;
  location: string;
  body: string;
  /** Completed engagements carry their agreed month count; null = ongoing. */
  months: number | null;
  startISO: string;
}

export const experience: ExperienceEntry[] = [
  {
    period: "Aug 2026—Present",
    role: "Industry Placement",
    org: "Voxon",
    location: "Adelaide, Australia",
    body: "Working on AI capabilities in VoxelOS as part of the Master's industry placement.",
    months: null,
    startISO: "2026-08-01",
  },
  {
    period: "Dec 2024—Feb 2025",
    role: "Data Engineering Intern",
    org: "Nagarro",
    location: "Gurugram, India (remote)",
    body: "ETL pipelines turning high-volume transactional data into analyst-ready dimensional tables on AWS Redshift and Snowflake, delivered in Agile sprints.",
    months: 3,
    startISO: "2024-12-01",
  },
  {
    period: "May—Dec 2023",
    role: "Cybersecurity Junior Analyst",
    org: "AT SecurDI",
    location: "Ahmedabad, India",
    body: "SIEM monitoring, alert triage, incident-response runbooks, OWASP Top 10 testing, and ISO 27001 / NIST CSF audit work.",
    months: 7,
    startISO: "2023-05-01",
  },
];

/** Total completed industry months plus ongoing months, computed at build. */
export function industryMonths(now = new Date()): number {
  return experience.reduce((total, entry) => {
    if (entry.months !== null) return total + entry.months;
    const start = new Date(entry.startISO);
    const diff =
      (now.getFullYear() - start.getFullYear()) * 12 +
      (now.getMonth() - start.getMonth());
    return total + Math.max(0, diff);
  }, 0);
}

/** Renders like "10+" — grows automatically as the Voxon placement runs. */
export const industryExperienceLabel = `${industryMonths()}+`;

export const education = [
  {
    period: "Feb 2025—Aug 2027",
    degree: "Master of Information Technology",
    org: "University of the Sunshine Coast, Adelaide Campus",
    location: "Adelaide, Australia",
    body: "Postgraduate study across data systems, software engineering and cybersecurity research, including the deployed hybrid ML intrusion-detection capstone.",
  },
  {
    period: "2021—2024",
    degree: "Bachelor of Computer Applications",
    org: "CHARUSAT, CMPICA",
    location: "Gujarat, India",
    body: "Undergraduate computing degree. NASA Space Apps Global Finalist and class representative during this period.",
  },
];

export interface Certification {
  img: ImageMetadata;
  title: string;
  issuer: string;
  /** External registry or announcement backing the claim, when one exists. */
  proof?: string;
}

export const certs: Certification[] = [
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
    proof: "https://www.spaceappschallenge.org/2023/awards/global-finalists/",
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
