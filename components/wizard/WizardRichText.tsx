import React from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface WizardRichTextProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    labelClass?: string
}

export function WizardRichText({ label, value, onChange, placeholder, required = false, error, labelClass='px-1.5' }: WizardRichTextProps) {
    return (
        <div className={`mt-4 w-full ${labelClass}`}>
            <label className="mb-2 ml-1 font-medium text-[0.75rem] text-slate-700 dark:text-white/80">
                {label}{required && <span className="text-red-600">*</span>}
            </label>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                placeholder={placeholder?placeholder:"Start typing..."}
                className={`
                w-full rounded-xl outline-none ring-0 focus-within:border-black
                 [&_.ql-toolbar]:rounded-t-xl 
                 [&_.ql-toolbar]:border-b 
                 [&_.ql-container]:rounded-b-xl 
                 [&_.ql-editor]:min-h-[100px] 
                 [&_.ql-editor]:p-2
                 ${error
                        ? "[&_.ql-container]:border-red-500 [&_.ql-toolbar]:border-red-500 [&_.ql-editor]:bg-red-50"
                        : "[&_.ql-container]:border-gray-300 [&_.ql-toolbar]:border-gray-300"
                    }
                 `}
                modules={{
                    toolbar: [
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "image"],
                        ["clean"]
                    ],
                }}
            />
            {error && (
                <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
}
