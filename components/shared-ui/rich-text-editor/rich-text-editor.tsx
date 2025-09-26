import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
type RichTextEditorProps = {
    label: string;
    value: string;
    onChange: (v: string) => void;
    required?: boolean;
    error?: string;
};

export function RichTextEditor({ label, value, onChange, required, error }: RichTextEditorProps) {
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
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            </div>
        </>

    );
}
