"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, GraduationCap, X } from "lucide-react";
import toast from "react-hot-toast";
import { useApplyJob, useCheckApplied, useWithdrawApplication } from "@/lib/react-query/queries/apply-job";
import { useRouter } from "next/navigation";
import ApplicationCard from "./application-card";
import { useT } from "@/app/[locale]/layout";

interface ApplyPanelProps {
  user: any;
  jobDetails: any;
}

export default function ApplyPanel({ user, jobDetails }: ApplyPanelProps) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [proposedRate, setProposedRate] = useState("");

  const t = useT("application");

  // Hooks inside the component
  const { data: application, isLoading: isChecking } = useCheckApplied(jobDetails.id);
  const applyJobMutation = useApplyJob();
  const withdrawMutation = useWithdrawApplication();

  // Pre-fill if already applied
  useEffect(() => {
    if (application?.success) {
      setCoverNote(application.data.application.cover_note || "");
      setProposedRate(application.data.application.proposed_rate || "");
    }
  }, [application]);

  const handleApplySubmit = () => {
    applyJobMutation.mutate(
      { jobId: jobDetails.id, cover_note: coverNote, proposed_rate: proposedRate },
      {
        onSuccess: () => {
          toast.success(t("apply-panel.success"));
        },
        onError: (error: any) => {
          toast.error(error?.message || t("apply-panel.failed"));
        },
      }
    );
  };

  return (
    <aside className="lg:top-6">
      {
        application?.success ? (
          application?.data?.application?.status == "withdrawn" ?
            <ApplicationCard
              title={t("apply-panel.withdrawed.title")}
              description={t("apply-panel.withdrawed.description", { title: jobDetails.title})}
              coverNote={coverNote}
              proposedRate={proposedRate}
              application={application}
              jobDetails={jobDetails}
              buttonLabel={t("apply-panel.withdrawed.button")}
              withdraw
            /> :
            <ApplicationCard
              title={t("apply-panel.applied.title")}
              description={t("apply-panel.applied.description", { title: jobDetails.title})}
              coverNote={coverNote}
              proposedRate={proposedRate}
              application={application}
              jobDetails={jobDetails}
              buttonLabel={t("apply-panel.applied.button")}
              applied
            />
        ) : <ApplicationCard
          title={t("apply-panel.apply.title")}
          description={t("apply-panel.apply.description")}
          application={application}
          jobDetails={jobDetails}
          buttonLabel={user ? t("apply-panel.apply.button.logged", { name: `${user.first_name} ${user.last_name}`}) : t("apply-panel.apply.button.unauthenticate")}
          logged={user ? true : false}
        />
      }

      {/* Mini facts */}
      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        {jobDetails?.police_verified && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {t("apply-panel.mini-facts.police-verified")}
          </div>
        )}
        {jobDetails?.first_aid_verified && (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> {t("apply-panel.mini-facts.first-aid")}
          </div>
        )}
      </div>
    </aside>
  );
}

// Local Textarea component
function Textarea({ label, value, onChange, placeholder = "", disabled = false }: any) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-700">{label}</span>
      <textarea
        className={`w-full rounded-xl border px-3 py-2 outline-none focus:border-black ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </label>
  );
}