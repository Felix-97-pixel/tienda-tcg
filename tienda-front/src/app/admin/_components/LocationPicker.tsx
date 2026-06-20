"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";

// Arreglar iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string | null;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

const DEFAULT_CENTER: [number, number] = [-33.4489, -70.6693]; // Santiago, Chile por defecto

// Componente para manejar los clicks en el mapa
function MapEvents({ setPosition }: { setPosition: any }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function LocationPicker({ initialLat, initialLng, initialAddress, onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [searchQuery, setSearchQuery] = useState(initialAddress || "");
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<any>(null);

  const provider = new OpenStreetMapProvider();

  // Actualizar padre cuando cambia posicion
  useEffect(() => {
    if (position) {
      onLocationChange(position[0], position[1], searchQuery);
    }
  }, [position, searchQuery]); // Also trigger if query changed but not position (though search usually sets both)

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const results = await provider.search({ query: searchQuery });
      if (results && results.length > 0) {
        const { x, y, label } = results[0]; // x = lng, y = lat
        setPosition([y, x]);
        setSearchQuery(label); // actualiza con el nombre formal del lugar
        
        // Mover el mapa a la nueva posición
        if (mapRef.current) {
          mapRef.current.flyTo([y, x], 15);
        }
      } else {
        alert("Dirección no encontrada. Intenta ser más específico.");
      }
    } catch (error) {
      console.error("Error buscando dirección:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Busca tu dirección completa (Ej: Providencia 1234, Chile)"
          className="flex-1 rounded-xl border border-white/10 bg-[#1a1d24] px-4 py-2 text-white outline-none focus:border-blue"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="rounded-xl bg-blue px-4 py-2 font-bold text-white transition hover:bg-blue/90 disabled:opacity-50"
        >
          {isSearching ? "Buscando..." : "Buscar"}
        </button>
      </div>
      <p className="text-xs text-gray-400">
        O haz clic directamente en el mapa para ajustar el pin rojo exactamente donde está la entrada de tu tienda.
      </p>
      
      <div className="h-[300px] w-full overflow-hidden rounded-xl border border-white/10 relative z-0">
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={position ? 15 : 11}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents setPosition={setPosition} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
    </div>
  );
}
