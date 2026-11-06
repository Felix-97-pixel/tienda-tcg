"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { adminFetch } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import StoreCreditModal from "@/app/admin/_components/StoreCredit/StoreCreditModal";
import StoreCreditHistoryModal from "@/app/admin/_components/StoreCredit/StoreCreditHistoryModal";
import { useAppSelector } from "@/redux/store";
import { IconClock, IconPlus, IconWallet } from "@/components/ui/Icons";
import type {
  StoreCredit,
  StoreCreditUser,
  AdjustmentType,
} from "@/app/admin/_components/StoreCredit/types/store-credit.types";

export default function AdminStoreCreditPage() {
  const t = useTranslations("admin.store_credit_page");
  const { showToast } = useToast();
  const [credits, setCredits] = useState<StoreCredit[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StoreCreditUser | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState<StoreCreditUser | null>(null);

  const { features } = useAppSelector((state) => state.adminAuthReducer);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/store-credit");
      if (!res.ok) throw new Error("Error fetching credits");
      const data: StoreCredit[] = await res.json();
      setCredits(data);
    } catch (e) {
      console.error(e);
      showToast(t("error_load"), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const [defaultType, setDefaultType] = useState<AdjustmentType>("MANUAL_ADD");

  const handleAdjust = (type: AdjustmentType, credit?: StoreCredit) => {
    setSelectedUser(credit?.user || null);
    setDefaultType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red">{t("badge")}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">{t("title")}</h1>
          <p className="text-white/40 text-xs mt-0.5">
            {t("subtitle")}
          </p>
        </div>
        
      </div>

      <div className="bg-[#0E121B] rounded-2xl shadow-xl border border-white/10 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : credits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 text-white/40">
              <IconWallet className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{t("no_credits")}</h3>
            <p className="text-white/40 max-w-sm text-xs">
              {t("no_credits_desc")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#090C14] border-b border-white/10 text-[11px] uppercase tracking-wider text-white/50 font-black">
                  <th className="px-6 py-4">{t("col_client")}</th>
                  <th className="px-6 py-4">{t("col_email")}</th>
                  <th className="px-6 py-4 text-right">{t("col_balance")}</th>
                  <th className="px-6 py-4 text-right">{t("col_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {credits.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {c.user?.name || t("default_user")}
                    </td>
                    <td className="px-6 py-4 text-white/50 text-sm">{c.user?.email}</td>
                    <td className="px-6 py-4 text-right font-black text-emerald-400 text-lg">
                      ${Number(c.balance).toLocaleString("es-CL")}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (c.user) {
                            setHistoryUser(c.user);
                            setIsHistoryModalOpen(true);
                          }
                        }}
                      >
                        <IconClock className="w-4 h-4 mr-1 inline-block" />
                        {t("history_btn")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="3xl">
        {isModalOpen && (
          <StoreCreditModal
            preselectedUser={selectedUser}
            defaultType={defaultType}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setIsModalOpen(false);
              setSelectedUser(null);
              fetchCredits();
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        maxWidth="3xl"
      >
        {isHistoryModalOpen && historyUser && (
          <StoreCreditHistoryModal
            userId={historyUser.id}
            userName={historyUser.name || historyUser.email}
            onClose={() => setIsHistoryModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
