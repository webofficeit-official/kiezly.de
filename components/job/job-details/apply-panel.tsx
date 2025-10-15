"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, GraduationCap, X } from "lucide-react";
import toast from "react-hot-toast";
import AlertBox from "@/components/shared-ui/delete-alert-box/delet-alert-box";
import Input from "@/components/shared-ui/input/input";
import { useApplyJob, useCheckApplied, useWithdrawApplication } from "@/lib/react-query/queries/apply-job";
import { useRouter } from "next/navigation";
import ApplicationModel from "./application-model";
import ApplicantCard from "./applicant-card/applicant-card";
import ApplicationCard from "./application-card";

interface ApplyPanelProps {
  user: any;
  jobDetails: any;
}

export default function ApplyPanel({ user, jobDetails }: ApplyPanelProps) {
  const router = useRouter();
  const [coverNote, setCoverNote] = useState("");
  const [proposedRate, setProposedRate] = useState("");

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
          toast.success("Application submitted successfully!");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Failed to submit application.");
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
              title="Application withdrawed"
              description={`Withdrawed application for ${jobDetails.title}`}
              coverNote={coverNote}
              proposedRate={proposedRate}
              application={application}
              jobDetails={jobDetails}
              buttonLabel={`Update Application`}
              withdraw
            /> :
            <ApplicationCard
              title="Already applied"
              description={`Your application for ${jobDetails.title}`}
              coverNote={coverNote}
              proposedRate={proposedRate}
              application={application}
              jobDetails={jobDetails}
              buttonLabel={`Update Application`}
              applied
            />
        ) : <ApplicationCard
          title="Ready to apply?"
          description="By applying, you agree to our Terms and acknowledge our Privacy Policy."
          application={application}
          jobDetails={jobDetails}
          buttonLabel={`Apply as ${user.first_name} ${user.last_name}`}
        />
      }
      
      {/* Mini facts */}
      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        {jobDetails?.police_verified && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Police Verified
          </div>
        )}
        {jobDetails?.first_aid_verified && (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" /> First-aid certified preferred
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