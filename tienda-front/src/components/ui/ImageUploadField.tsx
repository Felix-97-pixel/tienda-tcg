"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { useImageUpload } from "@/hooks/useImageUpload";
import { IconUpload, IconImage, IconTrash, IconLoader, IconRefresh } from "@/components/ui/Icons";

export interface ImageUploadFieldProps {
  label?: string;
  value?: string | null;
  onChange: (url: string) => void;
  folder?: string;
  companyId?: string;
  storeId?: string;
  type?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
  folder = "stores",
  companyId,
  storeId,
  type = "logo",
  description = "Formatos: PNG, JPG, WEBP. Máximo 5MB.",
  disabled = false,
  className = "",
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, handleUpload, handleRemove } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await handleUpload(
      file,
      value || undefined,
      folder,
      { companyId, storeId, type }
    );

    if (uploadedUrl) {
      onChange(uploadedUrl);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value) return;

    await handleRemove(value);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTriggerInput = () => {
    if (!disabled && !isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-white/50">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#080B12] border border-white/10 group hover:border-white/20 transition-all">
          <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
            <Image
              src={value}
              alt={label || "Logo"}
              fill
              unoptimized
              className="object-contain p-1"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white/80 truncate">
              {value.split("/").pop() || "Imagen seleccionada"}
            </p>
            <p className="text-[11px] text-white/40 truncate mt-0.5">
              Almacenado en la nube
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerInput}
              disabled={disabled || isUploading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50"
              title="Cambiar imagen"
            >
              <IconRefresh className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || isUploading}
              className="p-2 rounded-xl bg-red/10 hover:bg-red/20 text-red hover:text-red-light transition-all disabled:opacity-50"
              title="Eliminar imagen"
            >
              <IconTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleTriggerInput}
          className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
            isUploading
              ? "border-red/40 bg-red/5 cursor-wait"
              : disabled
              ? "border-white/5 bg-white/5 opacity-50 cursor-not-allowed"
              : "border-white/10 bg-[#080B12] hover:border-red/40 hover:bg-white/[0.02]"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-center py-2">
              <IconLoader className="w-6 h-6 text-red animate-spin" />
              <span className="text-xs font-medium text-white/80">Subiendo imagen a la nube...</span>
              <span className="text-[10px] text-white/40">Optimizando y guardando en bucket seguro</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center py-1">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                <IconUpload className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold text-white/80">
                <span>Haz clic para subir imagen</span>
              </div>
              {description && (
                <span className="text-[10px] text-white/40">{description}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;

