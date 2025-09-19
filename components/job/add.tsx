"use client";
import React, { useState } from "react";
import { FaCheckCircle, FaTrash } from "react-icons/fa";
import { Listbox, Popover, } from "@headlessui/react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from "date-fns";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { Combobox } from "@headlessui/react";
import { ChevronsUpDownIcon } from "lucide-react";
import type { CreateJobData } from "@/lib/types/job";
import { useCreateJob, useJobCollections } from "@/lib/react-query/queries/useJob";
import toast from "react-hot-toast";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
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
    starts_at: new Date().toISOString().split("T")[0],
    ends_at: new Date().toISOString().split("T")[0],
    job_experience: [],
    job_type: [],
    first_aid_verified: false,
    police_verified: false,
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
    const [priceType, setPriceType] = React.useState([{ id: 1, name: "Fixed" }, { id: 1, name: "Hourly" }])

    const [form, setForm] = useState<CreateJobData>(initalForm);

    React.useEffect(() => {
        if (isError) {
            toast.error("Failed to load job collections");
        }
    }, [isError, error]);

    function update<T>(path: (draft: CreateJobData) => void) {
        setForm((prev) => {
            const draft: CreateJobData = JSON.parse(JSON.stringify(prev));
            path(draft);
            return draft;
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.preventDefault();

        // Call the mutation with form data
        createJobMutation.mutate(form, {
            onSuccess: () => {
                toast.success("Job created successfully!");
                setForm(initalForm)
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
                    value={
                        collections?.jobCategories.find((c) => c.id === form.category_id) || null
                    }
                    onChange={(opt) => update((d) => (d.category_id = opt ? Number(opt.id) : null))}
                    options={collections?.jobCategories || []}
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
                    <Input label="Min (€)" value={form?.price_min} onChange={(v) => update((d) => (d.price_min = Number(v)))} required />
                </div>
                <div>

                    <Input label="Max (€)" value={form?.price_max} onChange={(v) => update((d) => (d.price_max = Number(v)))} required />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <Input label="Country" value={form?.country} onChange={(v) => update((d) => (d.country = v))} required />
                </div>
                <div>

                    <Input label="State" value={form?.state} onChange={(v) => update((d) => (d.state = v))} required />
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

                    <DateInput label="Starts at" value={form.starts_at || ""} onChange={(v) => update((d) => (d.starts_at = v))} />
                </div>
                <div>
                    <DateInput label="Ends at" value={form.ends_at || ""} onChange={(v) => update((d) => (d.ends_at = v))} />
                </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
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
                        label="Job Type"
                        options={collections?.jobType.map(type => ({ id: type, name: type })) || []}
                        values={form.job_type}
                        onChange={(selected) => update(d => d.job_type = selected)}
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
        <>
            <label className="block text-sm">
                <span className="mb-1 block text-gray-700">
                    {label}
                    {required && <span className="text-red-600">*</span>}
                </span>
            </label>
            <div>
                <ReactQuill
                    theme="snow"
                    value={value}
                    onChange={onChange}
                    className="w-full rounded-xl  outline-none ring-0 focus-within:border-black
                                [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-b
                                [&_.ql-container]:rounded-b-xl
                                [&_.ql-editor]:min-h-[100px] [&_.ql-editor]:p-2"

                />
            </div>
        </>

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


type MultiSelectOption<T extends string | number> = {
    id: T;
    name: string;
};

interface MultiSelectProps<T extends string | number> {
    label: string;
    options: MultiSelectOption<T>[];
    values: T[];
    onChange: (next: T[]) => void;
}

function MultiSelect<T extends string | number>({
    label,
    options,
    values,
    onChange,
}: MultiSelectProps<T>) {
    return (
        <div className="text-sm">
            <span className="mb-1 block text-gray-700">{label}</span>
            <Listbox value={values} onChange={onChange} multiple>
                <div className="relative">
                    <Listbox.Button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20">
                        <span className="truncate">
                            {values.length
                                ? options
                                    .filter(o => values.includes(o.id))
                                    .map(o => o.name)
                                    .join(", ")
                                : "Select..."}
                        </span>
                        <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
                    </Listbox.Button>

                    <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none">
                        {options.map(opt => (
                            <Listbox.Option key={opt.id} value={opt.id}>
                                {({ selected }) => (
                                    <div
                                        className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                    >
                                        <span>{opt.name}</span>
                                        {selected && <Check className="h-4 w-4 text-black" />}
                                    </div>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </div>
            </Listbox>
        </div>
    );
}


function DateInput({
    label,
    value,
    onChange,
    required,
}: {
    label: string;
    value: string | null;
    onChange: (v: string) => void;
    required?: boolean;
}) {
    const [month, setMonth] = useState(new Date());

    const days = eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month),
    });

    return (
        <div className="block text-sm">
            <span className="mb-1 block text-gray-700">
                {label}
                {required && <span className="text-red-600">*</span>}
            </span>

            <Popover className="relative">
                <Popover.Button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-black">
                    {value ? format(new Date(value), "yyyy-MM-dd") : "Select date"}
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                </Popover.Button>

                <Popover.Panel className="absolute z-10 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                    {/* Month navigation */}
                    <div className="mb-2 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setMonth(subMonths(month, 1))}
                            className="rounded p-1 hover:bg-gray-100"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="font-medium">{format(month, "MMMM yyyy")}</span>
                        <button
                            type="button"
                            onClick={() => setMonth(addMonths(month, 1))}
                            className="rounded p-1 hover:bg-gray-100"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div key={d} className="font-medium text-gray-500">
                                {d}
                            </div>
                        ))}
                        {days.map((day) => (
                            <button
                                key={day.toISOString()}
                                onClick={() => onChange(format(day, "yyyy-MM-dd"))}
                                className={`rounded-lg px-2 py-1 text-sm hover:bg-gray-100 ${value && isSameDay(new Date(value), day)
                                    ? "bg-black text-white"
                                    : "text-gray-700"
                                    }`}
                            >
                                {format(day, "d")}
                            </button>
                        ))}
                    </div>
                </Popover.Panel>
            </Popover>
        </div>
    );
}