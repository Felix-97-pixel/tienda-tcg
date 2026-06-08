import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { API_URL } from "@/utils/api";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const resolvedParams = await params;
  try {
    const res = await fetch(`${API_URL}/stores/public/${resolvedParams.subdomain}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: "Tienda no encontrada" };
    const store = await res.json();
    return {
      title: `${store.name} | TapTrade`,
      description: store.description || `Explora el catálogo oficial de ${store.name} en TapTrade.`,
    };
  } catch {
    return { title: "Tienda no encontrada" };
  }
}

const StoreProfilePage = async ({ params }: { params: Promise<{ subdomain: string }> }) => {
  const resolvedParams = await params;
  let store: any = null;

  try {
    const res = await fetch(`${API_URL}/stores/public/${resolvedParams.subdomain}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      return notFound();
    }
    store = await res.json();
  } catch (error) {
    return notFound();
  }

  return (
    <main className="bg-[#0f1115] min-h-screen">
      {/* Store Profile Banner */}
      <div className="w-full bg-[#111318] border-b border-white/5 relative overflow-hidden pt-[240px] md:pt-[160px] lg:pt-40 pb-12 lg:pb-16">
        {/* Subtle decorative gradients */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red to-orange"></div>
        <div className="absolute top-[-50%] left-[-10%] w-[30%] h-[150%] bg-red/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[#1a1d24] border border-white/10 shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden p-2">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={`Logo de ${store.name}`} className="w-full h-full object-contain rounded-xl" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-red/20 to-orange/20 rounded-xl flex items-center justify-center">
                <span className="text-4xl font-black text-white/50">{store.name.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1 mt-2">
            <div className="inline-block px-3 py-1 rounded-full bg-red/10 border border-red/20 text-red text-xs font-bold uppercase tracking-widest mb-3">
              Tienda Oficial
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              {store.name}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
              {store.description || `Explora nuestro inventario en vivo de cartas TCG. Añade productos al carrito y consolida tu envío de forma segura a través de TapTrade.`}
            </p>
          </div>
        </div>
      </div>

      {/* Catalog */}
      <div className="pt-8">
        <ShopWithSidebar storeId={store.id} />
      </div>
    </main>
  );
};

export default StoreProfilePage;
