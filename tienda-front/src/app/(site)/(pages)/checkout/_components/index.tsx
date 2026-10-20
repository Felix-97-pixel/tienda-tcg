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
import { IconShieldCheck, IconAlertTriangle, IconStore } from "@/components/ui/Icons";
import { API_URL } from "@/utils/api";
import ChileLocationsSelect from "./ChileLocationsSelect";
import { calculatePaymentFee, getGatewayConfig, PaymentGatewayType } from "@/utils/paymentFees";

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "TEST-dummy", { locale: "es-CL" });

const IconMapPin = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

type SavedAddress = {
  id: string;
  alias: string | null;
  name: string;
  phone: string;
  address: string;
  city: string;
  cityCode: string;
  regionCode: string;
  isDefault: boolean;
};

type BillingData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
};


const CheckoutWebpay = () => {
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectTotalPrice);
  const { isAuthenticated } = useSelector((s: RootState) => s.authReducer);
  const currency = useSelector((state: any) => state.currencyReducer);
  const dispatch = useDispatch();
  const router = useRouter();

  const [selectedGateway, setSelectedGateway] = useState<PaymentGatewayType>("WEBPAY");
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
  
  // Estados para cotización dinámica oficial de Chilexpress, Starken y Retiro
  const [selectedCommuneCode, setSelectedCommuneCode] = useState<string>("SANTIAGO");
  const [selectedCommuneName, setSelectedCommuneName] = useState<string>("Santiago Centro");
  const [selectedRegionCode, setSelectedRegionCode] = useState<string>("RM");
  const [isQuotingShipping, setIsQuotingShipping] = useState<boolean>(false);
  const [quotedStores, setQuotedStores] = useState<Record<string, any>>({});
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");

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
  const cartSignature = React.useMemo(() => {
    return cartItems.map((i) => `${i.id}:${i.quantity}:${i.storeId}`).join("|");
  }, [cartItems]);

  // Fetch store names in batch
  useEffect(() => {
    const missingIds = storeIds.filter((id) => id !== "unknown" && !storeNames[id]);
    if (missingIds.length === 0) return;

    Promise.all(
      missingIds.map((id) =>
        fetch(`${API_URL}/stores/public-by-id/${id}`, { credentials: "include" })
          .then(async (res) => {
            if (!res.ok) return { id, name: "Tienda TapTrade" };
            const data = await res.json().catch(() => null);
            return { id, name: data?.name || "Tienda TapTrade" };
          })
          .catch(() => ({ id, name: "Tienda TapTrade" }))
      )
    ).then((results) => {
      setStoreNames((prev) => {
        const next = { ...prev };
        results.forEach(({ id, name }) => {
          next[id] = name;
        });
        return next;
      });
    });
  }, [storeIds, storeNames]);

  // Cotizador Dinámico en Vivo (Chilexpress, Starken y Retiro en Tienda)
  const isQuotingRef = React.useRef(false);

  const quoteShipping = React.useCallback(
    async (communeCode: string, regionCode?: string) => {
      if (!communeCode || cartItems.length === 0) return;
      if (isQuotingRef.current) return;
      isQuotingRef.current = true;
      setIsQuotingShipping(true);
      try {
        const res = await fetch(`${API_URL}/shipping/quote-cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destinationCommune: communeCode,
            destinationRegion: regionCode || selectedRegionCode,
            cartItems: cartItems.map((item) => ({
              productId: String(item.id),
              storeId: item.storeId || "unknown",
              quantity: item.quantity,
              productName: item.title,
            })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setQuotedStores(data.stores || {});

          setSelectedProvidersByStore((prev) => {
            const next = { ...prev };
            for (const [sId, storeQuote] of Object.entries((data.stores || {}) as Record<string, any>)) {
              const current = next[sId];
              // Preservar la opción seleccionada si coincide con el nuevo conjunto cotizado
              const matched = storeQuote.options?.find(
                (opt: any) => opt.id === current?.id || opt.provider === current?.provider
              );
              if (matched) {
                next[sId] = matched;
              } else {
                // Seleccionar por defecto (ej: Starken o la primera opción)
                const defaultOpt =
                  storeQuote.options?.find((opt: any) => opt.isDefault) || storeQuote.options?.[0];
                if (defaultOpt) next[sId] = defaultOpt;
              }
            }
            return next;
          });
        }
      } catch (err) {
        console.error("Error al cotizar envíos:", err);
      } finally {
        setIsQuotingShipping(false);
        isQuotingRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartSignature, selectedRegionCode]
  );

  // Ejecutar cotización al cargar o al cambiar la comuna de destino
  useEffect(() => {
    if (cartItems.length > 0 && selectedCommuneCode) {
      quoteShipping(selectedCommuneCode, selectedRegionCode);
    }
  }, [cartSignature, selectedCommuneCode, selectedRegionCode, quoteShipping]);

  // Carga fallback de proveedores
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

  const totalShippingCost = React.useMemo(() => {
    return storeIds.reduce((sum, sId) => {
      const provider = selectedProvidersByStore[sId];
      return sum + (provider ? Number(provider.price) : 0);
    }, 0);
  }, [storeIds, selectedProvidersByStore]);

  const applySavedAddress = React.useCallback(
    (addr: SavedAddress) => {
      setBilling((prev) => ({
        ...prev,
        name: addr.name,
        phone: addr.phone,
        address: addr.address,
        city: addr.city,
      }));
      setSelectedCommuneCode(addr.cityCode);
      setSelectedCommuneName(addr.city);
      setSelectedRegionCode(addr.regionCode);
      quoteShipping(addr.cityCode, addr.regionCode);
    },
    [quoteShipping]
  );

  const handleAddressSelectChange = (val: string) => {
    setSelectedAddressId(val);
    if (val === "custom") {
      // Permitir edición manual
    } else {
      const found = savedAddresses.find((a) => a.id === val);
      if (found) {
        applySavedAddress(found);
      }
    }
  };

  // Carga automática de perfil y libreta de direcciones para usuarios autenticados
  useEffect(() => {
    if (!isAuthenticated) return;

    // 1. Cargar perfil (para email y datos base)
    fetch(`${API_URL}/users/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((profile) => {
        if (profile) {
          setBilling((prev) => ({
            ...prev,
            email: prev.email || profile.email || "",
            name: prev.name || profile.name || "",
            phone: prev.phone || profile.phone || "",
            address: prev.address || profile.address || "",
            city: prev.city || profile.city || "",
          }));

          // Si el perfil ya tiene comuna y no hay direcciones, cotizar con la del perfil
          if (profile.cityCode) {
            setSelectedCommuneCode(profile.cityCode);
            setSelectedCommuneName(profile.city || "Santiago Centro");
            setSelectedRegionCode(profile.regionCode || "RM");
            quoteShipping(profile.cityCode, profile.regionCode || "RM");
          }
        }
      })
      .catch(() => {});

    // 2. Cargar libreta de direcciones múltiples
    fetch(`${API_URL}/users/me/addresses`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((addrs: SavedAddress[]) => {
        if (Array.isArray(addrs) && addrs.length > 0) {
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
          applySavedAddress(defaultAddr);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, applySavedAddress, quoteShipping]);


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
        city: selectedCommuneName,
        cityCode: selectedCommuneCode,
        regionCode: selectedRegionCode,
        notes: billing.notes,
        currency: currency.code,
        exchangeRate: currency.exchangeRate,
        gatewayFee: paymentFee,
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

  const baseAmount = total + totalShippingCost / currency.exchangeRate;
  const gatewayConfig = getGatewayConfig(selectedGateway);
  const paymentFee = calculatePaymentFee(baseAmount, selectedGateway);
  const finalAmount = baseAmount + paymentFee;

  const handleWebpaySubmit = async () => {
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
        city: selectedCommuneName,
        cityCode: selectedCommuneCode,
        regionCode: selectedRegionCode,
        notes: billing.notes,
        currency: currency.code,
        exchangeRate: currency.exchangeRate,
        gatewayFee: paymentFee,
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
      };

      const res = await fetch(`${API_URL}/payments/init-transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message ?? "Error al iniciar la transacción con Webpay Plus");
      }

      const data = await res.json();
      if (!data.token || !data.url) {
        throw new Error("Respuesta inválida de Transbank Webpay Plus");
      }

      // Redirigir a Webpay Plus mediante envío de formulario POST con token_ws
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.url;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "token_ws";
      input.value = data.token;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      setError(err.message ?? "Error al conectar con Webpay Plus");
      setLoading(false);
    }
  };

  const mpInitialization = React.useMemo(() => {
    return {
      amount: Math.max(1, Math.round(finalAmount)),
      payer: {
        email: billing.email || "comprador@taptrade.cl",
      },
    };
  }, [Math.round(finalAmount), billing.email]);

  // Dark Vault custom Mercado Pago styling (memoized para evitar re-montaje duplicado de iframes)
  const mpCustomization = React.useMemo(() => {
    return {
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
        creditCard: "all" as const,
        debitCard: "all" as const,
      },
    };
  }, []);

  return (
    <div className="bg-[#07090E] min-h-screen text-white pt-24 md:pt-32 pb-24 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-20 left-1/3 w-[600px] h-[350px] bg-red-600/10 blur-[150px] pointer-events-none rounded-full"></div>

      {/* ─── Encabezado Superior Oficial (Banner Idéntico a Directorio de Tiendas) ─── */}
      <div className="relative border-b border-white/[0.08] bg-[#0E121B] pb-10 mb-10 overflow-hidden">
        {/* Línea superior con gradiente oficial */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-dark via-red to-orange" />
        
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {/* Breadcrumb de navegación */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium">
            <Link href="/cart" className="hover:text-white transition-colors flex items-center gap-1">
              <span>← Volver al Carrito</span>
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Checkout Seguro</span>
          </div>

          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red/15 text-red-light border border-red/30 mb-3">
            <IconShieldCheck className="w-3.5 h-3.5 text-red" />
            <span>Pasarela Oficial Cifrada</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Finalizar Compra
          </h1>

          {/* Bajada explicativa */}
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Completa tus datos de despacho y selecciona tu medio de pago protegido por Mercado Pago & Webpay.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

              {/* Selector de Direcciones Guardadas si el usuario está autenticado */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-600/10 via-white/[0.02] to-transparent border border-red-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label htmlFor="address-selector" className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <IconMapPin className="w-4 h-4 text-red-400" />
                      <span>Dirección de Despacho Guardada</span>
                    </label>
                    <Link href="/my-account?tab=addresses" className="text-[11px] text-gray-400 hover:text-white underline">
                      Gestionar libreta →
                    </Link>
                  </div>

                  <select
                    id="address-selector"
                    value={selectedAddressId}
                    onChange={(e) => handleAddressSelectChange(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#07090E] text-white text-sm py-2.5 px-3 outline-none focus:border-red-500/80 transition-all cursor-pointer font-medium"
                  >
                    {savedAddresses.map((addr) => (
                      <option key={addr.id} value={addr.id} className="bg-[#0B0E14] text-white">
                        📍 {addr.alias || "Dirección"} — {addr.address}, {addr.city} ({addr.regionCode}) {addr.isDefault ? "★ Predeterminada" : ""}
                      </option>
                    ))}
                    <option value="custom" className="bg-[#0B0E14] text-amber-400 font-bold">
                      ✏️ + Ingresar otra dirección para este pedido
                    </option>
                  </select>

                  {selectedAddressId !== "custom" && (
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 text-xs text-gray-300 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {billing.name || "Sin nombre"}
                          </span>
                          <span className="text-gray-400 font-mono text-[11px]">
                            ({billing.phone || "Sin teléfono"})
                          </span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {billing.address}, {selectedCommuneName} ({selectedRegionCode})
                        </p>
                        <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                          <span>✓ Dirección seleccionada y cotización de envío activada</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedAddressId("custom")}
                        className="text-[11px] text-gray-400 hover:text-white underline shrink-0 whitespace-nowrap"
                      >
                        Modificar
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {/* Formulario de Datos: manual si es 'custom' o no autenticado */}
                {selectedAddressId === "custom" ? (
                  <>
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

                    {/* Teléfono */}
                    <div>
                      <label htmlFor="phone" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                        Teléfono de Contacto <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={billing.phone}
                        onChange={handleChange}
                        placeholder="+56 9 1234 5678"
                        className="w-full rounded-xl border border-white/10 bg-[#07090E] placeholder-gray-500 text-white text-sm py-3 px-4 outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
                      />
                    </div>

                    {/* Selector Inteligente de Región y Comuna para Cotización */}
                    <div className="pt-1">
                      <ChileLocationsSelect
                        selectedCommune={selectedCommuneCode}
                        onCommuneChange={(code, name, regCode) => {
                          setSelectedCommuneCode(code);
                          setSelectedCommuneName(name);
                          setSelectedRegionCode(regCode);
                          setBilling((prev) => ({ ...prev, city: name }));
                        }}
                      />
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
                  </>
                ) : (
                  <>
                    {/* Cuando está seleccionada una dirección guardada */}
                    <div>
                      <label htmlFor="email" className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                        Correo para confirmación de compra <span className="text-red-400">*</span>
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
                  </>
                )}

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




            {/* 2. Selector de Medio de Pago y Formulario Dinámico */}
            <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/10">
                <span className="w-7 h-7 rounded-lg bg-[#E10E0E]/15 border border-[#E10E0E]/30 text-red-400 font-black text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Selecciona tu Medio de Pago
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Elige tu pasarela preferida para desplegar el formulario correspondiente.
                  </p>
                </div>
              </div>

              {/* Selector de Pasarelas: Webpay Plus vs Mercado Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Opción 1: Transbank Webpay Plus */}
                <div
                  onClick={() => setSelectedGateway("WEBPAY")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                    selectedGateway === "WEBPAY"
                      ? "bg-gradient-to-b from-[#E10E0E]/10 to-transparent border-red-500/80 shadow-lg shadow-red-950/30 ring-1 ring-red-500/30"
                      : "bg-[#07090E] border-white/10 hover:border-white/25 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#E10E0E] to-[#FF4B4B] flex items-center justify-center text-white font-black text-xs shadow-md">
                          TBK
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            Webpay Plus
                          </h4>
                          <span className="text-[11px] text-gray-400 block font-medium">
                            Transbank SpA
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedGateway === "WEBPAY"
                            ? "border-red-500 bg-red-500"
                            : "border-white/30"
                        }`}
                      >
                        {selectedGateway === "WEBPAY" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Débito Redcompra, Prepago y Crédito bancario chileno (Visa, Mastercard, Magna, Diners).
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                      Recomendado en Chile
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-300">
                      Tarifa: 2.90%
                    </span>
                  </div>
                </div>

                {/* Opción 2: Mercado Pago */}
                <div
                  onClick={() => setSelectedGateway("MERCADOPAGO")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                    selectedGateway === "MERCADOPAGO"
                      ? "bg-gradient-to-b from-[#009EE3]/15 to-transparent border-[#009EE3]/80 shadow-lg shadow-sky-950/30 ring-1 ring-[#009EE3]/30"
                      : "bg-[#07090E] border-white/10 hover:border-white/25 opacity-75 hover:opacity-100"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#009EE3] flex items-center justify-center text-white font-black text-xs shadow-md">
                          MP
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            Mercado Pago
                          </h4>
                          <span className="text-[11px] text-gray-400 block font-medium">
                            Portal Cifrado
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedGateway === "MERCADOPAGO"
                            ? "border-[#009EE3] bg-[#009EE3]"
                            : "border-white/30"
                        }`}
                      >
                        {selectedGateway === "MERCADOPAGO" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">
                      Tarjetas de crédito (con o sin cuotas), débito y saldo en cuenta Mercado Pago.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded border border-sky-400/20">
                      Hasta 12 cuotas
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-300">
                      Tarifa: 3.79%
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulario Dinámico Desplegable según Opción Seleccionada */}
              {selectedGateway === "WEBPAY" && (
                <div className="p-6 rounded-2xl bg-[#07090E] border border-red-500/30 space-y-5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇨🇱</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Pagar con Webpay Plus de Transbank
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Al pulsar el botón serás redirigido a la plataforma oficial y encriptada de Transbank para ingresar los datos de tu tarjeta con total privacidad.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-300 flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 block">Total a autorizar en Transbank:</span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        0% sobreprecio de tienda • Tarifa pasarela 2.90%
                      </span>
                    </div>
                    <span className="font-mono font-black text-white text-base">
                      ${Math.round(finalAmount).toLocaleString("es-CL")} CLP
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleWebpaySubmit}
                    disabled={loading || total <= 0}
                    className="w-full py-4 px-6 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg bg-gradient-to-r from-[#E10E0E] to-[#FF4B4B] hover:from-[#c20c0c] hover:to-[#e10e0e] text-white shadow-red-900/30 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Conectando con Transbank...</span>
                      </>
                    ) : (
                      <>
                        <span>🔒 Pagar con Webpay Plus</span>
                        <span className="font-mono font-bold ml-1">
                          (${Math.round(finalAmount).toLocaleString("es-CL")} CLP)
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {selectedGateway === "MERCADOPAGO" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-3.5 rounded-xl bg-[#009EE3]/10 border border-[#009EE3]/30 text-xs text-sky-200 flex items-center gap-2">
                    <span className="font-bold shrink-0">Portal Mercado Pago:</span>
                    <span>Ingresa los datos de tu tarjeta directamente a continuación:</span>
                  </div>

                  {/* Formulario Brick único montado */}
                  <div className="rounded-xl overflow-hidden bg-[#07090E] p-4 border border-white/10">
                    {total > 0 && (
                      <Payment
                        key={`mp-brick-${Math.round(finalAmount)}`}
                        initialization={mpInitialization}
                        customization={mpCustomization as any}
                        onSubmit={async (param) => {
                          await handlePaymentSubmit(param.formData);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 mt-5 text-xs text-gray-400">
                <IconShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {selectedGateway === "WEBPAY"
                    ? "Transacción oficial cifrada con Transbank SpA"
                    : "Transacción segura y encriptada por Mercado Pago Chile"}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-2">
                <IconAlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
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
                        <IconStore className="w-4 h-4 text-gray-400 shrink-0" />
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
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                          Método de Despacho:
                        </span>
                        {isQuotingShipping && (
                          <span className="text-[10px] text-amber-400 font-bold animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                            Cotizando...
                          </span>
                        )}
                      </div>

                      {/* Información de cubicaje y origen de la tienda si está cotizada */}
                      {quotedStores[sId] && (
                        <div className="mb-2.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-white/50 flex items-center justify-between">
                          <span>📍 Desde: <strong className="text-white/80">{quotedStores[sId].originCommune} ({quotedStores[sId].originRegion})</strong></span>
                          <span className="text-[10px] text-white/40">{quotedStores[sId].packageDescription}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        {isQuotingShipping && !quotedStores[sId] ? (
                          <div className="space-y-2 py-1">
                            <div className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse flex items-center gap-3 px-4">
                              <div className="w-8 h-8 rounded-lg bg-white/10" />
                              <div className="flex-1 space-y-1.5">
                                <div className="h-3 w-32 bg-white/10 rounded" />
                                <div className="h-2 w-20 bg-white/5 rounded" />
                              </div>
                            </div>
                            <div className="h-14 rounded-xl bg-white/[0.03] border border-white/5 animate-pulse flex items-center gap-3 px-4">
                              <div className="w-8 h-8 rounded-lg bg-white/10" />
                              <div className="flex-1 space-y-1.5">
                                <div className="h-3 w-28 bg-white/10 rounded" />
                                <div className="h-2 w-16 bg-white/5 rounded" />
                              </div>
                            </div>
                          </div>
                        ) : (
                          (quotedStores[sId]?.options || shippingProviders).map((opt: any) => {
                          const isSelected =
                            selectedProvidersByStore[sId]?.id === opt.id ||
                            selectedProvidersByStore[sId]?.provider === opt.provider;
                          const carrierName = opt.provider || opt.name;
                          const optPrice = Number(opt.price || 0);

                          return (
                            <label
                              key={opt.id || opt.provider}
                              className={`flex flex-col p-3 rounded-xl border cursor-pointer select-none transition-all ${
                                isSelected
                                  ? "bg-white/[0.05] border-red-500/60 shadow-md shadow-red/10"
                                  : "bg-black/20 border-white/5 hover:border-white/15"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <input
                                    type="radio"
                                    name={`shipping_${sId}`}
                                    value={carrierName}
                                    checked={isSelected}
                                    onChange={() =>
                                      setSelectedProvidersByStore((prev) => ({ ...prev, [sId]: opt }))
                                    }
                                    className="w-3.5 h-3.5 text-red-500 border-white/20 focus:ring-red-500/30 cursor-pointer"
                                  />
                                  <ShippingBadge name={carrierName} size="sm" />
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white leading-tight">
                                      {opt.name}
                                    </span>
                                    {opt.estimatedDays && (
                                      <span className="text-[10px] text-emerald-400 font-medium">
                                        ⏱ {opt.estimatedDays}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="font-mono font-bold text-xs text-right">
                                  {optPrice === 0 ? (
                                    <span className="text-emerald-400 font-black">$0 (Gratis)</span>
                                  ) : (
                                    <span className="text-white">
                                      ${Math.round(optPrice).toLocaleString("es-CL")} CLP
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Si es Retiro en Tienda, mostrar dirección y horarios */}
                              {opt.provider === "RETIRO_TIENDA" && opt.address && (
                                <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-white/50 pl-6 space-y-0.5">
                                  <p className="text-white/70">📍 {opt.address}</p>
                                  {opt.schedule && <p className="text-[10px] text-white/40">⏰ {opt.schedule}</p>}
                                </div>
                              )}
                            </label>
                          );
                        })
                      )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Desglose Financiero */}
                <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs">
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

                  {/* Tarifa de procesamiento de pasarela (traspaso transparente al comprador) */}
                  <div className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-white/[0.03] border border-white/5 transition-all">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-300 font-semibold">
                          {selectedGateway === "WEBPAY" ? "Tarifa Webpay Plus" : "Tarifa Mercado Pago"}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                          selectedGateway === "WEBPAY"
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                            : "bg-sky-500/10 border border-sky-500/20 text-sky-400"
                        }`}>
                          {gatewayConfig.percentageText}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 block mt-0.5">
                        {gatewayConfig.description}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      +${Math.round(paymentFee).toLocaleString("es-CL")} CLP
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
                    <div>
                      <span className="text-sm font-bold text-white block">Total Final a Pagar</span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Precios directos de tienda • 0% comisión
                      </span>
                    </div>
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
