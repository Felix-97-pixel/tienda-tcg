"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { List, Column } from "@/components/ui/List";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types/product";
import { IconPencil, IconTrash, IconTrendingUp } from "@/components/ui/Icons";

export interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit?: (product: Product, item: any) => void;
  onInventory?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  isSuperAdminCatalog?: boolean;
}

export default function ProductTable({
  products,
  loading,
  onEdit,
  onInventory,
  onDelete,
  onViewHistory,
  page,
  totalPages,
  onPageChange,
  isSuperAdminCatalog = false,
}: ProductTableProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: t("table.product"),
      render: (product) => (
        <div className="flex items-center gap-3">
          <div 
            className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#080B12] border border-white/10 cursor-zoom-in transition-transform group-hover:scale-105"
            onMouseEnter={() => product.imageUrl && setHoveredImage(product.imageUrl)}
            onMouseLeave={() => setHoveredImage(null)}
          >
            {product.imageUrl 
              ? (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  width={48} 
                  height={48} 
                  className="object-cover h-full w-full" 
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src && target.src.includes("?")) {
                      target.src = target.src.split("?")[0];
                    }
                  }}
                />
              )
              : <span className="text-[10px] text-white/40 flex h-full items-center justify-center font-bold uppercase">{t("noImage")}</span>
            }
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{product.name}</p>
            <p className="text-[10px] text-white/50 mt-1 font-medium">{product.category?.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "expansion",
      header: t("filters.expansion"),
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
      render: (product) => (
        <>
          <p className="text-white font-medium text-sm">{product.cardDetail?.expansion || tc("notAvailable")}</p>
          <p className="text-[10px] text-white/50 font-bold uppercase">{product.cardDetail?.rarity}</p>
        </>
      ),
    },
    ...(isSuperAdminCatalog
      ? [
          {
            key: "marketPrices",
            header: "Cotización de Mercado Oficial (USD)",
            render: (product: Product) => {
              const prices = product.marketPrices || [];
              if (prices.length === 0) {
                return (
                  <span className="text-xs text-white/40 italic">
                    Sin cotización sincronizada
                  </span>
                );
              }
              return (
                <div className="flex flex-wrap items-center gap-1.5">
                  {prices.map((mp: any) => (
                    <button
                      key={mp.id || mp.finishId}
                      type="button"
                      onClick={() => onViewHistory?.(product)}
                      title="Ver Historial de Precios"
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#080B12] border border-white/10 text-xs font-mono font-bold text-emerald-400 ${
                        onViewHistory
                          ? "hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                          : ""
                      }`}
                    >
                      <span className="text-[10px] text-white/50 font-sans font-normal uppercase">
                        {mp.finish?.name || "Normal"}:
                      </span>
                      ${Number(mp.price).toFixed(2)}
                      {onViewHistory && (
                        <IconTrendingUp className="w-3 h-3 text-emerald-400/70" />
                      )}
                    </button>
                  ))}
                </div>
              );
            },
          },
        ]
      : []),
    {
      key: "actions",
      header: t("table.actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (product) => {
        // En el panel de administración de tienda, la cantidad de variantes es la del inventario físico
        const variationsCount = product.items ? product.items.length : 0;

        return (
          <div className="flex items-center justify-end gap-2">
            {!isSuperAdminCatalog && onInventory && product.category?.isTcg && (
              <Button 
                size="sm"
                onClick={() => onInventory(product)}
              >
                {t("table.manage", { count: variationsCount })}
              </Button>
            )}

            {isSuperAdminCatalog && onViewHistory && (
              <Button
                size="sm"
                variant="secondary"
                className="!px-3 !py-2.5 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                onClick={() => onViewHistory(product)}
                title="Ver Gráfico de Histórico de Precios"
              >
                <IconTrendingUp className="w-4 h-4" />
              </Button>
            )}
          
            {onEdit && (
              <Button 
                size="sm"
                variant="secondary"
                className="!px-3 !py-2.5 hover:border-red/40 hover:text-red hover:bg-red/5 group"
                onClick={() => onEdit(product, product.items?.[0])}
                title={tc("edit")}
              >
                <IconPencil className="w-4 h-4 transition-colors" />
              </Button>
            )}
            {onDelete && (
              <Button 
                size="sm"
                variant="danger"
                className="!px-3 !py-2.5"
                onClick={() => onDelete(product)}
                title={tc("delete")}
              >
                <IconTrash className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {/* HOVER PREVIEW */}
      {hoveredImage && (
        <div 
          className="fixed z-99999 pointer-events-none shadow-2xl rounded-2xl border-2 border-white/20 bg-[#0E121B] shadow-black overflow-hidden transition-all duration-200 animate-in fade-in zoom-in"
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
            width={280} 
            height={390} 
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

      <List
        wrapperProps={{ onMouseMove: handleMouseMove }}
        columns={columns}
        data={products}
        loading={loading}
        keyExtractor={(product) => product.id}
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
}
