"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { List, Column } from "@/components/ui/List";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types/product";

export interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product, item: any) => void;
  onInventory: (product: Product) => void;
  onDelete: (product: Product) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function ProductTable({ products, loading, onEdit, onInventory, onDelete, page, totalPages, onPageChange }: ProductTableProps) {
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
            className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1d24]/5 border border-white/10 cursor-zoom-in transition-transform group-hover:scale-105"
            onMouseEnter={() => product.imageUrl && setHoveredImage(product.imageUrl)}
            onMouseLeave={() => setHoveredImage(null)}
          >
            {product.imageUrl 
              ? <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="object-cover h-full w-full" />
              : <span className="text-[10px] text-gray-5 flex h-full items-center justify-center font-bold uppercase">{t("noImage")}</span>
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
      header: t("filters.expansion"),
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
      render: (product) => (
        <>
          <p className="text-white font-medium text-sm">{product.cardDetail?.expansion || tc("notAvailable")}</p>
          <p className="text-[10px] text-gray-4 font-bold uppercase">{product.cardDetail?.rarity}</p>
        </>
      ),
    },
    {
      key: "actions",
      header: t("table.actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (product) => {
        const isGlobal = !product.storeId;
        const variationsCount = isGlobal ? (product.marketPrices?.length || 0) : (product.items?.length || 0);

        return (
          <div className="flex items-center justify-end gap-2">
            {product.category?.isTcg && (
              <Button 
                size="sm"
                onClick={() => onInventory(product)}
              >
                {t("table.manage", { count: variationsCount })}
              </Button>
            )}
          
          <Button 
            size="sm"
            variant="secondary"
            className="px-3 bg-blue/10 text-blue hover:bg-blue hover:text-white"
            onClick={() => onEdit(product, product.items?.[0])}
            title={tc("edit")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </Button>
          <Button 
            size="sm"
            variant="danger"
            className="px-3"
            onClick={() => onDelete(product)}
            title={tc("delete")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </Button>
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
          className="fixed z-99999 pointer-events-none shadow-2xl rounded-2xl border-4 border-[#1C2434] bg-[#1C2434] overflow-hidden transition-all duration-200 animate-in fade-in zoom-in"
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
