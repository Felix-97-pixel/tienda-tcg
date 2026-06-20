"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSuperAdminPlans } from "@/app/admin/_components/Config/hooks/useSuperAdminPlans";

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

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Planes de Suscripción</h1>
          <p className="text-gray-4 text-sm mt-1">Crea y gestiona planes que agrupan conjuntos de funciones (features).</p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>}>
          Nuevo Plan
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-[#1a1d24] border border-white/5 rounded-2xl p-6 shadow-xl relative flex flex-col">
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => handleOpenModal(plan)} className="w-8 h-8 rounded-full bg-blue/10 text-blue flex items-center justify-center hover:bg-blue hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => handleDelete(plan.id)} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
              <h2 className="text-xl font-black text-white mb-2">{plan.name}</h2>
              <p className="text-sm text-gray-4 mb-4 line-clamp-2 min-h-[40px]">{plan.description}</p>
              
              <div className="text-3xl font-black text-white mb-6">
                ${Number(plan.price).toLocaleString()} <span className="text-sm font-medium text-gray-5">/mes</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#111318] rounded-xl p-3 flex-1 border border-white/5">
                  <p className="text-[10px] text-gray-5 font-bold uppercase tracking-wider mb-1">SKUs Máximos</p>
                  <p className="text-sm font-bold text-white">{plan.skuLimit === -1 ? "Ilimitado" : plan.skuLimit.toLocaleString()}</p>
                </div>
                <div className="bg-[#111318] rounded-xl p-3 flex-1 border border-white/5">
                  <p className="text-[10px] text-gray-5 font-bold uppercase tracking-wider mb-1">Comisión</p>
                  <p className="text-sm font-bold text-white">{(Number(plan.commissionRate) * 100).toFixed(1)}%</p>
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
          {plans.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-5 border-2 border-dashed border-white/5 rounded-2xl">
              No hay planes de suscripción registrados.
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Nombre del Plan" 
                    placeholder="ej: Profesional" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <Input 
                    label="Precio Mensual" 
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
                  <Input 
                    label="Comisión por Venta (%)" 
                    type="number" 
                    min="0"
                    max="100"
                    step="0.1"
                    required 
                    value={formData.commissionRate}
                    onChange={e => setFormData({...formData, commissionRate: e.target.value})}
                  />
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
