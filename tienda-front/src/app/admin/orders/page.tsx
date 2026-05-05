"use client";
import React, { useEffect, useState, useCallback } from "react";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
};

type PaymentSummary = {
  status: string;
  authCode?: string;
} | null;

type Order = {
  id: string;
  buyOrder: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  totalAmount: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  createdAt: string;
  items: OrderItem[];
  payment: PaymentSummary;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Pendiente",  cls: "bg-yellow-100 text-yellow-800" },
  PAID:      { label: "Pagado",     cls: "bg-green-100 text-green-800"  },
  FAILED:    { label: "Fallido",    cls: "bg-red-100 text-red-800"      },
  CANCELLED: { label: "Cancelado",  cls: "bg-gray-100 text-gray-700"    },
  REFUNDED:  { label: "Reembolsado",cls: "bg-purple-100 text-purple-800"},
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const LIMIT = 15;

  const fetchOrders = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/payments/orders?page=${p}&limit=${LIMIT}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("No autorizado");
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Órdenes</h1>
          <p className="text-dark-4 text-sm mt-1">
            {total} orden{total !== 1 ? "es" : ""} en total
          </p>
        </div>
        <button
          onClick={() => fetchOrders(page)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-3 text-dark-4 hover:bg-gray-1 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-1 border-b border-gray-3">
                    <th className="text-left py-3.5 px-4 font-semibold text-dark-4">N° Orden</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-dark-4">Cliente</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-dark-4">Email</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-dark-4">Total</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-dark-4">Estado</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-dark-4">Fecha</th>
                    <th className="text-left py-3.5 px-4 font-semibold text-dark-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-dark-4">
                        No hay órdenes registradas
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const st = STATUS_LABELS[order.status] ?? { label: order.status, cls: "bg-gray-100 text-gray-700" };
                      return (
                        <tr key={order.id} className="border-b border-gray-3 hover:bg-gray-1 transition">
                          <td className="py-3 px-4 font-mono text-dark">{order.buyOrder}</td>
                          <td className="py-3 px-4 text-dark">{order.name}</td>
                          <td className="py-3 px-4 text-dark-4">{order.email}</td>
                          <td className="py-3 px-4 font-semibold text-dark">
                            ${parseFloat(order.totalAmount).toLocaleString("es-CL")}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-dark-4">
                            {new Date(order.createdAt).toLocaleDateString("es-CL")}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelected(order)}
                              className="text-blue hover:underline text-xs font-medium"
                            >
                              Ver detalle
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded border border-gray-3 text-dark-4 disabled:opacity-40 hover:bg-gray-1 transition"
              >
                ←
              </button>
              <span className="text-sm text-dark-4">
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded border border-gray-3 text-dark-4 disabled:opacity-40 hover:bg-gray-1 transition"
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {/* ─── Modal detalle ─── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-3">
              <div>
                <h2 className="font-bold text-dark text-lg">Orden #{selected.buyOrder}</h2>
                <p className="text-dark-4 text-sm">{selected.email}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-1 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Info cliente */}
              <div className="bg-gray-1 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-4">Cliente</span>
                  <span className="font-medium text-dark">{selected.name}</span>
                </div>
                {selected.phone && (
                  <div className="flex justify-between">
                    <span className="text-dark-4">Teléfono</span>
                    <span className="font-medium text-dark">{selected.phone}</span>
                  </div>
                )}
                {selected.city && (
                  <div className="flex justify-between">
                    <span className="text-dark-4">Ciudad</span>
                    <span className="font-medium text-dark">{selected.city}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-dark-4">Total</span>
                  <span className="font-bold text-dark">
                    ${parseFloat(selected.totalAmount).toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-4">Estado</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${(STATUS_LABELS[selected.status] ?? { cls: "" }).cls}`}>
                    {(STATUS_LABELS[selected.status] ?? { label: selected.status }).label}
                  </span>
                </div>
                {selected.payment?.authCode && (
                  <div className="flex justify-between">
                    <span className="text-dark-4">Código auth.</span>
                    <span className="font-medium text-dark font-mono">{selected.payment.authCode}</span>
                  </div>
                )}
              </div>

              {/* Productos */}
              <div>
                <h3 className="font-semibold text-dark mb-3">Productos</h3>
                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2 border-b border-gray-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-dark">{item.productName}</p>
                        <p className="text-dark-4 text-xs">× {item.quantity}</p>
                      </div>
                      <p className="font-medium text-dark">
                        ${(parseFloat(item.unitPrice) * item.quantity).toLocaleString("es-CL")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
