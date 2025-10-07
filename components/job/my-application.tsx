"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Clock } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useMyApplications } from "@/lib/react-query/queries/apply-job";
import { MyApplications } from "@/lib/types/apply-job";
import { Select } from "./list";
import { getMyApplications } from "@/lib/react-query/api-handler/apply-job";

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
  const [totalPages, setTotalPages] = useState(10);
  const [localPageSize, setLocalPageSize] = useState(pageSize);

  const [status, setStatus] = useState("");

  const mpApplications = useMyApplications(status, page, pageSize);

  useEffect(() => {
    setApplications(mpApplications?.data?.applications);
    setTotalPages(mpApplications?.data?.total_pages);
  }, [mpApplications?.data?.applications]);

  const filterApplication = async (s: string, p: number, pz: number) => {
    const filtered = await getMyApplications(s, p, pz);
    if(filtered) {
      setApplications(filtered?.data?.applications)
      setTotalPages(filtered?.data?.total_pages)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Applied Jobs ({applications?.length})
          </h2>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{applications?.length} jobs</h2>
            <p className="text-sm text-gray-600">Page {page} of {applications?.length}</p>
          </div>
          <div className="flex items-center gap-10">
            <Select
              label="Status"
              value={status}
              onChange={(v: string) => {
                setStatus(v); 
                filterApplication(v, page, pageSize)
              }}
              options={statusOptions}
              width="w-32"
            />
            <Select
              label="Per page"
              value={String(localPageSize)}
              onChange={(v: string) => {
                const newSize = Number(v);
                setLocalPageSize(newSize);
                setPage(1);
                filterApplication(status, page, Number(v))
              }}
              options={perPageOptions}
              width="w-16"
            />
          </div>
        </div>

        {/* Application card container - Clean grid for responsiveness */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applications?.length > 0 ? (
            applications.map((app) => (
              <article
                key={app.id}
                // Base Card: White background, subtle shadow, dark border on hover for interaction
                className="bg-white rounded-xl border border-gray-100 shadow-sm transition-all duration-200 hover:shadow-lg hover:border-gray-300 p-5 flex flex-col"
              >
                <div className="flex flex-col flex-1 min-w-0">
                  {/* Job Title - Prominent and dark */}
                  <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                    {app.job.title}
                  </h3>

                  {/* Rate - Highlighted with darker gray and border */}
                  {app.proposed_rate && (
                    <p className="text-sm font-semibold text-gray-700 mb-3 border-l-2 pl-3 border-gray-400">
                      Proposed Rate: <span className="text-lg text-gray-900 ml-1">{app.proposed_rate}</span>
                    </p>
                  )}

                  {/* Cover Note - Subtle gray text */}
                  {app.cover_note && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      <span className="font-semibold text-gray-800">Note:</span> {app.cover_note}
                    </p>
                  )}
                </div>

                {/* Separator Line */}
                <hr className="my-4 border-gray-100" />

                {/* Footer/Action area */}
                <div className="flex justify-between items-center pt-1">
                  {/* Status Badge - Distinguished by shades and borders */}
                  <div className="text-xs font-medium">
                    {/* Function or logic to determine the status color classes */}
                    <span
                      className={getStatusClasses(app.status)}
                    >
                      {app.status}
                    </span>
                  </div>

                  {/* View Details Button - Text link style */}
                  <Button
                    variant="outline"
                    className="text-sm font-semibold text-gray-800 hover:text-black hover:bg-gray-100 transition-colors duration-200 rounded-lg px-4 py-2"
                    onClick={() => router.push(`/jobs/${app.job.slug}`)}
                  >
                    View Details &rarr;
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-base text-gray-600 shadow-md">
                You haven’t applied to any jobs yet.
              </div>
            </div>
          )}
        </div>

                    {/* Pagination */}
                    <nav className="flex items-center justify-between gap-2" aria-label="Pagination">
                        <button
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                            onClick={() => {
                              setPage((p) => Math.max(1, p - 1))
                              filterApplication(status, page, pageSize)
                            }}
                            disabled={page <= 1}
                        >
                            Prev
                        </button>
                        <div className="flex items-center gap-1" data-testid="pager">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5).map((n) => (
                                <button
                                    key={n}
                                    className={`rounded-xl border px-3 py-2 text-sm ${n === page ? "bg-black text-white" : ""}`}
                              onClick={() => {
                                setPage((p) => Math.max(1, p - 1))
                                filterApplication(status, page, pageSize)
                              }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <button
                            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
                            onClick={() => {
                              setPage((p) => Math.max(1, p - 1))
                              filterApplication(status, page, pageSize)
                            }}
                            disabled={page >= totalPages}
                        >
                            Next
                        </button>
                    </nav>
      </main>
    </div>
  );
}

function getStatusClasses(status) {
  switch (status.toLowerCase()) {
    case 'accepted':
      return 'px-3 py-1 rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300';
    case 'shortlisted':
      return 'px-3 py-1 rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-300';
    case 'applied':
      return 'px-3 py-1 rounded-xl bg-blue-100 text-blue-700 ring-1 ring-blue-300';
    case 'rejected':
      return 'px-3 py-1 rounded-xl bg-red-100 text-red-700 ring-1 ring-red-300';
    case 'withdrawn':
      return 'px-3 py-1 rounded-xl bg-gray-100 text-gray-600 ring-1 ring-gray-300';
    default:
      return 'px-3 py-1 rounded-xl bg-gray-100 text-gray-600';
  }
}