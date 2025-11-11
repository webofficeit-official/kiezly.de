"use client";
import React from "react";

interface WizardNavigationProps {
  title: string;
  description: string;
  count: number;
  current?: boolean;
  finished?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function WizardNavigation({
  title,
  description,
  count,
  current = false,
  finished = false,
  disabled = false,
  onClick,
}: WizardNavigationProps) {
  const canClick = !!onClick && !disabled;

  return (
    <button
      type="button"
      onClick={canClick ? onClick : undefined}
      aria-disabled={disabled}
      className={[
        "w-full text-left rounded-xl p-2 transition",
        "flex flex-col items-center lg:flex-row lg:items-start lg:gap-3",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200",
      ].join(" ")}
    >
      {/* Step circle */}
      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-2 lg:mb-0">
        <span
          className={[
            "flex items-center justify-center rounded-full border w-8 h-8",
            finished ? "bg-black text-white border-black" : "",
            current && !finished ? "bg-gray-400 border-gray-400 text-white" : "",
            !current && !finished ? "border-black text-gray-900" : "",
          ].join(" ")}
        >
          {count}
        </span>
      </div>

      {/* Title & description */}
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-gray-900 text-sm">{title}</span>
        <span className="hidden lg:flex text-xs text-gray-600">{description}</span>
      </div>
    </button>
  );
}
