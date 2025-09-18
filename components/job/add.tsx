"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { useCollections } from "@/lib/react-query/queries/user/account";
import { Combobox } from "@headlessui/react";
import { ChevronsUpDownIcon } from "lucide-react";

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
};

const DEFAULT_JOB: JobFormValues = {
    title: "",
    subtitle: "",
    description: "",
    category_id: null,
    price_type: "fixed",
    price_value_min: "",
    price_value_max: "",
    // currency: "EUR",
    // country: "",
    // state: "",
    // city: "",
    // postal_code: "",
    // street: "",
    // lat: "",
    // lng: "",
    // starts_at: "",
    // ends_at: "",
    // job_type: "part_time",
    // job_experience: "junior",
    // first_aid_verified: false,
    // police_verified: false,
    // verified: false,
};




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
    });

    React.useEffect(() => {
        collections.mutate({}, {
            onSuccess: (data) => {
                console.log(data);
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
                    <Input label="City" value={form?.price_value_min} onChange={(v) => update((d) => (d.price_value_min = v))} required />
                </div>
                <div>

                    <Input label="Street" value={form?.price_value_max} onChange={(v) => update((d) => (d.price_value_max = v))} required />
                </div>

            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <Input label="Postcode" value={form?.price_value_min} onChange={(v) => update((d) => (d.price_value_min = v))} required />
                </div>
                <div>
                    <Input type="number" label="lat" value={form?.price_value_min} onChange={(v) => update((d) => (d.price_value_min = v))} required />
                </div>
                <div>

                    <Input type="number" label="lng" value={form?.price_value_max} onChange={(v) => update((d) => (d.price_value_max = v))} required />
                </div>
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
            <div className="rounded-xl  bg-white">
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    className="min-h-[120px] [&_.ql-editor]:min-h-[100px] [&_.ql-editor]:p-2"

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
                        onMouseEnter={() => setOpen(true)}   // 👈 open dropdown on hover
                        onFocus={() => setOpen(true)}        // 👈 open on focus
                        onMouseLeave={() => setOpen(false)}  // 👈 close when leaving
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
