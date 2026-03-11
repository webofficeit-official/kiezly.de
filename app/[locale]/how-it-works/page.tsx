'use client'

import React from 'react'
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';
import { useT } from '../layout';
import * as Icons from "lucide-react";

function getIcon(name: string): React.ElementType {
  return (Icons[name as keyof typeof Icons] as React.ElementType) || Icons.FileText;
}

export default function HowItWorksPage() {
  const { push } = useLocalizedRouter();
  const t = useT("howItWorks");
  const steps = t('steps') || [];
  const feesPayment = t('fees-payment.points') || [];
  const trustSafety = t('trust-safety.points') || [];
  const checklist = t('checklist.list') || [];

  const STEP_ICONS = [
    // Step 1: write job
    <svg key="s1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8622a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>,
    // Step 2: compare applicants
    <svg key="s2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8622a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>,
    // Step 3: hire
    <svg key="s3" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e8622a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>,
  ];

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: '64px' }}>

      {/* Page header */}
      <div style={{ borderBottom: '1px solid rgba(0,0,0,.07)', background: '#fff' }}>
        <div className="mx-auto max-w-4xl px-6 py-10">
          <span
            className="inline-block mb-3 text-[11px] font-semibold tracking-[.08em] uppercase"
            style={{ color: '#e8622a' }}
          >
            So einfach geht's
          </span>
          <h1
            className="font-display font-bold text-[36px] leading-[1.15] text-[#111110]"
            style={{ letterSpacing: '-.5px', marginBottom: '8px' }}
          >
            {t('header')}
          </h1>
          <p className="text-[15px] leading-[1.7]" style={{ color: 'rgba(17,17,16,.5)', maxWidth: '480px' }}>
            {t('subheader')}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-10">

        {/* Steps */}
        <div>
          <div className="relative">
            {/* Dashed connector */}
            <div
              className="absolute hidden md:block"
              style={{
                top: '36px',
                left: 'calc(16.666% + 20px)',
                right: 'calc(16.666% + 20px)',
                height: '1px',
                background: 'repeating-linear-gradient(90deg, rgba(232,98,42,.3) 0, rgba(232,98,42,.3) 6px, transparent 6px, transparent 14px)',
              }}
            />
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {Array.isArray(steps) && steps.map((step: any, i: number) => (
                <div
                  key={i}
                  className="relative flex flex-col"
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(0,0,0,.07)',
                    borderRadius: '14px',
                    padding: '26px 24px 28px',
                  }}
                >
                  {/* Number badge */}
                  <div
                    className="flex items-center justify-center font-display font-bold text-white mb-5 flex-shrink-0 self-start"
                    style={{
                      width: '40px', height: '40px', borderRadius: '12px',
                      background: '#e8622a', fontSize: '15px', letterSpacing: '-0.5px',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>

                  {/* Icon */}
                  <div
                    className="flex items-center justify-center mb-5 self-start"
                    style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'rgba(232,98,42,.08)', border: '1px solid rgba(232,98,42,.12)',
                    }}
                  >
                    {STEP_ICONS[i] ?? <Icons.FileText size={20} stroke="#e8622a" />}
                  </div>

                  <h3
                    className="font-display font-bold text-[#111110]"
                    style={{ fontSize: '15px', marginBottom: '8px', lineHeight: 1.3 }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'rgba(17,17,16,.5)', lineHeight: 1.65 }}>
                    {step.description}
                  </p>

                  {/* Arrow between cards */}
                  {i < 2 && (
                    <div
                      className="absolute hidden md:flex items-center justify-center"
                      style={{
                        right: '-14px', top: '34px', zIndex: 1,
                        width: '22px', height: '22px', borderRadius: '50%',
                        background: '#fff', border: '1px solid rgba(0,0,0,.1)',
                        color: '#e8622a', fontSize: '11px', fontWeight: 700,
                      }}
                    >
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fees & Trust — 2 col */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Fees */}
          <div
            style={{
              background: '#f7f7f5',
              border: '1px solid rgba(0,0,0,.07)',
              borderRadius: '14px',
              padding: '26px',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(232,98,42,.1)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8622a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <h2 className="font-display font-bold text-[#111110]" style={{ fontSize: '15px' }}>
                {t('fees-payment.title')}
              </h2>
            </div>
            <div className="space-y-3">
              {Array.isArray(feesPayment) && feesPayment.map((line: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div
                    className="flex-shrink-0 mt-[3px]"
                    style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(232,98,42,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <polyline points="1.5 4 3.5 6 6.5 2" stroke="#e8622a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-[13.5px] leading-[1.6]" style={{ color: 'rgba(17,17,16,.6)' }}>{line}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust & Safety */}
          <div
            style={{
              background: '#f7f7f5',
              border: '1px solid rgba(0,0,0,.07)',
              borderRadius: '14px',
              padding: '26px',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(26,158,95,.1)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a9e5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h2 className="font-display font-bold text-[#111110]" style={{ fontSize: '15px' }}>
                {t('trust-safety.title')}
              </h2>
            </div>
            <div className="space-y-3">
              {Array.isArray(trustSafety) && trustSafety.map((line: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <div
                    className="flex-shrink-0 mt-[3px]"
                    style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(26,158,95,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <polyline points="1.5 4 3.5 6 6.5 2" stroke="#1a9e5f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-[13.5px] leading-[1.6]" style={{ color: 'rgba(17,17,16,.6)' }}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div
          style={{
            background: '#111110',
            borderRadius: '14px',
            padding: '30px',
          }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(232,98,42,.2)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e8622a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <h2 className="font-display font-bold text-white" style={{ fontSize: '15px' }}>
              {t('checklist.title')}
            </h2>
          </div>
          <p className="text-[12px] mb-5 ml-[48px]" style={{ color: 'rgba(255,255,255,.35)' }}>
            {t('checklist.description')}
          </p>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {Array.isArray(checklist) && checklist.map((line: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div
                  className="flex-shrink-0 mt-[3px]"
                  style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(232,98,42,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <polyline points="1.5 4 3.5 6 6.5 2" stroke="#e8622a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[13px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.6)' }}>{line}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer nav */}
        <div
          className="pt-6 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(0,0,0,.07)' }}
        >
          <button
            onClick={() => push("/")}
            className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors"
            style={{ color: 'rgba(17,17,16,.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e8622a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(17,17,16,.45)'; }}
          >
            ← {t('go-back')}
          </button>
          <button
            onClick={() => push("/post-job/basic-details")}
            className="inline-flex items-center gap-2 font-semibold text-white text-[13px] transition-all"
            style={{ height: '38px', padding: '0 18px', borderRadius: '8px', background: '#e8622a', border: 'none' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#d4561f'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#e8622a'; }}
          >
            Jetzt Job ausschreiben →
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          div[style*="gridTemplateColumns: 'repeat(3, 1fr)'"],
          div[style*="gridTemplateColumns: '1fr 1fr'"],
          div[style*="gridTemplateColumns: 'repeat(2, 1fr)'"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
