"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { API_URL } from "@/utils/api";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";

interface BuylistItem {
  id: string;
  storeId: string;
  productId: string;
  conditionId: string;
  languageId: string;
  quantityWanted: number;
  cashPrice: string | number;
  creditPrice: string | number;
  isActive: boolean;
  product: {
    id: string;
    name: string;
    slug?: string;
    imageUrl?: string;
    description?: string;
    cardDetail?: {
      expansion?: string;
      rarity?: string;
      collectorNum?: string;
    };
    category?: {
      name?: string;
    };
  };
  condition?: {
    id: string;
    name: string;
    displayName?: string;
  };
  language?: {
    id: string;
    name: string;
    code: string;
  };
}

interface TcgStoreBuylistViewProps {
  store: {
    id: string;
    name: string;
    subdomain: string;
    settings?: Array<{ key: string; value: string }>;
  };
  initialItems?: BuylistItem[];
}

export default function TcgStoreBuylistView({ store, initialItems }: TcgStoreBuylistViewProps) {
  const currency = useAppSelector((state: any) => state.currencyReducer);
  const [items, setItems] = useState<BuylistItem[]>(initialItems || []);
  const [loading, setLoading] = useState(!initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"credit-desc" | "cash-desc" | "name-asc">("credit-desc");
  const [selectedTradeItem, setSelectedTradeItem] = useState<BuylistItem | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [payoutMethod, setPayoutMethod] = useState<"credit" | "cash">("credit");
  const [copiedLink, setCopiedLink] = useState(false);

  // Normalize settings map for WhatsApp / Address
  const settingsMap = useMemo(() => {
    return (store.settings || []).reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }, [store.settings]);

  const whatsappPhone = (settingsMap.whatsapp || settingsMap.phone || "").replace(/[^0-9]/g, "");
  const storeEmail = settingsMap.email || "";
  const storeAddress = settingsMap.address || "";

  useEffect(() => {
    if (!initialItems) {
      setLoading(true);
      fetch(`${API_URL}/buylist/public/${store.subdomain}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setItems(data);
        })
        .catch((err) => console.error("Error fetching buylist:", err))
        .finally(() => setLoading(false));
    }
  }, [store.subdomain, initialItems]);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (!item.isActive) return false;
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const cardName = item.product?.name?.toLowerCase() || "";
          const expansion = item.product?.cardDetail?.expansion?.toLowerCase() || "";
          if (!cardName.includes(query) && !expansion.includes(query)) return false;
        }
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
  }, [items, searchTerm, selectedCondition, sortBy]);

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
    if (raw.includes("HEAVY") || raw === "HP") {
      return { label: "HP", className: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
    }
    return { label: "DMG", className: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
  };

  const openTradeModal = (item: BuylistItem) => {
    setSelectedTradeItem(item);
    setTradeQuantity(1);
    setPayoutMethod("credit");
    setCopiedLink(false);
  };

  const handleWhatsAppOffer = () => {
    if (!selectedTradeItem) return;
    const item = selectedTradeItem;
    const cond = item.condition?.displayName || item.condition?.name || "Near Mint";
    const lang = item.language?.name || "English";
    const chosenPrice = payoutMethod === "credit" ? Number(item.creditPrice || 0) : Number(item.cashPrice || 0);
    const totalPayout = chosenPrice * tradeQuantity;
    const payoutLabel = payoutMethod === "credit" ? "Crédito en Tienda" : "Efectivo (Transferencia)";

    const message = `¡Hola ${store.name}! Vi en su Buylist de TapTrade que están comprando "${item.product.name}" (${cond} / ${lang}).\nTengo ${tradeQuantity} copia(s) disponible(s) para venderles por un valor de $${totalPayout.toLocaleString("es-CL")} CLP en ${payoutLabel}.\n¿Cómo coordinamos la entrega o envío?`;

    const encoded = encodeURIComponent(message);
    const targetUrl = whatsappPhone
      ? `https://wa.me/${whatsappPhone}?text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(targetUrl, "_blank");
  };

  const handleCopyMessage = () => {
    if (!selectedTradeItem) return;
    const item = selectedTradeItem;
    const cond = item.condition?.displayName || item.condition?.name || "Near Mint";
    const lang = item.language?.name || "English";
    const chosenPrice = payoutMethod === "credit" ? Number(item.creditPrice || 0) : Number(item.cashPrice || 0);
    const totalPayout = chosenPrice * tradeQuantity;
    const payoutLabel = payoutMethod === "credit" ? "Crédito en Tienda" : "Efectivo";

    const text = `Oferta Buylist para ${store.name}:\nCarta: ${item.product.name} (${cond} - ${lang})\nCantidad: ${tradeQuantity}\nModalidad: ${payoutLabel} ($${totalPayout.toLocaleString("es-CL")} CLP)`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Value Proposition Callout Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#111624] via-[#141A2D] to-[#111624] border border-amber-500/20 p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[120px] pointer-events-none rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-red-600/5 blur-[100px] pointer-events-none rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span>⚡</span> Motor Oficial de Buylist
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              ¿Tienes estas cartas? <span className="text-amber-400">{store.name}</span> las está comprando
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Monetiza tu carpeta de colección de forma segura. Elige pago inmediato en <strong>Efectivo</strong> vía
              transferencia bancaria o <strong>Crédito en Tienda</strong> con saldo adicional para canjear por nuevos singles y sellados.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-[#0A0D14]/70 border border-white/5 rounded-xl p-3 text-center">
              <span className="text-emerald-400 text-lg font-black block">100%</span>
              <span className="text-[11px] text-gray-400 font-medium">Pago Seguro</span>
            </div>
            <div className="bg-[#0A0D14]/70 border border-white/5 rounded-xl p-3 text-center">
              <span className="text-amber-400 text-lg font-black block">+25%</span>
              <span className="text-[11px] text-gray-400 font-medium">En Crédito Digital</span>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-[#0A0D14]/70 border border-white/5 rounded-xl p-3 text-center">
              <span className="text-blue-400 text-lg font-black block">Directo</span>
              <span className="text-[11px] text-gray-400 font-medium">Tienda a Jugador</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Controls Toolbar: Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por carta o expansión en el buylist..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#111522] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/60 transition-all"
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Condition Pills */}
          <div className="inline-flex rounded-xl bg-[#111522] border border-white/10 p-1">
            {["ALL", "NM", "LP", "MP"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCondition(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCondition === c
                    ? "bg-amber-500 text-[#0A0D14] shadow-sm font-extrabold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {c === "ALL" ? "Todos" : c}
              </button>
            ))}
          </div>

          {/* Sort selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-11 px-3.5 pr-8 rounded-xl bg-[#111522] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer appearance-none"
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

      {/* 3. Buylist Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-[#111522]/50 animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-[#111522]/30 border border-dashed border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-2xl">
            📭
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {searchTerm ? "No se encontraron cartas en la búsqueda" : "No hay cartas en la buylist por el momento"}
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            {searchTerm
              ? "Prueba buscando con otro término o limpia los filtros para ver todas las cartas solicitadas."
              : `${store.name} aún no ha publicado cartas solicitadas en su buylist. Vuelve a consultar pronto.`}
          </p>
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
                className="group relative rounded-2xl bg-[#111522] border border-white/[0.08] hover:border-amber-500/40 p-4 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(245,158,11,0.12)] flex flex-col justify-between"
              >
                <div>
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

                  {/* Pricing Matrix */}
                  <div className="mt-4 grid grid-cols-2 gap-2 bg-[#0A0D14]/70 rounded-xl p-2.5 border border-white/5">
                    {/* Cash */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                        💵 Efectivo
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {formatPrice(cash, currency)}
                      </span>
                    </div>

                    {/* Credit */}
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

                {/* Action Button */}
                <button
                  type="button"
                  onClick={() => openTradeModal(item)}
                  className="mt-4 w-full h-11 rounded-xl font-black text-xs uppercase tracking-wider bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0A0D14] flex items-center justify-center gap-2 shadow-lg shadow-[#F59E0B]/25 active:scale-[0.98] transition-all border border-amber-300/40 cursor-pointer"
                >
                  <span>Ofrecer a la tienda</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Trade / Offer Modal */}
      {selectedTradeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111522] border border-white/10 p-6 shadow-2xl text-white">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedTradeItem(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🤝</span>
              <h3 className="text-lg font-black text-white">
                Vender a {store.name}
              </h3>
            </div>

            {/* Selected Card Summary */}
            <div className="flex gap-4 p-3 rounded-xl bg-[#0A0D14] border border-white/5 mb-5">
              <div className="relative w-16 h-22 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/10">
                <Image
                  src={selectedTradeItem.product?.imageUrl || "/images/products/product-1-bg-1.png"}
                  alt={selectedTradeItem.product?.name || "TCG Card"}
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-base truncate">
                  {selectedTradeItem.product?.name}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedTradeItem.product?.cardDetail?.expansion || "Edición oficial"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    {selectedTradeItem.condition?.displayName || "Near Mint"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Máx: {selectedTradeItem.quantityWanted} copias
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Cantidad a entregar
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
                  disabled={tradeQuantity >= selectedTradeItem.quantityWanted}
                  onClick={() => setTradeQuantity((q) => Math.min(selectedTradeItem.quantityWanted, q + 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 font-bold text-lg"
                >
                  +
                </button>
                <span className="text-xs text-gray-400">
                  (Hasta {selectedTradeItem.quantityWanted} unidades solicitadas)
                </span>
              </div>
            </div>

            {/* Payout Choice: Cash vs Store Credit */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Selecciona tu forma de pago
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Store Credit */}
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
                      Recomendado
                    </span>
                  </div>
                  <span className="text-base font-black text-white block mt-1">
                    {formatPrice(Number(selectedTradeItem.creditPrice || 0) * tradeQuantity, currency)}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Saldo digital para gastar en {store.name}
                  </span>
                </button>

                {/* Cash */}
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
                    {formatPrice(Number(selectedTradeItem.cashPrice || 0) * tradeQuantity, currency)}
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
                onClick={handleWhatsAppOffer}
                className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                </svg>
                Contactar a {store.name} por WhatsApp
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copiedLink ? "✓ Oferta copiada al portapapeles" : "Copiar detalle de la oferta"}
              </button>
            </div>

            {storeAddress && (
              <p className="text-[11px] text-gray-400 text-center mt-4">
                📍 Retiro presencial disponible en: {storeAddress}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
