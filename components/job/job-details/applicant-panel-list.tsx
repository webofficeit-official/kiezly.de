"use client";

import { Button } from "@/components/ui/button-variant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import UpdateStatusModal from "@/components/ui/UpdateStatusModal";
import { useAuth } from "@/lib/context/auth-context";
import { useJobApplicants } from "@/lib/react-query/queries/apply-job";
import { useJob } from "@/lib/react-query/queries/useJob";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
interface ApplicantsPageProps {
  params: { slug: string };
}

export default function ApplicantsPanelList({ params }: ApplicantsPageProps) {
  const { slug } = params;
  const { user } = useAuth();
  const router = useRouter();
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

  const { data: applicants, isLoading: isLoaingApplicant } = useJobApplicants(jobId, user?.role === "client");

  if (isLoading) {
    return <Loader />;
  }
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Applicants for {jobDetails.title}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {applicants && applicants.length > 0 ? (
            applicants.map((applicant) => (
              <div
                key={applicant.id}
                className="rounded-xl border border-gray-200 p-4 bg-white shadow-sm hover:shadow-md transition-all duration-150 flex flex-col"
              >
                {/* --- Top Section: Name + Status --- */}
                <div className="flex items-start justify-between">
                  <div
                    onClick={() => router.push(`/`)}
                    className="cursor-pointer"
                  >
                    <div className="font-semibold text-lg text-gray-900 line-clamp-1">
                      {applicant.user.first_name} {applicant.user.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{applicant.user.email}</div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(applicant.status)}`}
                  >
                    {applicant.status}
                  </span>
                </div>

                {/* --- Separator --- */}
                <hr className="my-3 border-gray-100" />

                {/* --- Body Section --- */}
                <div className="text-sm text-gray-700 space-y-3 flex-1">
                  {/* Rate Row */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-800">
                      Rate: <span className="font-bold text-gray-900">{applicant.proposed_rate} €</span>
                    </div>
                  </div>

                  {/* Cover Note Section */}
                  {applicant.cover_note && (
                    <div className="rounded-lg text-gray-700">
                      <span className="font-semibold text-gray-800 block mb-1">Cover Note:</span>
                      <p className="text-sm line-clamp-3">{applicant.cover_note}</p>
                    </div>
                  )}
                </div>

                {/* --- Footer / Action Row --- */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
                  <div className="text-xs text-gray-500">
                    Applied: {new Date(applicant.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-base text-gray-600 shadow-md">
                <p className="text-gray-500 text-sm italic py-2">No applicants have applied yet.</p>
              </div>
            </div>
          )}
        </div>


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