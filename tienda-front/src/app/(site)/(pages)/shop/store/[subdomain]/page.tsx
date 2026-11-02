import React, { cache } from "react";
import { API_URL } from "@/utils/api";
import { notFound } from "next/navigation";
import TcgStoreHero from "./_components/TcgStoreHero";
import TcgStoreContainer from "./_components/TcgStoreContainer";

// React.cache deduplica la llamada compartida entre generateMetadata y el render de la página
const getStoreData = cache(async (subdomain: string) => {
  try {
    const res = await fetch(`${API_URL}/stores/public/${subdomain}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const resolvedParams = await params;
  const store = await getStoreData(resolvedParams.subdomain);
  if (!store) return { title: "Tienda no encontrada" };
  return {
    title: `${store.name} | Vitrina TCG TapTrade`,
    description:
      store.description ||
      `Explora el catálogo oficial de ${store.name} en TapTrade. Cartas singles, sellados y accesorios con envíos a todo Chile.`,
  };
}

const StoreProfilePage = async ({ params }: { params: Promise<{ subdomain: string }> }) => {
  const resolvedParams = await params;
  const store = await getStoreData(resolvedParams.subdomain);
  if (!store) {
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
