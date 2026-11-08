"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useMessages } from "next-intl";
import PricingSection from "@/app/landing/_components/Marketing/PricingSection";
import SystemShowcase from "@/app/landing/_components/Marketing/SystemShowcase";
import {
  IconSparkles,
  IconShieldCheck,
  IconTruck,
  IconCreditCard,
  IconStore,
  IconCard,
  IconZap,
  IconBox,
  IconTag,
  IconLanguageFlag,
  IconPosTerminal,
  IconWifiOff,
  IconBarcode,
  IconReceipt,
  IconChevronDown,
} from "@/components/ui/Icons";

export default function MarketingPage() {
  const t = useTranslations("landing.page");
  const messages = useMessages() as any;
  const faqs: Array<{ q: string; a: string }> = messages?.landing?.faqs || [];

  const [activeTab, setActiveTab] = useState<"players" | "stores">("players");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showAllFaqs, setShowAllFaqs] = useState(false);
  const [vaultCategory, setVaultCategory] = useState<"featured" | "magic" | "riftbound">("featured");

  const vaultCards = [
    {
      id: "black-lotus",
      name: "Black Lotus",
      set: "Alpha Limited",
      game: "Magic: The Gathering",
      gameCategory: "magic",
      gameColor: "text-blue-400",
      imageUrl: "https://cards.scryfall.io/normal/front/b/0/b0faa7f2-b547-42c4-a810-839da50dadfe.jpg?1559591477",
      condition: "NM",
      language: "EN",
      price: "$45.000.000 CLP",
      store: "BloodMoonGames",
      badge: "Holy Grail Alpha",
      isFoil: false,
      searchQuery: "Black Lotus",
      isFeatured: true,
    },
    {
      id: "annie-dark-child",
      name: "Annie - Dark Child",
      set: "Organized Play Promo",
      game: "Riftbound TCG",
      gameCategory: "riftbound",
      gameColor: "text-cyan-400",
      imageUrl: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/89963e1d1cffd69c620fb5d6b037f50d5c334463-744x1039.png?accountingTag=RB",
      condition: "NM",
      language: "EN",
      price: "$22.310 CLP",
      store: "BloodMoonGames",
      badge: "Foil Promocional",
      isFoil: true,
      searchQuery: "Annie",
      isFeatured: true,
    },
    {
      id: "orcish-bowmasters",
      name: "Orcish Bowmasters",
      set: "Tales of Middle-earth",
      game: "Magic: The Gathering",
      gameCategory: "magic",
      gameColor: "text-purple-400",
      imageUrl: "https://cards.scryfall.io/normal/front/d/e/de2de055-5246-408b-80fe-cd01688c145e.jpg?1686972486",
      condition: "NM",
      language: "EN",
      price: "$38.990 CLP",
      store: "BloodMoonGames",
      badge: "Modern Staple",
      isFoil: false,
      searchQuery: "Orcish Bowmasters",
      isFeatured: true,
    },
    {
      id: "overlord-balemurk",
      name: "Overlord of the Balemurk",
      set: "Duskmourn: Horror",
      game: "Magic: The Gathering",
      gameCategory: "magic",
      gameColor: "text-emerald-400",
      imageUrl: "https://cards.scryfall.io/normal/front/9/b/9b911653-7b96-4cf3-a907-13c5c53a14f7.jpg?1726286269",
      condition: "NM",
      language: "ES",
      price: "$29.990 CLP",
      store: "BloodMoonGames",
      badge: "Mítico Standard",
      isFoil: false,
      searchQuery: "Overlord",
      isFeatured: false,
    },
    {
      id: "sivir-mercenary",
      name: "Sivir - Mercenary (Alt Art)",
      set: "Spiritforged",
      game: "Riftbound TCG",
      gameCategory: "riftbound",
      gameColor: "text-cyan-400",
      imageUrl: "https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/6c0eeb81da597528625d458cb4c560298b5bea50-744x1039.png",
      condition: "NM",
      language: "EN",
      price: "$14.990 CLP",
      store: "BloodMoonGames",
      badge: "Alternate Art Foil",
      isFoil: true,
      searchQuery: "Sivir",
      isFeatured: false,
    },
  ];

  const displayedVaultCards =
    vaultCategory === "featured"
      ? vaultCards.filter((c) => c.isFeatured)
      : vaultCards.filter((c) => c.gameCategory === vaultCategory);

  const tcgGames = [
    { name: "Magic: The Gathering", publisher: "Wizards of the Coast", badge: "Scryfall Sync", color: "from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-400" },
    { name: "Pokémon TCG", publisher: "The Pokémon Company", badge: "API Oficial", color: "from-amber-500/20 to-yellow-600/10 border-amber-500/30 text-amber-300" },
    { name: "Yu-Gi-Oh!", publisher: "Konami", badge: "Catálogo Global", color: "from-purple-600/20 to-pink-600/10 border-purple-500/30 text-purple-400" },
    { name: "Riftbound TCG", publisher: "Riftbound Games", badge: "Riftcodex Sync", color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-300" },
    { name: "One Piece Card Game", publisher: "Bandai Carddass", badge: "Alta Demanda", color: "from-red-600/20 to-rose-600/10 border-red-500/30 text-red-400" },
    { name: "Mitos y Leyendas", publisher: "Fenix / Klu", badge: "Chile Tradición", color: "from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-300" },
  ];

  return (
    <div className="w-full relative overflow-hidden bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] selection:bg-[#E10E0E] selection:text-white transition-colors duration-200">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-[#E10E0E]/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-15%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[10%] w-[45%] h-[45%] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Subtle Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-20">
        <div className="flex flex-col items-center text-center">
          {/* Official Launch Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] mb-8 backdrop-blur-md shadow-lg hover:border-red-500/40 transition-all">
            <span className="flex w-2 h-2 rounded-full bg-[#E10E0E] animate-pulse"></span>
            <span className="text-xs font-semibold text-[var(--tt-text-main)] tracking-wide uppercase">
              {t("hero.badge")}
            </span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[var(--tt-text-main)] max-w-5xl leading-[1.08] mb-6">
            {t("hero.title_prefix")}{" "}
            <span className="text-[var(--tt-text-main)]">
              {t("hero.title_highlight1")}
            </span>{" "}
            {t("hero.title_middle")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-500">
              {t("hero.title_highlight2")}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[var(--tt-text-muted)] max-w-3xl mb-10 leading-relaxed font-normal">
            {t("hero.subtitle")}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-[#E10E0E] hover:bg-[#F23030] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-[#E10E0E]/30 hover:shadow-2xl hover:shadow-[#E10E0E]/50 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <IconSparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              {t("hero.cta_explore")}
            </Link>
            <Link
              href="/admin/login"
              className="w-full sm:w-auto px-8 py-4 bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] font-bold text-sm rounded-2xl border border-[var(--tt-border-medium)] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <IconStore className="w-4 h-4 text-amber-500" />
              {t("hero.cta_create_store")}
            </Link>
          </div>

          {/* FLOATING HOLOGRAPHIC VAULT SHOWCASE */}
          <div id="marketplace" className="w-full max-w-5xl relative mt-4 scroll-mt-28">
            <div className="absolute inset-0 bg-gradient-to-t from-[#E10E0E]/20 via-blue-600/10 to-transparent blur-3xl -z-10 rounded-3xl"></div>

            <div className="rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[var(--tt-border-subtle)]">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--tt-text-main)] flex items-center gap-2">
                      <IconZap className="w-4 h-4 text-amber-500" /> {t("vault.title")}
                    </h3>
                    <p className="text-xs text-[var(--tt-text-muted)]">{t("vault.subtitle")}</p>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setVaultCategory("featured")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      vaultCategory === "featured"
                        ? "bg-[#E10E0E] text-white shadow-md shadow-[#E10E0E]/30"
                        : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                    }`}
                  >
                    {t("vault.cat_featured")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVaultCategory("magic")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      vaultCategory === "magic"
                        ? "bg-[#E10E0E] text-white shadow-md shadow-[#E10E0E]/30"
                        : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                    }`}
                  >
                    {t("vault.cat_magic")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVaultCategory("riftbound")}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      vaultCategory === "riftbound"
                        ? "bg-[#E10E0E] text-white shadow-md shadow-[#E10E0E]/30"
                        : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                    }`}
                  >
                    {t("vault.cat_riftbound")}
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {displayedVaultCards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/shop?search=${encodeURIComponent(card.searchQuery)}`}
                    className={`group relative rounded-2xl bg-[var(--tt-bg-subtle)] border transition-all duration-300 hover:-translate-y-1.5 p-4 flex flex-col justify-between text-left ${
                      card.isFoil
                        ? "border-red-500/40 hover:border-[#E10E0E] shadow-xl shadow-[#E10E0E]/10"
                        : "border-[var(--tt-border-medium)] hover:border-red-500/30 shadow-lg"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-2.5 z-10 w-full">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black font-mono tracking-wider bg-emerald-500/20 text-emerald-500 border border-emerald-500/40 shadow-sm flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {card.condition}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-extrabold font-mono bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] border border-[var(--tt-border-medium)] shadow-sm">
                          <IconLanguageFlag code={card.language} className="w-4 h-3 rounded-[1px] shrink-0 shadow-sm" />
                          <span>{card.language}</span>
                        </span>
                      </div>

                      {card.isFoil ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-400/25 via-pink-400/25 to-cyan-400/25 border border-amber-400/80 text-amber-500 dark:text-amber-300 shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          {t("vault.badge_foil")}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-[var(--tt-text-muted)] bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] uppercase">
                          {t("vault.badge_normal")}
                        </span>
                      )}
                    </div>

                    <div className="relative aspect-[2.5/3.5] w-full max-w-[220px] mx-auto rounded-xl overflow-hidden bg-black/50 mb-3 border border-[var(--tt-border-medium)] card-foil-container">
                      <Image
                        src={card.imageUrl}
                        alt={card.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        unoptimized={true}
                      />
                      {card.isFoil && <div className="card-foil-overlay !opacity-60" />}
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[11px] font-bold truncate ${card.gameColor}`}>{card.game}</span>
                        <span className="text-[10px] text-[var(--tt-text-muted)] font-mono truncate">{card.set}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-[var(--tt-text-main)] group-hover:text-[#F23030] transition-colors truncate">
                        {card.name}
                      </h4>
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-[var(--tt-border-subtle)]">
                        <div>
                          <span className="text-[10px] text-[var(--tt-text-muted)] block leading-tight">{t("vault.best_price")}</span>
                          <span className="text-sm font-black text-[var(--tt-text-main)] font-mono">{card.price}</span>
                        </div>
                        <span className="text-[10px] text-[var(--tt-text-muted)] font-medium px-2 py-1 rounded bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] group-hover:border-red-500/30 transition-colors">
                          {card.store}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom Quick-Link */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-5 border-t border-[var(--tt-border-subtle)] bg-[var(--tt-bg-subtle)] p-4 rounded-2xl">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-xl bg-[#E10E0E]/15 border border-[#E10E0E]/30 flex items-center justify-center text-[#E10E0E] shrink-0">
                    <IconSparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--tt-text-main)]">{t("vault.info_title")}</p>
                    <p className="text-[11px] text-[var(--tt-text-muted)]">{t("vault.info_desc")}</p>
                  </div>
                </div>
                <Link
                  href="/shop"
                  className="px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-md shadow-[#E10E0E]/25 hover:shadow-lg hover:shadow-[#E10E0E]/40 transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
                >
                  {t("vault.cta_catalog")}
                </Link>
              </div>

              {/* Live Platform Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[var(--tt-border-subtle)]">
                <div className="text-center md:text-left">
                  <span className="text-2xl sm:text-3xl font-black text-[var(--tt-text-main)] font-mono block">+850</span>
                  <span className="text-xs text-[var(--tt-text-muted)]">{t("vault.stat_expansions")}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-2xl sm:text-3xl font-black text-[var(--tt-text-main)] font-mono block">100%</span>
                  <span className="text-xs text-[var(--tt-text-muted)]">{t("vault.stat_stores")}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-500 font-mono block">Shield</span>
                  <span className="text-xs text-[var(--tt-text-muted)]">{t("vault.stat_shield")}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-2xl sm:text-3xl font-black text-[#E10E0E] font-mono block">$0</span>
                  <span className="text-xs text-[var(--tt-text-muted)]">{t("vault.stat_pickup")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TCG GAMES SHOWCASE */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[var(--tt-border-subtle)]">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            {t("games.badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--tt-text-main)]">
            {t("games.title")}
          </h2>
          <p className="text-[var(--tt-text-muted)] text-sm mt-2 max-w-2xl mx-auto">
            {t("games.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {tcgGames.map((game) => (
            <div
              key={game.name}
              className={`p-4 rounded-2xl bg-gradient-to-b ${game.color} bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] transition-all hover:scale-[1.03] flex flex-col justify-between shadow-sm`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-75">
                  {game.badge}
                </span>
                <h4 className="text-sm font-extrabold text-[var(--tt-text-main)] mt-1 leading-tight">{game.name}</h4>
              </div>
              <span className="text-[10px] text-[var(--tt-text-muted)] mt-3 block">{game.publisher}</span>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE DUAL AUDIENCE SWITCHER */}
      <section id="for-stores" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[var(--tt-border-subtle)]">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            {t("audience.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--tt-text-main)]">
            {t("audience.title")}
          </h2>

          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] mt-6 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab("players")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "players"
                  ? "bg-[#E10E0E] text-white shadow-lg shadow-[#E10E0E]/30"
                  : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
              }`}
            >
              <IconCard className="w-4 h-4" /> {t("audience.tab_players")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("stores")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "stores"
                  ? "bg-[#E10E0E] text-white shadow-lg shadow-[#E10E0E]/30"
                  : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
              }`}
            >
              <IconStore className="w-4 h-4" /> {t("audience.tab_stores")}
            </button>
          </div>
        </div>

        {activeTab === "players" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
                  <IconZap className="w-6 h-6 text-[#E10E0E]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.players.cart_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.players.cart_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-[var(--tt-text-muted)] font-mono">
                {t("audience.players.cart_footer")}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6">
                  <IconSparkles className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.players.deck_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.players.deck_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-[var(--tt-text-muted)] font-mono">
                {t("audience.players.deck_footer")}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6">
                  <IconShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.players.shield_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.players.shield_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-emerald-500 font-mono">
                {t("audience.players.shield_footer")}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500 mb-6">
                  <IconStore className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.players.pickup_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.players.pickup_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-[var(--tt-text-muted)] font-mono">
                {t("audience.players.pickup_footer")}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {/* 1. POS */}
            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-red-500/30 hover:border-red-500/50 shadow-[0_0_30px_rgba(225,14,14,0.12)] transition-all flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-red-500/20 text-[#FF5555] border border-red-500/30 text-[9px] font-mono font-bold uppercase tracking-wider">
                {t("audience.stores.pos_badge")}
              </div>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
                  <IconPosTerminal className="w-6 h-6 text-[#E10E0E]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.stores.pos_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.stores.pos_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-red-500 font-mono">
                {t("audience.stores.pos_footer")}
              </div>
            </div>

            {/* 2. Sync */}
            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-blue-500/40 transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-500 mb-6">
                  <IconBox className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.stores.sync_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.stores.sync_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-[var(--tt-text-muted)] font-mono">
                {t("audience.stores.sync_footer")}
              </div>
            </div>

            {/* 3. Buylist */}
            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-6">
                  <IconTag className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.stores.buylist_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.stores.buylist_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-[var(--tt-text-muted)] font-mono">
                {t("audience.stores.buylist_footer")}
              </div>
            </div>

            {/* 4. Shield */}
            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-6">
                  <IconShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.stores.shield_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.stores.shield_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-emerald-500 font-mono">
                {t("audience.stores.shield_footer")}
              </div>
            </div>

            {/* 5. F29 */}
            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-cyan-500/30 hover:border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-6">
                  <IconReceipt className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.stores.f29_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.stores.f29_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-cyan-500 font-mono">
                {t("audience.stores.f29_footer")}
              </div>
            </div>

            {/* 6. Holding */}
            <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-purple-500/40 transition-all flex flex-col justify-between shadow-sm">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 mb-6">
                  <IconStore className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("audience.stores.holding_title")}</h3>
                <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("audience.stores.holding_desc")}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-[var(--tt-text-muted)] font-mono">
                {t("audience.stores.holding_footer")}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SYSTEM SHOWCASE */}
      <div id="showcase" className="scroll-mt-24">
        <SystemShowcase />
      </div>

      {/* BENTO GRID: CARACTERÍSTICAS TÉCNICAS */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[var(--tt-border-subtle)]">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            {t("features.badge")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--tt-text-main)]">
            {t("features.title")}
          </h2>
          <p className="text-[var(--tt-text-muted)] text-base max-w-2xl mx-auto mt-3">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Flagship Bento Card: POS Mostrador */}
          <div
            id="pos"
            className="md:col-span-3 p-8 sm:p-10 rounded-3xl bg-[var(--tt-bg-surface)] dark:bg-gradient-to-br dark:from-[#141824] dark:via-[#0E121B] dark:to-[#1A0E13] border-2 border-red-500/40 hover:border-red-500/60 shadow-[0_0_50px_rgba(225,14,14,0.12)] transition-all relative overflow-hidden group scroll-mt-28"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-red-600/15 transition-all"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-stretch justify-between gap-8">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-[#FF5555] border border-red-500/30 flex items-center gap-1.5">
                      <IconPosTerminal className="w-3.5 h-3.5 text-[#FF5555]" />
                      {t("features.pos_badge_counter")}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 border border-emerald-500/30 font-mono">
                      {t("features.pos_badge_included")}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-[10px] font-mono text-[var(--tt-text-muted)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      IndexedDB &lt;5ms
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-[var(--tt-text-main)] mb-3 tracking-tight">
                    {t("features.pos_title")}
                  </h3>

                  <p className="text-[var(--tt-text-muted)] text-sm sm:text-base leading-relaxed mb-6 max-w-2xl font-normal">
                    {t("features.pos_desc")}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)]">
                      <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0 text-[#FF5555]">
                        <IconBarcode className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--tt-text-main)] mb-0.5">{t("features.f_search")}</h4>
                        <p className="text-[11px] text-[var(--tt-text-muted)] leading-tight">{t("features.f_search_desc")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)]">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-500 dark:text-blue-400">
                        <IconWifiOff className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--tt-text-main)] mb-0.5">{t("features.f_offline")}</h4>
                        <p className="text-[11px] text-[var(--tt-text-muted)] leading-tight">{t("features.f_offline_desc")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)]">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-500 dark:text-amber-400">
                        <IconCreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--tt-text-main)] mb-0.5">{t("features.f_cash")}</h4>
                        <p className="text-[11px] text-[var(--tt-text-muted)] leading-tight">{t("features.f_cash_desc")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)]">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-500 dark:text-emerald-400">
                        <IconBox className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[var(--tt-text-main)] mb-0.5">{t("features.f_stock")}</h4>
                        <p className="text-[11px] text-[var(--tt-text-muted)] leading-tight">{t("features.f_stock_desc")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--tt-border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--tt-text-muted)] font-mono">
                  <span>{t("features.pos_footer")}</span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold">{t("features.pos_no_cost")}</span>
                </div>
              </div>

              {/* Terminal Mockup */}
              <div className="w-full lg:w-[380px] shrink-0 rounded-2xl bg-[#090C13] border border-white/15 p-4 shadow-2xl flex flex-col justify-between font-mono relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-white font-bold ml-1 text-xs">{t("features.mock_title")}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {t("features.mock_status")}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px]">
                    <div className="min-w-0 pr-2">
                      <div className="text-white font-semibold truncate">Sheoldred, the Apocalypse</div>
                      <div className="text-[10px] text-gray-400">DMU • Near Mint • FOIL</div>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">$74.990</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px]">
                    <div className="min-w-0 pr-2">
                      <div className="text-white font-semibold truncate">Charizard ex Special Art</div>
                      <div className="text-[10px] text-gray-400">151 • Near Mint • JP</div>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">$119.990</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-[11px]">
                    <div className="min-w-0 pr-2">
                      <div className="text-white font-semibold truncate">Dragon Shield Matte Black</div>
                      <div className="text-[10px] text-gray-400">{t("features.mock_item3_sub")}</div>
                    </div>
                    <span className="text-emerald-400 font-bold whitespace-nowrap">$11.990</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/10 mb-3 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>{t("features.mock_items_count", { count: 3 })}</span>
                    <span>$206.970</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-sm pt-1 border-t border-white/10">
                    <span>TOTAL CLP</span>
                    <span className="text-[#FF5555]">$206.970</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-center">
                  <div className="py-1.5 px-2 rounded-lg bg-white/5 border border-white/10 text-gray-300">
                    {t("features.mock_f2")}
                  </div>
                  <div className="py-1.5 px-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold">
                    {t("features.mock_f10")}
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[9px] text-gray-400 text-center leading-tight">
                  {t("features.mock_hw")}
                </div>
              </div>
            </div>
          </div>

          {/* Bento 1: Shield */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-[var(--tt-bg-surface)] dark:bg-gradient-to-br dark:from-[#0E121B] dark:via-[#0B1516] dark:to-[#0A1A17] border border-emerald-500/30 hover:border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.06)] transition-all relative overflow-hidden group">
            <div className="relative z-10">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 mb-4 inline-flex items-center gap-1.5">
                <IconShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                {t("features.bento_shield_badge")}
              </span>
              <h3 className="text-2xl font-bold text-[var(--tt-text-main)] mb-2">{t("features.bento_shield_title")}</h3>
              <p className="text-[var(--tt-text-muted)] text-sm max-w-xl mb-6 leading-relaxed font-normal">
                {t("features.bento_shield_desc")}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-500 dark:text-emerald-400 font-mono pt-3 border-t border-emerald-500/20">
                <span>{t("features.bento_shield_p1")}</span>
                <span>{t("features.bento_shield_p2")}</span>
                <span>{t("features.bento_shield_p3")}</span>
              </div>
            </div>
          </div>

          {/* Bento 2: F29 */}
          <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] dark:bg-gradient-to-br dark:from-[#0E121B] dark:via-[#0E1724] dark:to-[#0B1A24] border border-cyan-500/30 hover:border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.06)] transition-all flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30 mb-4 inline-flex items-center gap-1.5">
                <IconReceipt className="w-3 h-3 text-cyan-500 dark:text-cyan-400" />
                {t("features.bento_f29_badge")}
              </span>
              <h3 className="text-xl font-bold text-[var(--tt-text-main)] mb-2">{t("features.bento_f29_title")}</h3>
              <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed mb-4">
                {t("features.bento_f29_desc")}
              </p>
            </div>
            <div className="pt-4 border-t border-cyan-500/20 text-xs text-cyan-500 dark:text-cyan-400 font-mono">
              {t("features.bento_f29_p")}
            </div>
          </div>

          {/* Bento 3: Holding */}
          <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-purple-500/30 hover:border-purple-500/50 transition-all flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500/30 mb-4 inline-flex items-center gap-1.5">
                <IconStore className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                {t("features.bento_branch_badge")}
              </span>
              <h3 className="text-xl font-bold text-[var(--tt-text-main)] mb-2">{t("features.bento_branch_title")}</h3>
              <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed mb-4">
                {t("features.bento_branch_desc")}
              </p>
            </div>
            <div className="pt-4 border-t border-purple-500/20 text-xs text-purple-500 dark:text-purple-400 font-mono">
              {t("features.bento_branch_p")}
            </div>
          </div>

          {/* Bento 4: Vitrina */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-[var(--tt-border-subtle)] transition-all relative overflow-hidden group">
            <div className="relative z-10">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/20 text-blue-500 dark:text-blue-400 border border-blue-500/30 mb-4 inline-block">
                {t("features.bento_domain_badge")}
              </span>
              <h3 className="text-2xl font-bold text-[var(--tt-text-main)] mb-2">{t("features.bento_domain_title")}</h3>
              <p className="text-[var(--tt-text-muted)] text-sm max-w-lg mb-6 leading-relaxed">
                {t("features.bento_domain_desc")}
              </p>
              <div className="flex items-center gap-3 text-xs text-[var(--tt-text-muted)] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{t("features.bento_domain_p")}</span>
              </div>
            </div>
          </div>

          {/* Bento 5: Radar */}
          <div className="p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-[var(--tt-border-subtle)] transition-all flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-500 dark:text-purple-400 border border-purple-500/30 mb-4 inline-block">
                {t("features.bento_radar_badge")}
              </span>
              <h3 className="text-xl font-bold text-[var(--tt-text-main)] mb-2">{t("features.bento_radar_title")}</h3>
              <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed mb-4">
                {t("features.bento_radar_desc")}
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-[var(--tt-text-muted)] font-mono">
              {t("features.bento_radar_p")}
            </div>
          </div>

          {/* Bento 6: Crédito */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-[var(--tt-border-subtle)] transition-all flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30 mb-4 inline-block">
                {t("features.bento_credit_badge")}
              </span>
              <h3 className="text-2xl font-bold text-[var(--tt-text-main)] mb-2">{t("features.bento_credit_title")}</h3>
              <p className="text-[var(--tt-text-muted)] text-sm max-w-lg mb-6 leading-relaxed">
                {t("features.bento_credit_desc")}
              </p>
            </div>
            <div className="pt-4 border-t border-[var(--tt-border-subtle)] text-xs text-[var(--tt-text-muted)] font-mono">
              {t("features.bento_credit_p")}
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[var(--tt-border-subtle)]">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            {t("how_it_works.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--tt-text-main)]">{t("how_it_works.title")}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#E10E0E]/20 text-[#E10E0E] font-mono font-black text-lg flex items-center justify-center mx-auto mb-6 border border-[#E10E0E]/30">
              {t("how_it_works.step1_num")}
            </div>
            <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("how_it_works.step1_title")}</h3>
            <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("how_it_works.step1_desc")}</p>
          </div>

          <div className="relative p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-500 dark:text-blue-400 font-mono font-black text-lg flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
              {t("how_it_works.step2_num")}
            </div>
            <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("how_it_works.step2_title")}</h3>
            <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("how_it_works.step2_desc")}</p>
          </div>

          <div className="relative p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-mono font-black text-lg flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              {t("how_it_works.step3_num")}
            </div>
            <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">{t("how_it_works.step3_title")}</h3>
            <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed">{t("how_it_works.step3_desc")}</p>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <div className="relative z-10">
        <PricingSection />
      </div>

      {/* FAQ SECTION */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-[var(--tt-border-subtle)]">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            {t("faq_section.badge")}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[var(--tt-text-main)]">{t("faq_section.title")}</h2>
          <p className="text-[var(--tt-text-muted)] text-sm mt-2">{t("faq_section.subtitle")}</p>
        </div>

        <div className="space-y-3.5">
          {(showAllFaqs ? faqs : faqs.slice(0, 4)).map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[var(--tt-text-main)] hover:text-red transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className={`text-xl transition-transform font-mono ${isOpen ? "rotate-45 text-[#E10E0E]" : "text-[var(--tt-text-muted)]"}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[var(--tt-text-muted)] leading-relaxed border-t border-[var(--tt-border-subtle)] pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {faqs.length > 4 && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setShowAllFaqs(!showAllFaqs)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--tt-bg-surface)] hover:bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 group"
            >
              <span>
                {showAllFaqs
                  ? t("faq_section.btn_less")
                  : t("faq_section.btn_more", { count: faqs.length - 4 })}
              </span>
              <IconChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showAllFaqs ? "rotate-180 text-[#E10E0E]" : "text-[var(--tt-text-muted)] group-hover:text-[var(--tt-text-main)]"
                }`}
              />
            </button>
          </div>
        )}
      </section>

      {/* FINAL CTA BANNER */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-red-500/10 via-amber-500/5 to-red-500/10 dark:from-red-950/60 dark:via-[#111522] dark:to-amber-950/40 border border-red-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <span className="text-xs font-bold font-mono uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-3 inline-block">
            {t("cta_banner.badge")}
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[var(--tt-text-main)] max-w-3xl mx-auto leading-tight mb-6">
            {t("cta_banner.title")}
          </h2>
          <p className="text-[var(--tt-text-muted)] text-sm sm:text-base max-w-2xl mx-auto mb-8">
            {t("cta_banner.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-[#E10E0E] hover:bg-[#F23030] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-[#E10E0E]/40 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <IconSparkles className="w-4 h-4 text-white" />
              {t("cta_banner.btn_explore")}
            </Link>
            <Link
              href="/admin/login"
              className="w-full sm:w-auto px-8 py-4 bg-[var(--tt-bg-surface)] hover:bg-[var(--tt-bg-subtle)] text-[var(--tt-text-main)] font-bold text-sm rounded-2xl border border-[var(--tt-border-medium)] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <IconStore className="w-4 h-4 text-[var(--tt-text-main)]" />
              {t("cta_banner.btn_store")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
