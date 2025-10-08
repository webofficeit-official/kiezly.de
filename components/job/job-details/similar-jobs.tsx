import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { Job } from "@/lib/types/job";
import { useJobs } from "@/lib/react-query/queries/useJob";
import { Filters, fromQuery } from "../list";
import { useRouter } from "next/navigation";

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

            <CardContent className="space-y-6 p-4 sm:p-5">

                {/* Job Cards Grid */}
                {/* Increased gap and ensured equal size on different screens */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Map over your actual similarJobs array here */}
                    {similarJobs?.map((simJob) => (
                        <div
                            key={simJob.id}
                            onClick={() => router.push(`/jobs/${simJob.slug}`)}
                            className="flex flex-col rounded-xl cursor-pointer border border-gray-200 p-4 transition-all duration-200 
                                       hover:border-gray-400 hover:shadow-md bg-white min-h-[160px]"
                        >
                            {/* Header: Category & Title */}
                            <div className="flex flex-col mb-2 flex-1">
                                {/* Job Title */}
                                <h4 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-snug">
                                    {simJob.title}
                                </h4>
                                {/* Category/Pill */}
                                <span className="text-xs text-gray-600 tracking-wider mb-1">
                                    {simJob.subtitle}
                                </span>
                            </div>

                            {/* Description/Snippet (Moved below title for better hierarchy) */}
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3">
                                {simJob.description}
                            </p>

                            {/* Footer: Rate (Highlighted) */}
                            <div className="mt-3 pt-2 border-t border-gray-100">
                                <span className="text-sm font-semibold text-gray-800">
                                    {
                                        simJob.price_type == 'fixed' ? `${simJob.currency} ${simJob.price_value}` : `${simJob.currency} ${simJob.price_min} - ${simJob.price_max}`
                                    }
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Link */}
                <div className="pt-2">
                    <a
                        href={`/jobs?category_id=${job?.category?.id}`}
                        className="inline-flex items-center gap-2 text-base font-semibold text-gray-800 hover:text-black hover:underline"
                    >
                        View all similar **{job?.category?.name || 'Category'}** jobs
                        <ExternalLink className="h-4 w-4" />
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}