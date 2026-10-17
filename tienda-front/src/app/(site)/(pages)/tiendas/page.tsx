"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_URL } from "@/utils/api";
import { StoreShippingBadges } from "@/components/ui/StoreShippingBadges";
import { IconStore, IconShieldCheck, IconSearch, IconX, IconTruck, IconZap } from "@/components/ui/Icons";

interface PublicStore {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string | null;
  address?: string | null;
  pickupEnabled?: boolean | null;
  pickupAddress?: string | null;
  pickupSchedule?: string | null;
  originRegion?: { id: string; name: string } | null;
  originCommune?: { id: string; name: string } | null;
  shipping?: Array<{
    id?: string;
    name: string;
    price?: number | string;
    isActive?: boolean;
  }> | null;
}

export default function TiendasDirectoryPage() {
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/stores/public`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setStores(data);
        }
      })
      .catch((err) => {
        console.error("Error al cargar tiendas:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredStores = useMemo(() => {
    if (!searchTerm.trim()) return stores;
    const term = searchTerm.toLowerCase().trim();
    return stores.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(term);
      const communeMatch = s.originCommune?.name?.toLowerCase().includes(term);
      const regionMatch = s.originRegion?.name?.toLowerCase().includes(term);
      const addressMatch = s.pickupAddress?.toLowerCase().includes(term) || s.address?.toLowerCase().includes(term);
      return nameMatch || communeMatch || regionMatch || addressMatch;
    });
  }, [stores, searchTerm]);

  return (
    <main className="min-h-screen bg-[#07090E] text-white pt-28 md:pt-36 pb-20">
      {/* Top Banner Header */}
      <div className="relative border-b border-white/[0.08] bg-[#0E121B] pb-10 mb-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-dark via-red to-orange"></div>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red/15 text-red-light border border-red/30 mb-3">
            <IconStore className="w-3.5 h-3.5 text-red" />
            Directorio Oficial de Comercios TCG
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Tiendas Especializadas en TapTrade
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Encuentra tiendas con local físico, verificación legal de RUT chileno y catálogo de singles sincronizado en vivo. Compra directamente o retira presencialmente sin costo.
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-xl relative">
            <div className="relative flex items-center bg-[#111522] rounded-xl border border-white/10 hover:border-white/20 focus-within:border-red/60 focus-within:ring-1 focus-within:ring-red/30 transition-all">
              <IconSearch className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre de tienda, comuna o dirección..."
                className="w-full bg-transparent text-white text-xs sm:text-sm pl-10 pr-10 py-3 outline-none placeholder:text-gray-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 text-gray-400 hover:text-white"
                  title="Limpiar búsqueda"
                >
                  <IconX className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-[11px] text-gray-400 font-mono mt-2 block">
              {filteredStores.length} {filteredStores.length === 1 ? "tienda encontrada" : "tiendas encontradas"}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#0E121B] border border-white/10 animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5" />
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 rounded bg-white/5" />
                    <div className="w-20 h-3 rounded bg-white/5" />
                  </div>
                </div>
                <div className="w-full h-12 rounded-xl bg-white/5" />
              </div>
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-[#0E121B] border border-white/10 rounded-2xl p-8 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-500">
              <IconStore className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No se encontraron tiendas</h3>
            <p className="text-xs text-gray-400 mb-4">
              No hay tiendas que coincidan con &quot;{searchTerm}&quot;. Intenta con otro nombre o comuna.
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/15 transition-all"
            >
              Restablecer búsqueda
            </button>
          </div>
        ) : (
          /* Stores Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStores.map((store) => {
              const locationText = [store.originCommune?.name, store.originRegion?.name]
                .filter(Boolean)
                .join(", ") || store.address || "Chile";

              return (
                <div
                  key={store.id}
                  className="p-6 rounded-2xl bg-[#0E121B] border border-white/10 hover:border-white/20 transition-all shadow-xl flex flex-col justify-between group hover:shadow-red/5"
                >
                  <div className="space-y-4">
                    {/* Header: Logo & Name */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {store.logoUrl ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#07090E] border border-white/10 shrink-0 relative">
                            <Image
                              src={store.logoUrl}
                              alt={store.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#161b2a] to-[#0c0f18] border border-white/10 flex items-center justify-center font-black text-red text-base shrink-0 shadow-inner">
                            {store.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-white truncate group-hover:text-red-light transition-colors">
                              {store.name}
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              ✓ Verificado
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 block truncate mt-0.5">
                            📍 {locationText}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pickup Address & Schedule */}
                    {store.pickupEnabled && (
                      <div className="bg-[#07090E] rounded-xl p-3 border border-white/5 space-y-1 text-xs">
                        {store.pickupAddress && (
                          <p className="text-gray-300 font-medium truncate">
                            <span className="text-red">🏪</span> {store.pickupAddress}
                          </p>
                        )}
                        {store.pickupSchedule && (
                          <p className="text-[11px] text-gray-400 font-mono truncate">
                            🕒 {store.pickupSchedule}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Shipping Badges */}
                    <div className="pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block mb-1.5 font-bold">
                        Envíos y Retiro Habilitados:
                      </span>
                      <StoreShippingBadges store={store} size="sm" />
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between gap-4">
                    <span className="text-xs text-gray-400 font-mono">
                      Subdominio: <strong className="text-white">{store.subdomain}</strong>
                    </span>
                    <Link
                      href={`/shop/store/${store.subdomain}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red hover:bg-red-dark transition-all shadow-md shadow-red/25 active:scale-95"
                    >
                      <span>Ver Catálogo</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to Action for Store Owners */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[#121624] via-[#0E121B] to-[#141829] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-light">
              Programa de Tiendas TapTrade
            </span>
            <h3 className="text-xl font-bold text-white">
              ¿Tienes una Tienda TCG o eres Dealer en Chile?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
              Publica tu catálogo, recibe ventas automáticas con Webpay y Mercado Pago, y gestiona tu buylist con la infraestructura SaaS de TapTrade.
            </p>
          </div>
          <Link
            href="/landing"
            className="shrink-0 px-5 py-3 rounded-xl text-xs font-bold text-white bg-red hover:bg-red-dark transition-all shadow-lg shadow-red/30 active:scale-95 flex items-center gap-2"
          >
            <span>🚀 Conoce TapTrade</span>
            <span className="bg-black/30 text-white text-[10px] px-1.5 py-0.2 rounded font-mono uppercase">
              Landing
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
