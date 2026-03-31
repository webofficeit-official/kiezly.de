"use client";

import { useT } from '@/app/[locale]/layout';
import LocalizedLink from '@/lib/localizedLink';

export default function Footer() {
  const t = useT('footer');

  return (
    <footer style={{ borderTop: '1px solid rgba(0,0,0,.07)' }}>
      {/* Main grid */}
      <div
        className="grid gap-[60px] px-12 pt-16 pb-10"
        style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}
      >
        {/* Brand column */}
        <div>
          <div
            className="font-display font-bold text-[17px] text-[#111110] mb-3"
            style={{ letterSpacing: '-.3px' }}
          >
            kiezly<span className="text-[#e8622a]">.</span>
          </div>
          <p className="text-[13px] text-[rgba(17,17,16,.45)] leading-[1.7] max-w-[260px]">
            Mini-Jobs &amp; zuverlässige Helfer direkt aus deiner Nachbarschaft.
          </p>
        </div>

        {/* Produkt */}
        <div>
          <h4
            className="text-[11px] font-semibold tracking-[.1em] uppercase text-[rgba(17,17,16,.25)] mb-[18px]"
          >
            Produkt
          </h4>
          <LocalizedLink href="/how-it-works" className="block text-[13px] text-[rgba(17,17,16,.45)] hover:text-[#111110] transition-colors mb-[10px] no-underline">
            {t("how-it-works") || "So funktioniert's"}
          </LocalizedLink>
          <LocalizedLink href="/#categories" className="block text-[13px] text-[rgba(17,17,16,.45)] hover:text-[#111110] transition-colors mb-[10px] no-underline">
            {t("categories") || "Kategorien"}
          </LocalizedLink>
          <LocalizedLink href="/jobs" className="block text-[13px] text-[rgba(17,17,16,.45)] hover:text-[#111110] transition-colors mb-[10px] no-underline">
            {t("jobs") || "Jobs"}
          </LocalizedLink>
        </div>

        {/* Unternehmen */}
        <div>
          <h4
            className="text-[11px] font-semibold tracking-[.1em] uppercase text-[rgba(17,17,16,.25)] mb-[18px]"
          >
            Unternehmen
          </h4>
          <LocalizedLink href="/impressum" className="block text-[13px] text-[rgba(17,17,16,.45)] hover:text-[#111110] transition-colors mb-[10px] no-underline">
            {t("impressum") || "Impressum"}
          </LocalizedLink>
          <LocalizedLink href="/datenschutz" className="block text-[13px] text-[rgba(17,17,16,.45)] hover:text-[#111110] transition-colors mb-[10px] no-underline">
            {t("privacy") || "Datenschutz"}
          </LocalizedLink>
          <LocalizedLink href="/terms" className="block text-[13px] text-[rgba(17,17,16,.45)] hover:text-[#111110] transition-colors mb-[10px] no-underline">
            {t("terms") || "AGB"}
          </LocalizedLink>
        </div>

        {/* Rechtliches */}
        <div>
          <h4
            className="text-[11px] font-semibold tracking-[.1em] uppercase text-[rgba(17,17,16,.25)] mb-[18px]"
          >
            Rechtliches
          </h4>
          <LocalizedLink href="/impressum" className="block text-[13px] text-[rgba(17,17,16,.45)] hover:text-[#111110] transition-colors mb-[10px] no-underline">
            Impressum
          </LocalizedLink>
          <LocalizedLink href="/datenschutz" className="block text-[13px] text-[rgba(17,17,16,.45)] hover:text-[#111110] transition-colors mb-[10px] no-underline">
            Datenschutz
          </LocalizedLink>
          <LocalizedLink href="/terms" className="block text-[13px] text-[rgba(17,17,16,.45)] hover:text-[#111110] transition-colors mb-[10px] no-underline">
            AGB
          </LocalizedLink>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="mx-12 flex justify-between items-center py-8"
        style={{ borderTop: '1px solid rgba(0,0,0,.07)' }}
      >
        <span className="text-[12px] text-[rgba(17,17,16,.25)]">
          © 2025 Kiezly. Alle Rechte vorbehalten.
        </span>
        <span className="text-[12px] text-[rgba(17,17,16,.25)]">
          Made in Germany 🇩🇪
        </span>
      </div>

      {/* Mobile footer */}
      <style>{`
        @media (max-width: 768px) {
          footer > div:first-child {
            grid-template-columns: 1fr 1fr !important;
            gap: 40px !important;
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
          footer > div:last-child {
            margin-left: 24px !important;
            margin-right: 24px !important;
          }
        }
      `}</style>
    </footer>
  );
}
