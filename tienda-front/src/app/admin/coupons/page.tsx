"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { List, Column } from "@/components/ui/List";
import { useCoupons } from "@/app/admin/_components/Coupons/hooks/useCoupons";
import CouponModal from "@/app/admin/_components/Coupons/CouponModal";

export default function AdminCoupons() {
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
      header: "Código",
      render: (coupon) => (
        <span className="font-semibold text-white uppercase">{coupon.code}</span>
      ),
    },
    {
      key: "discount",
      header: "Descuento",
      render: (coupon) => (
        <span className="font-semibold text-blue">{coupon.discountPercent}%</span>
      ),
    },
    {
      key: "dates",
      header: "Vigencia",
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
      header: "Alcance",
      render: (coupon) => {
        const scopeLabels = {
          STORE_WIDE: "Toda la tienda",
          CATEGORY_SPECIFIC: "Por Categorías",
          GAME_SPECIFIC: "Por Juegos",
        };
        return (
          <span className="text-gray-4 text-xs">{scopeLabels[coupon.scope as keyof typeof scopeLabels] || coupon.scope}</span>
        );
      },
    },
    {
      key: "status",
      header: "Estado",
      render: (coupon) => {
        const isActive = coupon.isActive;
        const isExpired = new Date(coupon.validUntil) < new Date();
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${!isActive ? 'bg-red-500/20 text-red-500' : isExpired ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-500'}`}>
            {!isActive ? 'Inactivo' : isExpired ? 'Expirado' : 'Activo'}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (coupon) => (
        <div className="flex items-center justify-end gap-2">
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-white hover:text-white transition-colors"
            onClick={() => openModal(coupon)}
            title="Editar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button
            className="w-10 h-7 rounded-full border border-stroke flex items-center justify-center text-gray-4 hover:border-red-500 hover:text-red-500 transition-colors"
            onClick={() => deleteCoupon(coupon)}
            title="Eliminar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cupones de Descuento</h1>
          <p className="text-gray-4 text-sm mt-1">Crea y administra códigos promocionales para tu tienda.</p>
        </div>
        <Button onClick={() => openModal()}>
          Crear Cupón
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
