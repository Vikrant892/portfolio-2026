import { useEffect, useState } from "react";

/**
 * Anonymous visit ping plus the hidden owner overlay (Ctrl+Alt+H).
 * Stats are protected: the endpoint requires a bearer token, which the
 * owner enters once; it is kept in localStorage and cleared on 401.
 */
export default function StatsOverlay() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<{ unique: number; since: string } | null>(
    null,
  );
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem("ih-visit")) return;
    window.sessionStorage.setItem("ih-visit", "1");
    fetch("/api/track", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    const loadStats = () => {
      let token = window.localStorage.getItem("ih-stats-token");
      if (!token) {
        token = window.prompt("Stats passphrase:") || "";
        if (!token) return;
        window.localStorage.setItem("ih-stats-token", token);
      }
      fetch("/api/stats", { headers: { authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.status === 401) {
            window.localStorage.removeItem("ih-stats-token");
            setDenied(true);
            setStats(null);
            return null;
          }
          setDenied(false);
          return res.ok ? res.json() : null;
        })
        .then((data) => {
          if (data) setStats(data);
        })
        .catch(() => setStats(null));
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        setOpen((current) => {
          if (!current) loadStats();
          return !current;
        });
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      className="ih-stats-overlay"
      role="dialog"
      aria-label="Visitor statistics"
    >
      <p>SIGNAL RECEIVED</p>
      <strong>{stats ? stats.unique : "—"}</strong>
      <span>UNIQUE VISITORS</span>
      <i>
        {denied
          ? "WRONG PASSPHRASE — PRESS CTRL+ALT+H TO RETRY"
          : stats
            ? `TRACKING SINCE ${stats.since}`
            : "STATS UNAVAILABLE"}
      </i>
      <b>ESC TO CLOSE</b>
    </div>
  );
}
