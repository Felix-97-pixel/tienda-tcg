"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_URL } from "@/utils/api";
import ShippingBadge from "@/components/ui/ShippingBadge";
import StoreShippingBadges from "@/components/ui/StoreShippingBadges";
import TcgProductCard from "@/app/(site)/(pages)/shop/store/[subdomain]/_components/TcgProductCard";
import {
  IconStore,
  IconZap,
  IconShieldCheck,
  IconCreditCard,
  IconSparkles,
  IconTruck,
  IconMapPin,
  IconClock,
  IconFlame,
  IconEye,
  IconCard,
  IconBox,
  IconSearch,
  IconCheck,
} from "@/components/ui/Icons";
import { getBestAvailableVariant } from "@/utils/tcgPrices";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("home");
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredStores, setFeaturedStores] = useState<any[]>(FEATURED_STORES);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "foil" | "riftbound" | "magic">("all");

  const TCG_GAMES = [
    {
      id: "pokemon",
      name: "Singles Pokemon",
      displayName: "Pokémon TCG",
      tagline: t("games_grid.games.pokemon_tag"),
      categoryQuery: "Singles Pokemon",
      accentColor: "from-yellow-500/20 to-amber-500/10",
      borderHover: "hover:border-yellow-500/50",
      badge: t("games_grid.games.pokemon_badge"),
      badgeClass: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      logo: "/images/games/pokemon.png",
      invertInLight: false,
    },
    {
      id: "magic",
      name: "Singles Magic The Gathering",
      displayName: "Magic: The Gathering",
      tagline: t("games_grid.games.magic_tag"),
      categoryQuery: "Singles Magic The Gathering",
      accentColor: "from-purple-500/20 to-indigo-500/10",
      borderHover: "hover:border-purple-500/50",
      badge: t("games_grid.games.magic_badge"),
      badgeClass: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      logo: "/images/games/magic.png",
      invertInLight: true,
    },
    {
      id: "onepiece",
      name: "One Piece Card Game",
      displayName: "One Piece TCG",
      tagline: t("games_grid.games.onepiece_tag"),
      categoryQuery: "Singles One Piece",
      accentColor: "from-rose-500/20 to-red-500/10",
      borderHover: "hover:border-rose-500/50",
      badge: t("games_grid.games.onepiece_badge"),
      badgeClass: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
      logo: "/images/games/onepiece.png",
      invertInLight: false,
    },
    {
      id: "lorcana",
      name: "Disney Lorcana",
      displayName: "Disney Lorcana",
      tagline: t("games_grid.games.lorcana_tag"),
      categoryQuery: "Singles Lorcana",
      accentColor: "from-purple-500/20 to-violet-500/10",
      borderHover: "hover:border-purple-500/50",
      badge: t("games_grid.games.lorcana_badge"),
      badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
      logo: "/images/games/lorcana.png",
      invertInLight: false,
    },
    {
      id: "gundam",
      name: "Gundam Card Game",
      displayName: "Gundam Card Game",
      tagline: t("games_grid.games.gundam_tag"),
      categoryQuery: "Singles Gundam",
      accentColor: "from-cyan-500/20 to-sky-500/10",
      borderHover: "hover:border-cyan-500/50",
      badge: t("games_grid.games.gundam_badge"),
      badgeClass: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      logo: "/images/games/gundam.png",
      invertInLight: true,
    },
    {
      id: "riftbound",
      name: "Singles Riftbound",
      displayName: "Riftbound TCG",
      tagline: t("games_grid.games.riftbound_tag"),
      categoryQuery: "Singles Riftbound",
      accentColor: "from-amber-500/20 to-red-500/10",
      borderHover: "hover:border-red-500/50",
      badge: t("games_grid.games.riftbound_badge"),
      badgeClass: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
      logo: "/images/games/riftbound.png",
      invertInLight: false,
    },
  ];

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
                : matchingFeatured?.city || "Santiago, Chile",
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

  // Fetch currencies for exchange rates
  const [globalRates, setGlobalRates] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API_URL}/currencies`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setGlobalRates(data);
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
          const mapped = rawList.map((item: any) => {
            const best = getBestAvailableVariant(item, globalRates);
            return {
              ...item,
              id: item.id,
              slug: item.slug,
              title: item.name || item.title,
              name: item.name || item.title,
              price: best.finalPriceCLP,
              stock: best.stock,
              imageUrl: item.imageUrl,
              description: item.description,
              cardDetail: item.cardDetail,
              items: item.items || [],
              imgs: {
                previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
                thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
              },
              category: item.category,
              store: best.store,
              storeName: best.storeName,
              condition: best.conditionName,
              condition_rel: best.variant?.condition_rel || best.variant?.condition || item.condition_rel,
              conditionCode: best.conditionCode,
              conditionClass: best.conditionClass,
              language: best.languageCode,
              finish: best.isFoil ? "Foil" : "Normal",
              isFoil: best.isFoil,
              cheapestVariant: best.variant,
            };
          });
          setFeaturedProducts(mapped);
        }
      })
      .catch((err) => console.error("Error loading products for home:", err))
      .finally(() => setIsLoading(false));
  }, [globalRates]);

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
      return (
        card.category?.name?.includes("Magic") ||
        card.title?.includes("Magic") ||
        card.title?.includes("Knight") ||
        card.title?.includes("Lotus")
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] selection:bg-red-500 selection:text-white transition-colors duration-200">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        {/* Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & Search */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] mb-6 backdrop-blur-md shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="w-2 h-2 rounded-full bg-red-500 -ml-4"></span>
                <span className="text-xs font-semibold tracking-wider uppercase text-[var(--tt-text-muted)]">
                  {t("hero.badge")}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--tt-text-main)] tracking-tight leading-[1.1] mb-6">
                {t("hero.title_line1")} <br />
                <span className="inline-block pb-1 font-black bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  {t("hero.title_highlight")}
                </span>{" "}
                <br />
                {t("hero.title_line2")}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[var(--tt-text-muted)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                {t("hero.subtitle_prefix")}{" "}
                <strong className="text-[var(--tt-text-main)]">TapTrade Shield</strong>, {t("hero.subtitle_middle")}{" "}
                <strong className="text-[var(--tt-text-main)]">Chilexpress</strong> y{" "}
                <strong className="text-[var(--tt-text-main)]">Starken</strong>,{" "}
                <strong className="text-emerald-500 dark:text-emerald-400">{t("hero.subtitle_suffix")}</strong>
              </p>

              {/* Hero Search Box */}
              <form onSubmit={handleHeroSearch} className="max-w-xl mx-auto lg:mx-0 mb-6">
                <div className="relative flex items-center bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl p-1.5 shadow-2xl focus-within:border-red-500/80 focus-within:ring-2 focus-within:ring-red-500/20 transition-all">
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder={t("hero.search_placeholder")}
                    className="w-full min-w-0 bg-transparent border-none text-[var(--tt-text-main)] placeholder-[var(--tt-text-subtle)] text-xs sm:text-base pl-3.5 sm:pl-4 pr-2.5 py-2.5 focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label={t("hero.search_btn")}
                    title={t("hero.search_btn")}
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white flex items-center justify-center shadow-lg shadow-[#E10E0E]/30 transition-all shrink-0 active:scale-95 cursor-pointer"
                  >
                    <IconSearch className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </form>

              {/* Trending Tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-[var(--tt-text-muted)]">
                <span className="font-semibold text-[var(--tt-text-subtle)]">{t("hero.trending")}</span>
                <Link
                  href="/shop?category=Singles+Riftbound"
                  className="px-2.5 py-1 rounded-lg bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] hover:border-red-500/50 hover:text-[var(--tt-text-main)] transition-colors"
                >
                  #Riftbound
                </Link>
                <Link
                  href="/shop?search=Ezreal"
                  className="px-2.5 py-1 rounded-lg bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] hover:border-red-500/50 hover:text-[var(--tt-text-main)] transition-colors"
                >
                  #Ezreal Showcase
                </Link>
                <Link
                  href="/shop?category=Singles+Magic+The+Gathering"
                  className="px-2.5 py-1 rounded-lg bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] hover:border-red-500/50 hover:text-[var(--tt-text-main)] transition-colors"
                >
                  #MagicMTG
                </Link>
                <Link
                  href="/shop?category=Singles+Pokemon"
                  className="px-2.5 py-1 rounded-lg bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] hover:border-red-500/50 hover:text-[var(--tt-text-main)] transition-colors"
                >
                  #PokemonTCG
                </Link>
              </div>
            </div>

            {/* Right Column: Holographic 3D Floating Showcase Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-600/30 to-amber-500/20 rounded-3xl blur-2xl transform scale-95 opacity-80"></div>

                <div className="relative rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] p-6 shadow-2xl backdrop-blur-xl group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                      <IconSparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {t("hero.showcase_badge")}
                    </span>
                    <span className="text-xs text-emerald-500 dark:text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      NM • EN
                    </span>
                  </div>

                  <div className="relative aspect-[2.5/3.5] w-full rounded-2xl overflow-hidden bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] mb-4 shadow-inner">
                    <Image
                      src="https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/83da64e39d838d2fee68c319c03fbff0d4c7035f-744x1039.png"
                      alt="Ezreal - Dashing Alternate Art"
                      fill
                      unoptimized
                      className="object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                    <div className="card-foil-overlay"></div>
                  </div>

                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-xs text-[var(--tt-text-muted)] block font-mono">Singles Riftbound • Spiritforged</span>
                      <h3 className="text-lg font-black text-[var(--tt-text-main)] group-hover:text-red-500 transition-colors">
                        Ezreal - Dashing (Alt Art)
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[var(--tt-text-muted)] block">{t("hero.best_price")}</span>
                      <span className="text-2xl font-black text-[var(--tt-text-main)] font-mono">$500 CLP</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-[var(--tt-border-medium)]">
                    <div className="flex items-center gap-1.5 flex-1">
                      <ShippingBadge name="retiro_tienda" size="sm" />
                      <ShippingBadge name="chilexpress" size="sm" />
                    </div>
                    <Link
                      href="/shop-details/ezreal-dashing-alternate-art-666446"
                      className="px-4 py-2 rounded-xl bg-[var(--tt-bg-subtle)] hover:bg-red-600 hover:text-white text-[var(--tt-text-main)] border border-[var(--tt-border-medium)] font-bold text-xs transition-all shadow"
                    >
                      {t("hero.view_options")} ↗
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Trust Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-[var(--tt-border-medium)]">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <IconStore className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--tt-text-main)] block">{t("trust_bar.pickup_title")}</span>
                <span className="text-[11px] text-[var(--tt-text-muted)]">{t("trust_bar.pickup_desc")}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <IconZap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--tt-text-main)] block">{t("trust_bar.shipping_title")}</span>
                <span className="text-[11px] text-[var(--tt-text-muted)]">{t("trust_bar.shipping_desc")}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)]">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <IconShieldCheck className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--tt-text-main)] block">{t("trust_bar.stores_title")}</span>
                <span className="text-[11px] text-[var(--tt-text-muted)]">{t("trust_bar.stores_desc")}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)]">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <IconCreditCard className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--tt-text-main)] block">{t("trust_bar.payments_title")}</span>
                <span className="text-[11px] text-[var(--tt-text-muted)]">{t("trust_bar.payments_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. JUEGOS TCG DESTACADOS (Visual Grid) */}
      <section className="py-16 border-t border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)]/50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-500 mb-1 block">
                {t("games_grid.badge")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--tt-text-main)] tracking-tight">
                {t("games_grid.title")}
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] transition-colors flex items-center gap-1.5"
            >
              {t("games_grid.view_all")} <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TCG_GAMES.map((game) => (
              <Link
                key={game.id}
                href={`/shop?category=${encodeURIComponent(game.categoryQuery)}`}
                className={`group relative p-6 rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] ${game.borderHover} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden flex flex-col justify-between`}
              >
                {/* Ambient Glow */}
                <div
                  className={`absolute -right-12 -bottom-12 w-48 h-48 bg-gradient-to-br ${game.accentColor} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 opacity-60 group-hover:opacity-100 pointer-events-none`}
                />

                <div className="relative z-10">
                  {/* Card Header: Official Logo on Left, Badge on Right */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="relative h-10 w-32 flex items-center justify-start">
                      <Image
                        src={game.logo}
                        alt={game.displayName}
                        width={140}
                        height={44}
                        className={`max-h-9 w-auto max-w-[125px] object-contain object-left transition-transform duration-300 group-hover:scale-105 drop-shadow-sm ${
                          game.invertInLight ? "filter invert dark:invert-0" : ""
                        }`}
                        unoptimized={true}
                      />
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border shrink-0 ${game.badgeClass}`}
                    >
                      {game.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-black text-[var(--tt-text-main)] group-hover:text-red-500 transition-colors mb-1 leading-snug">
                    {game.displayName}
                  </h3>
                  <p className="text-xs text-[var(--tt-text-muted)] mb-5 line-clamp-2 leading-relaxed">
                    {game.tagline}
                  </p>
                </div>

                {/* Card Footer: Explorar */}
                <div className="relative z-10 flex items-center justify-end pt-3.5 border-t border-[var(--tt-border-subtle)] text-xs">
                  <span className="font-bold text-red-500 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-mono text-[11px]">
                    {t("games_grid.explore_cta")} ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CARTAS DESTACADAS EN VIVO (Live Marketplace Singles) */}
      <section className="py-20 border-t border-[var(--tt-border-medium)]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-500 mb-1 block">
                {t("featured_singles.badge")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--tt-text-main)] tracking-tight">
                {t("featured_singles.title")}
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all" ? "bg-[#E10E0E] text-white shadow-sm" : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                }`}
              >
                {t("featured_singles.tab_all")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("foil")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "foil" ? "bg-[#E10E0E] text-white shadow-sm" : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                }`}
              >
                {t("featured_singles.tab_foil")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("riftbound")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "riftbound" ? "bg-[#E10E0E] text-white shadow-sm" : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                }`}
              >
                {t("featured_singles.tab_riftbound")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("magic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "magic" ? "bg-[#E10E0E] text-white shadow-sm" : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                }`}
              >
                {t("featured_singles.tab_magic")}
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[2.5/4] rounded-2xl bg-[var(--tt-bg-surface)] animate-pulse border border-[var(--tt-border-medium)]"></div>
              ))}
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-muted)] text-sm">
              {t("featured_singles.no_cards")}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredCards.slice(0, 8).map((product) => (
                <TcgProductCard key={product.id} item={product} globalRates={globalRates} />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--tt-bg-surface)] hover:bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] font-bold text-sm tracking-wide transition-all hover:scale-105 shadow-sm"
            >
              {t("featured_singles.view_catalog")} →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TIENDAS TCG VERIFICADAS DE CHILE */}
      <section id="tiendas" className="py-20 border-t border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)]/50 scroll-mt-24">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500 mb-1 block">
              {t("verified_stores.badge")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--tt-text-main)] tracking-tight mb-3">
              {t("verified_stores.title")}
            </h2>
            <p className="text-sm text-[var(--tt-text-muted)]">
              {t("verified_stores.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredStores.map((store) => (
              <div
                key={store.id}
                className="p-6 rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/30 transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex items-center justify-center font-black text-red-500 text-lg shrink-0">
                        {store.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[var(--tt-text-main)]">{store.name}</h3>
                          <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <IconCheck className="w-3 h-3 text-emerald-500" /> {t("verified_stores.verified")}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--tt-text-muted)] block">{store.city}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--tt-text-muted)] mb-2 font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <IconMapPin className="w-3.5 h-3.5 text-[var(--tt-text-subtle)] shrink-0" /> {store.address}
                    </span>
                  </p>
                  <p className="text-[11px] text-[var(--tt-text-subtle)] mb-4 font-mono">
                    <span className="inline-flex items-center gap-1.5">
                      <IconClock className="w-3.5 h-3.5 text-[var(--tt-text-subtle)] shrink-0" /> {store.hours}
                    </span>
                  </p>

                  <div className="mb-5">
                    <StoreShippingBadges store={store} size="sm" className="flex items-center gap-2 flex-wrap" />
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--tt-border-light)] flex items-center justify-between">
                  <span className="text-xs text-[var(--tt-text-muted)] font-medium">{store.specialty}</span>
                  <Link
                    href={`/shop/store/${store.subdomain}`}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all shadow-md shadow-red-600/20"
                  >
                    {t("verified_stores.view_inventory")} ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION PARA TIENDAS Y VENDEDORES */}
      <section className="py-20 border-t border-[var(--tt-border-medium)] relative overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl bg-gradient-to-r from-red-500/10 via-[var(--tt-bg-surface)] to-[var(--tt-bg-subtle)] border border-red-500/30 p-8 sm:p-12 lg:p-16 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider text-red-500 bg-red-500/15 border border-red-500/30 px-3 py-1 rounded-full mb-4">
                {t("seller_cta.badge")}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[var(--tt-text-main)] tracking-tight mb-4">
                {t("seller_cta.title")}
              </h2>
              <p className="text-sm sm:text-base text-[var(--tt-text-muted)] leading-relaxed">
                {t("seller_cta.desc")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#E10E0E]/30 transition-all text-center block"
              >
                {t("seller_cta.create_store_btn")}
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[var(--tt-bg-surface)] hover:bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] font-bold text-sm tracking-wide transition-all text-center"
              >
                {t("seller_cta.contact_support_btn")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
