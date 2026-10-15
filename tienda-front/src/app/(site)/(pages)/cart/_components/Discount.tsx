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
        <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-white/10 py-4 px-6 bg-white/[0.02]">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>🏷️</span>
              <span>¿Tienes un código de descuento?</span>
            </h3>
          </div>

          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  name="coupon"
                  id="coupon"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase().replace(/\s+/g, ""));
                    setFeedback(null);
                  }}
                  placeholder="Ej: TAPTRADE10"
                  className="rounded-xl border border-white/10 bg-[#07090E] text-white placeholder-gray-500 w-full py-3 px-4 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 text-sm font-mono tracking-wider uppercase transition-all"
                />
              </div>

              <button
                type="submit"
                id="apply-coupon-btn"
                disabled={loading || !code}
                className="h-11 px-6 rounded-xl font-bold text-xs tracking-wider uppercase bg-white/10 hover:bg-white/15 border border-white/15 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 active:scale-95"
              >
                {loading ? "Validando..." : "Aplicar Cupón"}
              </button>
            </div>

            {feedback && (
              <p className={`mt-4 rounded-xl border px-4 py-2.5 text-xs font-medium animate-in fade-in ${feedbackStyles[feedback.type]}`}>
                {feedback.message}
              </p>
            )}

            {appliedCoupons.length > 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Cupones activos en tu orden</p>
                {appliedCoupons.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-bold text-emerald-400 border border-emerald-500/30">
                        {c.code}
                      </span>
                      <span className="text-xs text-gray-300">
                        -{c.discountPercent}% · Ahorras{" "}
                        <strong className="text-emerald-400 font-mono">{formatCLP(savingsFor(c.code))}</strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(removeCoupon(c.code));
                        showToast(`Cupón ${c.code} removido`, "success");
                      }}
                      className="text-gray-400 hover:text-red-400 transition-colors p-1"
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
