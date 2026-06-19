import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

interface StoreCreditHistoryModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

export default function StoreCreditHistoryModal({ userId, userName, onClose }: StoreCreditHistoryModalProps) {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingItems, setViewingItems] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/store-credit/user/${userId}/transactions`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("Error al obtener historial");
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        showToast("Error cargando el historial", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, showToast]);

  return (
    <div className="p-6 max-h-[85vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Historial de Store Credit
          </h2>
          <p className="text-sm text-gray-4 mt-1">
            Transacciones de <span className="text-white font-bold">{userName}</span>
          </p>
        </div>
      </div>

      <div className="bg-[#111318] border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-10 text-center text-gray-5">
            No hay transacciones registradas para este usuario.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#1a1d24] border-b border-white/5 text-xs uppercase tracking-wider text-gray-5 font-bold">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Referencia</th>
                  <th className="px-4 py-3 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-gray-3">
                      {new Date(t.createdAt).toLocaleString('es-CL', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${t.amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                        {t.amount > 0 ? 'Abono' : 'Descuento'}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                      {t.amount > 0 ? '+' : ''}{Number(t.amount).toLocaleString('es-CL')}
                    </td>
                    <td className="px-4 py-3 text-gray-4 text-xs max-w-[200px] truncate" title={t.reference}>
                      {t.reference || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.itemsData && t.itemsData.length > 0 && (
                        <button
                          onClick={() => setViewingItems(t.itemsData)}
                          className="inline-flex items-center justify-center gap-1.5 text-blue hover:text-white transition-colors bg-blue/10 hover:bg-blue/30 px-3 py-1.5 rounded-lg text-xs font-bold uppercase"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          Ver Cartas
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

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all text-sm"
        >
          Cerrar
        </button>
      </div>

      {viewingItems && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111318] border border-white/10 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1d24] rounded-t-2xl">
              <h3 className="font-bold text-white">Detalle de Productos</h3>
              <button onClick={() => setViewingItems(null)} className="text-gray-4 hover:text-white text-xl leading-none">✕</button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {viewingItems.map((item: any, i: number) => (
                <div key={i} className="flex gap-4 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                  <div className="w-12 h-16 bg-black rounded shrink-0 overflow-hidden">
                    {item.product?.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-sm">{item.product?.name || "Producto"}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-3">{item.condition || "NM"}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-3">{item.language || "EN"}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-3">{item.finish || "Normal"}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-4">Cant: <b className="text-white">{item.quantity}</b></span>
                      <span className="text-xs font-bold text-blue">${Number(item.price).toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
