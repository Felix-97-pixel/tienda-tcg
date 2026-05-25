"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { List, Column } from "@/components/ui/List";
import { Button } from "@/components/ui/Button";
import { AdminCategory as Category } from "@/types/adminCategory";
import { CategoryTableProps } from "@/types/adminProps";

export default function CategoryTable({ categories, loading, onEdit, onDelete }: CategoryTableProps) {
  const t = useTranslations("categories");
  const tc = useTranslations("common");

  const columns: Column<Category>[] = [
    {
      key: "image",
      header: t("table.image"),
      render: (category) => (
        <div className="relative h-12 w-20 rounded-xl bg-gray-1 overflow-hidden border border-stroke transition-transform group-hover:scale-105">
          {category.imageUrl ? (
            <Image src={category.imageUrl} alt={category.name} fill sizes="80px" className="object-contain p-1" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-dark-4 font-bold tracking-tight">{tc("noImage")}</span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      header: t("table.name"),
      render: (category) => (
        <p className="text-dark font-bold text-sm">{category.name}</p>
      ),
    },
    {
      key: "slug",
      header: t("table.slug"),
      headerClassName: "hidden md:table-cell",
      cellClassName: "hidden md:table-cell",
      render: (category) => (
        <code className="text-[10px] font-bold text-dark-4 bg-gray-1 px-2 py-1 rounded-lg border border-stroke">
          {category.slug}
        </code>
      ),
    },
    {
      key: "type",
      header: t("table.type"),
      render: (category) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider ${
          category.isTcg ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {category.isTcg ? t("types.tcg") : t("types.general")}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("table.actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (category) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="px-3 bg-blue/10 text-blue hover:bg-blue hover:text-white"
            onClick={() => onEdit(category)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="px-3"
            onClick={() => onDelete(category)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <List
      columns={columns}
      data={categories}
      loading={loading}
      keyExtractor={(category) => category.id}
    />
  );
}
