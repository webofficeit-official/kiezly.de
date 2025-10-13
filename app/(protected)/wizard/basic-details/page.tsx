"use client";
import { Card } from "@/components/ui/card";
import { WizardDirection } from "@/components/wizard/WizardDirection";
import { WizardHeader } from "@/components/wizard/WizardHeader";
import { WizardInput } from "@/components/wizard/WizardInput";
import { WizardMultiSelect } from "@/components/wizard/WizardMultiSelect";
import { WizardNavigation } from "@/components/wizard/WizardNavigation";
import { WizardSelect } from "@/components/wizard/WizardSelect";
import { useJobWizard } from "@/lib/context/job-wizard-context";
import {
    useCreateJob,
    useGenerateSlug,
    useJob,
    useJobCollections,
    useUpdateJob,
} from "@/lib/react-query/queries/useJob";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = searchParams.get("slug");

    const { data: basicCollections } = useJobCollections();
    const generateSlugMutation = useGenerateSlug();
    const createJobMutation = useCreateJob();

    const {
        formData,
        updateForm,
        mode,
        setMode,
        jobId,
        setJobId,
        fetchJobBySlug,
    } = useJobWizard();

    const updateJobMutation = useUpdateJob(jobId ?? undefined);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [slugEdited, setSlugEdited] = useState(false);
    const [showErrors, setShowErrors] = useState(false);

    // ---------------- Load job data ----------------
    const { data: existingJob, isLoading } = useJob(slug || "");

    useEffect(() => {
        if (slug && existingJob?.job) {
            setMode("edit");
            setJobId(existingJob.job.id);
            updateForm(normalizeJobForForm(existingJob.job));
        } else if (!slug) {
            setMode("create");
        }
    }, [slug, existingJob]);

    const normalizeJobForForm = (job: any) => ({
        title: job.title || "",
        slug: job.slug || "",
        subtitle: job.subtitle || "",
        category_id: job.category_id ? String(job.category_id) : "",
        tag_ids: job.tags?.map((t: any) => String(t.id)) || [],
        job_type: job.job_type || [],
        job_experience: job.job_experience || [],
        status: job.status || "draft",
    });

    // ---------------- Validation ----------------
    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title || formData.title.trim() === "") {
            newErrors.title = "Title is required";
        } else if (formData.title.length < 8) {
            newErrors.title = "Title must be at least 8 characters long";
        }

        if (!formData.slug || formData.slug.trim() === "") {
            newErrors.slug = "Slug is required";
        }

        if (!formData.category_id || formData.category_id === "") {
            newErrors.category_id = "Job category is required";
        }

        setErrors(newErrors);
        return newErrors;
    };

    // ---------------- Field Change (Live Error Update) ----------------
    const handleFieldChange = (field: string, value: any) => {
        updateForm({ [field]: value });

        setErrors((prev) => {
            const updated = { ...prev };
            delete updated[field];

            if (field === "title") {
                if (!value || value.trim() === "") updated.title = "Title is required";
                else if (value.length < 8)
                    updated.title = "Title must be at least 8 characters long";
            }

            if (field === "slug") {
                if (!value || value.trim() === "") updated.slug = "Slug is required";
            }

            if (field === "category_id") {
                if (!value || value === "")
                    updated.category_id = "Job category is required";
            }

            return updated;
        });
    };

    // ---------------- Title → Slug Auto Generate ----------------
    const handleTitleChange = (value: string) => {
        handleFieldChange("title", value);

        if (!slugEdited && mode === "create") {
            generateSlugMutation.mutate(value, {
                onSuccess: (res) => updateForm({ slug: res.slug }),
            });
        }
    };

    // ---------------- Manual Slug Re-Generate ----------------
    const handleSlugAutoGenerate = () => {
        setSlugEdited(false);
        generateSlugMutation.mutate(formData.title, {
            onSuccess: (res) => updateForm({ slug: res.slug }),
        });
    };

    // ---------------- Handle Next ----------------
    const handleNext = async () => {
        const newErrors = validateStep();
        if (Object.keys(newErrors).length > 0) {
            setShowErrors(true);
            return;
        }

        try {
            const payload = {
                title: formData?.title,
                slug: formData?.slug,
                subtitle: formData?.subtitle,
                category_id: formData?.category_id,
                tag_ids: formData?.tag_ids || [],
                job_type: formData?.job_type || [],
                job_experience: formData?.job_experience || [],
                status: formData.status ? formData.status : "draft",
            };

            // --- CREATE JOB ---
            if (mode === "create" && !jobId) {
                const res = await createJobMutation.mutateAsync(payload);
                if (res?.data?.id) {
                    setJobId(res.data.id);
                    setMode("edit");
                    updateForm({ slug: res.data.slug });
                    //   toast.success("Job created successfully!");
                    router.push(`/wizard/job-details?slug=${res.data.slug}`);
                }
            }
            // --- UPDATE JOB ---
            else if (mode === "edit" && jobId) {
                await updateJobMutation.mutateAsync(payload, {
                    onSuccess: (res: any) => {
                        const updatedSlug = res?.job?.slug || formData.slug;
                         setJobId(res?.job?.id);
                        updateForm({ slug: updatedSlug });
                        // toast.success("Job updated successfully!");
                        router.push(`/wizard/job-details?slug=${updatedSlug}`);
                    },
                });
            }
        } catch (err) {
            console.error("Job creation/update failed:", err);
            toast.error("Something went wrong. Please try again.");
        }
    };

    // ---------------- Dropdown Options ----------------
    const categoryOptions =
        basicCollections?.jobCategories?.map((c) => ({
            label: c.name,
            value: String(c.id),
        })) || [];

    const tagOptions =
        basicCollections?.jobTags?.map((t) => ({
            label: t.name,
            value: String(t.id),
        })) || [];

    const jobTypeOptions =
        basicCollections?.jobType?.map((t) => ({
            label: t,
            value: t,
        })) || [];

    const experienceOptions =
        basicCollections?.jobExperience?.map((e) => ({
            label: e,
            value: e,
        })) || [];

    const isNextLoading =
        createJobMutation.isPending || updateJobMutation.isPending || isLoading;

    // ---------------- UI ----------------
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Header */}
                <section className="lg:col-span-3 space-y-4">
                    <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-6 flex items-center justify-between">
                        <h2 className="text-lg font-semibold">
                            {mode === "edit" ? "Edit Mini-Job" : "Post a Mini-Job"}
                        </h2>
                    </div>
                </section>

                <Card className="lg:col-span-3 space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                        {/* Sidebar */}
                        <div className="col-span-12 sm:col-span-6 lg:col-span-5 bg-gray-100 p-6">
                            <div className="flex flex-wrap justify-center lg:flex-col gap-2 lg:space-y-4">
                                <WizardNavigation
                                    title="Basic Details"
                                    description="Provide the main information"
                                    count={1}
                                    current={true}
                                    finished={false}
                                />
                                <WizardNavigation
                                    title="Job Details"
                                    description="Provide detailed information"
                                    count={2}
                                    current={false}
                                    finished={false}
                                />
                                <WizardNavigation
                                    title="Location Details"
                                    description="Provide location details"
                                    count={3}
                                    current={false}
                                    finished={false}
                                />
                                <WizardNavigation
                                    title="Pricing Details"
                                    description="Set the pricing for this job"
                                    count={4}
                                    current={false}
                                    finished={false}
                                />
                                <WizardNavigation
                                    title="Work Details"
                                    description="Provide work details"
                                    count={5}
                                    current={false}
                                    finished={false}
                                />
                                <WizardNavigation
                                    title="Contact Details"
                                    description="Provide how applicants can reach you"
                                    count={6}
                                    current={false}
                                    finished={false}
                                />
                            </div>
                        </div>

                        {/* Main Section */}
                        <div className="col-span-12 sm:col-span-6 lg:col-span-7 bg-white p-6">
                            <WizardHeader
                                title="Basic Details"
                                description="Provide the main information"
                            />

                            <div className="mt-5 space-y-4">
                                {/* Title & Subtitle */}
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-1">
                                        <WizardInput
                                            label="Title"
                                            placeholder="Babysitting job in Berlin"
                                            value={formData?.title || ""}
                                            onChange={handleTitleChange}
                                            error={showErrors ? errors.title : ""}
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <WizardInput
                                            label="Subtitle"
                                            placeholder="Short description"
                                            value={formData?.subtitle || ""}
                                            onChange={(v) => updateForm({ subtitle: v })}
                                        />
                                    </div>
                                </div>

                                {/* Slug */}
                                <div>
                                    <WizardInput
                                        label="Slug"
                                        placeholder="babysitting-job-in-berlin"
                                        value={formData?.slug || ""}
                                        onChange={(v) => {
                                            setSlugEdited(true);
                                            handleFieldChange("slug", v);
                                        }}
                                        error={showErrors ? errors.slug : ""}
                                        disabled={mode==='edit'?true:false}
                                        required
                                    />
                                    {slugEdited && (
                                        <button
                                            type="button"
                                            onClick={handleSlugAutoGenerate}
                                            className="text-gray-600 text-sm underline mt-1 hover:text-gray-900"
                                        >
                                            ↻ Slug Auto-generate
                                        </button>
                                    )}
                                </div>

                                {/* Category & Tags */}
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-1">
                                        <WizardSelect
                                            label="Job Category"
                                            value={formData?.category_id || ""}
                                            onChange={(v) => handleFieldChange("category_id", v)}
                                            options={categoryOptions || []}
                                            error={showErrors ? errors.category_id : ""}
                                            required
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <WizardMultiSelect
                                            label="Tags"
                                            values={formData?.tag_ids || []}
                                            onChange={(v) => updateForm({ tag_ids: v })}
                                            options={tagOptions || []}
                                        />
                                    </div>
                                </div>

                                {/* Job Type & Experience */}
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-1">
                                        <WizardMultiSelect
                                            label="Job Type"
                                            values={Array.isArray(formData?.job_type) ? formData.job_type : []}
                                            onChange={(v) => updateForm({ job_type: v })}
                                            options={jobTypeOptions || []}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <WizardMultiSelect
                                            label="Experience Level"
                                            values={Array.isArray(formData?.job_experience) ? formData.job_experience : []}
                                            onChange={(v) => updateForm({ job_experience: v })}
                                            options={experienceOptions || []}
                                        />
                                    </div>
                                </div>

                                {/* Navigation */}
                                <WizardDirection
                                    next
                                    onNext={handleNext}
                                    isNextLoading={isNextLoading}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            </main>
        </div>
    );
}
