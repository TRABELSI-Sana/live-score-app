import { useState, useEffect } from "react";
import { getConsent, loadAdSenseScript, setConsent } from "../utils/cookieConsent";

export default function CookieConsent() {
    const [visible, setVisible] = useState(() => getConsent() === null);

    useEffect(() => {
        if (getConsent() === "accepted") {
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
