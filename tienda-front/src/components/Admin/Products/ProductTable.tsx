"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product, item: any) => void;
  onInventory: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductTable({ products, loading, onEdit, onInventory, onDelete }: ProductTableProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="bg-white rounded-2xl shadow-1 overflow-hidden" onMouseMove={handleMouseMove}>
      {/* HOVER PREVIEW */}
      {hoveredImage && (
        <div 
          className="fixed z-99999 pointer-events-none shadow-2xl rounded-2xl border-4 border-white bg-white overflow-hidden transition-all duration-200 animate-in fade-in zoom-in"
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

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-1 text-left">
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider">{t("table.product")}</th>
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider hidden md:table-cell">{t("filters.expansion")}</th>
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider">{t("table.stock")}</th>
              <th className="py-4 px-6 font-bold text-dark-4 text-xs uppercase tracking-wider text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="py-6 px-6"><div className="h-10 bg-gray-2 rounded-xl w-full"></div></td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-dark-4 text-sm font-medium">{tc("noResults")}</td></tr>
            ) : (
              products.map((product) => {
                const totalStock = product.items.reduce((sum, item) => sum + item.stock, 0);
                return (
                  <tr key={product.id} className="group hover:bg-blue/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-1 border border-stroke cursor-zoom-in transition-transform group-hover:scale-105"
                          onMouseEnter={() => product.imageUrl && setHoveredImage(product.imageUrl)}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          {product.imageUrl 
                            ? <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="object-cover h-full w-full" />
                            : <span className="text-[10px] text-dark-4 flex h-full items-center justify-center font-bold uppercase">{t("noImage")}</span>
                          }
                        </div>
                        <div>
                          <p className="text-dark font-bold text-sm leading-tight">{product.name}</p>
                          <p className="text-[10px] text-dark-4 mt-1 font-medium">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <p className="text-dark font-medium text-sm">{product.cardDetail?.expansion || tc("notAvailable")}</p>
                      <p className="text-[10px] text-dark-4 font-bold uppercase">{product.cardDetail?.rarity}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                        totalStock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {t("table.stockCount", { count: totalStock })}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.category?.isTcg ? (
                          <button 
                            onClick={() => onInventory(product)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue text-white shadow-lg shadow-blue/20 hover:bg-blue-700 transition-all active:scale-95"
                          >
                            {t("table.manage", { count: product.items.length })}
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => onEdit(product, product.items[0])}
                              className="p-2 rounded-lg bg-gray-1 text-dark-4 hover:bg-blue/10 hover:text-blue transition-all"
                              title={tc("edit")}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button 
                              onClick={() => onDelete(product)}
                              className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              title={tc("delete")}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
