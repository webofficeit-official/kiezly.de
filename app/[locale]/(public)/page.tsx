"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCollections } from "@/lib/react-query/queries/user/account";
import { getIconForCategory } from "@/components/ui/icon-category";
import { useAuth } from "@/lib/context/auth-context";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "../layout";
import { getIcon } from "@/lib/icons/icons";

// ── Static live-job strip data ───────────────────────────────────────
const STRIP_JOBS = [
  { icon: "🛒", title: "Einkaufshilfe gesucht",     meta: "Mitte · vor 10 Min.",    price: "15 €" },
  { icon: "🐕", title: "Hundesitter Wochenende",    meta: "Nordstadt · vor 22 Min.", price: "40 €" },
  { icon: "🔨", title: "IKEA Möbel aufbauen",       meta: "Westend · vor 1 Std.",    price: "25 €" },
  { icon: "🌿", title: "Garten mähen & umgraben",   meta: "Südstadt · vor 2 Std.",   price: "50 €" },
  { icon: "🧹", title: "Wohnung reinigen",           meta: "Altstadt · vor 3 Std.",   price: "35 €" },
];

// ── Static feature cards ─────────────────────────────────────────────
const FEATURES = [
  { icon: "🪪", title: "Verifizierte Profile",  desc: "Jeder Helfer durchläuft eine Identitätsprüfung. Du weißt immer, wer vor deiner Tür steht." },
  { icon: "🔒", title: "Sichere Zahlung",        desc: "Geld wird erst freigegeben, wenn der Job erledigt ist. Vollständiger Käuferschutz inklusive." },
  { icon: "⭐", title: "Echte Bewertungen",      desc: "Transparentes System nach jedem Job. Nur wirkliche Nutzer können bewerten." },
  { icon: "📍", title: "Hyper-lokal",            desc: "Kiezly zeigt dir nur Helfer und Jobs in deiner direkten Nachbarschaft." },
  { icon: "⚡", title: "Schnelle Matches",       desc: "Durchschnittlich findest du in unter 30 Minuten einen passenden Helfer." },
  { icon: "💬", title: "Direkter Chat",          desc: "Kommuniziere direkt mit deinem Helfer – sicher, einfach, ohne Umwege." },
];

// ── Static trust stats ───────────────────────────────────────────────
const TRUST_STATS = [
  { num: "4", accent: ".8★", label: "Ø Bewertung",    desc: "Basierend auf tausenden abgeschlossenen Jobs in der Nachbarschaft." },
  { num: "2", accent: "k+",  label: "Aktive Helfer",  desc: "Geprüfte Helfer in deiner Umgebung, bereit für deinen nächsten Auftrag." },
  { num: "98",accent: "%",   label: "Zufriedenheit",  desc: "Unsere Nutzer empfehlen Kiezly weiter – für zuverlässige Mini-Jobs ohne Stress." },
];

// ── Category emoji mapping ───────────────────────────────────────────
const CAT_EMOJI: Record<string, string> = {
  "einkaufen": "🛒", "shopping": "🛒",
  "tiersitter": "🐕", "pet": "🐕", "pets": "🐕",
  "handwerk": "🔨", "craft": "🔨",
  "garten": "🌿", "garden": "🌿",
  "umzug": "📦", "moving": "📦",
  "putzen": "🧹", "cleaning": "🧹",
  "kinderbetreuung": "👶", "childcare": "👶",
  "nachhilfe": "💡", "tutoring": "💡",
  "seniorenbetreuung": "🧓", "senior": "🧓",
  "haushalt": "🏠", "household": "🏠",
  "event": "🎉", "events": "🎉",
};

function getCatEmoji(slug: string): string {
  const lower = slug.toLowerCase();
  for (const [key, emoji] of Object.entries(CAT_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "✨";
}

export default function Page() {
  const collections = useCollections();
  const [categories, setCategories] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const { user } = useAuth();
  const { push } = useLocalizedRouter();
  const t = useT("home");
  const howItWorksSteps = t("how-it-works.steps") || [];

  React.useEffect(() => {
    setIsLoading(true);
    collections.mutate(
      {},
      {
        onSuccess: (data: any) => {
          setCategories(data.data.jobCategories);
          setIsLoading(false);
        },
        onError: () => setIsLoading(false),
      }
    );
  }, []);

  const handleCategoryClick = (slug: string) => {
    if (user?.role === "client") {
      push(`/post-job/basic-details?category=${slug}`);
    } else {
      push(`/jobs?category=${encodeURIComponent(slug)}`);
    }
  };

  const handlePostJob = () => push(user ? "/post-job/basic-details" : "/signup?role=client");
  const handleBecomeHelper = () => push(user ? "/jobs" : "/signup?role=helper");

  const heroCardRef = React.useRef<HTMLDivElement>(null);
  const heroSectionRef = React.useRef<HTMLElement>(null);
  const handleHeroMouseMove = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = heroCardRef.current;
    const section = heroSectionRef.current;
    if (!card || !section) return;
    const rect = section.getBoundingClientRect();
    const dx = (e.clientX - rect.left) / rect.width * 2 - 1;   // -1 … +1 across full section
    const dy = (e.clientY - rect.top)  / rect.height * 2 - 1;  // -1 … +1
    card.style.transform = `perspective(900px) rotateY(${dx * 14}deg) rotateX(${-dy * 10}deg) translateZ(10px)`;
  }, []);
  const handleHeroMouseLeave = React.useCallback(() => {
    const card = heroCardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
  }, []);

  return (
    <main className="bg-white text-[#111110]" style={{ paddingTop: '64px' }}>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroSectionRef}
        className="relative overflow-hidden"
        style={{ minHeight: '100vh', padding: '120px 48px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,.07) 1px, transparent 1px), linear-gradient(90deg,rgba(0,0,0,.07) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 50%, black 40%, transparent 100%)',
          }}
        />
        {/* Accent glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '10%', right: '5%',
            width: '600px', height: '500px',
            background: 'radial-gradient(ellipse, rgba(232,98,42,.07) 0%, transparent 70%)',
          }}
        />

        {/* ── LEFT: Hero content ── */}
        <div className="relative z-[1]">
          <div className="kz-hero-label kz-fade-up kz-d1">
            Mini-Jobs · Nachbarschaft · Deutschland
          </div>

          <h1
            className="kz-fade-up kz-d2 font-display font-extrabold text-[#111110]"
            style={{
              fontSize: 'clamp(40px, 5vw, 80px)',
              lineHeight: 1.0,
              letterSpacing: '-3px',
              marginBottom: '32px',
            }}
          >
            {t("heading") || "Mini-Jobs."}<br />
            <span style={{ color: '#e8622a' }}>{t("heading-underline") || "Echte"}</span> Helfer.<br />
            <span style={{ color: 'rgba(17,17,16,.25)' }}>Dein Kiez.</span>
          </h1>

          <p
            className="kz-fade-up kz-d3"
            style={{
              fontSize: '16px',
              fontWeight: 300,
              lineHeight: 1.75,
              color: 'rgba(17,17,16,.45)',
              maxWidth: '440px',
              marginBottom: '44px',
            }}
          >
            {t("subheader") || "Finde zuverlässige Helfer direkt aus deiner Nachbarschaft – oder verdiene Geld mit kleinen Aufträgen, die zu deinem Alltag passen."}
          </p>

          <div className="kz-fade-up kz-d4 flex gap-3 items-center flex-wrap">
            <button
              onClick={handlePostJob}
              className="inline-flex items-center gap-2 font-semibold text-white transition-all hover:-translate-y-px"
              style={{ height: '46px', padding: '0 24px', borderRadius: '8px', background: '#111110', border: 'none', fontSize: '14px' }}
            >
              {t("help.mini‑job") || "Job ausschreiben"} →
            </button>
            <button
              onClick={handleBecomeHelper}
              className="inline-flex items-center gap-2 font-medium transition-all"
              style={{ height: '46px', padding: '0 24px', borderRadius: '8px', border: '1px solid rgba(0,0,0,.13)', background: 'transparent', color: 'rgba(17,17,16,.55)', fontSize: '14px' }}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.color = '#111110'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,.3)'; }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(17,17,16,.55)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,0,0,.13)'; }}
            >
              {t("help.helper") || "Helfer werden"}
            </button>
          </div>

          {/* Live job strip — below buttons */}
          <div
            className="kz-fade-up kz-d5 flex gap-3 overflow-x-auto pb-1"
            style={{ marginTop: '52px' }}
          >
            {STRIP_JOBS.slice(0, 3).map((job, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center gap-3 transition-all cursor-pointer"
                style={{ background: '#f7f7f5', border: '1px solid rgba(0,0,0,.07)', borderRadius: '10px', padding: '12px 16px', minWidth: '190px' }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,.13)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,.06)'; }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,.07)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                <div className="flex items-center justify-center flex-shrink-0 text-[15px]" style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#efefec' }}>
                  {job.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[#111110] truncate">{job.title}</div>
                  <div className="text-[11px] text-[rgba(17,17,16,.4)] mt-[1px]">
                    <span className="kz-live-dot" />{job.meta}
                  </div>
                </div>
                <div className="text-[12px] font-semibold ml-auto" style={{ color: '#1a9e5f' }}>{job.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: 3D tilt card ── */}
        <div className="relative z-[1] hidden lg:flex items-center justify-center" style={{ perspective: '900px' }}>
          <div
            ref={heroCardRef}
            className="hero-tilt-card"
            style={{
              width: '100%',
              maxWidth: '420px',
              transition: 'transform 0.12s ease-out',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Main card */}
            <div
              className="relative rounded-[20px] p-5"
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,.09)',
                boxShadow: '0 24px 60px rgba(0,0,0,.1), 0 4px 16px rgba(0,0,0,.06)',
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px]" style={{ background: '#f7f7f5' }}>🛒</div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#111110]">Einkaufshilfe gesucht</div>
                    <div className="text-[11px]" style={{ color: 'rgba(17,17,16,.4)' }}>Mitte · vor 5 Min.</div>
                  </div>
                </div>
                <span className="kz-tag-green">Offen</span>
              </div>

              {/* Price bar */}
              <div className="flex items-center justify-between rounded-[10px] px-4 py-3 mb-4" style={{ background: '#f7f7f5' }}>
                <div>
                  <div className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(17,17,16,.35)' }}>Bezahlung</div>
                  <div className="text-[20px] font-display font-extrabold text-[#111110]" style={{ letterSpacing: '-0.5px' }}>15 <span style={{ color: '#1a9e5f' }}>€</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(17,17,16,.35)' }}>Bewerber</div>
                  <div className="text-[20px] font-display font-extrabold text-[#111110]">3</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: 'rgba(17,17,16,.35)' }}>Ø Bewert.</div>
                  <div className="text-[20px] font-display font-extrabold text-[#111110]">4.9<span style={{ color: '#e8622a', fontSize: '14px' }}>★</span></div>
                </div>
              </div>

              {/* Applicant rows */}
              {[
                { name: 'Tobias M.', rating: '★ 4.9', jobs: '23 Jobs', color: '#e8622a' },
                { name: 'Laura K.',  rating: '★ 4.8', jobs: '17 Jobs', color: '#1a9e5f' },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 mb-2 last:mb-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                    style={{ background: a.color }}
                  >
                    {a.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#111110]">{a.name}</div>
                    <div className="text-[11px]" style={{ color: 'rgba(17,17,16,.4)' }}>{a.rating} · {a.jobs}</div>
                  </div>
                  <button
                    className="text-[11px] font-semibold px-3 py-1 rounded-[6px] text-white flex-shrink-0"
                    style={{ background: i === 0 ? '#e8622a' : 'rgba(0,0,0,.08)', color: i === 0 ? '#fff' : 'rgba(17,17,16,.5)' }}
                  >
                    {i === 0 ? 'Auswählen' : 'Profil'}
                  </button>
                </div>
              ))}
            </div>

            {/* Floating badge 1 – top right */}
            <div
              className="hero-float-1 absolute flex items-center gap-2 px-3 py-2 rounded-[10px] pointer-events-none"
              style={{
                top: '-18px', right: '-20px',
                background: '#111110',
                boxShadow: '0 8px 24px rgba(0,0,0,.18)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                transformStyle: 'preserve-3d',
                transform: 'translateZ(30px)',
              }}
            >
              <span className="kz-live-dot" style={{ background: '#1a9e5f' }} />
              Job erledigt · 15 €
            </div>

            {/* Floating badge 2 – bottom left */}
            <div
              className="hero-float-2 absolute flex items-center gap-2 px-3 py-2 rounded-[10px] pointer-events-none"
              style={{
                bottom: '-16px', left: '-18px',
                background: '#fff',
                border: '1px solid rgba(0,0,0,.08)',
                boxShadow: '0 8px 24px rgba(0,0,0,.1)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#111110',
                transformStyle: 'preserve-3d',
                transform: 'translateZ(20px)',
              }}
            >
              ⚡ Match in 8 Min.
            </div>

            {/* Floating badge 3 – mid right */}
            <div
              className="hero-float-3 absolute flex items-center gap-2 px-3 py-2 rounded-[10px] pointer-events-none"
              style={{
                right: '-24px', top: '50%', marginTop: '-18px',
                background: 'rgba(26,158,95,.95)',
                boxShadow: '0 8px 24px rgba(26,158,95,.25)',
                fontSize: '12px',
                fontWeight: 600,
                color: '#fff',
                transformStyle: 'preserve-3d',
                transform: 'translateZ(25px)',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Verifiziert
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-10 left-12 flex items-center gap-3 text-[11px] tracking-[.12em] uppercase"
          style={{ color: 'rgba(17,17,16,.25)' }}
        >
          <span style={{ display: 'inline-block', width: '36px', height: '1px', background: 'rgba(17,17,16,.25)' }} />
          scroll
        </div>
      </section>

      <div className="kz-divider mx-12" />

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════ */}
      <section id="how" style={{ padding: '100px 48px' }}>
        <div className="kz-section-label">So funktioniert's</div>
        <h2
          className="font-display font-extrabold text-[#111110]"
          style={{ fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '16px' }}
        >
          {t("how-it-works.title") || <>In 3 Schritten zum <span style={{ color: '#e8622a' }}>Match</span></>}
        </h2>
        <p className="text-[15px] leading-[1.7] max-w-[480px]" style={{ color: 'rgba(17,17,16,.45)', marginBottom: '0' }}>
          {t("how-it-works.description") || "Kein kompliziertes Onboarding. Job beschreiben, Helfer auswählen, erledigt."}
        </p>

        <div
          className="grid gap-[80px] items-start"
          style={{ gridTemplateColumns: '1fr 1fr', marginTop: '64px' }}
        >
          {/* Steps */}
          <div className="flex flex-col">
            {Array.isArray(howItWorksSteps) && howItWorksSteps.length > 0
              ? howItWorksSteps.map((step: any, i: number) => {
                  const IconComponent = getIcon(step.icon);
                  return (
                    <div
                      key={i}
                      className="grid gap-5"
                      style={{
                        gridTemplateColumns: '52px 1fr',
                        padding: i === 0 ? '0 0 32px' : '32px 0',
                        borderBottom: i < howItWorksSteps.length - 1 ? '1px solid rgba(0,0,0,.07)' : 'none',
                      }}
                    >
                      <div
                        className="font-display font-extrabold leading-none select-none"
                        style={{ fontSize: '72px', color: '#e8622a', opacity: 0.18, letterSpacing: '-3px', marginTop: '-8px' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h3
                          className="font-display font-bold text-[#111110]"
                          style={{ fontSize: '17px', marginBottom: '8px' }}
                        >
                          {step.title}
                        </h3>
                        <p style={{ fontSize: '14px', color: 'rgba(17,17,16,.45)', lineHeight: 1.65 }}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              : [
                  { num: "01", title: "Job beschreiben", desc: "Erkläre kurz, was du brauchst – von Einkaufen bis Umzugshelfer." },
                  { num: "02", title: "Helfer auswählen", desc: "Geprüfte Helfer aus deiner Nachbarschaft bewerben sich." },
                  { num: "03", title: "Erledigt & sicher bezahlt", desc: "Job wird erledigt, Zahlung läuft automatisch über Kiezly." },
                ].map((s, i, arr) => (
                  <div
                    key={i}
                    className="grid gap-5"
                    style={{
                      gridTemplateColumns: '52px 1fr',
                      padding: i === 0 ? '0 0 32px' : '32px 0',
                      borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,.07)' : 'none',
                    }}
                  >
                    <div className="font-display font-extrabold leading-none select-none" style={{ fontSize: '72px', color: '#e8622a', opacity: 0.18, letterSpacing: '-3px', marginTop: '-8px' }}>
                      {s.num}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-[#111110]" style={{ fontSize: '17px', marginBottom: '8px' }}>{s.title}</h3>
                      <p style={{ fontSize: '14px', color: 'rgba(17,17,16,.45)', lineHeight: 1.65 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
          </div>

          {/* Live panel */}
          <div
            className="sticky"
            style={{
              top: '80px',
              background: '#f7f7f5',
              border: '1px solid rgba(0,0,0,.07)',
              borderRadius: '16px',
              padding: '28px',
            }}
          >
            <div
              className="font-semibold tracking-[.1em] uppercase mb-[18px]"
              style={{ fontSize: '11px', color: 'rgba(17,17,16,.45)' }}
            >
              Live Jobs — Deutschland
            </div>
            {[
              {
                iconBg: 'rgba(232,98,42,.1)',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8622a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                ),
                title: "Wocheneinkauf erledigen", sub: "Rewe Mitte · Heute 14:00", price: "15 €", tag: "open",
              },
              {
                iconBg: 'rgba(17,17,16,.06)',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111110" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                ),
                title: "Tobias M. hat sich beworben", sub: "★ 4.9 · 23 abg. Jobs", tag: "select",
              },
              {
                iconBg: 'rgba(26,158,95,.1)',
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a9e5f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ),
                title: "Job abgeschlossen!", sub: "Zahlung freigegeben", price: "15 €", tag: "paid",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,.07)',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  marginBottom: i < 2 ? '10px' : '0',
                }}
              >
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{ width: '34px', height: '34px', borderRadius: '7px', background: item.iconBg }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[#111110]">{item.title}</div>
                  <div className="text-[11px] mt-[2px]" style={{ color: 'rgba(17,17,16,.45)' }}>{item.sub}</div>
                </div>
                <div className="text-right ml-auto flex-shrink-0 flex flex-col items-end gap-1">
                  {item.price && <div className="text-[13px] font-semibold" style={{ color: '#1a9e5f' }}>{item.price}</div>}
                  {item.tag === "open"   && <span className="kz-tag-green">Offen</span>}
                  {item.tag === "select" && <span className="kz-tag-green">Auswählen</span>}
                  {item.tag === "paid"   && <span className="kz-tag-orange">Bezahlt</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="kz-divider mx-12" />

      {/* ══════════════════════════════════════════════════
          CATEGORIES
      ══════════════════════════════════════════════════ */}
      <section
        id="categories"
        style={{ padding: '100px 48px', background: '#f7f7f5' }}
      >
        <div className="kz-section-label">Kategorien</div>
        <h2
          className="font-display font-extrabold text-[#111110]"
          style={{ fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '16px' }}
        >
          {t("categories.title") || <>Was brauchst du <span style={{ color: '#e8622a' }}>heute</span>?</>}
        </h2>
        <p className="text-[15px] leading-[1.7] max-w-[480px]" style={{ color: 'rgba(17,17,16,.45)' }}>
          {t("categories.description") || "Von Alltagshilfen bis Handwerk – echte Menschen aus deinem Kiez helfen dir weiter."}
        </p>

        <div
          className="overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'rgba(0,0,0,.07)',
            border: '1px solid rgba(0,0,0,.07)',
            borderRadius: '12px',
            marginTop: '56px',
          }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{ background: '#f7f7f5', padding: '28px 24px' }}
                  className="flex flex-col gap-3"
                >
                  <div className="h-7 w-7 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                  <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                  <div className="h-3 w-20 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                </div>
              ))
            : categories.map(({ id, name, slug }) => (
                <div
                  key={id}
                  className="flex flex-col gap-3 cursor-pointer group transition-colors"
                  style={{ background: '#f7f7f5', padding: '28px 24px' }}
                  onClick={() => handleCategoryClick(slug)}
                  onMouseOver={e => (e.currentTarget as HTMLDivElement).style.background = '#efefec'}
                  onMouseOut={e => (e.currentTarget as HTMLDivElement).style.background = '#f7f7f5'}
                >
                  <div className="text-[26px]">{getCatEmoji(slug)}</div>
                  <div className="font-display font-semibold text-[#111110]" style={{ fontSize: '15px' }}>{name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(17,17,16,.45)' }}>
                    {t("categories.subtitle") || "Jobs verfügbar"}
                  </div>
                  <div
                    className="mt-auto text-[16px] transition-all"
                    style={{ color: 'rgba(17,17,16,.25)' }}
                    onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.color = '#e8622a'; (e.currentTarget as HTMLDivElement).style.transform = 'translate(3px,-3px)'; }}
                    onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.color = 'rgba(17,17,16,.25)'; (e.currentTarget as HTMLDivElement).style.transform = 'none'; }}
                  >
                    ↗
                  </div>
                </div>
              ))}
        </div>
      </section>

      <div className="kz-divider mx-12" />

      {/* ══════════════════════════════════════════════════
          TRUST / STATS
      ══════════════════════════════════════════════════ */}
      <section id="trust" style={{ padding: '100px 48px' }}>
        <div className="kz-section-label">Vertrauen &amp; Sicherheit</div>
        <h2
          className="font-display font-extrabold text-[#111110]"
          style={{ fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '16px' }}
        >
          {t("trust-safety.title") || <>Zahlen, die <span style={{ color: '#e8622a' }}>sprechen</span></>}
        </h2>
        <p className="text-[15px] leading-[1.7] max-w-[480px]" style={{ color: 'rgba(17,17,16,.45)' }}>
          {t("trust-safety.description") || "Kiezly ist auf echtem Vertrauen aufgebaut – verifizierte Profile, sichere Zahlung, echte Bewertungen."}
        </p>

        <div
          className="overflow-hidden"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'rgba(0,0,0,.07)',
            border: '1px solid rgba(0,0,0,.07)',
            borderRadius: '12px',
            marginTop: '56px',
          }}
        >
          {TRUST_STATS.map((stat, i) => (
            <div
              key={i}
              className="transition-colors"
              style={{ background: '#fff', padding: '40px 36px' }}
              onMouseOver={e => (e.currentTarget as HTMLDivElement).style.background = '#f7f7f5'}
              onMouseOut={e => (e.currentTarget as HTMLDivElement).style.background = '#fff'}
            >
              <div
                className="font-display font-extrabold text-[#111110]"
                style={{ fontSize: '42px', letterSpacing: '-2px', marginBottom: '6px' }}
              >
                {stat.num}<span style={{ color: '#e8622a' }}>{stat.accent}</span>
              </div>
              <div
                className="font-display font-semibold text-[#111110]"
                style={{ fontSize: '16px', marginBottom: '10px' }}
              >
                {stat.label}
              </div>
              <div style={{ fontSize: '13.5px', color: 'rgba(17,17,16,.45)', lineHeight: 1.65 }}>
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="kz-divider mx-12" />

      {/* ══════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════ */}
      <section style={{ padding: '100px 48px' }}>
        <div className="kz-section-label">Warum Kiezly</div>
        <h2
          className="font-display font-extrabold text-[#111110]"
          style={{ fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '16px' }}
        >
          Sicherheit ist <span style={{ color: '#e8622a' }}>kein Zufall</span>
        </h2>
        <p className="text-[15px] leading-[1.7] max-w-[480px]" style={{ color: 'rgba(17,17,16,.45)' }}>
          Jeder Schritt ist darauf ausgelegt, dass du dich auf den Job konzentrieren kannst.
        </p>

        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '56px' }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="transition-all"
              style={{
                border: '1px solid rgba(0,0,0,.07)',
                borderRadius: '12px',
                padding: '30px',
                background: '#fff',
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,.13)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,.05)';
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0,0,0,.07)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
              }}
            >
              <div
                className="flex items-center justify-center text-[18px] mb-5"
                style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,.07)', background: '#f7f7f5',
                }}
              >
                {f.icon}
              </div>
              <h3
                className="font-display font-bold text-[#111110]"
                style={{ fontSize: '15px', marginBottom: '10px' }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: '13.5px', color: 'rgba(17,17,16,.45)', lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden"
        style={{
          background: '#111110',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: '60px',
          padding: '80px 48px',
        }}
      >
        {/* Accent radial */}
        <div
          className="absolute pointer-events-none"
          style={{
            right: 0, top: '50%', transform: 'translateY(-50%)',
            width: '600px', height: '400px',
            background: 'radial-gradient(ellipse at right, rgba(232,98,42,.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-[1]">
          <div
            className="flex items-center gap-2 font-semibold tracking-[.12em] uppercase mb-6"
            style={{ fontSize: '11px', color: 'rgba(255,255,255,.35)' }}
          >
            <span style={{ display: 'inline-block', width: '20px', height: '1px', background: 'rgba(255,255,255,.2)' }} />
            Jetzt loslegen
          </div>
          <h2
            className="font-display font-extrabold text-white"
            style={{ fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: '12px' }}
          >
            {t("help.title") || <>Bereit für deinen ersten <span style={{ color: '#e8622a' }}>Kiez-Job?</span></>}
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: '520px' }}>
            {t("help.description") || "Poste deinen ersten Job in 2 Minuten – kostenlos und unverbindlich. Oder starte als Helfer und verdiene Geld in deiner Nachbarschaft."}
          </p>
        </div>

        <div className="relative z-[1] flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={handlePostJob}
            className="inline-flex items-center justify-center gap-2 font-semibold text-white whitespace-nowrap transition-all hover:-translate-y-px"
            style={{
              height: '46px', padding: '0 28px', borderRadius: '8px',
              background: '#e8622a', border: 'none', fontSize: '14px',
            }}
            onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = '#f0712f'}
            onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = '#e8622a'}
          >
            {t("help.mini‑job") || "Job ausschreiben"} →
          </button>
          <button
            onClick={handleBecomeHelper}
            className="inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-all"
            style={{
              height: '46px', padding: '0 28px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,.15)', background: 'transparent',
              color: 'rgba(255,255,255,.6)', fontSize: '14px',
            }}
            onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.35)'; }}
            onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,.6)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,.15)'; }}
          >
            {t("help.helper") || "Helfer werden"}
          </button>
        </div>
      </div>

      {/* Responsive overrides + hero animations */}
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes heroFloatBadge1 {
          0%, 100% { transform: translateY(0px) translateZ(30px); }
          50%       { transform: translateY(-8px) translateZ(30px); }
        }
        @keyframes heroFloatBadge2 {
          0%, 100% { transform: translateY(0px) translateZ(20px); }
          50%       { transform: translateY(-10px) translateZ(20px); }
        }
        @keyframes heroFloatBadge3 {
          0%, 100% { transform: translateY(0px) translateZ(25px); }
          50%       { transform: translateY(-11px) translateZ(25px); }
        }
        .hero-tilt-card  { animation: heroFloat 5s ease-in-out infinite; }
        .hero-float-1    { animation: heroFloatBadge1 4s ease-in-out infinite; animation-delay: -1.5s; }
        .hero-float-2    { animation: heroFloatBadge2 4.5s ease-in-out infinite; animation-delay: -3s; }
        .hero-float-3    { animation: heroFloatBadge3 3.8s ease-in-out infinite; animation-delay: -2s; }

        @media (max-width: 960px) {
          main > section, main > div[style*="padding: 100"] {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
          main > section[style*="min-height"] {
            grid-template-columns: 1fr !important;
            padding-top: 100px !important;
            padding-bottom: 60px !important;
          }
          .kz-divider { margin-left: 24px !important; margin-right: 24px !important; }
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; gap: 40px !important; }
          div[style*="gridTemplateColumns: 'repeat(4, 1fr)'"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="gridTemplateColumns: 'repeat(3, 1fr)'"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: '1fr auto'"] { grid-template-columns: 1fr !important; padding: 60px 24px !important; }
          div[style*="gridTemplateColumns: '1fr auto'"] > div:last-child { flex-direction: row !important; }
        }
          div[style*="gridTemplateColumns: 'repeat(3, 1fr)'"][style*="gap: '20px'"] { grid-template-columns: 1fr !important; }
      `}</style>
    </main>
  );
}
