"use client";
import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { LocalProduct } from '../_lib/posDb';
import { IconSearch, IconGlobe, IconRepeat } from '@/components/ui/Icons';
import SearchableSelect from '@/components/ui/SearchableSelect';
import SegmentedControl from '@/components/ui/SegmentedControl';

interface PosSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  results: LocalProduct[];
  isSearching: boolean;
  onAddItem: (product: LocalProduct, inventoryItem: LocalProduct['items'][0]) => void;
  onAddBuyItem?: (product: LocalProduct, condition?: any, language?: any) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  posMode?: 'SELL' | 'BUY';
  buylistMap?: Map<string, { cashPrice: number; creditPrice: number; conditionId: string; languageId: string }>;
  // Filtros avanzados para modo Compra / Trade-in (opcionales para modo Venta)
  buySourceTab?: 'BUYLIST' | 'GLOBAL';
  onSetBuySourceTab?: (tab: 'BUYLIST' | 'GLOBAL') => void;
  selectedCategory?: string;
  onSelectCategory?: (catId: string) => void;
  selectedExpansion?: string;
  onSelectExpansion?: (exp: string) => void;
  categories?: Array<{ id: string; name: string }>;
  expansions?: Array<{ name: string; products?: number }>;
  onOpenGlobalCatalogModal?: () => void;
}

export default function PosSearchBar({
  searchQuery,
  onSearchChange,
  results,
  isSearching,
  onAddItem,
  onAddBuyItem,
  inputRef,
  posMode = 'SELL',
  buylistMap,
  buySourceTab = 'BUYLIST',
  onSetBuySourceTab,
  selectedCategory = '',
  onSelectCategory,
  selectedExpansion = '',
  onSelectExpansion,
  categories = [],
  expansions = [],
  onOpenGlobalCatalogModal,
}: PosSearchBarProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Listener global de movimiento del mouse para posicionar el preview
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleWindowMouseMove);
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, []);

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

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex flex-col h-full space-y-3" onMouseMove={handleMouseMove}>
      {/* Pestañas cuando estamos en MODO COMPRA (Trade-in) */}
      {posMode === 'BUY' && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-1 bg-[#07090E] rounded-2xl border border-white/10">
          <SegmentedControl
            fullWidth={false}
            size="sm"
            value={buySourceTab || 'BUYLIST'}
            onChange={(val) => onSetBuySourceTab && onSetBuySourceTab(val as 'BUYLIST' | 'GLOBAL')}
            options={[
              {
                value: 'BUYLIST',
                label: 'Cartas en mi Buylist',
                icon: <IconRepeat className="w-3.5 h-3.5" />,
                variant: 'success',
              },
              {
                value: 'GLOBAL',
                label: 'Colección Maestra Global',
                icon: <IconGlobe className="w-3.5 h-3.5" />,
                variant: 'blue',
              },
            ]}
          />

          {onOpenGlobalCatalogModal && (
            <button
              type="button"
              onClick={onOpenGlobalCatalogModal}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span>+ Buscar en SuperAdmin</span>
            </button>
          )}
        </div>
      )}

      {/* Selectores rápidos de Juego / Expansión con buscador (SearchableSelect) */}
      {posMode === 'BUY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <SearchableSelect
            placeholder="Todos los juegos (Magic, Pokémon, etc.)"
            options={[
              { label: "Todos los juegos (Magic, Pokémon, etc.)", value: "" },
              ...categories.map((c) => ({ label: c.name, value: c.name })),
            ]}
            value={selectedCategory}
            onChange={(val) => onSelectCategory && onSelectCategory(val)}
            noResultsText="No se encontraron juegos"
            inputClassName="!py-2 !text-xs !bg-[#0E121B] !rounded-xl !border-white/10 focus:!border-emerald-500"
          />

          <SearchableSelect
            placeholder="Todas las expansiones"
            disabled={!selectedCategory && expansions.length === 0}
            options={[
              { label: "Todas las expansiones", value: "" },
              ...expansions.map((exp) => ({ label: exp.name, value: exp.name })),
            ]}
            value={selectedExpansion}
            onChange={(val) => onSelectExpansion && onSelectExpansion(val)}
            noResultsText="No se encontraron expansiones"
            inputClassName="!py-2 !text-xs !bg-[#0E121B] !rounded-xl !border-white/10 focus:!border-emerald-500 disabled:opacity-40"
          />
        </div>
      )}

      {/* Barra de Búsqueda y Escáner */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
          <IconSearch className="w-4 h-4" />
        </div>

        <input
          ref={inputRef as any}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={
            posMode === 'BUY'
              ? buySourceTab === 'BUYLIST'
                ? "Buscar entre las cartas de tu Buylist (F2)..."
                : "Buscar en todo el catálogo maestro global (F2)..."
              : "Escanear código de barras o escribir carta para VENDER (F2)..."
          }
          className={`w-full pl-11 pr-28 py-3.5 bg-[#0E121B] border rounded-2xl text-white placeholder-white/40 text-sm font-medium focus:outline-none transition-all shadow-inner ${
            posMode === 'BUY'
              ? 'border-emerald-500/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
              : 'border-white/10 focus:border-red focus:ring-1 focus:ring-red'
          }`}
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              type="button"
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              ✕
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
            <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
              posMode === 'BUY' ? 'border-emerald-500' : 'border-red'
            }`} />
            <span className="text-xs">Buscando cartas...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 p-6 text-center bg-[#0E121B]/50 rounded-2xl border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-3">
              <IconSearch className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white/70">
              {searchQuery ? 'No se encontraron cartas con ese término' : 'Escribe el nombre de la carta para buscar'}
            </p>
            <p className="text-xs text-white/40 mt-1 max-w-xs">
              {posMode === 'BUY'
                ? buySourceTab === 'BUYLIST'
                  ? 'Mostrando cartas configuradas en tu Buylist. Cambia a "Colección Maestra Global" para buscar cualquier carta de Magic/Pokémon.'
                  : 'Busca entre miles de cartas del catálogo maestro para asignarle precio y comprarla.'
                : 'Busca cartas con stock en tu tienda para agregar al ticket de venta.'}
            </p>
          </div>
        ) : (
          results.map((product) => {
            const hasBuylist = buylistMap && buylistMap.has(product.id);
            const buylistInfo = hasBuylist ? buylistMap.get(product.id) : null;

            return (
              <div
                key={product.id}
                className={`p-3.5 bg-[#0E121B] rounded-2xl border transition-all shadow-md space-y-3 ${
                  posMode === 'BUY' && hasBuylist
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Foto miniatura con formato vertical TCG */}
                  <div
                    className="relative w-12 h-16 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 cursor-zoom-in group/card hover:border-emerald-500/50 transition-all shadow-sm"
                    onMouseEnter={() => {
                      if (product.imageUrl) setHoveredImage(product.imageUrl);
                    }}
                    onMouseLeave={() => setHoveredImage(null)}
                  >
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-0.5 group-hover/card:scale-105 transition-transform"
                        sizes="48px"
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
                      {hasBuylist && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                          En tu Buylist
                        </span>
                      )}
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
                    </div>
                  </div>

                  {/* Si estamos en MODO COMPRA: Botón de Compra Directa */}
                  {posMode === 'BUY' && (
                    <div className="flex flex-col items-end gap-1">
                      {buylistInfo ? (
                        <div className="text-right text-[10px]">
                          <span className="text-emerald-400 font-mono font-bold block">
                            Cash: ${buylistInfo.cashPrice.toLocaleString('es-CL')}
                          </span>
                          <span className="text-cyan-300 font-mono font-bold block">
                            Crédito: ${buylistInfo.creditPrice.toLocaleString('es-CL')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/40 block">
                          Precio manual en ticket
                        </span>
                      )}
                      <button
                        onClick={() => onAddBuyItem && onAddBuyItem(product)}
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                      >
                        <span>+ Comprar</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Si estamos en MODO VENTA: Mostrar variantes de stock para vender */}
                {posMode === 'SELL' && (
                  <>
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
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Zoom flotante flotando junto al cursor en document.body (Portal) solo cuando está montado en cliente */}
      {hoveredImage && isMounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999999] pointer-events-none shadow-2xl rounded-2xl border-2 border-white/20 bg-black/95 overflow-hidden transition-all duration-150 animate-in fade-in zoom-in-95 p-1.5"
          style={{
            top: typeof window !== 'undefined' && mousePos.y > window.innerHeight * 0.55
              ? Math.max(10, mousePos.y - 320)
              : Math.max(10, mousePos.y + 15),
            left: Math.min(
              typeof window !== 'undefined' ? window.innerWidth - 240 : 800,
              mousePos.x + 20
            ),
            width: '210px',
            height: '294px',
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src={hoveredImage}
              alt="Preview"
              fill
              className="object-contain rounded-xl"
              priority
              unoptimized={true}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
