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
import {
  IconBox,
  IconMapPin,
  IconCreditCard,
  IconShieldCheck,
  IconLock,
  IconTruck,
  IconStore,
} from "@/components/ui/Icons";

/* ─── Iconos Vectoriales Adicionales (Sin Emojis) ─── */
const IconUser = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IconPencil = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const IconPlus = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);

const IconTrash = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const IconCopy = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const IconCoins = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


const IconExternalLink = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const IconClock = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconZap = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const IconInfo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const IconCheckCircle = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconAlertTriangle = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconLogout = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

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

type UserAddress = {
  id: string;
  userId: string;
  alias: string | null;
  name: string;
  phone: string;
  address: string;
  city: string;
  cityCode: string;
  regionCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
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

type StoreCreditItem = {
  id: string;
  storeId: string;
  balance: string;
  store: {
    id: string;
    name: string;
    subdomain: string;
    logoUrl?: string | null;
  };
};

type CreditTransaction = {
  id: string;
  storeId: string;
  amount: string;
  type: string;
  reference?: string | null;
  createdAt: string;
  store: {
    id: string;
    name: string;
    subdomain: string;
  };
};

const normalizeTab = (t: string | null): "orders" | "addresses" | "credits" | "account-details" => {
  if (!t) return "orders";
  if (t === "credits" || t === "creditos" || t === "saldo" || t === "store-credits") return "credits";
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

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "credits" | "account-details">(normalizeTab(rawTab));
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [storeCredits, setStoreCredits] = useState<StoreCreditItem[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);


  // Estado para gestión de múltiples direcciones
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<{
    alias: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    cityCode: string;
    regionCode: string;
    isDefault: boolean;
  }>({
    alias: "",
    name: "",
    phone: "",
    address: "",
    city: "Santiago Centro",
    cityCode: "SANTIAGO",
    regionCode: "RM",
    isDefault: false,
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

  const handleTabChange = (tab: "orders" | "addresses" | "credits" | "account-details") => {
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

      setAccountForm({
        name: data.name ?? "",
        phone: data.phone ?? "",
      });
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch(`${API_URL}/users/me/addresses`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data: UserAddress[] = await res.json();
      setAddresses(data);
    } catch {
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
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

  const fetchCredits = useCallback(async () => {
    setLoadingCredits(true);
    try {
      const [resCredits, resTxs] = await Promise.all([
        fetch(`${API_URL}/users/me/store-credits`, { credentials: "include" }),
        fetch(`${API_URL}/users/me/store-credits/transactions`, { credentials: "include" }),
      ]);
      if (resCredits.ok) {
        setStoreCredits(await resCredits.json());
      } else {
        setStoreCredits([]);
      }
      if (resTxs.ok) {
        setCreditTransactions(await resTxs.json());
      } else {
        setCreditTransactions([]);
      }
    } catch {
      setStoreCredits([]);
      setCreditTransactions([]);
    } finally {
      setLoadingCredits(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProfile();
    fetchAddresses();
    fetchOrders();
    fetchCredits();
  }, [isAuthenticated, router, fetchProfile, fetchAddresses, fetchOrders, fetchCredits]);


  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    dispatch(logout());
    router.push("/");
  };

  const handleOpenCreateAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      alias: "",
      name: profile?.name || "",
      phone: profile?.phone || "",
      address: "",
      city: "Santiago Centro",
      cityCode: "SANTIAGO",
      regionCode: "RM",
      isDefault: addresses.length === 0,
    });
    setAddressMsg(null);
    setIsAddressFormOpen(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      alias: addr.alias || "",
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      cityCode: addr.cityCode,
      regionCode: addr.regionCode,
      isDefault: addr.isDefault,
    });
    setAddressMsg(null);
    setIsAddressFormOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.address.trim()) {
      setAddressMsg({ type: "error", text: "Por favor ingresa tu calle, número y departamento." });
      return;
    }
    setSavingAddress(true);
    setAddressMsg(null);
    try {
      const url = editingAddressId
        ? `${API_URL}/users/me/addresses/${editingAddressId}`
        : `${API_URL}/users/me/addresses`;
      const method = editingAddressId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addressForm),
      });

      if (!res.ok) throw new Error("Error al guardar la dirección de envío");
      await fetchAddresses();
      await fetchProfile();
      setAddressMsg({
        type: "success",
        text: editingAddressId
          ? "Dirección actualizada correctamente."
          : "Nueva dirección agregada con éxito.",
      });
      setIsAddressFormOpen(false);
    } catch (err: any) {
      setAddressMsg({ type: "error", text: err.message || "Ocurrió un error al guardar la dirección." });
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const res = await fetch(`${API_URL}/users/me/addresses/${addressId}/set-default`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        await fetchAddresses();
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta dirección de despacho?")) return;
    try {
      const res = await fetch(`${API_URL}/users/me/addresses/${addressId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        await fetchAddresses();
        await fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      icon: <IconBox className="w-5 h-5" />,
    },
    {
      id: "addresses" as const,
      label: "Direcciones",
      description: "Destinos de entrega oficiales",
      count: addresses.length > 0 ? addresses.length : undefined,
      icon: <IconMapPin className="w-5 h-5" />,
    },
    {
      id: "credits" as const,
      label: "Crédito en tiendas",
      description: "Saldos a favor por tienda",
      count: storeCredits.length > 0 ? storeCredits.length : undefined,
      icon: <IconCoins className="w-5 h-5" />,
    },
    {
      id: "account-details" as const,
      label: "Datos de cuenta",
      description: "Perfil, teléfono y seguridad",
      icon: <IconUser className="w-5 h-5" />,
    },
  ];


  return (
    <main className="min-h-screen bg-[#07090E] text-white pt-24 md:pt-32 pb-24 relative overflow-hidden">
      {/* ─── Encabezado Superior Oficial (Banner Idéntico a Directorio de Tiendas) ─── */}
      <div className="relative border-b border-white/[0.08] bg-[#0E121B] pb-10 mb-10 overflow-hidden">
        {/* Línea superior con gradiente oficial */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-dark via-red to-orange" />
        
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {/* Breadcrumb de navegación */}
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 font-medium">
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

          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red/15 text-red-light border border-red/30 mb-3">
            <IconShieldCheck className="w-3.5 h-3.5 text-red" />
            <span>Panel de Control de Comprador</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Perfil de Usuario
          </h1>

          {/* Bajada explicativa */}
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Administra tus pedidos, revisa el seguimiento en vivo de tus envíos y gestiona tus direcciones oficiales de despacho para compras en TapTrade.
          </p>
        </div>
      </div>

      {/* Contenedor Principal: Sidebar + Contenido */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
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
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 text-[10px] font-bold text-red bg-red/10 border border-red/20 rounded-full uppercase tracking-wider">
                    <IconShieldCheck className="w-3 h-3 text-red shrink-0" />
                    <span>Comprador Verificado</span>
                  </div>
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
                    <IconLogout className="w-4 h-4" />
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
                      <IconBox className="w-8 h-8 text-gray-500" />
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
                                    <span className="text-xs font-bold text-white flex items-center gap-2">
                                      <IconStore className="w-4 h-4 text-gray-400 shrink-0" />
                                      <span>Tienda: {vo.store.name}</span>
                                    </span>

                                    {vo.deliveryStatus === "DISPATCHED" ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>En camino (Despachado)</span>
                                      </span>
                                    ) : order.status === "PAID" ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span>En preparación en tienda</span>
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
                                        <p className="font-bold text-white flex items-center gap-2">
                                          <IconTruck className="w-4 h-4 text-emerald-400 shrink-0" />
                                          <span>Transporte: {vo.shippingCourier || "Courier Oficial"}</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <p className="text-gray-300 font-mono text-[11px]">
                                            N° Guía: <strong className="text-emerald-400">{vo.trackingNumber}</strong>
                                          </p>
                                          {vo.trackingNumber && (
                                            <button
                                              type="button"
                                              onClick={() => copyToClipboard(vo.trackingNumber!)}
                                              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors cursor-pointer font-medium ml-1"
                                              title="Copiar número de guía"
                                            >
                                              <IconCopy className="w-3 h-3" />
                                              <span>{copiedTracking === vo.trackingNumber ? "Copiado" : "Copiar"}</span>
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
                                          <IconExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                      )}
                                    </div>
                                  )}

                                  {/* Aviso si está pendiente de entrega */}
                                  {order.status === "PAID" && vo.deliveryStatus !== "DISPATCHED" && (
                                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-300/80 leading-relaxed flex items-center gap-2.5">
                                      <IconClock className="w-4 h-4 text-amber-400 shrink-0" />
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
                              <IconCreditCard className="w-4 h-4 text-gray-400 shrink-0" />
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

            {/* ══════════ PESTAÑA 2: DIRECCIONES MÚLTIPLES (GESTIÓN COMPLETA) ══════════ */}
            {activeTab === "addresses" && (
              <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Direcciones de Despacho</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Puedes guardar múltiples direcciones y marcar tu favorita para preseleccionarla automáticamente en el Checkout.
                    </p>
                  </div>
                  {!isAddressFormOpen && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleOpenCreateAddress}
                      leftIcon={<IconPlus className="w-3.5 h-3.5" />}
                    >
                      Agregar Dirección
                    </Button>
                  )}
                </div>

                {/* Mensaje global de feedback si existe */}
                {addressMsg && !isAddressFormOpen && (
                  <div
                    className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200 ${
                      addressMsg.type === "success"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                        : "bg-red/15 border border-red/30 text-red"
                    }`}
                  >
                    {addressMsg.type === "success" ? (
                      <IconCheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <IconAlertTriangle className="w-4 h-4 shrink-0 text-red" />
                    )}
                    <span>{addressMsg.text}</span>
                  </div>
                )}

                {loadingAddresses ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-red border-t-transparent animate-spin" />
                    <p className="text-xs text-gray-400">Cargando tus direcciones...</p>
                  </div>
                ) : isAddressFormOpen ? (
                  /* ── Formulario de Agregar / Editar Dirección ── */
                  <form onSubmit={handleSaveAddress} className="space-y-5 bg-[#0B0E14] border border-white/10 p-6 rounded-2xl shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <IconMapPin className="w-4 h-4 text-red" />
                        <span>{editingAddressId ? "Modificar Dirección de Envío" : "Nueva Dirección de Despacho"}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddressFormOpen(false);
                          setAddressMsg(null);
                        }}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        ✕ Cancelar
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-red/10 border border-red/20 text-xs text-red-200/90 leading-relaxed flex items-start gap-3">
                      <IconInfo className="w-4 h-4 text-red shrink-0 mt-0.5" />
                      <span>
                        Esta dirección se guardará en tu libreta y estará disponible en el selector de despacho al realizar tus compras.
                      </span>
                    </div>

                    {/* Alias / Nombre de la Dirección */}
                    <div className="space-y-1.5">
                      <label htmlFor="addr-alias" className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                        Etiqueta / Alias <span className="text-gray-500 font-normal">(Opcional)</span>
                      </label>
                      <input
                        type="text"
                        id="addr-alias"
                        value={addressForm.alias}
                        onChange={(e) => setAddressForm((p) => ({ ...p, alias: e.target.value }))}
                        placeholder="Ej: Casa, Oficina, Depto Playa, Sucursal Starken..."
                        className="w-full rounded-xl border border-white/10 bg-[#07090E] text-white px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-gray-600"
                      />
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

                    {/* Selector de Región y Comuna */}
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
                        Dirección de envío (Calle, número y depto) <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        id="addr-address"
                        required
                        value={addressForm.address}
                        onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))}
                        placeholder="Calle, número, departamento, villa o sucursal de retiro..."
                        className="w-full rounded-xl border border-white/10 bg-[#07090E] text-white px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-gray-600"
                      />
                    </div>

                    {/* Checkbox Predeterminada */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                          className="w-4 h-4 rounded text-red border-white/20 bg-[#07090E] focus:ring-red focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors">
                          Establecer como dirección predeterminada para compras
                        </span>
                      </label>
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
                        {addressMsg.type === "success" ? (
                          <IconCheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                        ) : (
                          <IconAlertTriangle className="w-4 h-4 shrink-0 text-red" />
                        )}
                        <span>{addressMsg.text}</span>
                      </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="pt-2 flex items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          setIsAddressFormOpen(false);
                          setAddressMsg(null);
                        }}
                      >
                        Cancelar
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={savingAddress}
                        leftIcon={<IconCheck className="w-4 h-4" />}
                      >
                        {editingAddressId ? "Actualizar Dirección" : "Guardar Dirección"}
                      </Button>
                    </div>
                  </form>
                ) : addresses.length === 0 ? (
                  /* ── Estado Vacío (Sin direcciones) ── */
                  <div className="py-16 px-4 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mx-auto shadow-inner">
                      <IconMapPin className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">No tienes direcciones guardadas</h4>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                        Agrega una o más direcciones de entrega para agilizar tus compras en el Checkout.
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleOpenCreateAddress}
                        leftIcon={<IconPlus className="w-4 h-4" />}
                      >
                        Agregar mi primera dirección
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── Cuadrícula de Direcciones Guardadas ── */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`bg-[#0B0E14] rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-md ${
                          addr.isDefault
                            ? "border-emerald-500/40 shadow-emerald-950/20"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="space-y-4">
                          {/* Encabezado de la Tarjeta */}
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
                            <div className="flex items-center gap-2">
                              <IconMapPin className={`w-4 h-4 ${addr.isDefault ? "text-emerald-400" : "text-gray-400"}`} />
                              <span className="font-bold text-white text-sm">
                                {addr.alias || "Dirección"}
                              </span>
                            </div>

                            {addr.isDefault ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>Predeterminada</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id)}
                                className="text-[11px] text-gray-400 hover:text-white underline transition-colors"
                              >
                                Hacer predeterminada
                              </button>
                            )}
                          </div>

                          {/* Datos de la Dirección */}
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-gray-500 text-[10px] uppercase font-bold block">Destinatario</span>
                              <span className="text-white font-medium">{addr.name}</span>
                            </div>

                            <div>
                              <span className="text-gray-500 text-[10px] uppercase font-bold block">Teléfono</span>
                              <span className="text-gray-300 font-mono">{addr.phone}</span>
                            </div>

                            <div>
                              <span className="text-gray-500 text-[10px] uppercase font-bold block">Comuna y Región</span>
                              <span className="text-gray-300">{addr.city} ({addr.regionCode})</span>
                            </div>

                            <div>
                              <span className="text-gray-500 text-[10px] uppercase font-bold block">Calle y Número</span>
                              <span className="text-white font-medium leading-relaxed">{addr.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Botones de Acción al Pie */}
                        <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEditAddress(addr)}
                            leftIcon={<IconPencil className="w-3.5 h-3.5" />}
                          >
                            Editar
                          </Button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-red hover:bg-red/10 border border-transparent hover:border-red/20 transition-all"
                            title="Eliminar dirección"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══════════ PESTAÑA 3: CRÉDITOS EN TIENDAS ══════════ */}
            {activeTab === "credits" && (
              <div className="space-y-6">
                <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-white/10">
                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">Crédito en Tiendas</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Saldos a favor acumulados por devoluciones o acuerdos con cada tienda de TapTrade.
                      </p>
                    </div>

                    {/* Total general acumulado */}
                    {storeCredits.length > 0 && (
                      <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                        <IconCoins className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Total en Tiendas</p>
                          <p className="text-sm font-black text-amber-400">
                            ${storeCredits.reduce((acc, curr) => acc + Number(curr.balance), 0).toLocaleString("es-CL")} CLP
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {loadingCredits ? (
                    <div className="p-12 text-center text-gray-500 text-sm">
                      Cargando saldos en tiendas...
                    </div>
                  ) : storeCredits.length === 0 ? (
                    <div className="p-10 text-center rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-400">
                        <IconCoins className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">No tienes crédito disponible</h4>
                      <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                        Actualmente no tienes saldos a favor en ninguna tienda. Cuando una tienda te emita crédito por reembolsos o canjes, aparecerán listados aquí y podrás utilizarlos automáticamente en el checkout.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {storeCredits.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-red/40 transition-all space-y-4 flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-red/10 border border-red/30 flex items-center justify-center text-red font-bold shrink-0">
                                <IconStore className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-white truncate">
                                  {item.store.name}
                                </h4>
                                <p className="text-xs text-gray-400">
                                  @{item.store.subdomain}
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Activo
                            </span>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-gray-400">Saldo disponible</span>
                              <p className="text-lg font-black text-emerald-400">
                                ${Number(item.balance).toLocaleString("es-CL")} CLP
                              </p>
                            </div>

                            <Link
                              href={`/shop/store/${item.store.subdomain}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-colors"
                            >
                              <span>Ver vitrina</span>
                              <span>→</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Historial de Movimientos de Crédito */}
                  {creditTransactions.length > 0 && (
                    <div className="pt-6 border-t border-white/10 space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                        Historial de Movimientos
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-white/10">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#0B0E14] text-gray-400 font-bold uppercase border-b border-white/10">
                            <tr>
                              <th className="py-3 px-4">Fecha</th>
                              <th className="py-3 px-4">Tienda</th>
                              <th className="py-3 px-4">Tipo</th>
                              <th className="py-3 px-4">Monto</th>
                              <th className="py-3 px-4">Referencia</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-gray-300">
                            {creditTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-white/[0.02]">
                                <td className="py-3 px-4 font-mono text-[11px] text-gray-400">
                                  {new Date(tx.createdAt).toLocaleDateString("es-CL")}
                                </td>
                                <td className="py-3 px-4 font-semibold text-white">
                                  {tx.store?.name || "Tienda"}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    Number(tx.amount) >= 0
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                      : "bg-red/10 text-red border border-red/20"
                                  }`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className={`py-3 px-4 font-black ${
                                  Number(tx.amount) >= 0 ? "text-emerald-400" : "text-red"
                                }`}>
                                  {Number(tx.amount) >= 0 ? "+" : ""}${Number(tx.amount).toLocaleString("es-CL")} CLP
                                </td>
                                <td className="py-3 px-4 text-gray-400 text-[11px]">
                                  {tx.reference || "Ajuste de saldo"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════ PESTAÑA 4: DATOS DE CUENTA (PERFIL PERSONAL) ══════════ */}
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
                      <span className="absolute right-3.5 top-3.5 text-xs text-gray-500 inline-flex items-center gap-1.5">
                        <IconLock className="w-3.5 h-3.5 text-gray-500" />
                        <span>Bloqueado</span>
                      </span>
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
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <IconBox className="w-4 h-4 text-red shrink-0" />
                          <span>Dirección Predeterminada para Despacho</span>
                        </span>
                        <p className="text-xs text-gray-400">
                          {addresses.find((a) => a.isDefault) ? (
                            <>
                              {addresses.find((a) => a.isDefault)?.address},{" "}
                              {addresses.find((a) => a.isDefault)?.city} (
                              {addresses.find((a) => a.isDefault)?.regionCode})
                            </>
                          ) : addresses.length > 0 ? (
                            <>
                              {addresses[0].address}, {addresses[0].city} ({addresses[0].regionCode})
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
                        Gestionar {addresses.length > 0 ? `(${addresses.length})` : ""} en Direcciones →
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
                      {accountMsg.type === "success" ? (
                        <IconCheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <IconAlertTriangle className="w-4 h-4 shrink-0 text-red" />
                      )}
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
                      leftIcon={<IconCheck className="w-4 h-4" />}
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
};

export default MyAccount;
