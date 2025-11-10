import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
} from "date-fns";
import { useState } from "react";
import { Popover } from "@headlessui/react";
import dayjs from "dayjs";
export function DateInput({
  label,
  value,
  onChange,
  required,
  error,
  minDate,
  maxDate,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
  minDate?: Date; // <-- add this
  maxDate?: Date;
}) {
  const [month, setMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  return (
    <div className="block text-sm">
      <span className="mb-1 block text-gray-700">
        {label}
        {required && <span className="text-red-600">*</span>}
      </span>

      <Popover className="relative">
        <Popover.Button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-black">
          {value ? format(new Date(value), "yyyy-MM-dd") : "Select date"}
          <div className="flex items-center gap-1">
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening the calendar
                  onChange("");
                }}
                className="text-gray-400 hover:text-red-500 text-xs px-1"
              >
                ✕
              </button>
            )}
            <CalendarIcon className="h-4 w-4 text-gray-400" />
          </div>
        </Popover.Button>

        <Popover.Panel className="absolute z-10 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonth(subMonths(month, 1))}
              className="rounded p-1 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-medium">{format(month, "MMMM yyyy")}</span>
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, 1))}
              className="rounded p-1 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="font-medium text-gray-500">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const dayDate = dayjs(day).startOf("day");
              const min = minDate ? dayjs(minDate).startOf("day") : null;
              const max = maxDate ? dayjs(maxDate).startOf("day") : null;

              const isDisabled =
                (min ? dayDate.isBefore(min, "day") : false) ||
                (max ? dayDate.isAfter(max, "day") : false);

              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  onClick={() =>
                    !isDisabled && onChange(format(day, "yyyy-MM-dd"))
                  }
                  disabled={isDisabled}
                  className={`rounded-lg px-2 py-1 text-sm ${
                    isDisabled
                      ? "text-gray-300 cursor-not-allowed"
                      : value && isSameDay(new Date(value), day)
                      ? "bg-black text-white"
                      : "text-gray-700"
                  } hover:bg-gray-100`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </Popover.Panel>
      </Popover>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
