import { Listbox} from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
type MultiSelectOption<T extends string | number> = {
    id: T;
    name: string;
};

interface MultiSelectProps<T extends string | number> {
    label: string;
    options: MultiSelectOption<T>[];
    values: T[];
    onChange: (next: T[]) => void;
    required?: string;
    error?: string;
}

export default function MultiSelect<T extends string | number>({
    label,
    options,
    values,
    onChange,
    required,
    error
}: MultiSelectProps<T>) {
    return (
        <div className="text-sm">
            <span className="mb-1 block text-gray-700">
                {label}
                {required && <span className="text-red-600">*</span>}
            </span>
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
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}