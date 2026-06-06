"use client";
import React, { useState, useEffect } from "react";
import MasterCatalogSearch from "@/components/SuperAdmin/MasterCatalogSearch";
import { API_URL } from "@/utils/api";

interface GlobalProduct {
  id: string;
  externalId: string | null;
  name: string;
  imageUrl: string | null;
  category: { name: string };
  cardDetail?: {
    expansion: string;
    rarity: string;
    attributes: string[];
  };
}

export default function CatalogPage() {
  const [globalProducts, setGlobalProducts] = useState<GlobalProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/global`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // asumiendo guardado en local o manejado por cookies
        },
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalProducts(data);
      }
    } catch (error) {
      console.error("Error fetching global products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white">Catálogo Maestro</h1>
        <p className="text-gray-4">Busca e inserta cartas oficiales a la base de datos global (TapMaster).</p>
      </div>

      <MasterCatalogSearch onProductAdded={fetchGlobalProducts} />

      <div className="bg-[#0f1115] border border-white/5 rounded-2xl shadow-xl overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#1a1d24]/5 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Cartas Base Globales
          </h2>
          <span className="text-sm text-gray-4">{globalProducts.length} cartas indexadas</span>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-3">
            <thead className="bg-[#1a1d24]/5 text-xs uppercase text-gray-4">
              <tr>
                <th className="px-6 py-4 font-bold">Carta</th>
                <th className="px-6 py-4 font-bold">Expansión</th>
                <th className="px-6 py-4 font-bold">Rareza</th>
                <th className="px-6 py-4 font-bold">Categoría</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
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
                    Cargando catálogo...
                  </td>
                </tr>
              ) : globalProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-5">
                    No hay cartas en el catálogo global. Utiliza el buscador para agregar algunas.
                  </td>
                </tr>
              ) : (
                globalProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-[#1a1d24]/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 bg-gray-800 rounded flex-shrink-0 overflow-hidden border border-white/10">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Img</div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{product.name}</div>
                          <div className="text-xs text-gray-5 font-mono mt-0.5">{product.externalId || "No ID"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-md text-xs font-medium">
                        {product.cardDetail?.expansion || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.cardDetail?.rarity || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-4">
                      {product.category?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-gray-4 hover:text-white transition-colors bg-[#1a1d24]/5 hover:bg-[#1a1d24]/10 px-3 py-1.5 rounded-lg text-xs font-medium">
                        Ver Detalles
                      </button>
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
