"use client";
import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { LocalProduct } from '../_lib/posDb';

interface PosSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  results: LocalProduct[];
  isSearching: boolean;
  onAddItem: (product: LocalProduct, inventoryItem: LocalProduct['items'][0]) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function PosSearchBar({
  searchQuery,
  onSearchChange,
  results,
  isSearching,
  onAddItem,
  inputRef,
}: PosSearchBarProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  // Atajo de teclado F2 para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputRef]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Barra de Búsqueda y Escáner */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input
          ref={inputRef as any}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Escanear código de barras o escribir carta (F2)..."
          className="w-full pl-12 pr-28 py-3.5 bg-[#0E121B] border border-white/10 rounded-2xl text-white placeholder-white/40 text-sm font-medium focus:outline-none focus:border-red focus:ring-1 focus:ring-red transition-all shadow-inner"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              type="button"
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-white/40">
            F2
          </span>
        </div>
      </div>

      {/* Resultados de Búsqueda */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[300px]">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center h-48 text-white/50 space-y-2">
            <div className="w-6 h-6 border-2 border-red border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Buscando en catálogo local...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 p-6 text-center bg-[#0E121B]/50 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm font-bold text-white/70">
              {searchQuery ? 'No se encontraron productos con ese término' : 'Escanea un código o escribe para buscar'}
            </p>
            <p className="text-xs text-white/40 mt-1 max-w-xs">
              Puedes buscar cartas sueltas por nombre, set, número o disparar la pistola de código de barras.
            </p>
          </div>
        ) : (
          results.map((product) => {
            const isSingle = product.category?.isTcg || !!product.cardDetail;
            return (
              <div
                key={product.id}
                className="p-3.5 bg-[#0E121B] rounded-2xl border border-white/10 hover:border-white/20 transition-all shadow-md space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Foto miniatura con formato vertical TCG (proporción carta 63x88) */}
                  <div
                    className="relative w-14 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 cursor-zoom-in group/card hover:border-red/50 transition-all shadow-sm"
                    onMouseEnter={() => product.imageUrl && setHoveredImage(product.imageUrl)}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-0.5 group-hover/card:scale-105 transition-transform"
                        sizes="56px"
                        unoptimized={true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-mono">
                        TCG
                      </div>
                    )}
                  </div>

                  {/* Datos del producto */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate">
                        {product.name}
                      </h3>
                      {product.barcode && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                          {product.barcode}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-white/50 flex-wrap">
                      {product.cardDetail?.expansion && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/70">
                          {product.cardDetail.expansion}
                        </span>
                      )}
                      {product.cardDetail?.collectorNum && (
                        <span className="font-mono text-[11px] text-white/40">
                          #{product.cardDetail.collectorNum}
                        </span>
                      )}
                      {product.cardDetail?.rarity && (
                        <span className="text-[11px] text-amber-400/80 font-medium capitalize">
                          {product.cardDetail.rarity}
                        </span>
                      )}
                      {product.exchangeRateApplied && (
                        <span className="text-[10px] text-blue-400 font-mono px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                          Tasa: 1 USD = ${product.exchangeRateApplied.toLocaleString('es-CL')} CLP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Variantes en stock o aviso de sin stock */}
                {!product.items || product.items.every((item) => item.stock <= 0) ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-red/5 border border-red/20 text-xs">
                    <span className="text-red font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red" />
                      Sin unidades disponibles en tienda (Agotado)
                    </span>
                    <span className="text-white/40 text-[11px] font-mono">
                      0 en stock
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    {product.items
                      .filter((item) => item.stock > 0)
                      .map((item) => {
                        const conditionLabel =
                          item.condition?.displayName || item.condition?.name || 'NM';
                        const languageCode = item.language?.code?.toUpperCase() || 'EN';
                        const finishLabel = item.finish?.name;
                        const priceNum = Number(item.price);

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
                        >
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red/10 border border-red/30 text-red">
                                {conditionLabel}
                              </span>
                              <span className="text-[10px] font-mono text-white/60">
                                {languageCode}
                              </span>
                              {finishLabel && (
                                <span className="text-[10px] text-purple-400 font-medium">
                                  {finishLabel}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs font-bold text-white font-mono">
                                ${priceNum.toLocaleString('es-CL')} CLP
                              </span>
                              {item.rawPriceUsd !== undefined && (
                                <span className="text-[10px] text-white/40 font-mono">
                                  (${item.rawPriceUsd} USD)
                                </span>
                              )}
                              <span className="text-[10px] text-white/40">
                                ({item.stock} disp.)
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => onAddItem(product, item)}
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-red hover:bg-red-light text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                          >
                            <span>+</span>
                            <span>Agregar</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Zoom flotante en hover para inspeccionar arte y texto de la carta */}
      {hoveredImage && (
        <div className="fixed bottom-12 left-1/3 z-50 pointer-events-none rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black/95 p-2 animate-in fade-in zoom-in-95 duration-150">
          <Image
            src={hoveredImage}
            alt="Preview"
            width={260}
            height={364}
            className="w-full h-auto object-contain rounded-xl"
            priority
            unoptimized={true}
          />
        </div>
      )}
    </div>
  );
}
