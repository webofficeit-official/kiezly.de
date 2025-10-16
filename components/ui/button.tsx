import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "outline" | "default" | "destructive";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors disabled:opacity-50 border";

    const styles =
      variant === "outline"
        ? "bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
        : variant === "destructive"
        ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
        : "bg-neutral-900 text-white border-neutral-900 hover:opacity-90";

    return (
      <button ref={ref} className={`${base} ${styles} ${className}`} {...props} />
    );
  }
);

Button.displayName = "Button";
