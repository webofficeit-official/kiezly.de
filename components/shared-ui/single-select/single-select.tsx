import React, {useState } from "react";
import { Combobox } from "@headlessui/react";
import { ChevronsUpDownIcon } from "lucide-react";
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
    error?: string;
}

export function SingleSelect({
    label,
    value,
    onChange,
    options,
    required,
    placeholder = "Select one...",
    error
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
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
