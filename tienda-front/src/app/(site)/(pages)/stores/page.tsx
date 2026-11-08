"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { StoreShippingBadges } from "@/components/ui/StoreShippingBadges";
import {
  IconStore,
  IconShieldCheck,
  IconSearch,
  IconX,
  IconMapPin,
  IconClock,
  IconSparkles,
  IconArrowRight,
} from "@/components/ui/Icons";

interface PublicStore {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string | null;
  address?: string | null;
  pickupEnabled?: boolean | null;
  pickupAddress?: string | null;
  pickupSchedule?: string | null;
  originRegion?: { id: string; name: string } | null;
  originCommune?: { id: string; name: string } | null;
  shipping?: Array<{
    id?: string;
    name: string;
    price?: number | string;
    isActive?: boolean;
  }> | null;
}

export default function TiendasDirectoryPage() {
  const t = useTranslations("stores_directory");
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/stores/public`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setStores(data);
        }
      })
      .catch((err) => {
        console.error("Error al cargar tiendas:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredStores = useMemo(() => {
    if (!searchTerm.trim()) return stores;
    const term = searchTerm.toLowerCase().trim();
    return stores.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(term);
      const communeMatch = s.originCommune?.name?.toLowerCase().includes(term);
      const regionMatch = s.originRegion?.name?.toLowerCase().includes(term);
      const addressMatch = s.pickupAddress?.toLowerCase().includes(term) || s.address?.toLowerCase().includes(term);
      return nameMatch || communeMatch || regionMatch || addressMatch;
    });
  }, [stores, searchTerm]);

  return (
    <main className="min-h-screen bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] pt-28 md:pt-36 pb-20 transition-colors">
      {/* Top Banner Header */}
      <div className="relative border-b border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] pb-10 mb-10 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-dark via-red to-orange"></div>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red/15 text-red dark:text-red-light border border-red/30 mb-3">
            <IconStore className="w-3.5 h-3.5 text-red" />
            {t("badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--tt-text-main)] mb-3">
            {t("title")}
          </h1>
          <p className="text-[var(--tt-text-muted)] text-sm sm:text-base max-w-2xl leading-relaxed">
            {t("description")}
          </p>

          {/* Search Box */}
          <div className="mt-6 max-w-xl relative">
            <div className="relative flex items-center bg-[var(--tt-bg-subtle)] rounded-xl border border-[var(--tt-border-medium)] hover:border-red-500/40 focus-within:border-red/60 focus-within:ring-1 focus-within:ring-red/30 transition-all">
              <IconSearch className="absolute left-3.5 w-4 h-4 text-[var(--tt-text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("search_placeholder")}
                className="w-full bg-transparent text-[var(--tt-text-main)] text-xs sm:text-sm pl-10 pr-10 py-3 outline-none placeholder:text-[var(--tt-text-muted)]"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                  title={t("clear_search")}
                >
                  <IconX className="w-4 h-4" />
                </button>
              )}
            </div>
            <span className="text-[11px] text-[var(--tt-text-muted)] font-mono mt-2 block">
              {t("stores_found", { count: filteredStores.length })}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--tt-bg-subtle)]" />
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-4 rounded bg-[var(--tt-bg-subtle)]" />
                    <div className="w-20 h-3 rounded bg-[var(--tt-bg-subtle)]" />
                  </div>
                </div>
                <div className="w-full h-12 rounded-xl bg-[var(--tt-bg-subtle)]" />
              </div>
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl p-8 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-[var(--tt-bg-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--tt-text-muted)]">
              <IconStore className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[var(--tt-text-main)] mb-1">{t("no_stores_title")}</h3>
            <p className="text-xs text-[var(--tt-text-muted)] mb-4">
              {t("no_stores_desc", { term: searchTerm })}
            </p>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--tt-bg-subtle)] text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-canvas)] border border-[var(--tt-border-medium)] transition-all"
            >
              {t("reset_search")}
            </button>
          </div>
        ) : (
          /* Stores Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStores.map((store) => {
              const locationText = [store.originCommune?.name, store.originRegion?.name]
                .filter(Boolean)
                .join(", ") || store.address || "Chile";

              return (
                <div
                  key={store.id}
                  className="p-6 rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 shadow-sm shadow-black/5 dark:shadow-xl transition-all flex flex-col justify-between group hover:shadow-red/5"
                >
                  <div className="space-y-4">
                    {/* Header: Logo & Name */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {store.logoUrl ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] shrink-0 relative">
                            <Image
                              src={store.logoUrl}
                              alt={store.name}
                              fill
                              sizes="48px"
                              className="object-contain p-1"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex items-center justify-center font-black text-red text-base shrink-0">
                            {store.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-[var(--tt-text-main)] truncate group-hover:text-red transition-colors">
                              {store.name}
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <IconShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              {t("verified_badge")}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--tt-text-muted)] flex items-center gap-1.5 truncate mt-0.5">
                            <IconMapPin className="w-3.5 h-3.5 text-[var(--tt-text-muted)] shrink-0" />
                            <span>{locationText}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pickup Address & Schedule */}
                    {store.pickupEnabled && (
                      <div className="bg-[var(--tt-bg-subtle)] rounded-xl p-3 border border-[var(--tt-border-subtle)] space-y-1.5 text-xs">
                        {store.pickupAddress && (
                          <p className="text-[var(--tt-text-main)] font-medium truncate flex items-center gap-1.5">
                            <IconStore className="w-3.5 h-3.5 text-red shrink-0" />
                            <span>{store.pickupAddress}</span>
                          </p>
                        )}
                        {store.pickupSchedule && (
                          <p className="text-[11px] text-[var(--tt-text-muted)] font-mono truncate flex items-center gap-1.5">
                            <IconClock className="w-3.5 h-3.5 text-[var(--tt-text-muted)] shrink-0" />
                            <span>{store.pickupSchedule}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Shipping Badges */}
                    <div className="pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--tt-text-muted)] block mb-1.5 font-bold">
                        {t("shipping_pickup_enabled")}
                      </span>
                      <StoreShippingBadges store={store} size="sm" />
                    </div>
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-6 mt-6 border-t border-[var(--tt-border-subtle)] flex items-center justify-between gap-4">
                    <span className="text-xs text-[var(--tt-text-muted)] font-mono">
                      {t("subdomain_label")} <strong className="text-[var(--tt-text-main)]">{store.subdomain}</strong>
                    </span>
                    <Link
                      href={`/shop/store/${store.subdomain}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red hover:bg-red-dark transition-all shadow-md shadow-red/25 active:scale-95"
                    >
                      <span>{t("view_catalog")}</span>
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to Action for Store Owners */}
        <div className="mt-16 p-8 rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] shadow-md shadow-black/5 dark:shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red dark:text-red-light">
              {t("b2b_badge")}
            </span>
            <h3 className="text-xl font-bold text-[var(--tt-text-main)]">
              {t("b2b_title")}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--tt-text-muted)] max-w-xl">
              {t("b2b_desc")}
            </p>
          </div>
          <Link
            href="/landing"
            className="shrink-0 px-5 py-3 rounded-xl text-xs font-bold text-white bg-red hover:bg-red-dark transition-all shadow-lg shadow-red/30 active:scale-95 flex items-center gap-2"
          >
            <IconSparkles className="w-4 h-4 text-white" />
            <span>{t("b2b_cta")}</span>
            <span className="bg-black/30 text-white text-[10px] px-1.5 py-0.2 rounded font-mono uppercase">
              Landing
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
