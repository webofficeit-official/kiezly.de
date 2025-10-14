import { Listbox } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import React from "react";

interface Option {
  value: string;
  label: string;
}

interface WizardMultiSelectProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  width?: string;
  required?: boolean;
  error?: string;
}

export function WizardMultiSelect({
  label,
  values,
  onChange,
  options,
  width = "w-full",
  required = false,
  error
}: WizardMultiSelectProps) {
  const toggleValue = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className='mt-2 px-1.5 w-full'>
      <label className="mb-2 ml-1 font-medium text-[0.75rem] text-slate-700 dark:text-white/80">
        {label}{required && <span className="text-red-600">*</span>}
      </label>

      <Listbox as="div" value={values} onChange={() => { }} multiple>
        <div className="relative">
          <Listbox.Button
            className={`flex ${width} items-center justify-between rounded-lg border border-gray-300 bg-white 
            px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none 
            ${error
                ? "border-red-500 bg-red-50 focus:border-red-500"
                : "border-gray-300 bg-white focus:border-[#e293d3]"
              }
            dark:bg-gray-950 dark:text-white/80`}
          >
            {values.length > 0
              ? options
                .filter((o) => values.includes(o.value))
                .map((o) => o.label)
                .join(", ")
              : "Select"}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Listbox.Button>

          <Listbox.Options
            className={`absolute z-10 mt-2 max-h-60 ${width} overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg focus:outline-none dark:bg-gray-950`}
          >
            {options.map((o) => (
              <Listbox.Option
                key={o.value}
                value={o.value}
                as="div"
                className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700 ui-active:bg-gray-100 dark:text-white/80 dark:ui-active:bg-gray-800"
                onClick={() => toggleValue(o.value)}
              >
                <div className="flex items-center justify-between">
                  <span>{o.label}</span>
                  {values.includes(o.value) && <Check className="h-4 w-4 text-gray-600 dark:text-white" />}
                </div>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      {error && (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}
