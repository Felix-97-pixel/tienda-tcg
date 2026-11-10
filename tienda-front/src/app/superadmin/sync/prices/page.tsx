"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/ui/SearchableSelect";
import MultiSearchableSelect from "@/components/ui/MultiSearchableSelect";
import ProgressDisplay from "@/app/superadmin/_components/Sync/ProgressDisplay";
import PreLoader from "@/components/layout/PreLoader";
import { Button } from "@/components/ui/Button";
import { IconZap, IconBox } from "@/components/ui/Icons";
import { SyncProgress, ExpansionMeta } from "@/types/tcg";

// Caché en memoria persistente entre cambios de página
const GLOBAL_PRICE_EXPANSIONS_CACHE: Record<string, ExpansionMeta[]> = {};
let globalPriceSettingsCache: Record<string, string> | null = null;

interface SupportedGame {
  id: string;
  name: string;
  defaultCategory: string;
  settingKey: string;
}

const SUPPORTED_GAMES: SupportedGame[] = [
  { id: "pokemon", name: "Pokémon TCG", defaultCategory: "Singles Pokemon", settingKey: "pokemon_sync_destination" },
  { id: "magic", name: "Magic: The Gathering", defaultCategory: "Singles Magic The Gathering", settingKey: "mtg_sync_destination" },
  { id: "onepiece", name: "One Piece TCG", defaultCategory: "Singles One Piece", settingKey: "onepiece_sync_destination" },
  { id: "lorcana", name: "Disney Lorcana", defaultCategory: "Singles Lorcana", settingKey: "lorcana_sync_destination" },
  { id: "gundam", name: "Gundam Card Game", defaultCategory: "Singles Gundam", settingKey: "gundam_sync_destination" },
  { id: "riftbound", name: "Riftbound TCG", defaultCategory: "Singles Riftbound", settingKey: "riftbound_sync_destination" },
];

export default function SuperAdminSyncPricesPage() {
  const t = useTranslations("sync");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();

  const [selectedGameId, setSelectedGameId] = useState<string>("pokemon");
  const [destinationCategory, setDestinationCategory] = useState<string>("Singles Pokemon");
  const [expansions, setExpansions] = useState<ExpansionMeta[]>([]);
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingExpansions, setLoadingExpansions] = useState<boolean>(false);

  // Progreso en tiempo real
  const [priceProgress, setPriceProgress] = useState<SyncProgress>({ current: 0, total: 0, active: false });
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const prevActiveRef = useRef<boolean>(false);

  // 1. Obtener categoría asignada al juego (Caché local)
  useEffect(() => {
    const activeGame = SUPPORTED_GAMES.find((g) => g.id === selectedGameId);
    if (!activeGame) return;

    if (globalPriceSettingsCache) {
      setDestinationCategory(globalPriceSettingsCache[activeGame.settingKey] || activeGame.defaultCategory);
      return;
    }

    fetch(`${API_URL}/settings`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          globalPriceSettingsCache = data;
          setDestinationCategory(data[activeGame.settingKey] || activeGame.defaultCategory);
        } else {
          setDestinationCategory(activeGame.defaultCategory);
        }
      })
      .catch(() => setDestinationCategory(activeGame.defaultCategory));
  }, [selectedGameId]);

  // 2. Cargar expansiones locales existentes en BD (Caché O(1) con 0ms de latencia)
  useEffect(() => {
    setSelectedExpansions([]);

    if (GLOBAL_PRICE_EXPANSIONS_CACHE[destinationCategory]) {
      setExpansions(GLOBAL_PRICE_EXPANSIONS_CACHE[destinationCategory]);
      return;
    }

    setLoadingExpansions(true);
    fetch(`${API_URL}/products/meta/expansions?category=${encodeURIComponent(destinationCategory)}`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        GLOBAL_PRICE_EXPANSIONS_CACHE[destinationCategory] = list;
        setExpansions(list);
      })
      .catch(() => setExpansions([]))
      .finally(() => setLoadingExpansions(false));
  }, [destinationCategory]);

  // 3. Polling de progreso de actualización de precios
  const startPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/sync/status/${selectedGameId}`, { credentials: "include" });
        const data = await res.json();
        const pri = data?.price || { current: 0, total: 0, active: false };

        const wasActive = prevActiveRef.current;
        prevActiveRef.current = !!pri.active;
        setPriceProgress(pri);

        if (wasActive && !pri.active) {
          showToast("Precios de mercado actualizados con éxito", "success");
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setTimeout(() => {
            setPriceProgress({ current: 0, total: 0, active: false });
          }, 3500);
        }
      } catch {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    }, 2000);
  }, [selectedGameId, showToast]);

  // Limpiar temporizador al cambiar juego o desmontar
  useEffect(() => {
    fetch(`${API_URL}/sync/status/${selectedGameId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const pri = data?.price || { current: 0, total: 0, active: false };
        prevActiveRef.current = !!pri.active;
        setPriceProgress(pri);
        if (pri.active) startPolling();
      })
      .catch(() => {});

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [selectedGameId, startPolling]);

  // 4. Actualizar precios en lote
  const handleUpdatePrices = async () => {
    if (selectedExpansions.length === 0) {
      showToast("Debes seleccionar al menos una edición para actualizar", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/price-updater/sync-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: selectedGameId,
          expansions: selectedExpansions,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Actualización por lote iniciada", "success");
        startPolling();
      } else {
        const errMsg = data.error || (Array.isArray(data.message) ? data.message[0] : data.message) || "Ocurrió un error";
        showToast(errMsg, "error");
      }
    } catch {
      showToast("Error de red al conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const gameOptions = useMemo(
    () =>
      SUPPORTED_GAMES.map((g) => ({
        value: g.id,
        label: g.name,
      })),
    []
  );

  const expansionOptions = useMemo(
    () =>
      expansions.map((e) => ({
        value: e.name,
        label: e.name,
        count: e.products,
      })),
    [expansions]
  );

  return (
    <div className="p-6 space-y-6 pb-24 max-w-5xl">
      {loading && <PreLoader message={tCommon("loading")} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <IconZap className="w-6 h-6 text-red" />
          Actualizar Precios de Mercado Global
        </h1>
        <p className="text-gray-4 text-sm mt-1">
          Actualiza masivamente las cotizaciones de mercado oficial de TCGPlayer para las ediciones locales del Catálogo Maestro.
        </p>
      </div>

      {/* Tarjeta de Configuración y Selección Multi-Edición */}
      <div className="bg-[#0E121B] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Selector de Juego */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Juego TCG
            </label>
            <SearchableSelect
              options={gameOptions}
              value={selectedGameId}
              onChange={(val) => val && setSelectedGameId(val)}
              placeholder="Seleccionar juego..."
              disabled={priceProgress.active}
            />
          </div>

          {/* Categoría Asociada */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Categoría Asociada
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-[#080B12] text-sm font-bold text-white">
              <span>{destinationCategory}</span>
              <span className="text-[11px] font-mono text-emerald-400">
                {expansions.length} ediciones en BD
              </span>
            </div>
          </div>
        </div>

        {/* Selector Multi-Edición con Checkboxes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
              Ediciones Locales a Actualizar
            </label>
            {expansions.length > 0 && (
              <span className="text-[11px] text-white/40">
                {selectedExpansions.length === 0
                  ? "Sin selección (elige al menos una)"
                  : `${selectedExpansions.length} de ${expansions.length} seleccionadas`}
              </span>
            )}
          </div>

          {expansions.length === 0 && !loadingExpansions ? (
            <div className="p-3.5 rounded-xl bg-[#080B12] border border-white/10 text-xs text-white/40 flex items-center gap-2.5">
              <IconBox className="w-4 h-4 text-white/30 shrink-0" />
              <span>No hay ediciones registradas para este juego en la base de datos.</span>
            </div>
          ) : (
            <MultiSearchableSelect
              options={expansionOptions}
              selectedValues={selectedExpansions}
              onChange={setSelectedExpansions}
              placeholder={loadingExpansions ? "Cargando ediciones locales..." : "Seleccionar ediciones a actualizar..."}
              allLabel="Todas las ediciones"
              disabled={loadingExpansions || priceProgress.active}
            />
          )}
        </div>

        {/* Botón de Acción */}
        <div className="pt-2">
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={handleUpdatePrices}
            disabled={priceProgress.active || selectedExpansions.length === 0}
            isLoading={priceProgress.active}
            leftIcon={<IconZap className="w-4 h-4" />}
            className="py-3.5 text-sm font-black shadow-xl shadow-red/20"
          >
            {priceProgress.active
              ? t("inProgress")
              : selectedExpansions.length === 0
              ? "Selecciona al menos una edición"
              : selectedExpansions.length === expansions.length
              ? `Actualizar Todas las Ediciones (${expansions.length})`
              : `Actualizar Precios de ${selectedExpansions.length} ${selectedExpansions.length === 1 ? "Edición" : "Ediciones"}`}
          </Button>
        </div>

        {/* Visualización de Progreso */}
        <ProgressDisplay progress={priceProgress} label={t("updating_prices")} />
      </div>
    </div>
  );
}

