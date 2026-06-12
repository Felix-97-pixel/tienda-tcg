"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import PreLoader from "@/components/layout/PreLoader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import ProgressDisplay from "@/components/Sync/ProgressDisplay";
import { useTcgSync } from "@/hooks/useTcgSync";
import { Button } from "@/components/ui/Button";

export default function MagicSyncPage() {
  const t = useTranslations("sync");
  const tCommon = useTranslations("common");

  const [destination, setDestination] = useState("Singles Magic The Gathering");

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mtg_sync_destination) {
          setDestination(data.mtg_sync_destination);
        }
      })
      .catch(() => { });
  }, []);

  const sync = useTcgSync("magic", destination);
  const isAnyActive = sync.priceProgress.active || sync.importProgress.active;

  return (
    <div className="p-6 space-y-6 pb-24">
      {sync.loading && <PreLoader message={tCommon("loading")} />}

      <div>
        <h1 className="text-2xl font-bold text-white">Sincronización de Magic: The Gathering</h1>
        <p className="text-gray-4 text-sm mt-1">Importa y actualiza el catálogo y precios específicamente para Magic.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 max-w-6xl">
        {/* Card de Importación */}
        <div className="flex-1 bg-[#0f1115] rounded-2xl shadow-xl p-6 border border-white/5 border-t-4 border-blue flex flex-col">
          <div className="flex-1">
            <h2 className="font-bold text-white mb-1">{t("mtgjson.title")}</h2>
            <p className="text-xs text-gray-4 mb-4">{t("mtgjson.subtitle")}</p>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-gray-4">{t("configuredDestination")}</label>
              <div className="text-sm font-bold text-purple-400 bg-purple-500/10 p-2 rounded border border-purple-500/20">
                {destination}
              </div>
            </div>

            <SearchableSelect
              options={[
                { label: "⭐ TODAS LAS EDICIONES (Masivo)", value: "ALL" },
                ...sync.sets.map(s => ({
                  label: `${s.name} (${s.id.toUpperCase()})`,
                  value: s.id
                }))
              ]}
              value={sync.selectedSetId}
              onChange={sync.setSelectedSetId}
              placeholder={t("mtgjson.placeholder")}
            />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={sync.syncSet}
              disabled={isAnyActive}
              isLoading={sync.importProgress.active}
              fullWidth
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              {sync.importProgress.active ? t("inProgress") : t("mtgjson.button")}
            </Button>
          </div>

          <ProgressDisplay
            progress={sync.importProgress}
            label={tCommon("importing")}
          />
        </div>

        {/* Card de Precios */}
        <div className="flex-1 bg-[#0f1115] rounded-2xl shadow-xl p-6 border border-white/5 border-t-4 border-blue flex flex-col">
          <div className="flex-1">
            <h2 className="font-bold text-white mb-1">{t("cardkingdom.title")}</h2>
            <p className="text-xs text-gray-4 mb-4">{t("cardkingdom.subtitle")}</p>

            <SearchableSelect
              options={sync.expansionsList.map(e => ({
                label: `${e.name} (${e.products})`,
                value: e.name
              }))}
              value={sync.selectedExpansion}
              onChange={sync.setSelectedExpansion}
              placeholder={t("mtgjson.placeholder")}
            />
          </div>

          <Button
            disabled={isAnyActive}
            onClick={sync.syncPrices}
            isLoading={sync.priceProgress.active}
            fullWidth
            className="mt-4 bg-purple-600 hover:bg-purple-500 text-white"
          >
            {sync.priceProgress.active ? t("inProgress") : t("cardkingdom.button")}
          </Button>

          <ProgressDisplay
            progress={sync.priceProgress}
            label={tCommon("updating")}
          />
        </div>
      </div>
      
      {/* ESPACIO PARA FUTURAS FUNCIONES (Ej: Sincronizar Standard, Modern) */}
    </div>
  );
}
