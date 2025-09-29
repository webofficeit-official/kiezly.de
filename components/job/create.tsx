"use client";
import { CreateJobData, JobResponse } from "@/lib/types/job";
import React, { useEffect, useMemo, useState } from "react";
import Input from "../shared-ui/input/input";
import { Select } from "../shared-ui/custom-select/custom-select";
import { RichTextEditor } from "./add";
import MultiSelect from "../shared-ui/multi-select/multi-select";
import { useCreateJob, useGenerateSlug, useJobCollections, useUpdateJob } from "@/lib/react-query/queries/useJob";
import { DateInput } from "../shared-ui/custom-date/custom-date";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

/* ----------------------------- Type Definitions ---------------------------- */
interface WizardStep {
    id: string;
    title: string;
    subtitle?: string;
    layout?: string;
    subTopics: Array<{
        id: string;
        label: string;
        type: "input" | "text" | "textarea" | "select" | "number" | "checkbox" | "date";
        options?: string[] | { id: string; name: string }[];
        multiple?: boolean;
        required?: boolean | ((form: any) => boolean);
        colSpan?: string;
    }>;
}

interface CreateEditJobFormProps {
    mode: "create" | "edit";
    initialData?: JobResponse;
}

interface OnboardingFormProps {
    mode: "create" | "edit";
    initialData?: JobResponse;
    steps: WizardStep[];
    collections: {
        jobCategories: { id: number; name: string }[];
        jobTags: { id: number; name: string }[];
        jobType: string[];
        jobExperience: string[];
        languages: { id: number; name: string }[];
    };
}

/* ----------------------------- Create/Edit Wrapper ---------------------------- */
export default function CreateEditJobForm({ mode, initialData }: CreateEditJobFormProps) {
    const { data: collections } = useJobCollections();

    const steps: WizardStep[] = useMemo(
        () => {
            // if (!collections) return [];
            return [
                {
                    id: "basic",
                    title: "Basic Details",
                    subtitle: "Provide the main information",
                    layout: "grid sm:grid-cols-2 gap-4",
                    subTopics: [
                        { id: "title", label: "Title", type: "input", required: true, colSpan: "col-span-2" },
                        { id: "subtitle", label: "Subtitle", type: "input", colSpan: "col-span-2" },
                        {
                            id: "category_id",
                            label: "Job Category",
                            type: "select",
                            options: collections?.jobCategories.map(c => ({ id: c.id.toString(), name: c.name })) || [],
                            required: true
                        },
                        {
                            id: "tag_ids",
                            label: "Tags",
                            type: "select",
                            multiple: true,
                            options: collections?.jobTags.map(t => ({ id: t.id.toString(), name: t.name })) || []
                        },
                        {
                            id: "job_type",
                            label: "Job Type",
                            type: "select",
                            multiple: true,
                            options: collections?.jobType.map(t => ({ id: t, name: t })) || []
                        },
                        {
                            id: "job_experience",
                            label: "Experience Level",
                            type: "select",
                            multiple: true,
                            options: collections?.jobExperience.map(t => ({ id: t, name: t })) || []
                        }
                    ]
                },
                {
                    id: "details",
                    title: "Job Details",
                    subtitle: "Provide detailed information",
                    layout: "grid sm:grid-cols-1 gap-4",
                    subTopics: [
                        { id: "description", label: "Job Description", type: "textarea", required: true },
                        { id: "tasks", label: "Tasks", type: "textarea" },
                        { id: "requirements", label: "Requirements", type: "textarea" },
                        // {
                        //     id: "languages",
                        //     label: "Languages",
                        //     type: "select",
                        //     multiple: true,
                        //     options: collections?.languages.map(l => ({ id: l.id.toString(), name: l.name })) || []
                        // }
                    ]
                },
                {
                    id: "location",
                    title: "Location",
                    subtitle: "Provide location details",
                    layout: "grid sm:grid-cols-2 gap-4",
                    subTopics: [
                        { id: "country", label: "Country", type: "input", required: true },
                        { id: "state", label: "State", type: "input", required: true },
                        { id: "city", label: "City", type: "input", required: true },
                        { id: "postal_code", label: "Postal Code", type: "input", required: true },
                        { id: "street", label: "Street", type: "input", required: true },
                        { id: "lat", label: "Latitude", type: "input", required: true },
                        { id: "lng", label: "Longitude", type: "input", required: true }
                    ]
                },
                {
                    id: "pricing",
                    title: "Pricing",
                    subtitle: "Set the pricing for this job",
                    layout: "grid sm:grid-cols-2 gap-4",
                    subTopics: [
                        {
                            id: "currency",
                            label: "Currency",
                            type: "select",
                            required: true,
                            options: [
                                { id: "EUR", name: "EUR" },
                                { id: "USD", name: "USD" },
                                { id: "GBP", name: "GBP" }
                            ]
                        },
                        {
                            id: "price_type",
                            label: "Price Type",
                            type: "select",
                            required: true,
                            options: [
                                { id: "fixed", name: "Fixed" },
                                { id: "range", name: "Range" }
                            ]
                        },
                        { id: "price_value", label: "Price (€)", type: "input" },
                        { id: "price_min", label: "Min (€)", type: "input" },
                        { id: "price_max", label: "Max (€)", type: "input" }
                    ]
                },
                {
                    id: "work_details",
                    title: "Work Details",
                    subtitle: "Provide work details",
                    layout: "grid sm:grid-cols-2 gap-4",
                    subTopics: [
                        {
                            id: "work_mode",
                            label: "Work Mode",
                            type: "select",
                            required: true,
                            options: [
                                { id: "on_site", name: "On Site" },
                                { id: "remote", name: "Remote" },
                                { id: "hybrid", name: "Hybrid" }
                            ],
                            colSpan: "col-span-2"
                        },
                        { id: "starts_at", label: "Start Date", type: "date", required: true },
                        { id: "ends_at", label: "End Date", type: "date", required: true },
                        { id: "first_aid_verified", label: "First Aid Verified", type: "checkbox" },
                        { id: "police_verified", label: "Police Verified", type: "checkbox" }
                    ]
                },
                {
                    id: "contact",
                    title: "Contact Details",
                    subtitle: "Provide how applicants can reach you",
                    layout: "grid sm:grid-cols-2 gap-4",
                    subTopics: [
                        {
                            id: "contact_method",
                            label: "Contact Method",
                            type: "select",
                            required: true,
                            options: [
                                { id: "email_relay", name: "Email Relay" },
                                { id: "direct_email", name: "Direct Email" },
                                { id: "phone", name: "Phone" },
                                { id: "external_link", name: "External Link" }
                            ]
                        },
                        { id: "contact_email", label: "Email", type: "input" },
                        { id: "contact_phone", label: "Phone", type: "input" },
                        { id: "contact_link", label: "External Link", type: "input" }
                    ]
                }
            ]
        }, [collections]
    );

    return (
        <div className="flex flex-col mx-auto max-w-5xl px-4 py-8">
            <h1 className="text-3xl font-semibold tracking-tight">
                {mode === "create" ? "Post a mini-job" : "Edit mini-job"}
            </h1>
            <div className="mt-2 bg-white">
                <OnboardingForm mode={mode} initialData={initialData} steps={steps} collections={collections || {
                    jobCategories: [],
                    jobTags: [],
                    jobType: [],
                    jobExperience: [],
                    languages: []
                }} />
            </div>
        </div>
    );
}

/* ----------------------------- OnboardingForm ---------------------------- */
function OnboardingForm({ mode, initialData, steps, collections }: OnboardingFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [showErrors, setShowErrors] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [jobId, setJobId] = useState<string | null>(initialData?.job?.id || null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const router = useRouter()
    const createJobMutation = useCreateJob();
    const generateSlugMutation = useGenerateSlug();

    const updateJobMutation = useUpdateJob(jobId!);
    console.log(collections)
    useEffect(() => {
        if (mode === "edit" && initialData && collections) {
            const job = initialData.job;

            const mapJobType = (values: string[], collection: string[]) => {
                return values
                    .map(v => {
                        const match = collection.find(c => c.toLowerCase() === v.toLowerCase());
                        return match ? { id: match, name: match } : null;
                    })
                    .filter(Boolean);
            };

            setFormData({
                title: job.title || "",
                subtitle: job.subtitle || "",
                description: job.description || "",
                tasks: job.tasks || "",
                requirements: job.requirements || "",
                country: job.country || "",
                state: job.state || "",
                city: job.city || "",
                postal_code: job.postal_code || "",
                street: job.street || "",
                lat: job.lat || "",
                lng: job.lng || "",
                starts_at: job.starts_at ? new Date(job.starts_at) : null,
                ends_at: job.ends_at ? new Date(job.ends_at) : null,
                price_value: job.price_value || "",
                price_min: job.price_min || "",
                price_max: job.price_max || "",
                currency: job.currency || "",
                first_aid_verified: !!job.first_aid_verified,
                police_verified: !!job.police_verified,
                slug: job.slug,
                status: job.status || "draft",
                category_id: job.category
                    ? { id: job.category.id.toString(), name: job.category.name }
                    : null,
                job_type: mapJobType(job.job_type || [], collections.jobType),
                job_experience: mapJobType(job.job_experience || [], collections.jobExperience),
                tag_ids: (job.tags || []).map(t => ({ id: t.id.toString(), name: t.name })),
                languages: (job.languages || []).map(l => ({ id: l.id.toString(), name: l.name })),
                work_mode: job.work_mode ? { id: job.work_mode, name: job.work_mode } : null,
                price_type: job.price_type ? { id: job.price_type, name: job.price_type } : null,
                contact_method: job.contact_method ? { id: job.contact_method, name: job.contact_method } : null,
                contact_email: job.contact_email || "",
                contact_phone: job.contact_phone || "",
                contact_link: job.contact_link || "",
            });
        }
        // Run ONLY when collections have valid data
    }, [mode, initialData, collections?.jobType, collections?.jobExperience, collections?.jobTags, collections?.languages]);







    function normalizeJobPayload(data: Record<string, any>) {
        return {
            ...data,
            // category_id -> number
            category_id: data.category_id
                ? Number(typeof data.category_id === "object" ? data.category_id.id : data.category_id)
                : null,

            // tag_ids -> number[]
            tag_ids: Array.isArray(data.tag_ids)
                ? data.tag_ids.map((t: any) => Number(t.id ?? t))
                : [],

            // job_type -> string[]
            job_type: Array.isArray(data.job_type)
                ? data.job_type.map((t: any) => (typeof t === "object" ? t.id : t))
                : [],

            // job_experience -> string[]
            job_experience: Array.isArray(data.job_experience)
                ? data.job_experience.map((t: any) => (typeof t === "object" ? t.id : t))
                : [],

            // languages -> number[]
            languages: Array.isArray(data.languages)
                ? data.languages.map((l: any) => Number(l.id ?? l))
                : [],

            // enums that must be strings
            price_type: typeof data.price_type === "object" ? data.price_type.id : data.price_type,
            work_mode: typeof data.work_mode === "object" ? data.work_mode.id : data.work_mode,

            // slug and status
            slug: data.slug,
            status: data.status ?? "draft",
        };
    }



    // const update = (fn: (draft: CreateJobData) => void) =>
    //     setFormData(prev => {
    //         const draft = { ...prev };
    //         fn(draft);
    //         return draft;
    //     });

    const update = (fn: (draft: CreateJobData) => void) => {
        setFormData(prev => {
            const draft = { ...prev } as CreateJobData;
            fn(draft);
            return draft;
        });
    };

    /* ----------------------------- Validation per Step ---------------------------- */
    const validateStep = (stepIdx: number) => {
        const errors: Record<string, string> = {};
        const topics = steps[stepIdx].subTopics;

        topics.forEach(t => {
            const required = typeof t.required === "function" ? t.required(formData) : t.required;
            if (!required) return;

            const val = formData[t.id];
            if (t.type === "checkbox") return;

            if ((t.type === "input" || t.type === "textarea" || t.type === "date") && (!val || val === "")) {
                errors[t.id] = `${t.label} is required`;
            }

            if (t.type === "select" && (!val || (t.multiple && val.length === 0))) {
                errors[t.id] = `${t.label} is required`;
            }
        });

        return errors;
    };


    /* ----------------------------- Navigation ---------------------------- */
    const nextStep = async () => {
        console.log(currentStep)
        const errors = validateStep(currentStep);
        if (Object.keys(errors).length > 0) {
            setShowErrors(true);
            return;
        }

        setShowErrors(false);


        const stepData: Record<string, any> = {};
        steps[currentStep].subTopics.forEach(t => (stepData[t.id] = formData[t.id]));

        if (mode === "create" && currentStep === 0) {

            const stepTitle = stepData.title;
            generateSlugMutation.mutate(stepTitle, {
                onSuccess: (slugData) => {
                    // Add slug to normalized payload
                    const normalized = normalizeJobPayload({
                        ...stepData,
                        slug: slugData.slug,
                    });


                    createJobMutation.mutate(normalized, {
                        onSuccess: (data: any) => {
                            const newJob = data?.data;
                            setJobId(newJob?.id); // save returned id
                            router.push(`/post-job/${newJob.slug}`);
                            setCurrentStep(s => Math.min(s + 1, steps.length - 1)); // move to next step
                        },
                        onError: (error: any) => {
                            toast.error(error?.message || "Failed to create job");
                        },
                    });
                },
                onError: (err: any) => {
                    toast.error(err?.message || "Failed to generate slug");
                },
            });
        } else if (jobId) {
            alert(jobId)
            const normalized = normalizeJobPayload({
                ...formData,
                status: formData.status !== 'draft' ? formData.status : 'draft',
            });
            updateJobMutation.mutate(normalized, {
                onSuccess: () => {
                    toast.success("Job updated successfully!");
                    setCurrentStep(s => Math.min(s + 1, steps.length - 1));
                },
                onError: (err) => toast.error(err?.message || "Failed to update job"),
            });

        }


    };

    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        const errors = validateStep(currentStep);
        if (Object.keys(errors).length > 0) {
            setShowErrors(true);
            return;
        }

        if (jobId) {
            const normalized = normalizeJobPayload({
                ...formData,
                status: formData.status || 'pending_review'
            });
            updateJobMutation.mutate(normalized, {
                onSuccess: () => {
                    toast.success("Job Created successfully!");
                    setShowErrors(false);
                    setFormSubmitted(true); //  final success

                },
                onError: (err) => toast.error(err?.message || "Failed to update job"),
            });
        }


    };

    const isLastStep = currentStep === steps.length - 1;

    /* ----------------------------- Render ---------------------------- */
    return (
        <div className="max-w-4xl mx-auto p-5 pb-1">
            <div className="flex gap-12">
                {/* Stepper */}
                <div className="relative w-1/3 pt-2">
                    <div className="space-y-12">
                        {steps.map((step, idx) => {
                            const isCompleted = formSubmitted || idx < currentStep;
                            const isActive = !formSubmitted && idx === currentStep;
                            return (
                                <div
                                    key={step.id}
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => !formSubmitted && setCurrentStep(idx)}
                                >
                                    <div
                                        className={`flex items-center justify-center rounded-full border w-8 h-8 ${isCompleted
                                            ? "bg-green-500 text-white border-green-500"
                                            : isActive
                                                ? "bg-black text-white border-black"
                                                : "border-gray-400 text-gray-400"
                                            }`}
                                    >
                                        {isCompleted ? "✓" : idx + 1}
                                    </div>
                                    <div>
                                        <div
                                            className={`font-medium ${isCompleted
                                                ? "text-green-600"
                                                : isActive
                                                    ? "text-black"
                                                    : "text-gray-500"
                                                }`}
                                        >
                                            {step.title}
                                        </div>
                                        <div className="text-xs text-gray-400">{step.subtitle}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Step Content */}
                <div className="w-3/4 pt-2">
                    {formSubmitted ? (
                        <div className="p-8 border rounded-lg bg-green-50 shadow text-center">
                            <h3 className="text-2xl font-bold text-green-600 mb-2">
                                🎉 Job {mode === "create" ? "Created" : "Updated"}!
                            </h3>
                            <p className="text-gray-600">
                                All steps completed successfully. Thank you!
                            </p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold mb-2">
                                {steps[currentStep].title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {steps[currentStep].subtitle}
                            </p>

                            <div
                                className={`p-4 border rounded-lg bg-white shadow ${steps[currentStep].layout || "space-y-4"
                                    }`}
                            >
                                {steps[currentStep].subTopics.map(topic => {
                                    const errors = validateStep(currentStep);
                                    return (
                                        <div key={topic.id} className={topic.colSpan || ""}>
                                            {topic.type === "input" && (
                                                <Input
                                                    label={topic.label}
                                                    value={formData?.[topic.id] || ""}
                                                    onChange={v => update(d => (d[topic.id] = v))}
                                                    required={!!topic.required}
                                                    error={showErrors && errors[topic.id]}
                                                />
                                            )}

                                            {topic.type === "textarea" && (
                                                <RichTextEditor
                                                    label={topic.label}
                                                    value={formData?.[topic.id] || ""}
                                                    onChange={v => update(d => (d[topic.id] = v))}
                                                    required={!!topic.required}
                                                    error={showErrors && errors[topic.id]}
                                                />
                                            )}

                                            {topic.type === "select" && topic.multiple && (
                                                <MultiSelect
                                                    label={topic.label}
                                                    values={formData?.[topic.id] || []}
                                                    onChange={opt => update(d => (d[topic.id] = opt))}
                                                    options={
                                                        topic.options?.map(o =>
                                                            typeof o === "string"
                                                                ? { id: o, name: o }
                                                                : { id: o.id, name: o.name }
                                                        ) || []
                                                    }
                                                    required={!!topic.required}
                                                    error={showErrors && errors[topic.id]}
                                                />
                                            )}

                                            {topic.type === "select" && !topic.multiple && (
                                                <Select
                                                    label={topic.label}
                                                    value={formData?.[topic.id] || null}
                                                    onChange={opt => update(d => (d[topic.id] = opt))}
                                                    options={
                                                        topic.options?.map(o =>
                                                            typeof o === "string"
                                                                ? { id: o, name: o }
                                                                : { id: o.id, name: o.name }
                                                        ) || []
                                                    }
                                                    required={!!topic.required}
                                                    error={showErrors && errors[topic.id]}
                                                />
                                            )}

                                            {topic.type === "checkbox" && (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={topic.id}
                                                        checked={formData?.[topic.id] || false}
                                                        onChange={e =>
                                                            update(d => (d[topic.id] = e.target.checked))
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={topic.id}
                                                        className="text-sm text-gray-700"
                                                    >
                                                        {topic.label}
                                                    </label>
                                                </div>
                                            )}

                                            {topic.type === "date" && (
                                                <DateInput
                                                    label={topic.label}
                                                    value={formData?.[topic.id] || null}
                                                    onChange={v => update(d => (d[topic.id] = v))}
                                                    required={!!topic.required}
                                                    error={showErrors && errors[topic.id]}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between mt-6">
                                {currentStep > 0 ? (
                                    <button onClick={prevStep} className="px-4 py-2 bg-gray-200 rounded">
                                        Prev
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {isLastStep ? (
                                    <button
                                        onClick={handleSubmit}
                                        className="rounded-xl w-48 px-6 py-2 text-white font-medium transition bg-black hover:bg-gray-800"
                                    >
                                        {mode === "create" ? "Create Job" : "Update Job"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={nextStep}
                                        className="rounded-xl w-48 px-6 py-2 text-white font-medium transition bg-black hover:bg-gray-800"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
