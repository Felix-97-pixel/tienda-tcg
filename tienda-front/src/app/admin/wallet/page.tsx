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
    <div className="space-y-6 pb-24 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red">Finanzas & Liquidaciones</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Billetera de la Tienda</h1>
          <p className="text-white/40 text-xs mt-0.5">Administra tus ganancias y retiros de dinero de ventas por Webpay y pasarelas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Saldo Disponible */}
        <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black tracking-widest uppercase text-white/50">Saldo Disponible (Retirable)</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <p className="text-3xl font-black tracking-tight text-emerald-400">
            ${Number(history.balance || 0).toLocaleString('es-CL')} <span className="text-xs text-emerald-400/60 font-normal">CLP</span>
          </p>
          <p className="text-xs text-white/40 mt-3 leading-relaxed">
            Fondos de ventas despachadas con número de seguimiento ingresado. Listos para transferencia electrónica (TEF).
          </p>
        </div>

        {/* Card 2: Saldo en Custodia (Escrow) */}
        <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black tracking-widest uppercase text-amber-400/80">Saldo en Custodia (Escrow)</h2>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Retenido
            </span>
          </div>
          <p className="text-3xl font-black tracking-tight text-amber-400">
            ${Number(history.heldBalance || 0).toLocaleString('es-CL')} <span className="text-xs text-amber-400/60 font-normal">CLP</span>
          </p>
          <p className="text-xs text-white/40 mt-3 leading-relaxed">
            Ventas pagadas retenidas temporalmente. Se liberan automáticamente al registrar el número de envío en <strong>Pedidos</strong>.
          </p>
        </div>

        {/* Card 3: Formulario Retiro */}
        <div className="bg-[#0E121B] p-6 rounded-2xl border border-white/10 shadow-xl md:col-span-2 lg:col-span-1">
          <h2 className="text-sm font-bold text-white mb-4">Solicitar Retiro de Fondos</h2>
          <form onSubmit={handleRequestWithdrawal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Monto a Retirar</label>
              <input 
                type="number" 
                value={requestAmount}
                onChange={(e) => setRequestAmount(e.target.value)}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:border-red focus:ring-1 focus:ring-red/30 focus:outline-none transition-all"
                placeholder="Ej: 50000"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/50 mb-1.5">Datos Bancarios (Banco, Tipo, N° Cuenta, RUT)</label>
              <input 
                type="text" 
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:border-red focus:ring-1 focus:ring-red/30 focus:outline-none transition-all"
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

      <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">Historial de Transacciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C14] border-b border-white/10 text-white/50 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-5">Fecha</th>
                <th className="py-3 px-5">Referencia</th>
                <th className="py-3 px-5">Método</th>
                <th className="py-3 px-5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {history.transactions.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-white/40 text-sm">No hay transacciones recientes</td></tr>
              ) : (
                history.transactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 text-sm text-white/70">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5 text-sm text-white font-medium">
                      {tx.type === 'WITHDRAWAL' ? 'Retiro de Fondos' : tx.reference}
                    </td>
                    <td className="py-3 px-5 text-sm">
                      {tx.paymentMethod === 'MERCADOPAGO' ? (
                        <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-md text-xs font-bold">Mercado Pago</span>
                      ) : tx.paymentMethod === 'WEBPAY' ? (
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md text-xs font-bold">Webpay</span>
                      ) : (
                        <span className="bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 rounded-md text-xs font-bold">{tx.paymentMethod || 'N/A'}</span>
                      )}
                    </td>
                    <td className={`py-3 px-5 text-right font-black text-sm ${tx.type === 'WITHDRAWAL' ? 'text-red' : 'text-emerald-400'}`}>
                      {tx.type === 'WITHDRAWAL' ? '-' : '+'}${Number(tx.amount).toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">Estado de Retiros Solicitados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090C14] border-b border-white/10 text-white/50 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-5">Fecha Solicitud</th>
                <th className="py-3 px-5">Cuenta Destino</th>
                <th className="py-3 px-5">Estado</th>
                <th className="py-3 px-5 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {history.withdrawals.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-white/40 text-sm">No has solicitado retiros aún</td></tr>
              ) : (
                history.withdrawals.map((w: any) => (
                  <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-5 text-sm text-white/70">
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-5 text-sm text-white font-medium truncate max-w-[200px]" title={w.bankDetails}>
                      {w.bankDetails}
                    </td>
                    <td className="py-3 px-5 text-sm">
                      {w.status === 'PENDING' && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">En Proceso</span>}
                      {w.status === 'COMPLETED' && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">Completado</span>}
                      {w.status === 'REJECTED' && <span className="bg-red/10 text-red border border-red/30 px-2.5 py-0.5 rounded-full text-xs font-bold">Rechazado</span>}
                    </td>
                    <td className="py-3 px-5 text-right font-black text-sm text-white">
                      ${Number(w.amount).toLocaleString('es-CL')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
