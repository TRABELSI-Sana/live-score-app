import { useEffect } from "react";
import { getConsent } from "./CookieConsent";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseUnitProps = {
  slot: string;
  className?: string;
  format?: string;
  fullWidthResponsive?: boolean;
};

export default function AdSenseUnit({
  slot,
  className,
  format = "auto",
  fullWidthResponsive = true,
}: AdSenseUnitProps) {
  useEffect(() => {
    if (getConsent() !== "accepted") return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // noop
    }
  }, [slot]);

  if (getConsent() !== "accepted") return null;

  return (
    <ins
      className={`adsbygoogle${className ? ` ${className}` : ""}`}
      style={{ display: "block" }}
      data-ad-client="ca-pub-6754395387524937"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={String(fullWidthResponsive)}
    />
  );
}
