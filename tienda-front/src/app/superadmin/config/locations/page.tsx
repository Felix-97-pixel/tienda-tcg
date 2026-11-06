"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { IconPencil, IconTrash } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Switch } from "@/components/ui/Switch";
import { List, Column } from "@/components/ui/List";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

interface LogisticZone {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count?: { regions: number; communes: number };
}

interface Region {
  id: string;
  code: string;
  name: string;
  shortName: string | null;
  zoneId: string | null;
  zone?: LogisticZone | null;
  ordinal: number;
  isActive: boolean;
  _count?: { communes: number; stores: number };
}

interface Commune {
  id: string;
  code: string;
  name: string;
  regionId: string;
  zoneId: string | null;
  zone?: LogisticZone | null;
  isActive: boolean;
  region?: { id: string; code: string; name: string };
}

export default function LocationsAdminPage() {
  const t = useTranslations("locations_page");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"regions" | "communes" | "zones">("regions");
  const [zones, setZones] = useState<LogisticZone[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for communes
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>("all");
  const [communeSearch, setCommuneSearch] = useState<string>("");

  // Zone Modal State
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<LogisticZone | null>(null);
  const [zoneForm, setZoneForm] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });

  // Region Modal State
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [regionForm, setRegionForm] = useState({
    code: "",
    name: "",
    shortName: "",
    zoneId: "",
    ordinal: 1,
    isActive: true,
  });

  // Commune Modal State
  const [isCommuneModalOpen, setIsCommuneModalOpen] = useState(false);
  const [editingCommune, setEditingCommune] = useState<Commune | null>(null);
  const [communeForm, setCommuneForm] = useState({
    code: "",
    name: "",
    regionId: "",
    zoneId: "",
    isActive: true,
  });

  const [saving, setSaving] = useState(false);

  // Fetch Zones
  const fetchZones = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/locations/admin/zones`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setZones(data);
      }
    } catch (err) {
      console.error("Error fetching zones:", err);
    }
  }, []);

  // Fetch Regions
  const fetchRegions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/locations/admin/regions`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setRegions(data);
      }
    } catch (err) {
      console.error("Error fetching regions:", err);
    }
  }, []);

  // Fetch Communes
  const fetchCommunes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedRegionFilter && selectedRegionFilter !== "all") {
        params.append("regionId", selectedRegionFilter);
      }
      if (communeSearch && communeSearch.trim()) {
        params.append("search", communeSearch.trim());
      }

      const res = await fetch(`${API_URL}/locations/admin/communes?${params.toString()}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCommunes(data);
      }
    } catch (err) {
      console.error("Error fetching communes:", err);
    }
  }, [selectedRegionFilter, communeSearch]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchZones(), fetchRegions(), fetchCommunes()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchZones, fetchRegions, fetchCommunes]);

  // Handle Zone Toggle Active
  const handleToggleZoneActive = async (zone: LogisticZone) => {
    try {
      const newStatus = !zone.isActive;
      const res = await fetch(`${API_URL}/locations/admin/zones/${zone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) throw new Error("No se pudo actualizar el estado de la zona");

      showToast(newStatus ? `Zona ${zone.name} activada` : `Zona ${zone.name} desactivada`, "success");
      fetchZones();
    } catch (error: any) {
      showToast(error.message || "Error al actualizar estado", "error");
    }
  };

  // Handle Region Toggle Active
  const handleToggleRegionActive = async (region: Region) => {
    try {
      const newStatus = !region.isActive;
      const res = await fetch(`${API_URL}/locations/admin/regions/${region.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) throw new Error("No se pudo actualizar el estado de la región");

      showToast(newStatus ? `Región ${region.code} activada` : `Región ${region.code} desactivada`, "success");
      fetchRegions();
    } catch (error: any) {
      showToast(error.message || "Error al actualizar estado", "error");
    }
  };

  // Handle Commune Toggle Active
  const handleToggleCommuneActive = async (commune: Commune) => {
    try {
      const newStatus = !commune.isActive;
      const res = await fetch(`${API_URL}/locations/admin/communes/${commune.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (!res.ok) throw new Error("No se pudo actualizar el estado de la comuna");

      showToast(newStatus ? `Comuna ${commune.name} activada` : `Comuna ${commune.name} desactivada`, "success");
      fetchCommunes();
    } catch (error: any) {
      showToast(error.message || "Error al actualizar estado", "error");
    }
  };

  // Open Zone Modal
  const handleOpenZoneModal = (zone?: LogisticZone) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        code: zone.code,
        name: zone.name,
        description: zone.description || "",
        isActive: zone.isActive,
      });
    } else {
      setEditingZone(null);
      setZoneForm({
        code: "",
        name: "",
        description: "",
        isActive: true,
      });
    }
    setIsZoneModalOpen(true);
  };

  // Save Zone
  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingZone
        ? `${API_URL}/locations/admin/zones/${editingZone.id}`
        : `${API_URL}/locations/admin/zones`;
      const method = editingZone ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(zoneForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al guardar la zona logística");
      }

      showToast(editingZone ? "Zona logística actualizada" : "Zona logística creada con éxito", "success");
      setIsZoneModalOpen(false);
      fetchZones();
    } catch (error: any) {
      showToast(error.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Zone
  const handleDeleteZone = async (zone: LogisticZone) => {
    if (!confirm(`¿Eliminar la zona ${zone.name}? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch(`${API_URL}/locations/admin/zones/${zone.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al eliminar la zona logística");
      }

      showToast("Zona logística eliminada exitosamente", "success");
      fetchZones();
    } catch (error: any) {
      showToast(error.message || "Error al eliminar", "error");
    }
  };

  // Open Region Modal
  const handleOpenRegionModal = (region?: Region) => {
    if (region) {
      setEditingRegion(region);
      setRegionForm({
        code: region.code,
        name: region.name,
        shortName: region.shortName || "",
        zoneId: region.zoneId || (zones[0]?.id ?? ""),
        ordinal: region.ordinal,
        isActive: region.isActive,
      });
    } else {
      setEditingRegion(null);
      setRegionForm({
        code: "",
        name: "",
        shortName: "",
        zoneId: zones[0]?.id ?? "",
        ordinal: regions.length + 1,
        isActive: true,
      });
    }
    setIsRegionModalOpen(true);
  };

  // Save Region
  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingRegion
        ? `${API_URL}/locations/admin/regions/${editingRegion.id}`
        : `${API_URL}/locations/admin/regions`;
      const method = editingRegion ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(regionForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al guardar la región");
      }

      showToast(editingRegion ? "Región actualizada" : "Región creada con éxito", "success");
      setIsRegionModalOpen(false);
      fetchRegions();
    } catch (error: any) {
      showToast(error.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Region
  const handleDeleteRegion = async (region: Region) => {
    if (!confirm(`¿Eliminar la región ${region.name}? Se eliminarán también todas sus comunas asociadas.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/locations/admin/regions/${region.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al eliminar la región");
      }

      showToast("Región eliminada", "success");
      fetchRegions();
      fetchCommunes();
    } catch (error: any) {
      showToast(error.message || "Error al eliminar", "error");
    }
  };

  // Open Commune Modal
  const handleOpenCommuneModal = (commune?: Commune) => {
    if (commune) {
      setEditingCommune(commune);
      setCommuneForm({
        code: commune.code,
        name: commune.name,
        regionId: commune.regionId,
        zoneId: commune.zoneId || commune.zone?.id || (zones[0]?.id ?? ""),
        isActive: commune.isActive,
      });
    } else {
      setEditingCommune(null);
      const defaultRegionId = selectedRegionFilter !== "all" ? selectedRegionFilter : (regions[0]?.id ?? "");
      const selectedReg = regions.find((r) => r.id === defaultRegionId);
      setCommuneForm({
        code: "",
        name: "",
        regionId: defaultRegionId,
        zoneId: selectedReg?.zoneId || (zones[0]?.id ?? ""),
        isActive: true,
      });
    }
    setIsCommuneModalOpen(true);
  };

  // Save Commune
  const handleSaveCommune = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingCommune
        ? `${API_URL}/locations/admin/communes/${editingCommune.id}`
        : `${API_URL}/locations/admin/communes`;
      const method = editingCommune ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(communeForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al guardar la comuna");
      }

      showToast(editingCommune ? "Comuna actualizada" : "Comuna creada con éxito", "success");
      setIsCommuneModalOpen(false);
      fetchCommunes();
      fetchRegions();
    } catch (error: any) {
      showToast(error.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  // Delete Commune
  const handleDeleteCommune = async (commune: Commune) => {
    if (!confirm(`¿Eliminar la comuna ${commune.name}? Esta acción no se puede deshacer.`)) return;

    try {
      const res = await fetch(`${API_URL}/locations/admin/communes/${commune.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al eliminar la comuna");
      }

      showToast("Comuna eliminada", "success");
      fetchCommunes();
      fetchRegions();
    } catch (error: any) {
      showToast(error.message || "Error al eliminar", "error");
    }
  };

  // Total communes count
  const totalCommunesCount = useMemo(() => {
    return regions.reduce((acc, r) => acc + (r._count?.communes || 0), 0);
  }, [regions]);

  // Zone Columns
  const zoneColumns: Column<LogisticZone>[] = [
    {
      header: t("col_code"),
      key: "code",
      render: (z) => (
        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-red/10 text-red border border-red/20">
          {z.code}
        </span>
      ),
    },
    {
      header: "Nombre de Zona",
      key: "name",
      render: (z) => (
        <div>
          <p className="font-bold text-sm text-white">{z.name}</p>
          {z.description && <p className="text-xs text-white/50 mt-0.5">{z.description}</p>}
        </div>
      ),
    },
    {
      header: "Cobertura Relacional",
      key: "coverage",
      render: (z) => (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">
            {z._count?.regions || 0} Regiones
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">
            {z._count?.communes || 0} Comunas
          </span>
        </div>
      ),
    },
    {
      header: t("col_status"),
      key: "isActive",
      render: (z) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={z.isActive}
            onChange={() => handleToggleZoneActive(z)}
            wrapperClassName="scale-90"
          />
          <span className={`text-xs font-bold ${z.isActive ? "text-emerald-400" : "text-white/30"}`}>
            {z.isActive ? t("active") : t("inactive")}
          </span>
        </div>
      ),
    },
    {
      header: t("col_actions"),
      key: "actions",
      render: (z) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="px-3 bg-blue/10 text-blue hover:bg-blue hover:text-white"
            onClick={() => handleOpenZoneModal(z)}
            title={t("btn_edit_zone")}
          >
            <IconPencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="px-3"
            onClick={() => handleDeleteZone(z)}
            title={t("btn_delete_zone")}
          >
            <IconTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Region Columns
  const regionColumns: Column<Region>[] = [
    {
      header: t("col_order"),
      key: "ordinal",
      render: (r) => <span className="font-mono text-xs text-white/40">#{r.ordinal}</span>,
    },
    {
      header: "Código",
      key: "code",
      render: (r) => (
        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-red/10 text-red border border-red/20">
          {r.code}
        </span>
      ),
    },
    {
      header: "Nombre Oficial",
      key: "name",
      render: (r) => (
        <div>
          <p className="font-bold text-sm text-white">{r.name}</p>
          {r.shortName && <p className="text-xs text-white/40">Alias: {r.shortName}</p>}
        </div>
      ),
    },
    {
      header: "Zona Logística",
      key: "zone",
      render: (r) => (
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/25">
          {r.zone?.name || r.zone?.code || "Sin Zona"}
        </span>
      ),
    },
    {
      header: "Comunas",
      key: "communes",
      render: (r) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/5 text-white/80 border border-white/10">
          {r._count?.communes || 0} comunas
        </span>
      ),
    },
    {
      header: "Estado",
      key: "isActive",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={r.isActive}
            onChange={() => handleToggleRegionActive(r)}
            wrapperClassName="scale-90"
          />
          <span className={`text-xs font-bold ${r.isActive ? "text-emerald-400" : "text-white/30"}`}>
            {r.isActive ? "Habilitada" : "Deshabilitada"}
          </span>
        </div>
      ),
    },
    {
      header: "Acciones",
      key: "actions",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="px-3 bg-blue/10 text-blue hover:bg-blue hover:text-white"
            onClick={() => handleOpenRegionModal(r)}
            title={t("btn_edit_region")}
          >
            <IconPencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="px-3"
            onClick={() => handleDeleteRegion(r)}
            title={t("btn_delete_region")}
          >
            <IconTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Commune Columns
  const communeColumns: Column<Commune>[] = [
    {
      header: t("col_code"),
      key: "code",
      render: (c) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/5 text-white/90 border border-white/10">
          {c.code}
        </span>
      ),
    },
    {
      header: "Comuna",
      key: "name",
      render: (c) => <span className="font-bold text-sm text-white">{c.name}</span>,
    },
    {
      header: t("col_region"),
      key: "region",
      render: (c) => (
        <span className="text-xs text-white/70">
          {c.region ? `[${c.region.code}] ${c.region.name}` : "-"}
        </span>
      ),
    },
    {
      header: t("col_zone"),
      key: "zone",
      render: (c) => (
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full border bg-blue/10 text-blue border-blue/25">
          {c.zone?.name || c.zone?.code || "Estándar"}
        </span>
      ),
    },
    {
      header: t("col_dispatches"),
      key: "isActive",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={c.isActive}
            onChange={() => handleToggleCommuneActive(c)}
            wrapperClassName="scale-90"
          />
          <span className={`text-xs font-bold ${c.isActive ? "text-emerald-400" : "text-white/30"}`}>
            {c.isActive ? t("operational") : t("suspended")}
          </span>
        </div>
      ),
    },
    {
      header: "Acciones",
      key: "actions",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="px-3 bg-blue/10 text-blue hover:bg-blue hover:text-white"
            onClick={() => handleOpenCommuneModal(c)}
            title={t("btn_edit_commune")}
          >
            <IconPencil className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="px-3"
            onClick={() => handleDeleteCommune(c)}
            title={t("btn_delete_commune")}
          >
            <IconTrash className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-white">
              {t("title")}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {t("badge")}
            </span>
          </div>
          <p className="text-sm text-white/60 mt-1">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === "regions" && (
            <Button variant="primary" onClick={() => handleOpenRegionModal()}>
              {t("btn_new_region")}
            </Button>
          )}
          {activeTab === "communes" && (
            <Button variant="primary" onClick={() => handleOpenCommuneModal()}>
              {t("btn_new_commune")}
            </Button>
          )}
          {activeTab === "zones" && (
            <Button variant="primary" onClick={() => handleOpenZoneModal()}>
              {t("btn_new_logistic_zone")}
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase font-bold tracking-wider text-white/40">{t("total_regions")}</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">{regions.length}</p>
          <span className="text-[10px] font-bold text-emerald-400 mt-1 inline-block">{t("official_subdere")}</span>
        </div>

        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase font-bold tracking-wider text-white/40">{t("total_communes")}</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">{totalCommunesCount || communes.length}</p>
          <span className="text-[10px] font-bold text-blue mt-1 inline-block">{t("national_coverage")}</span>
        </div>

        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase font-bold tracking-wider text-white/40">{t("logistic_zones_db")}</p>
          <p className="text-2xl font-black text-white mt-1 font-mono">{zones.length}</p>
          <span className="text-[10px] font-bold text-purple-400 mt-1 inline-block">{t("rates_surcharges")}</span>
        </div>

        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-5">
          <p className="text-xs uppercase font-bold tracking-wider text-white/40">{t("relational_integrity")}</p>
          <p className="text-base font-black text-emerald-400 mt-2 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {t("one_to_many")}
          </p>
          <span className="text-[10px] text-white/40 mt-1 inline-block">{t("acid_note")}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 gap-8">
        <button
          onClick={() => setActiveTab("regions")}
          className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${
            activeTab === "regions" ? "text-white" : "text-white/40 hover:text-white/70"
          }`}
        >
          <span>{t("tab_regions_count", { count: regions.length })}</span>
          {activeTab === "regions" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("communes")}
          className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${
            activeTab === "communes" ? "text-white" : "text-white/40 hover:text-white/70"
          }`}
        >
          <span>{t("tab_communes_count", { count: communes.length })}</span>
          {activeTab === "communes" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("zones")}
          className={`pb-4 text-sm font-bold tracking-wide transition-all relative ${
            activeTab === "zones" ? "text-white" : "text-white/40 hover:text-white/70"
          }`}
        >
          <span>{t("tab_zones_count", { count: zones.length })}</span>
          {activeTab === "zones" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
          )}
        </button>
      </div>

      {/* Content: Regions Tab */}
      {activeTab === "regions" && (
        <div className="space-y-4">
          <List<Region>
            data={regions}
            columns={regionColumns}
            loading={loading}
            emptyMessage={t("empty_regions")}
            keyExtractor={(item) => item.id}
          />
        </div>
      )}

      {/* Content: Communes Tab */}
      {activeTab === "communes" && (
        <div className="space-y-6">
          {/* Controls: Region Filter & Search */}
          <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-72">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                {t("filter_by_region")}
              </label>
              <select
                value={selectedRegionFilter}
                onChange={(e) => setSelectedRegionFilter(e.target.value)}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-red focus:ring-1 focus:ring-red outline-none"
              >
                <option value="all">{t("all_regions_count", { count: regions.length })}</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.code}] {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">
                {t("search_communes")}
              </label>
              <input
                type="text"
                value={communeSearch}
                onChange={(e) => setCommuneSearch(e.target.value)}
                placeholder={t("search_communes")}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white placeholder-white/20 focus:border-red focus:ring-1 focus:ring-red outline-none"
              />
            </div>

            {(selectedRegionFilter !== "all" || communeSearch) && (
              <div className="pt-4 sm:pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedRegionFilter("all");
                    setCommuneSearch("");
                  }}
                >
                  {tCommon("clear") || "Limpiar"}
                </Button>
              </div>
            )}
          </div>

          <List<Commune>
            data={communes}
            columns={communeColumns}
            loading={loading}
            emptyMessage={t("empty_communes")}
            keyExtractor={(item) => item.id}
          />
        </div>
      )}

      {/* Content: Zones Tab */}
      {activeTab === "zones" && (
        <div className="space-y-4">
          <List<LogisticZone>
            data={zones}
            columns={zoneColumns}
            loading={loading}
            emptyMessage={t("empty_zones")}
            keyExtractor={(item) => item.id}
          />
        </div>
      )}

      {/* ─── Modal: Zona Logística ─── */}
      <Modal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        title={editingZone ? t("modal_edit_zone", { name: editingZone.name }) : t("modal_new_zone")}
        maxWidth="md"
      >
        <form onSubmit={handleSaveZone} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("zone_code")} <span className="text-red">*</span>
            </label>
            <Input
              required
              value={zoneForm.code}
              onChange={(e) => setZoneForm({ ...zoneForm, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
              placeholder="RM, NORTE_GRANDE..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("zone_name")} <span className="text-red">*</span>
            </label>
            <Input
              required
              value={zoneForm.name}
              onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
              placeholder={t("zone_name")}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("zone_desc")}
            </label>
            <Input
              value={zoneForm.description}
              onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
              placeholder={t("zone_desc")}
            />
          </div>

          <div className="pt-2">
            <Switch
              label={t("zone_active")}
              checked={zoneForm.isActive}
              onChange={(e) => setZoneForm({ ...zoneForm, isActive: e.target.checked })}
              wrapperClassName="bg-[#080B12] border-white/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsZoneModalOpen(false)}>
              {t("btn_cancel")}
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {t("btn_save_zone")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal: Región ─── */}
      <Modal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        title={editingRegion ? t("modal_edit_region", { name: editingRegion.name }) : t("modal_new_region")}
        maxWidth="md"
      >
        <form onSubmit={handleSaveRegion} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("region_code")} <span className="text-red">*</span>
            </label>
            <Input
              required
              value={regionForm.code}
              onChange={(e) => setRegionForm({ ...regionForm, code: e.target.value.toUpperCase() })}
              placeholder="RM, V, VIII..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("region_name")} <span className="text-red">*</span>
            </label>
            <Input
              required
              value={regionForm.name}
              onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
              placeholder={t("region_name")}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("region_short")}
            </label>
            <Input
              value={regionForm.shortName}
              onChange={(e) => setRegionForm({ ...regionForm, shortName: e.target.value })}
              placeholder={t("region_short")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                {t("region_zone")} <span className="text-red">*</span>
              </label>
              <select
                value={regionForm.zoneId}
                onChange={(e) => setRegionForm({ ...regionForm, zoneId: e.target.value })}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:border-red focus:ring-1 focus:ring-red outline-none"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    [{z.code}] {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
                {t("region_ordinal")}
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={regionForm.ordinal}
                onChange={(e) => setRegionForm({ ...regionForm, ordinal: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-2">
            <Switch
              label={t("region_active")}
              checked={regionForm.isActive}
              onChange={(e) => setRegionForm({ ...regionForm, isActive: e.target.checked })}
              wrapperClassName="bg-[#080B12] border-white/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsRegionModalOpen(false)}>
              {t("btn_cancel")}
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {t("btn_save_region")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── Modal: Comuna ─── */}
      <Modal
        isOpen={isCommuneModalOpen}
        onClose={() => setIsCommuneModalOpen(false)}
        title={editingCommune ? t("modal_edit_commune", { name: editingCommune.name }) : t("modal_new_commune")}
        maxWidth="md"
      >
        <form onSubmit={handleSaveCommune} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("commune_code")} <span className="text-red">*</span>
            </label>
            <Input
              required
              value={communeForm.code}
              onChange={(e) => setCommuneForm({ ...communeForm, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
              placeholder="PROVIDENCIA, LAS_CONDES..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("commune_name")} <span className="text-red">*</span>
            </label>
            <Input
              required
              value={communeForm.name}
              onChange={(e) => setCommuneForm({ ...communeForm, name: e.target.value })}
              placeholder={t("commune_name")}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("commune_region")} <span className="text-red">*</span>
            </label>
            <select
              required
              value={communeForm.regionId}
              onChange={(e) => {
                const reg = regions.find((r) => r.id === e.target.value);
                setCommuneForm({
                  ...communeForm,
                  regionId: e.target.value,
                  zoneId: reg?.zoneId || communeForm.zoneId,
                });
              }}
              className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:border-red focus:ring-1 focus:ring-red outline-none"
            >
              <option value="">{t("filter_all_regions")}</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  [{r.code}] {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1">
              {t("commune_zone")} <span className="text-red">*</span>
            </label>
            <select
              value={communeForm.zoneId}
              onChange={(e) => setCommuneForm({ ...communeForm, zoneId: e.target.value })}
              className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:border-red focus:ring-1 focus:ring-red outline-none"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  [{z.code}] {z.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <Switch
              label={t("commune_active")}
              checked={communeForm.isActive}
              onChange={(e) => setCommuneForm({ ...communeForm, isActive: e.target.checked })}
              wrapperClassName="bg-[#080B12] border-white/10"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsCommuneModalOpen(false)}>
              {t("btn_cancel")}
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              {t("btn_save_commune")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
