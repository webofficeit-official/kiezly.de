import React from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface WizardRichTextProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function WizardRichText({ label, value, onChange, placeholder }: WizardRichTextProps) {
    return (
        <div className="mt-4 px-1.5 w-full">
            <label className="mb-2 ml-1 font-medium text-[0.75rem] text-slate-700 dark:text-white/80">
                {label}
            </label>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                className="w-full rounded-xl outline-none ring-0 focus-within:border-black [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-b [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[100px] [&_.ql-editor]:p-2"
                modules={{
                    toolbar: [
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["link", "image"],
                        ["clean"]
                    ],
                }}
            />
        </div>
    );
}
