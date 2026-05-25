import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full rounded border bg-transparent py-2.5 px-4 text-sm outline-none transition focus:border-primary disabled:bg-gray-2 ${
          error ? "border-red focus:border-red" : "border-stroke"
        } ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
