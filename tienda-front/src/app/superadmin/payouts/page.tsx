"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { Button } from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";
import { useTranslations } from "next-intl";

export default function SuperAdminPayoutsPage() {
  const t = useTranslations("payouts_page");
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_URL}/withdrawals/pending`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPending(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: string, action: 'complete' | 'reject') => {
    const confirmMsg = action === 'complete' 
      ? t("confirm_complete")
      : t("confirm_reject");
      
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_URL}/withdrawals/${id}/${action}`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        alert(action === 'complete' ? t("success_complete") : t("success_reject"));
        fetchPending();
      } else {
        alert(t("error_request"));
      }
    } catch (err) {
      alert(t("error_network"));
    }
  };

  if (loading) return <Loader text={t("loading_payouts")} className="min-h-screen bg-transparent" />;

  return (
    <div className="p-6 space-y-6 pb-24 text-white">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
      </div>

      <div className="bg-[#111318] p-6 rounded-lg border border-white/10 shadow-lg overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-3 mb-4">{t("pending_requests")}</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-4 text-sm">
              <th className="py-3 px-4">{t("col_date")}</th>
              <th className="py-3 px-4">{t("col_store")}</th>
              <th className="py-3 px-4">{t("col_amount")}</th>
              <th className="py-3 px-4">{t("col_bank_details")}</th>
              <th className="py-3 px-4 text-right">{t("col_actions")}</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-5">{t("no_pending")}</td></tr>
            ) : (
              pending.map((w: any) => (
                <tr key={w.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-3">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-white">
                    {w.store?.name || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-green-400">
                    ${Number(w.amount).toLocaleString('es-CL')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-3 max-w-[250px] truncate" title={w.bankDetails}>
                    {w.bankDetails}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button 
                      variant="secondary" 
                      className="bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30"
                      onClick={() => handleAction(w.id, 'reject')}
                    >
                      {t("btn_reject")}
                    </Button>
                    <Button 
                      variant="primary" 
                      className="bg-green-600 hover:bg-green-500 text-white"
                      onClick={() => handleAction(w.id, 'complete')}
                    >
                      {t("btn_complete")}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
