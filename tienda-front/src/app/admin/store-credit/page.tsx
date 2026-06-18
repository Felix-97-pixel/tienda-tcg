"use client";
import React, { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import StoreCreditModal from "@/components/Admin/StoreCredit/StoreCreditModal";

export default function AdminStoreCreditPage() {
  const { showToast } = useToast();
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/store-credit`, { credentials: "include" });
      if (!res.ok) throw new Error("Error fetching credits");
      const data = await res.json();
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

  const handleAdjust = (credit?: any) => {
    setSelectedUser(credit?.user || null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Créditos de Tienda</h1>
          <p className="text-gray-4 text-sm mt-1">
            Gestiona los saldos a favor (Store Credit) de tus clientes.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => handleAdjust()}
          leftIcon={<span className="text-lg">+</span>}
        >
          Abonar / Descontar Saldo
        </Button>
      </div>

      <div className="bg-[#1a1d24] rounded-2xl shadow-1 border border-white/5 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : credits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-[#0f1115] rounded-full flex items-center justify-center mb-4 text-3xl">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">Sin Créditos</h3>
            <p className="text-gray-4 max-w-sm">
              Aún no hay clientes con saldo a favor en tu tienda.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
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
                  <td className="px-6 py-4 font-bold text-white">{c.user?.name || 'Usuario'}</td>
                  <td className="px-6 py-4 text-gray-4 text-sm">{c.user?.email}</td>
                  <td className="px-6 py-4 text-right font-black text-blue text-lg">
                    ${Number(c.balance).toLocaleString('es-CL')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button size="sm" variant="secondary" onClick={() => handleAdjust(c)}>
                      Ajustar Saldo
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <StoreCreditModal
          preselectedUser={selectedUser}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCredits();
          }}
        />
      </Modal>
    </div>
  );
}
