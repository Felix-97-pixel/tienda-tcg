"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import { useToast } from "@/hooks/useToast";
import { useShippingProviders } from "@/app/admin/_components/Shipping/hooks/useShippingProviders";
import ShippingProviderModal from "@/app/admin/_components/Shipping/ShippingProviderModal";
import { ShippingProvider } from "@/types/shippingProvider";

interface RegionData {
  id?: string;
  code: string;
  name: string;
  communes: { id?: string; code: string; name: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export default function AdminShipping() {
  const { showToast } = useToast();
  const { providers, loading: loadingProviders, refresh } = useShippingProviders();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal para configurar tarifa plana / respaldo de un proveedor
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ShippingProvider | null>(null);

  // Form states de la tienda
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupSchedule, setPickupSchedule] = useState("");
  const [originRegionCode, setOriginRegionCode] = useState("RM");
  const [originCommuneCode, setOriginCommuneCode] = useState("SANTIAGO");

  // Catálogo de ubicaciones
  const [regions, setRegions] = useState<RegionData[]>([]);

  const openProviderModal = (provider: ShippingProvider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  // Cargar datos de la tienda y regiones
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [locRes, storeRes] = await Promise.all([
          fetch(`${API_URL}/shipping/locations`),
          fetch(`${API_URL}/stores/me`, { credentials: "include" }),
        ]);

        if (locRes.ok) {
          const locData = await locRes.json();
          setRegions(locData);
        }

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setPickupEnabled(Boolean(storeData.pickupEnabled));
          setPickupAddress(storeData.pickupAddress || storeData.address || "");
          setPickupSchedule(storeData.pickupSchedule || "Lunes a Viernes 12:00 a 19:30 hrs");
          if (storeData.originRegion?.code) {
            setOriginRegionCode(storeData.originRegion.code);
          } else if (storeData.originRegionCode) {
            setOriginRegionCode(storeData.originRegionCode);
          }

          if (storeData.originCommune?.code) {
            setOriginCommuneCode(storeData.originCommune.code);
          } else if (storeData.originCommuneCode) {
            setOriginCommuneCode(storeData.originCommuneCode);
          }
        }
      } catch (err) {
        console.error("Error al cargar configuración de envíos:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const currentRegion = regions.find((r) => r.code === originRegionCode) || regions[0];
  const regionOptions = regions.map((r) => ({ label: r.name, value: r.code }));
  const communeOptions = (currentRegion?.communes || []).map((c) => ({
    label: c.name,
    value: c.code,
  }));

  const handleRegionChange = (newRegionCode: string) => {
    setOriginRegionCode(newRegionCode);
    const reg = regions.find((r) => r.code === newRegionCode);
    if (reg?.communes && reg.communes.length > 0) {
      setOriginCommuneCode(reg.communes[0].code);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const targetRegion = regions.find((r) => r.code === originRegionCode);
      const targetCommune = targetRegion?.communes.find((c) => c.code === originCommuneCode);

      const res = await fetch(`${API_URL}/stores/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pickupEnabled,
          pickupAddress,
          pickupSchedule,
          originRegionId: targetRegion?.id,
          originCommuneId: targetCommune?.id,
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo guardar la configuración.");
      }

      showToast("Configuración de despacho guardada exitosamente", "success");
    } catch (err: any) {
      showToast(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const starkenProvider = providers.find((p) => p.name.toUpperCase() === "STARKEN");
  const chilexpressProvider = providers.find((p) => p.name.toUpperCase() === "CHILEXPRESS");

  if (loading) {
    return (
      <div className="w-full h-72 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 text-white max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-3 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red">
            Logística & Despachos
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Métodos de Envío</h1>
        <p className="text-xs text-white/40 mt-0.5">
          Configura tus puntos de retiro físico, tu comuna de despacho para cotización automática y las tarifas planas de respaldo.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Sección 1: Retiro en Tienda Física */}
        <div className="bg-[#0E121B] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 min-w-[40px] min-h-[40px] flex-shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Retiro en Tienda Física (Pick-up)</h3>
                <p className="text-xs text-white/40">
                  Permite a tus clientes recoger sus cartas en tu local sin costo de envío ($0 CLP).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white/70">
                {pickupEnabled ? "Habilitado" : "Deshabilitado"}
              </span>
              <Switch
                checked={pickupEnabled}
                onChange={(e) => setPickupEnabled(e.target.checked)}
                wrapperClassName="!p-0 !border-0 !bg-transparent"
              />
            </div>
          </div>

          {pickupEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in fade-in duration-300">
              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-white/70">
                  Dirección Física de Retiro <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  required={pickupEnabled}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Ej: Av. Providencia 2237, Local 45, Providencia"
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-red focus:ring-1 focus:ring-red/30 outline-none transition"
                />
                <span className="text-[10px] text-white/30 mt-1 block">
                  Esta dirección aparecerá en el resumen del checkout y en el correo de confirmación del cliente.
                </span>
              </div>

              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-white/70">
                  Horarios de Atención al Cliente <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  required={pickupEnabled}
                  value={pickupSchedule}
                  onChange={(e) => setPickupSchedule(e.target.value)}
                  placeholder="Ej: Lunes a Viernes 12:00 a 19:30, Sábado 11:00 a 16:00"
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-red focus:ring-1 focus:ring-red/30 outline-none transition"
                />
                <span className="text-[10px] text-white/30 mt-1 block">
                  Indica los días y franjas horarias en que tu personal puede entregar pedidos en el mostrador.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sección 2: Comuna de Origen de Despacho */}
        <div className="bg-[#0E121B] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 min-w-[40px] min-h-[40px] flex-shrink-0 rounded-xl bg-red/10 border border-red/25 flex items-center justify-center text-red">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Comuna de Origen para Cotizaciones</h3>
              <p className="text-xs text-white/40">
                Punto geográfico de partida oficial para calcular las tarifas dinámicas de Starken y Chilexpress hacia los compradores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-white/70">
                Región de Origen
              </label>
              <SearchableSelect
                options={regionOptions}
                value={originRegionCode}
                onChange={handleRegionChange}
                placeholder="Selecciona la región..."
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-white/70">
                Comuna de Origen
              </label>
              <SearchableSelect
                options={communeOptions}
                value={originCommuneCode}
                onChange={setOriginCommuneCode}
                placeholder="Selecciona la comuna..."
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Couriers Oficiales y Tarifas de Respaldo */}
        <div className="bg-[#0E121B] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 min-w-[40px] min-h-[40px] flex-shrink-0 rounded-xl bg-blue/10 border border-blue/25 flex items-center justify-center text-blue">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Couriers Oficiales & Tarifas de Respaldo</h3>
              <p className="text-xs text-white/40">
                Haz clic en cualquier courier para modificar su <strong>tarifa plana de respaldo</strong> o activarlo/desactivarlo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Starken Card */}
            <div
              onClick={() => starkenProvider && openProviderModal(starkenProvider)}
              className="group bg-[#080B12] border border-white/10 hover:border-white/25 rounded-2xl p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all hover:bg-[#0B0F19] shadow-sm relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0"><ShippingBadge name="starken" size="md" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                      Starken Domicilio & Agencia
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold mt-0.5 ${
                        starkenProvider?.isActive ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          starkenProvider?.isActive
                            ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                            : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                        }`}
                      />
                      {starkenProvider?.isActive ? "Activo en Checkout" : "Pausado"}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 group-hover:border-white/20 group-hover:text-white transition-colors">
                  Editar ⚙️
                </span>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40">Tarifa fija de respaldo:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${Number(starkenProvider?.price || 6990).toLocaleString("es-CL")} CLP
                </span>
              </div>
            </div>

            {/* Chilexpress Card */}
            <div
              onClick={() => chilexpressProvider && openProviderModal(chilexpressProvider)}
              className="group bg-[#080B12] border border-white/10 hover:border-white/25 rounded-2xl p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all hover:bg-[#0B0F19] shadow-sm relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0"><ShippingBadge name="chilexpress" size="md" /></div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-white transition-colors">
                      Chilexpress Express Prioritario
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold mt-0.5 ${
                        chilexpressProvider?.isActive ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          chilexpressProvider?.isActive
                            ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                            : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                        }`}
                      />
                      {chilexpressProvider?.isActive ? "Activo en Checkout" : "Pausado"}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 group-hover:border-white/20 group-hover:text-white transition-colors">
                  Editar ⚙️
                </span>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40">Tarifa fija de respaldo:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${Number(chilexpressProvider?.price || 9990).toLocaleString("es-CL")} CLP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Guardado General */}
        <div className="flex justify-end">
          <Button variant="primary" size="lg" type="submit" isLoading={saving}>
            Guardar Configuración de Despacho
          </Button>
        </div>
      </form>

      {/* Modal para configurar la tarifa de cada courier */}
      <ShippingProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={selectedProvider}
        onSuccess={refresh}
      />
    </div>
  );
}
