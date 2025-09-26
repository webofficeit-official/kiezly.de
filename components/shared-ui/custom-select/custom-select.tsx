import { Listbox} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
export function Select<T extends { id: number; name: string, error?: string, required?: boolean }>({
    label,
    value,
    onChange,
    options,
    error,
    required
}: {
    label: string;
    value: T | null;
    onChange: (v: T | null) => void;
    options: T[];
    error?: string
    required?: boolean
}) {
    return (
        <div className="text-sm">
            <span className="mb-1 block text-gray-700">
                {label}
                {required && <span className="text-red-600">*</span>}
            </span>
            <Listbox value={value} onChange={onChange}>
                <div className="relative">
                    <Listbox.Button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black">
                        {value?.name || "Select"}
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Listbox.Button>

                    <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none">
                        {options.map((o) => (
                            <Listbox.Option
                                key={o.id}
                                value={o}
                                className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700 ui-active:bg-gray-100"
                            >
                                {({ selected }) => (
                                    <div className="flex items-center justify-between">
                                        <span>{o.name}</span>
                                        {selected && <Check className="h-4 w-4 text-gray-600" />}
                                    </div>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </div>
            </Listbox>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}