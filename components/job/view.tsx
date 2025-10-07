"use client";

import React, { useEffect, useState } from "react";
import {
    Briefcase,
    MapPin,
    Clock,
    Share2,
    Bookmark,
    Building2,
    DollarSign,
    GraduationCap,
    CheckCircle2,
    ExternalLink,
    BookmarkCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    const applyJobMutation = useApplyJob();

    // MOVE THESE HOOKS TO THE TOP: Call unconditionally before early returns
    const { slug } = useParams(); // get /jobs/[slug]
    const { data, isLoading, isError } = useJob(slug as string);

    // Compute jobId early from data (safe: undefined initially)
    const jobId = data?.job?.id ?? undefined;

    // Now call the previously conditional hooks unconditionally
    const { data: application, isLoading: isChecking } = useCheckApplied(jobId);
    const withdrawMutation = useWithdrawApplication();
    const updateStatusMutation = useUpdateApplicantStatus();

    const { data: applicants, isLoading: isApplicantsLoading } = useJobApplicants(
        jobId,
        user?.role === "client"   // only enable if client
    );


    // Early useEffect (unchanged)
    useEffect(() => {
        getSavedJobs().then((data) => {
            setSavedJobs(data.jobs)
        }).catch((err) => console.log(err))
    }, [])
    useEffect(() => {
        if (application?.success && application?.data?.application && application?.data?.application?.status !== "withdrawn") {
            // Fill local state with existing application data
            setCoverNote(application?.data?.application?.cover_note || '');
            setProposedRate(application?.data?.application?.proposed_rate || null);
            setSubmitted(true); // optional: mark as already applied
        }
    }, [application, submitted]);
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
    const handleApplySubmit = () => {
        if (user && jobDetails) {
            applyJobMutation.mutate(
                {
                    jobId: jobDetails.id,
                    cover_note: coverNote,
                    proposed_rate: proposedRate,
                },
                {
                    onSuccess: () => {
                        toast.success("Application submitted successfully!");
                        setCoverNote("");
                        setProposedRate("");
                        setSubmitted(true);
                    },
                    onError: (error: any) => {
                        toast.error(error?.message || "Failed to submit application. Please try again.");
                    },
                }
            );
        }
    };

    const handleSaveJob = async (jobId: string) => {
        try {
            setSavedJobs((prev) => [...prev, { id: jobId } as JobList]);
            await addJobAsFavorite({ jobId });
        } catch (error) {
            console.error("Failed to save job:", error);
            setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
        }
    };

    const handleUnSaveJob = async (jobId: string) => {
        try {
            setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
            await unsaveJobAsFavorite(jobId);
        } catch (error) {
            console.error("Failed to save job:", error);
            setSavedJobs((prev) => [...prev, { id: jobId } as JobList]);
        }
    };

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
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 data-testid="job-title" className="text-2xl font-semibold tracking-tight">{jobDetails?.title}</h1>
                                    {jobDetails?.subtitle && (
                                        <h2 className="text-sm text-muted-foreground mt-1">
                                            {jobDetails.subtitle}
                                        </h2>
                                    )}
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        {jobDetails?.company && (<span className="inline-flex items-center gap-1"><Building2 className="h-4 w-4" />{jobDetails?.company}</span>)}
                                        {(jobDetails?.street || jobDetails?.city || jobDetails?.state || jobDetails?.postal_code || jobDetails?.country) && (
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {[
                                                    jobDetails?.street,
                                                    jobDetails?.city,
                                                    jobDetails?.state,
                                                    jobDetails?.postal_code,
                                                    jobDetails?.country
                                                ].filter(Boolean).join(", ")}
                                            </span>
                                        )}

                                        {jobDetails?.job_type && (<span className="inline-flex items-center gap-1"><Briefcase className="h-4 w-4" /> {jobDetails?.job_type.join(", ")} {jobDetails?.job_experience ? `. ${jobDetails?.job_experience}` : ""}</span>)}
                                        <span className="inline-flex items-center gap-1"><DollarSign className="h-4 w-4" />
                                            {jobDetails?.price_min && jobDetails?.price_max
                                                ? `${jobDetails?.currency} ${jobDetails?.price_min}–${jobDetails?.price_max}`
                                                : jobDetails?.price_min
                                                    ? `${jobDetails?.currency} ${jobDetails?.price_min}`
                                                    : jobDetails?.price_max
                                                        ? `${jobDetails?.currency} ${jobDetails?.price_max}`
                                                        : "Not specified"}
                                        </span>
                                        {jobDetails?.price_type && <span className="inline-flex items-center gap-1">/ {jobDetails?.price_type}</span>}
                                        <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />Posted {dayjs(jobDetails?.created_at).fromNow()}</span>

                                        {jobDetails?.category?.name && (
                                            <span className="inline-flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" /> {jobDetails.category.name}
                                            </span>
                                        )}

                                        {jobDetails?.starts_at && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Start: {dayjs(jobDetails.starts_at).format("MMM D, YYYY")}
                                            </span>
                                        )}

                                        {jobDetails?.ends_at && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> End: {dayjs(jobDetails.ends_at).format("MMM D, YYYY")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" className="rounded-xl"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                                    {savedJobs.some((j) => j.id === jobDetails.id) ? (
                                        <Button variant="outline" className="rounded-xl" onClick={() => handleUnSaveJob(jobDetails.id)}><BookmarkCheck className="mr-2 h-4 w-4" /> Saved</Button>
                                    ) : (
                                        <Button variant="outline" className="rounded-xl" onClick={() => handleSaveJob(jobDetails.id)}><Bookmark className="mr-2 h-4 w-4" /> Save</Button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {jobDetails.tags.length > 0 && jobDetails.tags.map((t) => (
                                    <>
                                        <Badge key={t} variant="secondary" className="rounded-full px-3 py-1">
                                            {t?.name}
                                        </Badge>
                                    </>
                                ))}
                            </div>
                        </CardHeader>

                        <Separator />

                        <CardContent className="prose prose-sm max-w-none py-6">
                            <h3 className="">About the role</h3>
                            <div dangerouslySetInnerHTML={{ __html: jobDetails?.description || "" }} />
                        </CardContent>
                    </Card>

                    {/* Family card */}
                    <div className="mt-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">About {jobDetails?.company}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <a href="#" className="inline-flex items-center gap-2 text-sm font-medium hover:underline">
                                    View similar babysitting jobs <ExternalLink className="h-4 w-4" />
                                </a>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right: sticky apply panel */}
                {user?.id !== jobDetails?.client_id && (
                    <aside className="lg:sticky lg:top-6">
                        <Card className="shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base">Ready to apply?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {user ? (
                                    // If user is logged in
                                    <div className="space-y-4 mt-4 rounded-xl p-4 shadow-xs bg-white">
                                        <h3 className="text-base font-semibold">
                                            {application?.applied ? `Your application for ${jobDetails.title}` : `Apply to ${jobDetails.title}`}
                                        </h3>

                                        {isChecking ? (
                                            <p>Checking application status...</p>
                                        ) : application?.success && application?.data?.application?.status !== "withdrawn" ? (
                                            <>
                                                <div className="grid gap-2">
                                                    <Textarea label="Cover Note" onChange={application?.success ? () => { } : setCoverNote} value={coverNote} disabled={application?.success} placeholder="" />
                                                    <Input
                                                        label={`Proposed Rate (${jobDetails?.currency})`}
                                                        value={proposedRate}
                                                        onChange={application?.success ? () => { } : setProposedRate}
                                                        type="number"
                                                        disabled={application?.success}
                                                    />
                                                </div>
                                                <AlertBox
                                                    trigger={
                                                        <Button variant="destructive" className="w-full rounded-xl mt-2">
                                                            Withdraw Application
                                                        </Button>
                                                    }
                                                    title="Withdraw Application?"
                                                    description={`Are you sure you want to withdraw your application for "${jobDetails?.title}"? This action cannot be undone.`}
                                                    confirmText="Yes, Withdraw"
                                                    cancelText="Cancel"
                                                    onConfirm={() =>
                                                        withdrawMutation.mutate(application.data.application.id, {
                                                            onSuccess: () => toast.success("Application withdrawn successfully!"),
                                                            onError: (err) => toast.error(err?.message || "Failed to withdraw."),
                                                        })
                                                    }
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-600">
                                                    Please share your note and proposed rate.
                                                </p>
                                                <div className="grid gap-1">
                                                    {/* Cover Note */}
                                                    <Textarea
                                                        label="Cover Note"
                                                        value={coverNote}
                                                        onChange={setCoverNote}
                                                        placeholder="A short note…"
                                                    />

                                                    {/* Proposed Rate */}
                                                    <div className="grid gap-1">
                                                        <Input
                                                            label={`Proposed Rate  (${jobDetails?.currency})`}
                                                            value={proposedRate}
                                                            onChange={setProposedRate}
                                                            type="number"
                                                            placeholder="e.g., 18"
                                                            min={0}
                                                        />
                                                    </div>
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
                                    // If no user, show signup prompt
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground">
                                            Please{' '}
                                            <span
                                                className="text-blue-500 cursor-pointer"
                                                onClick={() => router.push('/signup')}
                                            >
                                                sign up or log in
                                            </span>{' '}
                                            to apply for this job.
                                        </p>
                                        <Button
                                            onClick={() => router.push('/signup')}
                                            className="w-full rounded-2xl"
                                        >
                                            Apply with Kiezly Profile
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
                )}

                {user?.role === "client" && (
                    <aside className="lg:sticky lg:top-6">
                        <Card className="shadow-sm border rounded-xl">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Applicants</CardTitle>
                            </CardHeader>

                            <CardContent>
                                {isApplicantsLoading ? (
                                    <p className="text-gray-500 text-sm">Loading applicants...</p>
                                ) : applicants && applicants.length > 0 ? (
                                    <ul className="space-y-4">
                                        {applicants.map((applicant) => (
                                            <li
                                                key={applicant.id}
                                                className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
                                            >
                                                {/* Top section: Name and Status */}
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {applicant.user.first_name} {applicant.user.last_name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {applicant.user.email}
                                                        </div>
                                                    </div>

                                                    {/* Status Dropdown */}
                                                    {/* <select
                                                        value={applicant.status}
                                                        onChange={(e) =>
                                                            handleStatusChange(applicant.id, e.target.value)
                                                        }
                                                        className="border rounded-lg text-sm px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="applied">Applied</option>
                                                        <option value="shortlisted">Shortlisted</option>
                                                        <option value="hired">Hired</option>
                                                        <option value="rejected">Rejected</option>
                                                        <option value="withdrawn">Withdrawn</option>
                                                    </select> */}

                                                    <Select
                                                        label=""
                                                        value={statusOptions.find((o) => o.name === applicant.status) || null}
                                                        onChange={(selected) =>
                                                            handleStatusChange(applicant.id, selected?.name || "")
                                                        }
                                                        options={statusOptions}
                                                        placeholder="Change status"
                                                        searchable={false}
                                                    />
                                                </div>

                                                {/* Body section */}
                                                <div className="mt-3 text-sm text-gray-700 space-y-1">
                                                    <div>
                                                        <span className="font-medium">Proposed Rate:</span> {applicant.proposed_rate} €
                                                    </div>

                                                    {applicant.cover_note && (
                                                        <div className="bg-gray-50 rounded-lg p-2 text-gray-700">
                                                            <span className="font-medium">Cover Note:</span>
                                                            <p>{applicant.cover_note}</p>
                                                        </div>
                                                    )}

                                                    <div className="text-xs text-gray-500">
                                                        Applied on {new Date(applicant.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No applicants yet.</p>
                                )}
                            </CardContent>
                        </Card>
                    </aside>
                )}

            </section>
        </main>
    );
}

// Your local Textarea component (unchanged)
function Textarea({
    label,
    value,
    onChange,
    placeholder,
    disabled = false,
    id,
    name,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
}) {
    return (
        <label className="block text-sm" htmlFor={id}>
            <span className="mb-1 block text-gray-700">{label}</span>
            <textarea
                id={id}
                name={name}
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
