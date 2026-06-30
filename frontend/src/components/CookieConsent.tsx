import { useState, useEffect } from "react";

const CONSENT_KEY = "cookie_consent";

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
        <div className="cookieConsent">
            <div className="cookieConsentInner">
                <p>
                    Ce site utilise des cookies pour afficher des publicites personnalisees et ameliorer votre experience.
                    Vous pouvez accepter ou refuser leur utilisation.
                </p>
                <div className="cookieConsentActions">
                    <button type="button" className="cookieBtn cookieBtnAccept" onClick={handleAccept}>
                        Accepter
                    </button>
                    <button type="button" className="cookieBtn cookieBtnRefuse" onClick={handleRefuse}>
                        Refuser
                    </button>
                    <a href="/privacy.html" className="cookieLink">Politique de confidentialite</a>
                </div>
            </div>
        </div>
    );
}
