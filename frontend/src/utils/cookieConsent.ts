const CONSENT_KEY = "cookie_consent";
const CONSENT_DATE_KEY = "cookie_consent_date";

export type ConsentValue = "accepted" | "refused" | null;

export function getConsent(): ConsentValue {
    try {
        const value = localStorage.getItem(CONSENT_KEY);
        if (value === "accepted" || value === "refused") return value;
    } catch {
        // localStorage unavailable
    }
    return null;
}

export function setConsent(value: "accepted" | "refused") {
    try {
        localStorage.setItem(CONSENT_KEY, value);
        localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    } catch {
        // localStorage unavailable
    }
}

export function loadAdSenseScript() {
    if (document.querySelector('script[src*="adsbygoogle"]')) return;
    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6754395387524937";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
}
