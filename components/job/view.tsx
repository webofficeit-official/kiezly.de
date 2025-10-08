"use client";

import React, { useEffect, useState } from "react";
import {   
    GraduationCap,
    CheckCircle2,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useParams, useRouter } from "next/navigation";
import { useJob } from "@/lib/react-query/queries/useJob";
import { Loader } from "../ui/loader";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { JobList } from "@/lib/types/job";
import { addJobAsFavorite, getSavedJobs, unsaveJobAsFavorite } from "@/lib/react-query/api-handler/job-save-api";
import { useAuth } from "@/lib/context/auth-context";
import { useApplyJob, useCheckApplied, useJobApplicants, useUpdateApplicantStatus, useWithdrawApplication } from "@/lib/react-query/queries/apply-job";
import Input from "../shared-ui/input/input";
import toast from "react-hot-toast";
import AlertBox from "../shared-ui/delete-alert-box/delet-alert-box";
import { Select } from "../shared-ui/custom-select/custom-select";
import JobHeader from "./job-details/job-header";
import JobDescription from "./job-details/job-decription";
import CompanyInfoCard from "./job-details/company-info";
import ApplyPanel from "./job-details/apply-panel";
import ApplicantsPanel from "./job-details/applicant-panel";
import SimilarJobCard from "./job-details/similar-jobs";

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
    const [open, setOpen] = React.useState(false);

    const [savedJobs, setSavedJobs] = React.useState([]);
    const [coverNote, setCoverNote] = useState('');
    const [proposedRate, setProposedRate] = useState('');
    const { user } = useAuth(); // Get user from useUser  hook
    const router = useRouter();
   

    // MOVE THESE HOOKS TO THE TOP: Call unconditionally before early returns
    const { slug } = useParams(); // get /jobs/[slug]
    const { data, isLoading, isError } = useJob(slug as string);

    // Compute jobId early from data (safe: undefined initially)
    const jobId = data?.job?.id ?? undefined;

   
    const updateStatusMutation = useUpdateApplicantStatus();

    const { data: applicants, isLoading: isApplicantsLoading } = useJobApplicants(
        jobId,
        user?.role === "client"   // only enable if client
    );

    useEffect(() => {
        if(user) {
            getSavedJobs().then((data) => {
                setSavedJobs(data.jobs)
            }).catch((err) => console.log(err))
        } else {
            const localStoredJobs = localStorage.getItem("saved-jobs")
            if(localStoredJobs) {
                setSavedJobs(JSON.parse(localStoredJobs))
            }
        }
    }, [user])
  
    // EARLY RETURNS: Now safe, since all hooks are called above
    if (isLoading) return <Loader />;
    if (isError) return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-red-600 text-lg">Failed to load job.</p>
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
                    toast.success("Application status updated successfully!");
                },
                onError: (error: any) => {
                    toast.error(error?.message || "Failed to update application status.");
                },
            }
        );
    };

    // Your JSX return remains exactly the same (no changes needed here)
    return (
        <main className="flex-1 min-h-screen mx-auto max-w-6xl px-4 py-8">
            {/* Success banner after submit */}
            {submitted && (
                <div className="mb-6 rounded-2xl border bg-green-50 p-4 text-sm text-green-900">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Your application has been submitted.</span>
                    </div>
                </div>
            )}

            {/* Top section */}
            <section className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
                {/* Left: main content */}
                <div>
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4">
                           <JobHeader job={jobDetails} savedJobs={savedJobs} setSavedJobs={setSavedJobs} user={user} />
                        </CardHeader>

                        <Separator />

                        <CardContent className="prose prose-sm max-w-none py-6">
                           <JobDescription job={jobDetails} />
                        </CardContent>
                    </Card>

                    {/* Family card */}
                    <div className="mt-6">
                       <CompanyInfoCard job={jobDetails} />
                    </div>
                </div>

                {/* Right: sticky apply panel */}
                {user?.role!='client' &&user?.id !== jobDetails?.client_id && (
                  <ApplyPanel user={user} jobDetails={jobDetails} />

                )}

                {user?.role === "client" &&user.id===jobDetails?.client_id  && (
                   <ApplicantsPanel jobId={jobDetails?.id} user={user} />
                )}

            </section>
            
            <div className="mt-6">
               <SimilarJobCard job={jobDetails} />
            </div>
        </main>
    );
}

