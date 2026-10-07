"use client";
import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { Product } from "@/types/product";
import { InventoryItem } from "@/types/inventoryItem";

import { API_URL } from "@/utils/api";
import { calculateCommissions } from "@/utils/commissions";
import { useToast } from "@/hooks/useToast";
import Loader from "@/components/ui/Loader";

const ShopDetails = () => {
  const dispatch = useDispatch();
  
  const params = useParams();
  const slug = params?.slug as string;
  const [productId, setProductId] = useState<string | null>(null);

  const { showToast } = useToast();

  const productFromStorage = useAppSelector(
    (state) => state.productDetailsReducer.value
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [globalRates, setGlobalRates] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/currencies`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setGlobalRates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const fetchProduct = async (identifier: string) => {
      try {
        const [res, curRes] = await Promise.all([
          // Si tiene un '-' largo (uuid), intentamos buscar por id por compatibilidad
          // pero lo ideal es buscar siempre por slug.
          fetch(`${API_URL}/products/by-slug/${identifier}`),
          fetch(`${API_URL}/currencies`)
        ]);
        
        if (curRes.ok) {
          setGlobalRates(await curRes.json());
        }

        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setProductId(data.id);
        }
      } catch (e) {}
    };

    if (slug) {
      if (productFromStorage && productFromStorage.slug === slug) {
        setProduct(productFromStorage as Product);
        setProductId(productFromStorage.id);
      } else {
        fetchProduct(slug);
      }
    } else {
      if (productFromStorage && (productFromStorage.id !== "" || productFromStorage.title !== "")) {
        setProduct(productFromStorage as Product);
      } else {
        const alreadyExist = localStorage.getItem("productDetails");
        if (alreadyExist) {
          try {
            const parsed = JSON.parse(alreadyExist);
            if (parsed && (parsed.id || parsed.title)) setProduct(parsed);
          } catch (e) {}
        }
      }
    }
  }, [productFromStorage, slug]);

  useEffect(() => {
    if (isMounted && product) {
      localStorage.setItem("productDetails", JSON.stringify(product));
    }
  }, [product, isMounted]);

  
  const getFinalPrice = (item: InventoryItem | any) => {
    // 1. Obtener la tasa de cambio
    const gameId = (product?.cardDetail as any)?.gameId || (product as any)?.gameId;
    const globalRate = globalRates.find((r: any) => r.gameId === gameId);
    let exchangeRate = globalRate ? Number(globalRate.rate) : 1000;

    if (gameId && item.store?.gameExchangeRates) {
      const customRate = item.store.gameExchangeRates.find((r: any) => r.gameId === gameId);
      if (customRate) {
        exchangeRate = Number(customRate.rate);
      }
    }

    const priceInCLP = Number(item.price) * exchangeRate;

    // 2. Aplicar comisiones
    const storePlan = item.store?.subscriptionPlans?.[0];
    const rate = storePlan ? Number(storePlan.commissionRate) : 0.05;
    return calculateCommissions(priceInCLP, rate).gross;
  };

  const handleAddToCart = (item: InventoryItem, qty: number) => {
    if (!product) return;
    const cartItem = {
      id: item.id,
      productId: product.id,
      title: product.title || product.name,
      price: getFinalPrice(item),
      discountedPrice: getFinalPrice(item),
      quantity: qty,
      stock: item.stock,
      status: "available",
      imgs: product.imgs || {
        thumbnails: [product.imageUrl || "/images/products/product-1-bg-1.png"],
        previews: [product.imageUrl || "/images/products/product-1-bg-1.png"],
      },
      storeId: item.store?.id,
      storeName: item.store?.name,
      language: item.language?.name || item.languageId,
      condition: item.condition_rel?.displayName || item.condition_rel?.name || (typeof item.condition === 'object' ? (item.condition as any)?.displayName || (item.condition as any)?.name : item.condition),
      finish: item.finish?.name || item.finishId,
      inventoryItemId: item.id,
    };
    dispatch(addItemToCart(cartItem));
    showToast(`${qty}x ${product.title || product.name} agregado al carrito`, "success");
  };

  if (!isMounted) return null;

  if (!product || (product.title === "" && !product.name)) {
    return <Loader text="Cargando producto..." />;
  }

  // Helper variables
  const items = product.items || [];
  const lowestPriceItem = items.length > 0 ? [...items].sort((a, b) => getFinalPrice(a) - getFinalPrice(b))[0] : null;
  const imageSrc = product.imgs?.previews?.[0] || product.imageUrl || "/images/products/product-1-bg-1.png";

  return (
    <div className="bg-[#111318] min-h-screen pb-20">
      <Breadcrumb 
        title={product.title || product.name || "Detalles"} 
        subtitle={typeof product.category === 'object' ? product.category?.name : (product.category || "General")}
        pages={["shop", "details"]} 
      />

      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pt-10">
        


        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          
          {/* Column 1: Image */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="bg-[#1a1d24] p-4 rounded-xl shadow-1 w-full flex items-center justify-center">
              <Image 
                src={imageSrc}
                alt={product.title || product.name || "Product"}
                width={300}
                height={420}
                className="rounded-lg object-contain"
                unoptimized={imageSrc.includes("scryfall")}
              />
            </div>
          </div>

          {/* Column 2: Product Details */}
          <div className="lg:col-span-4 text-white bg-[#1a1d24] p-6 rounded-xl shadow-1">
            <h2 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">Product Details</h2>
            <p className="text-sm text-gray-3 mb-6 leading-relaxed">
              {product.description || "No description available for this item."}
            </p>
            
            <ul className="space-y-3 text-sm">
              <li className="flex"><span className="font-semibold w-32">Rarity:</span> <span className="text-gray-3">{product.cardDetail?.rarity || "N/A"}</span></li>
              <li className="flex"><span className="font-semibold w-32">Number:</span> <span className="text-gray-3">{product.cardDetail?.collectorNum || "N/A"}</span></li>
              <li className="flex"><span className="font-semibold w-32">Expansion:</span> <span className="text-gray-3">{product.cardDetail?.expansion || "N/A"}</span></li>
              {product.cardDetail?.game && (
                <li className="flex"><span className="font-semibold w-32">Game:</span> <span className="text-gray-3">{product.cardDetail.game}</span></li>
              )}
            </ul>
          </div>

          {/* Column 3: Featured Listing */}
          <div className="lg:col-span-4">
            {lowestPriceItem ? (
              <div className="bg-[#1a1d24] border-2 border-blue/30 rounded-xl p-6 shadow-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{(lowestPriceItem.condition_rel as any)?.displayName || lowestPriceItem.condition_rel?.name || (typeof lowestPriceItem.condition === 'object' ? (lowestPriceItem.condition as any)?.displayName || (lowestPriceItem.condition as any)?.name : lowestPriceItem.condition) || "Near Mint"} {lowestPriceItem.finish?.name || ""}</h3>
                    <div className="text-2xl font-bold text-green-500 mt-1">${Math.round(getFinalPrice(lowestPriceItem)).toLocaleString('es-CL')}</div>
                    <p className="text-xs text-gray-4 mt-1">Shipping: Included</p>
                  </div>
                </div>
                
                <div className="mb-5 text-sm text-gray-3">
                  Sold by <span className="text-blue font-medium">{lowestPriceItem.store?.name || "TiendaTapTrade"}</span>
                </div>

                <div className="flex gap-3 mb-4">
                  <select 
                    id="featured-qty"
                    className="bg-[#111318] border border-white/10 rounded-md text-white pl-3 pr-8 py-2 outline-none w-20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[position:right_0.75rem_center] bg-no-repeat"
                  >
                    {[...Array(Math.min(10, lowestPriceItem.stock))].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => {
                      const qty = parseInt((document.getElementById("featured-qty") as HTMLSelectElement).value);
                      handleAddToCart(lowestPriceItem, qty);
                    }}
                    className="flex-1 bg-blue hover:bg-blue-dark text-white font-semibold py-2 rounded-md transition-colors"
                  >
                    Agregar al carrito
                  </button>
                </div>

                <div className="text-center border-t border-white/10 pt-4 mt-4">
                  <button 
                    onClick={() => document.getElementById("listings-table")?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-sm font-medium text-white border border-white/20 hover:border-white/50 rounded-md py-2 px-4 w-full transition-colors"
                  >
                    View {items.length} Other Listing{items.length !== 1 ? 's' : ''}
                    <br/><span className="text-xs text-gray-4 font-normal">As low as ${Math.round(getFinalPrice(lowestPriceItem)).toLocaleString('es-CL')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#1a1d24] rounded-xl p-6 shadow-1 text-center flex flex-col items-center justify-center h-full">
                <p className="text-gray-4 mb-2">No listings available</p>
                <p className="text-sm text-gray-5">Be the first to list this item!</p>
              </div>
            )}
          </div>
        </div>

        {/* Listings Section */}
        <div id="listings-table" className="bg-[#1a1d24] rounded-xl shadow-1 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-2xl font-bold text-white">{items.length} Listings</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-4 text-sm uppercase">
                  <th className="py-3 px-4 font-medium">Price</th>
                  <th className="py-3 px-4 font-medium">Condition</th>
                  <th className="py-3 px-4 font-medium">Seller</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  [...items].sort((a, b) => getFinalPrice(a) - getFinalPrice(b)).map((item, index) => (
                    <tr key={item.id || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-lg text-green-500">${Math.round(getFinalPrice(item)).toLocaleString('es-CL')}</div>
                        <div className="text-xs text-gray-5 mt-1">Shipping: Included</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white font-medium">{(item.condition_rel as any)?.displayName || item.condition_rel?.name || (typeof item.condition === 'object' ? (item.condition as any)?.displayName || (item.condition as any)?.name : item.condition) || "Near Mint"}</div>
                        <div className="text-xs text-gray-4 mt-1">{item.language?.name || item.languageId || "English"} • {item.finish?.name || item.finishId || "Normal"}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-blue font-medium">{item.store?.name || "TiendaTapTrade"}</div>
                        <div className="text-xs text-yellow-500 mt-1">★ 100% (1000+ Sales)</div>
                      </td>
                      <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                        <select 
                          id={`qty-${item.id}`}
                          className="bg-[#111318] border border-white/10 rounded-md text-white pl-3 pr-8 py-2 outline-none w-16 text-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1em_1em] bg-[position:right_0.5rem_center] bg-no-repeat"
                        >
                          {[...Array(Math.min(10, item.stock))].map((_, i) => (
                            <option key={i+1} value={i+1}>{i+1}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            const qty = parseInt((document.getElementById(`qty-${item.id}`) as HTMLSelectElement).value);
                            handleAddToCart(item, qty);
                          }}
                          className="bg-blue hover:bg-blue-dark text-white font-semibold py-2 px-4 rounded-md transition-colors text-sm"
                        >
                          Agregar al carrito
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-gray-4">
                      No hay vendedores disponibles para este producto.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShopDetails;
