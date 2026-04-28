"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryMeta | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    imageUrl: "",
  });

  const fetchCategories = () => {
    setLoading(true);
    fetch(`${API_URL}/products/meta/categories/admin`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (category: CategoryMeta) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSlugify = (name: string) => {
    return name.toLowerCase().trim().replace(/[\s\W-]+/g, '-');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto-generate slug if we are creating a new category or if user hasn't manually altered it much
    if (!editingCategory) {
      setFormData({ ...formData, name, slug: handleSlugify(name) });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        // UPDATE
        const res = await fetch(`${API_URL}/products/meta/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        });

        if (res.ok) {
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === editingCategory.id ? { ...cat, ...formData } : cat
            )
          );
          setIsModalOpen(false);
        } else {
          alert("Error al actualizar la categoría");
        }
      } else {
        // CREATE
        const res = await fetch(`${API_URL}/products/meta/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        });

        if (res.ok) {
          const newCategory = await res.json();
          setCategories((prev) => [...prev, newCategory]);
          setIsModalOpen(false);
        } else {
          alert("Error al crear la categoría. Verifica que el nombre o slug no existan ya.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un error de conexión");
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black">
          Categorías
        </h2>
        <button
          onClick={openCreateModal}
          className="rounded bg-blue py-2 px-4 font-medium text-white hover:bg-opacity-90"
        >
          Crear Categoría
        </button>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left">
                <th className="min-w-[150px] py-4 px-4 font-medium text-black xl:pl-11">
                  Imagen
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black">
                  Nombre
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black">
                  Slug
                </th>
                <th className="py-4 px-4 font-medium text-black">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-5 text-center">
                    Cargando categorías...
                  </td>
                </tr>
              ) : (
                categories.map((category, key) => (
                  <tr key={key}>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 xl:pl-11">
                      {category.imageUrl ? (
                        <div className="h-12.5 w-15 rounded-md relative flex items-center justify-center bg-gray-1">
                          <Image src={category.imageUrl} alt={category.name} width={50} height={40} className="object-contain" />
                        </div>
                      ) : (
                        <div className="h-12.5 w-15 rounded-md bg-gray-3 flex items-center justify-center">
                          <span className="text-xs text-gray-500">Sin img</span>
                        </div>
                      )}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4">
                      <p className="text-black font-medium">{category.name}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4">
                      <p className="text-black text-sm">{category.slug}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4">
                      <button
                        onClick={() => openEditModal(category)}
                        className="hover:text-blue bg-gray-1 py-1 px-3 rounded text-sm"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-default">
            <h3 className="mb-4 text-xl font-bold text-black">
              {editingCategory ? `Editar Categoría` : `Nueva Categoría`}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">
                  Slug (URL amigable)
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">
                  Ruta de la Imagen (URL)
                </label>
                <input
                  type="text"
                  placeholder="/images/categories/mtg-logo.png"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

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
    </>
  );
}
