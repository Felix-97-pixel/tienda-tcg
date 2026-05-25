import React, { useEffect } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
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
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
      <div 
        className={`w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-hide ${className}`}
      >
        {(title || onClose) && (
          <div className="flex justify-between items-center mb-6">
            {title ? (
              <h2 className="text-xl font-bold text-dark">{title}</h2>
            ) : (
              <div></div> /* Spacer si no hay titulo pero si boton de cerrar */
            )}
            
            {onClose && (
              <button 
                onClick={onClose} 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-1 text-dark-4 hover:bg-gray-2 hover:text-dark transition-all active:scale-95"
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
  );
};
