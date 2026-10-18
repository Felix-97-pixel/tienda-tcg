"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSuperAdminPlans } from "@/app/superadmin/_components/Config/hooks/useSuperAdminPlans";

export default function PlansPage() {
  const {
    plans,
    allFeatures,
    loading,
    isModalOpen,
    editingPlan,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
    handleToggleFeature,
    handleSave,
    handleDelete
  } = useSuperAdminPlans();

  const [activeTab, setActiveTab] = React.useState<"ALL" | "STANDARD" | "OFFER">("ALL");

  const filteredPlans = plans.filter(p => {
    if (activeTab === "STANDARD") return p.isStandard;
    if (activeTab === "OFFER") return !p.isStandard;
    return true;
  });

  const standardCount = plans.filter(p => p.isStandard).length;
  const offerCount = plans.filter(p => !p.isStandard).length;

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Planes de Suscripción</h1>
          <p className="text-gray-4 text-sm mt-1">
            Gestiona los planes de suscripción. Distingue entre planes estándar (visibles en la Landing) y planes de oferta / privados.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>}>
          Nuevo Plan
        </Button>
      </div>

      {/* Selector de pestañas / Filtro */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "ALL"
              ? "bg-white/10 text-white border border-white/20 shadow-sm"
              : "text-gray-4 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>Todos los Planes</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-gray-3">{plans.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("STANDARD")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "STANDARD"
              ? "bg-blue/20 text-blue border border-blue/40 shadow-sm"
              : "text-gray-4 hover:text-blue hover:bg-white/5"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          <span>Planes Estándar (Landing)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue/20 text-blue">{standardCount}</span>
        </button>

        <button
          onClick={() => setActiveTab("OFFER")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "OFFER"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
              : "text-gray-4 hover:text-amber-400 hover:bg-white/5"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          <span>Planes de Oferta / Privados</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400">{offerCount}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPlans.map(plan => (
            <div key={plan.id} className="bg-[#0E121B] border border-white/10 rounded-2xl p-6 shadow-xl relative flex flex-col hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                {plan.isStandard ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue/15 text-blue border border-blue/30 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse"></span>
                    Plan Estándar (Landing)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    Oferta / Privado (Oculto)
                  </span>
                )}

                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(plan)} title="Editar Plan" className="w-8 h-8 rounded-full bg-white/5 text-gray-3 flex items-center justify-center hover:bg-blue hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(plan.id)} title="Eliminar Plan" className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-black text-white mb-2">{plan.name}</h2>
              <p className="text-sm text-gray-4 mb-4 line-clamp-2 min-h-[40px]">{plan.description}</p>
              
              <div className="text-3xl font-black text-white mb-6">
                {Number(plan.price).toLocaleString()} <span className="text-base font-bold text-emerald-400">UF</span> <span className="text-sm font-medium text-gray-5">/mes</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#111318] rounded-xl p-3 flex-1 border border-white/5">
                  <p className="text-[10px] text-gray-5 font-bold uppercase tracking-wider mb-1">SKUs Máximos</p>
                  <p className="text-sm font-bold text-white">{plan.skuLimit === -1 ? "Ilimitado" : plan.skuLimit.toLocaleString()}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-3 flex-1 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">Comisión Venta</p>
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    0% (Modelo SaaS)
                  </p>
                </div>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-gray-5 uppercase tracking-widest mb-3">Funciones Incluidas ({plan.features.length})</p>
                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f.id} className="flex items-start gap-2 text-sm text-gray-3">
                      <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      {f.name}
                    </li>
                  ))}
                  {plan.features.length === 0 && (
                    <li className="text-sm text-gray-6 italic">Sin funciones asignadas</li>
                  )}
                </ul>
              </div>
            </div>
          ))}
          {filteredPlans.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-5 border-2 border-dashed border-white/5 rounded-2xl">
              No hay planes de suscripción en esta categoría.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1d24] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-white">{editingPlan ? "Editar Plan" : "Nuevo Plan"}</h2>
              <button onClick={handleCloseModal} className="text-gray-4 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="plan-form" onSubmit={handleSave} className="space-y-6">
                {/* Selector de Plan Estándar vs Oferta */}
                <div 
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    formData.isStandard 
                      ? "bg-blue/10 border-blue/40 shadow-sm" 
                      : "bg-amber-500/10 border-amber-500/40 shadow-sm"
                  }`}
                  onClick={() => setFormData({...formData, isStandard: !formData.isStandard})}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        formData.isStandard 
                          ? "bg-blue/20 text-blue border border-blue/30" 
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {formData.isStandard ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-white">
                            {formData.isStandard ? "Plan Estándar (Público)" : "Plan de Oferta / Privado"}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            formData.isStandard 
                              ? "bg-blue text-white" 
                              : "bg-amber-500 text-black"
                          }`}>
                            {formData.isStandard ? "Visible en Landing" : "Oculto de Landing"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-4 mt-0.5">
                          {formData.isStandard 
                            ? "Aparecerá publicado en la sección de precios de la Landing Page." 
                            : "Plan especial o con tarifa negociada. Solo se asignará a tiendas puntuales desde el panel de tiendas."}
                        </p>
                      </div>
                    </div>

                    <div className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                      formData.isStandard ? "bg-blue" : "bg-white/20"
                    }`}>
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        formData.isStandard ? "translate-x-6" : "translate-x-0"
                      }`}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Nombre del Plan" 
                    placeholder="ej: Plan Enterprise Oferta" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <Input 
                    label="Precio Mensual (UF)" 
                    type="number" 
                    min="0"
                    step="0.01"
                    required 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Límite de SKUs (-1 para Ilimitado)" 
                    type="number" 
                    required 
                    value={formData.skuLimit}
                    onChange={e => setFormData({...formData, skuLimit: e.target.value})}
                  />
                  <div>
                    <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">Comisión de Venta</label>
                    <div className="w-full bg-[#111318] border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
                      <span className="font-bold text-emerald-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        0% Comisión
                      </span>
                      <span className="text-[11px] text-gray-4 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">SaaS Puro</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">Descripción</label>
                  <textarea 
                    className="w-full bg-[#111318] border border-stroke rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none transition-colors resize-none h-20"
                    placeholder="Descripción del plan..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-4">Funciones a incluir</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allFeatures.map(f => {
                      const isSelected = formData.featureIds.includes(f.id);
                      return (
                        <div 
                          key={f.id} 
                          onClick={() => handleToggleFeature(f.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected ? "border-blue bg-blue/10" : "border-white/5 bg-[#111318] hover:border-white/20"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                            isSelected ? "bg-blue border-blue" : "border-gray-5"
                          }`}>
                            {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${isSelected ? "text-white" : "text-gray-3"}`}>{f.name}</p>
                            <p className="text-[10px] text-gray-5 font-mono mt-0.5">{f.key}</p>
                          </div>
                        </div>
                      )
                    })}
                    {allFeatures.length === 0 && (
                      <p className="text-sm text-gray-5">Primero debes crear Funciones (Features) para asignarlas a un plan.</p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-white/10 shrink-0 flex justify-end gap-3 bg-[#111318]">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit" form="plan-form">Guardar Plan</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
