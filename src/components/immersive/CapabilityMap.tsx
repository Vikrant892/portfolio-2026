import { useState } from "react";

type CapabilityKey = "data" | "ml" | "security" | "delivery";

const capabilities: Record<
  CapabilityKey,
  { n: string; title: string; desc: string; evidence: string; tools: string[] }
> = {
  data: {
    n: "01",
    title: "Data Engineering",
    desc: "Dimensional modelling, ETL pipelines and warehouse work on AWS Redshift and Snowflake, plus layered Postgres/dbt systems in public projects.",
    evidence:
      "Evidence: Data Engineering Intern at Nagarro and StudentOps Data Platform.",
    tools: ["SQL", "Snowflake", "Redshift", "Postgres", "dbt", "Prefect"],
  },
  ml: {
    n: "02",
    title: "Threat Detection ML",
    desc: "Anomaly detection, imbalanced classification and ensemble models for security data, with alerts mapped back to MITRE ATT&CK where the project calls for it.",
    evidence:
      "Evidence: Hybrid ML Intrusion Detection and Credit Card Fraud Detection.",
    tools: ["Python", "PyTorch", "scikit-learn", "XGBoost", "SMOTE"],
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
      "Evidence: every project on this page links to a running system or its source.",
    tools: ["FastAPI", "Flask", "Docker", "Cloudflare", "GitHub Actions"],
  },
};

/** Interactive capability switcher. Data-first ordering per positioning. */
export default function CapabilityMap() {
  const [active, setActive] = useState<CapabilityKey>("data");
  const current = capabilities[active];

  return (
    <div className="ih-capability-grid">
      <div
        className="ih-capability-map"
        aria-label="Interactive capability map"
      >
        <button
          className={active === "data" ? "is-active" : ""}
          onClick={() => setActive("data")}
          type="button"
        >
          <b>DATA</b>
          <span>Pipelines & models</span>
        </button>
        <button
          className={active === "ml" ? "is-active" : ""}
          onClick={() => setActive("ml")}
          type="button"
        >
          <b>ML</b>
          <span>Threat detection</span>
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
  );
}
