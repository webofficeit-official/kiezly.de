import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import React from "react";

interface Option {
  value: string;
  label: string;
}

interface WizardSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  width?: string; // e.g., "w-full"
}

export function WizardSelect({
  label,
  value,
  onChange,
  options,
  width = "w-full",
}: WizardSelectProps) {
  return (
    <div className="mt-2 px-1.5 w-full">
      <label className="mb-2 ml-1 font-medium text-[0.75rem] text-slate-700 dark:text-white/80">
        {label}
      </label>

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={`flex ${width} items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none dark:bg-gray-950 dark:text-white/80`}
          >
            {options.find((o) => o.value === value)?.label || "Select"}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Listbox.Button>

          <Listbox.Options
            className={`absolute z-10 mt-2 max-h-60 ${width} overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg focus:outline-none dark:bg-gray-950`}
          >
            {options.map((o) => (
              <Listbox.Option
                key={o.value}
                value={o.value}
                className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700 ui-active:bg-gray-100 dark:text-white/80 dark:ui-active:bg-gray-800"
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span>{o.label}</span>
                    {selected && <Check className="h-4 w-4 text-gray-600 dark:text-white" />}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
