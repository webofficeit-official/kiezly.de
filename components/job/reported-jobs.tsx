"use client";

import React, { useEffect, useState } from "react";
import { formatDate } from "date-fns";
import { Select } from "./job-filter-select/select-option";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";
import { useMyReportedJobs } from "@/lib/react-query/queries/report-job";
import { JobReport } from "@/lib/types/report-job";

/**
 * Helper to check if a job was created recently (within 72h)
 */
const isNew = (createdAt: string) => {
    const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hours <= 72;
};

export default function ReportedJobsList() {
    const [jobReports, setJobReports] = useState<JobReport[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalApplications, setTotalApplications] = useState(0);
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState("asc");
    const { push, prefetch } = useLocalizedRouter();

    const t = useT("jobs");

    const perPageOptions = [
        { label: "1", value: "1" },
        { label: "5", value: "5" },
        { label: "10", value: "10" },
        { label: "25", value: "25" },
        { label: "50", value: "50" },
    ];

    const statusOptions = [
        { label: t("report.status.options.all"), value: "" },
        { label: t("report.status.options.pending"), value: "pending" },
        { label: t("report.status.options.reviewed"), value: "reviewed" },
        { label: t("report.status.options.rejected"), value: "rejected" },
        { label: t("report.status.options.resolved"), value: "resolved" },
    ];

    const sortOptions = [
        { label: t("report.sort.options.asc"), value: "asc" },
        { label: t("report.sort.options.desc"), value: "desc" },
    ];

    // Fetch data using custom hook
    const { data: myReports, isLoading } = useMyReportedJobs(
        status,
        page,
        pageSize,
        sort
    );

    useEffect(() => {
        if (myReports) {
            setJobReports(myReports.jobReports);
            setTotalPages(myReports.total_pages);
            setTotalApplications(myReports.total_items || 0);
        }
    }, [myReports]);

    // Page change
    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
    };

    // Page size change
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1); // reset to first page
    };

    // Status change
    const handleStatusChange = (newStatus: string) => {
        setStatus(newStatus);
        setPage(1); // reset to first page
    };

    // Sort change
    const handleSortChange = (newSort: string) => {
        setSort(newSort);
        setPage(1); // reset to first page
    };

    // Capitalize status
    const capitalize = (str: string) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between gap-10">
                    {/* Header */}
                    <h2 className="text-lg font-semibold">
                        {status === "" ? t("report.title") : `${statusOptions.find(s => s.value == status)?.label} Jobs`} (
                        {totalApplications})
                    </h2>
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                        <Select
                            label={t("report.status.label")}
                            value={status}
                            onChange={handleStatusChange}
                            options={statusOptions}
                            width="w-32"
                        />
                        <Select
                            label={t("report.sort.label")}
                            value={sort}
                            onChange={handleSortChange}
                            options={sortOptions}
                            width="w-32"
                        />
                        <Select
                            label={t("report.per-page.label")}
                            value={String(pageSize)}
                            onChange={(v: string) => handlePageSizeChange(Number(v))}
                            options={perPageOptions}
                            width="w-16"
                        />
                    </div>
                </div>

                {/* Application cards */}
                <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Right: Job list + debug preview */}
                    <section className="lg:col-span-3 space-y-4">
                        {/* Stats + controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {jobReports.map((rep) => (
                                <article
                                    key={`${rep.id}`}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col justify-between"
                                >
                                    {/* Header */}
                                    <div
                                        className="cursor-pointer"
                                        onMouseEnter={() => prefetch(`/jobs/${rep.job.slug}`)}
                                        onClick={() => push(`/jobs/${rep.job.slug}`)}
                                    >
                                        <div
                                            className="flex items-start justify-between"
                                            onMouseEnter={() => prefetch(`/jobs/${rep.job.slug}`)}
                                            onClick={() => push(`/jobs/${rep.job.slug}`)}
                                        >
                                            <span className="inline-block text-sm text-gray-800 py-1 rounded-full">
                                                {formatDate(rep.created_at, "dd MMM, yyyy")}
                                            </span>
                                            <div className="text-xs">
                                                {" "}
                                                <span className={getStatusClasses(rep.status)}>
                                                    {statusOptions.find(s => s.value == rep.status)?.label}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-base font-semibold text-gray-900 mt-4 line-clamp-2 hover:text-black transition">
                                            {t(`report.reason.options.${rep.reason}`)}
                                        </h3>
                                        <div
                                            className="text-xs text-gray-500 mt-1 tracking-wide font-medium"
                                            dangerouslySetInnerHTML={{ __html: rep.description || "" }}
                                        />
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-end justify-between mt-6 pt-4 border-t border-gray-100">
                                        <div className="text-xs text-gray-600 leading-tight">
                                        </div>

                                        <button
                                            className="bg-black hover:bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-full transition"
                                            onMouseEnter={() => prefetch(`/jobs/${rep.job.slug}`)}
                                            onClick={() => push(`/jobs/${rep.job.slug}`)}
                                        >
                                            {t("report.view")}
                                        </button>
                                    </div>
                                </article>
                            ))}
                            {jobReports.length === 0 && (
                                <div className="bg-white rounded-2xl border p-6 text-center text-sm text-gray-600">
                                    {t("report.no-reports")}
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                {/* Pagination */}
                <nav
                    className="flex items-center justify-between gap-2"
                    aria-label={t("report.pagination.aria-label")}
                >
                    <button
                        className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                    >
                        {t("report.pagination.prev")}
                    </button>

                    <div className="flex items-center gap-1" data-testid="pager">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5)
                            .map((n) => (
                                <button
                                    key={n}
                                    className={`rounded-xl border px-3 py-2 text-sm ${n === page ? "bg-black text-white" : ""
                                        }`}
                                    onClick={() => handlePageChange(n)}
                                >
                                    {n}
                                </button>
                            ))}
                    </div>

                    <button
                        className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages}
                    >
                        {t("report.pagination.next")}
                    </button>
                </nav>
            </main>
        </div>
    );
}

function getStatusClasses(status: string) {
    switch (status.toLowerCase()) {
        case "resolved":
            return "px-3 py-1 rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300";
        case "pending":
            return "px-3 py-1 rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-300";
        case "reviewed":
            return "px-3 py-1 rounded-xl bg-blue-100 text-blue-700 ring-1 ring-blue-300";
        case "rejected":
            return "px-3 py-1 rounded-xl bg-red-100 text-red-700 ring-1 ring-red-300";
        default:
            return "px-3 py-1 rounded-xl bg-gray-100 text-gray-600";
    }
}
