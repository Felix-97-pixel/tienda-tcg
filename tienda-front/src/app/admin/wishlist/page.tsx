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
  category?: {
    name: string;
  };
  cardDetail?: {
    expansion: string;
    rarity: string;
  };
  items: InventoryItem[];
  wishlistCount?: number;
}

// Custom Searchable Dropdown Component
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false
}: {
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
        onFocus={() => {
          setIsOpen(true);
          setSearch("");
        }}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 200);
        }}
        className="w-full rounded border border-stroke bg-white py-2 pl-4 pr-10 text-sm font-medium text-black outline-none transition focus:border-primary active:border-primary disabled:bg-gray-2"
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange("");
            setSearch("");
            setIsOpen(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          title="Limpiar selección"
        >
          ✕
        </button>
      )}
      {isOpen && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded border border-stroke bg-white shadow-default">
          {filteredOptions.length === 0 ? (
            <li className="px-4 py-2 text-sm text-gray-500">No hay resultados</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-4 py-2 hover:bg-gray-2 text-sm text-black ${value === opt.value ? 'bg-gray-2 font-bold' : ''}`}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const [allWishlistItems, setAllWishlistItems] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");

  // Dropdown Lists
  const [categoriesList, setCategoriesList] = useState<{ id: string, name: string, isTcg?: boolean }[]>([]);
  const [expansionsList, setExpansionsList] = useState<{ name: string, products: number }[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Categories on Mount
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin`)
      .then((res) => res.json())
      .then((data) => setCategoriesList(data))
      .catch((err) => console.error(err));
  }, []);

  const fetchWishlistData = () => {
    setLoading(true);
    fetch(`${API_URL}/wishlist/count`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllWishlistItems(data);
        } else {
          console.error("Expected array but got:", data);
          setAllWishlistItems([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWishlistData();
  }, []);

  // Fetch Expansions when Category changes
  useEffect(() => {
    setExpansionsList([]);
    setSelectedExpansion(""); // Reset expansion filter

    let url = `${API_URL}/products/meta/expansions`;
    if (selectedCategory) {
      url += `?category=${encodeURIComponent(selectedCategory)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => setExpansionsList(data))
      .catch((err) => console.error(err));
  }, [selectedCategory]);

  // Filter and paginate locally
  useEffect(() => {
    if (!Array.isArray(allWishlistItems)) return;
    let filtered = [...allWishlistItems];

    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category?.name === selectedCategory);
    }
    if (selectedExpansion) {
      filtered = filtered.filter(p => p.cardDetail?.expansion === selectedExpansion);
    }

    const limit = 20;
    setTotalPages(Math.ceil(filtered.length / limit) || 1);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setProducts(filtered.slice(startIndex, endIndex));
  }, [allWishlistItems, page, searchTerm, selectedCategory, selectedExpansion]);


  const categoryOptions = [
    { label: "Todas las categorías", value: "" },
    ...categoriesList.map(c => ({ label: c.name, value: c.name }))
  ];


  const expansionOptions = [
    { label: "Todas las expansiones", value: "" },
    ...expansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black">
          Wishlist
        </h2>
      </div>

      {/* FILTROS AVANZADOS */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 rounded-sm border border-stroke bg-gray-2 p-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-black">Buscar por Nombre</label>
          <input
            type="text"
            placeholder="Ej. Black Lotus..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full rounded border border-stroke bg-white py-2 px-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black">Filtrar por Categoría / Juego</label>
          <SearchableSelect
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => {
              setSelectedCategory(val);
              setPage(1);
            }}
            placeholder="Selecciona Categoría"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black">Filtrar por Expansión</label>
          <SearchableSelect
            options={expansionOptions}
            value={selectedExpansion}
            onChange={(val) => {
              setSelectedExpansion(val);
              setPage(1);
            }}
            placeholder="Selecciona Expansión"
            disabled={expansionsList.length === 0}
          />
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <th className="py-4 px-4 font-medium text-black">Producto</th>
                <th className="py-4 px-4 font-medium text-black hidden md:table-cell">Edición</th>
                <th className="py-4 px-4 font-medium text-black">Cantidad en Wishlist</th>
                <th className="py-4 px-4 font-medium text-black">Precio</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-5 text-center">Cargando productos...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-5 text-center">No se encontraron productos</td>
                </tr>
              ) : (
                products.map((product) => {
                  const mainItem = product.items[0]; // For MVP, grab the first inventory item
                  return (
                    <tr key={product.id}>
                      <td className="border-b border-[#eee] py-5 px-4 flex items-center gap-3">
                        <div className="h-12 w-12 rounded overflow-hidden relative flex-shrink-0 bg-gray-2">
                          {product.imageUrl ? (
                            <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="object-cover h-full w-full" />
                          ) : (
                            <span className="text-[10px] text-gray-500 flex h-full items-center justify-center">Sin Img</span>
                          )}
                        </div>
                        <p className="text-black font-medium">{product.name}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 hidden md:table-cell">
                        <p className="text-black text-sm">{product.cardDetail?.expansion || "N/A"}</p>
                        <p className="text-gray-500 text-xs">{product.cardDetail?.rarity}</p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4">
                        <p className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${(product.wishlistCount || 0) > 0 ? "bg-success text-success bg-opacity-10" : "bg-danger text-danger bg-opacity-10"}`}>
                          {product.wishlistCount || 0}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4">
                        <p className="text-black font-bold">
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

        {/* Paginación */}
        <div className="flex justify-between items-center py-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded bg-gray-2 py-1 px-3 text-sm disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="rounded bg-gray-2 py-1 px-3 text-sm disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

    </>
  );
}
