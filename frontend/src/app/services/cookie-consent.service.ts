import { Injectable, signal } from '@angular/core';

export type ConsentValue = 'accepted' | 'refused' | null;

const CONSENT_KEY = 'cookie_consent';
const CONSENT_DATE_KEY = 'cookie_consent_date';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  readonly consent = signal<ConsentValue>(this.readConsent());

  accept(): void {
    this.writeConsent('accepted');
    this.consent.set('accepted');
    this.loadAdSenseScript();
  }

  refuse(): void {
    this.writeConsent('refused');
    this.consent.set('refused');
  }

  initAdsIfAccepted(): void {
    if (this.consent() === 'accepted') {
      this.loadAdSenseScript();
    }
  }

  private readConsent(): ConsentValue {
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      if (value === 'accepted' || value === 'refused') return value;
    } catch { /* An unavailable browser API must not block the page. */ }
    return null;
  }

  private writeConsent(value: 'accepted' | 'refused'): void {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    } catch { /* An unavailable browser API must not block the page. */ }
  }

  private loadAdSenseScript(): void {
    if (document.querySelector('script[src*="adsbygoogle"]')) return;
    const script = document.createElement('script');
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6754395387524937';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
}
