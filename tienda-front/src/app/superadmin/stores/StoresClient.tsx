"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";

interface Owner {
  id: string;
  email: string;
  name: string;
}

interface Store {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  owner: Owner;
  balance: number;
  createdAt: string;
}

export default function StoresClient() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    storeName: "",
    subdomain: "",
    logoUrl: "",
    ownerEmail: "",
    ownerName: "",
    ownerPassword: "",
  });

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/stores`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener las tiendas");
      const data = await res.json();
      setStores(data);
    } catch (error) {
      toast.error("Hubo un error cargando los dealers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.storeName,
          subdomain: formData.subdomain,
          logoUrl: formData.logoUrl,
          ownerEmail: formData.ownerEmail,
          ownerName: formData.ownerName,
          ownerPassword: formData.ownerPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear la tienda");
      }

      toast.success("Dealer creado exitosamente");
      setIsModalOpen(false);
      setFormData({
        storeName: "",
        subdomain: "",
        logoUrl: "",
        ownerEmail: "",
        ownerName: "",
        ownerPassword: "",
      });
      fetchStores();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta tienda? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`${API_URL}/stores/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar la tienda");
      toast.success("Tienda eliminada");
      fetchStores();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#1a1d24] shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white">Lista de Tiendas</h3>
        <Button onClick={() => setIsModalOpen(true)}>
          + Agregar Dealer
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando tiendas...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#0a0a0a] text-gray-400">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Logo</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Subdominio</th>
                <th className="px-4 py-3">Dueño</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3 rounded-tr-lg">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-4 py-3">
                    {store.logoUrl ? (
                      <img src={store.logoUrl} alt={store.name} className="w-10 h-10 rounded-md object-contain bg-white/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center font-bold">
                        {store.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{store.name}</td>
                  <td className="px-4 py-3 text-purple-400">{store.subdomain}</td>
                  <td className="px-4 py-3">
                    <div className="text-white">{store.owner?.name}</div>
                    <div className="text-xs text-gray-500">{store.owner?.email}</div>
                  </td>
                  <td className="px-4 py-3">${store.balance}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {/* Placeholder for Edit */}
                    <Button
                      size="sm"
                      variant="danger"
                      className="px-3"
                      onClick={() => handleDelete(store.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No hay tiendas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CREAR DEALER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Nuevo Dealer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateStore} className="p-6 flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">Datos de la Tienda</h4>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nombre de Tienda</label>
                    <input
                      required
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                      placeholder="Ej: Magic Store Chile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Subdominio</label>
                    <input
                      required
                      type="text"
                      name="subdomain"
                      value={formData.subdomain}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                      placeholder="Ej: magicstore"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Logo URL (Opcional)</label>
                    <input
                      type="text"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <h4 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wider">Cuenta del Dueño</h4>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Nombre Completo</label>
                    <input
                      required
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Correo Electrónico</label>
                    <input
                      required
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Contraseña</label>
                    <input
                      required
                      type="password"
                      name="ownerPassword"
                      value={formData.ownerPassword}
                      onChange={handleInputChange}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-purple-500"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? "Creando..." : "Crear Dealer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
