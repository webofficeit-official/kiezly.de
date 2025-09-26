"use client";
import React, { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import type { CreateJobData } from "@/lib/types/job";
import { useCreateJob, useJobCollections } from "@/lib/react-query/queries/useJob";
import toast from "react-hot-toast";
import { Input } from "../shared-ui/input/input";
import { RichTextEditor } from "../shared-ui/rich-text-editor/rich-text-editor";
import MultiSelect from "../shared-ui/multi-select/multi-select";
import { DateInput } from "../shared-ui/custom-date/custom-date";
import { Select } from "../shared-ui/custom-select/custom-select";

const initalForm: CreateJobData = {
    title: "",
    subtitle: "",
    description: "",
    category_id: null,
    price_type: "",
    price_min: null,
    price_max: null,
    currency: "EUR",
    country: "",
    state: "",
    city: "",
    postal_code: "",
    street: "",
    lat: "",
    lng: "",
    starts_at: undefined,
    ends_at: undefined,
    job_experience: [],
    job_type: [],
    first_aid_verified: false,
    police_verified: false,
    verified: false,
    status: 'open',
    tag_ids: []
}


function classNames(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}


export default function CreateJobForm() {

    return (

        <div className="mx-auto max-w-5xl px-4 py-8">
            <h1 className="text-3xl font-semibold tracking-tight">Post a mini‑job</h1>

            <div className="mt-8">
                <OnboardingForm />
            </div>
        </div>
    );
}




// ----------------------------
// Onboarding Form
// ----------------------------
function OnboardingForm({ }) {
    const { data: collections, isLoading, isError, error } = useJobCollections();
    const createJobMutation = useCreateJob();

    const [form, setForm] = useState<CreateJobData>(initalForm);
    const [submitted, setSubmitted] = useState(false);


    React.useEffect(() => {
        if (isError) {
            toast.error("Failed to load job collections");
        }
    }, [isError, error]);

    const fieldErrors = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startDate = new Date(form.starts_at + "T00:00:00");
        const endDate = new Date(form.ends_at + "T00:00:00");
        return {
            title: !form.title.trim() ? "Job Title is Required" : "",
            description: !form.description.trim() ? "Job Description is Required" : "",
            category_id: !form.category_id ? "Job Category is Required" : "",
            price_type: !form.price_type ? "Price Type is Required" : "",
            price_min: !form.price_min ? "Minimum Price is Required" : "",
            price_max: !form.price_max ? "Maximum Price is Required" : "",
            price_range:
                form.price_min != null &&
                    form.price_max != null &&
                    form.price_max < form.price_min
                    ? "Maximum price cannot be less than minimum price"
                    : "",
            country: !form.country.trim() ? "Country is Required" : "",
            state: !form.state.trim() ? "State is Required" : "",
            city: !form.city.trim() ? "City is Required" : "",
            postal_code: !form.postal_code.trim() ? "Postal Code is Required" : "",
            street: !form.street.trim() ? "Street is Required" : "",
            lat: !form.lat ? "Latitude is Required" : "",
            lng: !form.lng ? "Longitude is Required" : "",
            starts_at: startDate < today ? "Start date cannot be before today" : "",
            ends_at: endDate < startDate ? "End date cannot be before start date" : "",
        };
    }, [form]);

    function update<T>(path: (draft: CreateJobData) => void) {
        setForm((prev) => {
            const draft: CreateJobData = JSON.parse(JSON.stringify(prev));
            path(draft);
            return draft;
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (Object.values(fieldErrors).some(Boolean)) return;
        // Call the mutation with form data
        createJobMutation.mutate(form, {
            onSuccess: () => {
                toast.success("Job created successfully!");
                setForm(initalForm);
                setSubmitted(false);
            },
            onError: (error: any) => {
                toast.error(error?.message || "Failed to create job");
            },
        });
    };




    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 rounded-2xl shadow space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Input label="Title" value={form?.title} onChange={(v) => update((d) => (d.title = v))} required error={submitted && fieldErrors.title||undefined} />
                </div>
                <div>
                    <Input label="Subtitle" value={form?.subtitle} onChange={(v) => update((d) => (d.subtitle = v))} />
                </div>
            </div>
            <div>
                <RichTextEditor
                    label="Description"
                    value={form?.description}
                    onChange={(v) => update((d) => (d.description = v))}
                    required
                    error={submitted && fieldErrors.description ||undefined}
                />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Select label="Job Category"
                        value={
                            collections?.jobCategories.find((c) => c.id === form.category_id) || null
                        }
                        onChange={(opt) => update((d) => (d.category_id = opt ? Number(opt.id) : null))}
                        options={collections?.jobCategories || []}
                        required
                        error={submitted && fieldErrors.category_id ||undefined}
                    />
                </div>

                <div>
                    <MultiSelect
                        label="Job Type"
                        options={collections?.jobType.map(type => ({ id: type, name: type })) || []}
                        values={form.job_type}
                        onChange={(selected) => update(d => d.job_type = selected)}
                    />

                </div>

            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <MultiSelect
                        label="Job Experience"
                        options={collections?.jobExperience.map(type => ({ id: type, name: type })) || []}
                        values={form.job_experience}
                        onChange={(selected) => update(d => d.job_experience = selected)}
                    />
                </div>

                <div>
                    <MultiSelect
                        label="Job Tags"
                        options={collections?.jobTags || []} // { id: number, name: string }
                        values={form.tag_ids}
                        onChange={(selected) => update(d => d.tag_ids = selected)}
                    />
                </div>
            </div>


            {/* Pricing */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <Input label="Price Type" value={form?.price_type} onChange={(v) => update((d) => (d.price_type = v))} required error={submitted && fieldErrors.price_type || undefined} />
                </div>
                <div>
                    <Input label="Min (€)" type="number" value={form?.price_min ?? ""} onChange={(v) => update((d) => (d.price_min = Number(v)))} required error={submitted && (fieldErrors.price_min || fieldErrors.price_range)||undefined} />
                </div>
                <div>

                    <Input label="Max (€)" type="number" value={form?.price_max ?? ""} onChange={(v) => update((d) => (d.price_max = Number(v)))} required error={submitted && (fieldErrors.price_max  || fieldErrors.price_range)||undefined} />
                </div>
            </div>



            {/* Dates */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div>

                    <DateInput label="Starts at" value={form.starts_at || ""} onChange={(v) => update((d) => (d.starts_at = v))} minDate={new Date()} error={fieldErrors.starts_at} />
                </div>
                <div>
                    <DateInput label="Ends at" value={form.ends_at || ""} onChange={(v) => update((d) => (d.ends_at = v))} minDate={form.starts_at ? new Date(form.starts_at) : new Date()} error={fieldErrors.ends_at} />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Input label="Country" value={form?.country} onChange={(v) => update((d) => (d.country = v))} required error={submitted && fieldErrors.country} />
                </div>
                <div>

                    <Input label="State" value={form?.state} onChange={(v) => update((d) => (d.state = v))} required error={submitted && fieldErrors.state} />
                </div>


            </div>
            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <Input label="Postcode" value={form?.postal_code} onChange={(v) => update((d) => (d.postal_code = v))} required error={submitted && fieldErrors.postal_code} />
                </div>
                <div>
                    <Input label="City" value={form?.city} onChange={(v) => update((d) => (d.city = v))} required error={submitted && fieldErrors.city} />
                </div>
                <div>

                    <Input label="Street" value={form?.street} onChange={(v) => update((d) => (d.street = v))} required error={submitted && fieldErrors.street} />
                </div>

            </div>

            <div className="grid sm:grid-cols-3 gap-4 items-end">
                <div>
                    <Input
                        type="number"
                        label="lat"
                        value={form?.lat}
                        onChange={(v) => update((d) => (d.lat = v))}
                        required
                        error={submitted && fieldErrors.lat}
                    />
                </div>
                <div>
                    <Input
                        type="number"
                        label="lng"
                        value={form?.lng}
                        onChange={(v) => update((d) => (d.lng = v))}
                        required
                        error={submitted && fieldErrors.lng}
                    />
                </div>
                {/* <div className="flex flex-col justify-end">
                    <button
                        type="button"
                        className="h-[40px] w-full rounded-xl border bg-gray-200 hover:bg-gray-300 text-sm px-3"
                        onClick={() => {
                            if (!navigator.geolocation) {
                                toast.error("Geolocation is not supported by your browser");
                                return;
                            }
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    update((d) => {
                                        d.lat = position.coords.latitude.toString();
                                        d.lng = position.coords.longitude.toString();
                                    });
                                    toast.success("Location set!");
                                },
                                (error) => {
                                    toast.error("Failed to get location: " + error.message);
                                }
                            );
                        }}
                    >
                        Get My Location
                    </button>
                </div> */}



            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="first_aid_verified"
                        checked={form.first_aid_verified}
                        onChange={(e) => update(d => d.first_aid_verified = e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label htmlFor="first_aid_verified" className="text-sm text-gray-700">
                        First Aid Verified
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="police_verified"
                        checked={form.police_verified}
                        onChange={(e) => update(d => d.police_verified = e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label htmlFor="police_verified" className="text-sm text-gray-700">
                        Police Verified
                    </label>
                </div>

                {/* <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="police_verified"
                        checked={form.verified}
                        onChange={(e) => update(d => d.verified = e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <label htmlFor="police_verified" className="text-sm text-gray-700">
                        ID Verified
                    </label>
                </div> */}
            </div>




            <div className="flex items-center justify-end ">
                {/* <div className="text-sm text-red-600">{errors[0] || ""}</div> */}
                <button
                    type="submit"
                    className={classNames(
                        "rounded-xl w-48 px-6 py-2 text-white font-medium transition bg-black hover:bg-gray-800",
                    )}
                // disabled={!!errors.length}
                >
                    Create Job
                </button>
            </div>

        </form>
    );
}















