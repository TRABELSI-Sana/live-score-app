import { useEffect, useRef } from "react";
import { getConsent } from "../../utils/cookieConsent";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  variant: "leaderboard" | "rectangle" | "in-feed" | "sidebar";
  slot: string;
  className?: string;
};

export default function AdSlot({ variant, slot, className }: Props) {
  const pushed = useRef(false);

  useEffect(() => {
    if (getConsent() !== "accepted") return;
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // noop
    }
  }, [slot]);

  if (getConsent() !== "accepted") return null;

  const format = variant === "in-feed" ? "fluid" : "auto";

  return (
    <div className={`ad-slot ad-slot--${variant}${className ? ` ${className}` : ""}`}>
      <span className="ad-slot-label">Publicite</span>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-6754395387524937"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
