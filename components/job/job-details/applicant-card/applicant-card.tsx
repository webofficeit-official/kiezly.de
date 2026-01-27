"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button-variant";
import { useT } from "@/app/[locale]/layout";
import { MessageCircle } from "lucide-react";
import Message from "@/components/Chat/message";

export interface Applicant {
  id: string;
  proposed_rate?: number;
  cover_note?: string;
  created_at: string;
  status: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  job_id: string;
  helper_id: string;
}

interface ApplicantCardProps {
  applicant: Applicant;
  openUserModal: (userId: string) => void;
  openUpdateModal: (applicant: Applicant) => void;
  isJobExpired: boolean;
}

export default function ApplicantCard({
  applicant,
  openUserModal,
  openUpdateModal,
  isJobExpired
}: ApplicantCardProps) {
  const getStatusClasses = (status: string) => {
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
  };
  const t = useT("application");
  const tE = useT("inbox");

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

  const [isMessageOpen, setIsMessageOpen] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm hover:shadow-md transition-all duration-150 flex flex-col">
      {/* Top Section */}
      <div className="flex items-start justify-between">
        <div
          onClick={() => openUserModal(applicant.user.id)}
          className="cursor-pointer"
        >
          <div className="font-semibold text-lg text-gray-900 line-clamp-1">
            {applicant.user.first_name} {applicant.user.last_name}
          </div>
          <div className="text-xs text-gray-500">{applicant.user.email}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[10px] font-black px-2 py-0.5 rounded border border-black uppercase tracking-tighter bg-white text-black">
            {statusOptions.find((s) => s.value == applicant.status)?.label}
          </span>
          <button
            onClick={() => setIsMessageOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-black/80 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wide">
              Chat
            </span>
          </button>
        </div>
      </div>

      <hr className="my-3 border-gray-100" />

      {/* Body Section */}
      <div
        className="text-sm text-gray-700 space-y-3 flex-1 cursor-pointer"
        onClick={() => openUserModal(applicant.user.id)}
      >
        {applicant.proposed_rate && (
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-800">
              {t("applicants.proposed-rate")}{" "}
              <span className="font-bold text-gray-900">
                {applicant.proposed_rate} €
              </span>
            </div>
          </div>
        )}

        {applicant.cover_note && (
          <div className="rounded-lg text-gray-700">
            <span className="font-semibold text-gray-800 block mb-1">
              {t("applicants.cover-note")}
            </span>
            <div
              className="text-sm line-clamp-3"
              dangerouslySetInnerHTML={{ __html: applicant.cover_note || "" }}
            />
          </div>
        )}
      </div>

      {/* Footer / Action Row */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
        <div className="text-xs text-gray-500">
          {t("applicants.applied")}:{" "}
          {new Date(applicant.created_at).toLocaleDateString()}
        </div>
        <div>
          <Button
            variant="outline"
            className="text-sm font-medium text-gray-800 border-gray-300 hover:bg-gray-100 px-4 py-2 h-auto"
            onClick={() => openUpdateModal(applicant)}
          >
            {t("applicants.update")}
          </Button>
        </div>
      </div>

      <Message
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
        title={`${applicant.user.first_name} ${applicant.user.last_name}`}
        subtitle={applicant.user.email}
        jobId={applicant.job_id}
        receiverId={applicant.helper_id}
        expired={isJobExpired}
        expiredLabel={tE("chat.job_expired")}
      />
    </div>
  );
}
