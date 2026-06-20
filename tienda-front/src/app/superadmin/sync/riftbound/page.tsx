"use client";
import React from "react";
import { useTranslations } from "next-intl";
import PreLoader from "@/components/layout/PreLoader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import ProgressDisplay from "@/components/Sync/ProgressDisplay";
import { useRiftboundSync } from "@/components/Admin/Sync/hooks/useRiftboundSync";
import { Button } from "@/components/ui/Button";

export default function RiftboundSyncPage() {
  const t = useTranslations("sync");
  const tCommon = useTranslations("common");

  const sync = useRiftboundSync();
  const isAnyActive = sync.priceProgress.active || sync.importProgress.active;

  return (
    <div className="p-6 space-y-6 pb-24">
      {sync.loading && <PreLoader message={tCommon("loading")} />}

      <div>
        <h1 className="text-2xl font-bold text-white">Sincronización de Riftbound</h1>
        <p className="text-gray-4 text-sm mt-1">Importa y actualiza el catálogo y precios específicamente para Riftbound.</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 max-w-6xl">
        {/* Card de Importación */}
        <div className="flex-1 bg-[#0f1115] rounded-2xl shadow-xl p-6 border border-white/5 border-t-4 border-cyan-500 flex flex-col">
          <div className="flex-1">
            <h2 className="font-bold text-white mb-1">Importar Expansiones</h2>
            <p className="text-xs text-gray-4 mb-4">Descarga expansiones desde la base de datos de Riftbound.</p>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-gray-4">{t("configuredDestination")}</label>
              <div className="text-sm font-bold text-cyan-500 bg-cyan-500/10 p-2 rounded border border-cyan-500/20">
                {sync.destination}
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
              placeholder="Seleccionar expansión..."
            />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={sync.syncSet}
              disabled={isAnyActive}
              isLoading={sync.importProgress.active}
              fullWidth
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {sync.importProgress.active ? t("inProgress") : "Importar Expansión"}
            </Button>
          </div>

          <ProgressDisplay
            progress={sync.importProgress}
            label={tCommon("importing")}
          />
        </div>

        {/* Card de Precios */}
        <div className="flex-1 bg-[#0f1115] rounded-2xl shadow-xl p-6 border border-white/5 border-t-4 border-cyan-500 flex flex-col">
          <div className="flex-1">
            <h2 className="font-bold text-white mb-1">Actualizar Precios</h2>
            <p className="text-xs text-gray-4 mb-4">Sincroniza precios de mercado en tiempo real.</p>

            <SearchableSelect
              options={sync.expansionsList.map(e => ({
                label: `${e.name} (${e.products})`,
                value: e.name
              }))}
              value={sync.selectedExpansion}
              onChange={sync.setSelectedExpansion}
              placeholder="Seleccionar expansión local..."
            />
          </div>

          <Button
            disabled={isAnyActive}
            onClick={sync.syncPrices}
            isLoading={sync.priceProgress.active}
            fullWidth
            className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white"
          >
            {sync.priceProgress.active ? t("inProgress") : "Actualizar Precios"}
          </Button>

          <ProgressDisplay
            progress={sync.priceProgress}
            label={tCommon("updating")}
          />
        </div>
      </div>
    </div>
  );
}
