"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/utils/api";
import { VendorOrderData } from "@/types/order";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import {
  IconShieldCheck,
  IconLock,
  IconBox,
  IconCheckCircle,
} from "@/components/ui/Icons";

export interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorOrder: VendorOrderData | null;
  orderBuyOrder: string;
  onSuccess: () => void;
}

export default function DispatchModal({
  isOpen,
  onClose,
  vendorOrder,
  orderBuyOrder,
  onSuccess,
}: DispatchModalProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !vendorOrder) return null;

  // Courier o método de entrega oficial pagado por el comprador
  const rawCourier = (
    vendorOrder.shippingProvider?.name ||
    vendorOrder.shippingCourier ||
    "STARKEN"
  ).toUpperCase();

  const isLocalPickup = rawCourier.includes("RETIRO");

  // Metadatos del courier seleccionado por el comprador
  const getCourierMeta = () => {
    if (isLocalPickup) {
      return {
        key: "RETIRO_TIENDA",
        name: "Retiro en Tienda (Entrega en Local)",
        badgeName: "retiro",
        placeholder: "Ej: RETIRO-LOCAL o N° de boleta interna (opcional)",
        helperText:
          "El comprador seleccionó retiro presencial en tu local. No se requiere número de seguimiento de courier.",
      };
    }
    if (rawCourier.includes("CHILE")) {
      return {
        key: "CHILEXPRESS",
        name: "Chilexpress",
        badgeName: "chilexpress",
        placeholder: "Ej: 99281726481",
        helperText:
          "Ingresa el número de orden de transporte o guía de Chilexpress para que el cliente rastree su paquete.",
      };
    }
    if (rawCourier.includes("BLUE")) {
      return {
        key: "BLUE_EXPRESS",
        name: "Blue Express",
        badgeName: "blue_express",
        placeholder: "Ej: 1002938475",
        helperText:
          "Ingresa el número de seguimiento de Blue Express para que el cliente rastree su paquete.",
      };
    }
    if (rawCourier.includes("CORREO")) {
      return {
        key: "CORREOS_CHILE",
        name: "Correos de Chile",
        badgeName: "correos_chile",
        placeholder: "Ej: 1192837465",
        helperText:
          "Ingresa el número de envío de Correos de Chile para que el cliente rastree su paquete.",
      };
    }
    // Default: Starken
    return {
      key: "STARKEN",
      name: "Starken",
      badgeName: "starken",
      placeholder: "Ej: 2981726481",
      helperText:
        "Ingresa la orden de flete o seguimiento oficial de Starken para que el cliente rastree su paquete.",
    };
  };

  const courierMeta = getCourierMeta();

  const shippingCostNum = parseFloat(String(vendorOrder.shippingCost || 0));
  const shippingCostFormatted =
    isLocalPickup || shippingCostNum === 0
      ? "Gratis ($0)"
      : `$${shippingCostNum.toLocaleString("es-CL")}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTracking = trackingNumber.trim();
    if (!cleanTracking && !isLocalPickup) {
      setError(`Por favor ingresa el número de seguimiento oficial de ${courierMeta.name}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/payments/vendor-orders/${vendorOrder.id}/dispatch`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-scope": "admin",
        },
        credentials: "include",
        body: JSON.stringify({
          courier: courierMeta.key,
          trackingNumber: isLocalPickup && !cleanTracking ? "RETIRO-LOCAL" : cleanTracking,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Error al procesar el despacho.");
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
      title={
        isLocalPickup
          ? `Confirmar Entrega en Local #${orderBuyOrder}`
          : `Despachar Pedido #${orderBuyOrder}`
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner Informativo Escrow */}
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <IconShieldCheck className="w-4 h-4 text-blue shrink-0" />
            <span>Protección al Comprador & Liberación de Fondos</span>
          </p>
          <p className="text-[11px] text-blue-300/80 leading-relaxed">
            {isLocalPickup
              ? "Al confirmar la entrega del pedido en tu local, la venta se completará de forma segura y el saldo retenido se liberará automáticamente a tu saldo disponible para retiro TEF."
              : "Al registrar el número de seguimiento oficial, el cliente podrá rastrear su paquete en tiempo real y el saldo retenido de esta venta se liberará automáticamente a tu saldo disponible para retiro TEF."}
          </p>
        </div>

        {/* Resumen de Tienda y Artículos */}
        <div className="p-3 rounded-xl bg-[#111318] border border-white/5 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-gray-400">
            <span>Tienda:</span>
            <span className="font-bold text-white">{vendorOrder.store?.name}</span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>Artículos a entregar:</span>
            <span className="font-bold text-white">
              {vendorOrder.items?.reduce((sum, i) => sum + i.quantity, 0)} cartas
            </span>
          </div>
        </div>

        {/* Método de Envío Oficial (LOCKED / Fijado por el comprador) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
              Método de Envío del Pedido
            </label>
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <IconLock className="w-3 h-3 shrink-0" />
              <span>Elegido por el comprador</span>
            </span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-[#141720] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShippingBadge name={courierMeta.badgeName} size="md" />
                <div>
                  <p className="text-sm font-bold text-white">{courierMeta.name}</p>
                  <p className="text-[11px] text-gray-400">{courierMeta.helperText}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                  Envío pagado
                </span>
                <span className="font-black text-emerald-400 text-sm">
                  {shippingCostFormatted}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 border-t border-white/5 pt-2">
              El cliente seleccionó y pagó por este courier al finalizar la compra. Por política de protección y transparencia de TapTrade, la tienda debe despachar mediante el método acordado.
            </p>
          </div>
        </div>

        {/* Input Número de Seguimiento o Comprobante */}
        <div className="space-y-1.5">
          <label
            htmlFor="trackingNumber"
            className="block text-xs font-bold uppercase tracking-wider text-gray-300"
          >
            {isLocalPickup
              ? "Comprobante o Código de Retiro en Local (Opcional)"
              : `N° de Orden de Transporte / Seguimiento ${courierMeta.name}`}
          </label>
          <input
            id="trackingNumber"
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder={courierMeta.placeholder}
            className="w-full rounded-xl border border-white/10 bg-[#07090E] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 font-mono"
            required={!isLocalPickup}
          />
          <p className="text-[10px] text-gray-500">
            {isLocalPickup
              ? "Si el cliente retiró presencialmente, puedes dejarlo vacío (se registrará RETIRO-LOCAL) o ingresar el número de boleta/comprobante."
              : `Este número se vinculará directamente a la página oficial de rastreo de ${courierMeta.name} para que el comprador verifique el trayecto.`}
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
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
          >
            {isLocalPickup ? (
              <>
                <IconCheckCircle className="w-4 h-4 shrink-0" />
                <span>{loading ? "Confirmando..." : "Confirmar Entrega en Local & Liberar Fondos"}</span>
              </>
            ) : (
              <>
                <IconBox className="w-4 h-4 shrink-0" />
                <span>{loading ? "Procesando..." : "Confirmar Despacho & Liberar Fondos"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
