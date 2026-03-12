'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const LOCALES = [
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
];

export default function LanguageSwitcher() {
  const router   = useRouter();
  const pathname = usePathname();
  const ref      = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Detect current locale from URL
  const segments    = pathname.split('/').filter(Boolean);
  const currentCode = LOCALES.find(l => l.code === segments[0])?.code ?? 'de';
  const current     = LOCALES.find(l => l.code === currentCode)!;

  const handleSelect = (code: string) => {
    const segs = pathname.split('/').filter(Boolean);
    if (LOCALES.some(l => l.code === segs[0])) {
      segs[0] = code;
    } else {
      segs.unshift(code);
    }
    router.push('/' + segs.join('/'));
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,.15)] bg-[rgba(255,255,255,.06)] px-3 py-1.5 text-[13px] font-medium text-white transition-all hover:bg-[rgba(255,255,255,.12)] hover:border-[rgba(255,255,255,.25)]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="tracking-wide">{current.code.toUpperCase()}</span>
        <ChevronDown
          className="h-3.5 w-3.5 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-[#efefec] bg-white py-1.5 shadow-xl z-[300]"
          role="listbox"
        >
          {LOCALES.map(locale => {
            const isActive = locale.code === currentCode;
            return (
              <button
                key={locale.code}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(locale.code)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-[#f7f7f5]"
              >
                <span className="text-xl leading-none">{locale.flag}</span>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#111110]">{locale.label}</p>
                  <p className="text-[11px]" style={{ color: 'rgba(17,17,16,.4)' }}>{locale.code.toUpperCase()}</p>
                </div>
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-kz-accent flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
