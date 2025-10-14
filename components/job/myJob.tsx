'use client'
import { myJobs, useCloseJob } from "@/lib/react-query/queries/useJob";
import { JobList } from "@/lib/types/job";
import { ArrowRight, Check, ChevronDown, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { Listbox } from "@headlessui/react";
import { Button } from "../ui/button";
import AlertBox from "../shared-ui/delete-alert-box/delet-alert-box";
import toast from "react-hot-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { formatDate } from "date-fns";

export type Status = "draft" | "pending_review" | "open" | "closed" | "rejected" | "expired" | "saved";

export type Filters = {
    status?: Status
};

const DEFAULT_FILTERS: Filters = {
    status: 'open'
};

const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Pending Review", value: "pending_review" },
    { label: "Published", value: "open" },
    { label: "Closed", value: "closed" },
    { label: "Rejected", value: "rejected" },
    { label: "Expired", value: "expired" },
    { label: "Saved", value: "saved" },
];

const perPageOptions = [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
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
    const [pageSize, setPageSize] = useState(12);
    const router = useRouter();
    const buildApiFilters = (filters: Filters, page: number, pageSize: number) => {
        const payload: Record<string, any> = { page, page_size: pageSize };
        if (filters.status) payload.status = filters.status;

        return payload;
    };

    const apiFilters = useMemo(() => buildApiFilters(filters, page, pageSize), [filters, page, pageSize]);
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
    const closeJobMutation = useCloseJob();

    const CloseJobButton = React.forwardRef<HTMLButtonElement, { onClick: (e: React.MouseEvent) => void }>(
        ({ onClick }, ref) => (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button ref={ref} onClick={(e) => {
                            e.stopPropagation();
                            onClick(e);
                        }} className="p-1 rounded hover:bg-gray-100">
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        Close Job
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    );

    // Page size change
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1); // reset to first page
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > data?.data?.total_items) return;
        setPage(newPage);
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 text-gray-900">
                <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between gap-10">
                        {/* Header */}
                        <h2 className="text-lg font-semibold">
                            My Jobs - {statusOptions.find((o) => o.value === filters.status)?.label || "Select"} Jobs ({pageSlice.length})
                        </h2>
                        {/* Filters */}
                        <div className="flex items-center justify-between gap-6">

                            <Select
                                label="Per page"
                                value={String(pageSize)}
                                onChange={(v: string) => handlePageSizeChange(Number(v))}
                                options={perPageOptions}
                            />
                            <Select
                                label="Select Type"
                                value={filters.status}
                                onChange={(v: string) => update({ status: v as Status })}
                                options={statusOptions}
                            />
                        </div>
                    </div>

                    {/* Application cards */}
                    <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Right: Job list + debug preview */}
                        <section className="lg:col-span-3 space-y-4">
                            {/* Stats + controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pageSlice?.map((job) => (
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
                                                <span className="space-x-2 ">

                                                    {/* Edit */}
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    className="p-1 rounded hover:bg-gray-100"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        router.push(`/post-job/basic-details?slug=${job.slug}`)
                                                                    }
                                                                    }
                                                                >
                                                                    {job.status === "draft" ? (
                                                                        <ArrowRight className="w-4 h-4 text-amber-500" />
                                                                    ) : (
                                                                        <Pencil className="w-4 h-4 text-amber-500" />
                                                                    )}
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="text-xs">
                                                                {job.status === "draft" ? "Continue Job" : " Edit Job"}

                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>

                                                    {/* Delete */}
                                                    <AlertBox
                                                        trigger={<CloseJobButton onClick={(e) => {
                                                            e.stopPropagation(); 
                                                        }} />}
                                                        title="Close Job?"
                                                        description="Are you sure you want to close this job? This action cannot be undone."
                                                        confirmText="Close"
                                                        cancelText="Cancel"
                                                        onConfirm={(e) => {
                                                            e?.stopPropagation?.();
                                                            closeJobMutation.mutate(job.id, {
                                                                onSuccess: () => {
                                                                    toast.success("Job closed successfully!")
                                                                    update({ status: "closed" });
                                                                },
                                                                onError: (error: any) => toast.error(error.message || "Failed to close the job"),
                                                            });
                                                        }}
                                                    />
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
                                {pageSlice?.length === 0 && (
                                    <div className="bg-white rounded-2xl border p-6 text-center text-sm text-gray-600">
                                        No jobs match your filters.
                                    </div>
                                )}
                            </div>

                        </section>
                    </main>

                    {/* Pagination */}
                    <nav className="flex items-center justify-between gap-2" aria-label="Pagination">
                        <button
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1}
                        >
                            Prev
                        </button>

                        <div className="flex items-center gap-1" data-testid="pager">
                            {Array.from({ length: data?.data?.total_pages }, (_, i) => i + 1)
                                .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                                .map((n) => (
                                    <button
                                        key={n}
                                        className={`rounded-xl border px-3 py-2 text-sm ${n === page ? "bg-black text-white" : ""}`}
                                        onClick={() => handlePageChange(n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                        </div>

                        <button
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= data?.data?.total_pages}
                        >
                            Next
                        </button>
                    </nav>
                </main>
            </div>
        </>
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

function getStatusClasses(status: string) {
    switch (status.toLowerCase()) {
        case "accepted":
            return "px-3 py-1 rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300";
        case "shortlisted":
            return "px-3 py-1 rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-300";
        case "applied":
            return "px-3 py-1 rounded-xl bg-blue-100 text-blue-700 ring-1 ring-blue-300";
        case "rejected":
            return "px-3 py-1 rounded-xl bg-red-100 text-red-700 ring-1 ring-red-300";
        case "withdrawn":
            return "px-3 py-1 rounded-xl bg-gray-100 text-gray-600 ring-1 ring-gray-300";
        default:
            return "px-3 py-1 rounded-xl bg-gray-100 text-gray-600";
    }
}