"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useTranslations } from "next-intl";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useToast } from "@/hooks/useToast";
import { formatPrice } from "@/utils/currency";
import { calculateItemPriceCLP, parseConditionCode, getConditionBadgeClass } from "@/utils/tcgPrices";
import { IconSparkles, IconBox, IconCart, IconCheck, IconX, IconStore } from "@/components/ui/Icons";

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
  const t = useTranslations("shop");
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
        className="relative w-full max-w-4xl max-h-[92vh] bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-[var(--tt-text-main)] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] flex items-center justify-center transition-all cursor-pointer"
          aria-label={t("close") || "Cerrar"}
        >
          <IconX className="w-5 h-5 text-[var(--tt-text-main)]" />
        </button>

        {/* ─── Columna Izquierda: Vista y Arte de la Carta ─── */}
        <div className="md:w-5/12 bg-[var(--tt-bg-subtle)] p-6 sm:p-8 flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-[var(--tt-border-medium)] shrink-0">
          <div className="w-full flex items-center justify-between gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-red-600/15 text-red-600 dark:text-red-400 border border-red-500/30">
              {gameName || "TCG"}
            </span>
            <span className="text-xs text-[var(--tt-text-muted)] font-mono">
              {collectorNum ? `#${collectorNum}` : ""} {rarity ? `• ${rarity}` : ""}
            </span>
          </div>

          {/* Arte Grande con Shimmer */}
          <div className="relative aspect-[2.5/3.5] w-full max-w-[240px] rounded-2xl overflow-hidden card-foil-container bg-[var(--tt-bg-canvas)] border border-[var(--tt-border-medium)] shadow-xl my-2">
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
            <h3 className="font-extrabold text-base sm:text-lg text-[var(--tt-text-main)] leading-snug line-clamp-2 mb-1">
              {cardTitle}
            </h3>
            <p className="text-xs text-[var(--tt-text-muted)] truncate mb-3">
              {expansionName}
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[11px] text-[var(--tt-text-muted)]">
              <IconStore className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t("official_showcase")}:</span>
              <strong className="text-[var(--tt-text-main)]">{storeName}</strong>
            </div>
          </div>
        </div>

        {/* ─── Columna Derecha: Variantes de la Tienda ─── */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col overflow-hidden">
          <div className="pb-4 mb-4 border-b border-[var(--tt-border-medium)] flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-black text-[var(--tt-text-main)] tracking-tight flex items-center gap-2">
                <span>{t("store_variants_title", { store: storeName })}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {t("available_count", { count: storeVariants.length })}
                </span>
              </h2>
              <p className="text-xs text-[var(--tt-text-muted)] mt-0.5">
                {t("store_variants_subtitle")}
              </p>
            </div>
          </div>

          {/* Lista de Variantes con Scroll */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
            {storeVariants.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-subtle)] space-y-2">
                <IconBox className="w-8 h-8 text-[var(--tt-text-muted)] mx-auto" />
                <h4 className="text-sm font-bold text-[var(--tt-text-main)]">{t("no_stock_in_store")}</h4>
                <p className="text-xs text-[var(--tt-text-muted)] max-w-xs mx-auto">
                  {t("no_stock_in_store_desc", { store: storeName })}
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
                        ? "bg-[var(--tt-bg-surface)] border-[var(--tt-border-subtle)] opacity-50"
                        : "bg-[var(--tt-bg-subtle)] border-[var(--tt-border-medium)] hover:border-red-500/40 shadow-sm"
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
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)]">
                          {variant.langCode}
                        </span>

                        {/* Acabado */}
                        {variant.isFoil ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-400/20 via-pink-400/20 to-cyan-400/20 border border-amber-300/40 text-amber-800 dark:text-amber-200 flex items-center gap-1 shadow-sm">
                            <IconSparkles className="w-3 h-3 text-amber-600 dark:text-amber-300 animate-spin-slow" />
                            {t("finish_foil")}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-muted)]">
                            {t("finish_normal")}
                          </span>
                        )}
                      </div>

                      {/* Stock Info */}
                      <div className="text-xs text-[var(--tt-text-muted)] flex items-center gap-2">
                        {isOutOfStock ? (
                          <span className="text-red font-bold">{t("outOfStock")}</span>
                        ) : variant.stock <= 3 ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                            {t("only_stock_left", { count: variant.stock })}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                            ✓ {t("available_count", { count: variant.stock })}
                          </span>
                        )}

                        {currentCartQty > 0 && (
                          <span className="text-[10px] text-[var(--tt-text-muted)] font-mono">
                            {t("in_cart_badge", { count: currentCartQty })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Precio y Controles de Carrito */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--tt-border-subtle)]">
                      {/* Precio */}
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-black font-mono text-[var(--tt-text-main)] block">
                          {formatPrice(variant.priceCLP, currency)}
                        </span>
                        <span className="text-[10px] text-[var(--tt-text-muted)] block">{t("store_price")}</span>
                      </div>

                      {/* Selector de Cantidad */}
                      {!isOutOfStock && (
                        <div className="flex items-center rounded-lg bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] overflow-hidden">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(variant.id, qty - 1, variant.stock)}
                            disabled={qty <= 1}
                            className="w-7 h-8 flex items-center justify-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-subtle)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-mono font-bold text-[var(--tt-text-main)]">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(variant.id, qty + 1, variant.stock)}
                            disabled={qty >= variant.stock - currentCartQty}
                            className="w-7 h-8 flex items-center justify-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-subtle)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                            ? "bg-[var(--tt-bg-surface)] text-[var(--tt-text-muted)] border border-[var(--tt-border-subtle)] cursor-not-allowed"
                            : isThisAdding
                            ? "bg-emerald-600 text-white shadow-emerald-900/30"
                            : "bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-red-900/25"
                        }`}
                      >
                        {isThisAdding ? (
                          <>
                            <IconCheck className="w-3.5 h-3.5 text-white" />
                            <span>{t("done")}</span>
                          </>
                        ) : isMaxReached ? (
                          <span>{t("max")}</span>
                        ) : isOutOfStock ? (
                          <span>{t("outOfStock")}</span>
                        ) : (
                          <>
                            <IconCart className="w-3.5 h-3.5 text-white" />
                            <span>{t("addToCart")}</span>
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
          <div className="pt-3.5 mt-3.5 border-t border-[var(--tt-border-medium)] flex items-center justify-between text-xs text-[var(--tt-text-muted)]">
            <div className="flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t("combined_shipping_note")}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] underline underline-offset-2 cursor-pointer font-medium"
            >
              {t("continue_browsing_store")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
