import React from "react";

// Utility function for class names
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// Props interface
interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

// Independent Switch component
const Switch: React.FC<SwitchProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={classNames(
          "h-6 w-11 rounded-full border p-0.5 text-left",
          checked ? "bg-black" : "bg-gray-200"
        )}
        aria-pressed={checked}
      >
        <span
          className={classNames(
            "block h-5 w-5 rounded-full bg-white transition",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
};

export default Switch;
