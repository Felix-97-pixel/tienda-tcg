"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { IconUsers, IconUserPlus, IconTrash, IconX, IconShield } from "@/components/ui/Icons";
import { Company } from "./hooks/useSuperAdminStores";
import { API_URL } from "@/utils/api";
import toast from "react-hot-toast";

interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "ACCOUNTANT";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

interface CompanyUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onRefresh?: () => void;
}

export default function CompanyUsersModal({
  isOpen,
  onClose,
  company,
  onRefresh,
}: CompanyUsersModalProps) {
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Formulario nuevo usuario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN" as "OWNER" | "ADMIN" | "ACCOUNTANT",
  });

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-scope": "admin",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchMembers = useCallback(async () => {
    if (!company) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/stores/companies/${company.id}/users`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else {
        toast.error("Error al cargar los miembros de la empresa.");
      }
    } catch {
      toast.error("Error de conexión al cargar miembros.");
    } finally {
      setLoading(false);
    }
  }, [company]);

  useEffect(() => {
    if (isOpen && company) {
      fetchMembers();
    }
  }, [isOpen, company, fetchMembers]);

  if (!isOpen || !company) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Nombre y correo son requeridos.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/stores/companies/${company.id}/users`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al agregar usuario");
      }

      toast.success("Usuario corporativo asignado con éxito");
      setFormData({ name: "", email: "", password: "", role: "ADMIN" });
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "No se pudo agregar el usuario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (userId === company.owner?.id) {
      toast.error("No es posible desvincular al dueño titular de la empresa.");
      return;
    }

    if (!confirm(`¿Estás seguro de quitar el acceso corporativo a ${userName}?`)) {
      return;
    }

    try {
      setRemovingId(userId);
      const res = await fetch(`${API_URL}/stores/companies/${company.id}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al quitar acceso");
      }

      toast.success("Acceso revocado correctamente");
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "No se pudo quitar el acceso");
    } finally {
      setRemovingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red/15 text-red-light border border-red/30">
            Dueño Titular (Super Usuario)
          </span>
        );
      case "ADMIN":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Administrador Holding
          </span>
        );
      case "ACCOUNTANT":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Contador
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-white/10 text-white/70">
            {role}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-dark to-red flex items-center justify-center text-white shadow-md">
              <IconUsers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Accesos Corporativos &bull; {company.name}
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Super usuarios con visibilidad consolidada sobre todas las sucursales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Formulario Agregar Usuario */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <IconUserPlus className="w-4 h-4 text-red" />
              Asignar Nuevo Usuario Corporativo
            </h4>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Carlos Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="carlos@empresa.cl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Contraseña Temporal (Opcional)
                </label>
                <input
                  type="password"
                  placeholder="Por defecto: TapTrade2026!"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Rol Corporativo
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as "OWNER" | "ADMIN" | "ACCOUNTANT",
                    })
                  }
                  className="w-full bg-[#080B12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-red focus:outline-none"
                >
                  <option value="ADMIN">Administrador Holding (Gestión Total)</option>
                  <option value="ACCOUNTANT">Contador (Métricas y Liquidaciones)</option>
                  <option value="OWNER">Dueño Copropietario</option>
                </select>
              </div>

              <div className="sm:col-span-2 flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting}
                  className="!px-4 !py-2 text-xs gap-1.5"
                >
                  <IconShield className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Asignando..." : "Vincular a Empresa"}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Listado de Miembros */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between">
              <span>Miembros Actuales de la Empresa ({members.length})</span>
            </h4>

            {loading ? (
              <div className="py-8 text-center text-xs text-white/40">Cargando miembros...</div>
            ) : members.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/40">
                No hay usuarios vinculados a esta empresa.
              </div>
            ) : (
              <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-[#090C12]">
                {members.map((member) => {
                  const isOwner = member.userId === company.owner?.id;

                  return (
                    <div
                      key={member.id}
                      className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white truncate">
                              {member.user.name}
                            </p>
                            {getRoleBadge(member.role)}
                          </div>
                          <p className="text-[11px] text-white/50 truncate font-mono">
                            {member.user.email}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isOwner ? (
                          <span className="text-[10px] text-white/40 font-mono px-2 py-1">
                            Titular
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="danger"
                            className="!p-1.5"
                            disabled={removingId === member.userId}
                            onClick={() => handleRemoveUser(member.userId, member.user.name)}
                            title="Quitar acceso corporativo"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} className="!px-4">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}

