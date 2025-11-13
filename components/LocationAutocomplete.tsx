"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchLocationSuggestions,
  LocationSuggestion,
} from "@/lib/react-query/queries/locationSuggestions";

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type Props = {
  value?: string;
  onValueChange?: (v: string) => void;

  withCoords?: boolean;
  onlyOpen?: boolean;
  limit?: number;
  minChars?: number;
  onSelect?: (s: LocationSuggestion) => void;

  placeholder?: string;
  className?: string;
};

export default function LocationAutocomplete({
  value,
  onValueChange,
  withCoords = false,
  onlyOpen = true,
  limit = 10,
  minChars = 2,
  onSelect,
  placeholder = "Search city, state, country…",
  className,
}: Props) {
  
  const [inner, setInner] = React.useState("");
  const input = value ?? inner;

  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(0);

  const debounced = useDebouncedValue(input, 250);

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ["location-suggestions", debounced, withCoords, onlyOpen, limit],
    queryFn: ({ signal }) =>
      debounced.length >= minChars
        ? fetchLocationSuggestions(
            debounced,
            { withCoords, onlyOpen, limit },
            signal as AbortSignal
          )
        : Promise.resolve([]),
    staleTime: 30_000,
    enabled: debounced.length >= minChars,
  });

  
  const data: LocationSuggestion[] = Array.isArray(raw) ? raw : [];

  React.useEffect(() => setHighlight(0), [data.length]);

  
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!(e.target instanceof Node)) return;
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const listboxId = "location-autocomplete-listbox";

  function setText(v: string) {
    if (onValueChange) onValueChange(v);
    else setInner(v);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (data.length > 0) setHighlight((h) => Math.min(h + 1, data.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (data.length > 0) setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = data[highlight];
      if (item) select(item);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  function select(item: LocationSuggestion) {
    setText(item.label);
    setOpen(false);
    onSelect?.(item);
  }

  return (
    <div ref={rootRef} className={`relative w-full ${className ?? ""}`}>
      <input
        className="mt-2 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={placeholder}
        value={input}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        role="combobox"
        autoComplete="off"
      />

      {/* Keep panel open after search, even if 0 results */}
      {open && (isLoading || debounced.length >= minChars) && (
        <div
          id={listboxId}
          className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border bg-white shadow"
          role="listbox"
        >
          {isLoading && (
            <div className="px-3 py-2 text-sm text-gray-500">Searching…</div>
          )}

          {!isLoading &&
            data.map((s, i) => (
              <button
                key={`${s.label}-${i}`}
                role="option"
                aria-selected={i === highlight}
                className={`block w-full text-left px-3 py-2 hover:bg-gray-50 ${
                  i === highlight ? "bg-gray-100" : ""
                }`}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => e.preventDefault()} // keep focus in input
                onClick={() => select(s)}
              >
                <div className="text-sm font-medium">
                  {highlightMatch(s.label, debounced)}
                </div>
                {/* <div className="text-xs text-gray-500">{badgeForKind(s.kind)}</div> */}
                {"lat" in s && "lng" in s ? (
                  <div className="mt-1 text-[11px] text-gray-400">
                    ({(s as any).lat.toFixed(5)}, {(s as any).lng.toFixed(5)})
                  </div>
                ) : null}
              </button>
            ))}

          {!isLoading && data.length === 0 && debounced.length >= minChars && (
            <div className="px-3 py-2 text-sm text-gray-500">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}

function badgeForKind(kind: string) {
  const map: Record<string, string> = {
    city: "City",
    state: "State/Region",
    country: "Country",
    street: "Street",
    postal: "Postal code",
  };
  return map[kind] ?? kind;
}

function highlightMatch(label: string, term: string) {
  const idx = label.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return label;
  return (
    <>
      {label.slice(0, idx)}
      <mark className="rounded bg-yellow-100">
        {label.slice(idx, idx + term.length)}
      </mark>
      {label.slice(idx + term.length)}
    </>
  );
}
