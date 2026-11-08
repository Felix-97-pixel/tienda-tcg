"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TcgStorefrontView from "./TcgStorefrontView";
import TcgStoreBuylistView from "./TcgStoreBuylistView";
import { API_URL } from "@/utils/api";
import { IconCoins, IconCart } from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

interface TcgStoreContainerProps {
  store: {
    id: string;
    name: string;
    subdomain: string;
    settings?: Array<{ key: string; value: string }>;
  };
}

export default function TcgStoreContainer({ store }: TcgStoreContainerProps) {
  const t = useTranslations("store");
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get("tab") === "buylist" ? "buylist" : "catalog";
  const [activeTab, setActiveTab] = useState<"catalog" | "buylist">(initialTab);
  const [buylistCount, setBuylistCount] = useState<number | null>(null);

  // Sync tab with URL if query param changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "buylist" && activeTab !== "buylist") {
      setActiveTab("buylist");
    } else if (tabParam !== "buylist" && activeTab === "buylist" && !tabParam) {
      setActiveTab("catalog");
    }
  }, [searchParams]);

  // Fetch count of active buylist items for badge
  useEffect(() => {
    fetch(`${API_URL}/buylist/public/${store.subdomain}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setBuylistCount(data.length);
        }
      })
      .catch((err) => console.error("Error fetching buylist count:", err));
  }, [store.subdomain]);

  const handleTabChange = (tab: "catalog" | "buylist") => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === "buylist") {
      url.searchParams.set("tab", "buylist");
    } else {
      url.searchParams.delete("tab");
    }
    router.replace(url.pathname + url.search, { scroll: false });
  };

  return (
    <div className="w-full">
      {/* Master Mode Switcher Bar */}
      <div className="border-b border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)]/90 backdrop-blur-md sticky top-[72px] z-30 transition-colors">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {/* Tab 1: Catalog */}
            <button
              type="button"
              onClick={() => handleTabChange("catalog")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shrink-0 ${
                activeTab === "catalog"
                  ? "bg-red text-white shadow-lg shadow-red/25"
                  : "bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] border border-[var(--tt-border-medium)]"
              }`}
            >
              <IconCart className="w-4 h-4 shrink-0" />
              <span>{t("catalog_tab")}</span>
            </button>

            {/* Tab 2: Buylist */}
            <button
              type="button"
              onClick={() => handleTabChange("buylist")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shrink-0 ${
                activeTab === "buylist"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white dark:text-[#0A0D14] shadow-lg shadow-amber-500/25 font-black"
                  : "bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] border border-[var(--tt-border-medium)]"
              }`}
            >
              <IconCoins className="w-4 h-4 text-amber-950 dark:text-amber-950 shrink-0" />
              <span>{t("buylist_tab")}</span>
              {buylistCount !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                    activeTab === "buylist"
                      ? "bg-black/30 text-white"
                      : "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {buylistCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content Display */}
      {activeTab === "catalog" ? (
        <TcgStorefrontView storeId={store.id} storeName={store.name} />
      ) : (
        <TcgStoreBuylistView store={store} />
      )}
    </div>
  );
}
