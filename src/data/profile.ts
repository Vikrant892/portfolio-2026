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
    "International student (subclass 500): unlimited hours during course breaks, capped during trimester. Expected to be eligible for a post-study work visa (485) on graduation in August 2027, subject to meeting the stream requirements at the time.",
};

export interface ExperienceEntry {
  period: string;
  role: string;
  org: string;
  location: string;
  body: string;
  /** Resume bullet points; the /resume page renders these. */
  points: string[];
  /** Completed engagements carry their agreed month count; null = ongoing. */
  months: number | null;
  startISO: string;
}

export const experience: ExperienceEntry[] = [
  {
    period: "Aug 2026—Present",
    role: "Software Engineer Intern",
    org: "Voxon",
    location: "Adelaide, Australia",
    body: "Working on AI capabilities in VoxelOS as part of the Master's industry placement.",
    points: [
      "Developing AI capabilities for VoxelOS as part of a Master's industry placement: prototyping and integrating real-time ML models for voxel processing and perception.",
      "Optimising model inference and deployment pipelines to meet embedded performance constraints, collaborating with firmware and software teams.",
      "Building automated testing and monitoring for model behaviour to keep live demos and internal releases reliable.",
    ],
    months: null,
    startISO: "2026-08-01",
  },
  {
    period: "Dec 2024—Feb 2025",
    role: "Data Engineering Intern",
    org: "Nagarro",
    location: "Gurugram, India (remote)",
    body: "ETL pipelines turning high-volume transactional data into analyst-ready dimensional tables on AWS Redshift and Snowflake, delivered in Agile sprints.",
    points: [
      "Designed and optimised dimensional data models on AWS Redshift and Snowflake for enterprise analytics workloads.",
      "Built ETL pipelines that transformed high-volume transactional data into analyst-ready dimensional tables.",
      "Delivered iterative client work via Agile and Scrum, collaborating with cross-functional teams of data analysts and product owners.",
    ],
    months: 3,
    startISO: "2024-12-01",
  },
  {
    period: "May—Dec 2023",
    role: "Cybersecurity Junior Analyst",
    org: "AT SecurDI",
    location: "Ahmedabad, India",
    body: "SIEM monitoring, alert triage, incident-response runbooks, OWASP Top 10 testing, and ISO 27001 / NIST CSF audit work.",
    points: [
      "Monitored SIEM platforms and triaged alerts to identify and escalate genuine security incidents.",
      "Authored incident response runbooks adopted by the wider security operations team.",
      "Performed OWASP Top 10 web application security testing for client engagements.",
      "Conducted ISO 27001 and NIST CSF compliance audits across multiple client environments.",
    ],
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
    // Degree name and commencement verified against the official UniSC
    // transcript (program "M Inform & Comm Technology", first study period
    // 2025 Trimester 2).
    period: "Jul 2025—Aug 2027",
    degree: "Master of Information and Communications Technology",
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
