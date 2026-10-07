"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { selectCartItems, selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { RootState } from "@/redux/store";

import { formatPrice } from "@/utils/currency";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-dummy', { locale: 'es-CL' });

type BillingData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const CheckoutWebpay = () => {
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectTotalPrice);
  const { isAuthenticated } = useSelector((s: RootState) => s.authReducer);
  const currency = useSelector((state: any) => state.currencyReducer);
  const dispatch = useDispatch();
  const router = useRouter();

  const [billing, setBilling] = useState<BillingData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shippingProviders, setShippingProviders] = useState<any[]>([]);
  const [selectedProvidersByStore, setSelectedProvidersByStore] = useState<Record<string, any>>({});
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});

  // Group cart items by store
  const itemsByStore = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    cartItems.forEach((item) => {
      const sId = item.storeId || "unknown";
      if (!groups[sId]) groups[sId] = [];
      groups[sId].push(item);
    });
    return groups;
  }, [cartItems]);
  const storeIds = React.useMemo(() => Object.keys(itemsByStore), [itemsByStore]);

  // Fetch store names
  useEffect(() => {
    storeIds.forEach((id) => {
      if (id !== "unknown" && !storeNames[id]) {
        fetch(`${API_URL}/stores/public-by-id/${id}`, { credentials: "include" })
          .then(async (res) => {
            const text = await res.text();
            try {
              const data = JSON.parse(text);
              if (res.ok) {
                setStoreNames((prev) => ({ ...prev, [id]: data.name || "Sin Nombre" }));
              } else {
                setStoreNames((prev) => ({ ...prev, [id]: `API Error: ${res.status} - ${text.substring(0, 50)}` }));
              }
            } catch (e) {
              setStoreNames((prev) => ({ ...prev, [id]: `Parse Error: ${text.substring(0, 50)}` }));
            }
          })
          .catch((err) => {
            setStoreNames((prev) => ({ ...prev, [id]: `Network Error: ${err.message}` }));
          });
      }
    });
  }, [storeIds]);

  // Carga dinámica de proveedores de envío
  useEffect(() => {
    fetch(`${API_URL}/shipping/providers`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setShippingProviders(data);
        }
      })
      .catch((err) => console.error("Error al cargar proveedores de envío:", err?.message || err));
  }, []);

  // Pre-seleccionar envío por defecto para cada tienda
  useEffect(() => {
    if (shippingProviders.length > 0) {
      let changed = false;
      const initial: Record<string, any> = {};
      storeIds.forEach(sId => {
         if (!selectedProvidersByStore[sId]) {
            initial[sId] = shippingProviders[0];
            changed = true;
         }
      });
      if (changed) {
         setSelectedProvidersByStore(prev => ({...prev, ...initial}));
      }
    }
  }, [shippingProviders, storeIds]);

  const totalShippingCost = React.useMemo(() => {
    return storeIds.reduce((sum, sId) => {
       const provider = selectedProvidersByStore[sId];
       return sum + (provider ? Number(provider.price) : 0);
    }, 0);
  }, [storeIds, selectedProvidersByStore]);

  // Auto-fill from saved profile
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(`${API_URL}/users/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((profile) => {
        setBilling((prev) => ({
          ...prev,
          name: prev.name || profile.name || "",
          email: prev.email || profile.email || "",
          phone: prev.phone || profile.phone || "",
          address: prev.address || profile.address || "",
          city: prev.city || profile.city || "",
        }));
      })
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBilling((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaymentSubmit = async (paymentFormData: any) => {
    setError(null);

    if (!billing.name || !billing.email) {
      setError("Por favor completa tu nombre y correo electrónico en los datos de contacto.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Tu carrito está vacío.");
      return;
    }
    const missingShipping = storeIds.find(sId => !selectedProvidersByStore[sId]);
    if (missingShipping) {
      setError("Debes seleccionar un método de envío para cada tienda.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: billing.email,
        name: billing.name,
        phone: billing.phone,
        address: billing.address,
        city: billing.city,
        notes: billing.notes,
        currency: currency.code,
        exchangeRate: currency.exchangeRate,
        storeShippingProviders: storeIds.reduce((acc, sId) => {
          acc[sId] = selectedProvidersByStore[sId].id;
          return acc;
        }, {} as Record<string, string>),
        items: cartItems.map((item) => ({
          productId: String(item.id),
          inventoryItemId: item.inventoryItemId ?? null,
          productName: item.title,
          quantity: item.quantity,
          unitPrice: item.discountedPrice,
        })),
        // Datos de Mercado Pago
        token: paymentFormData.token,
        issuer_id: paymentFormData.issuer_id,
        payment_method_id: paymentFormData.payment_method_id,
        installments: paymentFormData.installments,
      };

      const res = await fetch(`${API_URL}/payments/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message ?? "Error al procesar el pago");
      }

      const data = await res.json();
      
      // Redirigir según el estado del pago
      const status = data.approved ? 'success' : 'failed';
      router.push(`/checkout/result?status=${status}&orderId=${data.orderId}`);
      
    } catch (err: any) {
      setError(err.message ?? "Error desconocido al procesar el pago");
      setLoading(false);
    }
  };

  const initialization = {
    amount: total + (totalShippingCost / currency.exchangeRate),
    payer: {
      email: billing.email || "test@test.com" // Provide fallback or actual email
    }
  };

  const customization = {
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
    },
  };

  return (
    <>
      <Breadcrumb title="Checkout" pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-[#222630]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* ─── Formulario ─── */}
              <div className="lg:max-w-[670px] w-full">
                <h2 className="font-medium text-white text-xl sm:text-2xl mb-5.5">
                  Datos de contacto
                </h2>

                <div className="bg-[#1a1d24] shadow-1 rounded-[10px] p-4 sm:p-8.5">
                  {/* Nombre */}
                  <div className="mb-5">
                    <label htmlFor="name" className="block mb-2.5 font-medium text-white">
                      Nombre completo <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={billing.name}
                      onChange={handleChange}
                      placeholder="Ej: Juan Pérez"
                      className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-5">
                    <label htmlFor="email" className="block mb-2.5 font-medium text-white">
                      Correo electrónico <span className="text-red">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={billing.email}
                      onChange={handleChange}
                      placeholder="ejemplo@correo.com"
                      className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 mb-5">
                    {/* Teléfono */}
                    <div className="w-full">
                      <label htmlFor="phone" className="block mb-2.5 font-medium text-white">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={billing.phone}
                        onChange={handleChange}
                        placeholder="+56 9 1234 5678"
                        className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>

                    {/* Ciudad */}
                    <div className="w-full">
                      <label htmlFor="city" className="block mb-2.5 font-medium text-white">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={billing.city}
                        onChange={handleChange}
                        placeholder="Santiago"
                        className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>

                  {/* Dirección */}
                  <div className="mb-5">
                    <label htmlFor="address" className="block mb-2.5 font-medium text-white">
                      Dirección de envío
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={billing.address}
                      onChange={handleChange}
                      placeholder="Calle, número, depto..."
                      className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  {/* Notas */}
                  <div>
                    <label htmlFor="notes" className="block mb-2.5 font-medium text-white">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={billing.notes}
                      onChange={handleChange}
                      placeholder="Instrucciones especiales de entrega..."
                      className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>

                {/* Banner MP */}
                <div className="bg-[#1a1d24] shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <h3 className="font-medium text-xl text-white mb-4">
                    Método de pago
                  </h3>
                  <div className="flex items-center gap-4 p-4 border-2 border-[#009EE3] rounded-xl bg-[#009EE3]/5">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-10 bg-[#009EE3] rounded-md flex items-center justify-center">
                        <span className="text-white text-xs font-bold tracking-tight">MP</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Mercado Pago</p>
                      <p className="text-sm text-gray-4">
                        Pago seguro con tarjeta de crédito o débito.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {/* Render Mercado Pago Brick */}
                    {total > 0 && shippingProviders.length > 0 && (
                      <Payment
                        initialization={initialization}
                        customization={customization as any}
                        onSubmit={async (param) => {
                          await handlePaymentSubmit(param.formData);
                        }}
                      />
                    )}
                  </div>

                  <p className="mt-3 text-xs text-gray-4 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                    Transacción segura con Mercado Pago
                  </p>
                </div>
              </div>

              {/* ─── Resumen ─── */}
              <div className="max-w-[455px] w-full">
                <div className="bg-[#1a1d24] shadow-1 rounded-[10px]">
                  <div className="border-b border-white/10 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-white">Tu pedido</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* Header */}
                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                      <span className="font-medium text-white">Producto</span>
                      <span className="font-medium text-white">Subtotal</span>
                    </div>

                    {/* Items por tienda */}
                    {Object.entries(itemsByStore).map(([sId, items]) => (
                      <div key={sId} className="mb-6 last:mb-0 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-gray-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-semibold text-white/90 text-sm">{storeNames[sId] || `Tienda (ID: ${sId})`}</span>
                        </div>
                        
                        <div className="bg-[#111318] rounded border border-white/5 p-3 mb-4">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.imgs?.thumbnails?.[0] && (
                                  <Image src={item.imgs.thumbnails[0]} alt={item.title} width={36} height={36} className="rounded object-cover flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="text-white text-xs font-medium truncate">{item.title}</p>
                                  <p className="text-gray-4 text-[10px]">× {item.quantity}</p>
                                </div>
                              </div>
                              <p className="text-white text-right text-xs flex-shrink-0 font-medium">
                                {formatPrice(item.discountedPrice * item.quantity, currency)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Envío para esta tienda */}
                        <div className="flex justify-between items-start gap-4">
                          <span className="font-medium text-gray-4 text-xs mt-1">Opciones de envío</span>
                          <div className="flex flex-col gap-2 items-end">
                            {shippingProviders.map((provider) => (
                              <label key={provider.id} className="flex items-center gap-2 cursor-pointer w-full justify-end select-none">
                                <input
                                  type="radio"
                                  name={`shipping_${sId}`}
                                  value={provider.name}
                                  checked={selectedProvidersByStore[sId]?.id === provider.id}
                                  onChange={() => setSelectedProvidersByStore(prev => ({...prev, [sId]: provider}))}
                                  className="w-3.5 h-3.5 text-blue border-white/10 focus:ring-blue cursor-pointer flex-shrink-0"
                                />
                                <ShippingBadge name={provider.name} size="sm" />
                                <div className="text-right font-semibold text-green-500 text-xs min-w-[70px] flex-shrink-0">
                                  {formatPrice(Number(provider.price) / currency.exchangeRate, currency)}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Subtotal Productos */}
                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                      <p className="font-medium text-white">Subtotal (Productos)</p>
                      <p className="font-semibold text-white">
                        {formatPrice(total, currency)}
                      </p>
                    </div>

                    {/* Total Envíos */}
                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                      <p className="font-medium text-white">Total Envíos</p>
                      <p className="font-semibold text-white">
                        {formatPrice(totalShippingCost / currency.exchangeRate, currency)}
                      </p>
                    </div>

                    {/* Total Final */}
                    <div className="flex items-center justify-between pt-5">
                      <p className="font-semibold text-lg text-white">Total Final</p>
                      <p className="font-bold text-xl text-green-500">
                        {formatPrice(total + (totalShippingCost / currency.exchangeRate), currency)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Botón pagar removido porque Brick lo provee */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CheckoutWebpay;
