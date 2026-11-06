import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { IconX } from "@/components/ui/Icons";

interface LinkExpansionModalProps {
  expansion: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LinkExpansionModal({ expansion, onClose, onSuccess }: LinkExpansionModalProps) {
  const t = useTranslations("expansions_page");
  const { showToast } = useToast();
  const [remoteSets, setRemoteSets] = useState<any[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!expansion) return;
    const fetchSets = async () => {
      setLoadingSets(true);
      try {
        const res = await fetch(`${API_URL}/expansions/remote-sets?game=${encodeURIComponent(expansion.game)}`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setRemoteSets(data);
          
          // Preselect if it already has an externalId
          if (expansion.externalId) {
            setSelectedSetId(expansion.externalId);
          } else {
            // Try to auto-suggest
            const exactMatch = data.find((s: any) => s.name.toLowerCase() === expansion.name.toLowerCase());
            if (exactMatch) setSelectedSetId(exactMatch.id);
          }
        }
      } catch (err) {
        showToast("Error al cargar sets oficiales", "error");
      } finally {
        setLoadingSets(false);
      }
    };
    fetchSets();
  }, [expansion]);

  const handleSave = async () => {
    if (!selectedSetId) {
      showToast("Por favor selecciona un set de la lista", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/expansions/${expansion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId: selectedSetId }),
        credentials: "include"
      });

      if (res.ok) {
        onSuccess();
      } else {
        showToast("Error al guardar la vinculación", "error");
      }
    } catch (err) {
      showToast("Error de red", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredSets = remoteSets.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#111318] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0f1115]">
          <h3 className="text-xl font-bold text-white">
            {t("link_modal_title")}
          </h3>
          <button onClick={onClose} className="text-gray-4 hover:text-white transition-colors">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-blue/10 border border-blue/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue">
              {t("link_modal_info", { name: expansion.name, game: expansion.game })}
            </p>
            <p className="text-xs text-blue/80 mt-1">
              {t("link_modal_sub")}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-3 mb-1.5">
                {t("search_official_api")}
              </label>
              <input 
                type="text"
                placeholder={t("search_official_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red/50 mb-3"
              />
            </div>

            {loadingSets ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="bg-[#080B12] border border-white/10 rounded-xl max-h-60 overflow-y-auto divide-y divide-white/5">
                {filteredSets.length > 0 ? (
                  filteredSets.map(set => (
                    <label 
                      key={set.id} 
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors ${selectedSetId === set.id ? 'bg-red/10 text-white' : ''}`}
                    >
                      <input 
                        type="radio" 
                        name="officialSet" 
                        value={set.id}
                        checked={selectedSetId === set.id}
                        onChange={() => setSelectedSetId(set.id)}
                        className="w-4 h-4 text-blue bg-black/50 border-white/20 focus:ring-blue focus:ring-offset-[#1a1d24]"
                      />
                      <div>
                        <div className="text-sm font-semibold text-white">{set.name}</div>
                        <div className="text-xs font-mono text-gray-4 mt-0.5">ID: {set.id} {set.releaseDate && `• ${set.releaseDate}`}</div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-4 text-sm">
                    {t("no_sets_match")}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#0f1115]">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t("btn_cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !selectedSetId || loadingSets}>
            {saving ? t("saving_link") : t("save_link")}
          </Button>
        </div>
      </div>
    </div>
  );
}
