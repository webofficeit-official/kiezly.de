'use client'
import { JobList } from "@/lib/types/job";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { Button } from "../ui/button";
import { Bookmark, BookmarkCheck, Eye } from "lucide-react";
import { useSavedJobs, useUnsaveJob } from "@/lib/react-query/queries/useJob";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { formatDate } from "date-fns";

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
            <main className="max-w-6xl mx-auto px-4 py-6 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Saved Jobs ({pageSlice.length})
                    </h2>
                </div>
            </main>
            <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Right: Job list + debug preview */}
                <section className="lg:col-span-3 space-y-4">
                    {/* Stats + controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pageSlice.map((job) => (
                            <article
                                key={`${job.id}-${job.slug}`}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col justify-between"
                            >
                                {/* Header */}
                                <div className="cursor-pointer" onClick={() => window.location.href = `/jobs/${job.slug}`}>
                                    <div className="flex items-start justify-between" onClick={() => window.location.href = `/jobs/${job.slug}`}>
                                        <span className="inline-block text-sm text-gray-800 py-1 rounded-full">
                                            {formatDate(job.starts_at, "dd MMM, yyyy")} – {formatDate(job.ends_at, "dd MMM, yyyy")}
                                        </span>

                                        {savedJobs.some((j) => j.id === job.id) && (
                                            <Button
                                                variant="outline"
                                                className="text-green-600 bg-green-50 border border-green-200 rounded-lg px-2 py-1 hover:bg-green-100 transition"
                                                onClick={() => handleUnSaveJob(job.id)}
                                            >
                                                <BookmarkCheck className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <p className="text-xs text-gray-500 mt-4 uppercase tracking-wide font-medium">
                                        {job.category?.name}
                                    </p>

                                    {/* Title */}
                                    <h3 className="text-base font-semibold text-gray-900 mt-1 line-clamp-2 hover:text-black transition">
                                        {job.title}
                                    </h3>

                                    {/* Tags */}
                                    {job.tags?.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {job.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2.5 py-1 text-xs bg-gray-100 border border-gray-200 text-gray-700 rounded-full"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-100">
                                    <div className="text-xs text-gray-600 leading-tight">
                                        <p className="font-semibold text-sm text-gray-900">
                                            {job?.price_type === "range" && job?.price_min && job?.price_max
                                                ? `${job.currency} ${job.price_min} – ${job.price_max}`
                                                : job?.price_value
                                                    ? `${job.currency} ${job.price_value}`
                                                    : "Not specified"}
                                            {job?.price_type && (
                                                <span className="text-gray-500 text-xs ml-1">
                                                    / {job.price_type}
                                                </span>
                                            )}
                                        </p>
                                        {job?.distance && (
                                            <p className="text-gray-500 text-xs mt-1">
                                                {(job.distance / 1000).toFixed(2)} km away
                                            </p>
                                        )}
                                        <p className="text-gray-500 text-xs mt-1">
                                            {job.city}, {job.state}, {job.countries?.name}
                                        </p>
                                    </div>

                                    <button
                                        className="bg-black hover:bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-full transition"
                                        onClick={() => window.location.href = `/jobs/${job.slug}`}
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
