import React from "react";
import ShopWithSidebar from "@/app/(site)/(pages)/shop-with-sidebar/_components";
import { API_URL } from "@/utils/api";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ subdomain: string }> }) {
  const resolvedParams = await params;
  try {
    const res = await fetch(`${API_URL}/stores/public/${resolvedParams.subdomain}`, { cache: 'no-store' });
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
    const res = await fetch(`${API_URL}/stores/public/${resolvedParams.subdomain}`, { cache: 'no-store' });
    if (!res.ok) {
      return notFound();
    }
    store = await res.json();
  } catch (error) {
    return notFound();
  }

  const s = (store.settings || []).reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const displayDesc = s.description || store.description || `Explora nuestro inventario en vivo de cartas TCG. Añade productos al carrito y consolida tu envío de forma segura a través de TapTrade.`;

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
              {displayDesc}
            </p>

            {/* Social Media and Contact */}
            {store.settings && store.settings.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4 items-center justify-center md:justify-start">
                <>
                      {s.address && (
                        <a 
                          href={store.latitude && store.longitude ? `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 bg-blue/10 text-blue rounded-lg border border-blue/20 hover:bg-blue hover:text-white transition"
                          title="Ver ubicación en Google Maps"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </a>
                      )}
                      {s.email && (
                        <a href={`mailto:${s.email}`} className="group p-1.5 bg-white/5 text-gray-5 rounded-lg border border-white/10 hover:bg-white transition" title={s.email}>
                          <svg className="group-hover:text-[#000000] transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </a>
                      )}
                      {s.whatsapp && (
                        <a href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#25D366]/10 text-[#25D366] rounded-lg border border-[#25D366]/20 hover:bg-[#25D366] hover:text-white transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        </a>
                      )}
                      {s.facebook && (
                        <a href={s.facebook} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#1877F2]/10 text-[#1877F2] rounded-lg border border-[#1877F2]/20 hover:bg-[#1877F2] hover:text-white transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </a>
                      )}
                      {s.instagram && (
                        <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#E4405F]/10 text-[#E4405F] rounded-lg border border-[#E4405F]/20 hover:bg-[#E4405F] hover:text-white transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                      )}
                      {s.twitch && (
                        <a href={s.twitch} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-[#9146FF]/10 text-[#9146FF] rounded-lg border border-[#9146FF]/20 hover:bg-[#9146FF] hover:text-white transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"></path></svg>
                        </a>
                      )}
                      {s.website && (
                        <a href={s.website} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-blue/10 text-blue rounded-lg border border-blue/20 hover:bg-blue hover:text-white transition">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        </a>
                      )}
                    </>
              </div>
            )}
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
