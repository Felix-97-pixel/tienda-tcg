"use client";
import { API_URL } from "@/utils/api";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useTranslations } from "next-intl";

interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  isTcg?: boolean;
}

export default function AdminCategories() {
  const t = useTranslations("categories");
  const tc = useTranslations("common");

  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryMeta | null>(null);
  const { isUploading: uploadingImage, handleUpload, handleRemove } = useImageUpload();
  const [formData, setFormData] = useState({ name: "", slug: "", imageUrl: "", isTcg: false });

  const fetchCategories = () => {
    setLoading(true);
    fetch(`${API_URL}/products/meta/categories/admin`)
      .then((res) => res.json())
      .then((data) => { setCategories(data); setLoading(false); })
      .catch((err) => { console.error("Error fetching categories:", err); setLoading(false); });
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSlugify = (name: string) => name.toLowerCase().trim().replace(/[\s\W-]+/g, '-');

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", slug: "", imageUrl: "", isTcg: false });
    setIsModalOpen(true);
  };

  const openEditModal = (category: CategoryMeta) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug, imageUrl: category.imageUrl || "", isTcg: !!category.isTcg });
    setIsModalOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!editingCategory) {
      setFormData({ ...formData, name, slug: handleSlugify(name) });
    } else {
      setFormData({ ...formData, name });
    }
  };

  const handleRemoveImage = async () => {
    const success = await handleRemove(formData.imageUrl);
    if (success) setFormData({ ...formData, imageUrl: "" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = await handleUpload(e, formData.imageUrl);
    if (newUrl) setFormData({ ...formData, imageUrl: newUrl });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await fetch(`${API_URL}/products/meta/categories/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
          credentials: "include",
        });
        if (res.ok) {
          setCategories((prev) => prev.map((cat) => cat.id === editingCategory.id ? { ...cat, ...formData } : cat));
          setIsModalOpen(false);
        } else {
          alert(t("errorUpdate"));
        }
      } else {
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
          alert(t("errorCreate"));
        }
      }
    } catch (error) {
      console.error(error);
      alert(tc("networkError"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`${API_URL}/products/meta/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } else {
        const errData = await res.json();
        alert(errData.message || tc("error"));
      }
    } catch (e) {
      console.error(e);
      alert(tc("error"));
    }
  };

  return (
    <>
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark">{t("title")}</h1>
            <p className="text-dark-4 text-sm mt-1">{t("subtitle")}</p>
          </div>
          <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blue-dark transition">
            {t("addCategory")}
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <div className="bg-white rounded-2xl shadow-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-1 text-left">
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">{t("table.image")}</th>
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">{t("table.name")}</th>
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">{t("table.slug")}</th>
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">{t("table.type")}</th>
                  <th className="py-3 px-6 font-medium text-dark-4 text-sm">{t("table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <svg className="animate-spin h-6 w-6 text-blue mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </td>
                  </tr>
                ) : (
                  categories.map((category, key) => (
                    <tr key={key} className="hover:bg-gray-1 transition">
                      <td className="py-4 px-6">
                        {category.imageUrl ? (
                          <div className="h-10 w-14 rounded-lg flex items-center justify-center bg-gray-1 overflow-hidden">
                            <Image src={category.imageUrl} alt={category.name} width={50} height={40} className="object-contain" />
                          </div>
                        ) : (
                          <div className="h-10 w-14 rounded-lg bg-gray-2 flex items-center justify-center">
                            <span className="text-xs text-dark-4">{tc("image")}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6"><p className="text-dark font-medium">{category.name}</p></td>
                      <td className="py-4 px-6"><code className="text-xs text-dark-4 bg-gray-1 px-2 py-1 rounded">{category.slug}</code></td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${category.isTcg ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {category.isTcg ? t("types.tcg") : t("types.general")}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(category)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue/10 text-blue hover:bg-blue hover:text-white transition">
                            {tc("edit")}
                          </button>
                          <button onClick={() => handleDelete(category.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition">
                            {tc("delete")}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-default">
            <h3 className="mb-4 text-xl font-bold text-black">
              {editingCategory ? t("modal.editTitle") : t("modal.createTitle")}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.nameLabel")}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  placeholder={t("modal.namePlaceholder")}
                  onChange={handleNameChange}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.slugLabel")}</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  placeholder={t("modal.slugPlaceholder")}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-black">{t("modal.imageLabel")}</label>
                {formData.imageUrl ? (
                  <div className="mb-3">
                    <div className="relative h-24 w-32 rounded border border-stroke bg-gray-1 flex items-center justify-center overflow-hidden mb-2">
                      <Image src={formData.imageUrl} alt="Vista previa" width={128} height={96} className="object-contain h-full w-full" />
                    </div>
                    <button type="button" onClick={handleRemoveImage} className="text-sm text-danger hover:underline">{tc("delete")}</button>
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
                    {uploadingImage && <span className="text-sm text-blue">{tc("loading")}</span>}
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
                  <span className="text-sm font-medium text-black">{t("modal.isTcgLabel")}</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded bg-gray-3 py-2 px-4 font-medium text-black hover:bg-gray-4">
                  {tc("cancel")}
                </button>
                <button type="submit" className="rounded bg-blue py-2 px-4 font-medium text-white hover:bg-opacity-90">
                  {tc("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
