"use client";
import { API_URL } from "@/utils/api";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useImageUpload } from "@/hooks/useImageUpload";



interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  isTcg?: boolean;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryMeta | null>(null);
  const { isUploading: uploadingImage, handleUpload, handleRemove } = useImageUpload();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    imageUrl: "",
    isTcg: false,
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
    setFormData({ name: "", slug: "", imageUrl: "", isTcg: false });
    setIsModalOpen(true);
  };

  const openEditModal = (category: CategoryMeta) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl || "",
      isTcg: !!category.isTcg,
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

  const handleRemoveImage = async () => {
    const success = await handleRemove(formData.imageUrl);
    if (success) {
      setFormData({ ...formData, imageUrl: "" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = await handleUpload(e, formData.imageUrl);
    if (newUrl) {
      setFormData({ ...formData, imageUrl: newUrl });
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

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta categoría? Solo se puede eliminar si no tiene productos asociados.")) return;
    try {
      const res = await fetch(`${API_URL}/products/meta/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } else {
        const errData = await res.json();
        alert(errData.message || "Error al eliminar la categoría. Verifica que no tenga productos asociados.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red");
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
                <th className="min-w-[150px] py-4 px-4 font-medium text-black">
                  ¿Es un TCG?
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
                      <p className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${category.isTcg ? 'bg-success text-success' : 'bg-warning text-warning'}`}>
                        {category.isTcg ? 'Sí' : 'No'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="hover:text-blue bg-gray-1 py-1 px-3 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="hover:text-danger bg-gray-1 py-1 px-3 rounded text-sm text-danger"
                        >
                          Eliminar
                        </button>
                      </div>
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
                  Imagen de Categoría
                </label>
                {formData.imageUrl ? (
                  <div className="mb-3">
                    <div className="relative h-24 w-32 rounded border border-stroke bg-gray-1 flex items-center justify-center overflow-hidden mb-2">
                      <Image src={formData.imageUrl} alt="Vista previa" width={128} height={96} className="object-contain h-full w-full" />
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
                  <div className="mb-3">
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

              <div className="mb-6 flex items-center">
                <label className="flex cursor-pointer items-center gap-3">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={formData.isTcg}
                      onChange={(e) => setFormData({ ...formData, isTcg: e.target.checked })}
                    />
                    <div className={`box block h-6 w-10 rounded-full ${formData.isTcg ? 'bg-blue' : 'bg-[#ccc]'}`}></div>
                    <div className={`absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition ${formData.isTcg ? 'translate-x-full' : ''}`}></div>
                  </div>
                  <span className="text-sm font-medium text-black">
                    Los productos de esta categoría son Cartas Sueltas (Requieren filtrar por expansión)
                  </span>
                </label>
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
