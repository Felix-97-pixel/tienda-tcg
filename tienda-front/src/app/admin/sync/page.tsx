"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import PreLoader from "@/components/Common/PreLoader";
import SearchableSelect from "@/components/Common/SearchableSelect";
import ProgressDisplay from "@/components/Sync/ProgressDisplay";
import { useTcgSync } from "@/hooks/useTcgSync";

export default function AdminSync() {
  const t = useTranslations("sync");
  const tCommon = useTranslations("common");

  // Configuraciones de categorías (vienen de la DB)
  const [categories, setCategories] = useState({
    magic: "Singles Magic The Gathering",
    pokemon: "Singles Pokemon",
    riftbound: "Singles Riftbound",
  });

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        setCategories({
          magic: data.mtg_sync_destination || "Singles Magic The Gathering",
          pokemon: data.pokemon_sync_destination || "Singles Pokemon",
          riftbound: data.riftbound_sync_destination || "Singles Riftbound",
        });
      })
      .catch(() => {});
  }, []);
  // Usamos nuestro Hook personalizado para cada juego
  const magic = useTcgSync("magic", categories.magic);
  const pokemon = useTcgSync("pokemon", categories.pokemon);
  const riftbound = useTcgSync("riftbound", categories.riftbound);

  const isAnyActive = 
    magic.priceProgress.active || magic.importProgress.active || 
    pokemon.priceProgress.active || pokemon.importProgress.active || 
    riftbound.priceProgress.active || riftbound.importProgress.active;
    
  const anyLoading = magic.loading || pokemon.loading || riftbound.loading;

  const games = [
    { 
      id: "magic", 
      sync: magic, 
      title: t("mtgjson.title"), 
      subtitle: t("mtgjson.subtitle"), 
      priceTitle: t("cardkingdom.title"), 
      priceSubtitle: t("cardkingdom.subtitle"),
      priceBtn: t("cardkingdom.button"),
      importBtn: t("mtgjson.button"),
      placeholder: t("mtgjson.placeholder"),
      color: "border-blue" 
    },
    { 
      id: "pokemon", 
      sync: pokemon, 
      title: t("pokemon.title"), 
      subtitle: t("pokemon.subtitle"), 
      priceTitle: t("tcgplayer.title"), 
      priceSubtitle: t("tcgplayer.subtitle"),
      priceBtn: t("tcgplayer.button"),
      importBtn: t("pokemon.button"),
      placeholder: t("pokemon.placeholder"),
      color: "border-blue" 
    },
    { 
      id: "riftbound", 
      sync: riftbound, 
      title: t("riftbound.title"), 
      subtitle: t("riftbound.subtitle"), 
      priceTitle: t("riftboundPrice.title"), 
      priceSubtitle: t("riftboundPrice.subtitle"),
      priceBtn: t("riftboundPrice.button"),
      importBtn: t("riftbound.button"),
      placeholder: t("riftbound.placeholder"),
      color: "border-blue" 
    },
  ];

  const buttonClass = "w-full mt-4 bg-blue text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed";

  return (
    <div className="p-6 space-y-6 pb-24">
      {anyLoading && <PreLoader message={tCommon("loading")} />}

      <div>
        <h1 className="text-2xl font-bold text-dark">{t("title")}</h1>
        <p className="text-dark-4 text-sm mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {games.map((game) => (
          <React.Fragment key={game.id}>
            {/* Card de Importación de Edición */}
            <div className={`bg-white rounded-2xl shadow-1 p-6 border-l-4 ${game.color} flex flex-col`}>
              <div className="flex-1">
                <h2 className="font-bold text-dark mb-1">{game.title}</h2>
                <p className="text-xs text-dark-4 mb-4">{game.subtitle}</p>
                
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-dark-4">{t("configuredDestination")}</label>
                  <div className="text-sm font-bold text-blue bg-blue/5 p-2 rounded border border-blue/10">
                    {categories[game.id as keyof typeof categories]}
                  </div>
                </div>

                <SearchableSelect 
                  options={game.sync.sets.map(s => ({ 
                    label: game.id === 'magic' ? `${s.name} (${s.id.toUpperCase()})` : s.name, 
                    value: s.id 
                  }))} 
                  value={game.sync.selectedSetId} 
                  onChange={game.sync.setSelectedSetId} 
                  placeholder={game.placeholder} 
                />
              </div>
              
              <button 
                onClick={game.sync.syncSet} 
                disabled={isAnyActive}
                className={buttonClass}
              >
                {game.sync.importProgress.active ? t("inProgress") : game.importBtn}
              </button>

              <ProgressDisplay 
                progress={game.sync.importProgress} 
                label={tCommon("importing")} 
              />
            </div>

            {/* Card de Actualización de Precios */}
            <div className={`bg-white rounded-2xl shadow-1 p-6 border-l-4 ${game.color} flex flex-col`}>
              <div className="flex-1">
                <h2 className="font-bold text-dark mb-1">{game.priceTitle}</h2>
                <p className="text-xs text-dark-4 mb-4">{game.priceSubtitle}</p>
                
                <SearchableSelect 
                  options={game.sync.expansionsList.map(e => ({ 
                    label: `${e.name} (${e.products})`, 
                    value: e.name 
                  }))} 
                  value={game.sync.selectedExpansion} 
                  onChange={game.sync.setSelectedExpansion} 
                  placeholder={game.placeholder} 
                />
              </div>
              
              <button 
                disabled={isAnyActive}
                onClick={game.sync.syncPrices} 
                className={buttonClass}
              >
                {game.sync.priceProgress.active ? t("inProgress") : game.priceBtn}
              </button>
              
              <ProgressDisplay 
                progress={game.sync.priceProgress} 
                label={tCommon("updating")} 
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
