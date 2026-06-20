"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileInput } from "@/components/ui/FileInput";
import { useImageUpload } from "@/hooks/useImageUpload";

interface Game {
  id: string;
  name: string;
  logoUrl?: string | null;
  isActive: boolean;
}

interface GameFormModalProps {
  game?: Game | null;
  onClose: () => void;
  onSave: (data: Partial<Game>) => Promise<void>;
}

export default function GameFormModal({ game, onClose, onSave }: GameFormModalProps) {
  const { isUploading, handleUpload, handleRemove } = useImageUpload();
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name,
        logoUrl: game.logoUrl || "",
        isActive: game.isActive,
      });
    }
  }, [game]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await handleUpload(e.target.files[0], "games");
      if (url) {
        setFormData((prev) => ({ ...prev, logoUrl: url }));
      }
    }
  };

  const handleRemoveImage = async () => {
    if (formData.logoUrl) {
      const ok = await handleRemove(formData.logoUrl);
      if (ok) {
        setFormData((prev) => ({ ...prev, logoUrl: "" }));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111318] border border-stroke rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-stroke flex items-center justify-between">
          <h2 className="text-xl font-black text-white tracking-tight">
            {game ? "Editar Juego" : "Nuevo Juego"}
          </h2>
          <button onClick={onClose} className="text-gray-5 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
          <form id="game-form" onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Nombre del Juego"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Magic: The Gathering"
              required
            />

            <div>
              <label className="block text-sm font-bold text-gray-3 mb-2 uppercase tracking-wide">
                Logo del Juego
              </label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#111318] border border-stroke flex items-center justify-center">
                  {formData.logoUrl ? (
                    <div className="relative h-full w-full group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formData.logoUrl} alt="Logo" className="object-contain w-full h-full" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-white shadow-md hover:bg-red-dark transition-all opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-4 font-bold text-center">Sin Logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <FileInput
                    onChange={handleImageChange}
                    disabled={isUploading}
                    accept="image/*"
                  />
                  {isUploading && <p className="text-xs text-blue mt-2 animate-pulse">Subiendo imagen...</p>}
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group bg-[#1a1d24] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <div className="w-5 h-5 rounded border border-gray-5 bg-[#0f1115] peer-checked:bg-green-500 peer-checked:border-green-500 transition-colors flex items-center justify-center">
                  <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <div>
                <span className="block text-sm font-bold text-white uppercase">Estado Activo</span>
                <span className="block text-xs text-gray-4 mt-0.5">Si se desmarca, este juego no estará disponible para nuevas suscripciones.</span>
              </div>
            </label>
          </form>
        </div>

        <div className="p-6 border-t border-stroke bg-[#0f1115] flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="game-form" isLoading={saving} className="bg-blue hover:bg-blue-dark text-white">
            {game ? "Guardar Cambios" : "Crear Juego"}
          </Button>
        </div>
      </div>
    </div>
  );
}
