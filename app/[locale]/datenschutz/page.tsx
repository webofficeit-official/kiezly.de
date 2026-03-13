'use client'

import React, { useState } from 'react'
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';
import { useT } from '../layout';

export default function DatenschutzPage() {
  const { push } = useLocalizedRouter();
  const t = useT("privacy");
  const lists: { title: string; description: string }[] = t("lists") || [];
  const [activeSection, setActiveSection] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: '64px' }}>

      {/* Page header */}
      <div style={{ borderBottom: '1px solid rgba(0,0,0,.07)', background: '#fff' }}>
        <div className="mx-auto max-w-3xl px-6 py-10">
          <span
            className="inline-block mb-3 text-[11px] font-semibold tracking-[.08em] uppercase"
            style={{ color: '#e8622a' }}
          >
            {t("description")}
          </span>
          <h1
            className="font-display font-bold text-[36px] leading-[1.15] text-[#111110]"
            style={{ letterSpacing: '-.5px', marginBottom: '12px' }}
          >
            {t("header")}
          </h1>
          <p
            className="text-[15px] leading-[1.7] max-w-[600px]"
            style={{ color: 'rgba(17,17,16,.5)' }}
          >
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12">

        {/* Table of contents */}
        <div
          className="mb-10 rounded-[12px] p-6"
          style={{ background: '#f7f7f5', border: '1px solid rgba(0,0,0,.06)' }}
        >
          <p className="text-[11px] font-semibold tracking-[.08em] uppercase mb-4" style={{ color: 'rgba(17,17,16,.4)' }}>
            {t("toc-title") || "Inhaltsübersicht"}
          </p>
          <div className="grid gap-1.5">
            {lists.map((item, i) => (
              <a
                key={i}
                href={`#section-${i}`}
                className="flex items-center gap-3 text-[13.5px] transition-colors no-underline group"
                style={{ color: 'rgba(17,17,16,.6)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#e8622a'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(17,17,16,.6)'; }}
              >
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: '#e8622a', opacity: 0.85 }}
                >
                  {i + 1}
                </span>
                {item.title}
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {lists.map((item, i) => (
            <div
              key={i}
              id={`section-${i}`}
              className="rounded-[12px] overflow-hidden"
              style={{ border: '1px solid rgba(0,0,0,.06)' }}
            >
              {/* Section header — clickable to expand/collapse */}
              <button
                className="w-full flex items-center gap-4 px-6 py-5 text-left transition-colors"
                style={{
                  background: activeSection === i ? '#fff' : '#fafaf9',
                  borderBottom: activeSection === i ? '1px solid rgba(0,0,0,.06)' : 'none',
                }}
                onClick={() => setActiveSection(activeSection === i ? null : i)}
                onMouseEnter={e => { if (activeSection !== i) (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'; }}
                onMouseLeave={e => { if (activeSection !== i) (e.currentTarget as HTMLButtonElement).style.background = '#fafaf9'; }}
              >
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: '#e8622a' }}
                >
                  {i + 1}
                </div>
                <span className="flex-1 font-display font-semibold text-[15px] text-[#111110]">
                  {item.title}
                </span>
                <span
                  className="flex-shrink-0 text-[18px] font-light transition-transform duration-200"
                  style={{
                    color: 'rgba(17,17,16,.35)',
                    transform: activeSection === i ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                >
                  +
                </span>
              </button>

              {/* Section body */}
              {activeSection === i && (
                <div
                  className="px-6 py-5 pl-[4.5rem] privacy-content"
                  style={{ background: '#fff' }}
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer nav */}
        <div
          className="mt-10 pt-8 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(0,0,0,.07)' }}
        >
          <button
            onClick={() => push("/")}
            className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors"
            style={{ color: 'rgba(17,17,16,.5)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#e8622a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(17,17,16,.5)'; }}
          >
            ← {t("go-back")}
          </button>
          <span className="text-[12px]" style={{ color: 'rgba(17,17,16,.3)' }}>
            kiezly.de
          </span>
        </div>
      </div>

      {/* Inline styles for rich HTML content */}
      <style>{`
        .privacy-content { font-size: 14px; line-height: 1.75; color: rgba(17,17,16,.65); }
        .privacy-content p { margin-bottom: 12px; }
        .privacy-content p:last-child { margin-bottom: 0; }
        .privacy-content ul { list-style: none; padding: 0; margin: 0 0 12px; }
        .privacy-content ul li { position: relative; padding-left: 18px; margin-bottom: 6px; }
        .privacy-content ul li::before { content: '—'; position: absolute; left: 0; color: #e8622a; font-weight: 600; }
        .privacy-content strong { color: #111110; font-weight: 600; }
        .privacy-content a { color: #e8622a; text-decoration: none; }
        .privacy-content a:hover { text-decoration: underline; }
        .privacy-content table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 13px; }
        .privacy-content th { background: #f7f7f5; padding: 8px 12px; text-align: left; border-bottom: 1px solid rgba(0,0,0,.08); font-weight: 600; color: #111110; }
        .privacy-content td { padding: 8px 12px; border-bottom: 1px solid rgba(0,0,0,.05); vertical-align: top; }
        .privacy-content tr:last-child td { border-bottom: none; }
      `}</style>
    </div>
  );
}
