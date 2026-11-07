"use client";
import React, { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/utils/api";
import { Button } from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import {
  IconShieldCheck,
  IconReceipt,
  IconCheck,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconCreditCard,
} from "@/components/ui/Icons";

export default function SuperAdminPayoutsPage() {
  const t = useTranslations("payouts_page");
  const { showToast } = useToast();
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modales de acción Superadmin
  const [activeModal, setActiveModal] = useState<{
    type: "approve" | "complete" | "reject";
    settlement: any;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Campos de formulario de modales
  const [transferReference, setTransferReference] = useState("");
  const [transferReceiptUrl, setTransferReceiptUrl] = useState("");
  const [platformDteFolio, setPlatformDteFolio] = useState("");
  const [platformDteUrl, setPlatformDteUrl] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [isFailedTransfer, setIsFailedTransfer] = useState(false);

  const fetchSettlements = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const res = await adminFetch(`/withdrawals/pending?status=${encodeURIComponent(status)}`);
      if (res.ok) {
        const data = await res.json();
        setSettlements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettlements(statusFilter);
  }, [statusFilter, fetchSettlements]);

  const openModal = (type: "approve" | "complete" | "reject", settlement: any) => {
    setTransferReference(settlement.transferReference || "");
    setTransferReceiptUrl(settlement.transferReceiptUrl || "");
    setPlatformDteFolio(settlement.platformDteFolio || "");
    setPlatformDteUrl(settlement.platformDteUrl || "");
    setRejectReason("");
    setIsFailedTransfer(false);
    setActiveModal({ type, settlement });
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;
    setSubmitting(true);

    const { type, settlement } = activeModal;
    try {
      let endpoint = `/withdrawals/${settlement.id}/${type}`;
      let payload: Record<string, any> = {};

      if (type === "approve") {
        payload = {
          platformDteFolio: platformDteFolio || undefined,
          platformDteUrl: platformDteUrl || undefined,
        };
      } else if (type === "complete") {
        payload = {
          transferReference,
          transferReceiptUrl: transferReceiptUrl || undefined,
          platformDteFolio: platformDteFolio || undefined,
          platformDteUrl: platformDteUrl || undefined,
        };
      } else if (type === "reject") {
        payload = {
          reason: rejectReason,
          isFailedTransfer,
        };
      }

      const res = await adminFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(
          type === "approve"
            ? t("success_approve")
            : type === "complete"
            ? t("success_complete")
            : t("success_reject"),
          "success"
        );
        setActiveModal(null);
        fetchSettlements(statusFilter);
      } else {
        const err = await res.json();
        showToast(err.message || t("error_request"), "error");
      }
    } catch {
      showToast(t("error_network"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filterTabs = [
    { key: "PENDING", label: t("filter_pending") },
    { key: "APPROVED", label: t("filter_approved") },
    { key: "COMPLETED", label: t("filter_completed") },
    { key: "REJECTED", label: t("filter_rejected") },
    { key: "FAILED", label: t("filter_failed") },
    { key: "ALL", label: t("filter_all") },
  ];

  return (
    <div className="p-6 space-y-6 pb-24 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red">
              {t("badge")}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
          <p className="text-white/50 text-xs mt-1">{t("subtitle")}</p>
        </div>

        {/* Pestañas de Filtro por Estado de Liquidación */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#080B12] p-1.5 rounded-2xl border border-white/10">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? "bg-red text-white shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader text={t("loading_payouts")} className="min-h-[40vh] bg-transparent" />
      ) : (
        <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-2xl overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C14] border-b border-white/10 text-white/50 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3.5 px-4">{t("col_code")}</th>
                <th className="py-3.5 px-4">{t("col_company_rut")}</th>
                <th className="py-3.5 px-4">{t("col_gross_comm")}</th>
                <th className="py-3.5 px-4">{t("col_net_transfer")}</th>
                <th className="py-3.5 px-4">{t("col_bank_details")}</th>
                <th className="py-3.5 px-4">{t("col_dte_folios")}</th>
                <th className="py-3.5 px-4">{t("col_status")}</th>
                <th className="py-3.5 px-4 text-right">{t("col_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-white/40 text-sm">
                    {t("no_pending")}
                  </td>
                </tr>
              ) : (
                settlements.map((w: any) => {
                  const isExpanded = expandedId === w.id;
                  const company = w.store?.company;
                  const ordersCount = w.vendorOrders?.length || 0;

                  return (
                    <React.Fragment key={w.id}>
                      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4 text-xs font-mono">
                          <div className="font-bold text-white">
                            {w.settlementCode || w.id.slice(0, 8)}
                          </div>
                          <div className="text-[11px] text-white/40">
                            {new Date(w.createdAt).toLocaleDateString("es-CL")}
                          </div>
                          {ordersCount > 0 && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/70 font-bold">
                              {t("orders_locked_badge", { count: ordersCount })}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-bold text-white">{w.store?.name || "-"}</div>
                          <div className="text-white/60 text-[11px]">
                            {company?.legalName || company?.name || ""}
                          </div>
                          {company?.rut && (
                            <div className="font-mono text-[11px] text-amber-400">
                              RUT: {company.rut}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs font-mono">
                          <div className="text-white/80">
                            ${Number(w.grossSalesAmount || w.amount).toLocaleString("es-CL")}
                          </div>
                          {Number(w.sellerCommissionAmount || 0) > 0 && (
                            <div className="text-[11px] text-amber-400">
                              -${Number(w.sellerCommissionAmount).toLocaleString("es-CL")} com.
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-sm font-black text-emerald-400 font-mono">
                          ${Number(w.amount).toLocaleString("es-CL")}
                        </td>

                        <td
                          className="py-3.5 px-4 text-xs text-white/80 max-w-[230px] truncate"
                          title={w.bankDetails}
                        >
                          {w.bankDetails}
                        </td>

                        <td className="py-3.5 px-4 text-xs font-mono space-y-0.5">
                          <div>
                            <span className="text-white/40">{t("store_dte_label")} </span>
                            {w.storeDteFolio ? (
                              <span className="text-emerald-400 font-bold">
                                #{w.storeDteFolio}
                              </span>
                            ) : (
                              <span className="text-white/30 italic">{t("no_dte_attached")}</span>
                            )}
                          </div>
                          {w.platformDteFolio && (
                            <div>
                              <span className="text-white/40">{t("platform_dte_label")} </span>
                              <span className="text-cyan-400 font-bold">#{w.platformDteFolio}</span>
                            </div>
                          )}
                          {w.transferReference && (
                            <div>
                              <span className="text-white/40">{t("tef_ref_label")} </span>
                              <span className="text-emerald-300 font-bold">
                                {w.transferReference}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              w.status === "COMPLETED"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : w.status === "APPROVED"
                                ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                                : w.status === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-red/15 text-red border-red/30"
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ordersCount > 0 && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="!px-2.5 !py-1.5 text-xs flex items-center gap-1"
                                onClick={() => setExpandedId(isExpanded ? null : w.id)}
                              >
                                <span>
                                  {isExpanded ? t("btn_hide_orders") : t("btn_view_orders")}
                                </span>
                                {isExpanded ? (
                                  <IconChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <IconChevronDown className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            )}

                            {w.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="secondary"
                                className="!px-2.5 !py-1.5 text-xs border-sky-500/40 text-sky-400 hover:bg-sky-500/10"
                                onClick={() => openModal("approve", w)}
                              >
                                {t("btn_approve")}
                              </Button>
                            )}

                            {(w.status === "PENDING" || w.status === "APPROVED") && (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  className="!px-2.5 !py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                                  onClick={() => openModal("complete", w)}
                                >
                                  {t("btn_complete")}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="!px-2.5 !py-1.5 text-xs bg-red/15 text-red border-red/40 hover:bg-red/25"
                                  onClick={() => openModal("reject", w)}
                                >
                                  {t("btn_reject")}
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Desglose Desplegable de Sub-Órdenes Bloqueadas en el Lote */}
                      {isExpanded && w.vendorOrders?.length > 0 && (
                        <tr className="bg-[#080B12] border-b border-white/10">
                          <td colSpan={8} className="p-4 pl-10">
                            <div className="space-y-2">
                              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                <IconReceipt className="w-4 h-4" />
                                <span>{t("included_orders_title")}</span>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                {w.vendorOrders.map((vo: any) => (
                                  <div
                                    key={vo.id}
                                    className="p-3 rounded-xl bg-[#0E121B] border border-white/10 text-xs font-mono flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-bold text-white">
                                        #{vo.order?.buyOrder || vo.id.slice(0, 8)}
                                      </div>
                                      <div className="text-[10px] text-white/50">
                                        Track: {vo.trackingNumber || "OK"} •{" "}
                                        {vo.order?.paymentMethod || "WEBPAY"}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-white/60">
                                        Bruto: ${Number(vo.grossAmount || 0).toLocaleString("es-CL")}
                                      </div>
                                      <div className="text-emerald-400 font-bold">
                                        Líq: $
                                        {Number(
                                          vo.sellerNetPayout || vo.grossAmount || 0
                                        ).toLocaleString("es-CL")}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para Aprobar, Confirmar TEF o Rechazar/Revertir Liquidación */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0E121B] border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-white">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  {activeModal.type === "reject" ? (
                    <IconX className="w-5 h-5 text-red" />
                  ) : activeModal.type === "complete" ? (
                    <IconCreditCard className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <IconShieldCheck className="w-5 h-5 text-sky-400" />
                  )}
                  <span>
                    {activeModal.type === "approve"
                      ? t("modal_approve_title", {
                          code:
                            activeModal.settlement.settlementCode ||
                            activeModal.settlement.id.slice(0, 8),
                        })
                      : activeModal.type === "complete"
                      ? t("modal_complete_title", {
                          code:
                            activeModal.settlement.settlementCode ||
                            activeModal.settlement.id.slice(0, 8),
                        })
                      : t("modal_reject_title", {
                          code:
                            activeModal.settlement.settlementCode ||
                            activeModal.settlement.id.slice(0, 8),
                        })}
                  </span>
                </h3>
                <p className="text-xs text-white/50 mt-1">
                  {activeModal.type === "approve"
                    ? t("modal_approve_desc")
                    : activeModal.type === "complete"
                    ? t("modal_complete_desc")
                    : t("modal_reject_desc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="space-y-4">
              {activeModal.type === "complete" && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
                      {t("field_transfer_ref")}
                    </label>
                    <input
                      type="text"
                      required
                      value={transferReference}
                      onChange={(e) => setTransferReference(e.target.value)}
                      placeholder={t("ph_transfer_ref")}
                      className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
                      {t("field_transfer_receipt_url")}
                    </label>
                    <input
                      type="url"
                      value={transferReceiptUrl}
                      onChange={(e) => setTransferReceiptUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {(activeModal.type === "approve" || activeModal.type === "complete") && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
                      {t("field_platform_dte_folio")}
                    </label>
                    <input
                      type="text"
                      value={platformDteFolio}
                      onChange={(e) => setPlatformDteFolio(e.target.value)}
                      placeholder={t("ph_platform_dte_folio")}
                      className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
                      {t("field_platform_dte_url")}
                    </label>
                    <input
                      type="url"
                      value={platformDteUrl}
                      onChange={(e) => setPlatformDteUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {activeModal.type === "reject" && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1">
                      {t("field_reject_reason")}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={t("ph_reject_reason")}
                      className="w-full bg-[#080B12] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-red focus:outline-none"
                    />
                  </div>
                  <label className="flex items-center gap-2.5 text-xs text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFailedTransfer}
                      onChange={(e) => setIsFailedTransfer(e.target.checked)}
                      className="w-4 h-4 accent-red"
                    />
                    <span>{t("field_is_failed_transfer")}</span>
                  </label>
                </>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setActiveModal(null)}
                  disabled={submitting}
                >
                  {t("btn_cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className={
                    activeModal.type === "complete"
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                      : activeModal.type === "approve"
                      ? "bg-sky-600 hover:bg-sky-500 text-white"
                      : ""
                  }
                >
                  <IconCheck className="w-4 h-4 mr-1.5" />
                  <span>
                    {activeModal.type === "approve"
                      ? t("btn_confirm_approve")
                      : activeModal.type === "complete"
                      ? t("btn_confirm_transfer")
                      : t("btn_confirm_reject")}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
