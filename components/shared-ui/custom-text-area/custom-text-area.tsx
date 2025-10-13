export function Textarea({
    label,
    value,
    onChange,
    placeholder,
    disabled = false,
    id,
    name,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
    name?: string;
}) {
    return (
        <label className="block text-sm" htmlFor={id}>
            <span className="mb-1 block text-gray-700">{label}</span>
            <textarea
                id={id}
                name={name}
                className={`w-full rounded-xl border px-3 py-2 outline-none focus:border-black ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                rows={4}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            />
        </label>
    );
}