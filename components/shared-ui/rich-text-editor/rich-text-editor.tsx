"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill with a loading fallback
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="p-2 border rounded bg-gray-50 min-h-[100px]">
      Loading editor...
    </div>
  ),
});

type RichTextEditorProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
};

export function RichTextEditor({ label, value, onChange, required, error }: RichTextEditorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm mb-1 text-gray-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        className="w-full rounded-xl outline-none ring-0 focus-within:border-black
          [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-b
          [&_.ql-container]:rounded-b-xl
          [&_.ql-editor]:min-h-[100px] [&_.ql-editor]:p-2"
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
