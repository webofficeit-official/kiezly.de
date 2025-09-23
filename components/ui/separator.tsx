import React from "react";

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

/**
 * Separator component to visually divide content.
 * Default is horizontal line.
 */
export const Separator: React.FC<SeparatorProps> = ({ orientation = "horizontal", className, ...props }) => {
  const baseClasses = orientation === "horizontal"
    ? "w-full border-t border-gray-200"
    : "h-full border-l border-gray-200";

  return <hr className={`${baseClasses} ${className || ""}`} {...props} />;
};
