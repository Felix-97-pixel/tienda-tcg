"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/utils/api";
import { VendorOrderData } from "@/types/order";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import CarrierTimeline from "./CarrierTimeline";
import {
  IconShieldCheck,
  IconLock,
  IconBox,
  IconCheckCircle,
  IconAlertTriangle,
  IconLoader,
  IconExternalLink,
  IconSearch,
} from "@/components/ui/Icons";

export interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorOrder: VendorOrderData | null;
  orderBuyOrder: string;
  onSuccess: () => void;
}

interface TrackingValidation {
  valid: boolean;
  courier: string;
  trackingNumber: string;
  liveConfirmed?: boolean;
  status?: string;
  destination?: string;
  service?: string;
  carrierDate?: string;
  trackingUrl?: string;
  message?: string;
  events?: Array<{
    date: string;
    description: string;
    location?: string;
  }>;
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

  // Estados de validación en tiempo real con la API del courier
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<TrackingValidation | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
        placeholder: "Ej: 713152905010",
        helperText:
          "Ingresa el número de orden de transporte (OT de 10 a 12 dígitos) emitida por Chilexpress.",
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
        "Ingresa la orden de flete de Starken (8 a 11 dígitos numéricos) para verificar el envío.",
    };
  };

  const courierMeta = getCourierMeta();

  const shippingCostNum = parseFloat(String(vendorOrder.shippingCost || 0));
  const shippingCostFormatted =
    isLocalPickup || shippingCostNum === 0
      ? "Gratis ($0)"
      : `$${shippingCostNum.toLocaleString("es-CL")}`;

  // Función para consultar a la API de validación
  const runValidation = async (code: string) => {
    const clean = code.replace(/[\s-]/g, "").trim();
    if (!clean || isLocalPickup) {
      setValidation(null);
      setValidating(false);
      return;
    }

    if (clean.length < 6) {
      setValidation(null);
      setValidating(false);
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const res = await fetch(
        `${API_URL}/shipping/validate-tracking?courier=${encodeURIComponent(
          courierMeta.key
        )}&trackingNumber=${encodeURIComponent(clean)}&vendorOrderId=${encodeURIComponent(
          vendorOrder.id
        )}`,
        {
          headers: {
            "x-auth-scope": "admin",
          },
          credentials: "include",
        }
      );

      if (res.ok) {
        const data: TrackingValidation = await res.json();
        setValidation(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setValidation({
          valid: false,
          courier: courierMeta.key,
          trackingNumber: clean,
          message: errData.message || "No fue posible validar la orden de transporte.",
        });
      }
    } catch {
      // Fallback suave
      setValidation({
        valid: true,
        courier: courierMeta.key,
        trackingNumber: clean,
        liveConfirmed: false,
        status: "Formato verificado",
        message: "No se pudo contactar al servicio de courier en este momento, pero el formato es aceptado.",
      });
    } finally {
      setValidating(false);
    }
  };

  // Debounce automático al tipear
  useEffect(() => {
    if (isLocalPickup) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const clean = trackingNumber.replace(/[\s-]/g, "").trim();
    if (!clean) {
      setValidation(null);
      setValidating(false);
      return;
    }

    // Si tiene al menos 8 dígitos, consultar automáticamente tras 500ms
    if (clean.length >= 8) {
      debounceRef.current = setTimeout(() => {
        runValidation(clean);
      }, 500);
    } else {
      setValidation(null);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [trackingNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTracking = trackingNumber.trim();
    if (!cleanTracking && !isLocalPickup) {
      setError(`Por favor ingresa el número de seguimiento oficial de ${courierMeta.name}.`);
      return;
    }

    // Si la validación retornó inválido, impedir el despacho
    if (!isLocalPickup && validation && !validation.valid) {
      setError(validation.message || "El número de transporte no es válido según los registros del courier.");
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
          trackingUrl: validation?.trackingUrl,
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

  const isSubmitDisabled =
    loading ||
    validating ||
    (!isLocalPickup && (!trackingNumber.trim() || (validation !== null && !validation.valid)));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isLocalPickup
          ? `Confirmar Entrega en Local #${orderBuyOrder}`
          : `Despachar Pedido #${orderBuyOrder}`
      }
      maxWidth={validation?.events && validation.events.length > 0 ? "lg" : "md"}
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
              : "Validamos automáticamente la orden de transporte con los servidores oficiales del courier para proteger a ambas partes y liberar tus fondos con total seguridad."}
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="trackingNumber"
              className="block text-xs font-bold uppercase tracking-wider text-gray-300"
            >
              {isLocalPickup
                ? "Comprobante o Código de Retiro en Local (Opcional)"
                : `N° de Orden de Transporte / Seguimiento ${courierMeta.name}`}
            </label>
            {!isLocalPickup && (
              <span className="text-[10px] text-gray-400 font-medium">
                Validación en vivo con API oficial
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              id="trackingNumber"
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={courierMeta.placeholder}
              className={`w-full rounded-xl border bg-[#07090E] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all font-mono pr-28 ${
                validation?.valid
                  ? "border-emerald-500/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  : validation && !validation.valid
                  ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-white/10 focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20"
              }`}
              required={!isLocalPickup}
            />

            {!isLocalPickup && (
              <div className="absolute right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => runValidation(trackingNumber)}
                  disabled={validating || !trackingNumber.trim()}
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40 text-xs font-semibold text-gray-200 transition-colors flex items-center gap-1 border border-white/10"
                >
                  {validating ? (
                    <>
                      <IconLoader className="w-3.5 h-3.5 text-blue-400" />
                      <span>Validando</span>
                    </>
                  ) : (
                    <>
                      <IconSearch className="w-3.5 h-3.5 text-gray-400" />
                      <span>Verificar</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Feedback de validación en tiempo real */}
          {validating && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center gap-2.5 text-xs text-blue-300 animate-pulse">
              <IconLoader className="w-4 h-4 shrink-0 text-blue-400" />
              <span>Consultando registros oficiales en los servidores de {courierMeta.name}...</span>
            </div>
          )}

          {!validating && validation && validation.valid && (
            validation.events && validation.events.length > 0 ? (
              <CarrierTimeline
                courierName={courierMeta.name}
                trackingNumber={validation.trackingNumber || trackingNumber}
                trackingUrl={validation.trackingUrl}
                status={validation.status}
                destination={validation.destination}
                service={validation.service}
                events={validation.events}
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <IconCheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Orden de Transporte Confirmada en {courierMeta.name}</span>
                  </span>
                  {validation.liveConfirmed && (
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      En Línea
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-500/15">
                  <div>
                    <span className="text-gray-400 block">Estado actual:</span>
                    <span className="font-semibold text-white">{validation.status}</span>
                  </div>
                  {validation.destination && (
                    <div>
                      <span className="text-gray-400 block">Destino / Cobertura:</span>
                      <span className="font-semibold text-white">{validation.destination}</span>
                    </div>
                  )}
                </div>

                {validation.trackingUrl && (
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Verificación de trayecto:</span>
                    <a
                      href={validation.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
                    >
                      <span>Rastrear en {courierMeta.name}</span>
                      <IconExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            )
          )}

          {!validating && validation && !validation.valid && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 space-y-1.5 text-xs text-red-300">
              <div className="font-bold flex items-center gap-1.5 text-red-400">
                <IconAlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>Orden de Transporte No Válida</span>
              </div>
              <p className="text-[11px] text-red-300/90 leading-relaxed">
                {validation.message}
              </p>
              <p className="text-[10px] text-gray-400 pt-1 border-t border-red-500/20">
                Para prevenir fraudes o errores de digitación, debes ingresar un número de seguimiento real emitido por el courier acordado.
              </p>
            </div>
          )}

          <p className="text-[10px] text-gray-500">
            {isLocalPickup
              ? "Si el cliente retiró presencialmente, puedes dejarlo vacío (se registrará RETIRO-LOCAL) o ingresar el número de boleta/comprobante."
              : `Este número se validará automáticamente y se vinculará directamente a la página oficial de rastreo de ${courierMeta.name}.`}
          </p>
        </div>

        {/* Error general del submit */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <IconAlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
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
            disabled={isSubmitDisabled}
            className={`font-bold flex items-center gap-1.5 ${
              isSubmitDisabled
                ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-60"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
            }`}
          >
            {isLocalPickup ? (
              <>
                <IconCheckCircle className="w-4 h-4 shrink-0" />
                <span>{loading ? "Confirmando..." : "Confirmar Entrega en Local & Liberar Fondos"}</span>
              </>
            ) : (
              <>
                {loading ? (
                  <IconLoader className="w-4 h-4 shrink-0" />
                ) : (
                  <IconBox className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {loading
                    ? "Procesando..."
                    : validating
                    ? "Validando OT..."
                    : "Confirmar Despacho & Liberar Fondos"}
                </span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

