"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/api";
import ShippingBadge from "@/components/ui/ShippingBadge";
import StoreShippingBadges from "@/components/ui/StoreShippingBadges";
import TcgProductCard from "@/app/(site)/(pages)/shop/store/[subdomain]/_components/TcgProductCard";
import { IconStore, IconZap, IconShieldCheck, IconCreditCard, IconSparkles } from "@/components/ui/Icons";

// Official TCG Games Grid Data
const TCG_GAMES = [
  {
    id: "riftbound",
    name: "Singles Riftbound",
    displayName: "Riftbound TCG",
    tagline: "El nuevo fenómeno competitivo",
    categoryQuery: "Singles Riftbound",
    accentColor: "from-amber-500/20 to-red-500/10",
    borderHover: "hover:border-red-500/50",
    badge: "🔥 Tendencia",
    badgeClass: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: "⚔️",
    cardCount: "Singles & Foils",
  },
  {
    id: "pokemon",
    name: "Singles Pokemon",
    displayName: "Pokémon TCG",
    tagline: "Scarlet & Violet, 151 y Colecciones Raras",
    categoryQuery: "Singles Pokemon",
    accentColor: "from-yellow-500/20 to-amber-500/10",
    borderHover: "hover:border-yellow-500/50",
    badge: "⭐ Popular",
    badgeClass: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: "⚡",
    cardCount: "Singles & Boosters",
  },
  {
    id: "magic",
    name: "Singles Magic The Gathering",
    displayName: "Magic: The Gathering",
    tagline: "Commander, Modern, Standard y Collector Boosters",
    categoryQuery: "Singles Magic The Gathering",
    accentColor: "from-purple-500/20 to-indigo-500/10",
    borderHover: "hover:border-purple-500/50",
    badge: "🏛️ Clásico",
    badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: "🔮",
    cardCount: "Singles de Edición",
  },
  {
    id: "onepiece",
    name: "One Piece Card Game",
    displayName: "One Piece TCG",
    tagline: "Luffy, Shanks, OP-07 y cartas Manga Raras",
    categoryQuery: "Singles One Piece",
    accentColor: "from-blue-500/20 to-cyan-500/10",
    borderHover: "hover:border-blue-500/50",
    badge: "🌊 Alta Demanda",
    badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: "☠️",
    cardCount: "Líderes & Singles",
  },
  {
    id: "yugioh",
    name: "Yu-Gi-Oh!",
    displayName: "Yu-Gi-Oh! TCG",
    tagline: "Quarter Century Secret Rares y Sobres Sellados",
    categoryQuery: "Singles Yu-Gi-Oh",
    accentColor: "from-orange-500/20 to-yellow-500/10",
    borderHover: "hover:border-orange-500/50",
    badge: "👁️ Aniversario",
    badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: "👁️",
    cardCount: "Singles & Estructura",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    displayName: "Accesorios & Sellado",
    tagline: "Fundas Dragon Shield, Carpetas 9-pocket y Dados",
    categoryQuery: "Accesorios",
    accentColor: "from-emerald-500/20 to-teal-500/10",
    borderHover: "hover:border-emerald-500/50",
    badge: "🛡️ Protección",
    badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: "🛡️",
    cardCount: "Fundas & Carpetas",
  },
];

// Verified Stores in Chile (con configuración real sincronizada con la base de datos)
const FEATURED_STORES = [
  {
    id: "bloodmoongames",
    name: "BloodMoonGames1",
    subdomain: "bloodmoongames",
    city: "Providencia, Santiago",
    address: "Pérez Valenzuela, Barrio Tajamar",
    hours: "Lun - Sáb: 11:00 - 19:30 hrs",
    pickupEnabled: true,
    pickupAddress: "Av. Providencia 2237, Local 45, Providencia",
    pickupSchedule: "Lunes a Viernes 12:00 a 19:30 hrs",
    shipping: [
      { id: "1", name: "RETIRO_TIENDA", price: 0, isActive: true },
      { id: "2", name: "CHILEXPRESS", price: 9990, isActive: true },
      { id: "3", name: "STARKEN", price: 100, isActive: false },
    ],
    specialty: "Singles Riftbound, Magic MTG & Sellado",
    verified: true,
  },
  {
    id: "taptradestore",
    name: "TapTrade Store",
    subdomain: "taptrade",
    city: "Santiago Centro, RM",
    address: "Padre Mariano 98 Of. 315",
    hours: "Lun - Vie: 10:00 - 18:30 hrs",
    pickupEnabled: false,
    shipping: [
      { id: "4", name: "RETIRO_TIENDA", price: 0, isActive: false },
      { id: "5", name: "CHILEXPRESS", price: 9990, isActive: true },
      { id: "6", name: "STARKEN", price: 6990, isActive: true },
    ],
    specialty: "Catálogo Oficial TapTrade & Verificación NM",
    verified: true,
  },
];

export default function TcgHomeLanding() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredStores, setFeaturedStores] = useState<any[]>(FEATURED_STORES);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "foil" | "riftbound" | "magic">("all");

  // Fetch live stores from API to reflect real-time shipping/pickup settings
  useEffect(() => {
    fetch(`${API_URL}/stores/public`)
      .then((res) => (res.ok ? res.json() : []))
      .then((storesData) => {
        if (Array.isArray(storesData) && storesData.length > 0) {
          const mapped = storesData.map((dbStore) => {
            const matchingFeatured = FEATURED_STORES.find(
              (f) => f.subdomain === dbStore.subdomain || f.id === dbStore.id
            );
            return {
              id: dbStore.id,
              name: dbStore.name,
              subdomain: dbStore.subdomain,
              city: dbStore.originCommune?.name
                ? `${dbStore.originCommune.name}, ${dbStore.originRegion?.name || "Chile"}`
                : (matchingFeatured?.city || "Santiago, Chile"),
              address: dbStore.pickupAddress || dbStore.address || matchingFeatured?.address || "Dirección en tienda",
              hours: dbStore.pickupSchedule || matchingFeatured?.hours || "Lun - Sáb: 11:00 - 19:30 hrs",
              pickupEnabled: dbStore.pickupEnabled,
              pickupAddress: dbStore.pickupAddress,
              pickupSchedule: dbStore.pickupSchedule,
              shipping: dbStore.shipping,
              specialty: matchingFeatured?.specialty || "Catálogo de Singles & Sellado TCG",
              verified: true,
            };
          });
          setFeaturedStores(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch live products for the featured section
  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/products?page=1&limit=12`)
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((response) => {
        const rawList = response.data || response;
        if (Array.isArray(rawList)) {
          const mapped = rawList.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            title: item.name || item.title,
            name: item.name || item.title,
            price: parseFloat(item.items?.[0]?.price || item.price || 0),
            stock: parseInt(item.items?.[0]?.stock !== undefined ? item.items[0].stock : (item.stock || 0), 10),
            imageUrl: item.imageUrl,
            description: item.description,
            cardDetail: item.cardDetail,
            items: item.items || [],
            imgs: {
              previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
              thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
            },
            category: item.category,
            store: item.store || item.items?.[0]?.store,
            condition: item.items?.[0]?.condition?.name || item.condition || "NM",
            language: item.items?.[0]?.language || item.language,
            finish: item.items?.[0]?.finish || item.finish,
          }));
          setFeaturedProducts(mapped);
        }
      })
      .catch((err) => console.error("Error loading products for home:", err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/shop?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      router.push("/shop");
    }
  };

  // Filter products by tab
  const filteredCards = featuredProducts.filter((card) => {
    if (activeTab === "foil") {
      return (card.cardDetail as any)?.isFoil || card.finish === "foil" || card.items?.[0]?.finish === "foil";
    }
    if (activeTab === "riftbound") {
      return card.category?.name?.includes("Riftbound") || card.title?.includes("Riftbound");
    }
    if (activeTab === "magic") {
      return card.category?.name?.includes("Magic") || card.title?.includes("Magic") || card.title?.includes("Knight") || card.title?.includes("Lotus");
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#07090E] text-white selection:bg-red-500 selection:text-white">
      {/* 1. HERO SECTION (Dark Vault Tier) */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-red-500 -ml-4"></span>
                <span className="text-xs font-semibold tracking-wider uppercase text-gray-300">
                  El Mercado Oficial de Cartas TCG en Chile
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
                Compra y Vende <br />
                <span
                  className="inline-block pb-1 font-black"
                  style={{
                    backgroundImage: "linear-gradient(to right, #EF4444, #F87171, #FBBF24)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Singles TCG & Sellado
                </span> <br />
                con Despacho en Vivo.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Conecta directamente con tiendas especializadas y coleccionistas verificados de todo Chile. Cotización oficial de envíos con <strong className="text-white">Chilexpress</strong> y <strong className="text-white">Starken</strong>, o <strong className="text-emerald-400">Retiro en Tienda $0</strong>.
              </p>

              {/* Hero Search Box */}
              <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 mb-6">
                <div className="relative flex items-center bg-[#111522] border border-white/15 rounded-2xl p-1.5 shadow-2xl focus-within:border-red-500/80 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
                  <div className="pl-4 text-gray-400">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Busca por carta, expansión o juego (ej. Ezreal, Lotus, 151)..."
                    className="w-full bg-transparent border-none text-white placeholder-gray-500 text-sm sm:text-base px-3 py-2.5 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#E10E0E]/30 transition-all shrink-0 active:scale-95"
                  >
                    Buscar Cartas
                  </button>
                </div>
              </form>

              {/* Trending Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-gray-400">
                <span className="font-semibold text-gray-500">Tendencias:</span>
                <Link href="/shop?category=Singles+Riftbound" className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 hover:text-white transition-colors">
                  #Riftbound
                </Link>
                <Link href="/shop?search=Ezreal" className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 hover:text-white transition-colors">
                  #Ezreal Showcase
                </Link>
                <Link href="/shop?category=Singles+Magic+The+Gathering" className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 hover:text-white transition-colors">
                  #MagicMTG
                </Link>
                <Link href="/shop?category=Singles+Pokemon" className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:border-red-500/50 hover:text-white transition-colors">
                  #PokemonTCG
                </Link>
              </div>
            </div>

            {/* Right Column: Holographic 3D Floating Showcase Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Background Card Aura */}
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/30 to-amber-500/20 rounded-3xl blur-2xl transform scale-95 opacity-80"></div>

                {/* Vault Featured Card */}
                <div className="relative rounded-3xl bg-[#0D111A] border border-white/15 p-6 shadow-2xl backdrop-blur-xl group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                      <IconSparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Showcase Foil
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">
                      NM • EN
                    </span>
                  </div>

                  {/* High-res Artwork Container with Foil Effect */}
                  <div className="relative aspect-[2.5/3.5] w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 mb-4 shadow-inner">
                    <Image
                      src="https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/83da64e39d838d2fee68c319c03fbff0d4c7035f-744x1039.png"
                      alt="Ezreal - Dashing Alternate Art"
                      fill
                      unoptimized
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                    {/* Iridescent Shader */}
                    <div className="card-foil-overlay"></div>
                  </div>

                  {/* Card Meta */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-xs text-gray-400 block font-mono">Singles Riftbound • Spiritforged</span>
                      <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors">
                        Ezreal - Dashing (Alt Art)
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">Mejor precio</span>
                      <span className="text-2xl font-black text-white font-mono">$550 CLP</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5 flex-1">
                      <ShippingBadge name="retiro_tienda" size="sm" />
                      <ShippingBadge name="chilexpress" size="sm" />
                    </div>
                    <Link
                      href="/shop-details/ezreal-dashing-alternate-art-666446"
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-red-600 text-white font-bold text-xs transition-all shadow"
                    >
                      Ver Opciones ↗
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Trust Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-white/10">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <IconStore className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Retiro en Tienda $0</span>
                <span className="text-[11px] text-gray-400">Sin costo de despacho</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <IconZap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Chilexpress & Starken</span>
                <span className="text-[11px] text-gray-400">Cotización en vivo 24-48h</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <IconShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">100% Tiendas TCG</span>
                <span className="text-[11px] text-gray-400">Verificadas y evaluadas</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <IconCreditCard className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Webpay & Mercado Pago</span>
                <span className="text-[11px] text-gray-400">Transacción protegida</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. JUEGOS TCG DESTACADOS (Visual Grid) */}
      <section className="py-16 border-t border-white/5 bg-[#0A0D14]/50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-500 mb-1 block">
                Directorio Especializado
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Explora por Juego TCG
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              Ver todas las categorías <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TCG_GAMES.map((game) => (
              <Link
                key={game.id}
                href={`/shop?category=${encodeURIComponent(game.categoryQuery)}`}
                className={`group relative p-6 rounded-2xl bg-[#0E121B] border border-white/10 ${game.borderHover} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden`}
              >
                {/* Subtle Gradient Backlight */}
                <div className={`absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br ${game.accentColor} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2.5 rounded-xl bg-white/5 border border-white/10">
                      {game.icon}
                    </span>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${game.badgeClass}`}>
                      {game.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-red-400 transition-colors mb-1">
                    {game.displayName}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">
                    {game.tagline}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                    <span className="font-mono text-gray-500">{game.cardCount}</span>
                    <span className="font-bold text-red-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Explorar ↗
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CARTAS DESTACADAS EN VIVO (Live Marketplace Singles) */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-500 mb-1 block">
                Inventario en Vivo de Chile
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Singles & Novedades TCG
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl bg-[#111522] border border-white/10 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "all" ? "bg-[#E10E0E] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("foil")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "foil" ? "bg-[#E10E0E] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                ✨ Foils
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("riftbound")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "riftbound" ? "bg-[#E10E0E] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Riftbound
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("magic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "magic" ? "bg-[#E10E0E] text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Magic MTG
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[2.5/4] rounded-2xl bg-white/5 animate-pulse border border-white/5"></div>
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-[#0E121B] border border-white/5 text-gray-400 text-sm">
              No hay cartas disponibles en esta categoría.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredCards.slice(0, 8).map((product) => (
                <TcgProductCard key={product.id} item={product} />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm tracking-wide transition-all hover:scale-105"
            >
              Explorar Catálogo Completo (28+ cartas) →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TIENDAS TCG VERIFICADAS DE CHILE */}
      <section className="py-20 border-t border-white/5 bg-[#0A0D14]/50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1 block">
              Comercio Oficial Verificado
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
              Tiendas Especializadas en TapTrade
            </h2>
            <p className="text-sm text-gray-400">
              Compra con total confianza a tiendas con local físico y trayectoria en la comunidad de cartas coleccionables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredStores.map((store) => (
              <div
                key={store.id}
                className="p-6 rounded-2xl bg-[#0E121B] border border-white/10 hover:border-white/20 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#07090E] border border-white/10 flex items-center justify-center font-black text-red-500 text-lg shrink-0">
                        {store.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white">{store.name}</h3>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded">
                            ✓ Verificado
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 block">{store.city}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 mb-2 font-mono">
                    📍 {store.address}
                  </p>
                  <p className="text-[11px] text-gray-400 mb-4 font-mono">
                    🕒 {store.hours}
                  </p>

                  <div className="mb-5">
                    <StoreShippingBadges store={store} size="sm" className="flex items-center gap-2 flex-wrap" />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-medium">
                    {store.specialty}
                  </span>
                  <Link
                    href={`/shop/store/${store.subdomain}`}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20"
                  >
                    Ver Inventario ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION PARA TIENDAS Y VENDEDORES */}
      <section className="py-20 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl bg-gradient-to-r from-red-950/40 via-[#111522] to-[#0A0D14] border border-red-500/30 p-8 sm:p-12 lg:p-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-red-400 bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-full mb-4">
                Programa de Tiendas TapTrade
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
                ¿Tienes una Tienda TCG o una Colección Valiosa?
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                Vende tus singles y sellado a coleccionistas de todo Chile. Gestión centralizada de stock, etiquetas de despacho automáticas (Chilexpress / Starken) y pagos garantizados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#E10E0E]/30 transition-all text-center block"
              >
                Crear Mi Tienda TCG
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm tracking-wide transition-all text-center"
              >
                Hablar con Soporte
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
