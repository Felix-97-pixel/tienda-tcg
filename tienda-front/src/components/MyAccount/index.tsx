"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { RootState } from "@/redux/store";
import { logout } from "@/redux/features/auth-slice";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  role: string;
  createdAt: string;
};

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
};

type Order = {
  id: string;
  buyOrder: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  payment: { status: string; authCode?: string; cardLast4?: string } | null;
};

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Pendiente",   cls: "bg-yellow-100 text-yellow-800" },
  PAID:      { label: "Pagado",      cls: "bg-green-100 text-green-800" },
  FAILED:    { label: "Fallido",     cls: "bg-red-100 text-red-800" },
  CANCELLED: { label: "Cancelado",   cls: "bg-[#111318]00 text-gray-700" },
  REFUNDED:  { label: "Reembolsado", cls: "bg-purple-100 text-purple-800" },
};

const MyAccount = () => {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.authReducer);
  const dispatch = useDispatch();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("orders");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Form state for Account Details
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`${API_URL}/users/me`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data: UserProfile = await res.json();
      setProfile(data);
      setForm({
        name: data.name ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
      });
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
      router.push("/signin");
      return;
    }
    fetchProfile();
    fetchOrders();
  }, [isAuthenticated, router, fetchProfile, fetchOrders]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } catch { /* ignore */ }
    dispatch(logout());
    router.push("/");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setProfile(updated);
      setSaveMsg("Datos guardados correctamente");
    } catch {
      setSaveMsg("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "orders", label: "Mis pedidos", icon: orderIcon },
    { id: "addresses", label: "Direcciones", icon: addressIcon },
    { id: "account-details", label: "Datos de cuenta", icon: userIcon },
    { id: "logout", label: "Cerrar sesión", icon: logoutIcon },
  ];

  return (
    <>
      <Breadcrumb title="Mi Cuenta" pages={["mi cuenta"]} />

      <section className="overflow-hidden py-20 bg-[#222630]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">

            {/* ─── Sidebar ─── */}
            <div className="xl:max-w-[370px] w-full bg-[#1a1d24] rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                {/* User info */}
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-white/10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue to-blue-dark flex items-center justify-center text-white text-xl font-bold">
                    {(profile?.name ?? user?.name ?? user?.email ?? "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white mb-0.5">
                      {profile?.name ?? user?.name ?? "Usuario"}
                    </p>
                    <p className="text-custom-xs text-gray-4">{profile?.email ?? user?.email}</p>
                  </div>
                </div>

                {/* Nav tabs */}
                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          if (tab.id === "logout") {
                            handleLogout();
                          } else {
                            setActiveTab(tab.id);
                          }
                        }}
                        className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                          activeTab === tab.id
                            ? "text-white bg-blue"
                            : tab.id === "logout"
                            ? "text-red bg-red-50 hover:bg-red hover:text-white"
                            : "text-gray-2 bg-[#111318]"
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Content ─── */}

            {/* == Orders tab == */}
            <div className={`xl:max-w-[770px] w-full ${activeTab === "orders" ? "block" : "hidden"}`}>
              <div className="bg-[#1a1d24] rounded-xl shadow-1">
                <div className="py-5 px-4 sm:px-7.5 border-b border-white/10">
                  <h3 className="font-medium text-xl text-white">Mis pedidos</h3>
                </div>
                {loadingOrders ? (
                  <div className="flex justify-center py-12">
                    <svg className="animate-spin h-8 w-8 text-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 px-7.5 text-center">
                    <p className="text-gray-4 mb-4">Aún no tienes pedidos</p>
                    <a href="/shop" className="text-blue hover:underline font-medium text-sm">
                      Ir a la tienda →
                    </a>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-3">
                    {orders.map((order) => {
                      const st = STATUS_MAP[order.status] ?? { label: order.status, cls: "bg-[#111318]00 text-gray-700" };
                      return (
                        <div key={order.id} className="p-4 sm:p-6">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                            <div>
                              <p className="font-mono text-sm text-white font-medium">{order.buyOrder}</p>
                              <p className="text-xs text-gray-4">
                                {new Date(order.createdAt).toLocaleDateString("es-CL", {
                                  day: "2-digit", month: "long", year: "numeric",
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>
                                {st.label}
                              </span>
                              <span className="font-semibold text-white">
                                ${parseFloat(order.totalAmount).toLocaleString("es-CL")}
                              </span>
                            </div>
                          </div>
                          {/* Products */}
                          <div className="bg-[#111318] rounded-lg p-3 space-y-1.5">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-white">
                                  {item.productName} <span className="text-gray-4">× {item.quantity}</span>
                                </span>
                                <span className="text-white font-medium">
                                  ${(parseFloat(item.unitPrice) * item.quantity).toLocaleString("es-CL")}
                                </span>
                              </div>
                            ))}
                          </div>
                          {order.payment?.cardLast4 && (
                            <p className="text-xs text-gray-4 mt-2">
                              Tarjeta •••• {order.payment.cardLast4}
                              {order.payment.authCode && ` · Auth: ${order.payment.authCode}`}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* == Addresses tab == */}
            <div className={`xl:max-w-[770px] w-full ${activeTab === "addresses" ? "block" : "hidden"}`}>
              <div className="bg-[#1a1d24] rounded-xl shadow-1 p-4 sm:p-8.5">
                <h3 className="font-medium text-xl text-white mb-6">Dirección de envío</h3>
                {loadingProfile ? (
                  <p className="text-gray-4">Cargando...</p>
                ) : profile?.address || profile?.city || profile?.phone ? (
                  <div className="bg-[#111318] rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white">{profile.name ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="text-white">{profile.phone ?? "—"}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-4 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white">
                        {profile.address}{profile.city ? `, ${profile.city}` : ""}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("account-details")}
                      className="mt-3 text-blue text-sm font-medium hover:underline"
                    >
                      Editar datos →
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-4 mb-4">No tienes dirección guardada</p>
                    <button
                      onClick={() => setActiveTab("account-details")}
                      className="inline-flex font-medium text-white bg-blue py-2.5 px-6 rounded-md hover:bg-blue-dark transition"
                    >
                      Agregar dirección
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* == Account Details tab == */}
            <div className={`xl:max-w-[770px] w-full ${activeTab === "account-details" ? "block" : "hidden"}`}>
              <form onSubmit={handleSaveProfile}>
                <div className="bg-[#1a1d24] shadow-1 rounded-xl p-4 sm:p-8.5">
                  <h3 className="font-medium text-xl text-white mb-6">Datos de cuenta</h3>

                  <div className="mb-5">
                    <label htmlFor="profile-email" className="block mb-2.5 font-medium text-white">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="profile-email"
                      value={profile?.email ?? ""}
                      disabled
                      className="rounded-md border border-white/10 bg-[#222630] text-gray-4 w-full py-2.5 px-5 outline-none cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-4 mt-1">El correo no se puede cambiar</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 mb-5">
                    <div className="w-full">
                      <label htmlFor="profile-name" className="block mb-2.5 font-medium text-white">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="profile-name"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Ej: Juan Pérez"
                        className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                    <div className="w-full">
                      <label htmlFor="profile-phone" className="block mb-2.5 font-medium text-white">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        id="profile-phone"
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="+56 9 1234 5678"
                        className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="profile-address" className="block mb-2.5 font-medium text-white">
                      Dirección
                    </label>
                    <input
                      type="text"
                      id="profile-address"
                      value={form.address}
                      onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                      placeholder="Calle, número, depto..."
                      className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="profile-city" className="block mb-2.5 font-medium text-white">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      id="profile-city"
                      value={form.city}
                      onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                      placeholder="Santiago"
                      className="rounded-md border border-white/10 bg-[#111318] placeholder:text-gray-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  {saveMsg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${saveMsg.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                      {saveMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

/* ── Icon components ── */
const orderIcon = (
  <svg className="fill-current w-5 h-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" />
  </svg>
);

const addressIcon = (
  <svg className="fill-current w-5 h-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const userIcon = (
  <svg className="fill-current w-5 h-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
  </svg>
);

const logoutIcon = (
  <svg className="fill-current w-5 h-5" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" />
  </svg>
);

export default MyAccount;
