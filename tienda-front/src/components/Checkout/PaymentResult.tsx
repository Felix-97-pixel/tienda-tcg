"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { removeAllItemsFromCart } from "@/redux/features/cart-slice";
import Breadcrumb from "@/components/Common/Breadcrumb";

type OrderDetail = {
  id: string;
  buyOrder: string;
  email: string;
  name: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: string;
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

  const statusParam = searchParams.get("status") as Status | null;
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState<Status>("loading");
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!statusParam) {
      router.replace("/");
      return;
    }
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
  }, [statusParam, orderId, dispatch, router]);

  if (status === "loading") {
    return (
      <>
        <Breadcrumb title="Resultado del pago" pages={["checkout", "resultado"]} />
        <div className="flex items-center justify-center py-20 bg-gray-2">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-12 w-12 text-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-dark-4">Verificando tu pago...</p>
          </div>
        </div>
      </>
    );
  }

  const isSuccess = status === "success";

  return (
    <>
      <Breadcrumb
        title={isSuccess ? "¡Pago exitoso!" : "Resultado del pago"}
        pages={["checkout", "resultado"]}
      />
      <section className="bg-gray-2 pb-20 pt-10">
        <div className="max-w-[680px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* ─── Card resultado ─── */}
        <div className="bg-white shadow-1 rounded-2xl overflow-hidden">
          {/* Header */}
          <div
            className={`p-8 text-center ${
              isSuccess
                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                : "bg-gradient-to-br from-red-500 to-rose-600"
            }`}
          >
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                {isSuccess ? (
                  <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <h1 className="text-white text-2xl font-bold mb-2">
              {isSuccess
                ? "¡Pago exitoso!"
                : status === "cancelled"
                ? "Pago cancelado"
                : "Pago rechazado"}
            </h1>
            <p className="text-white/90 text-sm">
              {isSuccess
                ? "Tu pedido ha sido confirmado y está siendo procesado."
                : status === "cancelled"
                ? "Cancelaste el proceso de pago en Webpay."
                : "Tu pago no pudo ser procesado. Intenta nuevamente."}
            </p>
          </div>

          {/* Detalles de la orden */}
          {order && (
            <div className="p-6 sm:p-8">
              <h2 className="font-semibold text-dark text-lg mb-4">
                Detalle del pedido
              </h2>

              <div className="bg-gray-1 rounded-xl p-4 mb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-4">N° Orden</span>
                  <span className="font-medium text-dark font-mono">{order.buyOrder}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-4">Cliente</span>
                  <span className="font-medium text-dark">{order.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-4">Email</span>
                  <span className="font-medium text-dark">{order.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-4">Total</span>
                  <span className="font-semibold text-dark">
                    ${parseFloat(order.totalAmount).toLocaleString("es-CL")}
                  </span>
                </div>
                {order.payment?.authCode && (
                  <div className="flex justify-between">
                    <span className="text-dark-4">Código auth.</span>
                    <span className="font-medium text-dark font-mono">{order.payment.authCode}</span>
                  </div>
                )}
                {order.payment?.cardLast4 && (
                  <div className="flex justify-between">
                    <span className="text-dark-4">Tarjeta</span>
                    <span className="font-medium text-dark">•••• {order.payment.cardLast4}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              <h3 className="font-medium text-dark mb-3">Productos</h3>
              <div className="space-y-2 mb-5">
                {order.items.map((item) => (
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
          )}

          {fetchError && orderId && (
            <div className="p-6 text-sm text-dark-4 text-center">
              No pudimos cargar el detalle de la orden en este momento.
            </div>
          )}

          {/* Actions */}
          <div className="px-6 pb-8 sm:px-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop"
              className="flex-1 flex justify-center items-center gap-2 py-3 px-6 rounded-xl border-2 border-blue text-blue font-semibold hover:bg-blue hover:text-white transition-all duration-200"
            >
              Seguir comprando
            </Link>
            {isSuccess && (
              <Link
                href="/my-account"
                className="flex-1 flex justify-center items-center gap-2 py-3 px-6 rounded-xl bg-blue text-white font-semibold hover:bg-blue-dark transition-all duration-200"
              >
                Ver mis pedidos
              </Link>
            )}
            {!isSuccess && (
              <Link
                href="/checkout"
                className="flex-1 flex justify-center items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#E2001A] to-[#1A1446] text-white font-semibold hover:opacity-90 transition-all duration-200"
              >
                Intentar de nuevo
              </Link>
            )}
          </div>
        </div>
      </div>
      </section>
    </>
  );
};

export default PaymentResultPage;
