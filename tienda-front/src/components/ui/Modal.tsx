import React, { useEffect } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "md",
  className = "" 
}) => {
  // Evitar scroll en el fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-[#07090E]/80 backdrop-blur-md transition-all">
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${maxWidthClasses[maxWidth]} rounded-3xl border border-white/10 bg-[#0E121B] p-6 md:p-8 shadow-2xl shadow-black ring-1 ring-white/5 animate-in zoom-in-95 duration-200 ${className}`}
        >
        {(title || onClose) && (
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
            {title ? (
              <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
            ) : (
              <div></div> /* Spacer si no hay titulo pero si boton de cerrar */
            )}
            
            {onClose && (
              <button 
                onClick={onClose} 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                type="button"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            )}
          </div>
        )}
        
        <div className="relative">
          {children}
        </div>
        </div>
      </div>
    </div>
  );
};
