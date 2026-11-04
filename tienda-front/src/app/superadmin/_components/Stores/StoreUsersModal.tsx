"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { IconUser, IconUserPlus, IconTrash, IconX, IconStore, IconLock, IconUsers } from "@/components/ui/Icons";
import { TargetUserToEdit } from "./EditUserCredentialsModal";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Branch } from "./hooks/useSuperAdminStores";
import { API_URL } from "@/utils/api";
import toast from "react-hot-toast";

interface StoreMember {
  id: string;
  storeId: string;
  userId: string;
  role: "BRANCH_MANAGER" | "CASHIER";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

interface StoreUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  onRefresh?: () => void;
  onEditCredentials?: (user: TargetUserToEdit) => void;
}

export default function StoreUsersModal({
  isOpen,
  onClose,
  branch,
  onRefresh,
  onEditCredentials,
}: StoreUsersModalProps) {
  const [members, setMembers] = useState<StoreMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Formulario nuevo usuario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER" as "BRANCH_MANAGER" | "CASHIER",
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
    if (!branch) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/stores/${branch.id}/users`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      } else {
        toast.error("Error al cargar el personal de la sucursal.");
      }
    } catch {
      toast.error("Error de conexión al cargar personal.");
    } finally {
      setLoading(false);
    }
  }, [branch]);

  useEffect(() => {
    if (isOpen && branch) {
      fetchMembers();
    }
  }, [isOpen, branch, fetchMembers]);

  if (!isOpen || !branch) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error("Nombre y correo son requeridos.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/stores/${branch.id}/users`, {
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
        throw new Error(errData.message || "Error al agregar personal");
      }

      toast.success("Personal asignado a la sucursal con éxito");
      setFormData({ name: "", email: "", password: "", role: "CASHIER" });
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "No se pudo agregar al personal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de desvincular a ${userName} de esta sucursal?`)) {
      return;
    }

    try {
      setRemovingId(userId);
      const res = await fetch(`${API_URL}/stores/${branch.id}/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al quitar acceso");
      }

      toast.success("Personal desvinculado correctamente");
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || "No se pudo desvincular");
    } finally {
      setRemovingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "BRANCH_MANAGER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Encargado de Sucursal
          </span>
        );
      case "CASHIER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
            Cajero POS
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
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shadow-md">
              <IconStore className="w-5 h-5 text-red" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white leading-tight">
                  Personal &bull; {branch.name}
                </h3>
                {branch.isMainBranch ? (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold uppercase">
                    Casa Matriz
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold uppercase">
                    Sucursal Física
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 mt-0.5 font-mono">
                subdomain: {branch.subdomain}
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
          {/* Formulario Agregar Personal */}
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-4">
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex items-start gap-2.5 mb-3">
              <IconUsers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white text-[11px]">Dotación Operativa por Sucursal</p>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Cada sucursal incluye 1 Encargado y 1 Cajero POS base para operar. Cada cajero adicional activo en mesón suma <strong>+0.35 UF/mes (+ 19% IVA)</strong> en la facturación mensual del holding.
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <IconUserPlus className="w-4 h-4 text-red" />
              Asignar Personal / Cajero a esta Sucursal
            </h4>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Rodrigo Tapia"
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
                  placeholder="cajero1@tienda.cl"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Contraseña (Opcional)
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
                  Rol en la Sucursal
                </label>
                <SearchableSelect
                  options={[
                    { label: "Cajero POS (+0.35 UF/mes + IVA — 1ro incluido por sucursal)", value: "CASHIER" },
                    { label: "Encargado Local (+0.60 UF/mes + IVA — 1ro incluido por sucursal)", value: "BRANCH_MANAGER" },
                  ]}
                  value={formData.role}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      role: val as "BRANCH_MANAGER" | "CASHIER",
                    })
                  }
                  placeholder="Seleccionar rol en la sucursal..."
                  noResultsText="No se encontraron roles"
                  inputClassName="!py-2 !text-xs !bg-[#080B12] !border-white/10 hover:!border-red/40"
                  usePortal={true}
                  direction="auto"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end pt-1">
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={isSubmitting}
                  className="!px-4 !py-2 text-xs gap-1.5"
                >
                  <IconUser className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? "Asignando..." : "Asignar a Sucursal"}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Listado de Personal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between">
              <span>Personal con Acceso a esta Sucursal ({members.length})</span>
            </h4>

            {loading ? (
              <div className="py-8 text-center text-xs text-white/40">Cargando personal...</div>
            ) : members.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/40">
                No hay personal asignado directamente a esta sucursal.
              </div>
            ) : (
              <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden bg-[#090C12]">
                {members.map((member) => (
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

                    <div className="shrink-0 flex items-center gap-1.5">
                      {onEditCredentials && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="!p-1.5 hover:border-red/40 hover:text-red"
                          onClick={() =>
                            onEditCredentials({
                              userId: member.user.id,
                              name: member.user.name,
                              email: member.user.email,
                              role: member.role,
                              storeId: branch.id,
                              roleType: "STORE",
                              isOwner: false,
                            })
                          }
                          title="Editar credenciales y contraseña"
                        >
                          <IconLock className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        className="!p-1.5"
                        disabled={removingId === member.userId}
                        onClick={() => handleRemoveUser(member.userId, member.user.name)}
                        title="Desvincular de sucursal"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
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

