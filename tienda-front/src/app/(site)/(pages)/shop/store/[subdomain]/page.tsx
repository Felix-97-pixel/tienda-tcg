import React from "react";
import { API_URL } from "@/utils/api";
import { notFound } from "next/navigation";
import TcgStoreHero from "./_components/TcgStoreHero";
import TcgStoreContainer from "./_components/TcgStoreContainer";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const resolvedParams = await params;
  try {
    const res = await fetch(`${API_URL}/stores/public/${resolvedParams.subdomain}`, { cache: "no-store" });
    if (!res.ok) return { title: "Tienda no encontrada" };
    const store = await res.json();
    return {
      title: `${store.name} | Vitrina TCG TapTrade`,
      description:
        store.description ||
        `Explora el catálogo oficial de ${store.name} en TapTrade. Cartas singles, sellados y accesorios con envíos a todo Chile.`,
    };
  } catch {
    return { title: "Tienda no encontrada" };
  }
}

const StoreProfilePage = async ({ params }: { params: Promise<{ subdomain: string }> }) => {
  const resolvedParams = await params;
  let store: any = null;

  try {
    const res = await fetch(`${API_URL}/stores/public/${resolvedParams.subdomain}`, { cache: "no-store" });
    if (!res.ok) {
      return notFound();
    }
    store = await res.json();
  } catch (error) {
    return notFound();
  }

  return (
    <main className="bg-[#0A0D14] min-h-screen text-white">
      {/* TCG Store Hero with trust indicators, courier badges, and physical pickup data */}
      <TcgStoreHero store={store} />

      {/* TCG Store Container with Sales Inventory & Buylist tabs */}
      <TcgStoreContainer store={store} />
    </main>
  );
};

export default StoreProfilePage;
