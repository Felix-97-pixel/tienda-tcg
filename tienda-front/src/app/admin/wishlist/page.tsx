"use client";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import SearchableSelect from "@/components/Common/SearchableSelect";

interface Product {
  id: string;
  name: string;
  categoryId: string;
  imageUrl?: string;
  category?: { name: string };
  cardDetail?: { expansion: string; rarity: string };
  items: any[];
  wishlistCount?: number;
}

export default function AdminWishlist() {
  const t = useTranslations("wishlist");
  const tc = useTranslations("common");

  const [allWishlistItems, setAllWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [expansionsList, setExpansionsList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin`)
      .then((res) => res.json())
      .then(setCategoriesList)
      .catch(console.error);

    setLoading(true);
    fetch(`${API_URL}/wishlist/count`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAllWishlistItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    let url = `${API_URL}/products/meta/expansions`;
    if (selectedCategory) url += `?category=${encodeURIComponent(selectedCategory)}`;
    fetch(url).then((res) => res.json()).then(setExpansionsList).catch(console.error);
    setSelectedExpansion("");
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    let filtered = [...allWishlistItems];
    if (searchTerm) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedCategory) filtered = filtered.filter(p => p.category?.name === selectedCategory);
    if (selectedExpansion) filtered = filtered.filter(p => p.cardDetail?.expansion === selectedExpansion);
    return filtered;
  }, [allWishlistItems, searchTerm, selectedCategory, selectedExpansion]);

  const totalPages = Math.ceil(filteredItems.length / LIMIT) || 1;
  const paginatedItems = filteredItems.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="p-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight">{t("title")}</h1>
          <p className="text-dark-4 text-sm font-medium mt-1">{t("subtitle")}</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-pink-50 border border-pink-100 flex items-center gap-2">
           <span className="text-pink-500 text-xl animate-pulse">♥</span>
           <span className="text-xs font-black text-pink-700 uppercase tracking-widest">{t("stats.total", { count: allWishlistItems.length })}</span>
        </div>
      </div>

      {/* Filtros Premium */}
      <div className="bg-white rounded-3xl shadow-1 p-6 border border-transparent hover:border-stroke transition-all duration-300">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-[10px] font-black text-dark-4 uppercase tracking-widest">{tc("search")}</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder={t("filters.searchPlaceholder")} 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full rounded-2xl border border-stroke bg-gray-50 py-3 px-5 text-sm font-medium outline-none focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/5 transition-all" 
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black text-dark-4 uppercase tracking-widest">{t("filters.category")}</label>
            <SearchableSelect 
              options={[{ label: t("filters.allCategories"), value: "" }, ...categoriesList.map(c => ({ label: c.name, value: c.name }))]} 
              value={selectedCategory}
              onChange={(val) => { setSelectedCategory(val); setPage(1); }}
              placeholder={t("filters.allCategories")} 
            />
          </div>
          <div>
            <label className="mb-2 block text-[10px] font-black text-dark-4 uppercase tracking-widest">{t("filters.expansion")}</label>
            <SearchableSelect 
              options={[{ label: t("filters.allExpansions"), value: "" }, ...expansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))]} 
              value={selectedExpansion}
              onChange={(val) => { setSelectedExpansion(val); setPage(1); }}
              placeholder={t("filters.expansionPlaceholder")} 
              disabled={expansionsList.length === 0} 
            />
          </div>
        </div>
      </div>

      {/* Tabla Premium */}
      <div className="bg-white rounded-3xl shadow-1 overflow-hidden border border-transparent hover:border-stroke transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-stroke">
                <th className="py-5 px-8 font-black text-dark-4 text-[10px] uppercase tracking-widest">{t("table.product")}</th>
                <th className="py-5 px-8 font-black text-dark-4 text-[10px] uppercase tracking-widest hidden md:table-cell">{t("table.editionRarity")}</th>
                <th className="py-5 px-8 font-black text-dark-4 text-[10px] uppercase tracking-widest text-center">{t("table.wishes")}</th>
                <th className="py-5 px-8 font-black text-dark-4 text-[10px] uppercase tracking-widest text-right">{t("table.currentPrice")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="py-6 px-8"><div className="h-10 bg-gray-1 rounded-2xl w-full"></div></td>
                  </tr>
                ))
              ) : paginatedItems.length === 0 ? (
                <tr><td colSpan={4} className="py-20 text-center text-dark-4 font-black uppercase tracking-widest text-xs">{tc("noResults")}</td></tr>
              ) : (
                paginatedItems.map((product) => (
                  <tr key={product.id} className="group hover:bg-gray-50 transition-all duration-200">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-1 border border-stroke transition-transform group-hover:scale-110">
                          {product.imageUrl
                            ? <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="object-cover h-full w-full" />
                            : <div className="h-full w-full flex items-center justify-center text-[10px] font-black text-dark-4 uppercase">{tc("noImage")}</div>}
                        </div>
                        <p className="text-dark font-black text-sm tracking-tight">{product.name}</p>
                      </div>
                    </td>
                    <td className="py-5 px-8 hidden md:table-cell">
                      <p className="text-dark font-bold text-xs">{product.cardDetail?.expansion || tc("general")}</p>
                      <p className="text-blue font-black text-[9px] uppercase tracking-widest mt-1 opacity-60">{product.cardDetail?.rarity}</p>
                    </td>
                    <td className="py-5 px-8 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-100">
                        <span className="text-pink-500 font-bold">♥</span>
                        <span className="text-xs font-black text-pink-700">{product.wishlistCount || 0}</span>
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <p className="text-sm font-black text-dark tracking-tighter">
                        ${Number(product.items[0]?.price || 0).toLocaleString('es-CL')}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-8 py-5 border-t border-stroke bg-gray-50/30">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(page - 1)} 
              className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-stroke text-dark-4 hover:bg-white hover:text-blue hover:border-blue transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              {tc("previous")}
            </button>
            <span className="text-[10px] font-black text-dark-4 uppercase tracking-[0.2em] bg-white px-4 py-2 rounded-xl border border-stroke shadow-sm">
              {tc("page", { current: page, total: totalPages })}
            </span>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage(page + 1)} 
              className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border border-stroke text-dark-4 hover:bg-white hover:text-blue hover:border-blue transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95"
            >
              {tc("next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
