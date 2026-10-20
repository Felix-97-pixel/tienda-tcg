"use client";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";
import SearchableSelect from "@/components/ui/SearchableSelect";

interface BuylistItem {
  id: string;
  storeId: string;
  productId: string;
  quantityWanted: number;
  cashPrice: string | number;
  creditPrice: string | number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    cardDetail?: {
      expansion?: string;
      rarity?: string;
      collectorNum?: string;
    };
    category?: {
      id?: string;
      name?: string;
    };
  };
  condition?: {
    name: string;
    displayName?: string;
  };
  language?: {
    name: string;
    code: string;
  };
  store: {
    id: string;
    name: string;
    subdomain: string;
    logoUrl?: string;
    settings?: Array<{ key: string; value: string }>;
  };
}

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
}

interface VenderCartasClientProps {
  initialItems: BuylistItem[];
  initialStores: StoreData[];
}

export default function VenderCartasClient({ initialItems, initialStores }: VenderCartasClientProps) {
  const currency = useAppSelector((state: any) => state.currencyReducer);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("ALL");
  const [selectedGame, setSelectedGame] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"credit-desc" | "cash-desc" | "name-asc">("credit-desc");

  // Trade Modal State
  const [activeTradeItem, setActiveTradeItem] = useState<BuylistItem | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [payoutMethod, setPayoutMethod] = useState<"credit" | "cash">("credit");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Extract unique games
  const uniqueGames = useMemo(() => {
    const set = new Set<string>();
    initialItems.forEach((item) => {
      const catName = item.product?.category?.name;
      if (catName) set.add(catName);
    });
    return Array.from(set);
  }, [initialItems]);

  const storeOptions = useMemo(() => [
    { label: "Todas las tiendas", value: "ALL" },
    ...initialStores.map((st) => ({ label: st.name, value: st.id })),
  ], [initialStores]);

  const gameOptions = useMemo(() => [
    { label: "Todos los juegos", value: "ALL" },
    ...uniqueGames.map((g) => ({ label: g, value: g })),
  ], [uniqueGames]);

  const filteredItems = useMemo(() => {
    return initialItems
      .filter((item) => {
        // Search text
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const name = item.product?.name?.toLowerCase() || "";
          const expansion = item.product?.cardDetail?.expansion?.toLowerCase() || "";
          const storeName = item.store?.name?.toLowerCase() || "";
          if (!name.includes(q) && !expansion.includes(q) && !storeName.includes(q)) return false;
        }

        // Store filter
        if (selectedStoreId !== "ALL" && item.storeId !== selectedStoreId) return false;

        // Game filter
        if (selectedGame !== "ALL" && item.product?.category?.name !== selectedGame) return false;

        // Condition filter
        if (selectedCondition !== "ALL") {
          const condName = (item.condition?.name || "").toLowerCase();
          if (selectedCondition === "NM" && !condName.includes("near_mint") && condName !== "nm") return false;
          if (selectedCondition === "LP" && !condName.includes("light") && condName !== "lp") return false;
          if (selectedCondition === "MP" && !condName.includes("moderate") && condName !== "mp") return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "credit-desc") {
          return Number(b.creditPrice || 0) - Number(a.creditPrice || 0);
        }
        if (sortBy === "cash-desc") {
          return Number(b.cashPrice || 0) - Number(a.cashPrice || 0);
        }
        return (a.product?.name || "").localeCompare(b.product?.name || "");
      });
  }, [initialItems, searchTerm, selectedStoreId, selectedGame, selectedCondition, sortBy]);

  const getConditionBadge = (condName?: string) => {
    const raw = (condName || "NM").toUpperCase();
    if (raw.includes("NEAR") || raw === "NM") {
      return { label: "NM", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
    }
    if (raw.includes("LIGHT") || raw === "LP") {
      return { label: "LP", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
    }
    if (raw.includes("MODERATE") || raw === "MP") {
      return { label: "MP", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    }
    return { label: "HP", className: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
  };

  const handleOpenTrade = (item: BuylistItem) => {
    setActiveTradeItem(item);
    setTradeQuantity(1);
    setPayoutMethod("credit");
    setCopiedNotification(false);
  };

  const handleWhatsAppContact = () => {
    if (!activeTradeItem) return;
    const item = activeTradeItem;
    const settings = (item.store?.settings || []).reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const phone = (settings.whatsapp || settings.phone || "").replace(/[^0-9]/g, "");
    const cond = item.condition?.displayName || item.condition?.name || "Near Mint";
    const lang = item.language?.name || "English";
    const chosenPrice = payoutMethod === "credit" ? Number(item.creditPrice || 0) : Number(item.cashPrice || 0);
    const total = chosenPrice * tradeQuantity;
    const methodStr = payoutMethod === "credit" ? "Crédito en Tienda" : "Efectivo (Transferencia)";

    const message = `¡Hola ${item.store.name}! Vi en la Buylist de TapTrade que están comprando "${item.product.name}" (${cond} - ${lang}).\nTengo ${tradeQuantity} copia(s) disponibles para venderles por $${total.toLocaleString("es-CL")} CLP en ${methodStr}.\n¿Cómo coordinamos la entrega o envío?`;

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  const handleCopyOfferDetails = () => {
    if (!activeTradeItem) return;
    const item = activeTradeItem;
    const cond = item.condition?.displayName || item.condition?.name || "Near Mint";
    const lang = item.language?.name || "English";
    const chosenPrice = payoutMethod === "credit" ? Number(item.creditPrice || 0) : Number(item.cashPrice || 0);
    const total = chosenPrice * tradeQuantity;
    const methodStr = payoutMethod === "credit" ? "Crédito en Tienda" : "Efectivo";

    const text = `Oferta Buylist para ${item.store.name}:\nCarta: ${item.product.name} (${cond} - ${lang})\nCantidad: ${tradeQuantity}\nPago: ${methodStr} ($${total.toLocaleString("es-CL")} CLP)`;
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header & Hero Atmosphere */}
      <div className="text-center max-w-3xl mx-auto mb-12 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-4">
          <span>⚡</span> Red de Buylists en Vivo
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Vende tus Cartas TCG a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Tiendas Oficiales</span>
        </h1>

        <p className="mt-4 text-gray-300 text-base sm:text-lg leading-relaxed">
          Las tiendas verificadas de TapTrade publican diariamente los singles que necesitan para completar sus stocks.
          Cotiza en tiempo real, elige entre <strong>Efectivo</strong> o <strong>Crédito en Tienda</strong> con bonificación extra.
        </p>
      </div>

      {/* 2. Visual 3-Step Process (Refactoring UI / Dark Vault Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl bg-[#111522] border border-white/[0.08] p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-base flex items-center justify-center mb-3">
            1
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Encuentra lo que buscan
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Explora las cartas solicitadas por cada tienda, revisando el estado requerido (Near Mint, Lightly Played) y el idioma oficial.
          </p>
        </div>

        <div className="rounded-2xl bg-[#111522] border border-white/[0.08] p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center mb-3">
            2
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Efectivo o Crédito (+25%)
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Recibe transferencia bancaria directa a tu cuenta o elige crédito en tienda con hasta un 30% adicional para adquirir nuevos singles o boosters.
          </p>
        </div>

        <div className="rounded-2xl bg-[#111522] border border-white/[0.08] p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-base flex items-center justify-center mb-3">
            3
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Entrega Local o Despacho
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Acércate al local físico de la tienda en tu ciudad o envía tu paquete con seguimiento oficial a través de Chilexpress o Starken.
          </p>
        </div>
      </div>

      {/* 3. Global Buylist Toolbar & Live Search */}
      <div className="bg-[#111522] border border-white/[0.08] rounded-2xl p-5 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar carta en todas las buylists (ej. Orcish Bowmasters, Black Knight...)"
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#0A0D14] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 transition-all"
            />
            <svg
              className="absolute left-3.5 top-3.5 text-gray-500"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Store filter */}
            <div className="w-44 sm:w-52">
              <SearchableSelect
                options={storeOptions}
                value={selectedStoreId}
                onChange={(val) => setSelectedStoreId(val || "ALL")}
                placeholder="Filtrar por tienda..."
                inputClassName="h-11 !text-xs !bg-[#0A0D14] focus:!border-amber-500 focus:!ring-amber-500/30 font-semibold"
                noResultsText="Tienda no encontrada"
              />
            </div>

            {/* Game filter */}
            {uniqueGames.length > 0 && (
              <div className="w-44 sm:w-52">
                <SearchableSelect
                  options={gameOptions}
                  value={selectedGame}
                  onChange={(val) => setSelectedGame(val || "ALL")}
                  placeholder="Filtrar por juego..."
                  inputClassName="h-11 !text-xs !bg-[#0A0D14] focus:!border-amber-500 focus:!ring-amber-500/30 font-semibold"
                  noResultsText="Juego no encontrado"
                />
              </div>
            )}

            {/* Condition filter */}
            <div className="relative">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="h-11 px-3 pr-8 rounded-xl bg-[#0A0D14] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer appearance-none"
              >
                <option value="ALL">Todo estado</option>
                <option value="NM">Near Mint (NM)</option>
                <option value="LP">Lightly Played (LP)</option>
                <option value="MP">Moderately Played (MP)</option>
              </select>
              <svg
                className="absolute right-3 top-4 pointer-events-none text-gray-400"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Sort order */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-11 px-3 pr-8 rounded-xl bg-[#0A0D14] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer appearance-none"
              >
                <option value="credit-desc">Mayor Crédito</option>
                <option value="cash-desc">Mayor Efectivo</option>
                <option value="name-asc">Nombre (A-Z)</option>
              </select>
              <svg
                className="absolute right-3 top-4 pointer-events-none text-gray-400"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Buylist Cards Grid */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <span>Cartas Buscadas</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
            {filteredItems.length} {filteredItems.length === 1 ? "publicación" : "publicaciones"}
          </span>
        </h2>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-[#111522]/40 border border-dashed border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-3xl">
            📭
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            No se encontraron cartas en la buylist
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            Intenta borrar los términos de búsqueda o cambiar los filtros de tienda y juego para ver más publicaciones.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedStoreId("ALL");
              setSelectedGame("ALL");
              setSelectedCondition("ALL");
            }}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const cond = getConditionBadge(item.condition?.name);
            const langCode = (item.language?.code || item.language?.name || "EN").substring(0, 2).toUpperCase();
            const cash = Number(item.cashPrice || 0);
            const credit = Number(item.creditPrice || 0);
            const bonusPercent = cash > 0 && credit > cash ? Math.round(((credit - cash) / cash) * 100) : 0;
            const imgUrl = item.product?.imageUrl || "/images/products/product-1-bg-1.png";

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#111522] border border-white/[0.08] hover:border-amber-500/40 p-4 transition-all duration-300 hover:shadow-[0_4px_30px_rgba(245,158,11,0.12)] flex flex-col justify-between"
              >
                <div>
                  {/* Store Identity Badge */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.06]">
                    <Link
                      href={`/shop/store/${item.store.subdomain}?tab=buylist`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {item.store.logoUrl ? (
                          <img src={item.store.logoUrl} alt={item.store.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400">
                            {item.store.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-300 hover:text-white truncate">
                        {item.store.name}
                      </span>
                    </Link>

                    <Link
                      href={`/shop/store/${item.store.subdomain}?tab=buylist`}
                      className="text-[11px] text-amber-400 hover:underline shrink-0"
                    >
                      Ver buylist tienda →
                    </Link>
                  </div>

                  {/* Card Content Row */}
                  <div className="flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-[#0A0D14] border border-white/10 group-hover:border-amber-500/30 transition-all">
                      <Image
                        src={imgUrl}
                        alt={item.product?.name || "TCG Card"}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Card Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${cond.className}`}>
                          {cond.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-gray-300">
                          {langCode}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Buscan {item.quantityWanted} {item.quantityWanted === 1 ? "copia" : "copias"}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                        {item.product?.name}
                      </h4>

                      <p className="text-xs text-gray-400 truncate mt-1">
                        {item.product?.cardDetail?.expansion || item.product?.category?.name || "Single TCG"}
                      </p>
                    </div>
                  </div>

                  {/* Dual Price Matrix */}
                  <div className="mt-4 grid grid-cols-2 gap-2 bg-[#0A0D14]/70 rounded-xl p-2.5 border border-white/5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                        💵 Efectivo
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {formatPrice(cash, currency)}
                      </span>
                    </div>

                    <div className="border-l border-white/10 pl-2.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          💎 Crédito
                        </span>
                        {bonusPercent > 0 && (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1 rounded">
                            +{bonusPercent}%
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-extrabold text-amber-300">
                        {formatPrice(credit, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sell Action */}
                <button
                  type="button"
                  onClick={() => handleOpenTrade(item)}
                  className="mt-4 w-full h-11 rounded-xl font-black text-xs uppercase tracking-wider bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0A0D14] flex items-center justify-center gap-2 shadow-lg shadow-[#F59E0B]/25 active:scale-[0.98] transition-all border border-amber-300/40 cursor-pointer"
                >
                  <span>Ofrecer a {item.store.name}</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Direct Store Buylist Directory Banner - High-Converting B2B Section */}
      <div className="mt-16 relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#141A2D] via-[#0E121B] to-[#0A0D14] border border-white/10 p-8 sm:p-12 shadow-2xl text-center">
        {/* Glow accents */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-48 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 mb-5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400">
              Para Tiendas y Negocios TCG en Chile
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
            ¿Tienes una tienda TCG?{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
              Contrata TapTrade y escala tus ventas
            </span>
          </h3>

          {/* Persuasive Hook Description */}
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
            Activa tu propio <strong className="text-white">Motor de Buylist automatizado</strong> para comprar singles a jugadores en efectivo o saldo digital, sincroniza catálogos completos en 1 clic y vende en tu propia vitrina online con <strong className="text-emerald-400">0% de comisión por transacción</strong>.
          </p>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">0% Comisión</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Tus ventas son 100% tuyas bajo suscripción fija mensual.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Buylist Inteligente</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Devaluaciones automáticas por estado e idioma en tiempo real.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Vitrina Exclusiva</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Subdominio propio para tu tienda + presencia en el catálogo global.</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/landing#for-stores"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Conoce los Planes y Únete a TapTrade</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/admin/buylist"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 hover:text-white font-semibold text-xs border border-white/10 hover:border-white/20 transition-all"
            >
              <span>¿Ya tienes tienda? Ir al panel de Buylist</span>
            </Link>
          </div>

          {/* Reassurance Micro-copy */}
          <p className="text-xs text-gray-400 mt-5 font-mono">
            Suscripción mensual transparente • Sin comisiones por venta • Pagos y envíos integrados
          </p>
        </div>
      </div>

      {/* 6. Trade Modal */}
      {activeTradeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111522] border border-white/10 p-6 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => setActiveTradeItem(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </span>
              <h3 className="text-lg font-black text-white">
                Vender a {activeTradeItem.store.name}
              </h3>
            </div>

            {/* Selected Card Summary */}
            <div className="flex gap-4 p-3 rounded-xl bg-[#0A0D14] border border-white/5 mb-5">
              <div className="relative w-16 h-22 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/10">
                <Image
                  src={activeTradeItem.product?.imageUrl || "/images/products/product-1-bg-1.png"}
                  alt={activeTradeItem.product?.name || "TCG Card"}
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-base truncate">
                  {activeTradeItem.product?.name}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeTradeItem.product?.cardDetail?.expansion || "Edición oficial"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    {activeTradeItem.condition?.displayName || "Near Mint"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Máx: {activeTradeItem.quantityWanted} copias
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Cantidad a vender
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={tradeQuantity <= 1}
                  onClick={() => setTradeQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 font-bold text-lg"
                >
                  -
                </button>
                <span className="text-lg font-black font-mono w-10 text-center">
                  {tradeQuantity}
                </span>
                <button
                  type="button"
                  disabled={tradeQuantity >= activeTradeItem.quantityWanted}
                  onClick={() => setTradeQuantity((q) => Math.min(activeTradeItem.quantityWanted, q + 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 font-bold text-lg"
                >
                  +
                </button>
                <span className="text-xs text-gray-400">
                  (Hasta {activeTradeItem.quantityWanted} unidades solicitadas)
                </span>
              </div>
            </div>

            {/* Payout Options */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Selecciona forma de pago
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayoutMethod("credit")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    payoutMethod === "credit"
                      ? "bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      : "bg-[#0A0D14] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                      Crédito Tienda
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      +Bono
                    </span>
                  </div>
                  <span className="text-base font-black text-white block mt-1">
                    {formatPrice(Number(activeTradeItem.creditPrice || 0) * tradeQuantity, currency)}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Saldo digital para gastar en {activeTradeItem.store.name}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod("cash")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    payoutMethod === "cash"
                      ? "bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-[#0A0D14] border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider block">
                    Efectivo
                  </span>
                  <span className="text-base font-black text-white block mt-1">
                    {formatPrice(Number(activeTradeItem.cashPrice || 0) * tradeQuantity, currency)}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Transferencia bancaria directa
                  </span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleWhatsAppContact}
                className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                </svg>
                Contactar a {activeTradeItem.store.name} por WhatsApp
              </button>

              <button
                type="button"
                onClick={handleCopyOfferDetails}
                className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copiedNotification ? "✓ Detalle copiado al portapapeles" : "Copiar detalle de la oferta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
