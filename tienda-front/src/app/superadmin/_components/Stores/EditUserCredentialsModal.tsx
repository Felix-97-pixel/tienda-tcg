"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import {
  IconLock,
  IconX,
  IconEye,
  IconShieldCheck,
  IconSparkles,
} from "@/components/ui/Icons";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { API_URL, getAdminAuthHeaders } from "@/utils/api";
import toast from "react-hot-toast";

export interface TargetUserToEdit {
  userId: string;
  name: string;
  email: string;
  role?: string;
  companyId?: string;
  storeId?: string;
  roleType?: "COMPANY" | "STORE";
  isOwner?: boolean;
}

interface EditUserCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: TargetUserToEdit | null;
  onSuccess?: () => void;
}

export default function EditUserCredentialsModal({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}: EditUserCredentialsModalProps) {
  const t = useTranslations("stores_page");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (targetUser) {
      setName(targetUser.name || "");
      setEmail(targetUser.email || "");
      setRole(targetUser.role || "");
      setPassword("");
      setShowPassword(false);
    }
  }, [targetUser, isOpen]);

  if (!isOpen || !targetUser) return null;

  const handleGeneratePassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";
    let gen = "TT";
    for (let i = 0; i < 8; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    gen += "26!";
    setPassword(gen);
    setShowPassword(true);
    navigator.clipboard?.writeText(gen);
    toast.success("OK");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const headers = getAdminAuthHeaders({ "Content-Type": "application/json" });

      const payload: any = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      if (targetUser.roleType === "COMPANY" && targetUser.companyId && role) {
        payload.companyId = targetUser.companyId;
        payload.role = role;
      } else if (targetUser.roleType === "STORE" && targetUser.storeId && role) {
        payload.storeId = targetUser.storeId;
        payload.role = role;
      }

      const res = await fetch(`${API_URL}/stores/users/${targetUser.userId}/credentials`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error");
      }

      toast.success("OK");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyRoleOptions = [
    { label: "ADMIN", value: "ADMIN" },
    { label: "ACCOUNTANT", value: "ACCOUNTANT" },
    { label: "OWNER", value: "OWNER" },
  ];

  const storeRoleOptions = [
    { label: "BRANCH_MANAGER", value: "BRANCH_MANAGER" },
    { label: "CASHIER", value: "CASHIER" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-white">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-dark to-red flex items-center justify-center text-white shadow-md">
              <IconLock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {t("edit_credentials_title")}
              </h3>
              <p className="text-[11px] text-white/50">
                {t("edit_credentials_sub")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              {t("field_full_name")}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#141A26] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              {t("field_email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#141A26] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-white/80">
                {t("new_password_label")}
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-red hover:text-red-light font-bold flex items-center gap-1 transition-colors"
              >
                <IconSparkles className="w-3 h-3" />
                <span>{t("generate_secure")}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("leave_blank_pass")}
                className="w-full bg-[#141A26] border border-white/10 rounded-xl px-3.5 py-2 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                <IconEye className="w-4 h-4" />
              </button>
            </div>
          </div>

          {targetUser.roleType && !targetUser.isOwner && (
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1.5">
                {t("assigned_role_label")}
              </label>
              <SearchableSelect
                options={
                  targetUser.roleType === "COMPANY"
                    ? companyRoleOptions
                    : storeRoleOptions
                }
                value={role}
                onChange={(val) => setRole(val)}
                placeholder={t("assigned_role_label")}
                inputClassName="!py-2 !text-xs !bg-[#141A26] !border-white/10 hover:!border-red/40"
                usePortal={true}
              />
            </div>
          )}

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t("btn_cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5"
            >
              <IconShieldCheck className="w-4 h-4" />
              <span>{t("btn_save_credentials")}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

