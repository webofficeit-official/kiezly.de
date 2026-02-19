"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Placeholder for your Button component
import {
  useJobApplicants,
  useUpdateApplicantStatus,
} from "@/lib/react-query/queries/apply-job";
import UpdateStatusModal from "@/components/ui/UpdateStatusModal";
import { useRouter } from "next/navigation";
import { ExternalLink, MessageCircle } from "lucide-react";
import { Job } from "@/lib/types/job";
import { useT } from "@/app/[locale]/layout";
import Message from "@/components/Chat/message";
import { isJobExpired } from "@/lib/utils/isJobExpired";
import ApplicantCard from "./applicant-card/applicant-card";
import ApplicantDetailModal from "@/components/ui/ApplicantDetailModal";

interface ApplicantsPanelProps {
  job: Job;
  user: any;
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
const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case "accepted":
      return "bg-gray-800 text-white border border-gray-900"; // Darkest for success
    case "shortlisted":
      return "bg-gray-300 text-gray-800 border border-gray-400"; // Medium for in-progress
    case "rejected":
      return "bg-red-300 text-grey-700 border border-red-400"; // Border for negative
    case "withdrawn":
      return "bg-gray-50 text-gray-500 border border-gray-100"; // Lightest for inactive
    case "applied":
    default:
      return "bg-gray-100 text-gray-600 border border-gray-200"; // Default
  }
};

export default function ApplicantsPanel({ job, user }: ApplicantsPanelProps) {
  if (!job) return null;
  const jobExpired = isJobExpired(job);
  const { data, isLoading } = useJobApplicants({
    jobId: job.id.toString(),
    page: 1,
    pageSize: 3,
    status: "",
    sort: "asc",
    enabled: user?.role === "client", // <-- include here if your hook supports it
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  // const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [topZIndex, setTopZIndex] = useState(100);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const t = useT("application");
  const tE = useT("inbox");

  const openUpdateModal = (applicant: any) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplicant(null);
  };

  const statusOptions = [
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

  const router = useRouter();

  if (user?.role !== "client") return null;
  const handleApplicantMessage = (app: any) => {
    const key = `${app.job_id}-${app.helper_id}`;

    const existing = openChats.find((c) => c.key === key);
    if (existing) {
      focusChat(key);
      return;
    }

    const offset = openChats.length * 30;
    const nextZ = topZIndex + 1;

    setTopZIndex(nextZ);

    setOpenChats((prev) => [
      ...prev,
      {
        key,
        jobId: app.job_id,
        receiverId: app.helper_id,
        title: `${app.user.first_name} ${app.user.last_name}`,
        subtitle: app.user.email,
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
          c.key === key ? { ...c, zIndex: nextZ, minimized: false } : c,
        ),
      );

      return nextZ;
    });
  };

   const openUserModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUserId(null);
  };

  return (
    <>
    <aside className="lg:sticky lg:top-6">
      <Card className="shadow-lg border-gray-100 bg-white">
        <CardHeader className="border-b border-gray-100 p-4 sm:p-5">
          <CardTitle className="text-xl font-bold text-gray-900">
            {t("applicants.title")} ({(data && data?.total_items) || 0})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:p-5">
          {/* Job Cards Grid */}
          {/* Increased gap and ensured equal size on different screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Map over your actual similarJobs array here */}
            {data &&
              data?.applicants?.map((applicant) => (
                <ApplicantCard
                  key={applicant.id}
                  applicant={applicant}
                  openUserModal={openUserModal}
                  openUpdateModal={openUpdateModal}
                  isJobExpired={jobExpired}
                  onOpenChat={handleApplicantMessage}
                />
              ))}
          </div>

          {/* View All Link */}
          <div className="pt-2">
            <a
              href={`/jobs/${job.slug}/applicants`}
              className="inline-flex items-center gap-2 text-base font-semibold text-gray-800 hover:text-black hover:underline"
            >
              {t("applicants.view-all")}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
     
      <div className="fixed bottom-4 right-4 z-50">
        {openChats.map((chat) => (
          <Message
            key={chat.key}
            mode="dock"
            jobId={chat.jobId}
            receiverId={chat.receiverId}
            title={chat.title}
            subtitle={chat.subtitle}
            minimized={chat.minimized}
            expired={jobExpired}
            expiredLabel={tE("chat.job_expired")}
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
    
    </aside>
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
    </>
  );
}
