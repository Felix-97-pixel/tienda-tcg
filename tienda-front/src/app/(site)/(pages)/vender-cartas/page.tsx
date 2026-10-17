import React from "react";
import { Metadata } from "next";
import { API_URL } from "@/utils/api";
import VenderCartasClient from "./_components/VenderCartasClient";

export const metadata: Metadata = {
  title: "Vender Cartas TCG | Motor de Buylist Oficial TapTrade",
  description:
    "Vende tus cartas Magic: The Gathering, Pokémon y TCGs a tiendas oficiales en Chile. Revisa las listas de compra (Buylist) en vivo y recibe pago en efectivo o crédito en tienda con saldo adicional.",
};

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
    <main className="min-h-screen bg-[#0A0D14] text-white pt-28 md:pt-36 pb-20">
      <VenderCartasClient initialItems={buylistItems} initialStores={stores} />
    </main>
  );
}
