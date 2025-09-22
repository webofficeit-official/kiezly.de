'use client'
import React, { useEffect, useMemo, useState } from "react";

// Standalone, native-input filter + job list page for Mini‑Helfer.
// - Safe URL syncing (guards replaceState in sandbox/about:srcdoc)
// - Client-side filtering, sorting, and pagination
// - Optional external data via props; falls back to mock dataset for preview/demo
// - Inline dev tests (no external runner)

// ---- Types ----
export type SortBy = "relevance" | "newest" | "pay_desc" | "pay_asc";
export type DatePosted = "any" | "24h" | "7d" | "30d";

export type Filters = {
    q: string;
    location: string;
    category: "cleaning" | "babysitting" | "gardening" | "delivery" | "other" | "";
    jobTypes: Array<"one_time" | "recurring" | "remote">;
    minPay: string; // keep as string to match native input value
    maxPay: string;
    datePosted: DatePosted;
    availability: Array<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun">;
    distanceKm: number; // 0..50
    sortBy: SortBy;
};

export type Job = {
    id: string;
    title: string;
    description: string;
    category: Filters["category"];
    jobType: "one_time" | "recurring" | "remote";
    payPerHour: number; // €
    postedAt: string; // ISO date
    location: string; // free text city / area
    distanceKm: number; // from user's chosen location (mocked)
    availability: Filters["availability"];
};

const DEFAULT_FILTERS: Filters = {
    q: "",
    location: "",
    category: "",
    jobTypes: [],
    minPay: "",
    maxPay: "",
    datePosted: "any",
    availability: [],
    distanceKm: 10,
    sortBy: "relevance",
};

// ---- Utilities ----
export const toQuery = (f: Filters) => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.location) p.set("loc", f.location);
    if (f.category) p.set("cat", f.category);
    if (f.jobTypes.length) p.set("types", f.jobTypes.join(","));
    if (f.minPay) p.set("min", f.minPay);
    if (f.maxPay) p.set("max", f.maxPay);
    if (f.datePosted && f.datePosted !== "any") p.set("when", f.datePosted);
    if (f.availability.length) p.set("days", f.availability.join(","));
    if (f.distanceKm) p.set("dist", String(f.distanceKm));
    if (f.sortBy && f.sortBy !== "relevance") p.set("sort", f.sortBy);
    return p.toString();
};

export const fromQuery = (qs: string): Filters => {
    const p = new URLSearchParams(qs);
    const types = (p.get("types") || "").split(",").filter(Boolean) as Filters["jobTypes"];
    const days = (p.get("days") || "").split(",").filter(Boolean) as Filters["availability"];
    return {
        ...DEFAULT_FILTERS,
        q: p.get("q") || "",
        location: p.get("loc") || "",
        category: (p.get("cat") as Filters["category"]) || "",
        jobTypes: types,
        minPay: p.get("min") || "",
        maxPay: p.get("max") || "",
        datePosted: (p.get("when") as DatePosted) || "any",
        availability: days,
        distanceKm: Number(p.get("dist") || DEFAULT_FILTERS.distanceKm),
        sortBy: (p.get("sort") as SortBy) || "relevance",
    };
};

function useDebounced<T>(value: T, delay = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

// Tiny helper to detect whether history.replaceState can be safely used
function useCanModifyHistory() {
    return useMemo(() => {
        if (typeof window === "undefined") return false;
        const href = window.location?.href || "";
        if (href.startsWith("about:")) return false;
        try {
            const url = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            window.history.replaceState(window.history.state, "", url);
            return true;
        } catch {
            return false;
        }
    }, []);
}

// Mock data (used if no jobs prop is provided)
const CATEGORIES: Filters["category"][] = ["cleaning", "babysitting", "gardening", "delivery", "other"];
const JOB_TYPES: Array<Job["jobType"]> = ["one_time", "recurring", "remote"];
const LOCATIONS = ["Braunschweig", "Wolfsburg", "Hannover", "Gifhorn", "Peine", "Salzgitter"];

function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

function makeMockJobs(count = 48): Job[] {
    const arr: Job[] = [];
    for (let i = 0; i < count; i++) {
        const cat = CATEGORIES[i % CATEGORIES.length] || "other";
        const jt = JOB_TYPES[i % JOB_TYPES.length];
        const loc = LOCATIONS[i % LOCATIONS.length];
        const pay = 12 + ((i * 7) % 23); // 12..34
        const dist = (i * 3) % 51; // 0..50
        const posted = daysAgo((i * 2) % 28);
        const avail: Filters["availability"] = ["mon", "wed", "fri"].filter((_, idx) => (i + idx) % 2 === 0) as any;

        arr.push({
            id: `J${i + 1}`,
            title: `${cat[0].toUpperCase() + cat.slice(1)} helper #${i + 1}`,
            description: `Looking for ${cat} support. Tools provided. Reference ${i + 1}.`,
            category: cat,
            jobType: jt,
            payPerHour: pay,
            postedAt: posted,
            location: loc,
            distanceKm: dist,
            availability: avail,
        });
    }
    return arr;
}

// ---- Scoring & filtering ----
function normalize(s: string) {
    return s.toLowerCase();
}

function relevanceScore(job: Job, q: string) {
    if (!q) return 0;
    const terms = normalize(q).split(/\s+/).filter(Boolean);
    const hay = `${normalize(job.title)} ${normalize(job.description)} ${normalize(job.location)} ${job.category}`;
    let score = 0;
    for (const t of terms) {
        if (hay.includes(t)) score += 10;
        if (normalize(job.title).includes(t)) score += 10;
    }
    return score;
}

function withinDate(postedAt: string, win: DatePosted) {
    if (win === "any") return true;
    const now = new Date();
    const d = new Date(postedAt);
    const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    if (win === "24h") return diffDays <= 1;
    if (win === "7d") return diffDays <= 7;
    if (win === "30d") return diffDays <= 30;
    return true;
}

// ---- Component ----
export default function JobFilterPage({
    onChange,
    persistToUrl = true, // allow caller to disable URL syncing
    jobs,
    pageSize = 10,
}: {
    onChange?: (f: Filters) => void;
    persistToUrl?: boolean;
    jobs?: Job[];
    pageSize?: number;
}) {
    const [filters, setFilters] = useState<Filters>(() => {
        if (typeof window === "undefined") return DEFAULT_FILTERS;
        return fromQuery(window.location.search);
    });
    const [page, setPage] = useState(1);

    const canModifyHistory = useCanModifyHistory();

    // Debounce high-churn fields (search query)
    const debouncedFilters = useDebounced(filters, 300);

    // Emit to parent when filters change
    useEffect(() => {
        onChange?.(debouncedFilters);
    }, [debouncedFilters, onChange]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [debouncedFilters]);

    // Sync filters -> URL (shallow, no reload)
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!persistToUrl) return;
        if (!canModifyHistory) return; // avoid SecurityError in sandbox/about:srcdoc
        try {
            const qs = toQuery(filters);
            const url = `${window.location.pathname}${qs ? "?" + qs : ""}`;
            window.history.replaceState(window.history.state, "", url);
        } catch (err) {
            // Ignore if environment forbids it
        }
    }, [filters, persistToUrl, canModifyHistory]);

    const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

    function toggleInArray<T extends string>(key: keyof Filters, val: T) {
        setFilters((f) => {
            const arr = new Set(f[key] as unknown as T[]);
            arr.has(val) ? arr.delete(val) : arr.add(val);
            return { ...f, [key]: Array.from(arr) } as Filters;
        });
    }

    const resetAll = () => setFilters(DEFAULT_FILTERS);

    // ---- Data pipeline: filter -> sort -> paginate ----
    const dataSource = useMemo<Job[]>(() => (jobs && jobs.length ? jobs : makeMockJobs(48)), [jobs]);

    const filtered = useMemo(() => {
        const minPay = filters.minPay ? parseFloat(filters.minPay) : -Infinity;
        const maxPay = filters.maxPay ? parseFloat(filters.maxPay) : Infinity;
        const wantedDays = new Set(filters.availability);
        const locTerm = normalize(filters.location);

        return dataSource.filter((job) => {
            if (filters.category && job.category !== filters.category) return false;
            if (filters.jobTypes.length && !filters.jobTypes.includes(job.jobType)) return false;
            if (job.payPerHour < minPay || job.payPerHour > maxPay) return false;
            if (!withinDate(job.postedAt, filters.datePosted)) return false;
            if (wantedDays.size) {
                const hasAny = job.availability.some((d) => wantedDays.has(d));
                if (!hasAny) return false;
            }
            // Distance: treat remote as always within range
            if (job.jobType !== "remote" && job.distanceKm > filters.distanceKm) return false;
            // Location: simple contains check
            if (locTerm && !normalize(job.location).includes(locTerm)) return false;
            // Query: basic contains (title/desc)
            if (filters.q) {
                const q = normalize(filters.q);
                const hay = `${normalize(job.title)} ${normalize(job.description)}`;
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [dataSource, filters]);

    const sorted = useMemo(() => {
        const arr = [...filtered];
        if (filters.sortBy === "newest") {
            arr.sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
        } else if (filters.sortBy === "pay_desc") {
            arr.sort((a, b) => b.payPerHour - a.payPerHour);
        } else if (filters.sortBy === "pay_asc") {
            arr.sort((a, b) => a.payPerHour - b.payPerHour);
        } else {
            // relevance
            arr.sort((a, b) => relevanceScore(b, filters.q) - relevanceScore(a, filters.q));
        }
        return arr;
    }, [filtered, filters.sortBy, filters.q]);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Clamp page if filters reduced the result count
    useEffect(() => {
        setPage((p) => Math.min(Math.max(1, p), totalPages));
    }, [totalPages]);

    const pageSlice = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return sorted.slice(start, end);
    }, [sorted, page, pageSize]);

    const activeCount = useMemo(() => {
        const { q, location, category, jobTypes, minPay, maxPay, datePosted, availability, distanceKm, sortBy } = filters;
        let c = 0;
        if (q) c++;
        if (location) c++;
        if (category) c++;
        if (jobTypes.length) c++;
        if (minPay || maxPay) c++;
        if (datePosted !== "any") c++;
        if (availability.length) c++;
        if (distanceKm !== DEFAULT_FILTERS.distanceKm) c++;
        if (sortBy !== "relevance") c++;
        return c;
    }, [filters]);

    // --- Dev tests (visible panel) ---
    type TestResult = { name: string; ok: boolean; detail?: string };
    const testResults: TestResult[] = useMemo(() => {
        const results: TestResult[] = [];

        try {
            const sample: Filters = {
                q: "window cleaning",
                location: "Braunschweig",
                category: "cleaning",
                jobTypes: ["one_time", "remote"],
                minPay: "14",
                maxPay: "25",
                datePosted: "7d",
                availability: ["sat", "sun"],
                distanceKm: 10,
                sortBy: "newest",
            };
            const qs = toQuery(sample);
            const round = fromQuery("?" + qs);
            const ok = JSON.stringify(sample) === JSON.stringify(round);
            results.push({ name: "roundtrip toQuery/fromQuery", ok, detail: ok ? "" : `got ${JSON.stringify(round)}` });
        } catch (e: any) {
            results.push({ name: "roundtrip toQuery/fromQuery", ok: false, detail: String(e) });
        }

        try {
            const withZero: Filters = { ...DEFAULT_FILTERS, distanceKm: 0 };
            const qs = toQuery(withZero);
            const ok = !new URLSearchParams(qs).has("dist");
            results.push({ name: "distance 0 omitted in query", ok, detail: ok ? "" : `qs='${qs}'` });
        } catch (e: any) {
            results.push({ name: "distance 0 omitted in query", ok: false, detail: String(e) });
        }

        try {
            const withAny: Filters = { ...DEFAULT_FILTERS, datePosted: "any" };
            const qs = toQuery(withAny);
            const ok = !new URLSearchParams(qs).has("when");
            results.push({ name: "datePosted any omitted in query", ok, detail: ok ? "" : `qs='${qs}'` });
        } catch (e: any) {
            results.push({ name: "datePosted any omitted in query", ok: false, detail: String(e) });
        }

        try {
            // Pagination clamp test: with tiny pageSize, page should clamp to totalPages
            const totalItems = 3;
            const ps = 2;
            const tp = Math.max(1, Math.ceil(totalItems / ps));
            const ok = tp === 2; // expected for 3 items with page size 2
            results.push({ name: "pagination totalPages calc", ok, detail: ok ? "" : `got ${tp}` });
        } catch (e: any) {
            results.push({ name: "pagination totalPages calc", ok: false, detail: String(e) });
        }

        return results;
    }, [filters]);

    // ---- UI ----
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Header */}


            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Filters */}
                <section className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 space-y-6">
                        {/* Search */}
                        <div>
                            <div className="flex items-center justify-between">
                                {/* Left side: Search label */}
                                <label htmlFor="q" className="text-sm font-medium">Search</label>

                                {/* Right side: Active filters + Reset */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Active filters</span>
                                    <span className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white text-xs w-6 h-6">
                                        {activeCount}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={resetAll}
                                        className="text-sm underline underline-offset-4 text-gray-700 hover:text-black"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            <input
                                id="q"
                                type="search"
                                inputMode="search"
                                value={filters.q}
                                onChange={(e) => update({ q: e.target.value })}
                                placeholder="Keyword, skill, task…"
                                className="mt-2 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        {/* Location + Distance */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="sm:col-span-2">
                                <label htmlFor="loc" className="block text-sm font-medium">Location</label>
                                <input
                                    id="loc"
                                    type="text"
                                    value={filters.location}
                                    onChange={(e) => update({ location: e.target.value })}
                                    placeholder="City or postcode"
                                    className="mt-2 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="dist" className="block text-sm font-medium">Distance (km)</label>
                                <input
                                    id="dist"
                                    type="range"
                                    min={0}
                                    max={50}
                                    step={1}
                                    value={filters.distanceKm}
                                    onChange={(e) => update({ distanceKm: Number(e.target.value) })}
                                    className="mt-2 w-full"
                                />
                                <div className="text-xs text-gray-600 mt-1">{filters.distanceKm} km</div>
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="cat" className="block text-sm font-medium">Category</label>
                            <select
                                id="cat"
                                value={filters.category}
                                onChange={(e) => update({ category: e.target.value as Filters["category"] })}
                                className="mt-2 w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="">Any</option>
                                <option value="cleaning">Cleaning</option>
                                <option value="babysitting">Babysitting</option>
                                <option value="gardening">Gardening</option>
                                <option value="delivery">Delivery</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Job type */}
                        <fieldset>
                            <legend className="block text-sm font-medium">Job type</legend>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {([
                                    ["one_time", "One‑time"],
                                    ["recurring", "Recurring"],
                                    ["remote", "Remote"],
                                ] as const).map(([val, label]) => (
                                    <label key={val} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.jobTypes.includes(val)}
                                            onChange={() => toggleInArray("jobTypes", val)}
                                        />
                                        <span className="text-sm">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {/* Pay range */}
                        <div>
                            <span className="block text-sm font-medium">Hourly pay (€)</span>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="min" className="sr-only">Min</label>
                                    <input
                                        id="min"
                                        inputMode="decimal"
                                        pattern="[0-9]*"
                                        placeholder="Min"
                                        value={filters.minPay}
                                        onChange={(e) => update({ minPay: e.target.value })}
                                        className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="max" className="sr-only">Max</label>
                                    <input
                                        id="max"
                                        inputMode="decimal"
                                        pattern="[0-9]*"
                                        placeholder="Max"
                                        value={filters.maxPay}
                                        onChange={(e) => update({ maxPay: e.target.value })}
                                        className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date posted */}
                        <div>
                            <label htmlFor="when" className="block text-sm font-medium">Date posted</label>
                            <select
                                id="when"
                                value={filters.datePosted}
                                onChange={(e) => update({ datePosted: e.target.value as DatePosted })}
                                className="mt-2 w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="any">Any time</option>
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                            </select>
                        </div>

                        {/* Availability (days) */}
                        <fieldset>
                            <legend className="block text-sm font-medium">Availability</legend>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {([
                                    ["mon", "Mon"],
                                    ["tue", "Tue"],
                                    ["wed", "Wed"],
                                    ["thu", "Thu"],
                                    ["fri", "Fri"],
                                    ["sat", "Sat"],
                                    ["sun", "Sun"],
                                ] as const).map(([val, label]) => (
                                    <label key={val} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.availability.includes(val)}
                                            onChange={() => toggleInArray("availability", val)}
                                        />
                                        <span className="text-sm">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {/* Sort by */}
                        <div>
                            <label htmlFor="sort" className="block text-sm font-medium">Sort by</label>
                            <select
                                id="sort"
                                value={filters.sortBy}
                                onChange={(e) => update({ sortBy: e.target.value as SortBy })}
                                className="mt-2 w-full rounded-xl border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="newest">Newest</option>
                                <option value="pay_desc">Pay: High → Low</option>
                                <option value="pay_asc">Pay: Low → High</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => onChange?.(filters)}
                                className="inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
                            >
                                Apply
                            </button>
                            <button
                                type="button"
                                onClick={resetAll}
                                className="text-sm underline underline-offset-4"
                            >
                                Clear all
                            </button>
                        </div>
                    </div>
                </section>

                {/* Right: Job list + debug preview */}
                <section className="lg:col-span-2 space-y-4">
                    {/* Stats + controls */}
                    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">{total} jobs</h2>
                            <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-700" htmlFor="pageSize">Per page</label>
                            <select
                                id="pageSize"
                                value={pageSize}
                                onChange={(e) => setPage(1)}
                                className="rounded-xl border px-3 py-2"
                                disabled
                                title="pageSize is set via prop"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>

                    {/* Job cards */}
                    <div className="grid grid-cols-1 gap-4">
                        {pageSlice.map((job) => (
                            <article key={job.id} className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold truncate">{job.title}</h3>
                                    <div className="mt-1 text-sm text-gray-700 flex flex-wrap gap-x-3 gap-y-1">
                                        <span className="inline-flex items-center">€{job.payPerHour}/h</span>
                                        <span>• {job.location}{job.jobType !== "remote" ? ` · ${job.distanceKm} km` : " · remote"}</span>
                                        <span>• {job.category}</span>
                                        <span>• {job.jobType.replace("_", " ")}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                                </div>
                                <div className="sm:text-right">
                                    <div className="text-xs text-gray-500">Posted {new Date(job.postedAt).toLocaleDateString()}</div>
                                    <button className="mt-2 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50">View</button>
                                </div>
                            </article>
                        ))}
                        {pageSlice.length === 0 && (
                            <div className="bg-white rounded-2xl border p-6 text-center text-sm text-gray-600">
                                No jobs match your filters.
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <nav className="flex items-center justify-between gap-2" aria-label="Pagination">
                        <button
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                        >
                            Prev
                        </button>
                        <div className="flex items-center gap-1" data-testid="pager">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5).map((n) => (
                                <button
                                    key={n}
                                    className={`rounded-xl border px-3 py-2 text-sm ${n === page ? "bg-black text-white" : ""}`}
                                    onClick={() => setPage(n)}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <button
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                        >
                            Next
                        </button>
                    </nav>

                    {/* Debug preview (can be removed in prod) */}
                    {/* <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6"> */}
                    {/* <h3 className="text-md font-semibold">Current filters (debug)</h3>
                        <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs overflow-auto" data-testid="filters-json">
                            {JSON.stringify(filters, null, 2)}
                        </pre> */}

                    {/* Dev Tests Panel */}
                    {/* <details className="mt-6">
                            <summary className="cursor-pointer select-none text-sm font-medium">Dev tests (inline)</summary>
                            <ul className="mt-3 space-y-1 text-sm">
                                {testResults.map((t, i) => (
                                    <li key={i} className={t.ok ? "text-green-700" : "text-red-700"}>
                                        <span className="font-medium">{t.ok ? "PASS" : "FAIL"}:</span> {t.name}
                                        {t.detail ? <span className="text-gray-600"> — {t.detail}</span> : null}
                                    </li>
                                ))}
                            </ul>
                        </details> */}
                    {/* </div> */}
                </section>
            </main>

            {/* Sticky mobile apply
            <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 p-3">
                <div className="bg-white border shadow-xl rounded-2xl p-3 flex items-center justify-between">
                    <div className="text-sm">
                        <div className="font-medium">{activeCount} active filters</div>
                        <div className="text-gray-600">Tap Apply to update results</div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange?.(filters)}
                        className="inline-flex items-center justify-center rounded-xl bg-black text-white px-4 py-2 text-sm"
                    >
                        Apply
                    </button>
                </div>
            </div> */}
        </div>
    );
}