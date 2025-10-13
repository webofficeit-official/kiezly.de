"use client";
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

interface WizardInputSearchProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeValue: (value: string) => void;
  fetchOptions: (query: string) => Promise<
    { label: string; value: string; meta?: any }[]
  >;
  onSelectOption?: (option: any) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function WizardInputSearch({
  label,
  placeholder,
  value,
  onChangeValue,
  fetchOptions,
  onSelectOption,
  required = false,
  error,
  disabled = false,
}: WizardInputSearchProps) {
  const [options, setOptions] = useState<
    { label: string; value: string; meta?: any }[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Fetch ZIP options as user types ---
  const handleSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchOptions(query);
      setOptions(res);
      setShowDropdown(true);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Refetch only when typing while dropdown open ---
  useEffect(() => {
    if (showDropdown && value.trim().length > 1) {
      handleSearch(value);
    }
  }, [value]);

  return (
    <div className="mt-2 px-1.5 w-full relative">
      {/* Label */}
      <label className="mb-2 ml-1 font-medium text-[0.75rem] text-slate-700 dark:text-white/80">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            onChangeValue(e.target.value);
            handleSearch(e.target.value);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)} // close on blur
          className={`mb-1 focus:border-gray-500 focus:outline-none dark:bg-gray-950 
          text-[0.875rem] leading-5.6 block w-full rounded-lg border px-3 py-2 font-normal 
          text-gray-700 placeholder:text-gray-500 transition-all 
          ${
            error
              ? "border-red-500 bg-red-50 focus:border-red-500"
              : "border-gray-300 bg-white focus:border-[#e293d3]"
          }`}
        />
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Dropdown */}
      {showDropdown && options.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {loading ? (
            <li className="px-3 py-2 text-sm text-gray-500">Loading...</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.value}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChangeValue(opt.value);
                  setOptions([]); // clear results
                  setShowDropdown(false); // close dropdown
                  if (onSelectOption) onSelectOption(opt.meta);
                }}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}

      {/* Error */}
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
