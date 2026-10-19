"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useToast } from "@/hooks/useToast";
import { formatPrice } from "@/utils/currency";
import { calculateItemPriceCLP, parseConditionCode, getConditionBadgeClass } from "@/utils/tcgPrices";
import { IconSparkles } from "@/components/ui/Icons";

interface TcgStoreVariantModalProps {
  product: any;
  storeId: string;
  storeName: string;
  globalRates?: any[];
  onClose: () => void;
}

export default function TcgStoreVariantModal({
  product,
  storeId,
  storeName,
  globalRates = [],
  onClose,
}: TcgStoreVariantModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const currency = useAppSelector((state: any) => state.currencyReducer);
  const cartItems = useAppSelector((state: any) => state.cartReducer.items || []);
  const { showToast } = useToast();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addingId, setAddingId] = useState<string | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const cardTitle = product?.title || product?.name || "Carta TCG";
  const expansionName =
    product?.cardDetail?.expansionName ||
    product?.cardDetail?.expansion ||
    product?.category?.name ||
    "Colección TCG";
  const rarity = product?.cardDetail?.rarity || "Singles";
  const collectorNum = product?.cardDetail?.collectorNum;
  const gameName = product?.cardDetail?.gameRel?.name || product?.category?.name;
  const imageUrl =
    product?.imgs?.previews?.[0] ||
    product?.imgs?.thumbnails?.[0] ||
    product?.imageUrl ||
    "/images/products/product-1-bg-1.png";

  const gameId =
    product?.cardDetail?.gameId ||
    product?.cardDetail?.gameRel?.id ||
    product?.gameId;

  // Filter all variants belonging specifically to this store
  const storeVariants = useMemo(() => {
    const rawVariants: any[] = Array.isArray(product?.items) ? product.items : [];
    const filtered = rawVariants.filter(
      (v: any) =>
        !storeId ||
        v.storeId === storeId ||
        v.store?.id === storeId
    );

    const mapped = filtered.map((variant: any) => {
      const priceCLP = calculateItemPriceCLP(variant, gameId, globalRates);
      const stock = Number(variant.stock ?? 0);

      const rawCond = (
        variant.condition_rel?.displayName ||
        variant.condition_rel?.name ||
        variant.condition?.displayName ||
        variant.condition?.name ||
        (typeof variant.condition === "string" ? variant.condition : "") ||
        "NM"
      ).toUpperCase();

      const condCode = parseConditionCode(rawCond);

      const finishName = (
        variant.finish?.name ||
        (typeof variant.finish === "string" ? variant.finish : "") ||
        "Normal"
      );

      const isFoil = Boolean(
        finishName.toLowerCase().includes("foil") ||
        finishName.toLowerCase().includes("holo") ||
        variant.isFoil ||
        product?.cardDetail?.isFoil
      );

      const rawLang =
        variant.language?.name ||
        variant.language?.code ||
        (typeof variant.language === "string" ? variant.language : "EN");

      const langCode = (typeof rawLang === "string" ? rawLang : "EN").substring(0, 2).toUpperCase();

      return {
        ...variant,
        priceCLP,
        stock,
        rawCond,
        condCode,
        condClass: getConditionBadgeClass(condCode),
        finishName,
        isFoil,
        langCode,
      };
    });

    // Sort by price ascending (cheapest variant first)
    return mapped.sort((a, b) => a.priceCLP - b.priceCLP);
  }, [product, storeId, gameId, globalRates]);

  const hasAnyFoil = storeVariants.some((v) => v.isFoil);

  const handleQtyChange = (variantId: string, val: number, maxStock: number) => {
    const validVal = Math.max(1, Math.min(maxStock, val));
    setQuantities((prev) => ({ ...prev, [variantId]: validVal }));
  };

  const handleAddToCart = (variant: any) => {
    const qtyToAdd = quantities[variant.id] || 1;
    const existingInCart = cartItems.find((ci: any) => ci.id === variant.id);
    const currentCartQty = existingInCart ? existingInCart.quantity : 0;

    if (currentCartQty + qtyToAdd > variant.stock) {
      showToast("Has alcanzado el límite de stock disponible de esta variante", "warning");
      return;
    }

    setAddingId(variant.id);

    const cartPayload = {
      id: variant.id,
      productId: product.id,
      slug: product.slug,
      title: cardTitle,
      price: variant.priceCLP,
      discountedPrice: variant.priceCLP,
      quantity: qtyToAdd,
      imgs: {
        thumbnails: [imageUrl],
        previews: [imageUrl],
      },
      stock: variant.stock,
      storeId: storeId || variant.storeId || variant.store?.id,
      storeName: storeName || variant.store?.name || "Tienda TapTrade",
      language: variant.langCode,
      condition: variant.condCode,
      finish: variant.finishName,
      inventoryItemId: variant.id,
    };

    dispatch(addItemToCart(cartPayload));
    showToast(`Agregaste ${qtyToAdd}x "${cardTitle} (${variant.condCode} ${variant.finishName})" al carrito`, "success");

    setTimeout(() => {
      setAddingId(null);
    }, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-[#0E121B] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer"
          title="Cerrar vitrina"
        >
          ✕
        </button>

        {/* ─── Columna Izquierda: Vista y Arte de la Carta ─── */}
        <div className="md:w-5/12 bg-[#07090E] p-6 sm:p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-white/10 shrink-0">
          <div className="w-full flex items-center justify-between gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-red-600/15 text-red-400 border border-red-500/30">
              {gameName || "TCG"}
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {collectorNum ? `#${collectorNum}` : ""} {rarity ? `• ${rarity}` : ""}
            </span>
          </div>

          {/* Arte Grande con Shimmer */}
          <div className="relative aspect-[2.5/3.5] w-full max-w-[240px] rounded-2xl overflow-hidden card-foil-container bg-black/60 border border-white/10 shadow-2xl my-2">
            <Image
              src={imageUrl}
              alt={cardTitle}
              fill
              sizes="280px"
              className="object-contain p-2"
              unoptimized={Boolean(imageUrl.includes("scryfall"))}
              priority
            />
            {hasAnyFoil && <div className="card-foil-overlay !opacity-50" />}
          </div>

          {/* Meta Info inferior */}
          <div className="w-full mt-4 text-center">
            <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug line-clamp-2 mb-1">
              {cardTitle}
            </h3>
            <p className="text-xs text-gray-400 truncate mb-3">
              {expansionName}
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-gray-300">
              <span className="text-emerald-400">🏪</span>
              <span>Vitrina Oficial:</span>
              <strong className="text-white">{storeName}</strong>
            </div>
          </div>
        </div>

        {/* ─── Columna Derecha: Variantes de la Tienda ─── */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col overflow-hidden">
          <div className="pb-4 mb-4 border-b border-white/10 flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Variantes en Vitrina</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {storeVariants.length} disp.
                </span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Selecciona la condición, acabado y cantidad disponible de esta tienda:
              </p>
            </div>
          </div>

          {/* Lista de Variantes con Scroll */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
            {storeVariants.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-3xl block">📦</span>
                <h4 className="text-sm font-bold text-white">Sin stock disponible en esta tienda</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  {storeName} no tiene unidades activas de esta carta en este momento.
                </p>
              </div>
            ) : (
              storeVariants.map((variant) => {
                const isOutOfStock = variant.stock <= 0;
                const qty = quantities[variant.id] || 1;
                const existingInCart = cartItems.find((ci: any) => ci.id === variant.id);
                const currentCartQty = existingInCart ? existingInCart.quantity : 0;
                const isMaxReached = currentCartQty >= variant.stock;
                const isThisAdding = addingId === variant.id;

                return (
                  <div
                    key={variant.id}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                      isOutOfStock
                        ? "bg-white/[0.01] border-white/5 opacity-50"
                        : "bg-[#111522] border-white/10 hover:border-white/20 shadow-sm"
                    }`}
                  >
                    {/* Atributos: Condición + Idioma + Acabado */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        {/* Condición */}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-black font-mono border ${variant.condClass}`}
                          title={`Estado: ${variant.condName}`}
                        >
                          {variant.condCode}
                        </span>

                        {/* Idioma */}
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white/5 border border-white/10 text-gray-300">
                          {variant.langCode}
                        </span>

                        {/* Acabado */}
                        {variant.isFoil ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400/20 via-pink-400/20 to-cyan-400/20 border border-amber-300/40 text-amber-200 flex items-center gap-1 shadow-sm">
                            <IconSparkles className="w-3 h-3 text-amber-300 animate-spin-slow" />
                            Foil
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/5 border border-white/10 text-gray-400">
                            Normal
                          </span>
                        )}
                      </div>

                      {/* Stock Info */}
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        {isOutOfStock ? (
                          <span className="text-red-400 font-bold">Agotado</span>
                        ) : variant.stock <= 3 ? (
                          <span className="text-amber-400 font-semibold text-[11px]">
                            ¡Solo {variant.stock} disponible{variant.stock > 1 ? "s" : ""}!
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium text-[11px]">
                            ✓ {variant.stock} disponibles
                          </span>
                        )}

                        {currentCartQty > 0 && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            ({currentCartQty} en carrito)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Precio y Controles de Carrito */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      {/* Precio */}
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black font-mono text-white block">
                          {formatPrice(variant.priceCLP, currency)}
                        </span>
                        <span className="text-[10px] text-gray-500 block">precio tienda</span>
                      </div>

                      {/* Selector de Cantidad */}
                      {!isOutOfStock && (
                        <div className="flex items-center rounded-lg bg-[#07090E] border border-white/10 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(variant.id, qty - 1, variant.stock)}
                            disabled={qty <= 1}
                            className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(variant.id, qty + 1, variant.stock)}
                            disabled={qty >= variant.stock - currentCartQty}
                            className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {/* Botón Añadir */}
                      <button
                        type="button"
                        onClick={() => handleAddToCart(variant)}
                        disabled={isOutOfStock || isMaxReached || isThisAdding}
                        className={`h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer ${
                          isOutOfStock || isMaxReached
                            ? "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                            : isThisAdding
                            ? "bg-emerald-600 text-white shadow-emerald-900/30"
                            : "bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-red-900/25"
                        }`}
                      >
                        {isThisAdding ? (
                          <>
                            <span>✓</span>
                            <span>Listo</span>
                          </>
                        ) : isMaxReached ? (
                          <span>Máximo</span>
                        ) : isOutOfStock ? (
                          <span>Sin Stock</span>
                        ) : (
                          <>
                            <span>🛒</span>
                            <span>Añadir</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer del Modal */}
          <div className="pt-3.5 mt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span>
              <span>Envíos combinados con Starken / Chilexpress</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-300 hover:text-white underline underline-offset-2 cursor-pointer font-medium"
            >
              Seguir explorando tienda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
