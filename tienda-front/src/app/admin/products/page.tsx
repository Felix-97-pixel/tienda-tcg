"use client";
import { API_URL } from "@/utils/api";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Papa from "papaparse";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import PreLoader from "@/components/Common/PreLoader";

interface InventoryItem {
  id: string;
  price: number;
  stock: number;
  condition: string;
  isFoil: boolean;
  language?: { name: string };
}

interface Product {
  id: string;
  name: string;
  categoryId: string;
  brandId?: string;
  imageUrl?: string;
  description?: string;
  category?: {
    name: string;
    isTcg: boolean;
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
  disabled = false,
  noResultsText = "No hay resultados"
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  noResultsText?: string;
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
            <li className="px-4 py-2 text-sm text-gray-500">{noResultsText}</li>
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
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");

  // Hover Preview State
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Dropdown Lists
  const [categoriesList, setCategoriesList] = useState<{ id: string, name: string, isTcg?: boolean }[]>([]);
  const [brandsList, setBrandsList] = useState<{ id: string, name: string }[]>([]);
  const [expansionsList, setExpansionsList] = useState<{ name: string, products: number }[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    productId: string;
    categoryId: string;
    brandId: string;
    imageUrl: string;
    productName: string;
    itemId: string;
    price: number;
    stock: number;
  } | null>(null);

  // Inventory Modal State
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [languages, setLanguages] = useState<{id: string, name: string}[]>([]);
  const [conditions, setConditions] = useState<{id: string, name: string}[]>([]);
  const [newVariation, setNewVariation] = useState({
    languageId: "",
    conditionId: "",
    price: 0,
    stock: 0,
    isFoil: false
  });

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isUploading: uploadingImage, handleUpload, handleRemove } = useImageUpload();
  const [creatingProduct, setCreatingProduct] = useState({
    name: "",
    categoryId: "",
    brandId: "",
    price: 0,
    stock: 0,
    imageUrl: "",
    description: "",
  });

  // Bulk Upload Modal State
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);

  // Fetch Categories and Brands on Mount
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin`)
      .then((res) => res.json())
      .then((data) => setCategoriesList(data))
      .catch((err) => console.error(err));

    fetch(`${API_URL}/products/meta/brands`)
      .then((res) => res.json())
      .then((data) => setBrandsList(data))
      .catch((err) => console.error(err));

    fetch(`${API_URL}/products/meta/languages`)
      .then((res) => res.json())
      .then((data) => {
        setLanguages(data);
        if (data.length > 0) setNewVariation(prev => ({ ...prev, languageId: data[0].id }));
      })
      .catch((err) => console.error(err));

    fetch(`${API_URL}/products/meta/conditions`)
      .then((res) => res.json())
      .then((data) => {
        setConditions(data);
        if (data.length > 0) setNewVariation(prev => ({ ...prev, conditionId: data[0].id }));
      })
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

  const handleSlugify = (name: string) => name.toLowerCase().trim().replace(/[\s\W-]+/g, '-');

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

  const openEditModal = (product: any, item: any) => {
    setEditingItem({
      productId: product.id,
      categoryId: product.categoryId,
      brandId: product.brandId || "",
      imageUrl: product.imageUrl || "",
      productName: product.name,
      itemId: item.id,
      price: item.price,
      stock: item.stock,
    });
    setIsModalOpen(true);
  };

  const openInventoryModal = (product: Product) => {
    setSelectedProduct(product);
    setIsInventoryOpen(true);
  };

  const handleAddVariation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      const res = await fetch(`${API_URL}/products/${selectedProduct.id}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVariation),
        credentials: "include"
      });
      if (res.ok) {
        showToast(tc("success"), "success");
        // Refrescar el producto seleccionado para ver el nuevo item
        const updatedProductRes = await fetch(`${API_URL}/products/${selectedProduct.id}`);
        const updatedProduct = await updatedProductRes.json();
        setSelectedProduct(updatedProduct);
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      } else {
        const data = await res.json();
        showToast(data.message || tc("error"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  const handleUpdateStockPrice = async (itemId: string, price: number, stock: number) => {
    try {
      const res = await fetch(`${API_URL}/products/inventory/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, stock }),
        credentials: "include"
      });
      if (res.ok) {
        showToast(tc("success"), "success");
        if (selectedProduct) {
          const updatedItems = selectedProduct.items.map(i => i.id === itemId ? { ...i, price, stock } : i);
          const updatedProduct = { ...selectedProduct, items: updatedItems };
          setSelectedProduct(updatedProduct);
          setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));
        }
      } else {
        showToast(tc("error"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
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
          name: editingItem.productName,
          categoryId: editingItem.categoryId,
          brandId: editingItem.brandId === "" ? null : editingItem.brandId,
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
                name: editingItem.productName,
                categoryId: editingItem.categoryId,
                brandId: editingItem.brandId,
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
        showToast(tc("success"), "success");
      } else {
        showToast(tc("error"), "error");
      }
    } catch (error) {
      console.error(error);
      showToast(tc("networkError"), "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const category = categoriesList.find(c => c.id === creatingProduct.categoryId);
    const folder = category ? `products/${handleSlugify(category.name)}` : 'products';
    
    const newUrl = await handleUpload(e, creatingProduct.imageUrl, folder);
    if (newUrl) {
      setCreatingProduct({ ...creatingProduct, imageUrl: newUrl });
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingItem) return;
    const category = categoriesList.find(c => c.id === editingItem.categoryId);
    const folder = category ? `products/${handleSlugify(category.name)}` : 'products';

    const newUrl = await handleUpload(e, editingItem.imageUrl, folder);
    if (newUrl) {
      setEditingItem({ ...editingItem, imageUrl: newUrl });
    }
  };

  const handleRemoveImage = async () => {
    const success = await handleRemove(creatingProduct.imageUrl);
    if (success) {
      setCreatingProduct({ ...creatingProduct, imageUrl: "" });
    }
  };

  const handleEditRemoveImage = async () => {
    if (!editingItem) return;
    const success = await handleRemove(editingItem.imageUrl);
    if (success) {
      setEditingItem({ ...editingItem, imageUrl: "" });
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...creatingProduct,
          brandId: creatingProduct.brandId === "" ? undefined : creatingProduct.brandId,
          price: Number(creatingProduct.price),
          stock: Number(creatingProduct.stock),
        }),
        credentials: "include",
      });

      if (res.ok) {
        showToast(tc("success"), "success");
        setIsCreateOpen(false);
        setCreatingProduct({ name: "", categoryId: "", brandId: "", price: 0, stock: 0, imageUrl: "", description: "" });
        fetchProducts(); // Refresh list
      } else {
        const data = await res.json();
        showToast(`${tc("error")}: ${data.message || ""}`, "error");
      }
    } catch (error) {
      console.error(error);
      showToast(tc("networkError"), "error");
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      // Delete image from Cloudinary if it exists
      if (product.imageUrl) {
        await handleRemove(product.imageUrl);
      }

      const res = await fetch(`${API_URL}/products/${product.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        showToast(tc("success"), "success");
      } else {
        const errData = await res.json();
        showToast(errData.message || tc("error"), "error");
      }
    } catch (e) {
      console.error(e);
      showToast(tc("error"), "error");
    }
  };

  const handleDownloadTemplate = async () => {
    if (!bulkCategory) return;
    try {
      const categoryName = categoriesList.find(c => c.id === bulkCategory)?.name || "";
      const res = await fetch(`${API_URL}/products?category=${encodeURIComponent(categoryName)}&limit=10000`);
      if (res.ok) {
        const data = await res.json();
        const csvData = data.data.map((p: any) => ({
          ID: p.id,
          Nombre: p.name,
          Stock: ""
        }));
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `plantilla_${categoryName.replace(/\s+/g, '_')}_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showToast(t("bulkDownloadError"), "error");
      }
    } catch (e) {
      console.error(e);
      showToast(tc("networkError"), "error");
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile || !bulkCategory) return;

    const selectedCategoryData = categoriesList.find(c => c.id === bulkCategory);
    if (selectedCategoryData?.isTcg !== false && !selectedCategoryData?.name.toLowerCase().includes("magic")) {
      showToast(t("bulkNotSupported"), "warning");
      return;
    }

    setIsUploadingBulk(true);
    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const originalData = results.data;
        try {
          if (selectedCategoryData?.isTcg !== false) {
              const items = originalData.map((row: any, index: number) => ({
                scryfallId: row["Scryfall ID"]?.trim() || undefined,
                name: row["Name"]?.trim() || "Unknown",
                expansion: row["Set name"]?.trim() || "Unknown",
                rarity: row["Rarity"]?.trim() || "Unknown",
                collectorNum: row["Collector number"]?.trim() || "0",
                quantity: parseInt(row["Quantity"]) || 1,
                price: (row["Purchase price"] || row["Price"]) ? parseFloat((row["Purchase price"] || row["Price"]).toString().replace(/[$,]/g, "")) : undefined,
                condition: row["Condition"]?.trim() || "near_mint",
                isFoil: row["Foil"]?.toLowerCase().includes("foil") || row["Foil"]?.toLowerCase() === "yes" || false,
                language: row["Language"]?.trim() || "es",
                originalIndex: index // Guardamos el índice original
              }));

            const res = await fetch(`${API_URL}/products/bulk-upload`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ categoryId: bulkCategory, items }),
              credentials: "include",
            });

            if (res.ok) {
              const data = await res.json();
              let msg = t("bulk.successMtg", { added: data.added, updated: data.updated, errors: data.errors.length });
              if (data.errors.length > 0) {
                const sampleErrors = data.errors.slice(0, 10).map((e: any) => e.error).join("\n- ");
                msg += `\n\n${t("bulk.formatDesc")}\n- ${sampleErrors}`;
                if (data.errors.length > 10) msg += `\n...${t("bulk.errorMessage")}`;

                // Download CSV of errors
                const failedItems = data.errors.map((e: any) => {
                  const row = (originalData[e.index] || {}) as Record<string, unknown>;
                  return {
                    ...row,
                    Error: e.error
                  };
                });
                const csv = Papa.unparse(failedItems);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `errores_carga_tcg_${Date.now()}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
              showToast(msg, data.errors.length > 0 ? "warning" : "success");
              setIsBulkOpen(false);
              setBulkFile(null);
              setBulkCategory("");
              fetchProducts();
            } else {
              showToast(t("bulk.errorBulk"), "error");
            }
          } else {
            const items = originalData.map((row: any, index: number) => ({
              id: row["ID"],
              stock: parseInt(row["Stock"]) || 0,
              originalIndex: index // Guardamos el índice original
            })).filter((item: any) => item.id);

            const res = await fetch(`${API_URL}/products/bulk-update-stock`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items }),
              credentials: "include",
            });

            if (res.ok) {
              const data = await res.json();
              let msg = t("bulk.successStock", { updated: data.updated, errors: data.errors.length });
              if (data.errors.length > 0) {
                const sampleErrors = data.errors.slice(0, 10).map((e: any) => e.error).join("\n- ");
                msg += `\n\n${t("bulk.formatDesc")}\n- ${sampleErrors}`;
                if (data.errors.length > 10) msg += `\n...${t("bulk.errorMessage")}`;

                // Download CSV of errors
                const failedItems = data.errors.map((e: any) => {
                  const row = (originalData[e.index] || {}) as Record<string, unknown>;
                  return {
                    ...row,
                    Error: e.error
                  };
                });
                const csv = Papa.unparse(failedItems);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", `errores_carga_stock_${Date.now()}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
              showToast(msg, data.errors.length > 0 ? "warning" : "success");
              setIsBulkOpen(false);
              setBulkFile(null);
              setBulkCategory("");
              fetchProducts();
            } else {
              showToast(t("bulk.errorStock"), "error");
            }
          }
        } catch (error) {
          console.error(error);
          showToast(t("bulk.errorCsv"), "error");
        } finally {
          setIsUploadingBulk(false);
        }
      },
      error: (error) => {
        console.error(error);
        showToast(t("bulk.errorCsvRead"), "error");
        setIsUploadingBulk(false);
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const categoryOptions = [
    { label: t("filters.allCategories"), value: "" },
    ...categoriesList.map(c => ({ label: c.name, value: c.name }))
  ];

  const createCategoryOptions = categoriesList.map(c => ({ label: c.name, value: c.id }));

  const expansionOptions = [
    { label: t("filters.allExpansions"), value: "" },
    ...expansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))
  ];

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      {isUploadingBulk && <PreLoader message={t("bulk.uploading")} />}
      
      {/* HOVER PREVIEW */}
      {hoveredImage && (
        <div 
          className="fixed z-999999 pointer-events-none shadow-2xl rounded-2xl border-4 border-white bg-white overflow-hidden transition-all duration-200 animate-in fade-in zoom-in"
          style={{ 
            // Si el mouse está en la parte inferior (> 60% del alto), mostramos la imagen hacia arriba
            top: typeof window !== 'undefined' && mousePos.y > window.innerHeight * 0.6 
              ? mousePos.y - 440 
              : mousePos.y + 20, 
            left: mousePos.x + 20,
            maxWidth: '300px'
          }}
        >
          <Image 
            src={hoveredImage} 
            alt="Preview" 
            width={300} 
            height={420} 
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      )}

      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark">{t("title")}</h1>
            <p className="text-dark-4 text-sm mt-1">{t("subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsBulkOpen(true)}
              style={{ backgroundColor: '#16a34a' }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90">
              {t("bulkUpload")}
            </button>
            <button onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blue-dark transition">
              {t("addProduct")}
            </button>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="px-6 pb-4">
        <div className="bg-white rounded-2xl shadow-1 p-5 mb-6">
          <p className="text-sm font-medium text-dark mb-3">{tc("filters")}</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{tc("search")}</label>
              <input type="text" placeholder={t("filters.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2 px-4 text-sm outline-none focus:border-blue focus:ring-2 focus:ring-blue/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("filters.category")}</label>
              <SearchableSelect options={categoryOptions} value={selectedCategory}
                onChange={(val) => { setSelectedCategory(val); setPage(1); }}
                placeholder={t("filters.allCategories")}
                noResultsText={tc("noResults")} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("filters.expansion")}</label>
              <SearchableSelect options={expansionOptions} value={selectedExpansion}
                onChange={(val) => { setSelectedExpansion(val); setPage(1); }}
                placeholder={t("filters.allExpansions")}
                disabled={expansionsList.length === 0}
                noResultsText={tc("noResults")} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-1 text-left">
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">{t("table.product")}</th>
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm hidden md:table-cell">{t("filters.expansion")}</th>
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">{t("table.stock")}</th>
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">{t("table.actions")}</th>
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
                <tr>
                  <td colSpan={4} className="py-5 text-center">{tc("noResults")}</td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock = product.items.reduce((sum, item) => sum + item.stock, 0);

                    return (
                      <tr key={product.id} className="hover:bg-gray-1 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div 
                              className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-2 cursor-zoom-in transition-transform hover:scale-110"
                              onMouseEnter={() => product.imageUrl && setHoveredImage(product.imageUrl)}
                              onMouseLeave={() => setHoveredImage(null)}
                            >
                              {product.imageUrl ? (
                                <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="object-cover h-full w-full" />
                              ) : (
                                <span className="text-[10px] text-dark-4 flex h-full items-center justify-center">Sin Img</span>
                              )}
                            </div>
                            <p className="text-dark font-medium text-sm">{product.name}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 hidden md:table-cell">
                          <p className="text-dark text-sm">{product.cardDetail?.expansion || "N/A"}</p>
                          <p className="text-dark-4 text-xs">{product.cardDetail?.rarity}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            totalStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>
                          {totalStock}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {product.category?.isTcg ? (
                              <button onClick={() => openInventoryModal(product)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue/10 text-blue hover:bg-blue hover:text-white transition">
                                Inventario ({product.items.length})
                              </button>
                            ) : (
                              <>
                                <button onClick={() => openEditModal(product, product.items[0] || {})}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-1 text-dark-4 hover:bg-gray-2 transition">
                                  {tc("edit")}
                                </button>
                                <button onClick={() => handleDeleteProduct(product)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition">
                                  {tc("delete")}
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

          {/* Paginación */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-3">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-3 text-dark-4 hover:bg-gray-1 transition disabled:opacity-40">{tc("previous")}</button>
            <span className="text-sm text-dark-4">{tc("page", { current: page, total: totalPages })}</span>
            <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-3 text-dark-4 hover:bg-gray-1 transition disabled:opacity-40">{tc("next")}</button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-default">
            <h3 className="mb-4 text-xl font-bold text-black">{t("modal.editTitle")}</h3>
            <form onSubmit={handleUpdateItem}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.nameLabel")}</label>
                <input
                  type="text"
                  required
                  value={editingItem.productName}
                  onChange={(e) => setEditingItem({ ...editingItem, productName: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.categoryLabel")}</label>
                <select
                  required
                  value={editingItem.categoryId}
                  onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                >
                  <option value="" disabled>{t("modal.categoryPlaceholder")}</option>
                  {categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.brandLabel")}</label>
                <select
                  value={editingItem.brandId}
                  onChange={(e) => setEditingItem({ ...editingItem, brandId: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                >
                  <option value="">{t("modal.brandPlaceholder")}</option>
                  {brandsList.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.stockLabel")}</label>
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
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.priceLabel")}</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              {!categoriesList.find(c => c.id === editingItem.categoryId)?.isTcg && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-black">{t("modal.imageLabel")}</label>
                  {editingItem.imageUrl ? (
                    <div className="mb-3">
                      <div className="relative h-24 w-32 rounded border border-stroke bg-gray-1 flex items-center justify-center overflow-hidden mb-2">
                        <Image src={editingItem.imageUrl} alt="Vista previa" width={128} height={96} className="object-contain h-full w-full" />
                      </div>
                      <button
                        type="button"
                        onClick={handleEditRemoveImage}
                        className="text-sm text-danger hover:underline"
                      >
                        {t("modal.removeImage")}
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
                      {uploadingImage && <span className="text-sm text-blue">{t("modal.saving")}</span>}
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
                  disabled={uploadingImage}
                  className="rounded bg-blue py-2 px-4 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? tc("loading") : tc("save")}
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
            <h3 className="mb-4 text-xl font-bold text-black">{t("create.title")}</h3>
            <form onSubmit={handleCreateProduct}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.nameLabel")}</label>
                <input
                  type="text"
                  required
                  value={creatingProduct.name}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, name: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.categoryLabel")}</label>
                <select
                  required
                  value={creatingProduct.categoryId}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, categoryId: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary appearance-none"
                >
                  <option value="" disabled>{t("modal.categoryPlaceholder")}</option>
                  {createCategoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.brandLabel")}</label>
                <select
                  value={creatingProduct.brandId}
                  onChange={(e) => setCreatingProduct({ ...creatingProduct, brandId: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary appearance-none"
                >
                  <option value="">{t("modal.brandPlaceholder")}</option>
                  {brandsList.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {!categoriesList.find(c => c.id === creatingProduct.categoryId)?.isTcg && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-black">{t("modal.imageLabel")}</label>
                  {creatingProduct.imageUrl ? (
                    <div className="mb-3">
                      <div className="relative h-24 w-32 rounded border border-stroke bg-gray-1 flex items-center justify-center overflow-hidden mb-2">
                        <Image src={creatingProduct.imageUrl} alt="Vista previa" width={128} height={96} className="object-contain h-full w-full" />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-sm text-danger hover:underline"
                      >
                        {t("modal.removeImage")}
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
                      {uploadingImage && <span className="text-sm text-blue">{t("modal.saving")}</span>}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">{t("modal.stockLabel")}</label>
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
                  <label className="mb-2 block text-sm font-medium text-black">{t("modal.priceLabel")}</label>
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
                  disabled={uploadingImage}
                  className="rounded bg-blue py-2 px-4 font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? tc("loading") : t("create.creating")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK UPLOAD MODAL */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-default max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-xl font-bold text-black">{t("bulk.title")}</h3>
            <p className="mb-4 text-sm text-gray-500">{t("bulk.subtitle")}</p>
            <form onSubmit={handleBulkUpload}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.categoryLabel")}</label>
                <div className="flex gap-2">
                  <select
                    required
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary appearance-none"
                  >
                    <option value="" disabled>Selecciona la categoría</option>
                    {createCategoryOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {bulkCategory && categoriesList.find(c => c.id === bulkCategory)?.isTcg === false && (
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="whitespace-nowrap rounded bg-blue px-4 text-white hover:bg-opacity-90 font-medium"
                    >
                      Descargar Plantilla
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-black">Archivo CSV</label>
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                  className="w-full cursor-pointer rounded border-[1.5px] border-stroke bg-transparent font-medium text-black outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-3 file:px-5 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkOpen(false);
                    setBulkFile(null);
                    setBulkCategory("");
                  }}
                  className="rounded bg-gray-3 py-2 px-4 font-medium text-black hover:bg-gray-4"
                  disabled={isUploadingBulk}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploadingBulk || !bulkFile || !bulkCategory}
                  className="rounded bg-green py-2 px-4 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isUploadingBulk ? t("bulk.uploading") : t("bulk.uploadButton")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* INVENTORY MANAGEMENT MODAL */}
      {isInventoryOpen && selectedProduct && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-5xl rounded-lg bg-white p-6 shadow-default max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-1 border border-stroke">
                  {selectedProduct.imageUrl ? (
                    <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} width={64} height={64} className="object-contain h-full w-full" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-gray-400">Sin Imagen</div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">Gestionar Inventario</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500">{selectedProduct.name}</p>
                    <span className="bg-blue/10 text-blue text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Stock Total: {selectedProduct.items.reduce((sum, item) => sum + item.stock, 0)}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsInventoryOpen(false)} className="text-gray-500 hover:text-black text-2xl">✕</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Image & Description Column */}
              <div className="lg:col-span-1 space-y-4">
                <div className="aspect-[3/4] w-full rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  {selectedProduct.imageUrl ? (
                    <Image src={selectedProduct.imageUrl} alt={selectedProduct.name} width={300} height={420} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-gray-400">Sin ilustración</span>
                  )}
                </div>
                <div className="bg-blue/5 p-4 rounded-xl border border-blue/10">
                   <p className="text-xs font-bold text-blue uppercase mb-1">{selectedProduct.cardDetail?.expansion || "Expansión"}</p>
                   <p className="text-sm text-dark font-medium">{selectedProduct.cardDetail?.rarity || "Rareza N/A"}</p>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                {/* Add New Variation Form */}
                <div className="bg-gray-50 p-4 rounded-xl border border-stroke">
                  <h4 className="font-semibold text-dark mb-4 text-sm">Añadir Nueva Variante</h4>
                  <form onSubmit={handleAddVariation} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Idioma</label>
                      <select 
                        value={newVariation.languageId}
                        onChange={(e) => setNewVariation({...newVariation, languageId: e.target.value})}
                        className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm outline-none focus:border-primary"
                      >
                        {languages.map(lang => (
                          <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Condición</label>
                      <select 
                        value={newVariation.conditionId}
                        onChange={(e) => setNewVariation({...newVariation, conditionId: e.target.value})}
                        className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm outline-none focus:border-primary"
                      >
                        {conditions.map(cond => (
                          <option key={cond.id} value={cond.id}>{cond.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                       <label className="text-xs font-medium text-gray-500 mb-1 block">Precio / Stock</label>
                       <div className="flex gap-2">
                          <input 
                            type="number" 
                            placeholder="$$"
                            value={newVariation.price || ""}
                            onChange={(e) => setNewVariation({...newVariation, price: Number(e.target.value)})}
                            className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm outline-none focus:border-primary"
                          />
                          <input 
                            type="number" 
                            placeholder="Stk"
                            value={newVariation.stock || ""}
                            onChange={(e) => setNewVariation({...newVariation, stock: Number(e.target.value)})}
                            className="w-full rounded-lg border border-stroke bg-white py-2 px-3 text-sm outline-none focus:border-primary"
                          />
                       </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="isFoil"
                          checked={newVariation.isFoil}
                          onChange={(e) => setNewVariation({...newVariation, isFoil: e.target.checked})}
                          className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue"
                        />
                        <label htmlFor="isFoil" className="text-xs font-medium text-dark cursor-pointer">Foil</label>
                      </div>
                      <button type="submit" className="bg-blue text-white py-2 px-4 rounded-lg text-sm font-bold hover:bg-blue-dark transition">
                        Añadir
                      </button>
                    </div>
                  </form>
                </div>

                {/* Variation List */}
                <div className="overflow-hidden border border-stroke rounded-xl shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-1 border-b border-stroke">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold text-dark-4">Idioma / Condición</th>
                        <th className="py-2.5 px-4 font-semibold text-dark-4">Foil</th>
                        <th className="py-2.5 px-4 font-semibold text-dark-4 w-28">Precio</th>
                        <th className="py-2.5 px-4 font-semibold text-dark-4 w-24">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke bg-white">
                      {selectedProduct.items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-1/50 transition">
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-dark">{item.language?.name || 'N/A'}</span>
                              <span className="text-dark-4 uppercase text-[10px] font-bold tracking-wider">{item.condition?.name.replace('_', ' ') || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.isFoil ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 uppercase tracking-tighter border border-yellow-200">FOIL</span>
                            ) : (
                              <span className="text-gray-300 text-[10px] uppercase font-bold">Normal</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="relative group">
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                              <input 
                                type="number" 
                                defaultValue={item.price}
                                onBlur={(e) => handleUpdateStockPrice(item.id, Number(e.target.value), item.stock)}
                                className="w-full border-b border-transparent focus:border-blue outline-none py-1 pl-3 font-medium transition"
                              />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input 
                              type="number" 
                              defaultValue={item.stock}
                              onBlur={(e) => handleUpdateStockPrice(item.id, item.price, Number(e.target.value))}
                              className="w-full border-b border-transparent focus:border-blue outline-none py-1 text-center font-bold transition"
                            />
                          </td>
                        </tr>
                      ))}
                      {selectedProduct.items.length === 0 && (
                        <tr>
                           <td colSpan={4} className="py-8 text-center text-gray-400 italic">No hay variantes registradas</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
