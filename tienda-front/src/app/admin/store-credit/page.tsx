"use client";
import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import StoreCreditModal from "@/components/Admin/StoreCredit/StoreCreditModal";
import StoreCreditHistoryModal from "@/components/Admin/StoreCredit/StoreCreditHistoryModal";
import UpsellBanner from "@/components/Admin/UpsellBanner";
import { useAppSelector } from "@/redux/store";
import type {
  StoreCredit,
  StoreCreditUser,
  AdjustmentType,
} from "@/components/Admin/StoreCredit/types/store-credit.types";

export default function AdminStoreCreditPage() {
  const { showToast } = useToast();
  const [credits, setCredits] = useState<StoreCredit[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StoreCreditUser | null>(null);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyUser, setHistoryUser] = useState<StoreCreditUser | null>(null);

  const { features } = useAppSelector((state) => state.authReducer);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store-credit`, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching credits");
      const data: StoreCredit[] = await res.json();
      setCredits(data);
    } catch (e) {
      console.error(e);
      showToast("Error al cargar los créditos", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const [defaultType, setDefaultType] = useState<AdjustmentType>("MANUAL_ADD");

  const handleAdjust = (type: AdjustmentType, credit?: StoreCredit) => {
    setSelectedUser(credit?.user || null);
    setDefaultType(type);
    setIsModalOpen(true);
  };

  if (!features.includes("addon:store_credit")) {
    return (
      <div className="p-6 pb-24">
        <UpsellBanner featureName="Crédito de Tienda" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Créditos de Tienda</h1>
          <p className="text-gray-4 text-sm mt-1">
            Gestiona los saldos a favor (Store Credit) de tus clientes.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => handleAdjust("MANUAL_ADD")}
            leftIcon={<span className="text-lg">+</span>}
          >
            Abonar (Trade-in)
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleAdjust("MANUAL_SUBTRACT")}
            leftIcon={<span className="text-lg">-</span>}
          >
            Descontar (Compra)
          </Button>
        </div>
      </div>

      <div className="bg-[#1a1d24] rounded-2xl shadow-1 border border-white/5 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : credits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#0f1115] rounded-full flex items-center justify-center mb-4 text-3xl">
              💰
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Sin Créditos</h3>
            <p className="text-gray-4 max-w-sm">
              Aún no hay clientes con saldo a favor en tu tienda.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-[#0f1115] border-b border-white/5 text-xs uppercase tracking-wider text-gray-5 font-bold">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-right">Saldo Actual</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {credits.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-white">
                      {c.user?.name || "Usuario"}
                    </td>
                    <td className="px-6 py-4 text-gray-4 text-sm">{c.user?.email}</td>
                    <td className="px-6 py-4 text-right font-black text-blue text-lg">
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
                        <svg
                          className="w-4 h-4 mr-1 inline-block"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Historial
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleAdjust("MANUAL_ADD", c)}
                      >
                        + Abonar
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAdjust("MANUAL_SUBTRACT", c)}
                      >
                        - Descontar
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
