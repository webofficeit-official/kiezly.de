import { Combobox } from "@headlessui/react";
import React from "react";
import { Zipcode } from "@/lib/react-query/queries/user/account";

interface ZipAutocompleteProps {
  label?: string;
  zip: string;
  setZip: (zip: string) => void;
  selectedObject: object;
  setSelectedObject: (setZip: object) => void;
  zipOptions: Zipcode[];
  onZipChange: (zip: string) => void; // triggered on typing
  placeholder?: string;
  labelClass?: string
  className?: string
}

export default function ZipAutocomplete({
  label = "ZIP",
  zip,
  setZip,
  selectedObject,
  setSelectedObject,
  zipOptions,
  onZipChange,
  placeholder = "Enter ZIP code",
  labelClass = "mb-1 block text-sm font-medium",
  className = "w-full rounded-xl border border-gray-300 px-3 py-2"
}: ZipAutocompleteProps) {
  return (
    <div className="w-full">
      <Combobox
        value={zip}
        onChange={(selected: string) => {
          setZip(selected);
          setSelectedObject(zipOptions.find((z) => z.zipcode === selected));
        }}
      >
        {label && (
          <Combobox.Label className={labelClass}>
            {label}
          </Combobox.Label>
        )}

        <div className="relative">
          <Combobox.Input
            className={className}
            onChange={(e) => onZipChange(e.target.value)}
            displayValue={(zip: string) => zip}
            placeholder={placeholder}
            autoComplete="off"
          />

          <Combobox.Options className="absolute z-10 mt-1 w-full overflow-auto rounded-xl bg-white border border-gray-300 shadow-lg text-sm">
            {zipOptions.length === 0 && zip !== "" ? (
              <></>
            ) : (
              zipOptions.map((z) => (
                <Combobox.Option
                  key={z.id}
                  value={z.zipcode}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-2`
                  }
                >
                  {z.zipcode} - {z.city || z.state}
                  
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
}
