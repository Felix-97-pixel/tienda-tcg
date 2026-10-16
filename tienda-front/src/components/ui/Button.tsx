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
  primary: "bg-gradient-to-r from-red-dark to-red text-white shadow-lg shadow-red/25 hover:shadow-red/40 hover:brightness-110 border border-red/30",
  secondary: "bg-[#0E121B] text-white/80 border border-white/10 hover:border-white/25 hover:text-white hover:bg-white/5 shadow-sm",
  outline: "bg-transparent border border-white/15 text-white/90 hover:border-red hover:text-red hover:bg-red/5 shadow-sm",
  danger: "bg-gradient-to-r from-red-dark to-red text-white shadow-lg shadow-red/30 hover:brightness-110 border border-red/40",
  success: "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-900/30 hover:brightness-110 border border-emerald-500/30",
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
