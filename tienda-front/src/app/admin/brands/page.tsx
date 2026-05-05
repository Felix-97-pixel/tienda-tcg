"use client";
import { API_URL } from "@/utils/api";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useImageUpload } from "@/hooks/useImageUpload";

interface BrandMeta {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandMeta | null>(null);
  const { isUploading: uploadingImage, handleUpload, handleRemove } = useImageUpload();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
  });

  const fetchBrands = () => {
    setLoading(true);
    fetch(`${API_URL}/products/meta/brands`)
      .then((res) => res.json())
      .then((data) => {
        setBrands(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching brands:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setFormData({ name: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (brand: BrandMeta) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      imageUrl: brand.imageUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
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
      if (editingBrand) {
        // UPDATE
        const res = await fetch(`${API_URL}/products/meta/brands/${editingBrand.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        });

        if (res.ok) {
          setBrands((prev) =>
            prev.map((brand) =>
              brand.id === editingBrand.id ? { ...brand, ...formData } : brand
            )
          );
          setIsModalOpen(false);
        } else {
          alert("Error al actualizar la marca");
        }
      } else {
        // CREATE
        const res = await fetch(`${API_URL}/products/meta/brands`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        });

        if (res.ok) {
          const newBrand = await res.json();
          setBrands((prev) => [...prev, newBrand]);
          setIsModalOpen(false);
        } else {
          alert("Error al crear la marca. Verifica que el nombre no exista ya.");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un error de conexión");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta marca? Solo se puede eliminar si no tiene productos asociados.")) return;
    try {
      const res = await fetch(`${API_URL}/products/meta/brands/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setBrands((prev) => prev.filter((brand) => brand.id !== id));
      } else {
        const errData = await res.json();
        alert(errData.message || "Error al eliminar la marca. Verifica que no tenga productos asociados.");
      }
    } catch (e) {
      console.error(e);
      alert("Error de red");
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark">Marcas</h1>
            <p className="text-dark-4 text-sm mt-1">Administra las marcas y sus logos</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blue-dark transition"
          >
            + Crear Marca
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="bg-white rounded-2xl shadow-1 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-3">
            <h2 className="font-semibold text-dark">Todas las marcas ({brands.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-1 text-left">
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">Logo</th>
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">Nombre</th>
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center">
                      <svg className="animate-spin h-6 w-6 text-blue mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </td>
                  </tr>
                ) : brands.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-dark-4 text-sm">No hay marcas creadas aún</td>
                  </tr>
                ) : (
                  brands.map((brand, key) => (
                    <tr key={key} className="hover:bg-gray-1 transition">
                      <td className="py-4 px-6">
                        {brand.imageUrl ? (
                          <div className="h-10 w-14 rounded-lg flex items-center justify-center bg-gray-1 overflow-hidden">
                            <Image src={brand.imageUrl} alt={brand.name} width={50} height={40} className="object-contain" />
                          </div>
                        ) : (
                          <div className="h-10 w-14 rounded-lg bg-gray-2 flex items-center justify-center">
                            <span className="text-xs text-dark-4">Sin img</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-dark font-medium">{brand.name}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(brand)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue/10 text-blue hover:bg-blue hover:text-white transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(brand.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition"
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
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-5 text-xl font-bold text-dark">
              {editingBrand ? `Editar Marca` : `Nueva Marca`}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-dark">
                  Nombre de la Marca
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full rounded-lg border border-gray-3 bg-gray-1 py-2.5 px-4 text-dark outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-dark">
                  Logo de la Marca
                </label>
                {formData.imageUrl ? (
                  <div className="mb-3">
                    <div className="relative h-24 w-32 rounded-lg border border-gray-3 bg-gray-1 flex items-center justify-center overflow-hidden mb-2">
                      <Image src={formData.imageUrl} alt="Vista previa" width={128} height={96} className="object-contain h-full w-full" />
                    </div>
                    <button type="button" onClick={handleRemoveImage} className="text-sm text-red-500 hover:underline">
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
                      className="w-full cursor-pointer rounded-lg border border-gray-3 bg-gray-1 text-dark text-sm outline-none transition file:mr-4 file:border-0 file:bg-blue/10 file:text-blue file:py-2 file:px-4 file:font-medium hover:file:bg-blue hover:file:text-white"
                    />
                    {uploadingImage && <span className="text-sm text-blue mt-1 block">Subiendo...</span>}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-gray-3 text-dark-4 hover:bg-gray-1 transition text-sm">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue text-white font-medium text-sm hover:bg-blue-dark transition">
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
