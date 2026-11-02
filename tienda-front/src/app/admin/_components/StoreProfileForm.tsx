"use client";
import Loader from "@/components/ui/Loader";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import {
  IconCheck,
  IconStore,
  IconShare,
  IconCreditCard,
  IconAlertTriangle,
  IconMapPin,
  IconExternalLink,
  IconLock,
} from "@/components/ui/Icons";
import dynamic from "next/dynamic";
import { useStoreProfile } from "./hooks/useStoreProfile";

const LocationPicker = dynamic(() => import("@/components/ui/LocationPicker"), { ssr: false });

interface StoreProfileFormProps {
  storeId: string; // "me" for normal admin, or the specific store ID for superadmin
}

export default function StoreProfileForm({ storeId }: StoreProfileFormProps) {
  const {
    loading,
    saving,
    formData,
    setFormData,
    branches,
    activeBranchId,
    setActiveBranchId,
    saveProfile,
  } = useStoreProfile(storeId);

  const [mpStatus, setMpStatus] = useState<{ linked: boolean; mpUserId: string | null } | null>(null);

  useEffect(() => {
    if (storeId === "me") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/payments/mp/status`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.isConfigured !== "undefined") {
            setMpStatus({ linked: data.isConfigured, mpUserId: null });
          }
        })
        .catch((err) => console.error("Error fetching MP status:", err));
    }
  }, [storeId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader text="Cargando perfil de la sucursal..." className="min-h-[40vh] bg-transparent py-10" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Selector de Sucursal Activa (Si el comercio tiene más de 1 sucursal) */}
      {storeId === "me" && branches && branches.length > 1 && (
        <div className="bg-[#0E121B] border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <IconMapPin className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Sucursal en Edición</p>
              <p className="text-xs text-white/50">Selecciona qué tienda física deseas configurar:</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {branches.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveBranchId(b.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeBranchId === b.id
                    ? "bg-red text-white shadow-lg shadow-red/20 border border-red"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5"
                }`}
              >
                <span>{b.name}</span>
                {b.isMainBranch && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/30 text-white/80 uppercase font-mono">
                    Matriz
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-[#0E121B] rounded-3xl shadow-xl p-8 border border-white/10 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-red/10 border border-red/20 flex items-center justify-center shadow-inner">
                <IconStore className="w-6 h-6 text-red" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Información de la Sucursal</h2>
                <p className="text-xs text-white/50">Datos públicos, subdominio web y logotipo específico de esta tienda física.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Nombre de la Sucursal"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              {/* Subdominio de la sucursal (Solo editable por SuperAdmin) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-white/50">
                    Subdominio de la Sucursal (URL Pública)
                  </label>
                  {storeId === "me" && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400/90 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      <IconLock className="w-3 h-3 text-amber-400" />
                      Solo modificable por SuperAdmin
                    </span>
                  )}
                </div>

                {storeId === "me" ? (
                  <div className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2.5 text-sm font-mono text-white/80">
                    <span className="truncate">
                      <span className="text-white/40">https://taptrade.cl/shop/store/</span>
                      <strong className="text-white font-bold">{formData.subdomain || "sin-subdominio"}</strong>
                    </span>
                    {formData.subdomain && (
                      <a
                        href={`/shop/store/${formData.subdomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all ml-2 shrink-0"
                        title="Abrir tienda pública"
                      >
                        <IconExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center rounded-xl bg-[#080B12] border border-white/10 focus-within:border-red focus-within:ring-1 focus-within:ring-red/30 transition-all overflow-hidden px-4 py-2.5">
                    <span className="text-xs text-white/40 select-none font-mono pr-1">https://taptrade.cl/shop/store/</span>
                    <input
                      type="text"
                      required
                      value={formData.subdomain || ""}
                      onChange={(e) => {
                        const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                        setFormData({ ...formData, subdomain: clean });
                      }}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/30 outline-none font-mono"
                      placeholder="bloodmoon_santiago"
                    />
                    {formData.subdomain && (
                      <a
                        href={`/shop/store/${formData.subdomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-white/40 hover:text-white transition-colors"
                        title="Abrir tienda pública"
                      >
                        <IconExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                <p className="text-[11px] text-white/40 mt-1.5">
                  {storeId === "me"
                    ? "El subdominio oficial solo puede ser configurado por la administración de la plataforma. Para solicitar cambios, comunícate con soporte."
                    : "Como SuperAdmin, puedes modificar libremente el subdominio de esta sucursal (permite [a-z0-9_-])."}
                </p>
              </div>

              {/* Logo con subida a Bucket Cloudinary */}
              <ImageUploadField
                label="Logo de la Sucursal"
                value={formData.logoUrl}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                folder="stores"
                storeId={storeId === "me" ? activeBranchId || undefined : storeId}
                type="logo"
                description="Logo visible en el storefront público y en los recibos de esta sucursal. PNG, JPG, WEBP (Máx. 5MB)."
              />

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/50">
                  Descripción de la Sucursal
                </label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-[#080B12] px-4 py-3 text-white focus:border-red focus:ring-1 focus:ring-red/30 focus:outline-none transition-all placeholder:text-white/30 text-sm min-h-[100px]"
                  placeholder="Cuenta a tus clientes sobre esta sucursal física..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 mt-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <IconShare className="w-6 h-6 text-white/70" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Contacto y Redes Sociales</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email de Contacto"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contacto@mitienda.com"
              />
              <div className="md:col-span-2 mt-4">
                <label className="block text-sm font-semibold text-white mb-2">Ubicación Física</label>
                <LocationPicker
                  initialAddress={formData.address}
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  onLocationChange={(lat, lng, address) => {
                    setFormData((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      address: address,
                    }));
                  }}
                />
              </div>
              <Input
                label="Página Web (URL)"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://mitienda.com"
              />
              <Input
                label="Facebook (URL)"
                type="url"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                placeholder="https://facebook.com/mitienda"
              />
              <Input
                label="Instagram (URL)"
                type="url"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="https://instagram.com/mitienda"
              />
              <Input
                label="Twitch (URL)"
                type="url"
                value={formData.twitch}
                onChange={(e) => setFormData({ ...formData, twitch: e.target.value })}
                placeholder="https://twitch.tv/mitienda"
              />
              <Input
                label="WhatsApp (Número)"
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+56 9 1234 5678"
              />
              <Input
                label="Twitter/X (URL)"
                type="url"
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="https://twitter.com/mitienda"
              />
            </div>

            {/* Mercado Pago Integration (Solo visible para Admin propio) */}
            {storeId === "me" && (
              <>
                <div className="flex items-center gap-4 mb-6 mt-10">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-inner">
                    <IconCreditCard className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Pagos y Cobros</h2>
                    <p className="text-xs text-white/40 font-medium mt-1">
                      Opcional: Si deseas vincular tu cuenta de Mercado Pago para cobros directos.
                    </p>
                  </div>
                </div>

                <div className="bg-[#080B12] border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-white font-bold mb-1">Cuenta de Mercado Pago</h4>
                    {mpStatus?.linked ? (
                      <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                        <IconCheck className="w-4 h-4 text-emerald-400" />
                        Vinculada y activa para recibir pagos
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                        <IconAlertTriangle className="w-4 h-4 text-amber-400" />
                        No vinculada (Opcional). Las ventas se liquidan mediante la cuenta central de TapTrade.
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={mpStatus?.linked ? "secondary" : "primary"}
                    onClick={() => {
                      window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/payments/mp/connect`;
                    }}
                  >
                    {mpStatus?.linked ? "Actualizar Vinculación" : "Vincular con Mercado Pago"}
                  </Button>
                </div>
              </>
            )}

            <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
              <div className="w-full md:w-1/3">
                <Button type="submit" isLoading={saving} fullWidth>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#0E121B] rounded-3xl p-8 text-white shadow-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-28 h-28 bg-red/10 rounded-full blur-2xl group-hover:bg-red/20 transition-all duration-500"></div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red rounded-full shadow-[0_0_8px_rgba(225,14,14,0.8)]"></span>
              Perfil Público de Sucursal
            </h3>
            <p className="text-xs text-white/50 leading-relaxed font-medium mb-6">
              Toda la información ingresada aquí será visible en el catálogo online de esta sucursal en TapTrade.
            </p>
            <div className="p-4 rounded-2xl bg-[#080B12] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                <IconCheck className="w-4 h-4 text-emerald-400" />
                Actualización instantánea
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                <IconCheck className="w-4 h-4 text-emerald-400" />
                Subdominio independiente por sucursal
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                <IconCheck className="w-4 h-4 text-emerald-400" />
                Logos y direcciones por tienda física
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
