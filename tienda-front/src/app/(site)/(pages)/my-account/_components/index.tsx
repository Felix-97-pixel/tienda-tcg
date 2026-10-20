"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/features/auth-slice";
import ChileLocationsSelect from "@/app/(site)/(pages)/checkout/_components/ChileLocationsSelect";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/utils/api";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  regionCode: string | null;
  cityCode: string | null;
  role: string;
  createdAt: string;
};

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
};

type VendorOrder = {
  id: string;
  deliveryStatus?: string | null;
  shippingCourier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  dispatchedAt?: string | null;
  store: { id: string; name: string };
  items: OrderItem[];
};

type Order = {
  id: string;
  buyOrder: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  vendorOrders?: VendorOrder[];
  items?: OrderItem[];
  payment: { status: string; authCode?: string; cardLast4?: string } | null;
};

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  PENDING:   { label: "Pendiente",   cls: "bg-amber-500/15 text-amber-400 border border-amber-500/30", dot: "bg-amber-400" },
  PAID:      { label: "Pagado",      cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400" },
  FAILED:    { label: "Fallido",     cls: "bg-red/15 text-red border border-red/30", dot: "bg-red" },
  CANCELLED: { label: "Cancelado",   cls: "bg-white/10 text-gray-400 border border-white/15", dot: "bg-gray-400" },
  REFUNDED:  { label: "Reembolsado", cls: "bg-purple-500/15 text-purple-400 border border-purple-500/30", dot: "bg-purple-400" },
};

const normalizeTab = (t: string | null): "orders" | "addresses" | "account-details" => {
  if (!t) return "orders";
  if (t === "address" || t === "addresses" || t === "direcciones") return "addresses";
  if (t === "account" || t === "account-details" || t === "cuenta") return "account-details";
  if (t === "orders" || t === "pedidos") return "orders";
  return "orders";
};

const MyAccount = () => {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.authReducer);
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "account-details">(normalizeTab(rawTab));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Estado para edición de dirección
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<{
    name: string;
    phone: string;
    address: string;
    city: string;
    cityCode: string;
    regionCode: string;
  }>({
    name: "",
    phone: "",
    address: "",
    city: "Santiago Centro",
    cityCode: "SANTIAGO",
    regionCode: "RM",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estado para datos de cuenta
  const [accountForm, setAccountForm] = useState<{
    name: string;
    phone: string;
  }>({
    name: "",
    phone: "",
  });
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sincronizar tab con URL query param
  useEffect(() => {
    if (rawTab) {
      setActiveTab(normalizeTab(rawTab));
    }
  }, [rawTab]);

  const handleTabChange = (tab: "orders" | "addresses" | "account-details") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/my-account?tab=${tab}`);
    }
  };

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`${API_URL}/users/me`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data: UserProfile = await res.json();
      setProfile(data);
      
      const currentName = data.name ?? "";
      const currentPhone = data.phone ?? "";
      const currentAddress = data.address ?? "";
      const currentCity = data.city ?? "Santiago Centro";
      const currentCityCode = data.cityCode ?? "SANTIAGO";
      const currentRegionCode = data.regionCode ?? "RM";

      setAddressForm({
        name: currentName,
        phone: currentPhone,
        address: currentAddress,
        city: currentCity,
        cityCode: currentCityCode,
        regionCode: currentRegionCode,
      });

      setAccountForm({
        name: currentName,
        phone: currentPhone,
      });

      // Si no tiene dirección registrada, abrir automáticamente el modo edición
      if (!currentAddress && !data.cityCode) {
        setIsEditingAddress(true);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/users/me/orders`, { credentials: "include" });
      if (!res.ok) throw new Error();
      setOrders(await res.json());
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [isAuthenticated, router, fetchProfile, fetchOrders]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    dispatch(logout());
    router.push("/");
  };

  // Guardar Dirección de Envío (Campos sincronizados con Checkout)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.address.trim()) {
      setAddressMsg({ type: "error", text: "Por favor ingresa tu calle, número y departamento." });
      return;
    }
    setSavingAddress(true);
    setAddressMsg(null);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: addressForm.name,
          phone: addressForm.phone,
          address: addressForm.address,
          city: addressForm.city,
          cityCode: addressForm.cityCode,
          regionCode: addressForm.regionCode,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar la dirección de envío");
      const updated = await res.json();
      setProfile(updated);
      setAccountForm((prev) => ({
        ...prev,
        name: updated.name ?? prev.name,
        phone: updated.phone ?? prev.phone,
      }));
      setAddressMsg({
        type: "success",
        text: "¡Dirección de envío guardada! Se cargará automáticamente en el Checkout al comprar.",
      });
      setIsEditingAddress(false);
    } catch (err: any) {
      setAddressMsg({ type: "error", text: err.message || "Ocurrió un error al guardar la dirección." });
    } finally {
      setSavingAddress(false);
    }
  };

  // Guardar Datos de Cuenta
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    setAccountMsg(null);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: accountForm.name,
          phone: accountForm.phone,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar los datos de cuenta");
      const updated = await res.json();
      setProfile(updated);
      setAddressForm((prev) => ({
        ...prev,
        name: updated.name ?? prev.name,
        phone: updated.phone ?? prev.phone,
      }));
      setAccountMsg({ type: "success", text: "Tus datos personales se actualizaron correctamente." });
    } catch (err: any) {
      setAccountMsg({ type: "error", text: err.message || "Ocurrió un error al actualizar los datos." });
    } finally {
      setSavingAccount(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(text);
    setTimeout(() => setCopiedTracking(null), 2500);
  };

  const displayName = profile?.name || user?.name || user?.email?.split("@")[0] || "Usuario";
  const displayEmail = profile?.email || user?.email || "";
  const initial = displayName.slice(0, 1).toUpperCase();

  const tabsConfig = [
    {
      id: "orders" as const,
      label: "Mis pedidos",
      description: "Historial y seguimiento de compras",
      count: orders.length > 0 ? orders.length : undefined,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      id: "addresses" as const,
      label: "Direcciones",
      description: "Destinos de entrega oficiales",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "account-details" as const,
      label: "Datos de cuenta",
      description: "Perfil, teléfono y seguridad",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-6 pb-24 relative overflow-hidden">
      {/* Resplandor ambiental de fondo */}
      <div className="absolute top-10 left-1/4 w-[650px] h-[350px] bg-red/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-80 right-1/4 w-[500px] h-[300px] bg-blue/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Breadcrumb de navegación */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Mi Cuenta</span>
          <span>/</span>
          <span className="text-red font-semibold capitalize">
            {tabsConfig.find((t) => t.id === activeTab)?.label}
          </span>
        </div>

        {/* Encabezado del Panel */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red/15 text-red border border-red/30 mb-2">
            <span>👤</span>
            <span>Panel de Comprador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Mi Cuenta
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Administra tus pedidos, revisa el seguimiento en vivo de tus envíos y gestiona tus datos de entrega.
          </p>
        </div>

        {/* Contenedor Principal: Sidebar + Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ─── Columna Izquierda: Tarjeta de Usuario y Tabs (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Resumen del Usuario */}
              <div className="flex items-center gap-4 pb-6 border-b border-white/10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-dark to-red text-white font-black text-xl flex items-center justify-center border border-red/40 shadow-lg shadow-red/30 shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-white truncate leading-tight">
                    {displayName}
                  </h2>
                  <p className="text-xs text-gray-400 truncate mt-0.5" title={displayEmail}>
                    {displayEmail}
                  </p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 text-[9px] font-bold text-red bg-red/10 border border-red/20 rounded-full uppercase tracking-wider">
                    Comprador Verificado
                  </span>
                </div>
              </div>

              {/* Pestañas de Navegación Vertical */}
              <nav className="space-y-1.5" aria-label="Pestañas de cuenta">
                {tabsConfig.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-red-dark to-red text-white font-bold shadow-lg shadow-red/25 border border-red/40"
                          : "bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/5 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-white/5 text-gray-400 group-hover:text-red group-hover:bg-red/10"
                          }`}
                        >
                          {tab.icon}
                        </div>
                        <div>
                          <p className={`text-xs ${isActive ? "text-white font-bold" : "text-gray-200 group-hover:text-white"}`}>
                            {tab.label}
                          </p>
                          <p className={`text-[10px] ${isActive ? "text-white/80" : "text-gray-500 group-hover:text-gray-400"}`}>
                            {tab.description}
                          </p>
                        </div>
                      </div>

                      {tab.count !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            isActive ? "bg-white text-red-dark" : "bg-white/10 text-gray-300"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Botón Cerrar Sesión */}
              <div className="pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red hover:text-white hover:bg-red/20 border border-red/20 hover:border-red/40 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-red/10 group-hover:bg-red/30 text-red flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span>Cerrar sesión</span>
                </button>
              </div>

            </div>
          </div>

          {/* ─── Columna Derecha: Contenido de la Pestaña Activa (8 cols) ─── */}
          <div className="lg:col-span-8">

            {/* ══════════ PESTAÑA 1: MIS PEDIDOS ══════════ */}
            {activeTab === "orders" && (
              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Mis Pedidos</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Seguimiento de compras y despachos en tiempo real
                    </p>
                  </div>
                  {orders.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-gray-300 font-mono">
                      {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
                    </span>
                  )}
                </div>

                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-red border-t-transparent animate-spin" />
                    <p className="text-xs text-gray-400">Cargando tus pedidos...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 px-4 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mx-auto shadow-inner">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Aún no tienes compras registradas</h4>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                        Explora los catálogos de cartas TCG de todas las tiendas de Chile con cotización de envíos oficiales.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link href="/shop">
                        <Button variant="primary" size="md">
                          Ir a la Tienda →
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders.map((order) => {
                      const st = STATUS_MAP[order.status] ?? {
                        label: order.status,
                        cls: "bg-white/10 text-gray-400 border border-white/15",
                        dot: "bg-gray-400",
                      };
                      return (
                        <div
                          key={order.id}
                          className="bg-[#0B0E14] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4 hover:border-white/20 transition-all shadow-md"
                        >
                          {/* Encabezado del Pedido */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Orden</span>
                                <span className="font-mono text-sm font-black text-white">{order.buyOrder}</span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {new Date(order.createdAt).toLocaleDateString("es-CL", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${st.cls}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {st.label}
                              </span>
                              <span className="font-mono font-black text-base sm:text-lg text-white">
                                ${parseFloat(order.totalAmount).toLocaleString("es-CL")} CLP
                              </span>
                            </div>
                          </div>

                          {/* Paquetes y Despacho por Tienda */}
                          {order.vendorOrders && order.vendorOrders.length > 0 ? (
                            <div className="space-y-3">
                              {order.vendorOrders.map((vo) => (
                                <div
                                  key={vo.id}
                                  className="bg-white/[0.02] rounded-xl p-4 border border-white/5 space-y-3"
                                >
                                  {/* Encabezado de la Tienda y Estado */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <span>🏬</span>
                                      <span>Tienda: {vo.store.name}</span>
                                    </span>

                                    {vo.deliveryStatus === "DISPATCHED" ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        🟢 En camino (Despachado)
                                      </span>
                                    ) : order.status === "PAID" ? (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        🟡 En preparación en tienda
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-400">
                                        {order.status}
                                      </span>
                                    )}
                                  </div>

                                  {/* Tarjeta de Guía Oficial si está Despachado */}
                                  {vo.deliveryStatus === "DISPATCHED" && (
                                    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                                      <div className="space-y-1">
                                        <p className="font-bold text-white flex items-center gap-1.5">
                                          <span>📦</span> Transporte: {vo.shippingCourier || "Courier Oficial"}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <p className="text-gray-300 font-mono text-[11px]">
                                            N° Guía: <strong className="text-emerald-400">{vo.trackingNumber}</strong>
                                          </p>
                                          {vo.trackingNumber && (
                                            <button
                                              type="button"
                                              onClick={() => copyToClipboard(vo.trackingNumber!)}
                                              className="text-[10px] text-gray-400 hover:text-white underline cursor-pointer font-medium"
                                              title="Copiar número de guía"
                                            >
                                              {copiedTracking === vo.trackingNumber ? "¡Copiado!" : "[Copiar]"}
                                            </button>
                                          )}
                                        </div>
                                        {vo.dispatchedAt && (
                                          <p className="text-[10px] text-gray-400">
                                            Despachado el{" "}
                                            {new Date(vo.dispatchedAt).toLocaleDateString("es-CL", {
                                              day: "2-digit",
                                              month: "short",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </p>
                                        )}
                                      </div>

                                      {vo.trackingUrl && (
                                        <a
                                          href={vo.trackingUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/30"
                                        >
                                          <span>Rastrear Envío Oficial</span>
                                          <span>↗</span>
                                        </a>
                                      )}
                                    </div>
                                  )}

                                  {/* Aviso si está pendiente de entrega */}
                                  {order.status === "PAID" && vo.deliveryStatus !== "DISPATCHED" && (
                                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-300/80 leading-relaxed flex items-center gap-2">
                                      <span>⏳</span>
                                      <span>
                                        La tienda está protegiendo tus cartas en toploaders para entrega segura a la empresa de transporte. Te notificaremos tu número de seguimiento tan pronto sea despachado.
                                      </span>
                                    </div>
                                  )}

                                  {/* Items del paquete */}
                                  <div className="space-y-1.5 pt-1">
                                    {vo.items.map((item) => (
                                      <div key={item.id} className="flex justify-between text-xs text-gray-300">
                                        <span>
                                          {item.productName} <span className="text-gray-500">× {item.quantity}</span>
                                        </span>
                                        <span className="font-mono text-white font-medium">
                                          ${(parseFloat(item.unitPrice) * item.quantity).toLocaleString("es-CL")}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Items directos si no hay sub-órdenes */
                            <div className="bg-white/[0.02] rounded-xl p-3.5 space-y-1.5 border border-white/5">
                              {order.items?.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs text-gray-300">
                                  <span>
                                    {item.productName} <span className="text-gray-500">× {item.quantity}</span>
                                  </span>
                                  <span className="font-mono text-white font-medium">
                                    ${(parseFloat(item.unitPrice) * item.quantity).toLocaleString("es-CL")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pie con método de pago */}
                          {order.payment?.cardLast4 && (
                            <div className="pt-2 flex items-center gap-2 text-xs text-gray-400">
                              <span>💳</span>
                              <span>Tarjeta terminada en •••• {order.payment.cardLast4}</span>
                              {order.payment.authCode && <span>· Cód. Auth: {order.payment.authCode}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ PESTAÑA 2: DIRECCIONES (SIN MAPA - IDÉNTICO AL CHECKOUT) ══════════ */}
            {activeTab === "addresses" && (
              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Dirección de Despacho</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Configura tu dirección oficial para cotizar envíos con Chilexpress y Starken directamente en el Checkout.
                    </p>
                  </div>
                  {!isEditingAddress && (profile?.address || profile?.cityCode) && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditingAddress(true)}
                    >
                      ✏️ Modificar Dirección
                    </Button>
                  )}
                </div>

                {loadingProfile ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-red border-t-transparent animate-spin" />
                    <p className="text-xs text-gray-400">Cargando datos de entrega...</p>
                  </div>
                ) : !isEditingAddress && (profile?.address || profile?.cityCode) ? (
                  /* ── Vista de Dirección Guardada ── */
                  <div className="space-y-5">
                    <div className="bg-[#0B0E14] border border-white/10 rounded-2xl p-6 space-y-5 shadow-md">
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-white">
                            Dirección Predeterminada de Checkout
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Sincronizada
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                        <div className="space-y-1">
                          <span className="text-gray-400 text-[11px] block uppercase tracking-wider font-bold">Destinatario</span>
                          <span className="font-semibold text-white text-sm block">
                            {profile.name || "Sin nombre registrado"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-gray-400 text-[11px] block uppercase tracking-wider font-bold">Teléfono de Contacto</span>
                          <span className="font-semibold text-white text-sm font-mono block">
                            {profile.phone || "Sin teléfono registrado"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-gray-400 text-[11px] block uppercase tracking-wider font-bold">Región</span>
                          <span className="font-semibold text-white text-sm block">
                            {profile.regionCode || "Región Metropolitana (RM)"}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-gray-400 text-[11px] block uppercase tracking-wider font-bold">Comuna</span>
                          <span className="font-semibold text-white text-sm block">
                            {profile.city || profile.cityCode || "Santiago Centro"}
                          </span>
                        </div>

                        <div className="sm:col-span-2 space-y-1 pt-3 border-t border-white/5">
                          <span className="text-gray-400 text-[11px] block uppercase tracking-wider font-bold">Calle, Número y Depto.</span>
                          <div className="flex items-start gap-2">
                            <span className="text-red text-sm mt-0.5">📍</span>
                            <span className="font-medium text-white text-sm leading-relaxed">
                              {profile.address || "Dirección no especificada"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <span>⚡</span> Esta dirección se auto-completará en tu próximo checkout.
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(true)}
                          className="text-red hover:text-white underline font-semibold transition-colors"
                        >
                          Cambiar destino
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Formulario de Configuración de Dirección (Idéntico a Checkout) ── */
                  <form onSubmit={handleSaveAddress} className="space-y-5">
                    <div className="p-4 rounded-xl bg-red/10 border border-red/20 text-xs text-red-200/90 leading-relaxed">
                      💡 <strong>Datos idénticos a los del Checkout:</strong> Configura aquí tu nombre, teléfono, región, comuna y dirección para que no tengas que escribirlos cada vez que compres cartas.
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nombre Completo */}
                      <div className="space-y-1.5">
                        <label htmlFor="addr-name" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                          Nombre completo del destinatario <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          id="addr-name"
                          required
                          value={addressForm.name}
                          onChange={(e) => setAddressForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Ej: Juan Pérez"
                          className="w-full rounded-xl border border-white/10 bg-[#07090E] text-white px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-gray-600"
                        />
                      </div>

                      {/* Teléfono de Contacto */}
                      <div className="space-y-1.5">
                        <label htmlFor="addr-phone" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                          Teléfono de contacto <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          id="addr-phone"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+56 9 1234 5678"
                          className="w-full rounded-xl border border-white/10 bg-[#07090E] text-white px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-gray-600 font-mono"
                        />
                      </div>
                    </div>

                    {/* Selector de Región y Comuna (Idéntico a Checkout) */}
                    <div className="pt-2">
                      <ChileLocationsSelect
                        selectedCommune={addressForm.cityCode || addressForm.city}
                        onCommuneChange={(communeCode, communeName, regCode) => {
                          setAddressForm((prev) => ({
                            ...prev,
                            cityCode: communeCode,
                            city: communeName,
                            regionCode: regCode,
                          }));
                        }}
                      />
                    </div>

                    {/* Dirección de Envío */}
                    <div className="space-y-1.5">
                      <label htmlFor="addr-address" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                        Dirección de envío <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        id="addr-address"
                        required
                        value={addressForm.address}
                        onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))}
                        placeholder="Calle, número, departamento, villa o sucursal..."
                        className="w-full rounded-xl border border-white/10 bg-[#07090E] text-white px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-gray-600"
                      />
                    </div>

                    {/* Mensaje de Feedback */}
                    {addressMsg && (
                      <div
                        className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200 ${
                          addressMsg.type === "success"
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                            : "bg-red/15 border border-red/30 text-red"
                        }`}
                      >
                        <span>{addressMsg.type === "success" ? "✅" : "⚠️"}</span>
                        <span>{addressMsg.text}</span>
                      </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                      {profile?.address && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="md"
                          onClick={() => {
                            setIsEditingAddress(false);
                            setAddressMsg(null);
                          }}
                        >
                          Cancelar
                        </Button>
                      )}

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={savingAddress}
                      >
                        💾 Guardar Dirección de Envío
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ══════════ PESTAÑA 3: DATOS DE CUENTA (PERFIL PERSONAL) ══════════ */}
            {activeTab === "account-details" && (
              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="pb-5 border-b border-white/10">
                  <h3 className="text-xl font-black text-white tracking-tight">Datos de Cuenta</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Información personal de tu perfil y contacto.
                  </p>
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-6">
                  {/* Correo Electrónico (Solo Lectura) */}
                  <div className="space-y-1.5">
                    <label htmlFor="profile-email" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="profile-email"
                        value={profile?.email ?? ""}
                        disabled
                        className="w-full rounded-xl border border-white/10 bg-[#0B0E14]/60 text-gray-400 px-4 py-3 text-sm outline-none cursor-not-allowed font-medium"
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs text-gray-500">🔒 Bloqueado</span>
                    </div>
                    <p className="text-[11px] text-gray-500">El correo electrónico no se puede modificar por motivos de seguridad.</p>
                  </div>

                  {/* Nombre y Teléfono en 2 columnas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="profile-name" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="profile-name"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Ej: Juan Pérez"
                        className="w-full rounded-xl border border-white/10 bg-[#07090E] text-white px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-gray-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="profile-phone" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                        Teléfono de contacto
                      </label>
                      <input
                        type="text"
                        id="profile-phone"
                        value={accountForm.phone}
                        onChange={(e) => setAccountForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+56 9 1234 5678"
                        className="w-full rounded-xl border border-white/10 bg-[#07090E] text-white px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-gray-600 font-mono"
                      />
                      <p className="text-[11px] text-gray-500">Número de teléfono para soporte y notificaciones.</p>
                    </div>
                  </div>

                  {/* Tarjeta de Resumen de Dirección Vinculada */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>📦</span> Dirección de Despacho Vinculada
                        </span>
                        <p className="text-xs text-gray-400">
                          {profile?.address ? (
                            <>
                              {profile.address}, {profile.city || profile.cityCode} ({profile.regionCode})
                            </>
                          ) : (
                            "No has configurado tu dirección para el Checkout aún."
                          )}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTabChange("addresses")}
                      >
                        Gestionar en Direcciones →
                      </Button>
                    </div>
                  </div>

                  {/* Mensaje de Feedback */}
                  {accountMsg && (
                    <div
                      className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200 ${
                        accountMsg.type === "success"
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                          : "bg-red/15 border border-red/30 text-red"
                      }`}
                    >
                      <span>{accountMsg.type === "success" ? "✅" : "⚠️"}</span>
                      <span>{accountMsg.text}</span>
                    </div>
                  )}

                  {/* Botón Guardar Cambios */}
                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={savingAccount}
                    >
                      💾 Guardar Cambios
                    </Button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
