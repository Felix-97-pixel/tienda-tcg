"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { List, Column } from "@/components/ui/List";
import { Button } from "@/components/ui/Button";
import { IconBox } from "@/components/ui/Icons";
import { Product } from "@/types/product";

export interface BuylistTableProps {
  products: Product[];
  loading: boolean;
  onManage: (product: Product) => void;
  onOpenGlobalSearch?: () => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function BuylistTable({ products, loading, onManage, onOpenGlobalSearch, page, totalPages, onPageChange }: BuylistTableProps) {
  const t = useTranslations("buylist_page");
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: t("col_product"),
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
              : <span className="text-[10px] text-white/40 flex h-full items-center justify-center font-bold uppercase">{t("no_image")}</span>
            }
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">{product.name}</p>
            <p className="text-[10px] text-gray-4 mt-1 font-medium">{product.category?.name}</p>
          </div>
        </div>
      ),
    },
    {
      key: "expansion",
      header: t("col_expansion"),
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
      render: (product) => (
        <>
          <p className="text-white font-medium text-sm">{product.cardDetail?.expansion || "N/A"}</p>
          <p className="text-[10px] text-gray-4 font-bold uppercase">{product.cardDetail?.rarity}</p>
        </>
      ),
    },
    {
      key: "actions",
      header: t("col_actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (product) => {
        // Obtenemos cuántas solicitudes de compra hay
        const buyListItemsCount = (product as any).buyListItems?.length || 0;

        return (
          <div className="flex items-center justify-end gap-2">
            {buyListItemsCount > 0 ? (
              <Button 
                size="sm"
                onClick={() => onManage(product)}
                variant="primary"
                className="text-xs font-bold"
              >
                {t("in_buylist_count", { count: buyListItemsCount })}
              </Button>
            ) : (
              <Button 
                size="sm"
                onClick={() => onManage(product)}
                variant="success"
                className="text-xs font-bold flex items-center gap-1"
              >
                <span>+</span>
                <span>{t("add_to_buylist")}</span>
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  if (products.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 text-white/50">
          <IconBox className="w-8 h-8 text-white/50" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{t("no_results_title")}</h3>
        <p className="text-gray-4 max-w-sm mb-5">
          {t("no_results_desc")}
        </p>
        {onOpenGlobalSearch && (
          <Button
            variant="success"
            onClick={onOpenGlobalSearch}
            className="flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
          >
            <span>+</span>
            <span>{t("search_add_card")}</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* HOVER PREVIEW */}
      {hoveredImage && (
        <div 
          className="fixed z-[99999] pointer-events-none shadow-[0_20px_60px_rgba(0,0,0,0.9)] rounded-2xl border-2 border-white/20 bg-[#0E121B] ring-1 ring-white/10 overflow-hidden transition-all duration-200 animate-in fade-in zoom-in"
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
