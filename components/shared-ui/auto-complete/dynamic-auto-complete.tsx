import { ZipOption } from "@/components/job/create";
import { useState } from "react";

interface DynamicAutocompleteProps {
    label: string;
    value: string;
    fetchOptions: (query: string) => Promise<ZipOption[]>;
    onSelectOption: (option: ZipOption) => void;
    placeholder?: string;
    onChangeValue: (val: string) => void;
    required?: boolean;
    error?: string;
}

export const DynamicAutocomplete: React.FC<DynamicAutocompleteProps> = ({
    label,
    value,
    fetchOptions,
    onSelectOption,
    placeholder,
    onChangeValue,
    required = false,
    error
}) => {
    const [options, setOptions] = useState<ZipOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false); // track input focus

    const handleInputChange = async (val: string) => {
        onChangeValue(val);
        if (val.length < 1) return; // wait for at least 2 chars
        setLoading(true);
        const result = await fetchOptions(val);
        setOptions(result);
        setLoading(false);
    };

    return (
        <div className="text-sm">
            <span className="mb-1 block text-gray-700">
                {label}
                {required && <span className="text-red-500">*</span>}
            </span>
            <div className="relative">
                <input
                    value={value}
                    onChange={e => handleInputChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 150)} // delay to allow click on list
                    placeholder={placeholder}
                    className="w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-black"
                />
                {isFocused && options.length > 0 && (
                    <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                        {options.map(opt => (
                            <li
                                key={opt.id}
                                onMouseDown={() => {
                                    // use onMouseDown instead of onClick to prevent blur
                                    onSelectOption(opt);
                                    onChangeValue(opt.zipcode);
                                    setOptions([]);
                                }}
                                className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                            >
                                {opt.zipcode} - {opt.street}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};
