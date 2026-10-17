"use client";
import React, { useState, useEffect } from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { API_URL } from "@/utils/api";

export interface RegionOption {
  code: string;
  name: string;
  communes: { code: string; name: string }[];
}

interface ChileLocationsSelectProps {
  selectedCommune: string;
  onCommuneChange: (communeCode: string, communeName: string, regionCode: string) => void;
  disabled?: boolean;
}

export default function ChileLocationsSelect({
  selectedCommune,
  onCommuneChange,
  disabled = false,
}: ChileLocationsSelectProps) {
  const [regions, setRegions] = useState<RegionOption[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("RM");
  const [loading, setLoading] = useState(true);

  // Fetch complete 16 regions & 346 communes directly from PostgreSQL
  useEffect(() => {
    fetch(`${API_URL}/locations`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRegions(data);
        }
      })
      .catch(() => {
        // Fallback endpoint if needed
        fetch(`${API_URL}/shipping/locations`)
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data)) setRegions(data);
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));
  }, []);

  // Sync region when selectedCommune is provided or pre-loaded
  useEffect(() => {
    if (selectedCommune && regions.length > 0) {
      for (const reg of regions) {
        const found = reg.communes?.find(
          (c) => c.code === selectedCommune || c.name.toLowerCase() === selectedCommune.toLowerCase()
        );
        if (found) {
          setSelectedRegion(reg.code);
          break;
        }
      }
    }
  }, [selectedCommune, regions]);

  const currentRegion = regions.find((r) => r.code === selectedRegion) || regions[0];
  const regionOptions = regions.map((r) => ({ label: r.name, value: r.code }));
  const communeOptions = (currentRegion?.communes || []).map((c) => ({
    label: c.name,
    value: c.code,
  }));

  const handleRegionChange = (newRegionCode: string) => {
    setSelectedRegion(newRegionCode);
    const reg = regions.find((r) => r.code === newRegionCode);
    if (reg?.communes && reg.communes.length > 0) {
      const firstCommune = reg.communes[0];
      onCommuneChange(firstCommune.code, firstCommune.name, newRegionCode);
    }
  };

  const handleCommuneChange = (newCommuneCode: string) => {
    const commune = currentRegion?.communes?.find((c) => c.code === newCommuneCode);
    if (commune) {
      onCommuneChange(commune.code, commune.name, selectedRegion);
    }
  };

  if (loading && regions.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
            Región de Destino
          </label>
          <div className="h-11 rounded-xl bg-white/[0.03] border border-white/10 animate-pulse" />
        </div>
        <div>
          <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
            Comuna de Destino
          </label>
          <div className="h-11 rounded-xl bg-white/[0.03] border border-white/10 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Selector de Región */}
      <div>
        <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
          Región de Destino <span className="text-red-400">*</span>
        </label>
        <SearchableSelect
          options={regionOptions}
          value={selectedRegion}
          onChange={handleRegionChange}
          placeholder="Selecciona tu región..."
          disabled={disabled}
        />
      </div>

      {/* Selector de Comuna */}
      <div>
        <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
          Comuna de Destino <span className="text-red-400">*</span>
        </label>
        <SearchableSelect
          options={communeOptions}
          value={selectedCommune}
          onChange={handleCommuneChange}
          placeholder="Selecciona o busca tu comuna..."
          disabled={disabled}
        />
      </div>
    </div>
  );
}
