"use client";

import ApplicantDetailModal from "@/components/ui/ApplicantDetailModal";
import { Loader } from "@/components/ui/loader";
import UpdateStatusModal from "@/components/ui/UpdateStatusModal";
import { useAuth } from "@/lib/context/auth-context";
import { useJobApplicants } from "@/lib/react-query/queries/apply-job";
import { useJob } from "@/lib/react-query/queries/useJob";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import ApplicantCard from "./applicant-card/applicant-card";
import { Select } from "../list";
interface ApplicantsPageProps {
  params: { slug: string };
}
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

export default function ApplicantsPanelList({ params }: ApplicantsPageProps) {
  const { slug } = params;
  const { user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);

  const openUserModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUserId(null);
  };

  const openUpdateModal = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplicant(null);
  };

  const { data: job, isLoading, isError } = useJob(slug as string);

  const jobDetails = job?.job;

  const jobId = jobDetails?.id;
  useEffect(() => {
    if (user && job) {
      if (user.role !== "client" || jobDetails?.client_id !== user.id) {
        router.push(`/jobs/${slug}`); // redirect to public job page
      }
    }
  }, [user, job]);




  const { data, isLoading: isLoadingApplicants } = useJobApplicants({
    jobId,
    status: statusFilter,
    sort,
    page,
    pageSize,
    enabled: jobId && user?.role === "client",
  });

  useEffect(() => {
    if (data) {
      setTotalPages(data.total_pages || 1);
    }
  }, [data]);
  if (isLoading) {
    return <Loader />;
  }

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1); // reset to first page
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1); // reset to first page
  };

  const handleSortChange = (newSort: "asc" | "desc") => {
    setSort(newSort);
    setPage(1); // reset to first page when sort changes
  };
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Applicants for {jobDetails.title}
          </h2>
        </div>


        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex justify-between items-center flex-wrap gap-4">
          {/* Left group */}
          <div className="flex items-center gap-6">
            <Select
              label="Status"
              value={statusFilter}
              onChange={handleStatusChange}
              options={statusOptions}
              width="w-32"
            />
            {/* Add more filters here if needed */}
          </div>

          {/* Right group */}
          <div className="flex items-center gap-6">
            <Select
              label="Proposed Rate"
              value={sort}
              onChange={(v: string) => handleSortChange(v as 'asc' | 'desc')}
              options={[
                { label: 'Ascending', value: 'asc' },
                { label: 'Descending', value: 'desc' },
              ]}
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


        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data && data?.applicants.length > 0 ? (
            data?.applicants?.map((applicant) => (
              <ApplicantCard
                key={applicant.id}
                applicant={applicant}
                openUserModal={openUserModal}
                openUpdateModal={openUpdateModal}
              />
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-base text-gray-600 shadow-md">
                <p className="text-gray-500 text-sm italic py-2">No applicants have applied yet.</p>
              </div>
            </div>
          )}
        </div>

        <nav className="flex items-center justify-between gap-2 mt-6" aria-label="Pagination">
          <button
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.max(0, page - 3) + 5) // show max 5 pages
              .map((n) => (
                <button
                  key={n}
                  className={`rounded-xl border px-3 py-2 text-sm ${n === page ? "bg-black text-white" : ""}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
          </div>

          <button
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </nav>


        <UpdateStatusModal
          isOpen={isModalOpen}
          onClose={closeModal}
          applicant={selectedApplicant}
        />

        <ApplicantDetailModal
          isOpen={isUserModalOpen}
          onClose={closeUserModal}
          userId={selectedUserId}
        />

      </main>
    </div>
  );
}


