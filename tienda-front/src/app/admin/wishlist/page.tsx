"use client";
import React from "react";
import { useAppSelector } from "@/redux/store";
import UpsellBanner from "@/app/admin/_components/UpsellBanner";
import { useWishlist } from "@/app/admin/_components/Wishlist/hooks/useWishlist";

export default function AdminWishlist() {
  const { features } = useAppSelector((state) => state.authReducer);
  const { loading, filter, setFilter, kpis, filteredProducts } = useWishlist();

  if (!features.includes("addon:radar")) {
    return (
      <div className="p-6 pb-24">
        <UpsellBanner featureName="Radar de Demanda" />
      </div>
    );
  }

  const { totalSalesPotential, missedOpportunities, trendingProduct } = kpis;

  return (
    <div className="space-y-6 pb-24 text-white">
      <div className="flex flex-col gap-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red">Radar de Demanda</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Productos Deseados</h1>
        <p className="text-white/40 text-xs max-w-2xl">
          Descubre cuáles son las cartas y productos más guardados en las listas de deseos de los clientes. Utiliza esta información para saber qué inventario reponer o qué cartas están en tendencia.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Potencial de Ventas</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">${totalSalesPotential.toLocaleString('es-CL')}</h3>
          </div>
          <p className="text-xs text-white/40 mt-2">Suma de productos guardados</p>
        </div>

        <div className="bg-[#0E121B] border border-red/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-red/10 rounded-full blur-2xl group-hover:bg-red/20 transition-all duration-500"></div>
          <p className="text-xs font-bold uppercase tracking-wider mb-2 text-red">Oportunidades Perdidas</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">${missedOpportunities.toLocaleString('es-CL')}</h3>
          </div>
          <p className="text-xs text-red/60 mt-2">Productos agotados en wishlist</p>
        </div>

        <div className="bg-[#0E121B] border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden flex items-center justify-between group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-amber-400 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
              <span>En Tendencia</span>
            </p>
            {trendingProduct ? (
              <div>
                <h3 className="text-base font-black text-white truncate max-w-[150px]">{trendingProduct.name}</h3>
                <p className="text-xs text-amber-400/80 mt-1 font-medium">{trendingProduct.wishlistCount} usuarios lo desean</p>
              </div>
            ) : (
              <h3 className="text-sm font-bold text-white/40">Sin datos</h3>
            )}
          </div>
          {trendingProduct?.imageUrl && (
            <img src={trendingProduct.imageUrl} alt={trendingProduct.name} className="w-16 h-24 object-cover rounded-xl shadow-md border border-white/10 relative z-10" />
          )}
        </div>
      </div>

      <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-xl overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between bg-[#090C14] gap-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            Ranking de Wishlist
          </h2>
          
          <div className="flex bg-[#080B12] p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-gradient-to-r from-red-dark to-red text-white shadow-md shadow-red/25 ring-1 ring-white/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('INSTOCK')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'INSTOCK' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/40' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              En Stock
            </button>
            <button 
              onClick={() => setFilter('OUTOFSTOCK')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'OUTOFSTOCK' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-300/40' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              Agotados
            </button>
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-[#090C14] border-b border-white/10 text-[11px] uppercase font-black tracking-wider text-white/50">
              <tr>
                <th className="px-6 py-4 font-bold">Producto</th>
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold text-center">Estado</th>
                <th className="px-6 py-4 font-bold text-right">Precio Ref.</th>
                <th className="px-6 py-4 font-bold text-center">Veces Guardado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    Cargando ranking...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40 text-xs">
                    No se encontraron productos para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-[#080B12] rounded-lg flex-shrink-0 overflow-hidden border border-white/10 relative">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 font-bold">Sin Img</div>
                          )}
                          {index < 3 && filter === 'ALL' && (
                            <div className="absolute top-0 right-0 bg-red text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl">
                              #{index + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white max-w-[200px] truncate">{product.name}</div>
                          {product.cardDetail?.expansion && (
                            <div className="text-xs text-white/40 mt-0.5">{product.cardDetail.expansion}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white/50 text-xs font-medium">
                      {product.category?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase">
                          En Stock ({product.stockCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red/10 text-red border border-red/30 px-2.5 py-1 rounded-full font-bold text-[10px] uppercase">
                          Agotado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {product.inStock ? (
                        <div>
                          <div className="font-bold text-white">${(product.storePrice || 0).toLocaleString('es-CL')}</div>
                          <div className="text-[10px] text-white/40">Tu Precio</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-white/60">${(product.marketPrice || 0).toLocaleString('es-CL')}</div>
                          <div className="text-[10px] text-white/40">Mercado</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 bg-red/10 text-red border border-red/30 px-3 py-1.5 rounded-full font-black text-xs">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                        {product.wishlistCount}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
