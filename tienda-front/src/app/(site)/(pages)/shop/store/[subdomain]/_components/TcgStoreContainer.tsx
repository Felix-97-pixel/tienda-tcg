"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TcgStorefrontView from "./TcgStorefrontView";
import TcgStoreBuylistView from "./TcgStoreBuylistView";
import { API_URL } from "@/utils/api";

interface TcgStoreContainerProps {
  store: {
    id: string;
    name: string;
    subdomain: string;
    settings?: Array<{ key: string; value: string }>;
  };
}

export default function TcgStoreContainer({ store }: TcgStoreContainerProps) {
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
      <div className="border-b border-white/[0.08] bg-[#0E121D]/80 backdrop-blur-md sticky top-[72px] z-30">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            {/* Tab 1: Catalog */}
            <button
              type="button"
              onClick={() => handleTabChange("catalog")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shrink-0 ${
                activeTab === "catalog"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                  : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Catálogo en Venta</span>
            </button>

            {/* Tab 2: Buylist */}
            <button
              type="button"
              onClick={() => handleTabChange("buylist")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all shrink-0 ${
                activeTab === "buylist"
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-[#0A0D14] shadow-lg shadow-amber-500/25 font-black"
                  : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5"
              }`}
            >
              <span className="text-base leading-none">💰</span>
              <span>Cartas que Compramos (Buylist)</span>
              {buylistCount !== null && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                    activeTab === "buylist"
                      ? "bg-[#0A0D14]/80 text-amber-300"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
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
