"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Feature {
  id: string;
  key: string;
  name: string;
  description: string;
  price: string;
}

export default function FeaturesPage() {
  const { showToast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ key: "", name: "", description: "", price: "0" });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/features`, { credentials: "include" });
      if (res.ok) {
        setFeatures(await res.json());
      }
    } catch (e) {
      console.error(e);
      showToast("Error al cargar features", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (feature?: Feature) => {
    if (feature) {
      setEditingFeature(feature);
      setFormData({
        key: feature.key,
        name: feature.name,
        description: feature.description || "",
        price: feature.price ? String(feature.price) : "0",
      });
    } else {
      setEditingFeature(null);
      setFormData({ key: "", name: "", description: "", price: "0" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingFeature 
        ? `${API_URL}/features/${editingFeature.id}`
        : `${API_URL}/features`;
      
      const method = editingFeature ? "PATCH" : "POST";
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Error al guardar");
      
      showToast(editingFeature ? "Función actualizada" : "Función creada", "success");
      setIsModalOpen(false);
      fetchFeatures();
    } catch (err) {
      showToast("Hubo un error al guardar", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta Función?")) return;
    try {
      const res = await fetch(`${API_URL}/features/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error();
      showToast("Función eliminada", "success");
      fetchFeatures();
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Funciones (Features)</h1>
          <p className="text-gray-4 text-sm mt-1">Gestiona las funciones base del sistema para limitar o cobrar por su acceso.</p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>}>
          Nueva Función
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-[#1a1d24] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111318] text-gray-4 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-bold">Key (Identificador)</th>
                <th className="px-6 py-4 font-bold">Nombre</th>
                <th className="px-6 py-4 font-bold">Precio Individual</th>
                <th className="px-6 py-4 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {features.map(f => (
                <tr key={f.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="bg-blue/10 text-blue font-mono px-2 py-1 rounded text-xs">
                      {f.key}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{f.name}</p>
                    <p className="text-xs text-gray-4 mt-0.5">{f.description}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-green-400">
                    ${Number(f.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(f)} className="text-blue hover:text-white px-2 transition-colors">Editar</button>
                    <button onClick={() => handleDelete(f.id)} className="text-red-500 hover:text-white px-2 transition-colors">Eliminar</button>
                  </td>
                </tr>
              ))}
              {features.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-5">
                    No hay funciones registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1d24] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingFeature ? "Editar Función" : "Nueva Función"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-4 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <Input 
                label="Identificador (Key)" 
                placeholder="ej: module:statistics" 
                required 
                value={formData.key}
                onChange={e => setFormData({...formData, key: e.target.value})}
              />
              <Input 
                label="Nombre Público" 
                placeholder="Estadísticas Avanzadas" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
              <div>
                <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">Descripción</label>
                <textarea 
                  className="w-full bg-[#111318] border border-stroke rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none transition-colors resize-none h-24"
                  placeholder="Descripción de la función..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <Input 
                label="Precio Base (Add-on)" 
                type="number" 
                min="0"
                step="0.01"
                required 
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Guardar Función</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
