"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";
import AlertBox from "@/components/shared-ui/delete-alert-box/delet-alert-box";
import Input from "@/components/shared-ui/input/input";
import { useApplyJob, useCheckApplied, useWithdrawApplication } from "@/lib/react-query/queries/apply-job";
import { useRouter } from "next/navigation";

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
    <aside className="lg:sticky lg:top-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{application?.success ? (
            application?.data?.application?.status == "withdrawn" ?
              "Application withdrawed" :
              "Already applied"
          ) : "Ready to apply?"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {user ? (
            <div className="space-y-4 rounded-xl p-1 shadow-xs bg-white">
              <h3 className="text-base font-semibold">
                {application?.success ? (
                  application?.data?.application?.status == "withdrawn" ?
                    `Withdrawed application for ${jobDetails.title}` :
                    `Your application for ${jobDetails.title}`
                ) : `Apply to ${jobDetails.title}`}
              </h3>

              {application?.success ? (
                <>
                  <div className="grid gap-2">
                    <Textarea label="Cover Note" value={coverNote} onChange={setCoverNote} disabled />
                    <Input
                      label={`Proposed Rate (${jobDetails?.currency})`}
                      value={proposedRate}
                      onChange={() => { }}
                      type="number"
                      disabled
                    />
                  </div>
                  {
                    application?.data?.application?.status !== "withdrawn" ? (
                      <AlertBox
                        trigger={<Button variant="destructive" className="w-full rounded-xl mt-2">Withdraw Application</Button>}
                        title="Withdraw Application?"
                        description={`Are you sure you want to withdraw your application for "${jobDetails?.title}"?`}
                        confirmText="Yes, Withdraw"
                        cancelText="Cancel"
                        onConfirm={() =>
                          withdrawMutation.mutate(application.data.application.id, {
                            onSuccess: () => toast.success("Application withdrawn successfully!"),
                            onError: (err: any) => toast.error(err?.message || "Failed to withdraw."),
                          })
                        }
                      />
                    ) : (
                      ""
                    )
                  }
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">{!application?.success && "Please share your note and proposed rate."}</p>
                  <div className="grid gap-1">
                    <Textarea label="Cover Note" value={coverNote} onChange={setCoverNote} placeholder="A short note…" />
                    <Input
                      label={`Proposed Rate (${jobDetails?.currency})`}
                      value={proposedRate}
                      onChange={setProposedRate}
                      type="number"
                      placeholder="e.g., 18"
                      min={0}
                    />
                    <div className="flex pt-2">
                      <AlertBox
                        trigger={<Button className="rounded-xl w-full">Apply</Button>}
                        title="Apply for this Job?"
                        description={`You are about to apply for "${jobDetails?.title}". Do you want to proceed?`}
                        confirmText="Yes, Apply"
                        cancelText="Cancel"
                        onConfirm={handleApplySubmit}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Please{' '}
                <span className="text-blue-500 cursor-pointer" onClick={() => router.push('/signup')}>
                  sign up or log in
                </span>{' '}
                to apply for this job.
              </p>
              <Button onClick={() => router.push('/signup')} className="w-full rounded-2xl">
                Apply with Profile
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            By applying, you agree to our Terms and acknowledge our Privacy Policy.
          </p>
        </CardContent>
      </Card>

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
