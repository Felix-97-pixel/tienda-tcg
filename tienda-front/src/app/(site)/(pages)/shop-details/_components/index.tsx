"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { Product } from "@/types/product";
import { InventoryItem } from "@/types/inventoryItem";
import { API_URL } from "@/utils/api";
import { calculateCommissions } from "@/utils/commissions";
import { useToast } from "@/hooks/useToast";
import Loader from "@/components/ui/Loader";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import StoreShippingBadges from "@/components/ui/StoreShippingBadges";
import { IconSparkles, IconBox } from "@/components/ui/Icons";

export default function ShopDetails() {
  const dispatch = useDispatch();
  const params = useParams();
  const slug = params?.slug as string;
  const { showToast } = useToast();

  const productFromStorage = useAppSelector(
    (state) => state.productDetailsReducer.value
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [globalRates, setGlobalRates] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [featuredQty, setFeaturedQty] = useState(1);
  const [addingItemId, setAddingItemId] = useState<string | null>(null);
  const [previewFoil, setPreviewFoil] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/currencies`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setGlobalRates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const fetchProduct = async (identifier: string) => {
      setIsLoading(true);
      setHasError(false);
      try {
        const [res, curRes] = await Promise.all([
          fetch(`${API_URL}/products/by-slug/${identifier}`),
          fetch(`${API_URL}/currencies`),
        ]);

        if (curRes.ok) {
          setGlobalRates(await curRes.json());
        }

        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          setHasError(true);
        }
      } catch (e) {
        console.error("Error fetching product details:", e);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      if (productFromStorage && productFromStorage.slug === slug) {
        setProduct(productFromStorage as Product);
      } else {
        fetchProduct(slug);
      }
    } else {
      if (productFromStorage && (productFromStorage.id !== "" || productFromStorage.title !== "")) {
        setProduct(productFromStorage as Product);
      } else {
        const alreadyExist = localStorage.getItem("productDetails");
        if (alreadyExist) {
          try {
            const parsed = JSON.parse(alreadyExist);
            if (parsed && (parsed.id || parsed.title)) setProduct(parsed);
          } catch (e) {}
        }
      }
    }
  }, [productFromStorage, slug]);

  useEffect(() => {
    if (isMounted && product) {
      localStorage.setItem("productDetails", JSON.stringify(product));
    }
  }, [product, isMounted]);

  const getFinalPrice = (item: InventoryItem | any) => {
    const gameId = (product?.cardDetail as any)?.gameId || (product as any)?.gameId;
    const globalRate = globalRates.find((r: any) => r.gameId === gameId);
    let exchangeRate = globalRate ? Number(globalRate.rate) : 1000;

    if (gameId && item.store?.gameExchangeRates) {
      const customRate = item.store.gameExchangeRates.find((r: any) => r.gameId === gameId);
      if (customRate) {
        exchangeRate = Number(customRate.rate);
      }
    }

    const priceInCLP = Number(item.price) * exchangeRate;
    const storePlan = item.store?.subscriptionPlans?.[0];
    const rate = storePlan ? Number(storePlan.commissionRate) : 0.05;
    return calculateCommissions(priceInCLP, rate).gross;
  };

  const handleAddToCart = (item: InventoryItem | any, qty: number) => {
    if (!product) return;
    setAddingItemId(item.id);

    const rawCondition = (
      item.condition_rel?.name ||
      item.condition_rel?.displayName ||
      item.condition?.name ||
      item.condition ||
      "NM"
    );

    const cartItem = {
      id: item.id,
      productId: product.id,
      title: product.title || product.name,
      price: getFinalPrice(item),
      discountedPrice: getFinalPrice(item),
      quantity: qty,
      stock: item.stock,
      status: "available",
      imgs: product.imgs || {
        thumbnails: [product.imageUrl || "/images/products/product-1-bg-1.png"],
        previews: [product.imageUrl || "/images/products/product-1-bg-1.png"],
      },
      storeId: item.store?.id,
      storeName: item.store?.name || "Tienda TapTrade",
      language: item.language?.name || item.languageId || "EN",
      condition: rawCondition,
      finish: item.finish?.name || item.finishId || "Normal",
      inventoryItemId: item.id,
    };

    dispatch(addItemToCart(cartItem));
    showToast(`${qty}x ${product.title || product.name} agregado al carrito`, "success");

    setTimeout(() => {
      setAddingItemId(null);
    }, 900);
  };

  if (!isMounted) return null;

  if (isLoading || !product || (product.title === "" && !product.name)) {
    if (hasError) {
      return (
        <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-center px-4 pt-28">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4">
            🃏
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Carta no encontrada</h2>
          <p className="text-sm text-gray-400 mb-6 max-w-sm">
            La carta que buscas no existe o fue retirada del catálogo de TapTrade.
          </p>
          <Link
            href="/shop"
            className="px-5 py-2.5 rounded-xl bg-red hover:bg-red-dark text-white text-xs font-bold transition-all shadow-lg"
          >
            ← Volver al Catálogo
          </Link>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center pt-28">
        <Loader text="Cargando detalles de la carta..." className="bg-transparent" />
      </div>
    );
  }

  const items = product.items || [];
  const lowestPriceItem =
    items.length > 0 ? [...items].sort((a, b) => getFinalPrice(a) - getFinalPrice(b))[0] : null;

  const imageSrc =
    product.imgs?.previews?.[0] || product.imageUrl || "/images/products/product-1-bg-1.png";

  const isFoil = Boolean(
    previewFoil ||
    lowestPriceItem?.finish?.name?.toLowerCase().includes("foil") ||
    lowestPriceItem?.finish?.name?.toLowerCase().includes("holo") ||
    (product.cardDetail as any)?.isFoil
  );

  const cardName = product.title || product.name || "Carta TCG";
  const gameName =
    product.cardDetail?.game ||
    (typeof product.category === "object" ? product.category?.name : product.category) ||
    "TCG";
  const expansionName = product.cardDetail?.expansion || "Edición General";
  const rarity = product.cardDetail?.rarity || "Rare";
  const collectorNum = product.cardDetail?.collectorNum || (product.cardDetail as any)?.cardNumber || "N/A";

  const getConditionCode = (item: any) => {
    const raw = (
      item?.condition_rel?.name ||
      item?.condition?.name ||
      item?.condition ||
      "NM"
    ).toUpperCase();
    if (raw.includes("LIGHT") || raw === "LP") return { code: "LP", badge: "badge-condition-lp" };
    if (raw.includes("MODERATE") || raw === "MP") return { code: "MP", badge: "badge-condition-mp" };
    if (raw.includes("HEAVY") || raw === "HP") return { code: "HP", badge: "badge-condition-hp" };
    if (raw.includes("DAMAGE") || raw === "DMG") return { code: "DMG", badge: "badge-condition-dmg" };
    return { code: "NM", badge: "badge-condition-nm" };
  };

  return (
    <div className="bg-[#07090E] min-h-screen text-white pt-28 md:pt-36 pb-24">
      {/* Ambient background light */}
      <div className="absolute top-20 left-1/3 w-[600px] h-[350px] bg-red-600/10 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/shop" className="hover:text-white transition-colors">
            ← Catálogo Marketplace
          </Link>
          <span>/</span>
          <span className="text-gray-300">{gameName}</span>
          <span>/</span>
          <span className="text-white truncate max-w-[200px] sm:max-w-md font-semibold">
            {cardName}
          </span>
        </div>

        {/* 3-Column TCG Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          {/* Col 1: Card Artwork Vault */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="w-full max-w-[320px] rounded-2xl bg-[#111522] border border-white/10 p-4 shadow-2xl relative group">
              {/* Foil Shimmer Overlay */}
              <div className="relative aspect-[2.5/3.5] w-full rounded-xl overflow-hidden bg-[#07090E] border border-white/5 card-foil-container">
                <Image
                  src={imageSrc}
                  alt={cardName}
                  fill
                  sizes="(max-width: 640px) 280px, 320px"
                  className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                  priority
                  unoptimized={imageSrc.includes("scryfall")}
                />
                {isFoil && <div className="card-foil-overlay"></div>}
              </div>

              {/* Interactive Foil Shader Preview Toggle */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-3">
                <span className="flex items-center gap-1.5 font-medium text-amber-200/90">
                  <IconSparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  Efecto Holográfico
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewFoil(!previewFoil)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold font-mono transition-all ${
                    previewFoil
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                      : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                  }`}
                >
                  {previewFoil ? "Foil Activado" : "Probar Foil"}
                </button>
              </div>
            </div>
          </div>

          {/* Col 2: Card Lore & Attributes */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/15 text-red-400 border border-red-500/30">
                  {gameName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                  {expansionName}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {cardName}
              </h1>
            </div>

            {/* Rules Text & Lore */}
            <div className="glass-vault rounded-xl p-4 border border-white/10">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Texto de Reglas / Descripción
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed italic">
                {product.description ||
                  "No hay texto descriptivo específico registrado para esta edición."}
              </p>
            </div>

            {/* Technical Specs Grid */}
            <div className="glass-vault rounded-xl p-4 border border-white/10">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Detalles Técnicos TCG
              </h3>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="text-gray-400">Rareza</dt>
                  <dd className="font-semibold text-white mt-0.5">{rarity}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Número de Colección</dt>
                  <dd className="font-mono font-bold text-white mt-0.5">#{collectorNum}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Juego</dt>
                  <dd className="font-semibold text-white mt-0.5">{gameName}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">Expansión Oficial</dt>
                  <dd className="font-semibold text-white mt-0.5 truncate">{expansionName}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Col 3: Featured Buy Box (Best Market Price) */}
          <div className="lg:col-span-4">
            {lowestPriceItem ? (
              <div className="rounded-2xl bg-[#111522] border-2 border-red-500/30 p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    ✓ Mejor Precio Disponible
                  </span>
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const c = getConditionCode(lowestPriceItem);
                      return (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${c.badge}`}>
                          {c.code}
                        </span>
                      );
                    })()}
                    {lowestPriceItem.finish?.name?.toLowerCase().includes("foil") && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30">
                        FOIL
                      </span>
                    )}
                  </div>
                </div>

                {/* Price Display */}
                <div className="mb-4">
                  <span className="text-xs text-gray-400 block">Precio por unidad</span>
                  <div className="text-3xl font-black text-white font-mono mt-0.5">
                    ${Math.round(getFinalPrice(lowestPriceItem)).toLocaleString("es-CL")} <span className="text-xs text-gray-400 font-sans font-normal">CLP</span>
                  </div>
                </div>

                {/* Seller Store Info */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 mb-5 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Vendido por</span>
                    <Link
                      href={(lowestPriceItem.store as any)?.subdomain ? `/shop/store/${(lowestPriceItem.store as any).subdomain}` : "#"}
                      className="text-sm font-bold text-red-400 hover:text-red-300 truncate block transition-colors"
                    >
                      {lowestPriceItem.store?.name || "Tienda TapTrade"} ↗
                    </Link>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono shrink-0">
                    {lowestPriceItem.stock} en stock
                  </span>
                </div>

                {/* Supported Shipping Badges */}
                <div className="mb-5">
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider block mb-2 font-medium">
                    Métodos de Entrega
                  </span>
                  <StoreShippingBadges store={lowestPriceItem?.store} size="sm" />
                </div>

                {/* Quantity Stepper & Add to Cart Button */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl bg-black/40 border border-white/10 overflow-hidden h-11 shrink-0">
                    <button
                      type="button"
                      onClick={() => setFeaturedQty(Math.max(1, featuredQty - 1))}
                      className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
                      disabled={featuredQty <= 1}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-mono font-bold text-white">
                      {featuredQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFeaturedQty(Math.min(lowestPriceItem.stock, featuredQty + 1))}
                      className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
                      disabled={featuredQty >= lowestPriceItem.stock}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(lowestPriceItem, featuredQty)}
                    className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      addingItemId === lowestPriceItem.id
                        ? "bg-[#059669] text-white shadow-lg shadow-[#059669]/30"
                        : "bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-lg shadow-[#E10E0E]/30 active:scale-98"
                    }`}
                  >
                    {addingItemId === lowestPriceItem.id ? (
                      <>
                        <span>✓</span> ¡Agregado!
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Agregar al carrito
                      </>
                    )}
                  </button>
                </div>

                {/* Jump to listings */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => document.getElementById("marketplace-listings")?.scrollIntoView({ behavior: "smooth" })}
                    className="w-full mt-4 text-center text-xs text-gray-400 hover:text-white transition-colors border-t border-white/5 pt-3"
                  >
                    Ver las otras {items.length - 1} opciones de compra ↓
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#111522] border border-white/10 p-8 text-center flex flex-col items-center justify-center">
                <IconBox className="w-10 h-10 text-gray-500 mb-3" />
                <h3 className="font-bold text-white text-base mb-1">Sin stock disponible</h3>
                <p className="text-xs text-gray-400 max-w-xs">
                  Actualmente ninguna tienda tiene ejemplares disponibles de esta carta. Vuelve a consultar pronto.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Store Marketplace Listings Table */}
        <section id="marketplace-listings" className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/15 text-red-400 border border-red-500/30 mb-1">
                Compara Precios
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                Opciones de Compra en Tiendas de Chile ({items.length})
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Todas las cartas se consolidan en tu carrito con cotización automática de envíos.
            </p>
          </div>

          {items.length > 0 ? (
            <div className="flex flex-col gap-3">
              {[...items]
                .sort((a, b) => getFinalPrice(a) - getFinalPrice(b))
                .map((item, idx) => {
                  const cond = getConditionCode(item);
                  const isItemFoil = Boolean(
                    item.finish?.name?.toLowerCase().includes("foil") ||
                    item.finish?.name?.toLowerCase().includes("holo") ||
                    (product.cardDetail as any)?.isFoil
                  );
                  const storeSubdomain = (item.store as any)?.subdomain;
                  const itemPrice = Math.round(getFinalPrice(item));

                  return (
                    <article
                      key={item.id || idx}
                      className="p-4 rounded-xl bg-[#111522] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4"
                    >
                      {/* Store Identity */}
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-10 h-10 rounded-xl bg-[#07090E] border border-white/10 flex items-center justify-center font-black text-red-400 text-sm shrink-0">
                          {item.store?.name?.slice(0, 2).toUpperCase() || "TT"}
                        </div>
                        <div className="min-w-0">
                          {storeSubdomain ? (
                            <Link
                              href={`/shop/store/${storeSubdomain}`}
                              className="font-bold text-white hover:text-red-400 text-sm truncate block transition-colors"
                            >
                              {item.store?.name || "Tienda TapTrade"}
                            </Link>
                          ) : (
                            <span className="font-bold text-white text-sm truncate block">
                              {item.store?.name || "Tienda TapTrade"}
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-emerald-400 font-medium">✓ Verificado</span>
                            <span className="text-[10px] text-gray-500">• Chile</span>
                          </div>
                        </div>
                      </div>

                      {/* Condition & Attributes */}
                      <div className="flex flex-wrap items-center gap-2 min-w-[180px]">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${cond.badge}`}>
                          {cond.code}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-white/5 border border-white/10 text-gray-300">
                          {item.language?.name || item.languageId || "EN"}
                        </span>
                        {isItemFoil ? (
                          <span className="px-2 py-0.5 rounded text-xs font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30">
                            FOIL
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs text-gray-400 bg-white/5 border border-white/10">
                            Normal
                          </span>
                        )}
                      </div>

                      {/* Supported Shipping Badges */}
                      <StoreShippingBadges store={item.store} size="sm" />

                      {/* Stock & Price */}
                      <div className="text-left lg:text-right min-w-[120px]">
                        <div className="text-xl font-extrabold text-white font-mono">
                          ${itemPrice.toLocaleString("es-CL")}
                        </div>
                        <span className="text-[11px] font-mono text-gray-400 block">
                          {item.stock} disponibles
                        </span>
                      </div>

                      {/* Quick Buy Stepper & Button */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative">
                          <select
                            id={`qty-${item.id}`}
                            defaultValue={1}
                            aria-label="Cantidad a comprar"
                            className="h-10 pl-3 pr-7 rounded-xl bg-[#0D111A] border border-white/15 text-white text-xs font-mono font-bold cursor-pointer focus:outline-none focus:border-red-500 transition-colors appearance-none"
                          >
                            {[...Array(Math.min(10, item.stock))].map((_, i) => (
                              <option key={i + 1} value={i + 1} className="bg-[#0D111A] text-white font-mono">
                                {i + 1}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">
                            ▼
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const selectEl = document.getElementById(`qty-${item.id}`) as HTMLSelectElement;
                            const qty = parseInt(selectEl?.value || "1", 10);
                            handleAddToCart(item, qty);
                          }}
                          className={`h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            addingItemId === item.id
                              ? "bg-[#059669] text-white shadow-lg shadow-[#059669]/30"
                              : "bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-md shadow-[#E10E0E]/25 active:scale-95"
                          }`}
                        >
                          {addingItemId === item.id ? "✓ Agregado" : "Comprar"}
                        </button>
                      </div>
                    </article>
                  );
                })}
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl bg-[#111522]/50 border border-white/5 text-gray-400">
              No hay vendedores disponibles para esta carta en este momento.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
