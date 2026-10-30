"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Product } from "@/types/product";
import { useGlobalCatalogSearch } from "@/app/admin/_components/Products/hooks/useGlobalCatalogSearch";
import { API_URL } from "@/utils/api";

interface GlobalCatalogSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function GlobalCatalogSearchModal({ isOpen, onClose, onSelectProduct }: GlobalCatalogSearchModalProps) {
  const { searchTerm, setSearchTerm, selectedGame, setSelectedGame, results, loading } = useGlobalCatalogSearch();
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/games`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setGames(data))
        .catch((err) => console.error("Error loading games:", err));
    }
  }, [isOpen]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buscar en el Catálogo Global"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Filtro por Juego (SearchableSelect) y Búsqueda por Nombre */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className="mb-1.5 block text-xs font-medium text-white/70">Filtrar por Juego</label>
            <SearchableSelect
              options={[
                { label: "Todos los juegos", value: "" },
                ...games.map((g) => ({ label: g.name, value: g.id })),
              ]}
              value={selectedGame}
              onChange={setSelectedGame}
              placeholder="Todos los juegos"
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Buscar por nombre"
              placeholder="Ej: Black Lotus, Charizard, etc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <p className="text-xs text-gray-4 font-medium">
          Busca en la base de datos maestra para agregar cartas individualmente a tu tienda. Escribe al menos 3 caracteres.
        </p>

        <div 
          className="min-h-[300px] border border-white/10 rounded-xl p-2 bg-[#080B12] overflow-y-auto max-h-[400px]"
          onMouseMove={handleMouseMove}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full py-12">
              <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="w-full flex items-center gap-4 p-3 hover:bg-[#1a1d24] transition-colors rounded-lg text-left group border border-transparent hover:border-stroke"
                >
                  <div 
                    className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-800 border border-stroke cursor-zoom-in transition-transform group-hover:scale-105"
                    onMouseEnter={() => product.imageUrl && setHoveredImage(product.imageUrl)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src && target.src.includes("?")) {
                            target.src = target.src.split("?")[0];
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-5">Sin img</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm group-hover:text-blue transition-colors truncate">{product.name}</h4>
                    <p className="text-xs text-gray-4 mt-0.5 truncate">
                      {product.cardDetail?.gameRel?.name ? `${product.cardDetail.gameRel.name} • ` : ""}
                      {product.category?.name || "Sin Categoría"} • {product.cardDetail?.expansion || "Sin Expansión"}
                    </p>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {product.marketPrices && product.marketPrices.length > 0 ? (
                        Array.from(new Map(product.marketPrices.filter(mp => mp.finish).map(mp => [mp.finish!.id, mp.finish!.name])).values()).map(finishName => (
                          <span key={finishName} className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1C2434] text-gray-4 border border-white/10">
                            {finishName}
                          </span>
                        ))
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-red group-hover:underline">Seleccionar</span>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm && searchTerm.length >= 3 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-4">
              <svg className="w-12 h-12 stroke-current mb-3 opacity-20" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm">No se encontraron cartas que coincidan con la búsqueda.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-5">
              <svg className="w-12 h-12 stroke-current mb-2 opacity-20" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p className="text-sm">Comienza a escribir para buscar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Image Preview */}
      {hoveredImage && (
        <div 
          className="fixed z-999999 pointer-events-none shadow-2xl rounded-2xl border-2 border-white/20 bg-[#0E121B] shadow-black overflow-hidden transition-all duration-200 animate-in fade-in zoom-in"
          style={{ 
            top: mousePos.y > (typeof window !== 'undefined' ? window.innerHeight * 0.6 : 500) 
              ? mousePos.y - 440 
              : mousePos.y + 20, 
            left: mousePos.x + 20,
            maxWidth: '280px'
          }}
        >
          <img 
            src={hoveredImage} 
            alt="Preview" 
            className="w-full h-auto object-contain" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src && target.src.includes("?")) {
                target.src = target.src.split("?")[0];
              }
            }}
          />
        </div>
      )}
    </Modal>
  );
}
