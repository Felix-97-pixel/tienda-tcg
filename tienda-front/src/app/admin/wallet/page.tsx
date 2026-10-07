"use client";
import React, { useState, useEffect } from "react";
import Loader from "@/components/ui/Loader";
import { API_URL } from "@/utils/api";
import { Button } from "@/components/ui/Button";

export default function StoreWalletPage() {
  const [history, setHistory] = useState<any>({ transactions: [], withdrawals: [], balance: 0 });
  const [loading, setLoading] = useState(true);
  const [requestAmount, setRequestAmount] = useState("");
  const [bankDetails, setBankDetails] = useState("");

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/withdrawals/history`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(requestAmount);
    if (!amt || amt <= 0 || amt > history.balance) {
      alert("Monto inválido");
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/withdrawals/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, bankDetails }),
        credentials: "include"
      });
      if (res.ok) {
        alert("Retiro solicitado con éxito");
        setRequestAmount("");
        fetchHistory();
      } else {
        const data = await res.json();
        alert(data.message || "Error al solicitar retiro");
      }
    } catch (err) {
      alert("Error de conexión");
    }
  };

  if (loading) return <Loader text="Cargando..." className="min-h-[40vh] bg-transparent py-10" />;

  return (
    <div className="p-6 space-y-6 pb-24 text-white">
      <div>
        <h1 className="text-2xl font-bold">Billetera de la Tienda</h1>
        <p className="text-gray-4 text-sm mt-1">Administra tus ganancias y retiros de dinero de ventas por Webpay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111318] p-6 rounded-lg border border-white/10 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-3 mb-2">Saldo Retirable (Webpay)</h2>
          <p className="text-4xl font-bold text-green-400">
            ${Number(history.balance || 0).toLocaleString('es-CL')}
          </p>
          <p className="text-xs text-gray-5 mt-2">
            Este saldo proviene de las ventas pagadas con Webpay. Puedes solicitar el retiro a tu cuenta bancaria.
          </p>
        </div>

        <div className="bg-[#111318] p-6 rounded-lg border border-white/10 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-3 mb-4">Solicitar Retiro</h2>
          <form onSubmit={handleRequestWithdrawal} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-4 mb-1">Monto a Retirar</label>
              <input 
                type="number" 
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white"
                placeholder="Ej: 50000"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-4 mb-1">Datos Bancarios (Banco, Tipo, N° Cuenta, RUT)</label>
              <input 
                type="text" 
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white"
                placeholder="Ej: Banco Estado, Cuenta RUT, 19.xxx.xxx-x"
                required
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Enviar Solicitud
            </Button>
          </form>
        </div>
      </div>

      <div className="bg-[#111318] p-6 rounded-lg border border-white/10 shadow-lg overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-3 mb-4">Historial de Transacciones</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-4 text-sm">
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Referencia</th>
              <th className="py-3 px-4">Método</th>
              <th className="py-3 px-4 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {history.transactions.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-gray-5">No hay transacciones recientes</td></tr>
            ) : (
              history.transactions.map((tx: any) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-3">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-3">
                    {tx.type === 'WITHDRAWAL' ? 'Retiro de Fondos' : tx.reference}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {tx.paymentMethod === 'MERCADOPAGO' ? (
                      <span className="bg-blue-900/30 text-blue-400 border border-blue-500/50 px-2 py-1 rounded text-xs">Mercado Pago</span>
                    ) : tx.paymentMethod === 'WEBPAY' ? (
                      <span className="bg-orange-900/30 text-orange-400 border border-orange-500/50 px-2 py-1 rounded text-xs">Webpay</span>
                    ) : (
                      <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs">{tx.paymentMethod || 'N/A'}</span>
                    )}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${tx.type === 'WITHDRAWAL' ? 'text-red-400' : 'text-green-400'}`}>
                    {tx.type === 'WITHDRAWAL' ? '-' : '+'}${Number(tx.amount).toLocaleString('es-CL')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-[#111318] p-6 rounded-lg border border-white/10 shadow-lg overflow-x-auto mt-6">
        <h2 className="text-lg font-semibold text-gray-3 mb-4">Estado de Retiros Solicitados</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-4 text-sm">
              <th className="py-3 px-4">Fecha Solicitud</th>
              <th className="py-3 px-4">Cuenta Destino</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            {history.withdrawals.length === 0 ? (
              <tr><td colSpan={4} className="py-4 text-center text-gray-5">No has solicitado retiros aún</td></tr>
            ) : (
              history.withdrawals.map((w: any) => (
                <tr key={w.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-3">
                    {new Date(w.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-3 truncate max-w-[200px]" title={w.bankDetails}>
                    {w.bankDetails}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {w.status === 'PENDING' && <span className="bg-yellow-900/30 text-yellow-500 px-2 py-1 rounded text-xs">En Proceso</span>}
                    {w.status === 'COMPLETED' && <span className="bg-green-900/30 text-green-500 px-2 py-1 rounded text-xs">Completado</span>}
                    {w.status === 'REJECTED' && <span className="bg-red-900/30 text-red-500 px-2 py-1 rounded text-xs">Rechazado</span>}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-white">
                    ${Number(w.amount).toLocaleString('es-CL')}
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
