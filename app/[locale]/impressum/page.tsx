'use client'

import React from 'react'
import { useLocalizedRouter } from '@/lib/useLocalizedRouter';
import { useT } from '../layout';

export default function ImpressumPage() {
  const { push } = useLocalizedRouter();
  const t = useT("impressum");
  const sections = t("sections") || [];

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
            style={{ letterSpacing: '-.5px' }}
          >
            {t("header")}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="space-y-8">
          {sections.map((section: { title: string; items: string[] }, i: number) => (
            <div
              key={i}
              className="rounded-[12px] p-6"
              style={{ background: '#f7f7f5', border: '1px solid rgba(0,0,0,.06)' }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white mt-[1px]"
                  style={{ background: '#e8622a' }}
                >
                  {i + 1}
                </div>
                <h2 className="font-display font-semibold text-[16px] text-[#111110]">
                  {section.title}
                </h2>
              </div>
              <div className="pl-9 space-y-2">
                {section.items.map((item: string, j: number) => (
                  <div
                    key={j}
                    className="text-[14px] leading-[1.7]"
                    style={{ color: 'rgba(17,17,16,.65)' }}
                    dangerouslySetInnerHTML={{ __html: item }}
                  />
                ))}
              </div>
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
    </div>
  );
}
