"use client";
import React, { useState, useEffect, useRef } from "react";
import { IconMapPin, IconStore } from "@/components/ui/Icons";

interface Branch {
  id: string;
  name: string;
  subdomain: string;
  isMainBranch: boolean;
  address?: string;
}

export default function BranchSelector() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
        const res = await fetch(`${apiUrl}/stores/me/branches`, {
          credentials: "include",
          headers: { "x-auth-scope": "admin" },
        });

        if (res.ok) {
          const data: Branch[] = await res.json();
          setBranches(data);

          // Obtener la sucursal activa persistida en localStorage o seleccionar la principal
          const savedBranchId = localStorage.getItem("taptrade_active_branch_id");
          const exists = data.some((b) => b.id === savedBranchId);
          if (savedBranchId && exists) {
            setActiveBranchId(savedBranchId);
          } else if (data.length > 0) {
            const main = data.find((b) => b.isMainBranch) || data[0];
            setActiveBranchId(main.id);
            localStorage.setItem("taptrade_active_branch_id", main.id);
          }
        }
      } catch (err) {
        console.error("Error al cargar sucursales:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

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

  const handleSelectBranch = (branch: Branch) => {
    setActiveBranchId(branch.id);
    localStorage.setItem("taptrade_active_branch_id", branch.id);
    setIsOpen(false);
    // Disparar evento personalizado para que las páginas recarguen si escuchan cambio de sucursal
    window.dispatchEvent(new CustomEvent("branchChanged", { detail: branch }));
  };

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  if (loading || branches.length <= 1) {
    // Si solo tiene 1 sucursal (la principal), solo mostramos la pastilla informativa sin dropdown
    if (activeBranch) {
      return (
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-medium text-white/80">
          <IconStore className="w-3.5 h-3.5 text-red" />
          <span className="font-bold text-white">{activeBranch.name}</span>
          {activeBranch.isMainBranch && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/50 uppercase">
              Casa Matriz
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
        <IconMapPin className="w-3.5 h-3.5 text-red" />
        <span className="max-w-[130px] truncate">{activeBranch?.name || "Seleccionar Sucursal"}</span>
        <svg
          className={`w-3.5 h-3.5 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
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

