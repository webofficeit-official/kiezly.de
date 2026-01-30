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
import { Select } from "../job-filter-select/select-option";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "@/app/[locale]/layout";
import { isJobExpired } from "@/lib/utils/isJobExpired";
import Message from "@/components/Chat/message";
interface ApplicantsPageProps {
  params: { slug: string };
}
type OpenChat = {
  key: string;
  jobId: string;
  receiverId: string;
  title: string;
  subtitle: string;
  minimized: boolean;
  zIndex: number;
  initialPosition?: { x: number; y: number };
};

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
  const [pageSize, setPageSize] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [topZIndex, setTopZIndex] = useState(100);

  const { push } = useLocalizedRouter();
  const t = useT("application");

  const perPageOptions = [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ];

  const statusOptions = [
    { label: t("applicants-panel.status.options.all"), value: "" },
    { label: t("applicants-panel.status.options.applied"), value: "applied" },
    {
      label: t("applicants-panel.status.options.shortlisted"),
      value: "shortlisted",
    },
    { label: t("applicants-panel.status.options.accepted"), value: "accepted" },
    { label: t("applicants-panel.status.options.rejected"), value: "rejected" },
    {
      label: t("applicants-panel.status.options.withdrawn"),
      value: "withdrawn",
    },
  ];

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
  const jobExpired = isJobExpired(jobDetails);

  const jobId = jobDetails?.id;
  useEffect(() => {
    if (user && job) {
      if (user.role !== "client" || jobDetails?.client_id !== user.id) {
        push(`/jobs/${slug}`); // redirect to public job page
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

  if (isLoading || isLoadingApplicants) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* header skeleton */}
          <div className="h-12 bg-gray-200 rounded-xl" />
          {/* filters */}
          <div className="h-20 bg-gray-200 rounded-xl" />
          {/* applicant cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

 const handleOpenChat = (applicant: any) => {
  const key = `${applicant.job_id}-${applicant.helper_id}`;

  // STEP 1: check existing chat
  const existing = openChats.find((c) => c.key === key);
  if (existing) {
    focusChat(key);
    return;
  }

  // STEP 2: compute values
  const offset = openChats.length * 30;
  const nextZ = topZIndex + 1;

  // STEP 3: update both states safely
  setTopZIndex(nextZ);
  setOpenChats((prev) => [
    ...prev,
    {
      key,
      jobId: applicant.job_id,
      receiverId: applicant.helper_id,
      title: `${applicant.user.first_name} ${applicant.user.last_name}`,
      subtitle: applicant.user.email,
      minimized: false,
      zIndex: nextZ,
      initialPosition: {
        x: offset,
        y: -offset,
      },
    },
  ]);
};





  const focusChat = (key: string) => {
  setTopZIndex((z) => {
    const nextZ = z + 1;

    setOpenChats((prev) =>
      prev.map((c) =>
        c.key === key
          ? { ...c, zIndex: nextZ, minimized: false }
          : c
      )
    );

    return nextZ;
  });
};



  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t("applicants-panel.title", { title: jobDetails.title })}
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex justify-between items-center flex-wrap gap-4">
          {/* Left group */}
          <div className="flex items-center gap-6">
            <Select
              label={t("applicants-panel.status.label")}
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
              label={t("applicants-panel.proposed-rate.label")}
              value={sort}
              onChange={(v: string) => handleSortChange(v as "asc" | "desc")}
              options={[
                {
                  label: t("applicants-panel.proposed-rate.options.asc"),
                  value: "asc",
                },
                {
                  label: t("applicants-panel.proposed-rate.options.desc"),
                  value: "desc",
                },
              ]}
              width="w-32"
            />
            <Select
              label={t("applicants-panel.per-page.label")}
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
                isJobExpired={jobExpired}
                onOpenChat={handleOpenChat}
              />
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-base text-gray-600 shadow-md">
                <p className="text-gray-500 text-sm italic py-2">
                  {t("applicants-panel.no-applicants")}
                </p>
              </div>
            </div>
          )}
        </div>

        <nav
          className="flex items-center justify-between gap-2 mt-6"
          aria-label="Pagination"
        >
          <button
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-50"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            {t("applicants-panel.pagination.prev")}
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
            {t("applicants-panel.pagination.next")}
          </button>
        </nav>

        {isModalOpen && (
          <UpdateStatusModal
            isOpen={isModalOpen}
            onClose={closeModal}
            applicant={selectedApplicant}
          />
        )}

        {isUserModalOpen && (
          <ApplicantDetailModal
            isOpen={isUserModalOpen}
            onClose={closeUserModal}
            userId={selectedUserId}
          />
        )}
      </main>
      <div className="fixed bottom-4 right-4 z-50 flex gap-3">
        {openChats.map((chat) => (
          <Message
            key={chat.key}
            mode="dock"
            jobId={chat.jobId}
            receiverId={chat.receiverId}
            title={chat.title}
            subtitle={chat.subtitle}
            expired={jobExpired}
            expiredLabel={t("chat.job_expired")}
            minimized={chat.minimized}
            zIndex={chat.zIndex}
            initialPosition={chat.initialPosition}
            onFocus={() => focusChat(chat.key)}
            onMinimize={() =>
              setOpenChats((prev) =>
                prev.map((c) =>
                  c.key === chat.key ? { ...c, minimized: !c.minimized } : c,
                ),
              )
            }
            onClose={() =>
              setOpenChats((prev) => prev.filter((c) => c.key !== chat.key))
            }
          />
        ))}
      </div>
    </div>
  );
}
