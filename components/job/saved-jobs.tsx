'use client'
import { savedJobs } from "@/lib/react-query/queries/useJob";
import { JobList } from "@/lib/types/job";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "../ui/button";

export type Status = "draft" | "pending_review" | "open" | "closed" | "rejected" | "expired" | "saved";

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
    { label: "Saved", value: "saved" },
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




export default function SavedJobs({
    onChange,
    jobs,
}: {
    onChange?: (f: Filters) => void;
    jobs?: JobList[];
}) {
    const { user } = useAuth();



    const router = useRouter();



    const { data, isLoading, error } = savedJobs();

    // Debounce high-churn fields (search query)

    const dataSource: JobList[] = useMemo(() => {
        if (data?.jobs) return data.jobs as JobList[];
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
