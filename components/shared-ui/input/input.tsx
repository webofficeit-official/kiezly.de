export default function Input({ label, value, onChange, type = "text", required, placeholder, min, max }: {
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