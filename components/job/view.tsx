"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, MessageCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

import { useT } from "@/app/[locale]/layout";
import { useAuth } from "@/lib/context/auth-context";
import { getSavedJobs } from "@/lib/react-query/api-handler/job-save-api";
import { useCheckApplied, useUpdateApplicantStatus } from "@/lib/react-query/queries/apply-job";
import { useJob } from "@/lib/react-query/queries/useJob";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader } from "../ui/loader";
import ApplicantListCard from "./job-details/applicants-list";
import ApplyPanel from "./job-details/apply-panel";
import CompanyInfoCard from "./job-details/company-info";
import JobCountCard from "./job-details/job-counts";
import JobDescription from "./job-details/job-decription";
import JobHeader from "./job-details/job-header";
import SimilarJobCard from "./job-details/similar-jobs";
import Message from "../Chat/message";
import { useCountMessage } from "@/lib/react-query/queries/message";

const statusOptions = [
  { id: 1, name: "applied" },
  { id: 2, name: "shortlisted" },
  { id: 3, name: "hired" },
  { id: 4, name: "rejected" },
  { id: 5, name: "withdrawn" },
];

// Extend dayjs with the plugin
dayjs.extend(relativeTime);

export default function JobDetail() {
  const [submitted, setSubmitted] = React.useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const [savedJobs, setSavedJobs] = React.useState([]);
  const { user } = useAuth(); // Get user from useUser  hook

  const { slug } = useParams();
  const { data, isLoading, isError } = useJob(slug as string);
  const jobId = data?.job?.id ?? undefined;
  const clientId = data?.job?.client_id ?? undefined;

  const { data: count, isLoading: isCountChecking } = useCountMessage(
    jobId,
    clientId,
    { enabled: !!jobId && !!clientId }
  );

  const updateStatusMutation = useUpdateApplicantStatus();

  useEffect(() => {
    if (user) {
      getSavedJobs()
        .then((data) => {
          setSavedJobs(data.jobs);
        })
        .catch((err) => console.log(err));
    } else {
      const localStoredJobs = localStorage.getItem("saved-jobs");
      if (localStoredJobs) {
        setSavedJobs(JSON.parse(localStoredJobs));
      }
    }
  }, [user]);

  const t = useT("jobs");
  const tc = useT("messages");

  // EARLY RETURNS: Now safe, since all hooks are called above
  if (isLoading) return <Loader />;
  if (isError)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">{t("detail.failed")}</p>
      </div>
    );

  const jobDetails = data?.job;
  if (!jobDetails) return <Loader />;

  // Rest of your component logic (handleApplySubmit, handleSaveJob, etc.) remains unchanged

  const handleStatusChange = (applicationId: string, status: string) => {
    updateStatusMutation.mutate(
      { applicationId, status },
      {
        onSuccess: () => {
          toast.success(t("detail.application.success"));
        },
        onError: (error: any) => {
          toast.error(error?.message || t("detail.application.failed"));
        },
      }
    );
  };

  // Your JSX return remains exactly the same (no changes needed here)
  const canOpenChat =
    !!user &&
    // helper talking to job owner
    ((user.role === "helper" && jobDetails.client_id !== user.id) ||
      // client talking to helper
      user.role === "client");

  return (
    <main className="flex-1 min-h-screen mx-auto max-w-6xl px-4 py-8">
      {/* Success banner after submit */}
      {submitted && (
        <div className="mb-6 rounded-2xl border bg-green-50 p-4 text-sm text-green-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>{t("detail.application.submitted")}</span>
          </div>
        </div>
      )}

      {/* Top section */}
      <section className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: main content */}
        <div>
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <JobHeader
                key={jobDetails.id}
                job={jobDetails}
                savedJobs={savedJobs}
                setSavedJobs={setSavedJobs}
                user={user}
              />
            </CardHeader>

            <Separator />

            <CardContent className="prose prose-sm max-w-none py-6">
              <JobDescription key={jobDetails.id} job={jobDetails} />
            </CardContent>
          </Card>
        </div>
        <div>
          {/* Right: sticky apply panel */}
          {user?.role != "client" && user?.id !== jobDetails?.client_id && (
            <ApplyPanel user={user} jobDetails={jobDetails} />
          )}
          {user?.role === "client" && user.id === jobDetails?.client_id ? (
            <JobCountCard job={jobDetails} />
          ) : (
            <CompanyInfoCard job={jobDetails} role="client" />
          )}
        </div>
      </section>

      <div className="mt-6">
        {user?.role === "helper" && <SimilarJobCard job={jobDetails} />}
        {user?.role === "client" && user.id === jobDetails?.client_id && (
          <ApplicantListCard job={jobDetails} user={user} />
        )}
      </div>

      {
        count && count.data.count !== 0 && (
          <>
            <button
              onClick={() => setIsMessageOpen(true)}
              className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-white shadow-xl hover:bg-primary/90"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="hidden sm:inline">{tc("chat.chat")}</span>
            </button>

            <Message
              isOpen={isMessageOpen}
              onClose={() => setIsMessageOpen(false)}
              title={jobDetails.title}
              subtitle={jobDetails.client.org_name ?? [
                jobDetails?.street,
                jobDetails?.city,
                jobDetails?.state,
                jobDetails?.postal_code,
                jobDetails?.country,
              ]
                .filter(Boolean)
                .join(", ")}
              jobId={jobDetails.id}
              receiverId={jobDetails.client_id}
            />
          </>
        )
      }
    </main>
  );
}
