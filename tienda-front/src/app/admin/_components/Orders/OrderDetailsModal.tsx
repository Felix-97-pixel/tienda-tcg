"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Order, VendorOrderData } from "@/types/order";
import DispatchModal from "./DispatchModal";

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

  if (!isOpen || !order) return null;

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
            <div className="flex justify-between items-center">
              <span className="text-gray-4 font-medium">{tc("total")}</span>
              <span className="font-black text-blue text-lg">
                ${parseFloat(order.totalAmount).toLocaleString("es-CL")}
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
            <h3 className="font-bold text-white text-sm mb-4 uppercase tracking-widest">
              {t("detail.products")}
            </h3>
            <div className="space-y-4">
              {order.vendorOrders?.map((vo) => (
                <div key={vo.id} className="bg-[#111318] p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <p className="text-gray-4 text-xs font-bold uppercase tracking-widest">
                      Tienda: {vo.store.name}
                    </p>
                    {vo.deliveryStatus === "DISPATCHED" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        🟢 Despachado
                      </span>
                    ) : order.status === "PAID" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        🟡 Por Despachar (Custodia)
                      </span>
                    ) : null}
                  </div>

                  {/* Estado de Despacho & Botón */}
                  {order.status === "PAID" && (
                    vo.deliveryStatus === "DISPATCHED" ? (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-white flex items-center gap-1.5">
                            <span className="text-emerald-400">✓</span> Courier: {vo.shippingCourier || "Transporte"}
                          </p>
                          <p className="text-gray-300 font-mono text-[11px]">
                            N° Guía / Seguimiento:{" "}
                            <strong className="text-emerald-400">{vo.trackingNumber}</strong>
                          </p>
                          {vo.dispatchedAt && (
                            <p className="text-[10px] text-gray-500">
                              Despachado el{" "}
                              {new Date(vo.dispatchedAt).toLocaleDateString("es-CL", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                        {vo.trackingUrl && (
                          <a
                            href={vo.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-sm"
                          >
                            <span>Rastrear Envío Oficial</span>
                            <span>↗</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                        <div>
                          <p className="font-bold text-amber-400">Fondos en Custodia (Escrow)</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Ingresa el número de seguimiento para que el cliente rastree su paquete y se libere el dinero a tu billetera.
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-md"
                          onClick={() => setSelectedVoForDispatch(vo)}
                        >
                          📦 Despachar Pedido
                        </Button>
                      </div>
                    )
                  )}

                  {/* Cartas */}
                  {vo.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-[#1a1d24]"
                    >
                      <div>
                        <p className="font-bold text-white text-sm">{item.productName}</p>
                        <p className="text-blue font-black text-[10px] mt-0.5">
                          {t("detail.quantityCount", { count: item.quantity })}
                        </p>
                      </div>
                      <p className="font-bold text-white">
                        ${(parseFloat(item.unitPrice) * item.quantity).toLocaleString("es-CL")}
                      </p>
                    </div>
                  ))}
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
