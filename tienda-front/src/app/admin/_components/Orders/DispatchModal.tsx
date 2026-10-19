"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/utils/api";
import { VendorOrderData } from "@/types/order";
import { ShippingBadge } from "@/components/ui/ShippingBadge";

export interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorOrder: VendorOrderData | null;
  orderBuyOrder: string;
  onSuccess: () => void;
}

const COURIER_OPTIONS = [
  { value: "STARKEN", label: "Starken", badgeName: "starken" },
  { value: "CHILEXPRESS", label: "Chilexpress", badgeName: "chilexpress" },
  { value: "CORREOS_CHILE", label: "Correos de Chile", badgeName: "default" },
  { value: "BLUE_EXPRESS", label: "Blue Express", badgeName: "default" },
  { value: "RETIRO_TIENDA", label: "Retiro en Tienda $0 (Entrega en Local)", badgeName: "retiro" },
];

export default function DispatchModal({
  isOpen,
  onClose,
  vendorOrder,
  orderBuyOrder,
  onSuccess,
}: DispatchModalProps) {
  const [courier, setCourier] = useState("STARKEN");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !vendorOrder) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTracking = trackingNumber.trim();
    if (!cleanTracking && courier !== "RETIRO_TIENDA") {
      setError("Por favor ingresa el número de orden de transporte o guía.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payments/vendor-orders/${vendorOrder.id}/dispatch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courier,
          trackingNumber: courier === "RETIRO_TIENDA" && !cleanTracking ? "RETIRO-LOCAL" : cleanTracking,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al despachar la orden.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al procesar el despacho.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Despachar Pedido #${orderBuyOrder}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner Informativo Escrow */}
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <span>🛡️</span> Protección al Comprador & Liberación de Fondos
          </p>
          <p className="text-[11px] text-blue-300/80 leading-relaxed">
            Al registrar el número de seguimiento oficial, el cliente podrá rastrear su paquete en vivo y el saldo retenido de esta venta se liberará automáticamente a tu saldo disponible para retiro TEF.
          </p>
        </div>

        {/* Resumen de la Tienda y Artículos */}
        <div className="p-3 rounded-xl bg-[#111318] border border-white/5 space-y-1 text-xs">
          <div className="flex justify-between items-center text-gray-400">
            <span>Tienda:</span>
            <span className="font-bold text-white">{vendorOrder.store?.name}</span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>Artículos a empacar:</span>
            <span className="font-bold text-white">
              {vendorOrder.items?.reduce((sum, i) => sum + i.quantity, 0)} cartas
            </span>
          </div>
        </div>

        {/* Selector de Courier */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            Empresa de Transporte / Courier
          </label>
          <div className="grid grid-cols-1 gap-2">
            {COURIER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  courier === opt.value
                    ? "bg-red-500/10 border-red-500/50 text-white"
                    : "bg-[#111318] border-white/5 text-gray-400 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="courier"
                    value={opt.value}
                    checked={courier === opt.value}
                    onChange={(e) => {
                      setCourier(e.target.value);
                      if (e.target.value === "RETIRO_TIENDA" && !trackingNumber) {
                        setTrackingNumber("RETIRO-LOCAL");
                      }
                    }}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-white">{opt.label}</span>
                </div>
                <ShippingBadge name={opt.badgeName} size="sm" />
              </label>
            ))}
          </div>
        </div>

        {/* Input Número de Seguimiento */}
        <div className="space-y-1.5">
          <label htmlFor="trackingNumber" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
            Número de Orden de Transporte / Seguimiento
          </label>
          <input
            id="trackingNumber"
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder={courier === "RETIRO_TIENDA" ? "Código de retiro o comprobante" : "Ej: 2981726481"}
            className="w-full rounded-xl border border-white/10 bg-[#07090E] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 font-mono"
            required={courier !== "RETIRO_TIENDA"}
          />
          <p className="text-[10px] text-gray-500">
            Este número se vinculará directamente a la página oficial de rastreo para el comprador.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            {loading ? "Procesando..." : "Confirmar Despacho & Liberar Fondos"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
