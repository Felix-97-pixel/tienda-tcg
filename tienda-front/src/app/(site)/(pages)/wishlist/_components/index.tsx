"use client";

import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import SingleItem from "./SingleItem";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { IconHeart, IconTrash, IconCart, IconCard, IconSparkles } from "@/components/ui/Icons";

export const Wishlist = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const reduxWishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isAuthenticated = useAppSelector((state: any) => state.authReducer?.isAuthenticated);
  const [dbItems, setDbItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWishlist = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/wishlist`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((item: any) => {
          const inventoryItems = item.items || [];
          const bestItem = inventoryItems.find((it: any) => (it.stock || 0) > 0) || inventoryItems[0];
          const totalStock = inventoryItems.reduce((acc: number, it: any) => acc + (it.stock || 0), 0);
          const price = bestItem?.price || item.price || 0;

          return {
            id: item.id,
            productId: item.id,
            slug: item.slug,
            title: item.name,
            categoryName: item.category?.name,
            cardSet: item.cardDetail?.cardSet,
            rarity: item.cardDetail?.rarity,
            price: price,
            discountedPrice: price,
            stock: totalStock,
            quantity: 1,
            condition: bestItem?.condition_rel?.displayName || bestItem?.condition || "NM",
            finish: bestItem?.finish?.name || (bestItem?.isFoil ? "Foil" : "Regular"),
            language: bestItem?.language?.name || bestItem?.language || "EN",
            inventoryItemId: bestItem?.id,
            status: totalStock > 0 ? "In Stock" : "Out of Stock",
            imgs: {
              thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
              previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
            },
          };
        });
        setDbItems(mapped);
      }
    } catch (e) {
      console.error("Error al cargar wishlist:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  const wishlistItems = isAuthenticated ? dbItems : reduxWishlistItems;

  const totalItemsCount = wishlistItems.length;
  const inStockItems = wishlistItems.filter((item) => {
    const stock = item.stock !== undefined && item.stock !== null ? Number(item.stock) : 0;
    return stock > 0 || item.status === "In Stock" || item.status === "available";
  });
  const inStockCount = inStockItems.length;

  const totalEstimatedValue = wishlistItems.reduce(
    (acc, item) => acc + Number(item.discountedPrice ?? item.price ?? 0),
    0
  );

  const handleClearWishlist = async () => {
    if (window.confirm("¿Seguro que deseas vaciar tu lista de deseos?")) {
      dispatch(removeAllItemsFromWishlist());
      setDbItems([]);
      showToast("Se vació tu lista de deseos", "warning");

      if (isAuthenticated) {
        try {
          await Promise.all(
            wishlistItems.map((item) =>
              fetch(`${API_URL}/wishlist/${item.productId || item.id}`, {
                method: "DELETE",
                credentials: "include",
              })
            )
          );
        } catch (e) {}
      }
    }
  };

  const handleAddAllInStockToCart = () => {
    if (inStockItems.length === 0) {
      showToast("No hay cartas con stock disponible para agregar", "warning");
      return;
    }

    inStockItems.forEach((item) => {
      const invId = item.inventoryItemId || item.items?.[0]?.id || item.id;
      const cartItem = {
        id: invId,
        productId: item.productId || item.id,
        title: item.title || item.name,
        price: item.price || 0,
        discountedPrice: item.discountedPrice || 0,
        quantity: 1,
        imgs: item.imgs || {
          thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
          previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
        },
        stock: item.stock || 999,
        storeId: item.store?.id || item.storeId,
        storeName: item.store?.name || item.storeName,
        language: item.language?.name || item.languageId || item.language,
        condition:
          item.condition_rel?.displayName ||
          item.condition_rel?.name ||
          (typeof item.condition === "object"
            ? (item.condition as any)?.displayName || (item.condition as any)?.name
            : item.condition),
        finish: item.finish?.name || item.finishId || item.finish,
        inventoryItemId: invId,
      };

      dispatch(addItemToCart(cartItem));
    });

    showToast(
      `¡Se agregaron ${inStockItems.length} ${
        inStockItems.length === 1 ? "carta disponible" : "cartas disponibles"
      } a tu carrito!`,
      "success"
    );
  };

  return (
    <div className="bg-[#07090E] min-h-screen text-white pt-28 md:pt-36 pb-24 relative overflow-hidden">
      {/* Dynamic Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      <div className="absolute top-16 left-1/4 w-[500px] h-[300px] bg-[#E10E0E]/10 blur-[150px] pointer-events-none rounded-full -z-10"></div>
      <div className="absolute top-44 right-1/4 w-[450px] h-[300px] bg-blue-600/5 blur-[160px] pointer-events-none rounded-full -z-10"></div>

      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/shop" className="hover:text-white transition-colors flex items-center gap-1">
            <span>←</span>
            <span>Catálogo Marketplace</span>
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Lista de Deseos</span>
        </div>

        {wishlistItems.length > 0 ? (
          <div>
            {/* Header & Stats Banner */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/15 text-red-400 border border-red-500/30 mb-2">
                  <IconHeart className="w-3.5 h-3.5 text-red-400 fill-red-500/30 shrink-0" />
                  <span>
                    {totalItemsCount} {totalItemsCount === 1 ? "carta guardada" : "cartas guardadas"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Tu Lista de Deseos (Wishlist)
                </h1>
                <p className="text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
                  Monitorea disponibilidad de stock y cotizaciones de tus cartas favoritas. Agrégalas directamente a tu carro en un solo clic.
                </p>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-3 flex-wrap self-start lg:self-center">
                <button
                  type="button"
                  onClick={handleAddAllInStockToCart}
                  disabled={inStockCount === 0}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 ${
                    inStockCount === 0
                      ? "bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed"
                      : "bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-lg shadow-[#E10E0E]/25"
                  }`}
                >
                  <IconCart className="w-4 h-4" />
                  <span>Mover Disponibles al Carro ({inStockCount})</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearWishlist}
                  className="px-3.5 py-2.5 rounded-xl text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 border border-white/5 hover:border-red-500/20 bg-white/[0.02]"
                >
                  <IconTrash className="w-4 h-4" />
                  <span>Vaciar Lista</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300">
                  <IconCard className="w-5 h-5 text-gray-300" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Total de Cartas</div>
                  <div className="text-lg font-black text-white">{totalItemsCount}</div>
                </div>
              </div>

              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Disponibles en Stock</div>
                  <div className="text-lg font-black text-emerald-400">{inStockCount} cartas</div>
                </div>
              </div>

              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <IconSparkles className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Valor Estimado</div>
                  <div className="text-lg font-mono font-bold text-white">
                    ${Math.round(totalEstimatedValue).toLocaleString("es-CL")}{" "}
                    <span className="text-xs text-gray-400 font-normal">CLP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table Container */}
            <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-xl overflow-hidden mb-8">
              {/* Desktop Column Headers */}
              <div className="hidden sm:grid grid-cols-12 gap-4 py-4 px-6 border-b border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-gray-400">
                <div className="col-span-5">Carta / Edición</div>
                <div className="col-span-2 text-center">Juego</div>
                <div className="col-span-2 text-center">Precio Unitario</div>
                <div className="col-span-2 text-center">Disponibilidad</div>
                <div className="col-span-1 text-right">Acción</div>
              </div>

              {/* Items Rows */}
              <div className="divide-y divide-white/5">
                {wishlistItems.map((item, key) => (
                  <SingleItem
                    item={item}
                    key={item.id || key}
                    onRemove={isAuthenticated ? fetchWishlist : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty Vault State */
          <div className="py-20 md:py-28 text-center flex flex-col items-center justify-center rounded-3xl bg-[#0E121B] border border-white/10 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-red-500 mb-6 shadow-inner relative group">
              <div className="absolute inset-0 bg-red-600/10 rounded-3xl blur-md"></div>
              <IconHeart className="w-12 h-12 relative z-10 text-red-500/80 fill-red-500/20" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
              Tu Lista de Deseos está Vacía
            </h2>
            <p className="text-sm text-gray-400 max-w-lg mb-8 leading-relaxed">
              Aún no has agregado cartas a tu wishlist. Explora nuestro catálogo de singles de Magic, Pokémon, One Piece y Yu-Gi-Oh! de tiendas de todo Chile y haz clic en el corazón para monitorearlas.
            </p>

            <Link
              href="/shop"
              className="px-8 py-3.5 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#E10E0E]/30 transition-all active:scale-95 flex items-center gap-2 mb-10"
            >
              <span>Explorar Catálogo TCG</span>
              <span>→</span>
            </Link>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-6 border-t border-white/5 max-w-xl w-full">
              <span className="text-xs text-gray-500 mr-2">Explorar por juego:</span>
              <Link
                href="/shop?category=magic"
                className="text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Magic: The Gathering
              </Link>
              <Link
                href="/shop?category=pokemon"
                className="text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Pokémon TCG
              </Link>
              <Link
                href="/shop?category=one-piece"
                className="text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                One Piece Card Game
              </Link>
              <Link
                href="/shop?category=yugioh"
                className="text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                Yu-Gi-Oh!
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
