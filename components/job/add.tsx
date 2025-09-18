"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useCollections } from "@/lib/react-query/queries/user/account";
import { Combobox } from "@headlessui/react";
import { ChevronsUpDownIcon } from "lucide-react";
import Section from "../shared-ui/section/section";

// Dynamically import to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });



export type JobFormValues = {
    title: string;
    subtitle?: string;
    description?: string;
    category_id: number | null;
    price_type: string;
    price_value_min: string;
    price_value_max: string;
    currency: string;
    country: string;
    state: string;
    city: string;
    postal_code: string;
    street: string;
    lat: string;
    lng: string;
    starts_at: Date;
    ends_at: Date;
    job_experience: "junior" | "middle" | "experienced";
    job_type: "part_time" | "on_demand" | "full_time";
    first_aid_verified: boolean;
    police_verified: boolean;
    verified: boolean;

};

const DEFAULT_JOB: JobFormValues = {
    title: "",
    subtitle: "",
    description: "",
    category_id: null,
    price_type: "fixed",
    price_value_min: "",
    price_value_max: "",
    currency: "EUR",
    country: "",
    state: "",
    city: "",
    postal_code: "",
    street: "",
    lat: "",
    lng: "",
    starts_at: new Date(),
    ends_at: new Date(),
    job_experience: "junior",
    job_type: "part_time",
    first_aid_verified: false,
    police_verified: false,
    verified: false,
};

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
    const collections = useCollections();
    const [jobCategories, setJobCategories] = React.useState([])
    const [priceType, setPriceType] = React.useState([{ id: 1, name: "Fixed" }, { id: 1, name: "Hourly" }])
    const [form, setForm] = useState<JobFormValues>({
        title: "",
        subtitle: "",
        description: "",
        category_id: null,
        price_type: "",
        price_value_min: "",
        price_value_max: "",
        currency: "EUR",
        country: "",
        state: "",
        city: "",
        postal_code: "",
        street: "",
        lat: "",
        lng: "",
        starts_at: new Date(),
        ends_at: new Date(),
        job_experience: "junior",
        job_type: "part_time",
        first_aid_verified: false,
        police_verified: false,
        verified: false,
    });

    React.useEffect(() => {
        collections.mutate({}, {
            onSuccess: (data) => {
                setJobCategories(data.data.jobCategories)
            },
            onError: (err: any) => {
            }
        });
    }, [])

    function update<T>(path: (draft: JobFormValues) => void) {
        setForm((prev) => {
            const draft: JobFormValues = JSON.parse(JSON.stringify(prev));
            path(draft);
            return draft;
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        //    Api call here
    };



    return (
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6 rounded-2xl shadow space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Input label="Title" value={form?.title} onChange={(v) => update((d) => (d.title = v))} required />
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
                // required
                />
            </div>
            <div>
                <SingleSelect
                    label="Job Category"
                    placeholder="e.g. Cleaning, Babysitting, Gardening"
                    value={jobCategories.find((c) => c.id === form.category_id) || null}
                    onChange={(opt) => update((d) => (d.category_id = opt ? Number(opt.id) : null))}
                    options={jobCategories}
                />

            </div>


            {/* Pricing */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <SingleSelect
                        label="Price Type"
                        placeholder="e.g.hr,fixed"
                        value={priceType.find((c) => c.name === form?.price_type) || null}
                        onChange={(opt) => update((d) => (d.price_type = opt ? opt.name : null))}
                        options={priceType}
                    />
                </div>
                <div>
                    <Input label="Min (€)" value={form?.price_value_min} onChange={(v) => update((d) => (d.price_value_min = v))} required />
                </div>
                <div>

                    <Input label="Max (€)" value={form?.price_value_max} onChange={(v) => update((d) => (d.price_value_max = v))} required />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Input label="Country" value={form?.price_value_min} onChange={(v) => update((d) => (d.price_value_min = v))} required />
                </div>
                <div>

                    <Input label="State" value={form?.price_value_max} onChange={(v) => update((d) => (d.price_value_max = v))} required />
                </div>


            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Input label="City" value={form?.city} onChange={(v) => update((d) => (d.city = v))} required />
                </div>
                <div>

                    <Input label="Street" value={form?.street} onChange={(v) => update((d) => (d.street = v))} required />
                </div>

            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <Input label="Postcode" value={form?.postal_code} onChange={(v) => update((d) => (d.postal_code = v))} required />
                </div>
                <div>
                    <Input type="number" label="lat" value={form?.lat} onChange={(v) => update((d) => (d.lat = v))} required />
                </div>
                <div>

                    <Input type="number" label="lng" value={form?.lng} onChange={(v) => update((d) => (d.lng = v))} required />
                </div>
            </div>

            {/* Dates */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Input
                        label="Starts at"
                        type="date"
                        value={form?.lng}
                        onChange={(v) => update((d) => (d.lng = v))}
                    />
                </div>
                <div>
                    <Input
                        label="Ends at"
                        type="date"
                        value={form?.lng}
                        onChange={(v) => update((d) => (d.lng = v))}
                    />
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <SingleSelect
                        label="Job Experience"
                        placeholder="Select experience"
                        value={{ id: form.job_experience, name: form.job_experience }}
                        onChange={(opt) => update((d) => (d.job_experience = opt ? (opt.id as JobFormValues["job_experience"]) : "junior"))}
                        options={[
                            { id: "junior", name: "Junior" },
                            { id: "middle", name: "Middle" },
                            { id: "experienced", name: "Experienced" },
                        ]}
                    />
                </div>
                <div>
                    <SingleSelect
                        label="Job Type"
                        placeholder="Select type"
                        value={{ id: form.job_type, name: form.job_type.replace("_", " ") }}
                        onChange={(opt) => update((d) => (d.job_type = opt ? (opt.id as JobFormValues["job_type"]) : "part_time"))}
                        options={[
                            { id: "part_time", name: "Part Time" },
                            { id: "on_demand", name: "On Demand" },
                            { id: "full_time", name: "Full Time" },
                        ]}
                    />
                </div>
            </div>
            {/* <Section title="Verification">
                <div className="grid gap-4 sm:grid-cols-3">
                    <Switch
                        label="First Aid Verified"
                        checked={form.first_aid_verified}
                        onChange={(v) => update((d) => (d.first_aid_verified = v))}
                    />
                    <Switch
                        label="Police Verified"
                        checked={form.police_verified}
                        onChange={(v) => update((d) => (d.police_verified = v))}
                    />
                    <Switch
                        label="Verified"
                        checked={form.verified}
                        onChange={(v) => update((d) => (d.verified = v))}
                    />
                </div>
            </Section> */}

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

function Input({ label, value, onChange, type = "text", required, placeholder, min, max }: {
    label: string;
    value: any;
    onChange: (v: string) => void;
    type?: string;
    required?: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
}) {
    return (
        <label className="block text-sm">
            <span className="mb-1 block text-gray-700">{label}{required && <span className="text-red-600">*</span>}</span>
            <input
                className="w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-black"
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                min={min}
                max={max}
                required={required}
            />
        </label>
    );
}

type RichTextEditorProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
};

export function RichTextEditor({ label, value, onChange, required }: RichTextEditorProps) {
    return (
        <label className="block text-sm">
            <span className="mb-1 block text-gray-700">
                {label}
                {required && <span className="text-red-600">*</span>}
            </span>
            <div>
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    className=" rounded-xl border
                        [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-b
                        [&_.ql-container]:rounded-b-xl
                        [&_.ql-editor]:min-h-[100px] [&_.ql-editor]:p-2
                        focus-within:border-black"

                />
            </div>
        </label>
    );
}




type Option = {
    id: number | string;
    name: string;
};

interface SingleSelectProps {
    label: string;
    value: Option | null;
    onChange: (opt: Option | null) => void;
    options: Option[];
    required?: boolean;
    placeholder?: string;
}

export function SingleSelect({
    label,
    value,
    onChange,
    options,
    required,
    placeholder = "Select one...",
}: SingleSelectProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);

    const filtered =
        query === ""
            ? options
            : options.filter((opt) =>
                opt.name.toLowerCase().includes(query.toLowerCase())
            );

    return (
        <div>
            <label className="mb-1 block text-sm text-gray-700">
                {label}
                {required && <span className="text-red-600">*</span>}
            </label>
            <Combobox value={value} onChange={onChange}>
                <div className="relative">
                    <div
                        className="relative w-full cursor-default overflow-hidden rounded-xl border bg-white text-left shadow-sm focus-within:border-black"
                        onMouseEnter={() => setOpen(true)}
                        onFocus={() => setOpen(true)}
                        onMouseLeave={() => setOpen(false)}
                    >
                        <Combobox.Input
                            className="w-full border-none py-2 pl-3 pr-10 outline-none focus:ring-0 text-sm"
                            displayValue={(opt: Option) => opt?.name || ""}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={placeholder}
                            required={required}
                        />
                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronsUpDownIcon className="h-4 w-4 text-gray-400" />
                        </Combobox.Button>
                    </div>
                    {open && filtered.length > 0 && (
                        <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl border bg-white shadow-md">
                            {filtered.map((opt) => (
                                <Combobox.Option
                                    key={opt.id}
                                    value={opt}
                                    className={({ active }) =>
                                        `cursor-pointer px-3 py-2 text-sm ${active ? "bg-gray-100" : ""
                                        }`
                                    }
                                >
                                    {opt.name}
                                </Combobox.Option>
                            ))}
                        </Combobox.Options>
                    )}
                </div>
            </Combobox>
        </div>
    );
}


function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between rounded-xl border px-3 py-2">
            <span className="text-sm">{label}</span>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={classNames(
                    "h-6 w-11 rounded-full border p-0.5 text-left",
                    checked ? "bg-black" : "bg-gray-200"
                )}
                aria-pressed={checked}
            >
                <span
                    className={classNames(
                        "block h-5 w-5 rounded-full bg-white transition",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
}
