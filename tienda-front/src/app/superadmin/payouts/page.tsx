"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { Button } from "@/components/ui/Button";
import Loader from "@/components/ui/Loader";

export default function SuperAdminPayoutsPage() {
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
      ? "¿Estás seguro que ya realizaste la transferencia bancaria y quieres marcar este pago como completado?"
      : "¿Estás seguro de que quieres rechazar esta solicitud y devolver el saldo a la tienda?";
      
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_URL}/withdrawals/${id}/${action}`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        alert(action === 'complete' ? "Pago marcado como completado." : "Pago rechazado.");
        fetchPending();
      } else {
        alert("Error al procesar la solicitud.");
      }
    } catch (err) {
      alert("Error de red");
    }
  };

  if (loading) return <Loader text="Cargando pagos pendientes..." className="min-h-screen bg-transparent" />;

  return (
    <div className="p-6 space-y-6 pb-24 text-white">
      <div>
        <h1 className="text-2xl font-bold">Gestión de Pagos (Payouts)</h1>
        <p className="text-gray-4 text-sm mt-1">Lista de tiendas que solicitan retirar sus ganancias acumuladas en Webpay.</p>
      </div>

      <div className="bg-[#111318] p-6 rounded-lg border border-white/10 shadow-lg overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-3 mb-4">Solicitudes Pendientes</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-4 text-sm">
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Tienda</th>
              <th className="py-3 px-4">Monto Solicitado</th>
              <th className="py-3 px-4">Datos Bancarios</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr><td colSpan={5} className="py-4 text-center text-gray-5">No hay solicitudes pendientes en este momento.</td></tr>
            ) : (
              pending.map((w: any) => (
                <tr key={w.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-3">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-white">
                    {w.store?.name || 'Tienda Desconocida'}
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
                      Rechazar
                    </Button>
                    <Button 
                      variant="primary" 
                      className="bg-green-600 hover:bg-green-500 text-white"
                      onClick={() => handleAction(w.id, 'complete')}
                    >
                      Marcar Transferido
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
