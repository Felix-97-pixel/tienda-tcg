"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { selectCartItems, selectTotalPrice } from "@/redux/features/cart-slice";
import { RootState } from "@/redux/store";
import { formatPrice } from "@/utils/currency";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "TEST-dummy", { locale: "es-CL" });

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
                setStoreNames((prev) => ({ ...prev, [id]: data.name || "Tienda TapTrade" }));
              } else {
                setStoreNames((prev) => ({ ...prev, [id]: "Tienda TapTrade" }));
              }
            } catch (e) {
              setStoreNames((prev) => ({ ...prev, [id]: "Tienda TapTrade" }));
            }
          })
          .catch(() => {
            setStoreNames((prev) => ({ ...prev, [id]: "Tienda TapTrade" }));
          });
      }
    });
  }, [storeIds]);

  // Carga dinámica de proveedores de envío
  useEffect(() => {
    fetch(`${API_URL}/shipping/providers`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
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
      storeIds.forEach((sId) => {
        if (!selectedProvidersByStore[sId]) {
          initial[sId] = shippingProviders[0];
          changed = true;
        }
      });
      if (changed) {
        setSelectedProvidersByStore((prev) => ({ ...prev, ...initial }));
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
    const missingShipping = storeIds.find((sId) => !selectedProvidersByStore[sId]);
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
      const status = data.approved ? "success" : "failed";
      router.push(`/checkout/result?status=${status}&orderId=${data.orderId}`);
    } catch (err: any) {
      setError(err.message ?? "Error desconocido al procesar el pago");
      setLoading(false);
    }
  };

  const finalAmount = total + totalShippingCost / currency.exchangeRate;

  const initialization = {
    amount: Math.round(finalAmount),
    payer: {
      email: billing.email || "comprador@taptrade.cl",
    },
  };

  // Dark Vault custom Mercado Pago styling
  const customization = {
    visual: {
      style: {
        theme: "dark" as const,
        customVariables: {
          formBackgroundColor: "#0E121B",
          baseColor: "#E10E0E",
          baseColorFirstVariant: "#F23030",
          baseColorSecondVariant: "#C8102E",
          inputBackgroundColor: "#07090E",
          textPrimaryColor: "#FFFFFF",
          textSecondaryColor: "#9CA3AF",
          outlinePrimaryColor: "rgba(255, 255, 255, 0.12)",
          outlineSecondaryColor: "rgba(255, 255, 255, 0.2)",
          buttonTextColor: "#FFFFFF",
          borderRadiusSmall: "8px",
          borderRadiusMedium: "12px",
          borderRadiusLarge: "12px",
        },
      },
    },
    paymentMethods: {
      creditCard: "all",
      debitCard: "all",
    },
  };

  return (
    <div className="bg-[#07090E] min-h-screen text-white pt-28 md:pt-36 pb-24 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-20 left-1/3 w-[600px] h-[350px] bg-red-600/10 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/cart" className="hover:text-white transition-colors">
            ← Volver al Carrito
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Checkout Seguro</span>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/15 text-red-400 border border-red-500/30 mb-2">
            <span>🔒</span>
            <span>Pasarela Oficial Cifrada</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Finalizar Compra
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Completa tus datos de despacho y selecciona tu medio de pago protegido por Mercado Pago & Webpay.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ─── Columna Izquierda: Datos y Pago ─── */}
          <div className="flex-1 w-full space-y-8">
            {/* 1. Datos de Contacto y Envío */}
            <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/10">
                <span className="w-7 h-7 rounded-lg bg-[#E10E0E]/15 border border-[#E10E0E]/30 text-red-400 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Datos de Contacto y Despacho
                </h2>
              </div>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label htmlFor="name" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                    Nombre completo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={billing.name}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-xl border border-white/10 bg-[#07090E] placeholder-gray-500 text-white text-sm py-3 px-4 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                    Correo electrónico <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={billing.email}
                    onChange={handleChange}
                    placeholder="ejemplo@correo.com"
                    className="w-full rounded-xl border border-white/10 bg-[#07090E] placeholder-gray-500 text-white text-sm py-3 px-4 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Teléfono */}
                  <div>
                    <label htmlFor="phone" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={billing.phone}
                      onChange={handleChange}
                      placeholder="+56 9 1234 5678"
                      className="w-full rounded-xl border border-white/10 bg-[#07090E] placeholder-gray-500 text-white text-sm py-3 px-4 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label htmlFor="city" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={billing.city}
                      onChange={handleChange}
                      placeholder="Santiago"
                      className="w-full rounded-xl border border-white/10 bg-[#07090E] placeholder-gray-500 text-white text-sm py-3 px-4 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Dirección */}
                <div>
                  <label htmlFor="address" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                    Dirección de envío
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={billing.address}
                    onChange={handleChange}
                    placeholder="Calle, número, departamento o sucursal..."
                    className="w-full rounded-xl border border-white/10 bg-[#07090E] placeholder-gray-500 text-white text-sm py-3 px-4 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 transition-all"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label htmlFor="notes" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                    Instrucciones especiales de entrega (opcional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    value={billing.notes}
                    onChange={handleChange}
                    placeholder="Dejar en conserjería, timbre 402, etc..."
                    className="w-full rounded-xl border border-white/10 bg-[#07090E] placeholder-gray-500 text-white text-sm p-4 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Método de Pago (Mercado Pago Brick) */}
            <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/10">
                <span className="w-7 h-7 rounded-lg bg-[#E10E0E]/15 border border-[#E10E0E]/30 text-red-400 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Medio de Pago Seguro
                </h2>
              </div>

              {/* Banner MP Oficial */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#009EE3]/10 border border-[#009EE3]/30 mb-6">
                <div className="w-12 h-10 bg-[#009EE3] rounded-lg flex items-center justify-center font-black text-white text-xs shrink-0 shadow-md">
                  MP
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Mercado Pago & Webpay</h4>
                  <p className="text-xs text-gray-400">
                    Tarjetas de crédito (con o sin cuotas), débito Redcompra y dinero en cuenta.
                  </p>
                </div>
              </div>

              {/* Mercado Pago Payment Brick (Dark Theme) */}
              <div className="rounded-xl overflow-hidden bg-[#07090E] p-4 border border-white/10">
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

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                <span className="text-emerald-400">🔒</span>
                <span>Transacción segura y encriptada por Mercado Pago Chile</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* ─── Columna Derecha: Resumen de Pedido y Envíos ─── */}
          <div className="w-full lg:max-w-[440px]">
            <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-xl overflow-hidden sticky top-32">
              <div className="border-b border-white/10 py-5 px-6 bg-white/[0.02] flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-white tracking-tight">
                  Tu Pedido
                </h3>
                <span className="text-xs font-mono font-medium text-gray-400">
                  {cartItems.length} {cartItems.length === 1 ? "ítem" : "ítems"}
                </span>
              </div>

              <div className="p-6 space-y-6">
                {/* Desglose por tienda */}
                {Object.entries(itemsByStore).map(([sId, items]) => (
                  <div key={sId} className="space-y-3 pb-5 border-b border-white/10 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🏪</span>
                        <span className="text-xs font-bold text-white tracking-wide">
                          {storeNames[sId] || `Tienda (ID: ${sId.slice(0, 8)})`}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                        ✓ Verificada
                      </span>
                    </div>

                    {/* Cartas de esta tienda */}
                    <div className="bg-[#07090E] rounded-xl border border-white/5 p-3 space-y-2.5">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-8 aspect-[2.5/3.5] rounded overflow-hidden bg-black/60 border border-white/10 shrink-0">
                              <Image
                                src={item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0] || "/images/products/product-1-bg-1.png"}
                                alt={item.title}
                                fill
                                sizes="32px"
                                className="object-contain"
                                unoptimized={Boolean((item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0])?.includes("scryfall"))}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium truncate">{item.title}</p>
                              <p className="text-[11px] text-gray-500 font-mono">Cant: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-white shrink-0">
                            ${Math.round(item.discountedPrice * item.quantity).toLocaleString("es-CL")} CLP
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Selector de Envío para esta Tienda */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                        Método de Despacho ({storeNames[sId] || "Tienda"}):
                      </span>
                      <div className="space-y-2">
                        {shippingProviders.map((provider) => (
                          <label
                            key={provider.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                              selectedProvidersByStore[sId]?.id === provider.id
                                ? "bg-white/[0.04] border-red-500/50 shadow-sm"
                                : "bg-black/20 border-white/5 hover:border-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="radio"
                                name={`shipping_${sId}`}
                                value={provider.name}
                                checked={selectedProvidersByStore[sId]?.id === provider.id}
                                onChange={() => setSelectedProvidersByStore((prev) => ({ ...prev, [sId]: provider }))}
                                className="w-3.5 h-3.5 text-red-500 border-white/20 focus:ring-red-500/30 cursor-pointer"
                              />
                              <ShippingBadge name={provider.name} size="sm" />
                            </div>
                            <div className="font-mono font-bold text-xs text-white">
                              {Number(provider.price) === 0 ? (
                                <span className="text-emerald-400">$0 (Gratis)</span>
                              ) : (
                                <span>${Math.round(Number(provider.price)).toLocaleString("es-CL")} CLP</span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Desglose Financiero */}
                <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Subtotal Productos</span>
                    <span className="font-mono font-bold text-white">
                      ${Math.round(total).toLocaleString("es-CL")} CLP
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Total Envíos Consolidados</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${Math.round(totalShippingCost).toLocaleString("es-CL")} CLP
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
                    <span className="text-sm font-bold text-white">Total Final a Pagar</span>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-white">
                        ${Math.round(finalAmount).toLocaleString("es-CL")}
                      </span>
                      <span className="text-xs text-gray-400 font-sans ml-1">CLP</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-gray-400 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>Despacho 24-48h con seguimiento en vivo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✓</span>
                    <span>Protección al comprador TapTrade SpA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutWebpay;
