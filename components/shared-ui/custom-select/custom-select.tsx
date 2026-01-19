import { useState, useMemo } from "react";
import { Listbox } from "@headlessui/react";
import { Check, ChevronDown, Search } from "lucide-react";

export function Select<
  T extends { id: number; name: string; error?: string; required?: boolean }
>({
  label,
  value,
  onChange,
  options,
  error,
  required,
  searchable = false,      
  placeholder = "Select",
}: {
  label: string;
  value: T | null;
  onChange: (v: T | null) => void;
  options: T[];
  error?: string;
  required?: boolean;
  searchable?: boolean;       //  declare prop type
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    return options.filter((o) =>
      o.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query, searchable]);

  return (
    <div className="text-sm">
      <span className="mb-1 block text-gray-700">
        {label}
        {required && <span className="text-red-600">*</span>}
      </span>

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          {/* Trigger Button */}
          <Listbox.Button className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-black">
            {value?.name || placeholder}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Listbox.Button>

          {/* Options */}
          <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none">
            
            {/* Search Box */}
            {searchable && (
              <div className="sticky top-0 z-10 bg-white p-2 border-b border-gray-200">
                <div className="flex items-center rounded-md border border-gray-300 px-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className="ml-2 w-full border-none text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Filtered Options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o) => (
                <Listbox.Option
                  key={o.id}
                  value={o}
                  className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700 ui-active:bg-gray-100"
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span>{o.name}</span>
                      {selected && <Check className="h-4 w-4 text-gray-600" />}
                    </div>
                  )}
                </Listbox.Option>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                No results found
              </div>
            )}
          </Listbox.Options>
        </div>
      </Listbox>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
