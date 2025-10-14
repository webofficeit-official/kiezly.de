'use client'
import { useJobCollections, useJobs } from "@/lib/react-query/queries/useJob";
import { JobList } from "@/lib/types/job";
import dayjs from "dayjs";
import { Bookmark, BookmarkCheck, BookmarkCheckIcon, Check, ChevronDown, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { DateInput } from "./add";
import { useAuth } from "@/lib/context/auth-context";
import { Listbox } from "@headlessui/react";
import { Button } from "../ui/button";
import { addJobAsFavorite, getSavedJobs, unsaveJobAsFavorite } from "@/lib/react-query/api-handler/job-save-api";
// ---- Types ----
export type SortBy = "new" | "price_desc" | "price_asc";
export type DatePosted = "any" | "1" | "7" | "30";

export type Filters = {
    q: string;
    city: string;
    category_id: number[];
    job_type: string[];
    job_experience: string[];
    job_tags: number[];
    min_price: string;
    max_price: string;
    posted: DatePosted;
    radius_km: number; // 0..50
    sort: SortBy;
    starts_at?: string;
    ends_at?: string;
    lat?: number,
    lng?: number
};



const DEFAULT_FILTERS: Filters = {
    q: "",
    city: "",
    category_id: [],
    job_type: [],
    job_experience: [],
    job_tags: [],
    min_price: "",
    max_price: "",
    posted: "any",
    radius_km: 10,
    sort: "new",
    starts_at: undefined,
    ends_at: undefined,
};

const postedOptions = [
  { label: "Any time", value: "any" },
  { label: "Last 24 hours", value: "1" },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
];

const sortByOptions = [
  { label: "Newest", value: "new" },
  { label: "Pay: High → Low", value: "price_desc" },
  { label: "Pay: Low → High", value: "price_asc" },
];

const perPageOptions = [
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "25", value: "25" },
  { label: "50", value: "50" },
];

// ---- Utilities ----
export const toQuery = (f: Filters) => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.city) p.set("city", f.city);
    if (f.category_id.length) p.set("category_id", f.category_id.join(","));
    if (f.job_type.length) p.set("job_type", f.job_type.join(","));
    if (f.job_experience.length) p.set("job_experience", f.job_experience.join(","));
    if (f.job_tags.length) p.set("job_tag", f.job_tags.join(","));
    if (f.min_price) p.set("min_price", f.min_price);
    if (f.max_price) p.set("max_price", f.max_price);
    if (f.posted && f.posted !== "any") p.set("posted", f.posted);
    if (f.radius_km) p.set("radius_km", String(f.radius_km));
    if (f.sort && f.sort !== "new") p.set("sort", f.sort);
    if (f.starts_at) p.set("starts_at", f.starts_at);
    if (f.ends_at) p.set("ends_at", f.ends_at);
    return p.toString();
};

export const fromQuery = (qs: string): Filters => {
    const p = new URLSearchParams(qs);
    const types = (p.get("job_type") || "").split(",").filter(Boolean) as Filters["job_type"];
    const jobExperience = (p.get("job_experience") || "").split(",").filter(Boolean) as Filters["job_experience"];
    const jobTag = (p.get("job_tags") || "").split(",").filter(Boolean).map(Number).filter((v) => !isNaN(v));
    const category_id = (p.get("category_id") || "").split(",").filter(Boolean).map(Number).filter((v) => !isNaN(v));
    return {
        ...DEFAULT_FILTERS,
        q: p.get("q") || "",
        city: p.get("city") || "",
        category_id,
        job_type: types,
        job_experience: jobExperience,
        job_tags: jobTag,
        min_price: p.get("min_price") || "",
        max_price: p.get("max_price") || "",
        posted: (p.get("posted") as DatePosted) || "any",
        radius_km: Number(p.get("radius_km") || DEFAULT_FILTERS.radius_km),
        sort: (p.get("sort") as SortBy) || "new",
        starts_at: p.get("starts_at") || undefined,
        ends_at: p.get("ends_at") || undefined,
    };
};

const isNew = (created_at: string) => {
  if (!created_at) return false;
  const createdAt = new Date(created_at).getTime();
  const now = Date.now();
  const diffHours = (now - createdAt) / (1000 * 60 * 60); // convert ms to hours
  return diffHours <= 72; // less than or equal 72 hours
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

export default function JobFilterPage({
    onChange,
    persistToUrl = true, // allow caller to disable URL syncing
    jobs,
    pageSize = 10,
}: {
    onChange?: (f: Filters) => void;
    persistToUrl?: boolean;
    jobs?: JobList[];
    pageSize?: number;
}) {
    const { user } = useAuth();
    const [filters, setFilters] = useState<Filters>(() => {
        if (typeof window === "undefined") return DEFAULT_FILTERS;
        const initial = fromQuery(window.location.search);
        // If user has lat/lng in context, override them with defaults
        if (user && user?.lat && user?.lng) {
            return {
                ...initial,
                lat: user.lat,
                lng: user.lng,
                radius_km: user?.lat && user?.lng ? (initial.radius_km || DEFAULT_FILTERS.radius_km) : undefined,
            };
        }

        return initial;
    });

    useEffect(() => {
        if (user?.lat && user?.lng) {
            setFilters((f) => ({
                ...f,
                lat: user.lat,
                lng: user.lng,
                radius_km: f.radius_km || DEFAULT_FILTERS.radius_km,
            }));
        }
    }, [user]);

    const [page, setPage] = useState(1);
    const [localPageSize, setLocalPageSize] = useState(pageSize);
    const router = useRouter();
    const buildApiFilters = (filters: Filters, page: number, pageSize: number) => {
        const payload: Record<string, any> = { page, page_size: pageSize };

        if (filters.q) payload.q = filters.q;
        if (filters.city) payload.city = filters.city;
        if (filters.category_id.length) payload.category_id = filters.category_id.join(",");
        if (filters.job_type.length) payload.job_type = filters.job_type.join(",");
        if (filters.job_experience.length) payload.job_experience = filters.job_experience.join(",");
        if (filters.job_tags.length) payload.job_tags = filters.job_tags.join(",");
        if (filters.min_price) payload.min_price = filters.min_price;
        if (filters.max_price) payload.max_price = filters.max_price;
        if (filters.posted && filters.posted !== "any") payload.posted = filters.posted;
        if (user?.lat && filters.radius_km) payload.radius_km = filters.radius_km;
        if (filters.sort && filters.sort !== "new") payload.sort = filters.sort;
        if (filters.starts_at) payload.starts_at = filters.starts_at;
        if (filters.ends_at) payload.ends_at = filters.ends_at;
        if (filters.lat) payload.lat = filters.lat;
        if (filters.lng) payload.lng = filters.lng;

        return payload;
    };

    const apiFilters = useMemo(() => buildApiFilters(filters, page, localPageSize), [filters, page, localPageSize]);
    const { data: collections, isLoading: isCollectionsLoading, isError: isCollectionsError } = useJobCollections();
    const { data, isLoading, error } = useJobs(apiFilters);
    const total = data?.data?.total_items ?? 0;
    const totalPages = data?.data?.total_pages ?? 1;
    
    const [savedJobs, setSavedJobs] = useState([]);

    const canModifyHistory = useCanModifyHistory();

    // Debounce high-churn fields (search query)
    const debouncedFilters = useDebounced(filters, 300);

    useEffect(() => {
        onChange?.(debouncedFilters);
    }, [debouncedFilters, onChange]);

    useEffect(() => {
        setPage(1);
    }, [debouncedFilters]);

    useEffect(() => {
        if(user) {
            getSavedJobs().then((data) => {
                setSavedJobs(data.jobs)
            }).catch((err) => console.log(err))
        } else {
            const localStoredJobs = localStorage.getItem("saved-jobs")
            if(localStoredJobs) {
                setSavedJobs(JSON.parse(localStoredJobs))
            }
        }
    }, [user])

    useEffect(() => {
        onChange?.(filters);
    }, [filters, onChange]);


    useEffect(() => {
        setPage(1);
    }, [
        filters.q,
        filters.category_id.join(","),
        filters.city,
        filters.job_type.join(","),
        filters.job_experience.join(","),
        filters.job_tags.join(","),
        filters.min_price,
        filters.max_price,
        filters.posted,
        filters.radius_km,
        filters.sort]);

    // Sync filters -> URL (shallow, no reload)
    useEffect(() => {
        if (!persistToUrl || !canModifyHistory) return;
        try {
            const qs = toQuery({ ...filters, radius_km: user?.lat && user?.lng ? filters.radius_km : undefined, });
            const url = `${window.location.pathname}${qs ? "?" + qs : ""}`;
            window.history.replaceState(window.history.state, "", url);
        } catch { }
    }, [filters, persistToUrl, canModifyHistory]);

    const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

    function toggleInArray<T extends string | number>(key: keyof Filters, val: T) {
        setFilters((f) => {
            const arr = new Set(f[key] as unknown as T[]);
            arr.has(val) ? arr.delete(val) : arr.add(val);
            return { ...f, [key]: Array.from(arr) } as Filters;
        });
    }

    const resetAll = () => setFilters(DEFAULT_FILTERS);


    const dataSource: JobList[] = useMemo(() => {
        if (data?.data?.items) return data.data.items as JobList[];
        if (jobs && jobs.length) return jobs;
        return []
    }, [data, jobs]);


    const pageSlice = dataSource;
    const activeCount = useMemo(() => {
        const { q, city, category_id, job_type, job_experience, job_tags, min_price, max_price, posted, radius_km, sort } = filters;
        let c = 0;
        if (q) c++;
        if (city) c++;
        if (category_id.length) c++;
        if (job_type.length) c++;
        if (job_experience.length) c++;
        if (job_tags.length) c++;
        if (min_price || max_price) c++;
        if (posted !== "any") c++;
        if (radius_km !== DEFAULT_FILTERS.radius_km) c++;
        if (sort !== "new") c++;
        return c;
    }, [filters]);

    const handleSaveJob = async (jobId: string) => {
        try {
            setSavedJobs((prev) => [...prev, { id: jobId } as JobList]);
            if(user) {
                await addJobAsFavorite({ jobId });
            } else {
                const localStoredJobs = localStorage.getItem("saved-jobs")
                let savedJobsLocal = []
                if(localStoredJobs) {
                    savedJobsLocal = JSON.parse(localStoredJobs)
                }
                localStorage.setItem('saved-jobs', JSON.stringify([...savedJobsLocal, { id: jobId }]))
            }
        } catch (error) {
            console.error("Failed to save job:", error);
            setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
        }
    };

    const handleUnSaveJob = async (jobId: string) => {
        try {
            setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
            if(user) {
                await unsaveJobAsFavorite(jobId);
            } else {
                const localStoredJobs = localStorage.getItem("saved-jobs")
                let savedJobsLocal = []
                if(localStoredJobs) {
                    savedJobsLocal = JSON.parse(localStoredJobs)
                }
                localStorage.setItem('saved-jobs', JSON.stringify(savedJobsLocal.filter((j) => j.id !== jobId)))
            }
        } catch (error) {
            console.error("Failed to save job:", error);
            setSavedJobs((prev) => [...prev, { id: jobId } as JobList]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900"> {/* Content */}
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
                                placeholder="Keyword.."
                                className="mt-2 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                            />
                        </div>

                        {/* Location + Distance */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="sm:col-span-2">
                                <label htmlFor="city" className="block text-sm font-medium">Location</label>
                                <input
                                    id="city"
                                    type="text"
                                    value={filters.city}
                                    onChange={(e) => update({ city: e.target.value })}
                                    placeholder="City or postcode"
                                    className="mt-2 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            {user?.lat && user?.lng &&
                                (<div>

                                    <label htmlFor="radius_km" className="block text-sm font-medium">Distance (km)</label>
                                    <input
                                        id="radius_km"
                                        type="range"
                                        min={0}
                                        max={50}
                                        step={1}
                                        value={filters.radius_km ?? 10}
                                        onChange={(e) => update({ radius_km: Number(e.target.value) })}
                                        className="mt-2 w-full"
                                    />
                                    <div className="text-xs text-gray-600 mt-1">{filters.radius_km ?? 10} km</div>
                                </div>)
                            }
                        </div>

                        {/* Category */}
                        {collections?.jobCategories.length > 0 && (
                            <fieldset>
                                <legend className="block text-sm font-medium">Category</legend>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {collections?.jobCategories?.map((cat) => (
                                        <label key={cat.id} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.category_id.includes(cat.id)}
                                                onChange={() => toggleInArray("category_id", cat.id)}
                                            />
                                            <span className="text-sm">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        )}

                        {/* Job type */}
                        {collections?.jobType.length > 0 && (
                            <fieldset>
                                <legend className="block text-sm font-medium">Job Type</legend>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {collections?.jobType?.map((type) => (
                                        <label key={type} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.job_type.includes(type)}
                                                onChange={() => toggleInArray("job_type", type)}
                                            />
                                            <span className="text-sm">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        )}
                        {/* Pay range */}
                        <div>
                            <span className="block text-sm font-medium">Hourly pay (€)</span>
                            <div className="mt-2 grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="min_price" className="sr-only">Min</label>
                                    <input
                                        id="min_price"
                                        inputMode="decimal"
                                        pattern="[0-9]*"
                                        placeholder="Min Price"
                                        value={filters.min_price}
                                        onChange={(e) => update({ min_price: e.target.value })}
                                        className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="max_price" className="sr-only">Max</label>
                                    <input
                                        id="max_price"
                                        inputMode="decimal"
                                        pattern="[0-9]*"
                                        placeholder="Max Price"
                                        value={filters.max_price}
                                        onChange={(e) => update({ max_price: e.target.value })}
                                        className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Job Expierience */}
                        {collections?.jobExperience.length > 0 &&
                            (<fieldset>
                                <legend className="block text-sm font-medium">Job Experience</legend>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {collections?.jobExperience?.map((type) => (
                                        <label key={type} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.job_experience.includes(type)}
                                                onChange={() => toggleInArray("job_experience", type)}
                                            />
                                            <span className="text-sm">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>)
                        }

                        {/* Job Tag */}
                        {collections?.jobTags.length > 0 &&
                            (<fieldset>
                                <legend className="block text-sm font-medium">Job Tag</legend>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {collections?.jobTags?.map((tag) => (
                                        <label key={tag.id} className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filters.job_tags.includes(tag.id)}
                                                onChange={() => toggleInArray("job_tags", tag.id)}
                                            />
                                            <span className="text-sm">{tag.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>)
                        }

                        {/* start_at and ends_at filter */}
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            <DateInput
                                label="Start Date"
                                value={filters.starts_at || null}
                                onChange={(v) => {
                                    update({ starts_at: v });
                                    // Optional: auto-adjust end date if it's before the new start
                                    if (filters.ends_at && dayjs(v).isAfter(dayjs(filters.ends_at))) {
                                        update({ ends_at: v });
                                    }
                                }}
                            />

                            <DateInput
                                label="End Date"
                                value={filters.ends_at || null}
                                onChange={(v) => update({ ends_at: v })}
                                minDate={filters.starts_at ? dayjs(filters.starts_at).toDate() : undefined}
                            />
                        </div>

                        {/* Date posted */}
                        <div>
                            <Select
                                label="Date posted"
                                value={filters.posted}
                                onChange={(v: string) => update({ posted: v as DatePosted })}
                                options={postedOptions}
                            />
                        </div>




                        {/* Sort by */}
                        <div>
                            <Select
                                label="Sort by"
                                value={filters.sort}
                                onChange={(v: string) => update({ sort: v as SortBy })}
                                options={sortByOptions}
                            />
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
                            <Select
                              label="Per page"
                              value={String(localPageSize)}
                              onChange={(v: string) => {
                                const newSize = Number(v);
                                setLocalPageSize(newSize); // update local state
                                setPage(1);                 // reset page to 1
                              }}
                              options={perPageOptions}
                            />
                        </div>
                    </div>

                    {/* Job cards */}
                    <div className="grid grid-cols-1 gap-4">
                        {pageSlice.map((job) => (
                            <article
                                key={job.id}
                                className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
                            >
                                {/* Main content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold truncate cursor-pointer" onClick={() => router.push(`/jobs/${job.slug}`)}>{job.title}</h3>
                                    {job.subtitle && <p className="text-sm text-gray-500">{job.subtitle}</p>}

                                    <div className="mt-1 text-sm text-gray-700 flex flex-wrap gap-x-3 gap-y-1">
                                        <span className="inline-flex items-center">
                                            {job?.price_type === "range" && job?.price_min && job?.price_max
                                                ? `${job.currency} ${job.price_min} – ${job.price_max}`
                                                : job?.price_value
                                                ? `${job.currency} ${job.price_value}`
                                                : "Not specified"}
                                            {job?.price_type && (
                                                <span className="inline-flex items-center gap-1">/ {job.price_type}</span>
                                            )}
                                        </span>
                                        <span>
                                            •{" "}
                                            {[job?.street, job?.city, job?.state, job?.postal_code, job?.countries?.name]
                                              .filter(Boolean)
                                              .join(", ")}
                                        </span>
                                        {job?.distance && <span>• {(job.distance / 1000).toFixed(2)} km away</span>}
                                        {job?.category_name && <span>• {job.category_name}</span>}
                                        {job?.job_type && <span>• {job.job_type.join(", ")}</span>}
                                        {job?.job_experience.length > 0 && (
                                            <span>• {job.job_experience.join(", ")}</span>
                                        )}
                                        {job?.starts_at && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Start: {dayjs(job.starts_at).format("MMM D, YYYY")}
                                            </span>
                                        )}
                                        {job?.ends_at && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> End: {dayjs(job.ends_at).format("MMM D, YYYY")}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Job tag badges */}
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                        {job.tags?.length > 0 &&
                                            job.tags.map((tag) => (
                                                <span key={tag.id} className="px-2 py-1 bg-gray-100 rounded-full">
                                                    {tag.name}
                                                </span>
                                            )
                                        )}
                                    </div>
                                      
                                    <div
                                        className="mt-2 text-sm text-gray-600 line-clamp-2"
                                        dangerouslySetInnerHTML={{ __html: job.description }}
                                    />
                                </div>
                                    
                                {/* Right-side container: posted date top, button bottom */}
                                <div className="flex flex-col justify-between items-end min-h-[80px]">
                                    <div className="text-xs text-gray-500">
                                        {isNew(job?.created_at) ? (
                                            <Button variant="outline" className="rounded-xl px-2 text-xs flex items-center gap-1 bg-green-100 mr-1 hover:bg-green-100"><span className="h-3">New </span></Button>
                                        ) : (
                                            "Posted " + new Date(job?.created_at).toLocaleDateString()
                                        )}
                                        {savedJobs.some((j) => j.id === job.id) ? (
                                            <Button
                                                variant="default"
                                                className="rounded-xl px-2 py-1 text-xs flex items-center gap-1 bg-green-50 text-green-700 border border-green-200"
                                                onClick={() => handleUnSaveJob(job.id)}
                                            >
                                                <BookmarkCheck className="h-3 w-3" />
                                            </Button>
                                        ) : (
                                            <Button variant="outline" className="rounded-xl px-2 py-1 text-xs flex items-center gap-1" onClick={() => handleSaveJob(job.id)}><Bookmark className="h-3 w-3" /></Button>
                                        )}
                                    </div>
                                    <button
                                      className="mt-2 inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                                      onClick={() => router.push(`/jobs/${job.slug}`)}
                                    >
                                        View
                                    </button>
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

                </section>
            </main>

            {/* Sticky mobile apply */}
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
            </div>
        </div>
    );
}

type Option = { label: string; value: string };

export function Select({
  label,
  value,
  onChange,
  options,
  width = "w-full", // ✅ default width (Tailwind class)
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  width?: string; // ✅ optional prop for width
}) {
  return (
    <div className={`text-sm ${width}`}>
      <span className="mb-1 block text-gray-700">{label}</span>

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={`flex ${width} items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black`}
          >
            {options.find((o) => o.value === value)?.label || "Select"}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Listbox.Button>

          <Listbox.Options
            className={`absolute z-10 mt-2 max-h-60 ${width} overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none`}
          >
            {options.map((o) => (
              <Listbox.Option
                key={o.value}
                value={o.value}
                className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700 ui-active:bg-gray-100"
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span>{o.label}</span>
                    {selected && <Check className="h-4 w-4 text-gray-600" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
