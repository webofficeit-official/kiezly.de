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
      {label && (
        <span className="mb-1.5 block text-[11px] font-semibold tracking-[.06em] uppercase" style={{ color: 'rgba(17,17,16,.4)' }}>
          {label}{required && <span style={{ color: '#e8622a' }}>*</span>}
        </span>
      )}

      <Popover className="relative">
        <Popover.Button
          className="flex w-full items-center justify-between gap-2 text-left outline-none transition-all"
          style={{
            borderRadius: '8px',
            border: value ? '1px solid rgba(232,98,42,.35)' : '1px solid rgba(0,0,0,.1)',
            background: value ? 'rgba(232,98,42,.04)' : '#f7f7f5',
            padding: '8px 10px',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: value ? '#e8622a' : 'rgba(17,17,16,.35)' }} />
            <span className="text-[12px] font-medium truncate" style={{ color: value ? '#111110' : 'rgba(17,17,16,.35)' }}>
              {value ? format(new Date(value), "dd.MM.yyyy") : "TT.MM.JJJJ"}
            </span>
          </div>
          {value && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(17,17,16,.12)', color: 'rgba(17,17,16,.6)' }}
            >
              <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                <line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </Popover.Button>

        <Popover.Panel
          className="absolute z-50 mt-2 w-[240px] p-3"
          style={{
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,.09)',
            background: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,.12)',
          }}
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setMonth(subMonths(month, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-[6px] transition-colors"
              style={{ border: '1px solid rgba(0,0,0,.08)', background: '#f7f7f5' }}
            >
              <ChevronLeft className="h-3.5 w-3.5" style={{ color: 'rgba(17,17,16,.6)' }} />
            </button>
            <span className="text-[13px] font-semibold text-[#111110]">{format(month, "MMMM yyyy")}</span>
            <button
              type="button"
              onClick={() => setMonth(addMonths(month, 1))}
              className="w-7 h-7 flex items-center justify-center rounded-[6px] transition-colors"
              style={{ border: '1px solid rgba(0,0,0,.08)', background: '#f7f7f5' }}
            >
              <ChevronRight className="h-3.5 w-3.5" style={{ color: 'rgba(17,17,16,.6)' }} />
            </button>
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-[10px] font-semibold py-1" style={{ color: 'rgba(17,17,16,.3)' }}>
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
              const isSelected = value && isSameDay(new Date(value), day);

              return (
                <button
                  type="button"
                  key={day.toISOString()}
                  onClick={() => !isDisabled && onChange(format(day, "yyyy-MM-dd"))}
                  disabled={isDisabled}
                  className="w-full aspect-square flex items-center justify-center rounded-[6px] text-[12px] font-medium transition-colors"
                  style={{
                    background: isSelected ? '#e8622a' : 'transparent',
                    color: isDisabled ? 'rgba(17,17,16,.2)' : isSelected ? '#fff' : '#111110',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                  }}
                  onMouseOver={e => { if (!isDisabled && !isSelected) (e.currentTarget as HTMLButtonElement).style.background = '#f7f7f5'; }}
                  onMouseOut={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </Popover.Panel>
      </Popover>
      {error && <p className="mt-1 text-[11px]" style={{ color: '#e8622a' }}>{error}</p>}
    </div>
  );
}
