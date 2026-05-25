import React from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-br from-blue to-blue-dark text-white shadow-lg shadow-blue/30 hover:shadow-blue/50 hover:from-blue-dark hover:to-blue",
  secondary: "bg-gradient-to-b from-white to-gray-2 text-dark-4 border border-stroke hover:from-gray-1 hover:to-gray-3 shadow-sm",
  outline: "bg-white border-2 border-stroke text-dark-4 hover:border-blue hover:text-blue shadow-sm",
  danger: "bg-gradient-to-br from-red to-red-dark text-white shadow-lg shadow-red/30 hover:shadow-red/50 hover:from-red-dark hover:to-red",
  success: "bg-gradient-to-br from-green to-green-dark text-white shadow-lg shadow-green/30 hover:shadow-green/50 hover:from-green-dark hover:to-green",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-[10px]",
  md: "px-6 py-2.5 text-xs",
  lg: "px-10 py-3.5 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
