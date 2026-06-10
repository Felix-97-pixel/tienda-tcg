import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { Metadata } from "next";
import { API_URL } from "@/utils/api";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> {
  const { subdomain } = await params;
  return {
    title: `Tienda ${subdomain} | TapTrade`,
    description: `Catálogo de productos de ${subdomain}`,
  };
}

export default async function DealerStorePage({ params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  // Obtener el ID de la tienda por subdominio
  let storeId = null;
  let storeName = null;
  let storeLogo = null;
  
  try {
    const res = await fetch(`${API_URL}/stores/public/${subdomain}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const store = await res.json();
      storeId = store.id;
      storeName = store.name;
      storeLogo = store.logoUrl;
    }
  } catch (error) {
    console.error("Error fetching store:", error);
  }

  if (!storeId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Tienda no encontrada</h1>
        <p className="text-gray-4">La tienda "{subdomain}" no existe o fue eliminada.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#1a1d24] py-8 border-b border-white/5">
        <div className="container mx-auto px-4 flex items-center gap-6">
          {storeLogo ? (
            <img src={storeLogo} alt={storeName} className="w-24 h-24 rounded-2xl object-contain bg-white/5 border border-white/10 shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue to-purple-600 flex items-center justify-center border border-white/10 shadow-lg">
              <span className="text-3xl font-black text-white">{storeName?.substring(0, 2).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">{storeName}</h1>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full border border-green-500/20">
                Dealer Autorizado
              </span>
            </div>
          </div>
        </div>
      </div>
      <ShopWithSidebar storeId={storeId} />
    </>
  );
}
