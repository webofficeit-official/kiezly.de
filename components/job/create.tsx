"use client";
import { CreateJobData, JobMode, JobResponse } from "@/lib/types/job";
import React, { useEffect, useMemo, useState } from "react";
import Input from "../shared-ui/input/input";
import { Select } from "../shared-ui/custom-select/custom-select";
import { RichTextEditor } from "../shared-ui/rich-text-editor/rich-text-editor";
import MultiSelect from "../shared-ui/multi-select/multi-select";
import { useCreateJob, useGenerateSlug, useJobCollections, useUpdateJob } from "@/lib/react-query/queries/useJob";
import { DateInput } from "../shared-ui/custom-date/custom-date";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Switch from "../shared-ui/switch/switch";
import { useCollection, useZipcodes } from "@/lib/react-query/queries/collection";

import { Zipcode } from "@/lib/types/zip-type";

/* ----------------------------- Type Definitions ---------------------------- */
export interface ZipOption {
    id: string;         // always string, even if your API returns number
    zipcode: string;
    city: string;
    state: string;
    country_id: string;
    latitude: number;
    longitude: number;
    street: string;
}


interface WizardSubTopic {
    id: string;
    label: string;
    type:
    | "input"
    | "text"
    | "textarea"
    | "select"
    | "number"
    | "checkbox"
    | "date"
    | "auto-complete"
    | "custom"
    | "select_country";
    options?: string[] | { id: string; name: string }[];
    multiple?: boolean;
    required?: boolean | ((form: any) => boolean);
    colSpan?: string;
    validate?: (value: any, formData: Record<string, any>) => string | null;

    // for custom types only
    component?: React.ComponentType<any>;
    placeholder?: string;
    onChangeValue?: (value: string) => void;
    onSelectOption?: (option: any) => void;
    value?: any;
    fetchOptions?: (query: string) => Promise<any[]>;
}

interface WizardStep {
    id: string;
    title: string;
    subtitle?: string;
    layout?: string;
    subTopics: WizardSubTopic[];
}



interface Country {
    id: number;
    code?: string;
    name: string;
    currency?: string;
}

interface CreateEditJobFormProps {
    mode: "create" | "edit";
    initialData?: JobResponse;
}

interface OnboardingFormProps {
    mode: "create" | "edit";
    initialData?: JobResponse;
    collections: {
        jobCategories: { id: number; name: string }[];
        jobTags: { id: number; name: string }[];
        jobType: string[];
        jobExperience: string[];
        languages: { id: number; name: string }[];
        jobMode: JobMode[]
    };
    countries?: Country[]
}

export function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debounced;
}

/* ----------------------------- Create/Edit Wrapper ---------------------------- */
export default function CreateEditJobForm({ mode, initialData }: CreateEditJobFormProps) {
    const { data: collections } = useJobCollections();
    const { data: countries } = useCollection<{ id: number; code?: string; name: string, currency?: string }>("countries");


    return (
        <div className="flex flex-col mx-auto max-w-5xl px-4 py-8">
            <h1 className="text-3xl font-semibold tracking-tight">
                {mode === "create" ? "Post a mini-job" : "Post a mini-job"}
            </h1>
            <div className="mt-2 bg-white">
                <OnboardingForm mode={mode} initialData={initialData}
                    collections={collections || {
                        jobCategories: [],
                        jobTags: [],
                        jobType: [],
                        jobExperience: [],
                        languages: [],
                        jobMode: [],
                    }}
                    countries={countries || []}
                />
            </div>
        </div>
    );
}

/* ----------------------------- OnboardingForm ---------------------------- */
function OnboardingForm({ mode, initialData, collections, countries }: OnboardingFormProps) {
    const [jobId, setJobId] = useState<string | null>(initialData?.job?.id || null);

    const [currentStep, setCurrentStep] = useState(() => {
        if (typeof window !== "undefined") {
            if (mode === "edit" && jobId) {
                const step = sessionStorage.getItem("currentStep");
                return step ? Number(step) : 0;
            }
        }
        return 0;
    });

    const [showErrors, setShowErrors] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({
        description: "",
        tasks: "",
        requirements: "",
        country: ""
    });
    const [titleValue, setTitleValue] = useState(formData.title || "");
    const [slugEdited, setSlugEdited] = useState(false);
    const [zipOptions, setZipOptions] = useState<ZipOption[]>([]);
    const [countryCode, setCountryId] = useState<string | undefined>(undefined);



    const { mutateAsync } = useZipcodes();

    const fetchZipOptions = async (query: string, countryId?: string): Promise<ZipOption[]> => {
        // if (!query || !countryId) return [];
        console.log(query)
        const res = await mutateAsync({ zip: query, country: countryCode ? countryCode : countryId }); // pass country_id to backend

        const list: ZipOption[] = res.data.zipcode.map((z: any) => ({
            id: String(z.id),
            country_id: String(z.country_id),
            zipcode: z.zipcode,
            street: z.street,
            city: z.city,
            state: z.state,
            latitude: parseFloat(z.latitude),
            longitude: parseFloat(z.longitude),
        }));

        setZipOptions(list);
        return list;
    };


    useEffect(() => {
        if (mode === "edit" && initialData && collections) {
            const job = initialData.job;

            const tag_idsdata = (job?.tags || []).map(t => ({
                id: t.id.toString(),
                name: t.name
            }))
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
                currency: job.currency
                    ? { id: job.currency, name: job.currency }  // wrap string as object for Select
                    : null,
                first_aid_verified: !!job.first_aid_verified,
                police_verified: !!job.police_verified,
                slug: job.slug,
                status: job.status || "draft",
                category_id: job.category
                    ? { id: job.category.id.toString(), name: job.category.name }
                    : null,
                job_type: job?.job_type || [],
                job_experience: job?.job_experience || [],
                tag_ids: (job.tags || []).map(t => t.id.toString()),
                languages: (job.languages || []).map(l => ({ id: l.id.toString(), name: l.name })),
                work_mode: job.work_mode
                    ? {
                        id: job.work_mode,
                        name: collections?.jobMode.find(m => m.key === job.work_mode)?.label || job.work_mode
                    }
                    : null,
                price_type: job.price_type
                    ? {
                        id: job.price_type,
                        // Map lowercase stored value to proper label
                        name:
                            job.price_type === "fixed"
                                ? "Fixed"
                                : job.price_type === "range"
                                    ? "Range"
                                    : job.price_type, // fallback
                    }
                    : null,
                contact_method: job.contact_method
                    ? {
                        id: job.contact_method,
                        name:
                            job.contact_method === "email_relay"
                                ? "Email Relay"
                                : job.contact_method === "direct_email"
                                    ? "Direct Email"
                                    : job.contact_method === "phone"
                                        ? "Phone"
                                        : job.contact_method === "external_link"
                                            ? "External Link"
                                            : job.contact_method, // fallback
                    }
                    : null,

                contact_email: job.contact_email || "",
                contact_phone: job.contact_phone || "",
                contact_link: job.contact_link || "",
            });
        }

    }, [mode, initialData, collections?.jobType, collections?.jobExperience, collections?.jobTags, collections?.languages, collections?.jobMode]);




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
                        {
                            id: "title",
                            label: "Title",
                            type: "input",
                            required: true,
                            colSpan: "col-span-2",
                            validate: (value) => {
                                if (!value) return null; // required is handled separately
                                return value.length < 8 ? "Title must be at least 8 characters" : null;
                            }
                        },
                        { id: "slug", label: "Slug", type: "input", colSpan: "col-span-2", required: true },
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
                        {
                            id: "languages",
                            label: "Languages",
                            type: "select",
                            multiple: true,
                            options: collections?.languages.map(l => ({ id: l.id.toString(), name: l.name })) || []
                        },
                        { id: "tasks", label: "Tasks", type: "textarea" },
                        { id: "requirements", label: "Requirements", type: "textarea" },
                    ]
                },
                {
                    id: "location",
                    title: "Location",
                    subtitle: "Provide location details",
                    layout: "grid sm:grid-cols-2 gap-4",
                    subTopics: [
                        {
                            id: "country",
                            label: "Country",
                            type: "select",
                            options: countries.map(c => ({ id: c.id.toString(), name: c.name })),
                            value: formData.country,
                            required: true,
                            onChangeValue: val => {

                                const selectedCountry = countries.find(c => String(c.id) === String(val));


                                if (!selectedCountry) return;

                                setCountryId(selectedCountry.id.toString()); // number
                                fetchZipOptions(null, selectedCountry?.id.toString());

                                update(d => {
                                    d.country = String(selectedCountry?.name);
                                    d.postal_code = null;
                                    d.street = "";
                                    d.city = "";
                                    d.state = "";
                                    d.lat = "";
                                    d.lng = "";
                                });
                            }

                        }

                        ,
                        {
                            id: "postal_code",
                            label: "Postal Code",
                            type: "custom",
                            component: DynamicAutocomplete,
                            placeholder: "Type postal code",
                            value: formData.postal_code,
                            fetchOptions: (query: string) => fetchZipOptions(query, countryCode),
                            onChangeValue: val => update(d => (d.postal_code = val)),
                            onSelectOption: (zip: ZipOption) => {
                                update(d => {
                                    d.postal_code = zip.zipcode;
                                    d.street = zip.street || "";
                                    d.city = zip.city || "";
                                    d.state = zip.state || "";
                                    d.lat = String(zip.latitude);
                                    d.lng = String(zip.longitude);
                                });
                            },
                        },

                        { id: "street", label: "Street", type: "auto-complete", value: formData.street },
                        { id: "city", label: "City", type: "auto-complete", value: formData.city },
                        { id: "state", label: "State", type: "auto-complete", value: formData.state },
                        { id: "lat", label: "Latitude", type: "auto-complete", value: formData.lat },
                        { id: "lng", label: "Longitude", type: "auto-complete", value: formData.lng },
                    ],
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
                        {
                            id: "price_value",
                            label: "Price (€)",
                            type: "input",
                            required: formData => formData.price_type?.id === "fixed",
                            validate: (val, formData) => {
                                if (formData.price_type?.id === "fixed" && (!val || Number(val) <= 0)) {
                                    return "Price is required and must be greater than 0 for Fixed type";
                                }
                                return null;
                            }
                        },
                        {
                            id: "price_min",
                            label: "Min (€)",
                            type: "input",
                            required: formData => formData.price_type?.id === "range",
                            validate: (val, formData) => {
                                if (formData.price_type?.id === "range" && (val === "" || Number(val) < 0)) {
                                    return "Min price is required and must be ≥ 0";
                                }
                                return null;
                            }
                        },
                        {
                            id: "price_max",
                            label: "Max (€)",
                            type: "input",
                            required: formData => formData.price_type?.id === "range",
                            validate: (val, formData) => {
                                if (formData.price_type?.id === "range") {
                                    if (val === "" || Number(val) < 0) return "Max price is required and must be ≥ 0";
                                    if (Number(val) < Number(formData.price_min)) return "Max price cannot be less than Min price";
                                }
                                return null;
                            }
                        }
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
                            options: collections?.jobMode.map(mode => ({
                                id: mode.key,
                                name: mode.label
                            })) || [],
                            colSpan: "col-span-2"
                        },
                        { id: "starts_at", label: "Start Date", type: "date", required: true },
                        {
                            id: "ends_at",
                            label: "End Date",
                            type: "date",
                            required: false, // not required
                            validate: (value, formData) => {
                                if (value && formData.starts_at) {
                                    const start = new Date(formData.starts_at);
                                    const end = new Date(value);
                                    if (end < start) return "End date cannot be before Start date";
                                }
                                return null;
                            }
                        },
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


    const debouncedTitle = useDebounce(titleValue, 400); // wait 400ms after typing

    const router = useRouter()
    const createJobMutation = useCreateJob();
    const generateSlugMutation = useGenerateSlug();

    const updateJobMutation = useUpdateJob(jobId ?? undefined);

    useEffect(() => {
        // Preload ReactQuill to eliminate placeholder flash
        import("react-quill");
    }, []);


    useEffect(() => {
        if (mode === "create") {
            sessionStorage.removeItem("currentStep");
        }
    }, [mode]);




    useEffect(() => {
        if (initialData?.job) {
            setTitleValue(initialData.job.title || "");
        }
    }, [initialData]);



    useEffect(() => {
        sessionStorage.setItem("currentStep", currentStep.toString());
    }, [currentStep]);


    useEffect(() => {
        if (!slugEdited) {
            if (!debouncedTitle) {
                // Title is empty, clear slug
                update(d => { d.slug = ""; });
            } else {
                // Title exists, generate slug
                if (mode === "create" || (mode === "edit" && !formData.slug)) {
                    generateSlugMutation.mutate(debouncedTitle, {
                        onSuccess: res => update(d => { d.slug = res.slug; }),
                    });
                }
            }
        }
    }, [debouncedTitle, slugEdited, mode, formData.slug]);

    useEffect(() => {
        if (formData.price_type?.id === "fixed") {
            update(d => {
                d.price_min = 0;
                d.price_max = 0;
            });
        } else if (formData.price_type?.id === "range") {
            update(d => {
                d.price_value = 0;
            });
        }
    }, [formData.price_type]);







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


            price_type: typeof data.price_type === "object" ? data.price_type.id : data.price_type,
            work_mode: typeof data.work_mode === "object" ? data.work_mode.id : data.work_mode,
            currency: typeof data.currency === "object" ? data.currency.id : data.currency,
            contact_method: typeof data.contact_method === "object" ? data.contact_method.id : data.contact_method.id,

            // slug and status
            slug: data.slug,
            status: data.status ?? "draft",
            starts_at: data.starts_at ? new Date(data.starts_at).toISOString() : null,
            ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : null,
        };
    }



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
            const val = formData[t.id];

            // Required check
            if (required) {
                if (t.type === "textarea") {
                    if (!formData[t.id] || isEmptyEditorValue(formData[t.id])) {
                        errors[t.id] = `${t.label} is required`;
                        return;
                    }
                }
                if (t.type === "checkbox") return;
                if ((t.type === "input" || t.type === "textarea" || t.type === "date") && (!val || val === "")) {
                    errors[t.id] = `${t.label} is required`;
                    return;
                }
                if (t.type === "select" && (!val || (t.multiple && val.length === 0))) {
                    errors[t.id] = `${t.label} is required`;
                    return;
                }
                if (t.type === "date" && val) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // normalize to start of today
                    const dateVal = new Date(val);

                    // Check date >= today
                    if (dateVal < today) {
                        errors[t.id] = `${t.label} cannot be in the past`;
                        return;
                    }

                    // Check ends_at >= starts_at
                    if (t.id === "ends_at" && formData.starts_at) {
                        const start = new Date(formData.starts_at);
                        if (dateVal < start) {
                            errors[t.id] = "End date cannot be before Start date";
                            return;
                        }
                    }
                }


            }

            // Custom validation
            if (t.validate) {
                const customError = t.validate(val, formData);
                if (customError) errors[t.id] = customError;
            }
            // Contact-specific validation
            if (t.id === "contact_email" && ["email_relay", "direct_email"].includes(formData.contact_method?.id)) {
                const email = formData.contact_email;
                if (!email) {
                    errors.contact_email = "Email is required for the selected contact method";
                } else {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        errors.contact_email = "Please enter a valid email address";
                    }
                }
            }

            if (t.id === "contact_link" && formData.contact_method?.id === "external_link") {
                const link = formData.contact_link;
                if (!link) {
                    errors.contact_link = "External link is required for the selected contact method";
                } else {
                    try {
                        new URL(link); // validates URL format
                    } catch {
                        errors.contact_link = "Please enter a valid URL";
                    }
                }
            }

        });

        return errors;
    };



    /* ----------------------------- Navigation ---------------------------- */
    const nextStep = async () => {
        const errors = validateStep(currentStep);

        if (Object.keys(errors).length > 0) {
            setShowErrors(true);
            toast.error("Please fix the errors in this step.");
            return;
        }

        setShowErrors(false);

        const stepData: Record<string, any> = {};
        steps[currentStep].subTopics.forEach(t => (stepData[t.id] = formData[t.id]));

        // Create mode, first step
        if (mode === "create" && currentStep === 0) {
            const normalized = normalizeJobPayload(stepData);
            createJobMutation.mutate(normalized, {
                onSuccess: (data: any) => {
                    const newJob = data?.data;
                    window.history.replaceState(null, "", `/post-job/${newJob.slug}`);
                    setJobId(newJob?.id);
                    setCurrentStep(s => Math.min(s + 1, steps.length - 1));
                },
                onError: (error: any) => toast.error(error?.message || "Failed to create job"),
            });
            return;
        }

        // Update mode or subsequent steps (only if jobId exists)
        if (jobId) {
            const normalized = normalizeJobPayload({
                ...formData,
                status: formData.status !== "draft" ? formData.status : "draft",
            });

            updateJobMutation.mutate(normalized, {
                onSuccess: () => {

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
                    toast.success("Job Updated successfully!");
                    setShowErrors(false);
                    setFormSubmitted(true); //  final success
                    sessionStorage.removeItem("currentStep")
                },
                onError: (err) => toast.error(err?.message || "Failed to update job"),
            });
        }


    };

    const isLastStep = currentStep === steps.length - 1;
    function isEmptyEditorValue(value: string) {
        const normalized = value.replace(/<(.|\n)*?>/g, "").trim(); // remove HTML tags
        return normalized === "";
    }

    /* ----------------------------- To identify completed step on edit ---------------------------- */
    function isStepCompleted(stepIdx: number) {
        if (formSubmitted) return true; // All done if form submitted

        const errors = validateStep(stepIdx);
        return Object.keys(errors).length === 0; // No errors = completed
    }

    /* ----------------------------- Render ---------------------------- */
    return (
        <div className="max-w-4xl mx-auto p-5 pb-1">
            <div className="flex gap-12">

                {/* Stepper */}
                <div className="relative w-1/3 pt-2">
                    <div className="space-y-8"> {/* Reduced from space-y-12 to space-y-8 for less spacing */}
                        {steps.map((step, idx) => {
                            const isCompleted = isStepCompleted(idx);
                            const isActive = !formSubmitted && idx === currentStep;
                            return (
                                <div
                                    key={step.id}
                                    className={`relative flex items-center gap-3 cursor-pointer ${idx < steps.length - 1 ? 'pb-8' : ''}`} // items-center for better alignment, pb-8 to match space-y-8 and reduce overall space
                                    onClick={() => {
                                        if (!formSubmitted) {
                                            // Find first invalid step up to clicked step
                                            let firstInvalidStep = -1;
                                            for (let i = 0; i <= idx; i++) {
                                                const stepErrors = validateStep(i);
                                                if (Object.keys(stepErrors).length > 0) {
                                                    firstInvalidStep = i;
                                                    break;
                                                }
                                            }

                                            if (firstInvalidStep === -1 || firstInvalidStep === idx) {
                                                // No errors before or at clicked step
                                                setCurrentStep(idx);
                                            } else {
                                                // Jump to first invalid step
                                                setCurrentStep(firstInvalidStep);
                                                setShowErrors(true);
                                                toast.error("Please fix the errors in the highlighted step.");
                                            }
                                        }
                                    }}
                                >
                                    <div
                                        className={`flex-shrink-0 flex items-center justify-center rounded-full border w-8 h-8 ${isCompleted
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
                                    {idx < steps.length - 1 && (
                                        <div
                                            className={`absolute left-4 top-9 -bottom-9 w-px transition-colors duration-300 ${isCompleted ? "bg-green-500" : "bg-gray-300"
                                                }`} // top-8 starts after circle, -bottom-8 extends exactly to the next circle's top (matches pb-8 + space-y-8)
                                        />
                                    )}
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
                                Job {mode === "create" ? "Created" : "Updated"}!
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
                                    const errors = showErrors ? validateStep(currentStep) : {};
                                    const shouldShowField = () => {
                                        if (topic.id === "price_value") return formData.price_type?.id === "fixed";
                                        if (topic.id === "price_min" || topic.id === "price_max") return formData.price_type?.id === "range";

                                        if (topic.id === "contact_email") return ["email_relay", "direct_email"].includes(formData.contact_method?.id);
                                        if (topic.id === "contact_phone") return formData.contact_method?.id === "phone";
                                        if (topic.id === "contact_link") return formData.contact_method?.id === "external_link";

                                        return true;
                                    };

                                    if (["contact_email", "contact_phone", "contact_link"].includes(topic.id)) {
                                        if (topic.id === "contact_email" && !["email_relay", "direct_email"].includes(formData.contact_method?.id)) return null;
                                        if (topic.id === "contact_phone" && formData.contact_method?.id !== "phone") return null;
                                        if (topic.id === "contact_link" && formData.contact_method?.id !== "external_link") return null;
                                    }

                                    if (!shouldShowField()) return null;
                                    return (
                                        <div key={topic.id} className={topic.colSpan || ""}>
                                            {topic.type === "input" && (
                                                <Input
                                                    label={topic.label}
                                                    value={formData?.[topic.id] || ""}
                                                    onChange={v => {
                                                        update(d => (d[topic.id] = v))
                                                        if (topic.id === "title") {
                                                            setTitleValue(v);

                                                            if (!slugEdited) {
                                                                if (mode === "create" || (mode === "edit" && !formData.slug)) {
                                                                    generateSlugMutation.mutate(v, {
                                                                        onSuccess: res => update(d => (d.slug = res.slug))
                                                                    });
                                                                }
                                                            }
                                                        }

                                                        if (topic.id === "slug") {
                                                            setSlugEdited(true);

                                                            if (!v.trim()) {
                                                                setSlugEdited(false);
                                                                if (titleValue.trim()) {
                                                                    generateSlugMutation.mutate(titleValue, {
                                                                        onSuccess: res => update(d => (d.slug = res.slug))
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }}
                                                    required={!!topic.required}
                                                    error={showErrors && errors[topic.id]}
                                                />
                                            )}

                                            {topic.type === "textarea" && (

                                                <RichTextEditor
                                                    key={topic.id}
                                                    label={topic.label}
                                                    value={formData[topic.id] || ""}
                                                    onChange={v => update(d => (d[topic.id] = isEmptyEditorValue(v) ? "" : v))}
                                                    required={!!topic.required}
                                                    error={errors[topic.id]}
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
                                                    searchable={
                                                        topic.id === "country" ? true : false
                                                    }
                                                />
                                            )}

                                            {topic.type === "select_country" && !topic.multiple && (
                                                <Select
                                                    label={topic.label}
                                                    value={formData?.[topic.id] || null}
                                                    onChange={opt => {


                                                        // Call the subTopic's onChangeValue if it exists
                                                        if (topic.onChangeValue) {
                                                            const selectedVal = typeof opt === "object" ? opt.id : opt;
                                                            topic.onChangeValue(selectedVal);
                                                        }
                                                    }}
                                                    options={
                                                        topic.options?.map(o =>
                                                            typeof o === "string"
                                                                ? { id: o, name: o }
                                                                : { id: o.id, name: o.name }
                                                        ) || []
                                                    }
                                                    required={!!topic.required}
                                                    error={showErrors && errors[topic.id]}
                                                    searchable={topic.id === "country"}
                                                />
                                            )}


                                            {topic.type === "checkbox" && (
                                                <Switch
                                                    label={topic.label}
                                                    checked={formData?.[topic.id] || false}
                                                    onChange={(value) =>
                                                        update((d) => {
                                                            d[topic.id] = value;
                                                        })
                                                    }
                                                />
                                            )}

                                            {topic.type === "date" && (
                                                <DateInput
                                                    label={topic.label}
                                                    value={formData?.[topic.id] || null}
                                                    onChange={v => update(d => (d[topic.id] = v ?? null))}
                                                    required={!!topic.required}
                                                    error={showErrors && errors[topic.id]}
                                                    minDate={
                                                        topic.id === "starts_at"
                                                            ? new Date() // starts_at cannot be in the past
                                                            : formData.starts_at || new Date() // ends_at cannot be before start
                                                    }
                                                />
                                            )}

                                            {topic.type === "custom" && topic.component === DynamicAutocomplete && (
                                                <DynamicAutocomplete
                                                    label={topic.label}
                                                    value={formData.postal_code}
                                                    placeholder={topic.placeholder || "Type postal code"}
                                                    fetchOptions={topic.fetchOptions!}        // we provided it in subTopic
                                                    onChangeValue={val => update(d => (d.postal_code = val))}
                                                    onSelectOption={topic.onSelectOption}     // also passed from subTopic
                                                />
                                            )}

                                            {topic.type === "auto-complete" && (
                                                <Input
                                                    label={topic.label}
                                                    value={formData?.[topic.id] || ""}
                                                    onChange={v => {
                                                        update(d => (d[topic.id] = v))
                                                    }}
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





interface DynamicAutocompleteProps {
    label: string;
    value: string;
    fetchOptions: (query: string) => Promise<ZipOption[]>;
    onSelectOption: (option: ZipOption) => void;
    placeholder?: string;
    onChangeValue: (val: string) => void;
}

const DynamicAutocomplete: React.FC<DynamicAutocompleteProps> = ({
    label, value, fetchOptions, onSelectOption, placeholder, onChangeValue
}) => {
    const [options, setOptions] = useState<ZipOption[]>([]);
    const [loading, setLoading] = useState(false);

    const handleInputChange = async (val: string) => {
        onChangeValue(val);
        if (val.length < 2) return; // wait for at least 2 chars
        setLoading(true);
        const result = await fetchOptions(val);
        setOptions(result);
        setLoading(false);
    };

    return (
        <div>
            <label>{label}</label>
            <input
                value={value}
                onChange={e => handleInputChange(e.target.value)}
                placeholder={placeholder}
                className="border p-2 rounded w-full"
            />
            <ul>
                {options.map(opt => (
                    <li key={opt.id} onClick={() => {
                        onSelectOption(opt);
                        onChangeValue(opt.zipcode); // set input to selected value
                        setOptions([]);             // close dropdown
                    }}>
                        {opt.zipcode} - {opt.street}
                    </li>
                ))}
            </ul>
        </div>
    );
};
