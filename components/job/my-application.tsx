"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useMyApplications } from "@/lib/react-query/queries/apply-job";
import { MyApplications } from "@/lib/types/apply-job";
import { Select } from "./list";
import { formatDate } from "date-fns";

/**
 * Helper to check if a job was created recently (within 72h)
 */
const isNew = (createdAt: string) => {
  const hours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  return hours <= 72;
};

const perPageOptions = [
  { label: "1", value: "1" },
  { label: "5", value: "5" },
  { label: "10", value: "10" },
  { label: "25", value: "25" },
  { label: "50", value: "50" },
];

const statusOptions = [
  { label: "All", value: "" },
  { label: "Applied", value: "applied" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Accepted", value: "accepted" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

export default function AppliedJobList() {
  const router = useRouter();
  const [applications, setApplications] = useState<MyApplications[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [status, setStatus] = useState("");

  // Fetch data using custom hook
  const { data: mpApplications, isLoading } = useMyApplications(status, page, pageSize);

  useEffect(() => {
    if (mpApplications) {
      setApplications(mpApplications.applications);
      setTotalPages(mpApplications.total_pages);
      setTotalApplications(mpApplications.total_items || 0);
    }
  }, [mpApplications]);

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
            {status === "" ? "Applied Jobs" : `${capitalize(status)} Jobs`} ({totalApplications})
          </h2>
          {/* Filters */}
          <div className="flex items-center justify-between gap-6">
            <Select
              label="Status"
              value={status}
              onChange={handleStatusChange}
              options={statusOptions}
              width="w-32"
            />
            <Select
              label="Per page"
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
              {applications.map((app) => (
                <article
                  key={`${app.id}`}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col justify-between"
                >
                  {/* Header */}
                  <div className="cursor-pointer" onClick={() => window.location.href = `/jobs/${app.job.slug}`}>
                    <div className="flex items-start justify-between" onClick={() => window.location.href = `/jobs/${app.job.slug}`}>
                      <span className="inline-block text-sm text-gray-800 py-1 rounded-full">
                        {formatDate(app.created_at, "dd MMM, yyyy")}
                      </span>
                      <div className="text-xs"> <span className={getStatusClasses(app.status)}>{app.status}</span></div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-gray-900 mt-4 line-clamp-2 hover:text-black transition">
                      {app.job.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 tracking-wide font-medium">
                      <span className="font-bold text-black">Note: </span>{app.cover_note}
                    </p>

                    {/* Tags */}
                    {app.job.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {app.job.tags.map((tag, index) => (
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
                        {app.proposed_rate}
                        <span className="text-gray-500 text-xs ml-1">
                          / Proposed Rate
                        </span>
                      </p>
                    </div>

                    <button
                      className="bg-black hover:bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-full transition"
                      onClick={() => window.location.href = `/jobs/${app.job.slug}`}
                    >
                      View
                    </button>
                  </div>
                </article>
              ))}
              {applications.length === 0 && (
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
            {Array.from({ length: totalPages }, (_, i) => i + 1)
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
            disabled={page >= totalPages}
          >
            Next
          </button>
        </nav>
      </main>
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
