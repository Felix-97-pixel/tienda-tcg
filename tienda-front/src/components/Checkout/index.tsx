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
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const shippingCost = selectedProvider ? Number(selectedProvider.price) : 0;

  // Carga dinámica de proveedores de envío
  useEffect(() => {
    fetch(`${API_URL}/shipping/providers`, { credentials: "include" })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setShippingProviders(data);
          setSelectedProvider(data[0]); // Seleccionar el primero por defecto (Chilexpress)
        }
      })
      .catch((err) => console.error("Error al cargar proveedores de envío:", err?.message || err));
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!billing.name || !billing.email) {
      setError("Por favor completa tu nombre y correo electrónico.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Tu carrito está vacío.");
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
        shippingProviderId: selectedProvider ? selectedProvider.id : null,
        items: cartItems.map((item) => ({
          productId: String(item.id),
          inventoryItemId: item.inventoryItemId ?? null,
          productName: item.title,
          quantity: item.quantity,
          unitPrice: item.discountedPrice,
        })),
      };

      const res = await fetch(`${API_URL}/payments/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message ?? "Error al iniciar el pago");
      }

      const data: { token: string; url: string } = await res.json();

      // Redirigir a Webpay mediante un formulario POST (requerido por Transbank)
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
      setError(err.message ?? "Error desconocido");
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title="Checkout" pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-[#222630]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
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

                {/* Banner Webpay */}
                <div className="bg-[#1a1d24] shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <h3 className="font-medium text-xl text-white mb-4">
                    Método de pago
                  </h3>
                  <div className="flex items-center gap-4 p-4 border-2 border-blue rounded-xl bg-blue/5">
                    <div className="flex-shrink-0">
                      {/* Webpay logo placeholder */}
                      <div className="w-16 h-10 bg-gradient-to-r from-[#E2001A] to-[#1A1446] rounded-md flex items-center justify-center">
                        <span className="text-white text-xs font-bold tracking-tight">WEBPAY</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Webpay Plus</p>
                      <p className="text-sm text-gray-4">
                        Paga con tarjeta de débito o crédito de forma segura. Serás redirigido al portal de Transbank.
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-4 flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                    Transacción segura con encriptación SSL 256 bits
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

                    {/* Items */}
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-4 border-b border-white/10 gap-4"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.imgs?.thumbnails?.[0] && (
                            <Image
                              src={item.imgs.thumbnails[0]}
                              alt={item.title}
                              width={44}
                              height={44}
                              className="rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-white text-sm font-medium truncate">{item.title}</p>
                            <p className="text-gray-4 text-xs">× {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-white text-right flex-shrink-0 font-medium">
                          {formatPrice(item.discountedPrice * item.quantity, currency)}
                        </p>
                      </div>
                    ))}

                    {/* Subtotal */}
                    <div className="flex items-center justify-between py-4 border-b border-white/10">
                      <p className="font-medium text-white">Subtotal</p>
                      <p className="font-semibold text-white">
                        {formatPrice(total, currency)}
                      </p>
                    </div>

                    {/* Envío */}
                    <div className="py-4 border-b border-white/10 flex justify-between items-center gap-4">
                      <span className="font-medium text-white">Envío</span>
                      <div className="flex flex-col gap-3 items-end">
                        {shippingProviders.map((provider) => {
                          const isChilexpress = provider.name.toUpperCase() === "CHILEXPRESS";
                          return (
                            <label key={provider.id} className="flex items-center gap-3 cursor-pointer w-full justify-end select-none">
                              <input
                                type="radio"
                                name="shippingProvider"
                                value={provider.name}
                                checked={selectedProvider?.id === provider.id}
                                onChange={() => setSelectedProvider(provider)}
                                className="w-4 h-4 text-blue border-white/10 focus:ring-blue cursor-pointer flex-shrink-0"
                              />
                              
                              {/* Badge de Marca Estilizado */}
                              <ShippingBadge name={provider.name} size="sm" />

                              <div className="text-right font-bold text-green-600 text-sm min-w-[85px] flex-shrink-0">
                                {formatPrice(Number(provider.price) / currency.exchangeRate, currency)}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between pt-5">
                      <p className="font-semibold text-lg text-white">Total</p>
                      <p className="font-semibold text-lg text-green-600">
                        {formatPrice(total + (shippingCost / currency.exchangeRate), currency)}
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

                {/* Botón pagar */}
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0 || !selectedProvider}
                  className="w-full flex items-center justify-center gap-3 font-semibold text-white bg-gradient-to-r from-[#E2001A] to-[#1A1446] py-4 px-6 rounded-xl mt-7.5 transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Redirigiendo a Webpay...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      Pagar con Webpay · {formatPrice(total + (shippingCost / currency.exchangeRate), currency)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default CheckoutWebpay;
