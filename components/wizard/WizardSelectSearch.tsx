"use client";
import React, { useState, useMemo } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown, Search } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface WizardSelectSearchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function WizardSelectSearch({
  label,
  value,
  onChange,
  options,
  required,
  error,
  disabled = false,
}: WizardSelectSearchProps) {
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query]);

  return (
    <div className="mt-2 px-1.5 w-full">
      {/* Label */}
      <label className="mb-2 ml-1 font-medium text-[0.75rem] text-slate-700 dark:text-white/80">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>

      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          {/* Button */}
          <Listbox.Button
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none ${
              error
                ? "border-red-500 bg-red-50 focus:border-red-500"
                : "border-gray-300 bg-white focus:border-black"
            } dark:bg-gray-950 dark:text-white/80 ${
              disabled ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {options.find((o) => o.value === value)?.label || "Select Country"}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Listbox.Button>

          {/* Options Dropdown */}
          <Listbox.Options className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-lg border border-gray-200 bg-white shadow-md focus:outline-none dark:bg-gray-950">
            {/* Sticky Search Bar */}
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-gray-50 px-2 py-1">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full border-none bg-transparent text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>

            {/* Country List */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <Listbox.Option
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer select-none px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 ui-active:bg-gray-100 dark:text-white/80 dark:ui-active:bg-gray-800"
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span>{opt.label}</span>
                      {selected && (
                        <Check className="h-4 w-4 text-gray-600 dark:text-white" />
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))
            ) : (
              <div className="px-3 py-2 text-xs text-gray-500">No results found</div>
            )}
          </Listbox.Options>
        </div>
      </Listbox>

      {/* Error Text */}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
