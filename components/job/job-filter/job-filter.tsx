"use client";
import React from "react";
import dayjs from "dayjs";
import { Filters, DatePosted, SortBy, JobExperience, JobType, JobTag } from "@/lib/types/job";
import { Select } from "../job-filter-select/select-option";
import { useT } from "@/app/[locale]/layout";
import { DateInput } from "@/components/DateInput/date-input";
import LocationAutocomplete from "@/components/LocationAutocomplete";

type Props = {
  filters: Filters;
  update: (patch: Partial<Filters>) => void;
  toggleInArray: <T extends string | number>(
    key: keyof Filters,
    val: T
  ) => void;
  resetAll: () => void;
  activeCount: number;
  collections: any;
  user?: any;
  onChange?: (f: Filters) => void;
};

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
    { label: t("filter.form.date-posted.options.any"), value: "any" },
    { label: t("filter.form.date-posted.options.day"), value: "1" },
    { label: t("filter.form.date-posted.options.week"), value: "7" },
    { label: t("filter.form.date-posted.options.month"), value: "30" },
  ];

  const sortByOptions = [
    { label: t("filter.form.sort-by.options.new"), value: "new" },
    { label: t("filter.form.sort-by.options.desc"), value: "price_desc" },
    { label: t("filter.form.sort-by.options.asc"), value: "price_asc" },
  ];

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm sm:p-6 space-y-6 sticky top-4 overflow-y-auto">
      {/*  Search */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="q" className="text-sm font-medium">
            {t("filter.search")}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {t("filter.active-filters")}
            </span>
            <span className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white text-xs w-6 h-6">
              {activeCount}
            </span>
            <button
              type="button"
              onClick={resetAll}
              className="text-sm underline underline-offset-4 text-gray-700 hover:text-black"
            >
              {t("filter.reset")}
            </button>
          </div>
        </div>

        <input
          id="q"
          type="search"
          inputMode="search"
          value={filters.q}
          onChange={(e) => update({ q: e.target.value })}
          placeholder={t("filter.form.keyword.placeholder")}
          className="mt-2 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/*  Location + Distance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="sm:col-span-2">
          <label htmlFor="city" className="block text-sm font-medium">
            {t("filter.form.location.label")}
          </label>
          <LocationAutocomplete
            value={filters.city}
            onValueChange={(v) => update({ city: v })}
            onSelect={(s) => {
              // set city text + coordinates into filters
              update({
                city: s.label,
              });
            }}
            placeholder={t("filter.form.location.placeholder")}
            withCoords
            onlyOpen
            limit={8}
          />
        </div>
        {user?.lat && user?.lng && (
          <div>
            <label htmlFor="radius_km" className="block text-sm font-medium">
              {t("filter.form.distance.label")}
            </label>
            {/* <input
              id="radius_km"
              type="range"
              min={0}
              max={50}
              step={1}
              value={filters.radius_km ?? 10}
              onChange={(e) => update({ radius_km: Number(e.target.value) })}
              className="mt-2 w-full"
            /> */}
            <input
              id="radius_km"
              type="range"
              min={0}
              max={150}
              step={1}
              value={filters.radius_km ?? 0}
              onChange={(e) => {
                const next = Number(e.target.value);

                if (next > 0) {
                  // User intends to filter by radius — attach user's coords if available.
                  // If filters already contain lat/lng (e.g., from selecting a place), keep them.
                  update({
                    radius_km: next,
                    lat: filters.lat ?? user?.lat ?? undefined,
                    lng: filters.lng ?? user?.lng ?? undefined,
                  });
                } else {
                  // radius == 0 -> disable geofilter: remove lat/lng
                  update({
                    radius_km: 0,
                    lat: undefined,
                    lng: undefined,
                  });
                }
              }}
              className="mt-2 w-full"
            />

            <div className="text-xs text-gray-600 mt-1">
              {filters.radius_km ?? 0} km
            </div>
            {/* Status message: aria-live so screen readers get updates */}
            <div
              className={`text-xs font-medium ${
                (filters.radius_km ?? 0) > 0
                  ? "text-green-700"
                  : "text-gray-500"
              }`}
              aria-live="polite"
            >
              {(filters.radius_km ?? 0) > 0
                ? t("filter.form.distance.active", { km: filters.radius_km ?? 0 })
                : t("filter.form.distance.inactive")}
            </div>
          </div>
        )}
      </div>

      {/*  Category */}
      {collections?.jobCategories?.length > 0 && (
        <fieldset>
          <legend className="block text-sm font-medium">
            {t("filter.form.category.label")}
          </legend>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {collections.jobCategories.map((cat: any) => (
              <label
                key={cat.id}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.category_id.includes(cat.id)}
                  onChange={() => toggleInArray("category_id", cat.id)}
                />
                <span className="text-sm  block break-words line-clamp-2 cursor-help">{cat.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Job Type */}
      {collections?.jobType?.length > 0 && (
        <fieldset>
          <legend className="block text-sm font-medium">
            {t("filter.form.job-type.label")}
          </legend>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {collections.jobType.map((type: JobType) => (
              <label
                key={type.id}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.job_type.includes(type.id)}
                  onChange={() => toggleInArray("job_type", type.id)}
                />
                <span className="text-sm block break-words line-clamp-2 cursor-help">{type.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/*  Pay range */}
      <div>
        <span className="block text-sm font-medium">
          {t("filter.form.hourly-pay.label")}
        </span>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <input
            id="min_price"
            inputMode="decimal"
            pattern="[0-9]*"
            placeholder={t("filter.form.hourly-pay.min.placeholder")}
            value={filters.min_price}
            onChange={(e) => update({ min_price: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <input
            id="max_price"
            inputMode="decimal"
            pattern="[0-9]*"
            placeholder={t("filter.form.hourly-pay.max.placeholder")}
            value={filters.max_price}
            onChange={(e) => update({ max_price: e.target.value })}
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      {/*  Job Experience */}
      {collections?.jobExperience?.length > 0 && (
        <fieldset>
          <legend className="block text-sm font-medium">
            {t("filter.form.job-experience.label")}
          </legend>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {collections.jobExperience.map((exp: JobExperience) => (
              <label
                key={exp.id}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.job_experience.includes(exp.id)}
                  onChange={() => toggleInArray("job_experience", exp.id)}
                />
                <span className="text-sm block break-words line-clamp-2 cursor-help">{exp.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* 🏷 Job Tags */}
      {collections?.jobTags?.length > 0 && (
        <fieldset>
          <legend className="block text-sm font-medium">
            {t("filter.form.job-tags.label")}
          </legend>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {collections.jobTags.map((tag: JobTag) => (
              <label
                key={tag.id}
                className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.job_tags.includes(tag.id)}
                  onChange={() => toggleInArray("job_tags", tag.id)}
                />
                <span className="text-sm block break-words line-clamp-2 cursor-help">{tag.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/*  Date range */}
      <div className="mt-2 grid grid-cols-2 gap-3">
        <DateInput
          label={t("filter.form.start-date.placeholder")}
          value={filters.starts_at || null}
          onChange={(v) => {
            update({ starts_at: v });
            if (filters.ends_at && dayjs(v).isAfter(dayjs(filters.ends_at))) {
              update({ ends_at: v });
            }
          }}
        />

        <DateInput
          label={t("filter.form.end-date.placeholder")}
          value={filters.ends_at || null}
          onChange={(v) => update({ ends_at: v })}
          minDate={
            filters.starts_at ? dayjs(filters.starts_at).toDate() : undefined
          }
        />
      </div>

      {/*  Date posted */}
      <Select
        label={t("filter.form.date-posted.label")}
        value={filters.posted}
        onChange={(v: string) => update({ posted: v as DatePosted })}
        options={postedOptions}
      />

      {/*  Sort by */}
      <Select
        label={t("filter.form.sort-by.label")}
        value={filters.sort}
        onChange={(v: string) => update({ sort: v as SortBy })}
        options={sortByOptions}
      />

      {/*  Actions */}
      {/* <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange?.(filters)}
          className="inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
        >
          {t("filter.form.submit")}
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="text-sm underline underline-offset-4"
        >
          {t("filter.form.clear")}
        </button>
      </div> */}
    </div>
  );
}
