import React from "react";

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className = "", disabled, ...props }, ref) => {
    const baseStyles = "w-full cursor-pointer rounded-xl border border-stroke bg-[#111318] py-2 px-3 text-sm text-gray-4 outline-none transition focus:border-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    
    const fileButtonStyles = "file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-blue hover:file:bg-blue/20 file:transition-all";

    return (
      <input
        type="file"
        ref={ref}
        disabled={disabled}
        className={`${baseStyles} ${fileButtonStyles} ${className}`}
        {...props}
      />
    );
  }
);

FileInput.displayName = "FileInput";
