import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { IconWrench, IconX } from "@/components/ui/Icons";

interface AutoMapModalProps {
  onClose: () => void;
  onSuccess: (mappedCount: number, remaining: number) => void;
}

export default function AutoMapModal({ onClose, onSuccess }: AutoMapModalProps) {
  const t = useTranslations("expansions_page");
  const { showToast } = useToast();
  const [selectedGame, setSelectedGame] = useState("Magic");
  const [loading, setLoading] = useState(false);

  const handleAutoMap = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/expansions/auto-map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: selectedGame }),
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.mapped, data.remaining);
      } else {
        showToast(t("err_automap"), "error");
      }
    } catch (err) {
      showToast(t("err_network"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#111318] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0f1115]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <IconWrench className="w-5 h-5 text-purple-500" />
            {t("automap_title")}
          </h3>
          <button onClick={onClose} className="text-gray-4 hover:text-white transition-colors">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-3 mb-6">
            {t("automap_desc")}
          </p>

          <label className="block text-sm font-medium text-gray-3 mb-2">
            {t("select_game_process")}
          </label>
          <select 
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-[#1a1d24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          >
            <option value="Magic">Magic: The Gathering</option>
            <option value="Pokemon">Pokémon TCG</option>
            <option value="Riftbound">Riftbound</option>
          </select>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#0f1115]">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("btn_cancel")}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAutoMap} 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 border-purple-500"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("processing_catalog")}
              </span>
            ) : t("start_automap")}
          </Button>
        </div>
      </div>
    </div>
  );
}
