"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/ui/SearchableSelect";
import ProgressDisplay from "@/app/superadmin/_components/Sync/ProgressDisplay";
import PreLoader from "@/components/layout/PreLoader";
import { Button } from "@/components/ui/Button";
import { IconDownload, IconGamepad, IconSliders } from "@/components/ui/Icons";
import { TcgSet, SyncProgress } from "@/types/tcg";

// Caché en memoria persistente entre cambios de página (latencia 0ms)
const GLOBAL_SETS_CACHE: Record<string, TcgSet[]> = {};
let globalSettingsCache: Record<string, string> | null = null;

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

export default function SuperAdminImportEditionsPage() {
  const t = useTranslations("sync");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();

  const [selectedGameId, setSelectedGameId] = useState<string>("pokemon");
  const [destination, setDestination] = useState<string>("Singles Pokemon");
  const [sets, setSets] = useState<TcgSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSets, setLoadingSets] = useState<boolean>(false);

  // Progreso en tiempo real
  const [importProgress, setImportProgress] = useState<SyncProgress>({ current: 0, total: 0, active: false });
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const prevActiveRef = useRef<boolean>(false);

  // 1. Obtener categoría destino configurada al cambiar de juego
  useEffect(() => {
    const activeGame = SUPPORTED_GAMES.find((g) => g.id === selectedGameId);
    if (!activeGame) return;

    if (globalSettingsCache) {
      setDestination(globalSettingsCache[activeGame.settingKey] || activeGame.defaultCategory);
      return;
    }

    fetch(`${API_URL}/settings`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          globalSettingsCache = data;
          setDestination(data[activeGame.settingKey] || activeGame.defaultCategory);
        } else {
          setDestination(activeGame.defaultCategory);
        }
      })
      .catch(() => setDestination(activeGame.defaultCategory));
  }, [selectedGameId]);

  // 2. Cargar lista de sets oficiales del juego (Caché O(1) con 0ms de latencia)
  useEffect(() => {
    setSelectedSetId("ALL");

    if (GLOBAL_SETS_CACHE[selectedGameId]) {
      setSets(GLOBAL_SETS_CACHE[selectedGameId]);
      return;
    }

    setLoadingSets(true);
    fetch(`${API_URL}/sync/${selectedGameId}-sets`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const normalized: TcgSet[] = (Array.isArray(data) ? data : [])
          .map((s) => ({
            id: selectedGameId === "magic" ? s.code?.toLowerCase() || s.id : s.id || s.code || "",
            name: s.name || s.id || "",
            releaseDate: s.releaseDate || s.release_date,
          }))
          .filter((s) => Boolean(s.id));

        GLOBAL_SETS_CACHE[selectedGameId] = normalized;
        setSets(normalized);
      })
      .catch(() => setSets([]))
      .finally(() => setLoadingSets(false));
  }, [selectedGameId]);

  // 3. Polling de progreso de importación desacoplado de React Render
  const startPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/sync/status/${selectedGameId}`, { credentials: "include" });
        const data = await res.json();
        const imp = data?.import || { current: 0, total: 0, active: false };

        const wasActive = prevActiveRef.current;
        prevActiveRef.current = !!imp.active;
        setImportProgress(imp);

        if (wasActive && !imp.active) {
          showToast(t("toast_sync_success", { count: imp.total || 0 }), "success");
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setTimeout(() => {
            setImportProgress({ current: 0, total: 0, active: false });
          }, 3500);
        }
      } catch {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    }, 2000);
  }, [selectedGameId, showToast, t]);

  // Limpiar temporizador al cambiar de juego o desmontar
  useEffect(() => {
    fetch(`${API_URL}/sync/status/${selectedGameId}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const imp = data?.import || { current: 0, total: 0, active: false };
        prevActiveRef.current = !!imp.active;
        setImportProgress(imp);
        if (imp.active) startPolling();
      })
      .catch(() => {});

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [selectedGameId, startPolling]);

  // 4. Ejecutar importación
  const handleImport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sync/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game: destination,
          setId: selectedSetId,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Importación iniciada", "success");
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

  const setOptions = useMemo(
    () => [
      { label: `${t("all_editions_massive")} (${sets.length} ediciones)`, value: "ALL" },
      ...sets.map((s) => ({
        label: `${s.name} (${s.id.toUpperCase()})`,
        value: s.id,
      })),
    ],
    [sets, t]
  );

  return (
    <div className="p-6 space-y-6 pb-24 max-w-5xl">
      {loading && <PreLoader message={tCommon("loading")} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <IconDownload className="w-6 h-6 text-red" />
          Importar Ediciones Oficiales
        </h1>
        <p className="text-gray-4 text-sm mt-1">
          Descarga expansiones y cartas oficiales desde proveedores internacionales (Scrydex y Scryfall) para el Catálogo Maestro Global.
        </p>
      </div>

      {/* Tarjeta Principal de Configuración */}
      <div className="bg-[#0E121B] rounded-2xl p-6 border border-white/10 shadow-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Selector de Juego */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              Juego TCG a Sincronizar
            </label>
            <SearchableSelect
              options={gameOptions}
              value={selectedGameId}
              onChange={(val) => val && setSelectedGameId(val)}
              placeholder="Seleccionar juego..."
              disabled={importProgress.active}
            />
          </div>

          {/* Categoría Destino */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
              {t("configuredDestination")}
            </label>
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-[#080B12] text-sm font-bold text-red">
              <span>{destination}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red/10 border border-red/20 text-red">
                Destino Oficial
              </span>
            </div>
          </div>
        </div>

        {/* Selector de Edición */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">
            Edición Oficial del Proveedor
          </label>
          <SearchableSelect
            options={setOptions}
            value={selectedSetId}
            onChange={(val) => setSelectedSetId(val || "ALL")}
            placeholder={loadingSets ? "Cargando ediciones disponibles..." : t("select_expansion_placeholder")}
            disabled={loadingSets || importProgress.active}
          />
        </div>

        {/* Botón de Acción */}
        <div className="pt-2">
          <Button
            variant="danger"
            size="lg"
            fullWidth
            onClick={handleImport}
            disabled={importProgress.active || loadingSets}
            isLoading={importProgress.active}
            leftIcon={<IconDownload className="w-4 h-4" />}
            className="py-3.5 text-sm font-black shadow-xl shadow-red/20"
          >
            {importProgress.active
              ? t("inProgress")
              : selectedSetId === "ALL"
              ? `Importar Todas las Ediciones (${sets.length})`
              : "Importar Edición Seleccionada"}
          </Button>
        </div>

        {/* Visualización de Progreso */}
        <ProgressDisplay progress={importProgress} label={tCommon("importing")} />
      </div>
    </div>
  );
}

