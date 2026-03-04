import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseUnitProps = {
  /** Your ad slot id from AdSense */
  slot: string;
  /** Optional extra className for layout */
  className?: string;
  /** Default: auto */
  format?: string;
  /** Default: true */
  fullWidthResponsive?: boolean;
};

/**
 * Minimal AdSense unit for React/Vite.
 * IMPORTANT: Only render after your site is approved and only on pages with enough content.
 */
export default function AdSenseUnit({
  slot,
  className,
  format = "auto",
  fullWidthResponsive = true,
}: AdSenseUnitProps) {
  useEffect(() => {
    // AdSense requires calling push() after the <ins> exists in the DOM.
    // Wrap in try/catch to avoid crashing the app if AdSense is blocked.
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // noop
    }
  }, [slot]);

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
