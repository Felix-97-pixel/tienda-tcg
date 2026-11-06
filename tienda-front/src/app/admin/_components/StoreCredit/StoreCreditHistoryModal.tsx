import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { IconEye } from "@/components/ui/Icons";
import TransactionItemsDetail from "./components/TransactionItemsDetail";
import type {
  StoreCreditTransaction,
  TransactionItemData,
} from "./types/store-credit.types";

interface StoreCreditHistoryModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

/**
 * Displays the transaction history for a specific user's store credit.
 * Ordered newest-first. Transactions with attached items show a "Ver Cartas"
 * button that opens the TransactionItemsDetail overlay.
 */
export default function StoreCreditHistoryModal({
  userId,
  userName,
  onClose,
}: StoreCreditHistoryModalProps) {
  const t = useTranslations("store_credit_page");
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<StoreCreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingItems, setViewingItems] = useState<TransactionItemData[] | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/store-credit/user/${userId}/transactions`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Error");
        const data: StoreCreditTransaction[] = await res.json();
        setTransactions(data);
      } catch {
        showToast(t("history_title"), "error");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, showToast, t]);

  return (
    <div className="p-6 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            {t("history_title")}
          </h2>
          <p className="text-sm text-gray-4 mt-1">
            {t("transactions_of")}{" "}
            <span className="text-white font-bold">{userName}</span>
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#080B12] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center text-gray-5">
            {t("no_tx_for_user")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#1a1d24] border-b border-white/5 text-xs uppercase tracking-wider text-gray-5 font-bold">
                  <th className="px-4 py-3">{t("col_date")}</th>
                  <th className="px-4 py-3">{t("col_type")}</th>
                  <th className="px-4 py-3">{t("col_amount")}</th>
                  <th className="px-4 py-3">{t("col_reference")}</th>
                  <th className="px-4 py-3 text-center">{t("col_detail")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-gray-3">
                      {new Date(tx.createdAt).toLocaleString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          tx.amount > 0
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {tx.amount > 0 ? t("type_credit") : t("type_debit")}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-bold ${
                        tx.amount > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {Number(tx.amount).toLocaleString("es-CL")}
                    </td>
                    <td
                      className="px-4 py-3 text-gray-4 text-xs max-w-[200px] truncate"
                      title={tx.reference || undefined}
                    >
                      {tx.reference || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {tx.itemsData && tx.itemsData.length > 0 && (
                        <button
                          onClick={() => setViewingItems(tx.itemsData)}
                          className="inline-flex items-center justify-center gap-1.5 text-blue hover:text-white transition-colors bg-blue/10 hover:bg-blue/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase"
                        >
                          <IconEye className="w-4 h-4" />
                          {t("view_cards")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm"
        >
          {t("btn_close")}
        </button>
      </div>

      {/* Items Detail Overlay */}
      {viewingItems && (
        <TransactionItemsDetail
          items={viewingItems}
          onClose={() => setViewingItems(null)}
        />
      )}
    </div>
  );
}
