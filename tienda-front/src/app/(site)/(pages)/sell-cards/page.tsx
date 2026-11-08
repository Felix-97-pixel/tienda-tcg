import React from "react";
import { Metadata } from "next";
import { API_URL } from "@/utils/api";
import VenderCartasClient from "./_components/VenderCartasClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("buylist");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

async function getInitialBuylistData() {
  try {
    const [buylistRes, storesRes] = await Promise.all([
      fetch(`${API_URL}/buylist/public/all`, { cache: "no-store" }),
      fetch(`${API_URL}/stores/public`, { cache: "no-store" }),
    ]);

    const buylistItems = buylistRes.ok ? await buylistRes.json() : [];
    const stores = storesRes.ok ? await storesRes.json() : [];

    return {
      buylistItems: Array.isArray(buylistItems) ? buylistItems : [],
      stores: Array.isArray(stores) ? stores : [],
    };
  } catch (error) {
    console.error("Error loading buylist initial data:", error);
    return { buylistItems: [], stores: [] };
  }
}

export default async function VenderCartasPage() {
  const { buylistItems, stores } = await getInitialBuylistData();

  return (
    <main className="min-h-screen bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] pt-28 md:pt-36 pb-20 transition-colors duration-200">
      <VenderCartasClient initialItems={buylistItems} initialStores={stores} />
    </main>
  );
}
