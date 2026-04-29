"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");
  
  // Dropdown Lists
  const [categoriesList, setCategoriesList] = useState<{id: string, name: string, isTcg?: boolean}[]>([]);
  const [expansionsList, setExpansionsList] = useState<{name: string, products: number}[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    productId: string;
    categoryId: string;
    imageUrl: string;
    productName: string;
    itemId: string;
    price: number;
    stock: number;
  } | null>(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [creatingProduct, setCreatingProduct] = useState({
    name: "",
    categoryId: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    description: "",
  });

  // Fetch Categories on Mount
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin`)
      .then((res) => res.json())
      .then((data) => setCategoriesList(data))
      .catch((err) => console.error(err));
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

  const fetchProducts = () => {
    setLoading(true);
    const url = new URL(`${API_URL}/products`);
    url.searchParams.append("page", page.toString());
    url.searchParams.append("limit", "20");
    if (searchTerm) {
      url.searchParams.append("search", searchTerm);
    }
    if (selectedCategory) {
      url.searchParams.append("category", selectedCategory);
    }
    if (selectedExpansion) {
      url.searchParams.append("expansion", selectedExpansion);
    }

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setTotalPages(data.meta?.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  };

  // Debounced Fetch
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [page, searchTerm, selectedCategory, selectedExpansion]);

  const openEditModal = (product: Product, item: InventoryItem) => {
    setEditingItem({
      productId: product.id,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl || "",
      productName: product.name,
      itemId: item.id,
      price: item.price,
      stock: item.stock,
    });
    setIsModalOpen(true);
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const resInv = await fetch(`${API_URL}/products/inventory/${editingItem.itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(editingItem.price),
          stock: Number(editingItem.stock),
        }),
        credentials: "include",
      });

      const resProd = await fetch(`${API_URL}/products/${editingItem.productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: editingItem.imageUrl,
        }),
        credentials: "include",
      });

      if (resInv.ok && resProd.ok) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === editingItem.productId) {
              return {
                ...p,
                imageUrl: editingItem.imageUrl,
                items: p.items.map((i) =>
                  i.id === editingItem.itemId
                    ? { ...i, price: Number(editingItem.price), stock: Number(editingItem.stock) }
                    : i
                ),
              };
            }
            return p;
          })
        );
        setIsModalOpen(false);
      } else {
        alert("Error al actualizar el producto");
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un error de conexión");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);
    try {
      if (creatingProduct.imageUrl) {
        await fetch(`${API_URL}/upload/image`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: creatingProduct.imageUrl }),
          credentials: "include",
        }).catch(err => console.error("No se pudo borrar imagen antigua", err));
      }

      const res = await fetch(`${API_URL}/upload/image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCreatingProduct({ ...creatingProduct, imageUrl: data.url });
      } else {
        alert("Error al subir la imagen");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión al subir la imagen");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);
    try {
      if (editingItem.imageUrl) {
        await fetch(`${API_URL}/upload/image`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: editingItem.imageUrl }),
          credentials: "include",
        }).catch(err => console.error("No se pudo borrar imagen antigua", err));
      }

      const res = await fetch(`${API_URL}/upload/image`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setEditingItem({ ...editingItem, imageUrl: data.url });
      } else {
        alert("Error al subir la imagen");
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un error de conexión");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!creatingProduct.imageUrl) return;
    
    try {
      await fetch(`${API_URL}/upload/image`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: creatingProduct.imageUrl }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Error al borrar la imagen:", err);
    }
    
    setCreatingProduct({ ...creatingProduct, imageUrl: "" });
  };

  const handleEditRemoveImage = async () => {
    if (!editingItem?.imageUrl) return;
    
    try {
      await fetch(`${API_URL}/upload/image`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: editingItem.imageUrl }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Error al borrar la imagen:", err);
    }
    
    setEditingItem({ ...editingItem, imageUrl: "" });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...creatingProduct,
          price: Number(creatingProduct.price),
          stock: Number(creatingProduct.stock),
        }),
        credentials: "include",
      });

      if (res.ok) {
        alert("Producto creado exitosamente");
        setIsCreateOpen(false);
        setCreatingProduct({ name: "", categoryId: "", price: 0, stock: 0, imageUrl: "", description: "" });
        fetchProducts(); // Refresh list
      } else {
        const data = await res.json();
        alert(`Error al crear producto: ${data.message || "Hubo un problema"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un error de red al crear el producto.");
    }
  };

  const categoryOptions = [
    { label: "Todas las categorías", value: "" },
    ...categoriesList.map(c => ({ label: c.name, value: c.name }))
  ];

  const createCategoryOptions = categoriesList.map(c => ({ label: c.name, value: c.id }));

  const expansionOptions = [
    { label: "Todas las expansiones", value: "" },
    ...expansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))
  ];

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black">
          Inventario de Productos
        </h2>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded bg-blue py-2 px-4 font-medium text-white hover:bg-opacity-90"
        >
          + Agregar Producto Manual
        </button>
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
                <th className="py-4 px-4 font-medium text-black">Stock</th>
                <th className="py-4 px-4 font-medium text-black">Precio</th>
                <th className="py-4 px-4 font-medium text-black">Acciones</th>
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
                            <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="cover" />
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
                        <p className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${mainItem?.stock > 0 ? "bg-success text-success bg-opacity-10" : "bg-danger text-danger bg-opacity-10"}`}>
                          {mainItem?.stock || 0}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4">
                        <p className="text-black font-bold">
                          ${Number(mainItem?.price || 0).toLocaleString('es-CL')}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4">
                        {mainItem && (
                          <button
                            onClick={() => openEditModal(product, mainItem)}
                            className="hover:text-blue bg-gray-1 py-1 px-3 rounded text-sm text-black"
                          >
                            Editar
                          </button>
                        )}
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

      {/* MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-default">
            <h3 className="mb-4 text-xl font-bold text-black">
              Editar Inventario
            </h3>
            <p className="mb-4 text-sm text-gray-500">{editingItem.productName}</p>
            <form onSubmit={handleUpdateItem}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">
                  Stock Disponible
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingItem.stock}
                  onChange={(e) => setEditingItem({ ...editingItem, stock: Number(e.target.value) })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">
                  Stock Disponible
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingItem.stock}
                  onChange={(e) => setEditingItem({ ...editingItem, stock: Number(e.target.value) })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              {!categoriesList.find(c => c.id === editingItem.categoryId)?.isTcg && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-black">Imagen del Producto (Opcional)</label>
                  {editingItem.imageUrl ? (
                    <div className="mb-3">
                      <div className="relative h-24 w-32 rounded border border-stroke bg-gray-1 flex items-center justify-center overflow-hidden mb-2">
                        <Image src={editingItem.imageUrl} alt="Vista previa" fill className="object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={handleEditRemoveImage}
                        className="text-sm text-danger hover:underline"
                      >
                        Eliminar Imagen
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageUpload}
                        disabled={uploadingImage}
                        className="w-full cursor-pointer rounded border-[1.5px] border-stroke bg-transparent font-medium text-black outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                      />
                      {uploadingImage && <span className="text-sm text-blue">Subiendo...</span>}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded bg-gray-3 py-2 px-4 font-medium text-black hover:bg-gray-4"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue py-2 px-4 font-medium text-white hover:bg-opacity-90"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-default max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-xl font-bold text-black">
              Agregar Producto Nuevo
            </h3>
            <form onSubmit={handleCreateProduct}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={creatingProduct.name}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, name: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">Categoría</label>
                <select
                  required
                  value={creatingProduct.categoryId}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, categoryId: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary appearance-none"
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {createCategoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {!categoriesList.find(c => c.id === creatingProduct.categoryId)?.isTcg && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-black">Imagen del Producto (Opcional)</label>
                  {creatingProduct.imageUrl ? (
                    <div className="mb-3">
                      <div className="relative h-24 w-32 rounded border border-stroke bg-gray-1 flex items-center justify-center overflow-hidden mb-2">
                        <Image src={creatingProduct.imageUrl} alt="Vista previa" fill className="object-contain" />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-sm text-danger hover:underline"
                      >
                        Eliminar Imagen
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="w-full cursor-pointer rounded border-[1.5px] border-stroke bg-transparent font-medium text-black outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                      />
                      {uploadingImage && <span className="text-sm text-blue">Subiendo...</span>}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={creatingProduct.stock}
                    onChange={(e) => setCreatingProduct({ ...creatingProduct, stock: Number(e.target.value) })}
                    className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">Precio</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={creatingProduct.price}
                    onChange={(e) => setCreatingProduct({ ...creatingProduct, price: Number(e.target.value) })}
                    className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-black">Descripción (Opcional)</label>
                <textarea
                  value={creatingProduct.description}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, description: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                  rows={3}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded bg-gray-3 py-2 px-4 font-medium text-black hover:bg-gray-4"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue py-2 px-4 font-medium text-white hover:bg-opacity-90"
                >
                  Crear Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
