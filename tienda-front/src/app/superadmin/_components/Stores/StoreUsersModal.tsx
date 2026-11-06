"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("stores_page");
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
        toast.error(t("err_load_staff"));
      }
    } catch {
      toast.error(t("err_conn_staff"));
    } finally {
      setLoading(false);
    }
  }, [branch, t]);

  useEffect(() => {
    if (isOpen && branch) {
      fetchMembers();
    }
  }, [isOpen, branch, fetchMembers]);

  if (!isOpen || !branch) return null;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error(t("err_name_email_req"));
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
        throw new Error(errData.message || t("err_add_staff"));
      }

      toast.success(t("toast_staff_added"));
      setFormData({ name: "", email: "", password: "", role: "CASHIER" });
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || t("err_add_staff"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId: string, userName: string) => {
    if (!confirm(t("confirm_remove_staff", { name: userName }))) {
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
        throw new Error(errData.message || t("err_remove_staff"));
      }

      toast.success(t("toast_staff_removed"));
      fetchMembers();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.message || t("err_remove_staff"));
    } finally {
      setRemovingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "BRANCH_MANAGER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            MANAGER
          </span>
        );
      case "CASHIER":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
            CASHIER
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
                  {branch.name}
                </h3>
                {branch.isMainBranch ? (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold uppercase">
                    {t("hq_badge")}
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold uppercase">
                    {t("extra_branch_badge")}
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
                <p className="font-bold text-white text-[11px]">{t("branch_staff_title")}</p>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  {t("branch_staff_desc")}
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <IconUserPlus className="w-4 h-4 text-red" />
              {t("assign_branch_staff")}
            </h4>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  {t("field_full_name")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("ph_staff_name")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  {t("field_email")}
                </label>
                <input
                  type="email"
                  required
                  placeholder={t("ph_staff_email")}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  {t("field_temp_pass")}
                </label>
                <input
                  type="password"
                  placeholder={t("ph_temp_pass")}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#080B12] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  {t("field_branch_role")}
                </label>
                <SearchableSelect
                  options={[
                    { label: "CASHIER (+0.35 UF/mes + IVA)", value: "CASHIER" },
                    { label: "BRANCH_MANAGER (+0.60 UF/mes + IVA)", value: "BRANCH_MANAGER" },
                  ]}
                  value={formData.role}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      role: val as "BRANCH_MANAGER" | "CASHIER",
                    })
                  }
                  placeholder={t("field_branch_role")}
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
                  <span>{isSubmitting ? t("btn_assigning") : t("btn_assign_branch")}</span>
                </Button>
              </div>
            </form>
          </div>

          {/* Listado de Personal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center justify-between">
              <span>{t("current_branch_staff", { count: members.length })}</span>
            </h4>

            {loading ? (
              <div className="py-8 text-center text-xs text-white/40">{t("loading_members")}</div>
            ) : members.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/40">
                {t("no_branch_staff")}
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
                          title={t("edit_credentials_title")}
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
            {t("btn_close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

