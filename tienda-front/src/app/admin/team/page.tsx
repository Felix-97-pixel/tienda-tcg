"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/redux/store";
import { Button } from "@/components/ui/Button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Loader from "@/components/ui/Loader";
import { usePermission } from "@/hooks/usePermission";
import {
  IconUsers,
  IconUserPlus,
  IconTrash,
  IconShield,
  IconStore,
  IconRefresh,
} from "@/components/ui/Icons";
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

interface Branch {
  id: string;
  name: string;
  subdomain?: string;
  isMainBranch?: boolean;
}

export default function AdminTeamPage() {
  const { user } = useAppSelector((state) => state.adminAuthReducer);
  const canManageCorporate = usePermission("TEAM_CORPORATE_MANAGE");
  const canManageLocal = usePermission("TEAM_LOCAL_MANAGE");

  // Tabs
  const [activeTab, setActiveTab] = useState<"branches" | "company">("branches");

  // Branches & Company State
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  // Members state
  const [branchMembers, setBranchMembers] = useState<StoreMember[]>([]);
  const [companyMembers, setCompanyMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Form State - Store Member
  const [storeFormData, setStoreFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER" as "BRANCH_MANAGER" | "CASHIER",
  });

  // Form State - Company Member
  const [companyFormData, setCompanyFormData] = useState({
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

  // Load initial branches and company info
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);

        // Fetch company
        const compRes = await fetch(`${API_URL}/stores/me/company`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (compRes.ok) {
          const compData = await compRes.json();
          if (compData) {
            setCompanyId(compData.id);
            setCompanyName(compData.name);
          }
        }

        // Fetch branches
        const branchRes = await fetch(`${API_URL}/stores/me/branches`, {
          credentials: "include",
          headers: getAuthHeaders(),
        });
        if (branchRes.ok) {
          const bData: Branch[] = await branchRes.json();
          setBranches(bData);
          if (bData.length > 0) {
            // Prioritize active store or main branch
            const initialBranch =
              bData.find((b) => b.id === user?.activeStore?.id) ||
              bData.find((b) => b.isMainBranch) ||
              bData[0];
            setSelectedBranchId(initialBranch.id);
          }
        }
      } catch (err) {
        console.error("Error al inicializar datos de equipo:", err);
        toast.error("Error al cargar datos del equipo.");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [user?.activeStore?.id]);

  // Fetch branch members when selectedBranchId changes
  const fetchBranchMembers = useCallback(async () => {
    if (!selectedBranchId) return;
    try {
      setLoadingMembers(true);
      const res = await fetch(`${API_URL}/stores/${selectedBranchId}/users`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setBranchMembers(data);
      }
    } catch {
      toast.error("Error al cargar personal de la sucursal.");
    } finally {
      setLoadingMembers(false);
    }
  }, [selectedBranchId]);

  // Fetch company members when tab is company and companyId is set
  const fetchCompanyMembers = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoadingMembers(true);
      const res = await fetch(`${API_URL}/stores/companies/${companyId}/users`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCompanyMembers(data);
      }
    } catch {
      toast.error("Error al cargar miembros corporativos.");
    } finally {
      setLoadingMembers(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (activeTab === "branches" && selectedBranchId) {
      fetchBranchMembers();
    } else if (activeTab === "company" && companyId) {
      fetchCompanyMembers();
    }
  }, [activeTab, selectedBranchId, companyId, fetchBranchMembers, fetchCompanyMembers]);

  // Handle Add Store Member
  const handleAddStoreMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeFormData.name || !storeFormData.email) {
      toast.error("Nombre y correo son requeridos.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/stores/${selectedBranchId}/users`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: storeFormData.name,
          email: storeFormData.email,
          password: storeFormData.password || undefined,
          role: storeFormData.role,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al agregar personal");
      }

      toast.success("Personal asignado a la sucursal con éxito.");
      setStoreFormData({ name: "", email: "", password: "", role: "CASHIER" });
      fetchBranchMembers();
    } catch (err: any) {
      toast.error(err.message || "No se pudo agregar al personal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Remove Store Member
  const handleRemoveStoreMember = async (memberUserId: string, memberName: string) => {
    if (!confirm(`¿Estás seguro de desvincular a ${memberName} de esta sucursal?`)) {
      return;
    }

    try {
      setRemovingId(memberUserId);
      const res = await fetch(`${API_URL}/stores/${selectedBranchId}/users/${memberUserId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al quitar acceso");
      }

      toast.success("Personal desvinculado de la sucursal.");
      fetchBranchMembers();
    } catch (err: any) {
      toast.error(err.message || "No se pudo desvincular.");
    } finally {
      setRemovingId(null);
    }
  };

  // Handle Add Company Member
  const handleAddCompanyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyFormData.name || !companyFormData.email) {
      toast.error("Nombre y correo son requeridos.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/stores/companies/${companyId}/users`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: companyFormData.name,
          email: companyFormData.email,
          password: companyFormData.password || undefined,
          role: companyFormData.role,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al agregar usuario corporativo");
      }

      toast.success("Usuario vinculado a la empresa con éxito.");
      setCompanyFormData({ name: "", email: "", password: "", role: "ADMIN" });
      fetchCompanyMembers();
    } catch (err: any) {
      toast.error(err.message || "No se pudo vincular al usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Remove Company Member
  const handleRemoveCompanyMember = async (memberUserId: string, memberName: string) => {
    if (!confirm(`¿Estás seguro de desvincular a ${memberName} de la empresa?`)) {
      return;
    }

    try {
      setRemovingId(memberUserId);
      const res = await fetch(`${API_URL}/stores/companies/${companyId}/users/${memberUserId}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al revocar acceso corporativo");
      }

      toast.success("Acceso corporativo revocado.");
      fetchCompanyMembers();
    } catch (err: any) {
      toast.error(err.message || "No se pudo revocar acceso.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <Loader text="Cargando configuración de personal..." className="min-h-[40vh] bg-transparent py-10" />;
  }

  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  return (
    <div className="space-y-6 pb-24 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red">
              {companyName || "Gestión de Empresa"}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {canManageCorporate ? "Gestión de Equipo & Personal" : "Personal de Sucursal"}
          </h1>
          <p className="text-white/40 text-xs mt-0.5">
            {canManageCorporate
              ? "Administra los cajeros y encargados de tus sucursales, así como los copropietarios o contadores del holding."
              : `Administra los cajeros autorizados para operar en ${currentBranch?.name || "tu sucursal"}.`}
          </p>
        </div>

        {/* Tab Controls for Owners */}
        {canManageCorporate && (
          <div className="flex items-center bg-white/[0.04] p-1 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab("branches")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "branches"
                  ? "bg-red text-white shadow-lg shadow-red/25"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <IconStore className="w-4 h-4" />
              <span>Personal de Sucursales</span>
            </button>
            <button
              onClick={() => setActiveTab("company")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "company"
                  ? "bg-red text-white shadow-lg shadow-red/25"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <IconShield className="w-4 h-4" />
              <span>Accesos Corporativos</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: PERSONAL DE SUCURSALES */}
      {activeTab === "branches" && (
        <div className="space-y-6">
          {/* Branch Switcher Card for Owners */}
          {canManageCorporate && branches.length > 1 && (
            <div className="p-4 rounded-2xl bg-[#0B0E17] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                  Sucursal Activa para Gestión de Personal
                </span>
                <p className="text-sm font-bold text-white mt-0.5">
                  Selecciona la tienda para revisar y gestionar sus cajeros y encargados:
                </p>
              </div>
              <div className="w-full sm:w-72">
                <SearchableSelect
                  options={branches.map((b) => ({
                    value: b.id,
                    label: `${b.name}${b.isMainBranch ? " (Casa Matriz)" : ""}`,
                  }))}
                  value={selectedBranchId}
                  onChange={(val) => setSelectedBranchId(val)}
                  placeholder="Seleccionar sucursal..."
                  direction="auto"
                  usePortal={true}
                />
              </div>
            </div>
          )}

          {/* Form to add store member */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0E17] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconUserPlus className="w-4 h-4 text-red" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Asignar Nuevo Empleado a {currentBranch?.name || "la Sucursal"}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-white/40">
                Acceso exclusivo para esta ubicación física
              </span>
            </div>

            <form onSubmit={handleAddStoreMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1 uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeFormData.name}
                    onChange={(e) => setStoreFormData({ ...storeFormData, name: e.target.value })}
                    placeholder="Ej: Ignacio Cajero"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1 uppercase tracking-wider">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={storeFormData.email}
                    onChange={(e) => setStoreFormData({ ...storeFormData, email: e.target.value })}
                    placeholder="cajero@tienda.cl"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1 uppercase tracking-wider">
                    Contraseña Temporal
                  </label>
                  <input
                    type="text"
                    value={storeFormData.password}
                    onChange={(e) => setStoreFormData({ ...storeFormData, password: e.target.value })}
                    placeholder="Por defecto: TapTrade2026!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1 uppercase tracking-wider">
                    Rol en la Sucursal *
                  </label>
                  <SearchableSelect
                    options={
                      !canManageCorporate
                        ? [{ value: "CASHIER", label: "Cajero POS (Solo Ventas)" }]
                        : [
                            { value: "CASHIER", label: "Cajero POS (Solo Ventas)" },
                            { value: "BRANCH_MANAGER", label: "Encargado de Sucursal" },
                          ]
                    }
                    value={storeFormData.role}
                    onChange={(val) => setStoreFormData({ ...storeFormData, role: val as any })}
                    placeholder="Seleccionar rol..."
                    direction="auto"
                    usePortal={true}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red hover:bg-red-dark text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red/20 transition-all"
                >
                  {isSubmitting ? "Asignando..." : "Asignar a la Sucursal"}
                </Button>
              </div>
            </form>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                Personal Asignado ({branchMembers.length})
              </h3>
              <button
                onClick={fetchBranchMembers}
                className="text-[11px] text-white/40 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <IconRefresh className="w-3.5 h-3.5" />
                <span>Actualizar Lista</span>
              </button>
            </div>

            {loadingMembers ? (
              <div className="p-8 text-center bg-[#0B0E17] rounded-2xl border border-white/10">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-red border-t-transparent" />
                <p className="text-xs text-white/50 mt-2">Cargando personal...</p>
              </div>
            ) : branchMembers.length === 0 ? (
              <div className="p-8 text-center bg-[#0B0E17] rounded-2xl border border-white/10">
                <IconUsers className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm font-bold text-white/70">No hay empleados registrados en esta sucursal</p>
                <p className="text-xs text-white/40 mt-1">
                  Utiliza el formulario superior para asignar cajeros o un encargado local.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branchMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl bg-[#0B0E17] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-white/10 to-white/5 flex items-center justify-center font-bold text-xs text-white border border-white/10">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-white truncate">{member.user.name}</h4>
                            <p className="text-[11px] text-white/40 truncate">{member.user.email}</p>
                          </div>
                        </div>

                        {/* Action: Remove */}
                        <button
                          onClick={() => handleRemoveStoreMember(member.user.id, member.user.name)}
                          disabled={removingId === member.user.id}
                          className="p-1.5 rounded-lg text-white/30 hover:text-red hover:bg-red/10 transition-colors"
                          title="Desvincular de la sucursal"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {member.role === "BRANCH_MANAGER" ? (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase font-bold">
                            Encargado Sucursal
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                            Cajero POS
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-white/30">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACCESOS CORPORATIVOS (Solo Dueños) */}
      {activeTab === "company" && canManageCorporate && (
        <div className="space-y-6">
          {/* Form to add corporate user */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0B0E17] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconShield className="w-4 h-4 text-red" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Vincular Usuario Corporativo al Holding
                </h2>
              </div>
              <span className="text-[10px] font-mono text-white/40">
                Visibilidad consolidada sobre todas las sucursales
              </span>
            </div>

            <form onSubmit={handleAddCompanyMember} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1 uppercase tracking-wider">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                    placeholder="Ej: Valentina Contadora"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1 uppercase tracking-wider">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={companyFormData.email}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                    placeholder="contador@empresa.cl"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1 uppercase tracking-wider">
                    Contraseña Temporal
                  </label>
                  <input
                    type="text"
                    value={companyFormData.password}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, password: e.target.value })}
                    placeholder="Por defecto: TapTrade2026!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/60 mb-1 uppercase tracking-wider">
                    Rol Corporativo *
                  </label>
                  <SearchableSelect
                    options={[
                      { value: "ADMIN", label: "Administrador Holding (Gestión Total)" },
                      { value: "ACCOUNTANT", label: "Contador (Métricas y Finanzas)" },
                      { value: "OWNER", label: "Dueño Copropietario" },
                    ]}
                    value={companyFormData.role}
                    onChange={(val) => setCompanyFormData({ ...companyFormData, role: val as any })}
                    placeholder="Seleccionar rol corporativo..."
                    direction="auto"
                    usePortal={true}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red hover:bg-red-dark text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red/20 transition-all"
                >
                  {isSubmitting ? "Vinculando..." : "Vincular a la Empresa"}
                </Button>
              </div>
            </form>
          </div>

          {/* Corporate Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider">
                Miembros Actuales de la Empresa ({companyMembers.length})
              </h3>
              <button
                onClick={fetchCompanyMembers}
                className="text-[11px] text-white/40 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <IconRefresh className="w-3.5 h-3.5" />
                <span>Actualizar Lista</span>
              </button>
            </div>

            {loadingMembers ? (
              <div className="p-8 text-center bg-[#0B0E17] rounded-2xl border border-white/10">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-red border-t-transparent" />
                <p className="text-xs text-white/50 mt-2">Cargando miembros corporativos...</p>
              </div>
            ) : companyMembers.length === 0 ? (
              <div className="p-8 text-center bg-[#0B0E17] rounded-2xl border border-white/10">
                <IconShield className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm font-bold text-white/70">No hay otros miembros corporativos</p>
                <p className="text-xs text-white/40 mt-1">
                  Puedes registrar administradores de finanzas o socios copropietarios arriba.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyMembers.map((member) => {
                  const isCurrentLoggedUser = member.user.id === user?.id;
                  const isOwner = member.role === "OWNER";
                  return (
                    <div
                      key={member.id}
                      className="p-4 rounded-2xl bg-[#0B0E17] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-dark to-red flex items-center justify-center font-bold text-xs text-white shadow-md shadow-red/25">
                              {member.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="text-xs font-bold text-white truncate">{member.user.name}</h4>
                              <p className="text-[11px] text-white/40 truncate">{member.user.email}</p>
                            </div>
                          </div>

                          {/* Delete button: only if not themselves and not primary owner */}
                          {!isCurrentLoggedUser && (
                            <button
                              onClick={() => handleRemoveCompanyMember(member.user.id, member.user.name)}
                              disabled={removingId === member.user.id}
                              className="p-1.5 rounded-lg text-white/30 hover:text-red hover:bg-red/10 transition-colors"
                              title="Revocar acceso corporativo"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          {isOwner ? (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red/15 text-red-light border border-red/30 uppercase font-bold">
                              Dueño Titular / Copropietario
                            </span>
                          ) : member.role === "ACCOUNTANT" ? (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold">
                              Contador (Finanzas)
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase font-bold">
                              Admin Holding
                            </span>
                          )}
                          <span className="text-[9px] font-mono text-white/30">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

