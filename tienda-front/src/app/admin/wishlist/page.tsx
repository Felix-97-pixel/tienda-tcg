"use client";
import { API_URL } from "@/utils/api";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface InventoryItem {
  id: string;
  price: number;
  stock: number;
  condition: string;
  isFoil: boolean;
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  imageUrl?: string;
  category?: { name: string };
  cardDetail?: { expansion: string; rarity: string };
  items: InventoryItem[];
  wishlistCount?: number;
}

function SearchableSelect({ options, value, onChange, placeholder, disabled = false }: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedOption = options.find((o) => o.value === value);
  const displayValue = isOpen ? search : selectedOption ? selectedOption.label : "";
  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="relative w-full">
      <input
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onFocus={() => { setIsOpen(true); setSearch(""); }}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => { setTimeout(() => setIsOpen(false), 200); }}
        className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 pl-4 pr-10 text-sm text-dark outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-gray-2"
      />
      {value && !disabled && (
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(""); setSearch(""); setIsOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-4 hover:text-dark" title="Limpiar">✕</button>
      )}
      {isOpen && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-3 bg-white shadow-lg">
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-2 text-sm text-dark-4">No hay resultados</li>
          ) : (
            filteredOptions.map((opt) => (
              <li key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`cursor-pointer px-4 py-2 hover:bg-gray-1 text-sm text-dark ${value === opt.value ? 'bg-gray-1 font-bold' : ''}`}>
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function AdminWishlist() {
  const [allWishlistItems, setAllWishlistItems] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string; isTcg?: boolean }[]>([]);
  const [expansionsList, setExpansionsList] = useState<{ name: string; products: number }[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin`)
      .then((res) => res.json())
      .then((data) => setCategoriesList(data))
      .catch((err) => console.error(err));
  }, []);

  const fetchWishlistData = () => {
    setLoading(true);
    fetch(`${API_URL}/wishlist/count`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setAllWishlistItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => { console.error("Error:", err); setLoading(false); });
  };

  useEffect(() => { fetchWishlistData(); }, []);

  useEffect(() => {
    setExpansionsList([]);
    setSelectedExpansion("");
    let url = `${API_URL}/products/meta/expansions`;
    if (selectedCategory) url += `?category=${encodeURIComponent(selectedCategory)}`;
    fetch(url).then((res) => res.json()).then((data) => setExpansionsList(data)).catch(console.error);
  }, [selectedCategory]);

  useEffect(() => {
    if (!Array.isArray(allWishlistItems)) return;
    let filtered = [...allWishlistItems];
    if (searchTerm) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedCategory) filtered = filtered.filter(p => p.category?.name === selectedCategory);
    if (selectedExpansion) filtered = filtered.filter(p => p.cardDetail?.expansion === selectedExpansion);
    const limit = 20;
    setTotalPages(Math.ceil(filtered.length / limit) || 1);
    setProducts(filtered.slice((page - 1) * limit, page * limit));
  }, [allWishlistItems, page, searchTerm, selectedCategory, selectedExpansion]);

  const categoryOptions = [{ label: "Todas las categorías", value: "" }, ...categoriesList.map(c => ({ label: c.name, value: c.name }))];
  const expansionOptions = [{ label: "Todas las expansiones", value: "" }, ...expansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">Wishlist</h1>
        <p className="text-dark-4 text-sm mt-1">Productos más deseados por los clientes</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-1 p-5">
        <p className="text-sm font-medium text-dark mb-3">Filtros</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">Buscar por Nombre</label>
            <input type="text" placeholder="Ej. Black Lotus..." value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-4 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">Categoría / Juego</label>
            <SearchableSelect options={categoryOptions} value={selectedCategory}
              onChange={(val) => { setSelectedCategory(val); setPage(1); }} placeholder="Selecciona Categoría" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-dark-4">Expansión</label>
            <SearchableSelect options={expansionOptions} value={selectedExpansion}
              onChange={(val) => { setSelectedExpansion(val); setPage(1); }} placeholder="Selecciona Expansión"
              disabled={expansionsList.length === 0} />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-3">
          <h2 className="font-semibold text-dark">Productos en wishlists</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-1 text-left">
                <th className="py-3 px-6 font-medium text-dark-4 text-sm">Producto</th>
                <th className="py-3 px-6 font-medium text-dark-4 text-sm hidden md:table-cell">Edición</th>
                <th className="py-3 px-6 font-medium text-dark-4 text-sm">En Wishlists</th>
                <th className="py-3 px-6 font-medium text-dark-4 text-sm">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <svg className="animate-spin h-6 w-6 text-blue mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={4} className="py-12 text-center text-dark-4 text-sm">No se encontraron productos</td></tr>
              ) : (
                products.map((product) => {
                  const mainItem = product.items[0];
                  return (
                    <tr key={product.id} className="hover:bg-gray-1 transition">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-2">
                          {product.imageUrl
                            ? <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="object-cover h-full w-full" />
                            : <span className="text-[10px] text-dark-4 flex h-full items-center justify-center">Sin img</span>}
                        </div>
                        <p className="text-dark font-medium text-sm">{product.name}</p>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell">
                        <p className="text-dark text-sm">{product.cardDetail?.expansion || "N/A"}</p>
                        <p className="text-dark-4 text-xs">{product.cardDetail?.rarity}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${(product.wishlistCount || 0) > 0 ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                          ♥ {product.wishlistCount || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-dark font-bold text-sm">
                          ${Number(mainItem?.price || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-3">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg text-sm border border-gray-3 text-dark-4 hover:bg-gray-1 transition disabled:opacity-40">← Anterior</button>
          <span className="text-sm text-dark-4">Página {page} de {totalPages}</span>
          <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg text-sm border border-gray-3 text-dark-4 hover:bg-gray-1 transition disabled:opacity-40">Siguiente →</button>
        </div>
      </div>
    </div>
  );
}
