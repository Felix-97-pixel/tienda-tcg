"use client";
import React from "react";
import { useTranslations } from "next-intl";
import PreLoader from "@/components/layout/PreLoader";
import SearchableSelect from "@/components/ui/SearchableSelect";
import ProgressDisplay from "@/app/superadmin/_components/Sync/ProgressDisplay";
import { useLorcanaSync } from "@/app/superadmin/_components/Sync/hooks/useLorcanaSync";
import { Button } from "@/components/ui/Button";

export default function LorcanaSyncPage() {
  const t = useTranslations("sync");
  const tCommon = useTranslations("common");

  const sync = useLorcanaSync();
  const isAnyActive = sync.priceProgress.active || sync.importProgress.active;

  return (
    <div className="p-6 space-y-6 pb-24">
      {sync.loading && <PreLoader message={tCommon("loading")} />}

      <div>
        <h1 className="text-2xl font-bold text-white">{t("lorcana_title")}</h1>
        <p className="text-gray-4 text-sm mt-1">{t("lorcana_subtitle")}</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 max-w-6xl">
        {/* Card de Importación */}
        <div className="flex-1 bg-[#0f1115] rounded-2xl shadow-xl p-6 border border-white/5 border-t-4 border-indigo-500 flex flex-col">
          <div className="flex-1">
            <h2 className="font-bold text-white mb-1">{t("pokemon_import_title")}</h2>
            <p className="text-xs text-gray-4 mb-4">{t("lorcana_import_desc")}</p>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-gray-4">{t("configuredDestination")}</label>
              <div className="text-sm font-bold text-indigo-400 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
                {sync.destination}
              </div>
            </div>

            <SearchableSelect
              options={[
                { label: t("all_editions_massive"), value: "ALL" },
                ...sync.sets.map((s) => ({
                  label: `${s.name} (${s.id.toUpperCase()})`,
                  value: s.id,
                })),
              ]}
              value={sync.selectedSetId}
              onChange={sync.setSelectedSetId}
              placeholder={t("select_expansion_placeholder")}
            />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={sync.syncSet}
              disabled={isAnyActive}
              isLoading={sync.importProgress.active}
              fullWidth
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {sync.importProgress.active ? t("inProgress") : t("import_expansion_btn")}
            </Button>
          </div>

          <ProgressDisplay
            progress={sync.importProgress}
            label={tCommon("importing")}
          />
        </div>

        {/* Card de Precios */}
        <div className="flex-1 bg-[#0f1115] rounded-2xl shadow-xl p-6 border border-white/5 border-t-4 border-indigo-500 flex flex-col">
          <div className="flex-1">
            <h2 className="font-bold text-white mb-1">{t("update_prices_title")}</h2>
            <p className="text-xs text-gray-4 mb-4">{t("lorcana_prices_desc")}</p>

            <SearchableSelect
              options={sync.expansionsList.map((e) => ({
                label: `${e.name} (${e.products})`,
                value: e.name,
              }))}
              value={sync.selectedExpansion}
              onChange={sync.setSelectedExpansion}
              placeholder={t("select_local_expansion_placeholder")}
            />
          </div>

          <Button
            disabled={isAnyActive}
            onClick={sync.syncPrices}
            isLoading={sync.priceProgress.active}
            fullWidth
            className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            {sync.priceProgress.active ? t("inProgress") : t("update_prices_btn")}
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

