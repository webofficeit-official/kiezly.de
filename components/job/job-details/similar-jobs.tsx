import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookmarkCheck, ExternalLink } from "lucide-react";
import { Filters, Job } from "@/lib/types/job";
import { useJobs, useSavedJobs } from "@/lib/react-query/queries/useJob";

import { useRouter } from "next/navigation";
import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { fromQuery } from "@/lib/utils/job-query-filters";

export default function SimilarJobCard({ job }) {
    const router = useRouter();
    const DEFAULT_FILTERS: Filters = {
        q: "",
        city: "",
        category_id: [job.category_id],
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

    const [filters, setFilters] = useState<Filters>(() => {
        if (typeof window === "undefined") return DEFAULT_FILTERS;
        const initial = fromQuery(window.location.search);

        return {
            ...initial,
            category_id: [job.category_id]
        };
    });
    const [page, setPage] = useState(1);
    const [localPageSize, setLocalPageSize] = useState(4);

    const buildApiFilters = (filters: Filters, page: number, pageSize: number) => {
        const payload: Record<string, any> = { page, page_size: pageSize };
        if (filters.category_id.length) payload.category_id = filters.category_id.join(",");

        return payload;
    };

    const apiFilters = useMemo(() => buildApiFilters(filters, page, localPageSize), [filters, page, localPageSize]);
    const { data, isLoading, error } = useJobs(apiFilters);

    let similarJobs = data?.data?.items
    similarJobs = similarJobs?.filter((j) => j.id !== job.id)
    similarJobs = similarJobs?.slice(0, 3)

    return (
        <Card className="shadow-lg border-gray-100 bg-white">
            <CardHeader className="border-b border-gray-100 p-4 sm:p-5">
                <CardTitle className="text-xl font-bold text-gray-900">
                    Similar Jobs
                </CardTitle>
            </CardHeader>
            <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white/80">

                {/* Right: Job list + debug preview */}
                <section className="lg:col-span-3 space-y-4">
                    {/* Stats + controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similarJobs?.map((job) => (
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
                                    </div>

                                    {/* Category */}
                                    <p className="text-xs text-gray-500 mt-4 uppercase tracking-wide font-medium">
                                        {job.category_name}
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
                        {similarJobs?.length === 0 && (
                            <div className="bg-white rounded-2xl border p-6 text-center text-sm text-gray-600">
                                No jobs match your filters.
                            </div>
                        )}
                    </div>

                </section>
            </main>
        </Card>
    );
}