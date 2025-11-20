import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Fragment, useState } from "react";

export function SelectWithFilter({
  label,
  value,
  onChange,
  options,
  labelClass = "mb-1 block text-sm font-medium text-gray-700",
  hideFilter = false
}: {
  label: string;
  labelClass: string;
  value: string;
  onChange: (v: string) => void;
  options: {
    id: string
    name: string
  }[];
  hideFilter?: boolean
}) {
  const [query, setQuery] = useState("");

  // Filtered options based on search query
  const filtered =
    query === ""
      ? options
      : options.filter((o) =>
        o.name.toLowerCase().includes(query.toLowerCase())
      );

  const selected = options.find((op) => op.id == value);

  return (
    <div className="text-sm">
      <label
        htmlFor={label}
        className={labelClass}
      >
        {label}
      </label>

      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button className="flex w-full items-center justify-between rounded-xl border border-gray-300 h-10 bg-white px-3 py-2 text-sm shadow-sm focus:border-black">
            {selected ? selected.name : "Select"}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-2 max-h-60 h-40 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none">
              {/* 🔍 Search input */}
              {
                !hideFilter &&
                <div className="sticky top-0 bg-white p-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 px-2 py-1.5">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full text-sm focus:outline-none"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>
              }

              {filtered.length === 0 && (
                <div className="px-3 py-2 text-gray-500 text-sm text-center">
                  No results
                </div>
              )}

              {filtered.map((o) => (
                <Listbox.Option
                  key={o.id}
                  value={o.id}
                  className="cursor-pointer select-none px-3 py-2 text-sm text-gray-700 ui-active:bg-gray-100"
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between">
                      <span>{o.name}</span>
                      {selected && <Check className="h-4 w-4 text-gray-600" />}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}