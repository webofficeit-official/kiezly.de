"use client";
import React from "react";
import dayjs from "dayjs";
import { Filters, DatePosted, SortBy, JobExperience, JobType, JobTag } from "@/lib/types/job";
import { useT } from "@/app/[locale]/layout";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { DateInput } from "@/components/DateInput/date-input";

type Props = {
  filters: Filters;
  update: (patch: Partial<Filters>) => void;
  toggleInArray: <T extends string | number>(key: keyof Filters, val: T) => void;
  resetAll: () => void;
  activeCount: number;
  collections: any;
  user?: any;
  onChange?: (f: Filters) => void;
};

// ── Reusable sub-components ──────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold tracking-[.08em] uppercase mb-2" style={{ color: 'rgba(17,17,16,.35)' }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'rgba(0,0,0,.06)' }} />;
}

function PillToggle({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="h-[30px] px-3 rounded-full text-[12px] font-medium transition-all"
            style={{
              border: active ? '1px solid rgba(232,98,42,.4)' : '1px solid rgba(0,0,0,.1)',
              background: active ? 'rgba(232,98,42,.08)' : '#f7f7f5',
              color: active ? '#e8622a' : 'rgba(17,17,16,.6)',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function JobFilterSidebar({
  filters,
  update,
  toggleInArray,
  resetAll,
  activeCount,
  collections,
  user,
  onChange,
}: Props) {
  const t = useT("jobs");

  const postedOptions = [
    { label: t("filter.form.date-posted.options.any") || "Jederzeit", value: "any" },
    { label: t("filter.form.date-posted.options.day")  || "Heute",    value: "1" },
    { label: t("filter.form.date-posted.options.week") || "7 Tage",   value: "7" },
    { label: t("filter.form.date-posted.options.month")|| "30 Tage",  value: "30" },
  ];

  const sortByOptions = [
    { label: t("filter.form.sort-by.options.new")  || "Neueste",  value: "new" },
    { label: t("filter.form.sort-by.options.desc") || "Preis ↓",  value: "price_desc" },
    { label: t("filter.form.sort-by.options.asc")  || "Preis ↑",  value: "price_asc" },
  ];

  return (
    <div
      className="sticky rounded-[12px]"
      style={{ top: '80px', background: '#fff', border: '1px solid rgba(0,0,0,.07)' }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,.07)' }}>
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-[14px] text-[#111110]">
            {t("filter.search") || "Filter"}
          </span>
          {activeCount > 0 && (
            <span
              className="inline-flex items-center justify-center rounded-full text-white text-[10px] font-bold w-5 h-5"
              style={{ background: '#e8622a' }}
            >
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={resetAll}
            className="text-[12px] font-medium transition-colors"
            style={{ color: '#e8622a' }}
          >
            {t("filter.reset") || "Zurücksetzen"}
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">

        {/* ── Keyword search ──────────────────────────── */}
        <div>
          <SectionLabel>{t("filter.search") || "Stichwort"}</SectionLabel>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(17,17,16,.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="q"
              type="search"
              inputMode="search"
              value={filters.q}
              onChange={(e) => update({ q: e.target.value })}
              placeholder={t("filter.form.keyword.placeholder") || "Stichwort..."}
              className="w-full text-[13px] text-[#111110] placeholder:text-[rgba(17,17,16,.3)] outline-none"
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,.1)',
                padding: '9px 12px 9px 34px',
                background: '#f7f7f5',
                transition: 'border-color .15s',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,.25)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,.1)')}
            />
          </div>
        </div>

        <Divider />

        {/* ── Location ────────────────────────────────── */}
        <div>
          <SectionLabel>{t("filter.form.location.label") || "Standort"}</SectionLabel>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="rgba(17,17,16,.35)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <div style={{ paddingLeft: '30px' }}>
              <LocationAutocomplete
                value={filters.city}
                onValueChange={(v) => update({ city: v })}
                onSelect={(s) => update({ city: s.label })}
                placeholder={t("filter.form.location.placeholder") || "Stadt oder Postleitzahl"}
                withCoords
                onlyOpen
                limit={8}
              />
            </div>
          </div>

          {/* Distance slider (only when user has location) */}
          {user?.lat && user?.lng && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-medium" style={{ color: 'rgba(17,17,16,.45)' }}>
                  {t("filter.form.distance.label") || "Umkreis"}
                </span>
                <span
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: (filters.radius_km ?? 0) > 0 ? 'rgba(26,158,95,.1)' : '#f7f7f5',
                    color: (filters.radius_km ?? 0) > 0 ? '#1a9e5f' : 'rgba(17,17,16,.4)',
                  }}
                >
                  {(filters.radius_km ?? 0) > 0 ? `${filters.radius_km} km` : t("filter.form.distance.inactive") || "Alle"}
                </span>
              </div>
              <input
                id="radius_km"
                type="range" min={0} max={150} step={5}
                value={filters.radius_km ?? 0}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (next > 0) {
                    update({ radius_km: next, lat: filters.lat ?? user?.lat, lng: filters.lng ?? user?.lng });
                  } else {
                    update({ radius_km: 0, lat: undefined, lng: undefined });
                  }
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: '#e8622a' }}
              />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: 'rgba(17,17,16,.3)' }}>
                <span>Alle</span><span>150 km</span>
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* ── Price range ──────────────────────────────── */}
        <div>
          <SectionLabel>{t("filter.form.hourly-pay.label") || "Stundenlohn (€)"}</SectionLabel>
          <div
            className="flex items-center gap-2 rounded-[8px] px-3 py-2"
            style={{ border: '1px solid rgba(0,0,0,.1)', background: '#f7f7f5' }}
          >
            <span className="text-[12px] font-semibold" style={{ color: 'rgba(17,17,16,.4)' }}>€</span>
            <input
              id="min_price"
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder="Min"
              value={filters.min_price}
              onChange={(e) => update({ min_price: e.target.value })}
              className="w-full text-[13px] text-[#111110] placeholder:text-[rgba(17,17,16,.3)] outline-none bg-transparent"
            />
            <span className="text-[12px]" style={{ color: 'rgba(17,17,16,.25)' }}>—</span>
            <input
              id="max_price"
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder="Max"
              value={filters.max_price}
              onChange={(e) => update({ max_price: e.target.value })}
              className="w-full text-[13px] text-[#111110] placeholder:text-[rgba(17,17,16,.3)] outline-none bg-transparent"
            />
            <span className="text-[12px] font-semibold" style={{ color: 'rgba(17,17,16,.4)' }}>€</span>
          </div>
        </div>

        <Divider />

        {/* ── Date posted ──────────────────────────────── */}
        <div>
          <SectionLabel>{t("filter.form.date-posted.label") || "Datum der Veröffentlichung"}</SectionLabel>
          <PillToggle
            options={postedOptions}
            value={filters.posted}
            onChange={(v) => update({ posted: v as DatePosted })}
          />
        </div>

        <Divider />

        {/* ── Sort by ──────────────────────────────────── */}
        <div>
          <SectionLabel>{t("filter.form.sort-by.label") || "Sortieren nach"}</SectionLabel>
          <PillToggle
            options={sortByOptions}
            value={filters.sort}
            onChange={(v) => update({ sort: v as SortBy })}
          />
        </div>

        {/* ── Date range ───────────────────────────────── */}
        <Divider />
        <div>
          <SectionLabel>{t("filter.form.start-date.placeholder") || "Zeitraum"}</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[11px] mb-1" style={{ color: 'rgba(17,17,16,.4)' }}>{t("filter.form.start-date.placeholder") || "Startdatum"}</div>
              <DateInput
                label=""
                value={filters.starts_at || null}
                onChange={(v) => {
                  update({ starts_at: v });
                  if (filters.ends_at && dayjs(v).isAfter(dayjs(filters.ends_at))) {
                    update({ ends_at: v });
                  }
                }}
              />
            </div>
            <div>
              <div className="text-[11px] mb-1" style={{ color: 'rgba(17,17,16,.4)' }}>{t("filter.form.end-date.placeholder") || "Enddatum"}</div>
              <DateInput
                label=""
                value={filters.ends_at || null}
                onChange={(v) => update({ ends_at: v })}
                minDate={filters.starts_at ? dayjs(filters.starts_at).toDate() : undefined}
              />
            </div>
          </div>
        </div>

        {/* ── Category ─────────────────────────────────── */}
        {collections?.jobCategories?.length > 0 && (
          <>
            <Divider />
            <fieldset>
              <legend className="text-[11px] font-semibold tracking-[.08em] uppercase mb-2" style={{ color: 'rgba(17,17,16,.35)' }}>
                {t("filter.form.category.label") || "Kategorie"}
              </legend>
              <div className="flex flex-col gap-1">
                {collections.jobCategories.map((cat: any) => {
                  const active = filters.category_id.includes(cat.id);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-[7px] cursor-pointer transition-colors text-[13px] font-medium"
                      style={{
                        background: active ? 'rgba(232,98,42,.06)' : 'transparent',
                        color: active ? '#e8622a' : 'rgba(17,17,16,.7)',
                      }}
                    >
                      {/* Custom checkbox */}
                      <span
                        className="flex-shrink-0 w-4 h-4 rounded-[4px] flex items-center justify-center transition-all"
                        style={{
                          border: active ? '1.5px solid #e8622a' : '1.5px solid rgba(0,0,0,.2)',
                          background: active ? '#e8622a' : 'transparent',
                        }}
                      >
                        {active && (
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                            <polyline points="1.5 5 4 7.5 8.5 2.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={active}
                        onChange={() => toggleInArray("category_id", cat.id)}
                      />
                      <span className="line-clamp-1">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </>
        )}

        {/* ── Job Type ─────────────────────────────────── */}
        {collections?.jobType?.length > 0 && (
          <>
            <Divider />
            <fieldset>
              <legend className="text-[11px] font-semibold tracking-[.08em] uppercase mb-2" style={{ color: 'rgba(17,17,16,.35)' }}>
                {t("filter.form.job-type.label") || "Job-Typ"}
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {collections.jobType.map((type: JobType) => {
                  const active = filters.job_type.includes(type.id);
                  return (
                    <label
                      key={type.id}
                      className="h-[30px] px-3 rounded-full text-[12px] font-medium cursor-pointer transition-all inline-flex items-center"
                      style={{
                        border: active ? '1px solid rgba(232,98,42,.4)' : '1px solid rgba(0,0,0,.1)',
                        background: active ? 'rgba(232,98,42,.08)' : '#f7f7f5',
                        color: active ? '#e8622a' : 'rgba(17,17,16,.6)',
                      }}
                    >
                      <input type="checkbox" className="sr-only" checked={active} onChange={() => toggleInArray("job_type", type.id)} />
                      {type.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </>
        )}

        {/* ── Job Experience ───────────────────────────── */}
        {collections?.jobExperience?.length > 0 && (
          <>
            <Divider />
            <fieldset>
              <legend className="text-[11px] font-semibold tracking-[.08em] uppercase mb-2" style={{ color: 'rgba(17,17,16,.35)' }}>
                {t("filter.form.job-experience.label") || "Erfahrung"}
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {collections.jobExperience.map((exp: JobExperience) => {
                  const active = filters.job_experience.includes(exp.id);
                  return (
                    <label
                      key={exp.id}
                      className="h-[30px] px-3 rounded-full text-[12px] font-medium cursor-pointer transition-all inline-flex items-center"
                      style={{
                        border: active ? '1px solid rgba(232,98,42,.4)' : '1px solid rgba(0,0,0,.1)',
                        background: active ? 'rgba(232,98,42,.08)' : '#f7f7f5',
                        color: active ? '#e8622a' : 'rgba(17,17,16,.6)',
                      }}
                    >
                      <input type="checkbox" className="sr-only" checked={active} onChange={() => toggleInArray("job_experience", exp.id)} />
                      {exp.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </>
        )}

        {/* ── Job Tags ─────────────────────────────────── */}
        {collections?.jobTags?.length > 0 && (
          <>
            <Divider />
            <fieldset>
              <legend className="text-[11px] font-semibold tracking-[.08em] uppercase mb-2" style={{ color: 'rgba(17,17,16,.35)' }}>
                {t("filter.form.job-tags.label") || "Tags"}
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {collections.jobTags.map((tag: JobTag) => {
                  const active = filters.job_tags.includes(tag.id);
                  return (
                    <label
                      key={tag.id}
                      className="h-[28px] px-2.5 rounded-full text-[11px] font-medium cursor-pointer transition-all inline-flex items-center"
                      style={{
                        border: active ? '1px solid rgba(232,98,42,.4)' : '1px solid rgba(0,0,0,.08)',
                        background: active ? 'rgba(232,98,42,.08)' : '#f7f7f5',
                        color: active ? '#e8622a' : 'rgba(17,17,16,.55)',
                      }}
                    >
                      <input type="checkbox" className="sr-only" checked={active} onChange={() => toggleInArray("job_tags", tag.id)} />
                      {tag.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </>
        )}

      </div>
    </div>
  );
}
