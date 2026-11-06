"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import { useToast } from "@/hooks/useToast";
import { useShippingProviders } from "@/app/admin/_components/Shipping/hooks/useShippingProviders";
import { adminFetch } from "@/utils/api";
import { useActiveBranch } from "@/hooks/useActiveBranch";
import ShippingProviderModal from "@/app/admin/_components/Shipping/ShippingProviderModal";
import { ShippingProvider } from "@/types/shippingProvider";
import {
  IconStore,
  IconMapPin,
  IconTruck,
  IconSettings,
} from "@/components/ui/Icons";

interface RegionData {
  id?: string;
  code: string;
  name: string;
  communes: { id?: string; code: string; name: string }[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export default function AdminShipping() {
  const t = useTranslations("admin.shipping_page");
  const { activeBranch, activeBranchId } = useActiveBranch();
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
          adminFetch("/shipping/locations"),
          adminFetch("/stores/me"),
        ]);

        if (locRes.ok) {
          const locData = await locRes.json();
          setRegions(locData);
        }

        if (storeRes.ok) {
          const storeData = await storeRes.json();
          setPickupEnabled(Boolean(storeData.pickupEnabled));
          setPickupAddress(storeData.pickupAddress || storeData.address || "");
          setPickupSchedule(storeData.pickupSchedule || t("default_schedule"));
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
  }, [activeBranchId, t]);

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

      const res = await adminFetch("/stores/me", { method: "PATCH", body: JSON.stringify({
          pickupEnabled,
          pickupAddress,
          pickupSchedule,
          originRegionId: targetRegion?.id,
          originCommuneId: targetCommune?.id,
        }) });

      if (!res.ok) {
        throw new Error(t("error_save"));
      }

      showToast(t("saved_success"), "success");
    } catch (err: any) {
      showToast(err.message || t("error_save"), "error");
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
            {t("badge")}
          </span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">{t("title")}</h1>
        <p className="text-xs text-white/40 mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Sección 1: Retiro en Tienda Física */}
        <div className="bg-[#0E121B] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 min-w-[40px] min-h-[40px] flex-shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <IconStore className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{t("pickup_title")}</h3>
                <p className="text-xs text-white/40">
                  {t("pickup_desc")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white/70">
                {pickupEnabled ? t("enabled") : t("disabled")}
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
                  {t("pickup_address_label")} <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  required={pickupEnabled}
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder={t("pickup_address_placeholder")}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-red focus:ring-1 focus:ring-red/30 outline-none transition"
                />
                <span className="text-[10px] text-white/30 mt-1 block">
                  {t("pickup_address_hint")}
                </span>
              </div>

              <div>
                <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-white/70">
                  {t("pickup_schedule_label")} <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  required={pickupEnabled}
                  value={pickupSchedule}
                  onChange={(e) => setPickupSchedule(e.target.value)}
                  placeholder={t("pickup_schedule_placeholder")}
                  className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-red focus:ring-1 focus:ring-red/30 outline-none transition"
                />
                <span className="text-[10px] text-white/30 mt-1 block">
                  {t("pickup_schedule_hint")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sección 2: Comuna de Origen de Despacho */}
        <div className="bg-[#0E121B] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 min-w-[40px] min-h-[40px] flex-shrink-0 rounded-xl bg-red/10 border border-red/25 flex items-center justify-center text-red">
              <IconMapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{t("origin_title")}</h3>
              <p className="text-xs text-white/40">
                {t("origin_desc")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-white/70">
                {t("origin_region_label")}
              </label>
              <SearchableSelect
                options={regionOptions}
                value={originRegionCode}
                onChange={handleRegionChange}
                placeholder={t("origin_region_placeholder")}
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-white/70">
                {t("origin_commune_label")}
              </label>
              <SearchableSelect
                options={communeOptions}
                value={originCommuneCode}
                onChange={setOriginCommuneCode}
                placeholder={t("origin_commune_placeholder")}
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Couriers Oficiales y Tarifas de Respaldo */}
        <div className="bg-[#0E121B] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 min-w-[40px] min-h-[40px] flex-shrink-0 rounded-xl bg-blue/10 border border-blue/25 flex items-center justify-center text-blue">
              <IconTruck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{t("couriers_title")}</h3>
              <p className="text-xs text-white/40">
                {t("couriers_desc")}
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
                      {t("starken_title")}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold mt-0.5 ${starkenProvider?.isActive ? "text-emerald-400" : "text-amber-400"
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${starkenProvider?.isActive
                            ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                            : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                          }`}
                      />
                      {starkenProvider?.isActive ? t("active_in_checkout") : t("paused")}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-white/40 bg-white/5 p-2 rounded-lg border border-white/5 group-hover:border-white/20 group-hover:text-white transition-colors">
                  <IconSettings className="w-4 h-4" />
                </span>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40">{t("fallback_flat_rate")}</span>
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
                      {t("chilexpress_title")}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold mt-0.5 ${chilexpressProvider?.isActive ? "text-emerald-400" : "text-amber-400"
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${chilexpressProvider?.isActive
                            ? "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                            : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                          }`}
                      />
                      {chilexpressProvider?.isActive ? t("active_in_checkout") : t("paused")}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 text-white/40 bg-white/5 p-2 rounded-lg border border-white/5 group-hover:border-white/20 group-hover:text-white transition-colors">
                  <IconSettings className="w-4 h-4" />
                </span>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-white/40">{t("fallback_flat_rate")}</span>
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
            {t("save_btn")}
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
