import React, { cache } from "react";
import { API_URL } from "@/utils/api";
import { notFound } from "next/navigation";
import TcgStoreHero from "./_components/TcgStoreHero";
import TcgStoreContainer from "./_components/TcgStoreContainer";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("store");
  const resolvedParams = await params;
  const store = await getStoreData(resolvedParams.subdomain);
  if (!store) return { title: t("meta_not_found") };
  return {
    title: t("meta_title", { name: store.name }),
    description: store.description || t("meta_desc", { name: store.name }),
  };
}

const StoreProfilePage = async ({ params }: { params: Promise<{ subdomain: string }> }) => {
  const resolvedParams = await params;
  const store = await getStoreData(resolvedParams.subdomain);
  if (!store) {
    return notFound();
  }

  return (
    <main className="bg-[var(--tt-bg-canvas)] min-h-screen text-[var(--tt-text-main)] transition-colors">
      {/* TCG Store Hero with trust indicators, courier badges, and physical pickup data */}
      <TcgStoreHero store={store} />

      {/* TCG Store Container with Sales Inventory & Buylist tabs */}
      <TcgStoreContainer store={store} />
    </main>
  );
};

export default StoreProfilePage;
