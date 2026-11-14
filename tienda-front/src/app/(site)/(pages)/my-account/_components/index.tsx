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
  IconUser,
  IconPencil,
  IconPlus,
  IconTrash,
  IconCopy,
  IconCoins,
  IconExternalLink,
  IconClock,
  IconZap,
  IconInfo,
  IconCheck,
  IconCheckCircle,
  IconAlertTriangle,
  IconLogout,
  IconLoader,
  IconChevronDown,
  IconChevronUp,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@/components/ui/Icons";
import CarrierTimeline from "@/components/ui/CarrierTimeline";
import { useTranslations } from "next-intl";

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

const STATUS_MAP_STYLES: Record<string, { key: string; cls: string; dot: string }> = {
  PENDING:   { key: "status_pending",   cls: "bg-amber-500/15 text-amber-400 border border-amber-500/30", dot: "bg-amber-400" },
  PAID:      { key: "status_paid",      cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", dot: "bg-emerald-400" },
  FAILED:    { key: "status_failed",    cls: "bg-red/15 text-red border border-red/30", dot: "bg-red" },
  CANCELLED: { key: "status_cancelled", cls: "bg-white/10 text-gray-400 border border-white/15", dot: "bg-gray-400" },
  REFUNDED:  { key: "status_refunded",  cls: "bg-purple-500/15 text-purple-400 border border-purple-500/30", dot: "bg-purple-400" },
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
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
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
  const [ordersPage, setOrdersPage] = useState(1);
  const ORDERS_PER_PAGE = 5;

  // Filtrado estricto: En la vista de comprador sólo se listan compras efectivas (PAID / REFUNDED)
  const visibleOrders = orders.filter((o) => o.status === "PAID" || o.status === "REFUNDED");
  const totalOrderPages = Math.max(1, Math.ceil(visibleOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = visibleOrders.slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE);

  useEffect(() => {
    if (ordersPage > totalOrderPages) {
      setOrdersPage(1);
    }
  }, [ordersPage, totalOrderPages]);

  // Estado para visualización interactiva de la línea de tiempo oficial
  const [trackingDataMap, setTrackingDataMap] = useState<Record<string, any>>({});
  const [loadingTrackingId, setLoadingTrackingId] = useState<string | null>(null);

  const handleToggleTracking = async (voId: string, courier: string, trackingNum: string) => {
    if (trackingDataMap[voId]) {
      setTrackingDataMap((prev) => {
        const next = { ...prev };
        delete next[voId];
        return next;
      });
      return;
    }

    setLoadingTrackingId(voId);
    try {
      const res = await fetch(
        `${API_URL}/shipping/validate-tracking?courier=${encodeURIComponent(
          courier
        )}&trackingNumber=${encodeURIComponent(trackingNum)}&vendorOrderId=${encodeURIComponent(
          voId
        )}`,
        {
          credentials: "include",
        }
      );
      if (res.ok) {
        const data = await res.json();
        setTrackingDataMap((prev) => ({ ...prev, [voId]: data }));
      }
    } catch (err) {
      console.error("Error loading tracking", err);
    } finally {
      setLoadingTrackingId(null);
    }
  };


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
      setAddressMsg({ type: "error", text: t("err_enter_street") });
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

      if (!res.ok) throw new Error(t("err_save_address"));
      await fetchAddresses();
      await fetchProfile();
      setAddressMsg({
        type: "success",
        text: editingAddressId
          ? t("msg_address_updated")
          : t("msg_address_created"),
      });
      setIsAddressFormOpen(false);
    } catch (err: any) {
      setAddressMsg({ type: "error", text: err.message || t("err_save_address") });
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
    if (!confirm(t("confirm_delete_address"))) return;
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
      if (!res.ok) throw new Error(t("err_save_account"));
      const updated = await res.json();
      setProfile(updated);
      setAccountMsg({ type: "success", text: t("msg_account_updated") });
    } catch (err: any) {
      setAccountMsg({ type: "error", text: err.message || t("err_save_account") });
    } finally {
      setSavingAccount(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(text);
    setTimeout(() => setCopiedTracking(null), 2500);
  };

  const displayName = profile?.name || user?.name || user?.email?.split("@")[0] || "TapTrade";
  const displayEmail = profile?.email || user?.email || "";
  const initial = displayName.slice(0, 1).toUpperCase();

  const tabsConfig = [
    {
      id: "orders" as const,
      label: t("orders"),
      description: t("tab_orders_desc"),
      count: orders.length > 0 ? orders.length : undefined,
      icon: <IconBox className="w-5 h-5" />,
    },
    {
      id: "addresses" as const,
      label: t("addresses"),
      description: t("tab_addresses_desc"),
      count: addresses.length > 0 ? addresses.length : undefined,
      icon: <IconMapPin className="w-5 h-5" />,
    },
    {
      id: "credits" as const,
      label: t("credits"),
      description: t("tab_credits_desc"),
      count: storeCredits.length > 0 ? storeCredits.length : undefined,
      icon: <IconCoins className="w-5 h-5" />,
    },
    {
      id: "account-details" as const,
      label: t("details"),
      description: t("tab_details_desc"),
      icon: <IconUser className="w-5 h-5" />,
    },
  ];


  return (
    <main className="min-h-screen bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] pt-24 md:pt-32 pb-24 relative overflow-hidden transition-colors duration-200">
      {/* ─── Encabezado Superior Oficial (Banner Idéntico a Directorio de Tiendas) ─── */}
      <div className="relative border-b border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] pb-10 mb-10 overflow-hidden">
        {/* Línea superior con gradiente oficial */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-dark via-red to-orange" />
        
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          {/* Breadcrumb de navegación */}
          <div className="flex items-center gap-2 text-xs text-[var(--tt-text-muted)] mb-4 font-medium">
            <Link href="/" className="hover:text-[var(--tt-text-main)] transition-colors">
              {t("breadcrumb_home")}
            </Link>
            <span>/</span>
            <span className="text-[var(--tt-text-main)] font-semibold">{t("title")}</span>
            <span>/</span>
            <span className="text-red font-semibold capitalize">
              {tabsConfig.find((t) => t.id === activeTab)?.label}
            </span>
          </div>

          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red/15 text-red-light border border-red/30 mb-3">
            <IconShieldCheck className="w-3.5 h-3.5 text-red" />
            <span>{t("control_panel_buyer")}</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--tt-text-main)] mb-3">
            {t("page_title")}
          </h1>

          {/* Bajada explicativa */}
          <p className="text-[var(--tt-text-muted)] text-sm sm:text-base max-w-2xl leading-relaxed">
            {t("page_subtitle")}
          </p>
        </div>
      </div>

      {/* Contenedor Principal: Sidebar + Contenido */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ─── Columna Izquierda: Tarjeta de Usuario y Tabs (4 cols) ─── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Resumen del Usuario */}
              <div className="flex items-center gap-4 pb-6 border-b border-[var(--tt-border-medium)]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-dark to-red text-white font-black text-xl flex items-center justify-center border border-red/40 shadow-lg shadow-red/30 shrink-0">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold text-[var(--tt-text-main)] truncate leading-tight">
                    {displayName}
                  </h2>
                  <p className="text-xs text-[var(--tt-text-muted)] truncate mt-0.5" title={displayEmail}>
                    {displayEmail}
                  </p>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 text-[10px] font-bold text-red bg-red/10 border border-red/20 rounded-full uppercase tracking-wider">
                    <IconShieldCheck className="w-3.5 h-3.5 text-red shrink-0" />
                    <span>{t("verified_buyer")}</span>
                  </div>
                </div>
              </div>

              {/* Pestañas de Navegación Vertical */}
              <nav className="space-y-1.5" aria-label={t("nav_tabs_aria")}>
                {tabsConfig.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 group shadow-sm ${
                        isActive
                          ? "bg-gradient-to-r from-red-dark to-red text-white font-bold shadow-lg shadow-red/25 border border-red/40"
                          : "bg-[var(--tt-bg-subtle)] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[var(--tt-bg-surface)] text-[var(--tt-text-muted)] group-hover:text-red group-hover:bg-red/10"
                          }`}
                        >
                          {tab.icon}
                        </div>
                        <div>
                          <p className={`text-xs ${isActive ? "text-white font-bold" : "text-[var(--tt-text-main)]"}`}>
                            {tab.label}
                          </p>
                          <p className={`text-[10px] ${isActive ? "text-white/80" : "text-[var(--tt-text-muted)]"}`}>
                            {tab.description}
                          </p>
                        </div>
                      </div>

                      {tab.count !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            isActive ? "bg-white text-red-dark" : "bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-muted)]"
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
              <div className="pt-2 border-t border-[var(--tt-border-medium)]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red hover:text-white hover:bg-red/20 border border-red/20 hover:border-red/40 transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-red/10 group-hover:bg-red/30 text-red flex items-center justify-center transition-colors">
                    <IconLogout className="w-4 h-4" />
                  </div>
                  <span>{t("logout")}</span>
                </button>
              </div>

            </div>
          </div>

          {/* ─── Columna Derecha: Contenido de la Pestaña Activa (8 cols) ─── */}
          <div className="lg:col-span-8">

            {/* ══════════ PESTAÑA 1: MIS PEDIDOS ══════════ */}
            {activeTab === "orders" && (
              <div className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--tt-border-medium)]">
                  <div>
                    <h3 className="text-xl font-black text-[var(--tt-text-main)] tracking-tight">{t("orders")}</h3>
                    <p className="text-xs text-[var(--tt-text-muted)] mt-0.5">
                      {t("orders_subtitle")}
                    </p>
                  </div>
                  {visibleOrders.length > 0 && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-[var(--tt-text-muted)] font-mono">
                      {visibleOrders.length} {visibleOrders.length === 1 ? t("order_single") : t("order_plural")}
                    </span>
                  )}
                </div>

                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-red border-t-transparent animate-spin" />
                    <p className="text-xs text-[var(--tt-text-muted)]">{t("loading_orders")}</p>
                  </div>
                ) : visibleOrders.length === 0 ? (
                  <div className="py-16 px-4 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex items-center justify-center text-[var(--tt-text-muted)] mx-auto shadow-inner">
                      <IconBox className="w-8 h-8 text-[var(--tt-text-subtle)]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[var(--tt-text-main)]">{t("no_orders_yet")}</h4>
                      <p className="text-xs text-[var(--tt-text-muted)] max-w-sm mx-auto mt-1">
                        {t("no_orders_desc")}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link href="/shop">
                        <Button variant="primary" size="md">
                          {t("go_to_store")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {paginatedOrders.map((order) => {
                      const stStyle = STATUS_MAP_STYLES[order.status];
                      const st = stStyle
                        ? { label: t(stStyle.key as any), cls: stStyle.cls, dot: stStyle.dot }
                        : {
                            label: order.status,
                            cls: "bg-[var(--tt-bg-subtle)] text-[var(--tt-text-muted)] border border-[var(--tt-border-medium)]",
                            dot: "bg-gray-400",
                          };
                      return (
                        <div
                          key={order.id}
                          className="bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] rounded-2xl p-5 sm:p-6 space-y-4 hover:border-red/30 transition-all shadow-md"
                        >
                          {/* Encabezado del Pedido */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--tt-border-medium)]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">{t("order_label")}</span>
                                <span className="font-mono text-sm font-black text-[var(--tt-text-main)]">{order.buyOrder}</span>
                              </div>
                              <p className="text-xs text-[var(--tt-text-muted)] mt-0.5">
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
                              <span className="font-mono font-black text-base sm:text-lg text-[var(--tt-text-main)]">
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
                                  className="bg-[var(--tt-bg-surface)] rounded-xl p-4 border border-[var(--tt-border-medium)] space-y-3"
                                >
                                  {/* Encabezado de la Tienda y Estado */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--tt-border-medium)] pb-2.5">
                                    <span className="text-xs font-bold text-[var(--tt-text-main)] flex items-center gap-2">
                                      <IconStore className="w-4 h-4 text-[var(--tt-text-muted)] shrink-0" />
                                      <span>{t("store_prefix", { name: vo.store.name })}</span>
                                    </span>

                                    {vo.deliveryStatus === "DISPATCHED" ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>{t("dispatched_status")}</span>
                                      </span>
                                    ) : order.status === "PAID" ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        <span>{t("preparing_status")}</span>
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--tt-bg-subtle)] text-[var(--tt-text-muted)]">
                                        {order.status}
                                      </span>
                                    )}
                                  </div>

                                  {/* Tarjeta de Guía Oficial si está Despachado */}
                                  {vo.deliveryStatus === "DISPATCHED" && (
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-3">
                                      <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="space-y-1">
                                          <p className="font-bold text-[var(--tt-text-main)] flex items-center gap-2">
                                            <IconTruck className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>{t("courier_prefix", { courier: vo.shippingCourier || t("official_courier") })}</span>
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <p className="text-[var(--tt-text-muted)] font-mono text-[11px]">
                                              {t("tracking_num_label")} <strong className="text-emerald-400">{vo.trackingNumber}</strong>
                                            </p>
                                            {vo.trackingNumber && (
                                              <button
                                                type="button"
                                                onClick={() => copyToClipboard(vo.trackingNumber!)}
                                                className="inline-flex items-center gap-1 text-[11px] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] transition-colors cursor-pointer font-medium ml-1"
                                                title={t("copy_tracking_title")}
                                              >
                                                <IconCopy className="w-3 h-3" />
                                                <span>{copiedTracking === vo.trackingNumber ? t("copied") : t("copy")}</span>
                                              </button>
                                            )}
                                          </div>
                                          {vo.dispatchedAt && (
                                            <p className="text-[10px] text-[var(--tt-text-muted)]">
                                              {t("dispatched_on")}{" "}
                                              {new Date(vo.dispatchedAt).toLocaleDateString("es-CL", {
                                                day: "2-digit",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })}
                                            </p>
                                          )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                          {/* Botón Ver Línea de Tiempo en Vivo para el Comprador */}
                                          {vo.trackingNumber && !vo.trackingNumber.toUpperCase().includes("RETIRO") && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleToggleTracking(
                                                  vo.id,
                                                  vo.shippingCourier || "CHILEXPRESS",
                                                  vo.trackingNumber!
                                                )
                                              }
                                              disabled={loadingTrackingId === vo.id}
                                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                                            >
                                              {loadingTrackingId === vo.id ? (
                                                <>
                                                  <IconLoader className="w-3.5 h-3.5 text-blue-400" />
                                                  <span>{t("consulting")}</span>
                                                </>
                                              ) : trackingDataMap[vo.id] ? (
                                                <>
                                                  <IconChevronUp className="w-3.5 h-3.5" />
                                                  <span>{t("hide_tracking")}</span>
                                                </>
                                              ) : (
                                                <>
                                                  <IconClock className="w-3.5 h-3.5 text-emerald-400" />
                                                  <span>{t("view_live_tracking")}</span>
                                                </>
                                              )}
                                            </button>
                                          )}

                                          {vo.trackingUrl && (
                                            <a
                                              href={vo.trackingUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="px-3 py-2 rounded-xl bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] border border-[var(--tt-border-medium)] font-semibold text-xs transition-all flex items-center gap-1.5"
                                            >
                                              <span>{t("track_on_web")}</span>
                                              <IconExternalLink className="w-3.5 h-3.5 text-[var(--tt-text-muted)]" />
                                            </a>
                                          )}
                                        </div>
                                      </div>

                                      {/* Banner Protocolo Unboxing TapTrade Shield */}
                                      <div className="w-full p-3 rounded-lg bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex items-start gap-3">
                                        <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                                          <IconShieldCheck className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1 text-left">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                              {t("unboxing_badge")}
                                            </span>
                                            <span className="font-bold text-[11px] text-[var(--tt-text-main)]">
                                              {t("unboxing_banner_title")}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-[var(--tt-text-muted)] leading-relaxed">
                                            {t("unboxing_banner_desc")}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Línea de tiempo oficial desplegada para el cliente */}
                                      {trackingDataMap[vo.id] && (
                                        <div className="w-full pt-3 border-t border-emerald-500/20 animate-fadeIn">
                                          <CarrierTimeline
                                            courierName={vo.shippingCourier || "Chilexpress"}
                                            trackingNumber={vo.trackingNumber!}
                                            trackingUrl={vo.trackingUrl || trackingDataMap[vo.id]?.trackingUrl}
                                            status={trackingDataMap[vo.id]?.status}
                                            destination={trackingDataMap[vo.id]?.destination}
                                            service={trackingDataMap[vo.id]?.service}
                                            events={trackingDataMap[vo.id]?.events}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Aviso si está pendiente de entrega */}
                                  {order.status === "PAID" && vo.deliveryStatus !== "DISPATCHED" && (
                                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-amber-600 dark:text-amber-300/80 leading-relaxed flex items-center gap-2.5">
                                      <IconClock className="w-4 h-4 text-amber-400 shrink-0" />
                                      <span>
                                        {t("preparing_toploaders_notice")}
                                      </span>
                                    </div>
                                  )}

                                  {/* Items del paquete */}
                                  <div className="space-y-1.5 pt-1">
                                    {vo.items.map((item) => (
                                      <div key={item.id} className="flex justify-between text-xs text-[var(--tt-text-muted)]">
                                        <span>
                                          {item.productName} <span className="text-[var(--tt-text-subtle)]">× {item.quantity}</span>
                                        </span>
                                        <span className="font-mono text-[var(--tt-text-main)] font-medium">
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
                            <div className="bg-[var(--tt-bg-surface)] rounded-xl p-3.5 space-y-1.5 border border-[var(--tt-border-medium)]">
                              {order.items?.map((item) => (
                                <div key={item.id} className="flex justify-between text-xs text-[var(--tt-text-muted)]">
                                  <span>
                                    {item.productName} <span className="text-[var(--tt-text-subtle)]">× {item.quantity}</span>
                                  </span>
                                  <span className="font-mono text-[var(--tt-text-main)] font-medium">
                                    ${(parseFloat(item.unitPrice) * item.quantity).toLocaleString("es-CL")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pie con método de pago */}
                          {order.payment?.cardLast4 && (
                            <div className="pt-2 flex items-center gap-2 text-xs text-[var(--tt-text-muted)]">
                              <IconCreditCard className="w-4 h-4 text-[var(--tt-text-muted)] shrink-0" />
                              <span>{t("card_ending_in", { last4: order.payment.cardLast4 })}</span>
                              {order.payment.authCode && <span>· {t("auth_code_label", { code: order.payment.authCode })}</span>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Paginador de Pedidos */}
                {totalOrderPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--tt-border-medium)]">
                    <p className="text-xs text-[var(--tt-text-muted)] font-medium">
                      {t("pagination_showing_orders", {
                        from: (ordersPage - 1) * ORDERS_PER_PAGE + 1,
                        to: Math.min(ordersPage * ORDERS_PER_PAGE, visibleOrders.length),
                        total: visibleOrders.length,
                      })}
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setOrdersPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={ordersPage === 1}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        aria-label={t("pagination_prev")}
                      >
                        <IconChevronLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{t("pagination_prev")}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((pageNum) => {
                          const isActive = pageNum === ordersPage;
                          return (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => {
                                setOrdersPage(pageNum);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isActive
                                  ? "bg-red text-white shadow-sm shadow-red/30"
                                  : "bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-canvas)]"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setOrdersPage((p) => Math.min(totalOrderPages, p + 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={ordersPage === totalOrderPages}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                        aria-label={t("pagination_next")}
                      >
                        <span className="hidden sm:inline">{t("pagination_next")}</span>
                        <IconChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════ PESTAÑA 2: DIRECCIONES MÚLTIPLES (GESTIÓN COMPLETA) ══════════ */}
            {activeTab === "addresses" && (
              <div className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--tt-border-medium)]">
                  <div>
                    <h3 className="text-xl font-black text-[var(--tt-text-main)] tracking-tight">{t("addresses_title")}</h3>
                    <p className="text-xs text-[var(--tt-text-muted)] mt-0.5">
                      {t("addresses_subtitle")}
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
                      {t("add_address")}
                    </Button>
                  )}
                </div>

                {/* Mensaje global de feedback si existe */}
                {addressMsg && !isAddressFormOpen && (
                  <div
                    className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200 ${
                      addressMsg.type === "success"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
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
                    <p className="text-xs text-[var(--tt-text-muted)]">{t("loading_addresses")}</p>
                  </div>
                ) : isAddressFormOpen ? (
                  /* ── Formulario de Agregar / Editar Dirección ── */
                  <form onSubmit={handleSaveAddress} className="space-y-5 bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] p-6 rounded-2xl shadow-md">
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--tt-border-medium)]">
                      <h4 className="text-sm font-bold text-[var(--tt-text-main)] flex items-center gap-2">
                        <IconMapPin className="w-4 h-4 text-red" />
                        <span>{editingAddressId ? t("edit_shipping_address") : t("new_shipping_address")}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddressFormOpen(false);
                          setAddressMsg(null);
                        }}
                        className="text-xs text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] inline-flex items-center gap-1"
                      >
                        <IconX className="w-3.5 h-3.5" /> {t("cancel")}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-red/10 border border-red/20 text-xs text-red leading-relaxed flex items-start gap-3">
                      <IconInfo className="w-4 h-4 text-red shrink-0 mt-0.5" />
                      <span>
                        {t("address_book_notice")}
                      </span>
                    </div>

                    {/* Alias / Nombre de la Dirección */}
                    <div className="space-y-1.5">
                      <label htmlFor="addr-alias" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                        {t("alias_label")} <span className="text-[var(--tt-text-subtle)] font-normal">{t("optional_tag")}</span>
                      </label>
                      <input
                        type="text"
                        id="addr-alias"
                        value={addressForm.alias}
                        onChange={(e) => setAddressForm((p) => ({ ...p, alias: e.target.value }))}
                        placeholder={t("alias_placeholder")}
                        className="w-full rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-[var(--tt-text-subtle)]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Nombre Completo */}
                      <div className="space-y-1.5">
                        <label htmlFor="addr-name" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                          {t("recipient_full_name")} <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          id="addr-name"
                          required
                          value={addressForm.name}
                          onChange={(e) => setAddressForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder={t("name_placeholder")}
                          className="w-full rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-[var(--tt-text-subtle)]"
                        />
                      </div>

                      {/* Teléfono de Contacto */}
                      <div className="space-y-1.5">
                        <label htmlFor="addr-phone" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                          {t("contact_phone_label")} <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          id="addr-phone"
                          required
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+56 9 1234 5678"
                          className="w-full rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-[var(--tt-text-subtle)] font-mono"
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
                      <label htmlFor="addr-address" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                        {t("shipping_street_label")} <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        id="addr-address"
                        required
                        value={addressForm.address}
                        onChange={(e) => setAddressForm((p) => ({ ...p, address: e.target.value }))}
                        placeholder={t("shipping_street_placeholder")}
                        className="w-full rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-[var(--tt-text-subtle)]"
                      />
                    </div>

                    {/* Checkbox Predeterminada */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                          className="w-4 h-4 rounded text-red border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] focus:ring-red focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-[var(--tt-text-muted)] group-hover:text-[var(--tt-text-main)] transition-colors">
                          {t("set_default_checkbox")}
                        </span>
                      </label>
                    </div>

                    {/* Mensaje de Feedback */}
                    {addressMsg && (
                      <div
                        className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200 ${
                          addressMsg.type === "success"
                            ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
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
                        {t("cancel")}
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={savingAddress}
                        leftIcon={<IconCheck className="w-4 h-4" />}
                      >
                        {editingAddressId ? t("update_address_btn") : t("save_address_btn")}
                      </Button>
                    </div>
                  </form>
                ) : addresses.length === 0 ? (
                  /* ── Estado Vacío (Sin direcciones) ── */
                  <div className="py-16 px-4 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex items-center justify-center text-[var(--tt-text-muted)] mx-auto shadow-inner">
                      <IconMapPin className="w-8 h-8 text-[var(--tt-text-subtle)]" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[var(--tt-text-main)]">{t("no_saved_addresses")}</h4>
                      <p className="text-xs text-[var(--tt-text-muted)] max-w-sm mx-auto mt-1">
                        {t("no_addresses_desc")}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleOpenCreateAddress}
                        leftIcon={<IconPlus className="w-4 h-4" />}
                      >
                        {t("add_first_address_btn")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── Cuadrícula de Direcciones Guardadas ── */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`bg-[var(--tt-bg-subtle)] rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-md ${
                          addr.isDefault
                            ? "border-emerald-500/40 shadow-emerald-950/20"
                            : "border-[var(--tt-border-medium)] hover:border-red/30"
                        }`}
                      >
                        <div className="space-y-4">
                          {/* Encabezado de la Tarjeta */}
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-[var(--tt-border-medium)]">
                            <div className="flex items-center gap-2">
                              <IconMapPin className={`w-4 h-4 ${addr.isDefault ? "text-emerald-400" : "text-[var(--tt-text-muted)]"}`} />
                              <span className="font-bold text-[var(--tt-text-main)] text-sm">
                                {addr.alias || t("default_address_alias")}
                              </span>
                            </div>

                            {addr.isDefault ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>{t("default_badge")}</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(addr.id)}
                                className="text-[11px] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] underline transition-colors"
                              >
                                {t("make_default_btn")}
                              </button>
                            )}
                          </div>

                          {/* Datos de la Dirección */}
                          <div className="space-y-2 text-xs">
                            <div>
                              <span className="text-[var(--tt-text-subtle)] text-[10px] uppercase font-bold block">{t("recipient")}</span>
                              <span className="text-[var(--tt-text-main)] font-medium">{addr.name}</span>
                            </div>

                            <div>
                              <span className="text-[var(--tt-text-subtle)] text-[10px] uppercase font-bold block">{t("phone")}</span>
                              <span className="text-[var(--tt-text-muted)] font-mono">{addr.phone}</span>
                            </div>

                            <div>
                              <span className="text-[var(--tt-text-subtle)] text-[10px] uppercase font-bold block">{t("commune_and_region")}</span>
                              <span className="text-[var(--tt-text-muted)]">{addr.city} ({addr.regionCode})</span>
                            </div>

                            <div>
                              <span className="text-[var(--tt-text-subtle)] text-[10px] uppercase font-bold block">{t("street_and_number")}</span>
                              <span className="text-[var(--tt-text-main)] font-medium leading-relaxed">{addr.address}</span>
                            </div>
                          </div>
                        </div>

                        {/* Botones de Acción al Pie */}
                        <div className="pt-4 mt-4 border-t border-[var(--tt-border-medium)] flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenEditAddress(addr)}
                            leftIcon={<IconPencil className="w-3.5 h-3.5" />}
                          >
                            {t("edit")}
                          </Button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-2 rounded-xl text-[var(--tt-text-muted)] hover:text-red hover:bg-red/10 border border-transparent hover:border-red/20 transition-all"
                            title={t("delete_address_title")}
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
                <div className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[var(--tt-border-medium)]">
                    <div>
                      <h3 className="text-xl font-black text-[var(--tt-text-main)] tracking-tight">{t("credits")}</h3>
                      <p className="text-xs text-[var(--tt-text-muted)] mt-0.5">
                        {t("credits_subtitle")}
                      </p>
                    </div>

                    {/* Total general acumulado */}
                    {storeCredits.length > 0 && (
                      <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                        <IconCoins className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                        <div>
                          <p className="text-[10px] uppercase font-bold text-[var(--tt-text-muted)]">{t("total_in_stores")}</p>
                          <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                            ${storeCredits.reduce((acc, curr) => acc + Number(curr.balance), 0).toLocaleString("es-CL")} CLP
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {loadingCredits ? (
                    <div className="p-12 text-center text-[var(--tt-text-muted)] text-sm">
                      {t("loading_credits")}
                    </div>
                  ) : storeCredits.length === 0 ? (
                    <div className="p-10 text-center rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] flex items-center justify-center mx-auto text-[var(--tt-text-muted)]">
                        <IconCoins className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-[var(--tt-text-main)]">{t("no_credit_available")}</h4>
                      <p className="text-xs text-[var(--tt-text-muted)] max-w-md mx-auto leading-relaxed">
                        {t("no_credits_desc")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {storeCredits.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] hover:border-red/40 transition-all space-y-4 flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-red/10 border border-red/30 flex items-center justify-center text-red font-bold shrink-0">
                                <IconStore className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-[var(--tt-text-main)] truncate">
                                  {item.store.name}
                                </h4>
                                <p className="text-xs text-[var(--tt-text-muted)]">
                                  @{item.store.subdomain}
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
                              {t("active_badge")}
                            </span>
                          </div>

                          <div className="pt-2 border-t border-[var(--tt-border-medium)] flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[var(--tt-text-muted)]">{t("balance")}</span>
                              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                ${Number(item.balance).toLocaleString("es-CL")} CLP
                              </p>
                            </div>

                            <Link
                              href={`/shop/store/${item.store.subdomain}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--tt-bg-surface)] hover:bg-[var(--tt-bg-canvas)] text-xs font-semibold text-[var(--tt-text-main)] border border-[var(--tt-border-medium)] transition-colors"
                            >
                              <span>{t("view_storefront")}</span>
                              <span>→</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Historial de Movimientos de Crédito */}
                  {creditTransactions.length > 0 && (
                    <div className="pt-6 border-t border-[var(--tt-border-medium)] space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                        {t("movements_history")}
                      </h4>
                      <div className="overflow-x-auto rounded-xl border border-[var(--tt-border-medium)]">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[var(--tt-bg-subtle)] text-[var(--tt-text-muted)] font-bold uppercase border-b border-[var(--tt-border-medium)]">
                            <tr>
                              <th className="py-3 px-4">{tCommon("date")}</th>
                              <th className="py-3 px-4">{t("store")}</th>
                              <th className="py-3 px-4">{t("type")}</th>
                              <th className="py-3 px-4">{tCommon("total")}</th>
                              <th className="py-3 px-4">{t("reference")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--tt-border-light)] text-[var(--tt-text-muted)]">
                            {creditTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-[var(--tt-bg-surface)]/50">
                                <td className="py-3 px-4 font-mono text-[11px] text-[var(--tt-text-muted)]">
                                  {new Date(tx.createdAt).toLocaleDateString("es-CL")}
                                </td>
                                <td className="py-3 px-4 font-semibold text-[var(--tt-text-main)]">
                                  {tx.store?.name || t("store")}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    Number(tx.amount) >= 0
                                      ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
                                      : "bg-red/10 text-red border border-red/20"
                                  }`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className={`py-3 px-4 font-black ${
                                  Number(tx.amount) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red"
                                }`}>
                                  {Number(tx.amount) >= 0 ? "+" : ""}${Number(tx.amount).toLocaleString("es-CL")} CLP
                                </td>
                                <td className="py-3 px-4 text-[var(--tt-text-muted)] text-[11px]">
                                  {tx.reference || t("balance_adjustment")}
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

              <div className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="pb-5 border-b border-[var(--tt-border-medium)]">
                  <h3 className="text-xl font-black text-[var(--tt-text-main)] tracking-tight">{t("details")}</h3>
                  <p className="text-xs text-[var(--tt-text-muted)] mt-0.5">
                    {t("details_subtitle")}
                  </p>
                </div>

                <form onSubmit={handleSaveAccount} className="space-y-6">
                  {/* Correo Electrónico (Solo Lectura) */}
                  <div className="space-y-1.5">
                    <label htmlFor="profile-email" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                      {t("email")}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="profile-email"
                        value={profile?.email ?? ""}
                        disabled
                        className="w-full rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] text-[var(--tt-text-muted)] px-4 py-3 text-sm outline-none cursor-not-allowed font-medium"
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs text-[var(--tt-text-subtle)] inline-flex items-center gap-1.5">
                        <IconLock className="w-3.5 h-3.5 text-[var(--tt-text-subtle)]" />
                        <span>{t("locked_badge")}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--tt-text-subtle)]">{t("email_readonly_note")}</p>
                  </div>

                  {/* Nombre y Teléfono en 2 columnas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="profile-name" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                        {t("full_name")}
                      </label>
                      <input
                        type="text"
                        id="profile-name"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder={t("name_placeholder")}
                        className="w-full rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] text-[var(--tt-text-main)] px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-[var(--tt-text-subtle)]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="profile-phone" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                        {t("phone")}
                      </label>
                      <input
                        type="text"
                        id="profile-phone"
                        value={accountForm.phone}
                        onChange={(e) => setAccountForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+56 9 1234 5678"
                        className="w-full rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] text-[var(--tt-text-main)] px-4 py-3 text-sm outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all placeholder:text-[var(--tt-text-subtle)] font-mono"
                      />
                      <p className="text-[11px] text-[var(--tt-text-subtle)]">{t("phone_note")}</p>
                    </div>
                  </div>

                  {/* Tarjeta de Resumen de Dirección Vinculada */}
                  <div className="pt-2 border-t border-[var(--tt-border-medium)]">
                    <div className="p-4 rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[var(--tt-text-main)] flex items-center gap-2">
                          <IconBox className="w-4 h-4 text-red shrink-0" />
                          <span>{t("default_shipping_address")}</span>
                        </span>
                        <p className="text-xs text-[var(--tt-text-muted)]">
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
                            t("no_checkout_address_yet")
                          )}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTabChange("addresses")}
                      >
                        {t("manage_in_addresses_btn", { count: addresses.length > 0 ? `(${addresses.length})` : "" })} →
                      </Button>
                    </div>
                  </div>

                  {/* Mensaje de Feedback */}
                  {accountMsg && (
                    <div
                      className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200 ${
                        accountMsg.type === "success"
                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
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
                      {t("save_changes")}
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
