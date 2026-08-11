import { useState } from "react";

/** AMPLIFY SIGNAL toggle. Talks to ShaderStage via the "ih:chaos" event. */
export default function SignalToggle() {
  const [chaos, setChaos] = useState(false);

  const toggle = () => {
    const next = !chaos;
    setChaos(next);
    document
      .querySelector(".immersive-home")
      ?.classList.toggle("is-chaos", next);
    window.dispatchEvent(new CustomEvent("ih:chaos", { detail: next }));
  };

  return (
    <button
      className="ih-signal"
      type="button"
      aria-pressed={chaos}
      onClick={toggle}
    >
      <i />
      {chaos ? "STABILISE" : "AMPLIFY SIGNAL"}
    </button>
  );
}
