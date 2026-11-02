"use client";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
import { setActiveStore, BranchItem } from "@/redux/features/admin-auth-slice";
import { IconMapPin, IconStore, IconChevronDown } from "@/components/ui/Icons";
import { adminFetch } from "@/utils/api";

export default function BranchSelector() {
  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.adminAuthReducer);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sessionType = user?.sessionType || "COMPANY_OWNER";
  const isLockedToBranch = sessionType === "BRANCH_MANAGER" || sessionType === "CASHIER";
  const userId = user?.id;
  const currentActiveStoreId = user?.activeStore?.id;

  // 1. Cargar sucursales únicamente una vez por sesión de usuario autenticado
  useEffect(() => {
    if (!userId) return;

    let isSubscribed = true;
    const fetchBranches = async () => {
      try {
        const res = await adminFetch("/stores/me/branches");

        if (res.ok && isSubscribed) {
          const data: BranchItem[] = await res.json();
          setBranches(data);

          // Obtener la sucursal activa persistida en Redux / localStorage o seleccionar la principal
          const savedBranchId = currentActiveStoreId || (typeof window !== "undefined" ? localStorage.getItem("taptrade_active_branch_id") : null);
          const exists = data.some((b) => b.id === savedBranchId);
          if (savedBranchId && exists) {
            setActiveBranchId(savedBranchId);
            const found = data.find((b) => b.id === savedBranchId);
            if (found && (!user?.activeStore || user.activeStore.id !== found.id)) {
              dispatch(setActiveStore(found));
            }
          } else if (data.length > 0) {
            const main = data.find((b) => b.isMainBranch) || data[0];
            setActiveBranchId(main.id);
            localStorage.setItem("taptrade_active_branch_id", main.id);
            localStorage.setItem("admin_active_store_id", main.id);
            dispatch(setActiveStore(main));
          }
        }
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchBranches();
    return () => {
      isSubscribed = false;
    };
  }, [userId, dispatch]);

  // 2. Sincronizar activeBranchId si cambia externamente sin volver a consultar al backend
  useEffect(() => {
    if (currentActiveStoreId && currentActiveStoreId !== activeBranchId) {
      setActiveBranchId(currentActiveStoreId);
    }
  }, [currentActiveStoreId]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectBranch = (branch: BranchItem) => {
    setActiveBranchId(branch.id);
    localStorage.setItem("taptrade_active_branch_id", branch.id);
    localStorage.setItem("admin_active_store_id", branch.id);
    dispatch(setActiveStore(branch));
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("branchChanged", { detail: branch }));
  };

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0] || user?.activeStore;

  // Si está bloqueado (Cajero o Encargado) o solo tiene 1 sucursal, mostrar solo badge estático
  if (loading || isLockedToBranch || branches.length <= 1) {
    if (activeBranch) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-white/80 shadow-sm">
          <IconStore className="w-3.5 h-3.5 text-red shrink-0" />
          <span className="font-bold text-white max-w-[140px] truncate">{activeBranch.name}</span>
          {activeBranch.isMainBranch ? (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/50 uppercase shrink-0">
              Casa Matriz
            </span>
          ) : (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase shrink-0">
              Sucursal
            </span>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/15 hover:border-red/40 hover:bg-white/[0.08] text-xs font-semibold text-white transition-all shadow-sm"
      >
        <IconMapPin className="w-3.5 h-3.5 text-red shrink-0" />
        <span className="max-w-[130px] truncate">{activeBranch?.name || "Seleccionar Sucursal"}</span>
        <IconChevronDown
          className={`w-3.5 h-3.5 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0E121B] border border-white/15 shadow-2xl p-2 z-99999 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">
              Sucursales de la Empresa
            </p>
          </div>
          <div className="space-y-1">
            {branches.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBranch(b)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                  b.id === activeBranchId
                    ? "bg-red/15 text-white font-bold border border-red/30"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="truncate mr-2">
                  <p className="truncate">{b.name}</p>
                  {b.address && <p className="text-[10px] text-white/40 truncate">{b.address}</p>}
                </div>
                {b.isMainBranch && (
                  <span className="shrink-0 text-[8px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/60 uppercase">
                    Matriz
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
