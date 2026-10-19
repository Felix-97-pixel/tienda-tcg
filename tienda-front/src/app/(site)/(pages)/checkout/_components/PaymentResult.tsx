"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { IconBox, IconStore } from "@/components/ui/Icons";

type OrderDetail = {
  id: string;
  buyOrder: string;
  email: string;
  name: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  vendorOrders: {
    id: string;
    store: { id: string; name: string };
    items: {
      id: string;
      productName: string;
      quantity: number;
      unitPrice: string;
    }[];
  }[];
  payment?: {
    authCode?: string;
    cardLast4?: string;
    paymentType?: string;
    installments?: number;
  } | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Status = "success" | "failed" | "cancelled" | "error" | "loading";

const PaymentResultPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const tokenWs = searchParams.get("token_ws");
  const tbkToken = searchParams.get("TBK_TOKEN");
  const statusParam = searchParams.get("status") as Status | null;
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<Status>("loading");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const committedRef = React.useRef(false);

  useEffect(() => {
    // 1. Caso Retorno de Webpay Plus con token_ws
    if (tokenWs) {
      if (committedRef.current) return;
      committedRef.current = true;
      setStatus("loading");

      fetch(`${API_URL}/payments/commit-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token_ws: tokenWs }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "Error al confirmar transacción con Webpay");
          }
          return res.json();
        })
        .then((data) => {
          if (data.approved) {
            setStatus("success");
            dispatch(removeAllItemsFromCart());
          } else {
            setStatus("failed");
          }
          if (data.orderId) {
            fetch(`${API_URL}/payments/order/${data.orderId}`, { credentials: "include" })
              .then((r) => (r.ok ? r.json() : Promise.reject()))
              .then(setOrder)
              .catch(() => setFetchError(true));
          }
        })
        .catch((err) => {
          console.error("Error confirmando con Webpay:", err);
          setStatus("failed");
          setFetchError(true);
        });
      return;
    }

    // 2. Caso Anulación voluntaria por usuario en Webpay Plus
    if (tbkToken) {
      setStatus("cancelled");
      return;
    }

    // 3. Caso Mercado Pago tradicional con status en URL
    if (statusParam) {
      setStatus(statusParam);

      if (statusParam === "success") {
        dispatch(removeAllItemsFromCart());
      }

      if (orderId) {
        fetch(`${API_URL}/payments/order/${orderId}`, { credentials: "include" })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then(setOrder)
          .catch(() => setFetchError(true));
      }
      return;
    }

    // Si no hay parámetros válidos, redirigir
    router.replace("/");
  }, [tokenWs, tbkToken, statusParam, orderId, dispatch, router]);

  if (status === "loading") {
    return (
      <div className="bg-[#07090E] min-h-screen text-white flex items-center justify-center pt-28">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin"></div>
          <p className="text-gray-400 text-sm">Verificando y confirmando tu pago seguro...</p>
        </div>
      </div>
    );
  }

  const isSuccess = status === "success";

  return (
    <div className="bg-[#07090E] min-h-screen text-white pt-28 md:pt-36 pb-24 relative overflow-hidden">
      {/* Ambient background light */}
      <div
        className={`absolute top-20 left-1/3 w-[600px] h-[350px] blur-[150px] pointer-events-none rounded-full ${
          isSuccess ? "bg-emerald-600/10" : "bg-red-600/10"
        }`}
      ></div>

      <div className="max-w-[720px] w-full mx-auto px-4 sm:px-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/shop" className="hover:text-white transition-colors">
            ← Volver a la Tienda
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Comprobante de Pago</span>
        </div>

        {/* ─── Card resultado ─── */}
        <div className="bg-[#0E121B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header Banner */}
          <div
            className={`p-8 text-center relative border-b border-white/10 ${
              isSuccess
                ? "bg-gradient-to-b from-emerald-950/60 to-[#0E121B]"
                : "bg-gradient-to-b from-red-950/60 to-[#0E121B]"
            }`}
          >
            <div className="flex justify-center mb-4">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl border ${
                  isSuccess
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/15 border-red-500/30 text-red-400"
                }`}
              >
                {isSuccess ? "✓" : "✕"}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border">
              <span className={isSuccess ? "text-emerald-400" : "text-red-400"}>●</span>
              <span className={isSuccess ? "text-emerald-300" : "text-red-300"}>
                {isSuccess ? "Pago Aprobado con Éxito" : "Transacción No Completada"}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              {isSuccess
                ? "¡Gracias por tu compra!"
                : status === "cancelled"
                ? "Pago cancelado por el usuario"
                : "Tu pago no pudo ser procesado"}
            </h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {isSuccess
                ? "Hemos enviado el comprobante oficial a tu correo. Las tiendas comenzarán a preparar tu pedido."
                : status === "cancelled"
                ? "La transacción fue cancelada en la pasarela. Tus cartas siguen guardadas en el carrito."
                : "La pasarela de pago no pudo autorizar el cobro. Puedes intentar con otro medio de pago o tarjeta."}
            </p>
          </div>

          {/* Detalles de la orden */}
          {order && (
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                <IconBox className="w-4 h-4 text-red-500" />
                <span>Detalle de la Orden</span>
              </h2>

              <div className="bg-[#07090E] rounded-2xl p-5 space-y-3 text-xs border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">N° de Orden</span>
                  <span className="font-mono font-bold text-white">{order.buyOrder}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Comprador</span>
                  <span className="font-medium text-white">{order.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Correo Confirmación</span>
                  <span className="font-medium text-white">{order.email}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-gray-300 font-semibold">Total Cancelado</span>
                  <span className="font-mono font-black text-white text-base">
                    ${parseFloat(order.totalAmount).toLocaleString("es-CL")} CLP
                  </span>
                </div>
                {order.payment?.authCode && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Código de Autorización</span>
                    <span className="font-mono text-gray-300">{order.payment.authCode}</span>
                  </div>
                )}
                {order.payment?.cardLast4 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tarjeta Utilizada</span>
                    <span className="font-mono text-gray-300">•••• {order.payment.cardLast4}</span>
                  </div>
                )}
              </div>

              {/* Items por Tienda */}
              <div className="space-y-3">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-gray-400">
                  Despachos Asociados
                </h3>
                {order.vendorOrders?.map((vo) => (
                  <div key={vo.id} className="bg-[#07090E] rounded-xl p-4 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <IconStore className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {vo.store.name}
                      </span>
                      <span className="text-emerald-400 text-[10px] bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                        En preparación
                      </span>
                    </div>
                    <div className="divide-y divide-white/5 pt-1">
                      {vo.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 text-xs">
                          <div>
                            <p className="text-white font-medium">{item.productName}</p>
                            <p className="text-gray-500 font-mono text-[10px]">Cantidad: {item.quantity}</p>
                          </div>
                          <span className="font-mono text-white">
                            ${(parseFloat(item.unitPrice) * item.quantity).toLocaleString("es-CL")} CLP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fetchError && orderId && (
            <div className="p-6 text-xs text-gray-400 text-center">
              Tu transacción fue procesada. Puedes revisar el detalle en tu bandeja de correo o en tu panel.
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop"
              className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all"
            >
              ← Volver al Catálogo TCG
            </Link>

            {isSuccess ? (
              <Link
                href="/my-account"
                className="flex-1 h-12 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#E10E0E]/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Ver Mis Pedidos</span>
                <span>→</span>
              </Link>
            ) : (
              <Link
                href="/checkout"
                className="flex-1 h-12 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#E10E0E]/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>Reintentar Pago</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
