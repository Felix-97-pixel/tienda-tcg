"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  applyCoupon,
  removeCoupon,
  selectAppliedCoupons,
  selectCartItems,
  selectCartItemsWithDiscounts,
} from "@/redux/features/cart-slice";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

type Feedback = { type: "success" | "error" | "warning"; message: string } | null;

const formatCLP = (n: number) => `$${Math.round(n).toLocaleString("es-CL")} CLP`;

const Discount = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const cartItems = useSelector(selectCartItems);
  const itemsWithDiscounts = useSelector(selectCartItemsWithDiscounts);
  const appliedCoupons = useSelector(selectAppliedCoupons);

  const notify = (type: "success" | "error" | "warning", message: string) => {
    setFeedback({ type, message });
    showToast(message, type);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          productIds: cartItems.map((i) => i.productId).filter(Boolean),
          inventoryItemIds: cartItems.map((i) => String(i.inventoryItemId || i.id)),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notify("error", data.message || "El código de cupón no es válido o expiró.");
        return;
      }

      const applicable: string[] = data.applicableInventoryItemIds || [];
      if (applicable.length === 0) {
        notify("warning", `El cupón ${data.code} es válido, pero no aplica a ningún producto de tu carrito.`);
        return;
      }

      dispatch(
        applyCoupon({
          id: data.id,
          code: data.code,
          storeId: data.storeId,
          discountPercent: data.discountPercent,
          scope: data.scope,
          categories: data.categories,
          games: data.games,
          applicableItemIds: applicable,
        })
      );

      notify(
        "success",
        `¡Cupón ${data.code} aplicado! ${data.discountPercent}% de descuento en ${applicable.length} producto${applicable.length !== 1 ? "s" : ""}.`
      );
      setCode("");
    } catch (err) {
      console.error(err);
      notify("error", "Hubo un error al validar el cupón.");
    } finally {
      setLoading(false);
    }
  };

  const savingsFor = (couponCode: string) =>
    itemsWithDiscounts
      .filter((i) => i.appliedCouponCode === couponCode)
      .reduce((acc, i) => acc + i.discountAmount * i.quantity, 0);

  const feedbackStyles = {
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  };

  return (
    <div className="lg:max-w-[670px] w-full">
      <form onSubmit={handleApplyCoupon}>
        <div className="bg-[#1a1d24] shadow-1 rounded-[10px]">
          <div className="border-b border-white/10 py-5 px-4 sm:px-5.5">
            <h3 className="text-white">¿Tienes un código de descuento?</h3>
          </div>

          <div className="py-8 px-4 sm:px-8.5">
            <div className="flex flex-wrap gap-4 xl:gap-5.5">
              <div className="max-w-[426px] w-full">
                <input
                  type="text"
                  name="coupon"
                  id="coupon"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().replace(/\s+/g, ""));
                    setFeedback(null);
                  }}
                  placeholder="Ingresa tu código"
                  className="rounded-md border border-white/10 bg-[#111318] text-white placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>

              <button
                type="submit"
                id="apply-coupon-btn"
                disabled={loading || !code}
                className="inline-flex font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Validando..." : "Aplicar"}
              </button>
            </div>

            {feedback && (
              <p className={`mt-4 rounded-lg border px-4 py-2.5 text-sm animate-in fade-in ${feedbackStyles[feedback.type]}`}>
                {feedback.message}
              </p>
            )}

            {appliedCoupons.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Cupones aplicados</p>
                {appliedCoupons.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-sm font-bold text-emerald-400">
                        {c.code}
                      </span>
                      <span className="text-sm text-gray-300">
                        -{c.discountPercent}% · Ahorras{" "}
                        <span className="font-bold text-emerald-400">{formatCLP(savingsFor(c.code))}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(removeCoupon(c.code));
                        showToast(`Cupón ${c.code} removido`, "success");
                      }}
                      className="text-gray-400 transition-colors hover:text-red-400"
                      aria-label={`Quitar cupón ${c.code}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Discount;
