"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { API_URL } from "@/utils/api";
import { Order, VendorOrderData, OrderItem } from "@/types/order";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import DispatchModal from "./DispatchModal";
import CarrierTimeline from "./CarrierTimeline";

import {
  IconCheckCircle,
  IconClock,
  IconBox,
  IconEye,
  IconSparkles,
  IconInfo,
  IconCard,
  IconExternalLink,
  IconX,
  IconLoader,
  IconChevronDown,
  IconChevronUp,
  IconTruck,
} from "@/components/ui/Icons";

export interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  statusClasses: Record<string, string>;
  statusLabel: (status: string) => string;
  onRefresh?: () => void;
}

export default function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  statusClasses,
  statusLabel,
  onRefresh,
}: OrderDetailsModalProps) {
  const t = useTranslations("orders");
  const tc = useTranslations("common");
  const [selectedVoForDispatch, setSelectedVoForDispatch] = useState<VendorOrderData | null>(null);
  
  // Estado de carta activa para visualización: por hover o por click/pin
  const [hoveredCard, setHoveredCard] = useState<OrderItem | null>(null);
  const [pinnedCard, setPinnedCard] = useState<OrderItem | null>(null);

  // Estado de seguimiento de encomienda en vivo
  const [trackingDataMap, setTrackingDataMap] = useState<Record<string, any>>({});
  const [loadingTrackingId, setLoadingTrackingId] = useState<string | null>(null);

  const handleToggleTracking = async (voId: string, courier: string, trackingNum: string) => {
    if (trackingDataMap[voId]) {
      setTrackingDataMap((prev) => {
        const next = { ...prev };
        delete next[voId];
        return next;
      });
      return;
    }

    setLoadingTrackingId(voId);
    try {
      const res = await fetch(
        `${API_URL}/shipping/validate-tracking?courier=${encodeURIComponent(
          courier
        )}&trackingNumber=${encodeURIComponent(trackingNum)}&vendorOrderId=${encodeURIComponent(
          voId
        )}`,
        {
          headers: { "x-auth-scope": "admin" },
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setTrackingDataMap((prev) => ({ ...prev, [voId]: data }));
      }
    } catch {
      // ignore
    } finally {
      setLoadingTrackingId(null);
    }
  };

  if (!isOpen || !order) return null;

  const activeCard = hoveredCard || pinnedCard;

  const storeSubtotal = order.vendorOrders?.reduce(
    (acc, vo) => acc + (parseFloat(vo.subtotal as any) || 0),
    0
  ) ?? 0;
  const storeShipping = order.vendorOrders?.reduce(
    (acc, vo) => acc + (parseFloat(vo.shippingCost as any) || 0),
    0
  ) ?? 0;
  const storeTotal = storeSubtotal + storeShipping;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`${t("detail.title")} #${order?.buyOrder}`}
        maxWidth="xl"
      >
        {/* Content */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-[#111318] rounded-2xl p-6 space-y-3 border border-stroke">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-4 font-medium">{t("table.customer")}</span>
              <span className="font-bold text-white">{order?.name}</span>
            </div>
            {order?.email && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-4 font-medium">Email</span>
                <span className="font-bold text-white">{order.email}</span>
              </div>
            )}
            {order?.phone && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-4 font-medium">{t("detail.phone")}</span>
                <span className="font-bold text-white">{order.phone}</span>
              </div>
            )}
            {order?.city && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-4 font-medium">{t("detail.city")}</span>
                <span className="font-bold text-white">{order.city}</span>
              </div>
            )}
            <div className="h-px bg-stroke my-2"></div>

            {order.vendorOrders && order.vendorOrders.length === 1 && (
              <>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>Subtotal Productos</span>
                  <span className="font-bold text-white">
                    ${storeSubtotal.toLocaleString("es-CL")}
                  </span>
                </div>
                {storeShipping > 0 && (
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Envío</span>
                    <span className="font-bold text-white">
                      ${storeShipping.toLocaleString("es-CL")}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-4 font-medium">
                {order.vendorOrders && order.vendorOrders.length === 1 ? "Total Tienda" : tc("total")}
              </span>
              <span className="font-black text-blue text-lg">
                ${(storeTotal > 0 ? storeTotal : parseFloat(order.totalAmount)).toLocaleString("es-CL")}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-4 font-medium">{tc("status")}</span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  statusClasses[order.status] ?? ""
                }`}
              >
                {statusLabel(order.status)}
              </span>
            </div>
            {order.payment?.authCode && (
              <div className="flex justify-between items-center text-sm pt-2 border-t border-stroke border-dashed">
                <span className="text-gray-4 font-medium">{t("detail.authCode")}</span>
                <span className="font-mono font-bold text-white">{order.payment.authCode}</span>
              </div>
            )}
            {order.payment?.cardLast4 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-4 font-medium">Tarjeta</span>
                <span className="font-mono font-bold text-gray-300">•••• {order.payment.cardLast4}</span>
              </div>
            )}
          </div>

          {/* Products List by Vendor */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">
                {t("detail.products")}
              </h3>
              <span className="text-[11px] text-gray-400 font-normal flex items-center gap-1.5">
                <IconInfo className="w-3.5 h-3.5 text-blue shrink-0" />
                <span>Pasa el cursor o haz clic para ver la guía visual</span>
              </span>
            </div>

            <div className="space-y-4">
              {order.vendorOrders?.map((vo) => (
                <div key={vo.id} className="bg-[#111318] p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <p className="text-gray-4 text-xs font-bold uppercase tracking-widest">
                      Tienda: {vo.store.name}
                    </p>
                    {vo.deliveryStatus === "DISPATCHED" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Despachado</span>
                      </span>
                    ) : order.status === "PAID" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                        <IconClock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Por Despachar (Custodia)</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Estado de Despacho & Botón */}
                  {order.status === "PAID" && (() => {
                    const carrierRaw = (
                      vo.shippingProvider?.name ||
                      vo.shippingCourier ||
                      "STARKEN"
                    ).toUpperCase();
                    const isPickup = carrierRaw.includes("RETIRO");
                    const badgeName = isPickup
                      ? "retiro"
                      : carrierRaw.includes("CHILE")
                      ? "chilexpress"
                      : carrierRaw.includes("BLUE")
                      ? "blue_express"
                      : carrierRaw.includes("CORREO")
                      ? "correos_chile"
                      : "starken";

                    return vo.deliveryStatus === "DISPATCHED" ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShippingBadge name={badgeName} size="sm" />
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{isPickup ? "Entrega en Local Realizada" : `Despachado vía ${vo.shippingCourier || "Courier"}`}</span>
                            </span>
                          </div>
                          <p className="text-gray-300 font-mono text-[11px]">
                            {isPickup ? "Comprobante / Código: " : "N° Guía / Seguimiento: "}
                            <strong className="text-emerald-400">{vo.trackingNumber}</strong>
                          </p>
                          {vo.dispatchedAt && (
                            <p className="text-[10px] text-gray-500">
                              Completado el{" "}
                              {new Date(vo.dispatchedAt).toLocaleDateString("es-CL", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {!isPickup && vo.trackingNumber && (
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleTracking(
                                  vo.id,
                                  vo.shippingCourier || "STARKEN",
                                  vo.trackingNumber || ""
                                )
                              }
                              disabled={loadingTrackingId === vo.id}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-white/15 cursor-pointer"
                            >
                              {loadingTrackingId === vo.id ? (
                                <>
                                  <IconLoader className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Cargando...</span>
                                </>
                              ) : trackingDataMap[vo.id] ? (
                                <>
                                  <IconChevronUp className="w-3.5 h-3.5" />
                                  <span>Ocultar Línea de Tiempo</span>
                                </>
                              ) : (
                                <>
                                  <IconTruck className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Ver Línea de Tiempo en Vivo</span>
                                </>
                              )}
                            </button>
                          )}

                          {vo.trackingUrl && !isPickup && (
                            <a
                              href={vo.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                            >
                              <span>Rastrear en Web</span>
                              <IconExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          )}
                        </div>

                        {trackingDataMap[vo.id] && (
                          <div className="w-full mt-3 pt-3 border-t border-emerald-500/20">
                            <CarrierTimeline
                              courierName={vo.shippingCourier || "Chilexpress"}
                              trackingNumber={vo.trackingNumber || ""}
                              trackingUrl={vo.trackingUrl || trackingDataMap[vo.id]?.trackingUrl}
                              status={trackingDataMap[vo.id]?.status}
                              destination={trackingDataMap[vo.id]?.destination}
                              service={trackingDataMap[vo.id]?.service}
                              events={trackingDataMap[vo.id]?.events}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ShippingBadge name={badgeName} size="sm" />
                            <span className="font-bold text-amber-400">
                              {isPickup ? "Retiro en Tienda Acordado" : `Envío Pagado vía ${carrierRaw.includes("CHILE") ? "Chilexpress" : carrierRaw.includes("BLUE") ? "Blue Express" : carrierRaw.includes("CORREO") ? "Correos de Chile" : "Starken"}`}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400">
                            {isPickup
                              ? "El comprador retirará presencialmente en el local. Confirma la entrega para liberar los fondos retenidos a tu billetera."
                              : "Ingresa el número de seguimiento oficial para que el cliente rastree su paquete y se libere el dinero a tu billetera."}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-md flex items-center gap-1.5"
                          onClick={() => setSelectedVoForDispatch(vo)}
                        >
                          {isPickup ? (
                            <>
                              <IconCheckCircle className="w-3.5 h-3.5" />
                              <span>Confirmar Entrega</span>
                            </>
                          ) : (
                            <>
                              <IconBox className="w-3.5 h-3.5" />
                              <span>Despachar Pedido</span>
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })()}

                  {/* Cartas con Hover Preview & Click Toggle */}
                  <div className="space-y-2">
                    {vo.items.map((item) => (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredCard(item)}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => setPinnedCard(pinnedCard?.id === item.id ? null : item)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                          activeCard?.id === item.id
                            ? "border-blue bg-[#1f2430] ring-1 ring-blue/50"
                            : "border-white/5 bg-[#1a1d24] hover:border-blue/40 hover:bg-[#1f232c]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Mini Thumbnail */}
                          <div className="w-10 h-14 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center group-hover:border-blue/50 transition-colors shadow-sm">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <IconCard className="w-5 h-5 text-gray-500" />
                            )}
                          </div>

                          {/* Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-white text-sm group-hover:text-blue-light transition-colors">
                                {item.productName}
                              </p>
                              <span className="text-[10px] text-gray-400 border border-white/10 rounded px-1.5 py-0.5 group-hover:border-blue/40 group-hover:text-blue-300 transition-colors inline-flex items-center gap-1">
                                <IconEye className="w-3 h-3 text-blue shrink-0" />
                                <span>Guía</span>
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                              <span className="text-blue font-black bg-blue/10 px-2 py-0.5 rounded-md border border-blue/20">
                                {t("detail.quantityCount", { count: item.quantity })}
                              </span>
                              {item.expansion && (
                                <span className="text-gray-300 font-medium">
                                  {item.expansion} {item.collectorNum ? `#${item.collectorNum}` : ""}
                                </span>
                              )}
                              {item.condition && (
                                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  {item.condition}
                                </span>
                              )}
                              {item.finish && (
                                <span className="text-cyan-300 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <IconSparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                  <span>{item.finish}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="font-black text-white text-base shrink-0 ml-4">
                          ${(parseFloat(item.unitPrice) * item.quantity).toLocaleString("es-CL")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <Button onClick={onClose} variant="secondary">
            {tc("close")}
          </Button>
        </div>
      </Modal>

      {/* Floating Hover Card Guide Popover */}
      {/* Centrado verticalmente (top-1/2 -translate-y-1/2) y colocado junto al modal en pantallas anchas, o al medio en pantallas angostas */}
      {activeCard && (
        <div
          className="fixed top-1/2 -translate-y-1/2 z-[999999] pointer-events-auto xl:left-[calc(50%+308px)] left-1/2 -translate-x-1/2 xl:translate-x-0 w-72 max-w-[90vw] bg-[#0c0e14]/98 border border-blue/50 rounded-2xl p-4 shadow-2xl shadow-black/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 ring-1 ring-blue/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-blue-light">
            <span className="flex items-center gap-1.5">
              <IconEye className="w-3.5 h-3.5 text-blue shrink-0" />
              <span>Guía de Armado</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-blue/20 text-white font-mono text-[11px] font-black border border-blue/30">
                Cant: {activeCard.quantity}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPinnedCard(null);
                  setHoveredCard(null);
                }}
                className="text-gray-400 hover:text-white p-0.5 rounded transition-colors"
                title="Cerrar guía"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card Artwork */}
          {activeCard.imageUrl ? (
            <div className="relative aspect-[744/1039] w-full rounded-xl overflow-hidden border border-white/15 bg-black/60 shadow-inner">
              <img
                src={activeCard.imageUrl}
                alt={activeCard.productName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-[744/1039] w-full rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center bg-white/5 text-gray-500 text-xs p-4 text-center">
              <IconCard className="w-8 h-8 text-gray-600 mb-2" />
              <span>Sin imagen disponible</span>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-3 space-y-1.5 text-xs">
            <p className="font-bold text-white text-sm leading-snug">
              {activeCard.productName}
            </p>
            
            {/* Pills */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {activeCard.game && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-300">
                  {activeCard.game}
                </span>
              )}
              {activeCard.expansion && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {activeCard.expansion} {activeCard.collectorNum ? `#${activeCard.collectorNum}` : ""}
                </span>
              )}
              {activeCard.rarity && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {activeCard.rarity}
                </span>
              )}
              {activeCard.condition && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {activeCard.condition}
                </span>
              )}
              {activeCard.finish && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <IconSparkles className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                  <span>{activeCard.finish}</span>
                </span>
              )}
              {activeCard.language && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-gray-400">
                  {activeCard.language}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Despacho */}
      <DispatchModal
        isOpen={!!selectedVoForDispatch}
        onClose={() => setSelectedVoForDispatch(null)}
        vendorOrder={selectedVoForDispatch}
        orderBuyOrder={order.buyOrder}
        onSuccess={() => {
          onRefresh?.();
          onClose();
        }}
      />
    </>
  );
}
