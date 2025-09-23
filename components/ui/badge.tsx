import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "outline" | "secondary";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode;
    variant?: BadgeVariant;
    icon?: React.ReactNode;
    roundedFull?: boolean;
}

export function Badge({ children, variant = "default", icon, roundedFull = false, className, ...props }: BadgeProps) {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors";
    const roundedClass = roundedFull ? "rounded-full" : "rounded-lg";

    const variantClasses: Record<BadgeVariant, string> = {
        default: "bg-gray-100 text-gray-700",
        secondary: "bg-gray-50 text-gray-600 border border-gray-200",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-300",
        warning: "bg-yellow-50 text-yellow-700 border border-yellow-300",
        error: "bg-red-50 text-red-700 border border-red-300",
        outline: "border border-gray-300 text-gray-600 bg-transparent",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium transition-colors rounded-full 
  ${variant === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-300" : ""} 
  ${variant === "secondary" ? "bg-gray-50 text-gray-600 border border-gray-200" : ""}`}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </span>

    );
}
