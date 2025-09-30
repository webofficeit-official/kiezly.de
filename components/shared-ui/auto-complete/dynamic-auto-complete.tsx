import { useState } from "react";

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
                    <li key={opt.id} onClick={() => onSelectOption(opt)}>
                        {opt.zipcode} - {opt.street}
                    </li>
                ))}
            </ul>
        </div>
    );
};
