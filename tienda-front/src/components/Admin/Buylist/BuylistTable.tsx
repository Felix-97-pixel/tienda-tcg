"use client";
import React, { useState } from "react";
import Image from "next/image";
import { List, Column } from "@/components/ui/List";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types/product";

export interface BuylistTableProps {
  products: Product[];
  loading: boolean;
  onManage: (product: Product) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export default function BuylistTable({ products, loading, onManage, page, totalPages, onPageChange }: BuylistTableProps) {
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "PRODUCTO",
      render: (product) => (
        <div className="flex items-center gap-3">
          <div 
            className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a1d24]/5 border border-white/10 cursor-zoom-in transition-transform group-hover:scale-105"
            onMouseEnter={() => product.imageUrl && setHoveredImage(product.imageUrl)}
            onMouseLeave={() => setHoveredImage(null)}
          >
            {product.imageUrl 
              ? <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="object-cover h-full w-full" />
              : <span className="text-[10px] text-gray-5 flex h-full items-center justify-center font-bold uppercase">Sin Imagen</span>
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
      header: "EXPANSIÓN",
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
      header: "ACCIONES",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (product) => {
        // Obtenemos cuántas solicitudes de compra hay
        // TypeScript definition of Product might not have buyListItems explicitly if generated dynamically,
        // but we know we passed it from backend
        const buyListItemsCount = (product as any).buyListItems?.length || 0;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button 
              size="sm"
              onClick={() => onManage(product)}
              variant={buyListItemsCount > 0 ? "primary" : "secondary"}
            >
              GESTIONAR ({buyListItemsCount})
            </Button>
          </div>
        );
      },
    },
  ];

  if (products.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-[#0f1115] rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🛒</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Sin Resultados</h3>
        <p className="text-gray-4 max-w-sm">
          No se encontraron cartas con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* HOVER PREVIEW */}
      {hoveredImage && (
        <div 
          className="fixed z-[99999] pointer-events-none shadow-2xl rounded-2xl border-4 border-[#1C2434] bg-[#1C2434] overflow-hidden transition-all duration-200 animate-in fade-in zoom-in"
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
