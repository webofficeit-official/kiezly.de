import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

export const buttonVariants = cva(
    "px-4 py-2 rounded-md font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-gray-100 text-black hover:bg-gray-200",
                destructive: "bg-red-600 text-white hover:bg-red-700",
                outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-8 px-3",
                lg: "h-12 px-6",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { }

export const Button: React.FC<ButtonProps> = ({ className, variant, size, ...props }) => {
    return <button className={buttonVariants({ variant, size, className })} {...props} />;
};
