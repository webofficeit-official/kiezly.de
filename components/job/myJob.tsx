'use client'
import { myJobs } from "@/lib/react-query/queries/useJob";
import { JobList } from "@/lib/types/job";
import { Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { Listbox } from "@headlessui/react";
import { Button } from "../ui/button";

export type Status = "draft" | "pending_review" | "open" | "closed" | "rejected" | "expired";

export type Filters = {
    status?: Status
};

const DEFAULT_FILTERS: Filters = {
    status: 'open'
};

const perPageOptions = [
  { label: "Draft", value: "draft" },
  { label: "Pending Review", value: "pending_review" },
  { label: "Published", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Rejected", value: "rejected" },
  { label: "Expired", value: "expired" },
];

// ---- Utilities ----
export const toQuery = (f: Filters) => {
    const p = new URLSearchParams();
    if (f.status) p.set("status", f.status);
    return p.toString();
};

export const fromQuery = (qs: string): Filters => {
    const p = new URLSearchParams(qs);
    return {
        ...DEFAULT_FILTERS,
        status: (p.get("status") as Status) || "open",
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

export default function MyJobs({
    onChange,
    jobs,
}: {
    onChange?: (f: Filters) => void;
    jobs?: JobList[];
}) {
    const { user } = useAuth();
    const [filters, setFilters] = useState<Filters>(() => {
        if (typeof window === "undefined") return DEFAULT_FILTERS;
        const initial = fromQuery(window.location.search);

        return initial;
    });

    const [page, setPage] = useState(1);
    const router = useRouter();
    const buildApiFilters = (filters: Filters, page: number) => {
        const payload: Record<string, any> = { page };
        if (filters.status) payload.status = filters.status;

        return payload;
    };

    const apiFilters = useMemo(() => buildApiFilters(filters, page), [filters, page]);
    const { data, isLoading, error } = myJobs(apiFilters);

    // Debounce high-churn fields (search query)
    const debouncedFilters = useDebounced(filters, 300);

    useEffect(() => {
        onChange?.(debouncedFilters);
    }, [debouncedFilters, onChange]);

    useEffect(() => {
        setPage(1);
    }, [debouncedFilters]);

    useEffect(() => {
        onChange?.(filters);
    }, [filters, onChange]);

    const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));


    const dataSource: JobList[] = useMemo(() => {
        if (data?.data?.items) return data.data.items as JobList[];
        if (jobs && jobs.length) return jobs;
        return []
    }, [data, jobs]);


    const pageSlice = dataSource;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900"> {/* Content */}
            <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Right: Job list + debug preview */}
                <section className="lg:col-span-3 space-y-4">
                    {/* Stats + controls */}
                    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">{perPageOptions.find((o) => o.value === filters.status)?.label || "Select"} jobs</h2>
                        </div>
                        <div className="flex items-center gap-4 w-45">
                            <Select
                                label="Select Type"
                                value={filters.status}
                                onChange={(v: string) => update({ status: v as Status })}
                                options={perPageOptions}
                            />
                        </div>
                    </div>

                    {/* Job cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {pageSlice.map((job) => (
                            <article
                                key={job.id}
                                className="bg-white rounded-2xl border shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
                            >
                                {/* Main content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold truncate">{job.title}</h3>
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
                                            {[job?.street, job?.city, job?.state, job?.postal_code, job?.country]
                                              .filter(Boolean)
                                              .join(", ")}
                                        </span>
                                        {job?.distance && <span>• {(job.distance / 1000).toFixed(2)} km away</span>}
                                        {job?.category_name && <span>• {job.category_name}</span>}
                                        {job?.job_type && <span>• {job.job_type.join(", ")}</span>}
                                        {job?.job_experience.length > 0 && (
                                            <span>• {job.job_experience.join(", ")}</span>
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
                                </div>
                                    
                                {/* Right-side container: posted date top, button bottom */}
                                <div className="flex flex-col justify-between items-end min-h-[80px]">
                                    <div className="text-xs text-gray-500">
                                        {isNew(job?.created_at) ? (
                                            <Button variant="outline" className="rounded-xl px-2 text-xs flex items-center gap-1 bg-green-100 mr-1 hover:bg-green-100"><span className="h-3">New </span></Button>
                                        ) : (
                                            "Posted " + new Date(job?.created_at).toLocaleDateString()
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

                </section>
            </main>
        </div>
    );
}

type Option = { label: string; value: string };

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  // If label is "Status" (or you want to show this option explicitly)
  const finalOptions =
    label.toLowerCase().includes("status") ||
    label.toLowerCase().includes("review")
      ? [{ label: "Pending review", value: "pending_review" }, ...options]
      : options;

  return (
    <div className="text-sm">
      <span className="mb-1 block text-gray-700">{label}</span>

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          {/* Fixed width */}
          <Listbox.Button className="flex w-56 items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black">
            {finalOptions.find((o) => o.value === value)?.label || "Select"}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Listbox.Button>

          <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-56 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none">
            {finalOptions.map((o) => (
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
