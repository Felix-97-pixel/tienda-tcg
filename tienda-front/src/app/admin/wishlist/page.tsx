"use client";
import React from "react";
import { useAppSelector } from "@/redux/store";
import UpsellBanner from "@/components/Admin/UpsellBanner";
import { useWishlist } from "@/components/Admin/Wishlist/hooks/useWishlist";

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
    <div className="p-6 space-y-6 pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white">Productos Deseados</h1>
        <p className="text-gray-4 text-sm max-w-2xl">
          Descubre cuáles son las cartas y productos más guardados en las listas de deseos de los clientes. Utiliza esta información para saber qué inventario reponer o qué cartas están en tendencia.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-[#0f1115] border border-white/5 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500"></div>
          <p className="text-sm font-bold text-gray-4 uppercase tracking-wider mb-2">Potencial de Ventas</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">${totalSalesPotential.toLocaleString('es-CL')}</h3>
          </div>
          <p className="text-xs text-gray-5 mt-2">Suma de productos guardados</p>
        </div>

        <div className="bg-[#0f1115] border border-red-500/10 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500"></div>
          <p className="text-sm font-bold text-gray-4 uppercase tracking-wider mb-2 text-red-400">Oportunidades Perdidas</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white">${missedOpportunities.toLocaleString('es-CL')}</h3>
          </div>
          <p className="text-xs text-red-500/60 mt-2">Productos agotados en wishlist</p>
        </div>

        <div className="bg-[#0f1115] border border-orange-500/10 rounded-2xl p-6 shadow-lg relative overflow-hidden flex items-center justify-between group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-500"></div>
          <div>
            <p className="text-sm font-bold text-gray-4 uppercase tracking-wider mb-2 text-orange-400 flex items-center gap-2">
              <span>🔥 Trending</span>
            </p>
            {trendingProduct ? (
              <div>
                <h3 className="text-lg font-black text-white truncate max-w-[150px]">{trendingProduct.name}</h3>
                <p className="text-xs text-orange-500/80 mt-1">{trendingProduct.wishlistCount} usuarios lo desean</p>
              </div>
            ) : (
              <h3 className="text-lg font-bold text-gray-5">Sin datos</h3>
            )}
          </div>
          {trendingProduct?.imageUrl && (
            <img src={trendingProduct.imageUrl} alt={trendingProduct.name} className="w-16 h-24 object-cover rounded shadow-md border border-white/10 relative z-10" />
          )}
        </div>
      </div>

      <div className="bg-[#0f1115] border border-white/5 rounded-2xl shadow-xl overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between bg-[#1a1d24]/5 backdrop-blur-sm gap-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            Ranking de Wishlist
          </h2>
          
          <div className="flex bg-[#1a1d24] p-1 rounded-xl border border-white/5">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-[#2a2d36] text-white shadow' : 'text-gray-5 hover:text-gray-3'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setFilter('INSTOCK')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'INSTOCK' ? 'bg-[#2a2d36] text-white shadow' : 'text-gray-5 hover:text-gray-3'}`}
            >
              En Stock
            </button>
            <button 
              onClick={() => setFilter('OUTOFSTOCK')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'OUTOFSTOCK' ? 'bg-[#2a2d36] text-white shadow' : 'text-gray-5 hover:text-gray-3'}`}
            >
              Agotados
            </button>
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-3">
            <thead className="bg-[#1a1d24]/5 text-xs uppercase text-gray-4">
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
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-5">
                    <svg className="animate-spin h-8 w-8 mx-auto text-purple-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando ranking...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-5">
                    No se encontraron productos para el filtro seleccionado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-[#1a1d24]/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-gray-800 rounded flex-shrink-0 overflow-hidden border border-white/10 relative">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">No Img</div>
                          )}
                          {index < 3 && filter === 'ALL' && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-bl">
                              #{index + 1}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white max-w-[200px] truncate">{product.name}</div>
                          {product.cardDetail?.expansion && (
                            <div className="text-xs text-gray-5 mt-0.5">{product.cardDetail.expansion}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-4 text-xs">
                      {product.category?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {product.inStock ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded font-bold text-[10px] uppercase">
                          En Stock ({product.stockCount})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded font-bold text-[10px] uppercase">
                          Agotado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {product.inStock ? (
                        <div>
                          <div className="font-bold text-white">${(product.storePrice || 0).toLocaleString('es-CL')}</div>
                          <div className="text-[10px] text-gray-5">Tu Precio</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-gray-3">${(product.marketPrice || 0).toLocaleString('es-CL')}</div>
                          <div className="text-[10px] text-gray-5">Mercado</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-full font-bold">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
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
