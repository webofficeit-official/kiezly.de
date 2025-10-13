import React from "react";

interface WizardInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function WizardInput({ label, placeholder, value, onChange, error,required=false,disabled=false }: WizardInputProps) {
  return (
    <div className="mt-2 px-1.5 w-full">
      <label className="mb-2 ml-1 font-medium text-[0.75rem] text-slate-700 dark:text-white/80">
        {label}{required && <span className="text-red-600">*</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={
          `mb-4 focus:border-gray-500 focus:outline-none dark:bg-gray-950 
          dark:placeholder:text-white/80 dark:text-white/80 text-[0.875rem] leading-5.6 
          block w-full appearance-none rounded-lg border border-solid border-gray-300 bg-white
           bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 
           focus:border-[#e293d3] focus:outline-none
             ${error
            ? "border-red-500 bg-red-50 focus:border-red-500"
            : "border-gray-300 bg-white focus:border-[#e293d3]"
          }
           `}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
