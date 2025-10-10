import React, { useState } from "react";
import { Popover } from "@headlessui/react";
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

interface WizardDateInputProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
}

export function WizardDateInput({ label, value, onChange, required }: WizardDateInputProps) {
  const [month, setMonth] = useState(value ? new Date(value) : new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  return (
    <div className="mt-2 px-1.5 w-full text-sm">
      <label className="mb-2 ml-1 font-medium text-[0.75rem] text-slate-700 dark:text-white/80 flex items-center">
        {label} {required && <span className="ml-1 text-red-600">*</span>}
      </label>

      <Popover className="relative w-full">
        <Popover.Button className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black focus:outline-none dark:bg-gray-950 dark:text-white/80">
          {value ? format(new Date(value), "yyyy-MM-dd") : "Select date"}
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </Popover.Button>

        <Popover.Panel className="absolute z-10 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:bg-gray-900">
          {/* Month navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonth(subMonths(month, 1))}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium">{format(month, "MMMM yyyy")}</span>
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, 1))}
              className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="font-medium text-gray-500 dark:text-gray-400">{d}</div>
            ))}
            {days.map((day) => (
              <button
                key={day.toISOString()}
                onClick={() => onChange(format(day, "yyyy-MM-dd"))}
                className={`rounded-lg px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  value && isSameDay(new Date(value), day)
                    ? "bg-black text-white"
                    : "text-gray-700 dark:text-white/80"
                }`}
              >
                {format(day, "d")}
              </button>
            ))}
          </div>
        </Popover.Panel>
      </Popover>
    </div>
  );
}
