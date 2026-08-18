import type { ImageMetadata } from "astro";
import studentopsImg from "../assets/projects/studentops.png";
import idsImg from "../assets/projects/ids-project.png";
import threatLensImg from "../assets/projects/threat-lens.png";
import nasaImg from "../assets/projects/nasa-space-challenge.png";
import fraudImg from "../assets/projects/credit-card-fraud-detection.png";
import passwordImg from "../assets/projects/password-strength-api.png";
import logImg from "../assets/projects/log-analyzer-dashboard.png";
import phishingImg from "../assets/projects/phishing-detection-platform.png";

export interface Project {
  slug: string;
  title: string;
  category: string;
  role: string;
  timeframe: string;
  img: ImageMetadata;
  /** One-line summary used on cards and as the page meta description. */
  summary: string;
  challenge: string;
  approach: string;
  outcome: string;
  /** Concrete technical decisions, one bullet each. */
  highlights: string[];
  stack: string[];
  live: string;
  github: string;
  featured: boolean;
  /**
   * Honest deployment state, checked against the real URL:
   * - live: responds and is usable right now (HF free Spaces may take a
   *   moment to wake, but they wake on visit)
   * - sleeping: needs a manual wake/restart before it responds
   * - migrating: being moved between hosts, temporarily unavailable
   * - archived: demo intentionally offline; source remains available
   * Only status "live" may render a run-the-system CTA.
   */
  status: "live" | "sleeping" | "migrating" | "archived";
}

export const projects: Project[] = [
  {
    slug: "studentops-data-platform",
    title: "StudentOps Data Platform",
    category: "Data Engineering · Capstone",
    role: "Sole engineer",
    timeframe: "2026",
    img: studentopsImg,
    summary:
      "An end-to-end data platform that ingests six sources into a layered Postgres warehouse with dbt and Prefect, then serves a dashboard, a daily digest and a Claude assistant.",
    challenge:
      "Study life is scattered across calendars, reference managers and notes, with no single view of what is due, what is planned and what is worth reading. The goal was a real data platform, not a to-do app: ingestion, modelling, orchestration and serving, end to end.",
    approach:
      "Six sources (iCal feeds, Google Calendar, Zotero, BibTeX and RIS drops, markdown notes, OpenAlex and CrossRef) land in a bronze, silver, gold Postgres warehouse. dbt builds the typed silver views and gold facts and dimensions with SCD2 history; Prefect orchestrates the runs. Three surfaces sit on top: a Streamlit dashboard, a daily email digest, and a Claude assistant that summarises, generates flashcards and suggests citations with mandatory DOI validation.",
    outcome:
      "A single tenant platform running live for about twelve dollars a month, with observable pipelines and freshness tracking per source. It demonstrates the full data engineering loop: ingest, model, orchestrate, serve, and a grounded AI layer that refuses to invent citations.",
    highlights: [
      "Bronze, silver, gold warehouse on Postgres with dbt, including SCD2 history on the assessments dimension.",
      "Six ingestion sources normalised into one model, orchestrated and scheduled with Prefect.",
      "A Claude assistant with a hard DOI validation gate so it never fabricates a reference.",
      "Daily digest by email and a Streamlit dashboard, deployed on Fly.io and Cloudflare Pages.",
    ],
    stack: ["Python", "Postgres", "dbt", "Prefect", "Streamlit", "Claude API"],
    live: "https://studentops.vikrantsharma.info",
    github: "https://github.com/Vikrant892/studentops",
    featured: true,
    status: "live",
  },
  {
    slug: "hybrid-ml-intrusion-detection",
    title: "Hybrid ML Intrusion Detection",
    category: "Capstone · Cybersecurity ML",
    role: "Sole engineer",
    timeframe: "Master of IT capstone, 2026",
    img: idsImg,
    summary:
      "A real-time hybrid intrusion detection system that runs an ensemble of ML models over network traffic and maps every alert to MITRE ATT&CK.",
    challenge:
      "Signature-based tools miss novel attacks, and SOC analysts drown in alerts with no context about what an attacker is actually doing. The job was a detector that catches unknown behaviour and tells the analyst what it means.",
    approach:
      "A hybrid NIDS and HIDS that runs an Isolation Forest, Random Forest and Autoencoder ensemble over CICIDS2017 traffic, with a real-time Streamlit dashboard. Live packet capture runs through Scapy; every alert is mapped to its MITRE ATT&CK technique so the analyst sees intent, not just a flag.",
    outcome:
      "Detects DDoS, brute force, port scans, web attacks, infiltration and botnet activity across the CICIDS2017 categories. The ATT&CK mapping turns each alert from a raw flag into a triage decision in seconds. Deployed live on Hugging Face Spaces with full source on GitHub.",
    highlights: [
      "Ensemble of three complementary models: Isolation Forest for unsupervised anomalies, Random Forest for known classes, Autoencoder for reconstruction-error outliers.",
      "Every detection is mapped to a MITRE ATT&CK technique, so an alert reads as attacker intent rather than a bare label.",
      "Live packet capture and feature extraction with Scapy feeding the models in real time.",
      "Containerised with Docker and shipped as an interactive Streamlit dashboard anyone can run.",
    ],
    stack: [
      "Python",
      "PyTorch",
      "scikit-learn",
      "Scapy",
      "Streamlit",
      "Docker",
    ],
    live: "https://huggingface.co/spaces/vikrant892/ids-project",
    github: "https://github.com/Vikrant892/ids-project",
    featured: true,
    status: "live",
  },
  {
    slug: "credit-card-fraud-detection",
    title: "Credit Card Fraud Detection",
    category: "ML · Imbalanced Classification",
    role: "Sole engineer",
    timeframe: "2025",
    img: fraudImg,
    summary:
      "An end-to-end fraud pipeline on a 284k-transaction dataset with a 0.17 per cent fraud rate, where the threshold is the real work.",
    challenge:
      "The dataset has 284,807 transactions and a 0.17 per cent fraud rate. A naive model scores 99.8 per cent accuracy by predicting that nothing is ever fraud, so accuracy is a trap and the whole problem lives in how you handle the imbalance.",
    approach:
      "A pipeline that takes class imbalance seriously: SMOTE oversampling on the training fold only, a head-to-head comparison of XGBoost, Random Forest and Logistic Regression, and precision-recall threshold tuning rather than chasing accuracy.",
    outcome:
      "A model evaluated on the metric that actually matters for fraud, the precision-recall trade-off at a usable operating threshold, with the full analysis open for review on Hugging Face and GitHub.",
    highlights: [
      "SMOTE applied inside the training fold only, avoiding the leakage that inflates naive imbalanced-data results.",
      "Three models compared head to head: XGBoost, Random Forest and Logistic Regression.",
      "Operating point chosen on the precision-recall curve, not on accuracy, because accuracy is meaningless at a 0.17 per cent base rate.",
      "Reproducible notebook plus an interactive demo so the trade-offs are inspectable, not just claimed.",
    ],
    stack: ["XGBoost", "scikit-learn", "SMOTE", "Streamlit"],
    live: "https://huggingface.co/spaces/vikrant892/credit-card-fraud-detection",
    github: "https://github.com/Vikrant892/credit-card-fraud-detection",
    featured: false,
    status: "live",
  },
  {
    slug: "cosmic-keys",
    title: "Cosmic Keys",
    category: "NASA Space Apps 2023 · Global Finalist",
    role: "Team Eklavya",
    timeframe: "NASA Space Apps Challenge, 2023",
    img: nasaImg,
    summary:
      "A planetary-data sonification engine that turns numbers into music, a NASA Space Apps Global Finalist project.",
    challenge:
      "Planetary datasets are tables of numbers. NASA Space Apps asked teams to make space data accessible to people who will never read a CSV.",
    approach:
      "A sonification engine, built with Team Eklavya, that converts planetary latitude, velocity and temperature into piano notes, plus an image scanner that turns a planet photo into a melody.",
    outcome:
      "Selected as a Global Finalist from thousands of teams worldwide. The judges did not read the data, they heard it.",
    highlights: [
      "Maps planetary parameters (latitude, velocity, temperature) onto musical pitch, tempo and tone.",
      "An image-to-music scanner derives a melody from a planet photograph.",
      "Built and shipped under hackathon time pressure with Team Eklavya.",
      "Recognised as a NASA Space Apps Challenge Global Finalist, 2023.",
    ],
    stack: ["Python", "Streamlit", "NumPy", "PIL"],
    live: "https://huggingface.co/spaces/vikrant892/nasa-space-challenge",
    github: "https://github.com/Vikrant892/nasa-space-challenge",
    featured: false,
    status: "live",
  },
  {
    slug: "threatlens",
    title: "ThreatLens",
    category: "Threat Intelligence",
    role: "Sole engineer",
    timeframe: "2025",
    img: threatLensImg,
    summary:
      "A CVE triage service that pre-ranks vulnerabilities by what is actually exploitable against your assets.",
    challenge:
      "Thousands of CVEs are published every month. Teams without a triage system patch alphabetically, or not at all, and waste effort on vulnerabilities nobody can reach.",
    approach:
      "A FastAPI service that correlates NVD CVE data with exploit availability, asset exposure and MITRE ATT&CK techniques, producing one composite risk score per vulnerability.",
    outcome:
      "A pre-ranked patch queue. The vulnerabilities that are actually exploitable against assets you actually run rise to the top, so triage time goes to the things that matter.",
    highlights: [
      "Pulls and normalises live CVE data from the NVD API.",
      "Composite score blends exploit availability, asset exposure and mapped ATT&CK techniques.",
      "Typed request and response models with Pydantic for a clean, documented API.",
    ],
    stack: ["FastAPI", "NVD API", "MITRE ATT&CK", "Pydantic"],
    live: "https://huggingface.co/spaces/vikrant892/threat-lens",
    github: "https://github.com/Vikrant892/threat-lens",
    featured: false,
    status: "live",
  },
  {
    slug: "phishing-detection-platform",
    title: "Phishing Detection Platform",
    category: "Cybersecurity · Email Security",
    role: "Sole engineer",
    timeframe: "2024",
    img: phishingImg,
    summary:
      "An email analyser that flags the phishing signals gateways miss: header anomalies, hidden payloads and spoofed senders.",
    challenge:
      "Email gateways catch the obvious phishing and wave through the rest. Analysts need a second opinion that looks deeper than a reputation score.",
    approach:
      "A Flask web app with multi-format email parsing, header inspection and a threat-pattern rule engine, backed by SQLite and exposed through a REST API.",
    outcome:
      "Catches header anomalies, hidden payloads, suspicious URLs and sender spoofing that slip past gateways, giving a security team a deeper read before they quarantine.",
    highlights: [
      "Parses multiple email formats and inspects full headers, not just the visible body.",
      "Rule engine targets spoofing, hidden payloads and suspicious URLs.",
      "SQLite persistence and a REST API so it slots into an existing workflow.",
    ],
    stack: ["Flask", "SQLite", "BeautifulSoup", "Docker"],
    live: "https://huggingface.co/spaces/vikrant892/phishing-detection-platform",
    github: "https://github.com/Vikrant892/Phishing-detection-platform",
    featured: true,
    // Space is owner-paused (verified 12 Aug 2026): visitors cannot wake it.
    status: "sleeping",
  },
  {
    slug: "log-analyzer-dashboard",
    title: "Log Analyzer Dashboard",
    category: "Cybersecurity · SIEM",
    role: "Sole engineer",
    timeframe: "2024",
    img: logImg,
    summary:
      "A lightweight SIEM for teams without a Splunk budget: parses logs, flags attacks and maps them to ATT&CK.",
    challenge:
      "A full SIEM is expensive and heavy. Small teams still need to spot brute force and scanning in their logs without standing up a Splunk cluster.",
    approach:
      "A Flask dashboard that parses syslog, auth.log and web access logs, flags brute-force and port-scan patterns, and maps every alert to a MITRE ATT&CK technique, with Chart.js visualisations.",
    outcome:
      "Surfaces brute force and port scans in seconds and runs on a single VM, giving a budget-constrained team real detection instead of grepping logs by hand.",
    highlights: [
      "Parses syslog, auth.log and web access logs out of the box.",
      "Detects brute-force and port-scan patterns and maps alerts to ATT&CK.",
      "Chart.js dashboard, containerised, runs on a single VM.",
    ],
    stack: ["Flask", "Chart.js", "Regex", "Docker"],
    live: "https://huggingface.co/spaces/vikrant892/log-analyzer-dashboard",
    github: "https://github.com/Vikrant892/log-analyzer-dashboard",
    featured: false,
    status: "live",
  },
  {
    slug: "password-strength-api",
    title: "Password Strength API",
    category: "Security · API",
    role: "Sole engineer",
    timeframe: "2024",
    img: passwordImg,
    summary:
      "A drop-in API that returns entropy, breach status and crack-time estimates without ever seeing the raw password.",
    challenge:
      "Most password checks either leak the password to a server or give a meaningless strength bar. The goal was a real check that respects the secret.",
    approach:
      "A FastAPI microservice with entropy scoring, pattern detection and Have I Been Pwned k-anonymity SHA-1 breach checks, so the server never receives the actual password.",
    outcome:
      "Returns entropy, breach status and crack-time estimates in under 100 milliseconds, ready to drop into any authentication flow.",
    highlights: [
      "HIBP k-anonymity model: only a SHA-1 prefix leaves the client, so the password is never exposed.",
      "Entropy scoring plus pattern detection for a meaningful strength signal.",
      "Sub-100ms responses, documented FastAPI endpoints, containerised.",
    ],
    stack: ["FastAPI", "HIBP API", "Docker"],
    live: "https://huggingface.co/spaces/vikrant892/password-strength-api",
    github: "https://github.com/Vikrant892/password-strength-api",
    featured: false,
    status: "live",
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);
