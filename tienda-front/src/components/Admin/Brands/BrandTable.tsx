"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { List, Column } from "@/components/ui/List";

interface Brand {
  id: string;
  name: string;
  imageUrl?: string;
}

interface BrandTableProps {
  brands: Brand[];
  loading: boolean;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

export default function BrandTable({ brands, loading, onEdit, onDelete }: BrandTableProps) {
  const t = useTranslations("brands");
  const tc = useTranslations("common");

  const columns: Column<Brand>[] = [
    {
      key: "image",
      header: t("table.image"),
      render: (brand) => (
        <div className="relative h-12 w-20 rounded-xl bg-gray-1 overflow-hidden border border-stroke transition-transform group-hover:scale-105">
          {brand.imageUrl ? (
            <Image src={brand.imageUrl} alt={brand.name} fill sizes="80px" className="object-contain p-1" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-dark-4 font-bold">{tc("noImage")}</span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: t("table.name"),
      render: (brand) => (
        <p className="text-dark font-bold text-sm">{brand.name}</p>
      ),
    },
    {
      key: "actions",
      header: t("table.actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (brand) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(brand)}
            className="p-2.5 rounded-xl bg-blue/10 text-blue hover:bg-blue hover:text-white transition-all shadow-sm"
            title={tc("edit")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(brand)}
            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            title={tc("delete")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <List
      columns={columns}
      data={brands}
      loading={loading}
      keyExtractor={(brand) => brand.id}
    />
  );
}
