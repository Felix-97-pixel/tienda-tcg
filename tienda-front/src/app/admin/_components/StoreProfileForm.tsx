"use client";
import React from "react";
import { useImageUpload } from "@/hooks/useImageUpload";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileInput } from "@/components/ui/FileInput";
import { Checkbox } from "@/components/ui/Checkbox";
import dynamic from "next/dynamic";
import { useStoreProfile } from "./hooks/useStoreProfile";

const LocationPicker = dynamic(() => import("@/app/admin/_components/LocationPicker"), { ssr: false });

interface StoreProfileFormProps {
  storeId: string; // "me" for normal admin, or the specific store ID for superadmin
}

export default function StoreProfileForm({ storeId }: StoreProfileFormProps) {
  const { isUploading, handleUpload, handleRemove } = useImageUpload();

  const {
    loading,
    saving,
    formData,
    setFormData,
    availableFeatures,
    availablePlans,
    saveProfile,
  } = useStoreProfile(storeId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-4 text-xs font-black uppercase tracking-widest animate-pulse">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-[#1a1d24] rounded-3xl shadow-1 p-8 border border-transparent hover:border-stroke transition-all duration-300 space-y-6">
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue/10 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Información Principal</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Nombre de la Tienda"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Logo de la Tienda</label>
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#111318] border border-stroke flex items-center justify-center">
                    {formData.logoUrl ? (
                      <div className="relative h-full w-full group">
                        <Image src={formData.logoUrl} alt="Logo" fill className="object-contain" />
                        <button
                          type="button"
                          onClick={async () => {
                            const success = await handleRemove(formData.logoUrl);
                            if (success) setFormData({ ...formData, logoUrl: "" });
                          }}
                          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red text-white shadow-md hover:bg-red-dark transition-all opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-4 font-bold text-center">Sin Logo</span>
                    )}
                  </div>
                  <FileInput
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleUpload(file, formData.logoUrl, 'stores');
                        if (url) setFormData({ ...formData, logoUrl: url });
                      }
                    }}
                    disabled={isUploading}
                  />
                </div>
                {isUploading && <p className="mt-2 text-xs text-blue animate-pulse">Subiendo imagen...</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">Descripción de la Tienda</label>
                <textarea
                  className="w-full rounded-xl border border-stroke bg-[#111318] px-4 py-3 text-white focus:border-blue focus:ring-1 focus:ring-blue focus:outline-none transition-all placeholder:text-gray-5 min-h-[100px]"
                  placeholder="Cuenta a tus clientes sobre tu tienda..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 mt-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
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
                    setFormData(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      address: address
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

            {/* Asignación de Planes y Features (Solo visible para SuperAdmin) */}
            {storeId !== "me" && (
              <>
                <div className="flex items-center gap-4 mb-6 mt-10">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shadow-inner">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Suscripción y Módulos</h2>
                    <p className="text-xs text-gray-4 font-medium mt-1">Configura a qué módulos y planes tiene acceso esta tienda.</p>
                  </div>
                </div>

                <div className="bg-[#111318] border border-stroke p-6 rounded-2xl space-y-6">
                  {/* Selector de Planes */}
                  <Checkbox
                    label="Planes de Suscripción"
                    description="Añade los planes base que cubren múltiples funcionalidades."
                    placeholder="Buscar y seleccionar plan a añadir..."
                    options={availablePlans.map(plan => ({
                      label: `${plan.name} ($${plan.price})`,
                      value: plan.id
                    }))}
                    selectedValues={formData.subscriptionPlanIds}
                    onChange={(values) => setFormData(prev => ({ ...prev, subscriptionPlanIds: values }))}
                    badgeColor="blue"
                  />

                  {/* Selector de Features Extras */}
                  <Checkbox
                    label="Funciones Extra (Add-ons)"
                    description="Añade módulos o juegos individuales por separado."
                    placeholder="Buscar y seleccionar función a añadir..."
                    options={availableFeatures.map(feat => ({
                      label: `${feat.name} ($${feat.price})`,
                      value: feat.id
                    }))}
                    selectedValues={formData.customFeatureIds}
                    onChange={(values) => setFormData(prev => ({ ...prev, customFeatureIds: values }))}
                    badgeColor="emerald"
                  />
                </div>
              </>
            )}

            <div className="mt-10 pt-6 border-t border-stroke flex justify-end">
              <div className="w-full md:w-1/3">
                <Button
                  type="submit"
                  isLoading={saving || isUploading}
                  fullWidth
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-dark rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#1a1d24]/10 rounded-full blur-2xl group-hover:bg-[#1a1d24]/20 transition-all"></div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue rounded-full animate-pulse"></span>
              Perfil Público
            </h3>
            <p className="text-xs text-gray-4 leading-relaxed font-medium mb-6">
              Toda la información ingresada aquí será visible en el perfil público de tu tienda en TapTrade.
            </p>
            <div className="p-4 rounded-2xl bg-[#1a1d24]/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-3">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                Actualización instantánea
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-3">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                Íconos automáticos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
