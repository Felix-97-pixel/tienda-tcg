"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileInput } from "@/components/ui/FileInput";
import { useImageUpload } from "@/hooks/useImageUpload";
import { IconX, IconCheck } from "@/components/ui/Icons";

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
  const t = useTranslations("games_page");
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
            {game ? t("modal_edit_title") : t("modal_new_title")}
          </h2>
          <button onClick={onClose} className="text-gray-5 hover:text-white transition-colors">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar flex-1">
          <form id="game-form" onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t("field_name")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Magic: The Gathering"
              required
            />

            <div>
              <label className="block text-sm font-bold text-gray-3 mb-2 uppercase tracking-wide">
                {t("field_logo")}
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
                        <IconX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-4 font-bold text-center">{t("no_logo")}</span>
                  )}
                </div>
                <div className="flex-1">
                  <FileInput
                    onChange={handleImageChange}
                    disabled={isUploading}
                    accept="image/*"
                  />
                  {isUploading && <p className="text-xs text-blue mt-2 animate-pulse">{t("uploading_image")}</p>}
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
                  <IconCheck className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <div>
                <span className="block text-sm font-bold text-white uppercase">{t("active_status_label")}</span>
                <span className="block text-xs text-gray-4 mt-0.5">{t("active_status_desc")}</span>
              </div>
            </label>
          </form>
        </div>

        <div className="p-6 border-t border-stroke bg-[#0f1115] flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t("btn_cancel")}
          </Button>
          <Button type="submit" form="game-form" isLoading={saving} className="bg-blue hover:bg-blue-dark text-white">
            {game ? t("btn_save_changes") : t("btn_create_game")}
          </Button>
        </div>
      </div>
    </div>
  );
}
