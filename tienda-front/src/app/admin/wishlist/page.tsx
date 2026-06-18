"use client";
import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { useAppSelector } from "@/redux/store";
import UpsellBanner from "@/components/Admin/UpsellBanner";

interface WishlistProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  wishlistCount: number;
  category: { name: string };
  cardDetail?: {
    expansion: string;
    rarity: string;
  };
}

export default function AdminWishlist() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { features } = useAppSelector((state) => state.authReducer);

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const fetchWishlistData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wishlist/count`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        showToast("No se pudo cargar la lista de deseos", "error");
      }
    } catch (error) {
      console.error("Error fetching wishlist counts:", error);
      showToast("Error de conexión al cargar la lista", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!features.includes("addon:radar")) {
    return (
      <div className="p-6 pb-24">
        <UpsellBanner featureName="Radar de Demanda" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white">Productos Deseados</h1>
        <p className="text-gray-4 text-sm max-w-2xl">
          Descubre cuáles son las cartas y productos más guardados en las listas de deseos de los clientes. Utiliza esta información para saber qué inventario reponer o qué cartas están en tendencia.
        </p>
      </div>

      <div className="bg-[#0f1115] border border-white/5 rounded-2xl shadow-xl overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#1a1d24]/5 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            Ranking de Wishlist
          </h2>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-3">
            <thead className="bg-[#1a1d24]/5 text-xs uppercase text-gray-4">
              <tr>
                <th className="px-6 py-4 font-bold">Producto</th>
                <th className="px-6 py-4 font-bold">Expansión</th>
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold text-center">Veces Guardado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-5">
                    <svg className="animate-spin h-8 w-8 mx-auto text-purple-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando ranking...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-5">
                    Aún no hay productos guardados por los clientes en sus listas de deseos.
                  </td>
                </tr>
              ) : (
                products.map((product, index) => (
                  <tr key={product.id} className="hover:bg-[#1a1d24]/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-gray-800 rounded flex-shrink-0 overflow-hidden border border-white/10 relative">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Img</div>
                          )}
                          {index < 3 && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl">
                              #{index + 1}
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-white max-w-[200px] truncate">{product.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.cardDetail?.expansion ? (
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-md text-xs font-medium">
                          {product.cardDetail.expansion}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-4">
                      {product.category?.name || "-"}
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
