'use client'
import { JobList } from "@/lib/types/job";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "../ui/button";
import { Bookmark, BookmarkCheck, Eye } from "lucide-react";
import { useSavedJobs, useUnsaveJob } from "@/lib/react-query/queries/useJob";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

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
    const [savedJobs, setSavedJobs] = useState([]);
    const { user } = useAuth();



    const router = useRouter();



    const { data, isLoading, error } = useSavedJobs();
    const unsaveMutation = useUnsaveJob();

    // Debounce high-churn fields (search query)

    const dataSource: JobList[] = useMemo(() => {
        setSavedJobs(data?.jobs || [])
        if (data?.jobs) return data.jobs as JobList[];
        if (jobs && jobs.length) return jobs;
        return []
    }, [data, jobs]);

    const pageSlice = dataSource;


    const handleUnSaveJob = async (jobId: string) => {
        try {
            setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
            if (user) {
                unsaveMutation.mutate(jobId);
            } else {
                const localStoredJobs = localStorage.getItem("saved-jobs")
                let savedJobsLocal = []
                if (localStoredJobs) {
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
                {/* Right: Job list + debug preview */}
                <section className="lg:col-span-3 space-y-4">
                    {/* Stats + controls */}


                    {/* Job cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {pageSlice.map((job) => (
                            <article
                                key={`${job.id}-${job.slug}`}
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
                                            job.tags.map((tag, index) => (
                                                <span key={index} className="px-2 py-1 bg-gray-100 rounded-full">
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
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">
                                                <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                                                New
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-gray-500">
                                                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14A6 6 0 1110 4a6 6 0 010 12zm-.5-6V5h1v5h4v1h-5z" />
                                                </svg>
                                                Posted {new Date(job?.created_at).toLocaleDateString()}
                                            </span>
                                        )}


                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {savedJobs.some((j) => j.id === job.id) && (
                                            <Button
                                                variant="default"
                                                className="rounded-xl px-2 py-1 text-xs flex items-center gap-1 bg-green-50 text-green-700 border border-green-200"
                                                onClick={() => handleUnSaveJob(job.id)}
                                            >
                                                <BookmarkCheck className="h-3 w-3" />
                                            </Button>
                                        )}
                                        {/* View */}
                                        <button
                                            className="mt-1 inline-flex items-center justify-center rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                                            onClick={() => router.push(`/jobs/${job.slug}`)}
                                        >
                                            View
                                        </button>





                                    </div>
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
