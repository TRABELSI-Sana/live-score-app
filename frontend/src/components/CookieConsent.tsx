import { useState, useEffect } from "react";

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

function setConsent(value: "accepted" | "refused") {
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

export default function CookieConsent() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = getConsent();
        if (consent === null) {
            setVisible(true);
        } else if (consent === "accepted") {
            loadAdSenseScript();
        }
    }, []);

    const handleAccept = () => {
        setConsent("accepted");
        loadAdSenseScript();
        setVisible(false);
    };

    const handleRefuse = () => {
        setConsent("refused");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="cookie-consent" role="dialog" aria-label="Consentement aux cookies">
            <div className="cookie-consent-inner">
                <div className="cookie-consent-text">
                    <p className="cookie-consent-title">Nous respectons votre vie privee</p>
                    <p>
                        LiveFoot utilise des cookies publicitaires (Google AdSense) pour financer ce service gratuit.
                        Aucun cookie publicitaire n'est depose sans votre accord.
                    </p>
                    <p className="cookie-consent-links">
                        <a href="/privacy.html">Politique de confidentialite</a>
                        {" · "}
                        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
                            Comment Google utilise vos donnees
                        </a>
                    </p>
                </div>
                <div className="cookie-consent-actions">
                    <button type="button" className="cookie-btn cookie-btn--accept" onClick={handleAccept}>
                        Accepter
                    </button>
                    <button type="button" className="cookie-btn cookie-btn--refuse" onClick={handleRefuse}>
                        Refuser
                    </button>
                </div>
            </div>
        </div>
    );
}
