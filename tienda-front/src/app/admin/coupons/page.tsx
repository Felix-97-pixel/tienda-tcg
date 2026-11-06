"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { List, Column } from "@/components/ui/List";
import { useCoupons } from "@/app/admin/_components/Coupons/hooks/useCoupons";
import CouponModal from "@/app/admin/_components/Coupons/CouponModal";
import { IconPencil, IconTrash } from "@/components/ui/Icons";

export default function AdminCoupons() {
  const t = useTranslations("admin.coupons_page");
  const tCommon = useTranslations("common");
  const { coupons, loading, refresh, deleteCoupon } = useCoupons();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);

  const openModal = (coupon?: any) => {
    setSelectedCoupon(coupon || null);
    setIsModalOpen(true);
  };

  const columns: Column<any>[] = [
    {
      key: "code",
      header: t("code"),
      render: (coupon) => (
        <span className="font-semibold text-white uppercase">{coupon.code}</span>
      ),
    },
    {
      key: "discount",
      header: t("discount"),
      render: (coupon) => (
        <span className="font-semibold text-blue">{coupon.discountPercent}%</span>
      ),
    },
    {
      key: "dates",
      header: t("validity"),
      render: (coupon) => {
        const from = new Date(coupon.validFrom).toLocaleDateString();
        const to = new Date(coupon.validUntil).toLocaleDateString();
        return (
          <span className="text-gray-4 text-xs">
            {from} - {to}
          </span>
        );
      },
    },
    {
      key: "scope",
      header: t("scope"),
      render: (coupon) => {
        const scopeLabels = {
          STORE_WIDE: t("scope_store_wide"),
          CATEGORY_SPECIFIC: t("scope_category_specific"),
          GAME_SPECIFIC: t("scope_game_specific"),
        };
        return (
          <span className="text-gray-4 text-xs">{scopeLabels[coupon.scope as keyof typeof scopeLabels] || coupon.scope}</span>
        );
      },
    },
    {
      key: "status",
      header: t("status"),
      render: (coupon) => {
        const isActive = coupon.isActive;
        const isExpired = new Date(coupon.validUntil) < new Date();
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${!isActive ? 'bg-red-500/20 text-red-500' : isExpired ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-500'}`}>
            {!isActive ? t("inactive") : isExpired ? t("expired") : t("active")}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: t("actions"),
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (coupon) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-white hover:text-white transition-colors"
            onClick={() => openModal(coupon)}
            title={tCommon("edit")}
          >
            <IconPencil className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-red-500 hover:text-red-500 transition-colors"
            onClick={() => deleteCoupon(coupon)}
            title={tCommon("delete")}
          >
            <IconTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={() => openModal()}>
          {t("create_coupon")}
        </Button>
      </div>

      <List
        columns={columns}
        data={coupons}
        loading={loading}
        keyExtractor={(coupon) => coupon.id}
      />

      {isModalOpen && (
        <CouponModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          coupon={selectedCoupon}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
