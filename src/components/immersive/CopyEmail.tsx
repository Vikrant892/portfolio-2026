import { useState } from "react";

/** Email copy button with mailto fallback. */
export default function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button type="button" onClick={copy}>
      {copied ? "COPIED" : email.toUpperCase()}
      <span aria-hidden="true">↗</span>
    </button>
  );
}
