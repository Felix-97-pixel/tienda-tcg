"use client";
import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";

// Componentes Extraídos
import BrandTable from "@/components/Admin/Brands/BrandTable";
import BrandModal from "@/components/Admin/Brands/BrandModal";
import { Button } from "@/components/ui/Button";

interface Brand {
  id: string;
  name: string;
  imageUrl?: string;
}

export default function AdminBrands() {
  const t = useTranslations("brands");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { handleRemove } = useImageUpload();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

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

  const handleDelete = async (brand: Brand) => {
    if (!confirm(t("deleteConfirm") || "¿Seguro que deseas eliminar esta marca?")) return;
    try {
      if (brand.imageUrl) {
        await handleRemove(brand.imageUrl);
      }
      const res = await fetch(`${API_URL}/products/meta/brands/${brand.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast(tc("success"), "success");
        fetchBrands();
      } else {
        const errData = await res.json();
        showToast(errData.message || tc("error"), "error");
      }
    } catch (e) {
      showToast(tc("networkError"), "error");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">{t("title")}</h1>
          <p className="text-dark-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button
          onClick={() => { setSelectedBrand(null); setIsModalOpen(true); }}
        >
          {t("addBrand")}
        </Button>
      </div>

      {/* Tabla */}
      <BrandTable 
        brands={brands} 
        loading={loading} 
        onEdit={(brand) => { setSelectedBrand(brand); setIsModalOpen(true); }} 
        onDelete={handleDelete} 
      />

      {/* Modal */}
      <BrandModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        brand={selectedBrand} 
        onSuccess={fetchBrands} 
      />
    </div>
  );
}
