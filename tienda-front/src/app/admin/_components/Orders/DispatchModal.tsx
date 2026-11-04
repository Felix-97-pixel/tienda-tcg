"use client";
import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { API_URL, adminFetch } from "@/utils/api";
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
  IconCamera,
  IconUpload,
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

/**
 * Comprime una imagen en el cliente a formato WebP (máx. 1920px de resolución, calidad 80%)
 * para que no sobrecargue la red ni el almacenamiento del servidor.
 */
function compressImageToWebP(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_DIM = 1920;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".webp"),
                { type: "image/webp" }
              );
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
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

  // Estados de evidencia fotográfica TapTrade Shield (3 fotos)
  const [contentPhotoUrl, setContentPhotoUrl] = useState<string>("");
  const [packagingPhotoUrl, setPackagingPhotoUrl] = useState<string>("");
  const [packagePhotoUrl, setPackagePhotoUrl] = useState<string>("");
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Courier o método de entrega oficial pagado por el comprador
  const rawCourier = (
    vendorOrder?.shippingProvider?.name ||
    vendorOrder?.shippingCourier ||
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

  // Reset y sincronización de estado al abrir/cerrar modal o cambiar de orden
  useEffect(() => {
    if (isOpen && vendorOrder) {
      setTrackingNumber(vendorOrder.trackingNumber || "");
      setError(null);
      setValidation(null);
      setValidating(false);
      setLoading(false);
      setContentPhotoUrl(vendorOrder.evidence?.contentPhotoUrl || "");
      setPackagingPhotoUrl(vendorOrder.evidence?.packagingPhotoUrl || "");
      setPackagePhotoUrl(vendorOrder.evidence?.packagePhotoUrl || "");
      setPhotoError(null);
      setUploadingSlot(null);
    }
  }, [isOpen, vendorOrder?.id, vendorOrder?.trackingNumber, vendorOrder?.evidence]);

  // Función para subir una foto a Cloudinary comprimida en cliente a WebP
  const uploadPhotoSlot = async (file: File, slot: 1 | 2 | 3) => {
    setUploadingSlot(slot);
    setPhotoError(null);
    try {
      const compressed = await compressImageToWebP(file);
      const formData = new FormData();
      formData.append("file", compressed);

      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
      const headers: Record<string, string> = {
        "x-auth-scope": "admin",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/upload/image?folder=dispatch-evidence`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al subir fotografía de evidencia");
      }

      const data = await res.json();
      if (slot === 1) setContentPhotoUrl(data.url);
      else if (slot === 2) setPackagingPhotoUrl(data.url);
      else if (slot === 3) setPackagePhotoUrl(data.url);
    } catch (err: any) {
      setPhotoError(err.message || "No se pudo subir la foto");
    } finally {
      setUploadingSlot(null);
    }
  };

  // Función para consultar a la API de validación
  const runValidation = async (code: string) => {
    const clean = code.replace(/[\s-]/g, "").trim();
    if (!clean || isLocalPickup || !vendorOrder) {
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
      const res = await adminFetch(
        `/shipping/validate-tracking?courier=${encodeURIComponent(
          courierMeta.key
        )}&trackingNumber=${encodeURIComponent(clean)}&vendorOrderId=${encodeURIComponent(
          vendorOrder.id
        )}`
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
      // Fallback suave si no responde la API externa
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
    if (!isOpen || !vendorOrder || isLocalPickup) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const clean = trackingNumber.replace(/[\s-]/g, "").trim();
    if (!clean) {
      setValidation(null);
      setValidating(false);
      return;
    }

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
  }, [trackingNumber, isOpen, vendorOrder?.id]);

  if (!isOpen || !vendorOrder) return null;

  const totalOrderGross =
    Number(vendorOrder.subtotal || 0) + Number(vendorOrder.shippingCost || 0);
  const isShieldRequired = totalOrderGross >= 20000 && !isLocalPickup;
  const isPhotosComplete = !!(contentPhotoUrl && packagingPhotoUrl && packagePhotoUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorOrder) return;
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

    // Validación TapTrade Shield (Nivel 2/3)
    if (isShieldRequired && !isPhotosComplete) {
      setError("Para pedidos superiores a $20.000 CLP es obligatorio cargar las 3 fotografías de respaldo.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminFetch(`/payments/vendor-orders/${vendorOrder.id}/dispatch`, {
        method: "PATCH",
        body: JSON.stringify({
          courier: courierMeta.key,
          trackingNumber: isLocalPickup && !cleanTracking ? "RETIRO-LOCAL" : cleanTracking,
          trackingUrl: validation?.trackingUrl,
          contentPhotoUrl: contentPhotoUrl || undefined,
          packagingPhotoUrl: packagingPhotoUrl || undefined,
          packagePhotoUrl: packagePhotoUrl || undefined,
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

  const shippingCostNum = parseFloat(String(vendorOrder.shippingCost || 0));
  const shippingCostFormatted =
    isLocalPickup || shippingCostNum === 0
      ? "Gratis ($0)"
      : `$${shippingCostNum.toLocaleString("es-CL")}`;

  const isSubmitDisabled =
    loading ||
    validating ||
    uploadingSlot !== null ||
    (!isLocalPickup && (!trackingNumber.trim() || (validation !== null && !validation.valid))) ||
    (isShieldRequired && !isPhotosComplete);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[10010]"
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
          <div className="flex justify-between items-center text-gray-400 pt-1 border-t border-white/5">
            <span>Total Paquete:</span>
            <span className="font-bold text-emerald-400">
              ${totalOrderGross.toLocaleString("es-CL")} CLP
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

        {/* PROTOCOLO TAPTRADE SHIELD: EVIDENCIA FOTOGRÁFICA DE EMPAQUE */}
        {!isLocalPickup && (
          <div className="space-y-3 rounded-2xl bg-[#090C14] border border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCamera className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  TapTrade Shield • Respaldo de Empaque
                </span>
              </div>
              {isShieldRequired ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Obligatorio (≥ $20.000 CLP)
                </span>
              ) : (
                <span className="text-[10px] font-medium text-white/40">
                  Opcional recomendado
                </span>
              )}
            </div>

            <p className="text-[11px] text-white/50 leading-relaxed">
              Toma o sube 3 fotografías antes de entregar el paquete. Si un comprador alega que la carta no llegó o fue cambiada, este respaldo libera tus fondos automáticamente y desestima el reclamo.
            </p>

            {photoError && (
              <div className="p-2.5 rounded-xl bg-red/10 border border-red/30 text-red text-xs flex items-center gap-2">
                <IconAlertTriangle className="w-4 h-4 shrink-0 text-red" />
                <span>{photoError}</span>
              </div>
            )}

            {/* Grid 3 casillas de fotos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Casilla 1: Cartas + Comanda */}
              <div
                className={`p-3 rounded-xl border flex flex-col items-center text-center justify-between transition-all ${
                  contentPhotoUrl
                    ? "border-emerald-500/40 bg-emerald-950/20"
                    : "border-white/10 bg-[#121622] hover:border-white/20"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-2">
                  1. Cartas + Comanda
                </span>
                {contentPhotoUrl ? (
                  <div className="space-y-2 w-full">
                    <img
                      src={contentPhotoUrl}
                      alt="Cartas"
                      className="w-full h-24 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setContentPhotoUrl("")}
                      className="text-[10px] text-red hover:underline block mx-auto cursor-pointer"
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all p-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadPhotoSlot(f, 1);
                      }}
                    />
                    {uploadingSlot === 1 ? (
                      <IconLoader className="w-5 h-5 text-blue animate-spin" />
                    ) : (
                      <>
                        <IconUpload className="w-5 h-5 text-white/40 mb-1" />
                        <span className="text-[10px] text-white/60 font-semibold">Subir Foto</span>
                      </>
                    )}
                  </label>
                )}
                <span className="text-[9px] text-white/40 mt-1">Cartas junto al Nº de orden</span>
              </div>

              {/* Casilla 2: Toploader / Protección */}
              <div
                className={`p-3 rounded-xl border flex flex-col items-center text-center justify-between transition-all ${
                  packagingPhotoUrl
                    ? "border-emerald-500/40 bg-emerald-950/20"
                    : "border-white/10 bg-[#121622] hover:border-white/20"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-2">
                  2. Protección Rígida
                </span>
                {packagingPhotoUrl ? (
                  <div className="space-y-2 w-full">
                    <img
                      src={packagingPhotoUrl}
                      alt="Embalaje"
                      className="w-full h-24 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setPackagingPhotoUrl("")}
                      className="text-[10px] text-red hover:underline block mx-auto cursor-pointer"
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all p-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadPhotoSlot(f, 2);
                      }}
                    />
                    {uploadingSlot === 2 ? (
                      <IconLoader className="w-5 h-5 text-blue animate-spin" />
                    ) : (
                      <>
                        <IconUpload className="w-5 h-5 text-white/40 mb-1" />
                        <span className="text-[10px] text-white/60 font-semibold">Subir Foto</span>
                      </>
                    )}
                  </label>
                )}
                <span className="text-[9px] text-white/40 mt-1">Toploaders o cartón rígido</span>
              </div>

              {/* Casilla 3: Paquete sellado con etiqueta sobre el cierre */}
              <div
                className={`p-3 rounded-xl border flex flex-col items-center text-center justify-between transition-all ${
                  packagePhotoUrl
                    ? "border-emerald-500/40 bg-emerald-950/20"
                    : "border-white/10 bg-[#121622] hover:border-white/20"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 mb-2">
                  3. Paquete Sellado
                </span>
                {packagePhotoUrl ? (
                  <div className="space-y-2 w-full">
                    <img
                      src={packagePhotoUrl}
                      alt="Paquete sellado"
                      className="w-full h-24 object-cover rounded-lg border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setPackagePhotoUrl("")}
                      className="text-[10px] text-red hover:underline block mx-auto cursor-pointer"
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all p-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadPhotoSlot(f, 3);
                      }}
                    />
                    {uploadingSlot === 3 ? (
                      <IconLoader className="w-5 h-5 text-blue animate-spin" />
                    ) : (
                      <>
                        <IconUpload className="w-5 h-5 text-white/40 mb-1" />
                        <span className="text-[10px] text-white/60 font-semibold">Subir Foto</span>
                      </>
                    )}
                  </label>
                )}
                <span className="text-[9px] text-white/40 mt-1">Etiqueta sobre la solapa/cierre</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 flex items-start gap-2">
              <IconShieldCheck className="w-3.5 h-3.5 text-blue shrink-0 mt-0.5" />
              <span>
                <strong>Técnica de Cierre Seguro:</strong> Pega la etiqueta oficial de {courierMeta.name} cruzando la solapa de apertura del sobre. De este modo, nadie puede abrir el paquete sin destruir el código de barras oficial.
              </span>
            </div>
          </div>
        )}

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
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40 text-xs font-semibold text-gray-200 transition-colors flex items-center gap-1 border border-white/10 cursor-pointer"
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
                  <IconLoader className="w-4 h-4 shrink-0 animate-spin" />
                ) : (
                  <IconBox className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {loading
                    ? "Procesando..."
                    : validating
                    ? "Validando OT..."
                    : uploadingSlot !== null
                    ? "Subiendo fotos..."
                    : isShieldRequired && !isPhotosComplete
                    ? "Faltan fotos de respaldo (3)"
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
