"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Product } from "@/types/product";
import { useGlobalCatalogSearch } from "@/components/Admin/Products/hooks/useGlobalCatalogSearch";

interface GlobalCatalogSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function GlobalCatalogSearchModal({ isOpen, onClose, onSelectProduct }: GlobalCatalogSearchModalProps) {
  const { searchTerm, setSearchTerm, results, loading } = useGlobalCatalogSearch();
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
      <div className="space-y-6">
        <div>
          <Input
            label="Buscar por nombre"
            placeholder="Ej: Black Lotus, Charizard, etc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-gray-4 mt-1.5 font-medium">
            Busca en la base de datos maestra para agregar cartas individualmente a tu tienda. Escribe al menos 3 caracteres.
          </p>
        </div>

        <div 
          className="min-h-[300px] border border-stroke rounded-xl p-2 bg-[#111318] overflow-y-auto max-h-[400px]"
          onMouseMove={handleMouseMove}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full py-12">
              <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
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
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-5">Sin img</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm group-hover:text-blue transition-colors">{product.name}</h4>
                    <p className="text-xs text-gray-4 mt-0.5">{product.category?.name || "Sin Categoría"} • {product.cardDetail?.expansion || "Sin Expansión"}</p>
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
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <span className="bg-blue/10 text-blue font-bold px-3 py-1 rounded-full text-xs">
                      Seleccionar
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 3 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <svg className="w-10 h-10 text-gray-5 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h4 className="text-white font-bold">No se encontraron cartas</h4>
              <p className="text-gray-4 text-sm mt-1">Intenta con otro término de búsqueda.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-50">
              <svg className="w-10 h-10 text-gray-5 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p className="text-gray-4 text-sm">Comienza a escribir para buscar.</p>
            </div>
          )}
        </div>
      </div>

      {/* HOVER PREVIEW */}
      {hoveredImage && (
        <div 
          className="fixed z-[999999] pointer-events-none shadow-2xl rounded-2xl border-4 border-[#1C2434] bg-[#1C2434] overflow-hidden transition-all duration-200 animate-in fade-in zoom-in"
          style={{ 
            top: mousePos.y > (typeof window !== 'undefined' ? window.innerHeight * 0.6 : 500) 
              ? mousePos.y - 440 
              : mousePos.y + 20, 
            left: mousePos.x + 20,
            maxWidth: '280px'
          }}
        >
          <Image src={hoveredImage} alt="Preview" width={280} height={390} className="w-full h-auto object-contain" priority />
        </div>
      )}
    </Modal>
  );
}
