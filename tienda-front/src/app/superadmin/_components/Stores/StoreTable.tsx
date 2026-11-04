"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Loader from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { Company, Branch, SubscriptionPlan } from "./hooks/useSuperAdminStores";
import {
  IconStore,
  IconMapPin,
  IconPencil,
  IconTrash,
  IconExternalLink,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconUsers,
  IconUser,
  IconLock,
} from "@/components/ui/Icons";
import { TargetUserToEdit } from "./EditUserCredentialsModal";
import SearchableSelect from "@/components/ui/SearchableSelect";

interface StoreTableProps {
  companies: Company[];
  availablePlans: SubscriptionPlan[];
  loading: boolean;
  onDelete: (id: string) => void;
  onAssignPlan: (companyId: string, planId: string | null) => void;
  onAddBranch: (company: Company) => void;
  onManageCompanyUsers: (company: Company) => void;
  onManageStoreUsers: (branch: Branch) => void;
  onEditCredentials?: (user: TargetUserToEdit) => void;
}

export default function StoreTable({
  companies,
  availablePlans,
  loading,
  onDelete,
  onAssignPlan,
  onAddBranch,
  onManageCompanyUsers,
  onManageStoreUsers,
  onEditCredentials,
}: StoreTableProps) {
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<Record<string, boolean>>({});

  const planOptions = [
    { label: "Sin Plan Asignado", value: "" },
    ...availablePlans.map((p) => ({
      label: `${p.name} (${Number(p.price).toLocaleString("es-CL")} UF)`,
      value: p.id,
    })),
  ];

  const toggleExpand = (companyId: string) => {
    setExpandedCompanyIds((prev) => ({ ...prev, [companyId]: !prev[companyId] }));
  };

  const getStoreUrl = (subdomain: string) => {
    if (typeof window === "undefined") return "#";
    return `${window.location.protocol}//${window.location.host}/shop/store/${subdomain}`;
  };

  if (loading) {
    return <Loader text="Cargando empresas y sucursales..." className="min-h-[40vh] bg-transparent py-10" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-[#0a0a0a] text-gray-400">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">Empresa (Holding)</th>
            <th className="px-4 py-3">RUT / ID</th>
            <th className="px-4 py-3">Dueño / Contacto</th>
            <th className="px-4 py-3">Plan SaaS Contratado</th>
            <th className="px-4 py-3">Sucursales</th>
            <th className="px-4 py-3">Billetera Matriz</th>
            <th className="px-4 py-3 rounded-tr-lg text-right">Detalle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {companies.map((company) => {
            const isExpanded = !!expandedCompanyIds[company.id];
            const branchCount = company.stores?.length || 0;

            return (
              <React.Fragment key={company.id}>
                {/* Fila Principal de la Empresa */}
                <tr className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {company.logoUrl ? (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                          <Image src={company.logoUrl} alt={company.name} fill unoptimized className="object-contain p-1" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-dark to-red flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0">
                          <IconStore className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white text-base leading-tight">{company.name}</p>
                        <p className="text-[10px] text-white/40 font-mono mt-0.5">
                          {branchCount} {branchCount === 1 ? "sucursal" : "sucursales"} registradas
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-mono text-white/70">
                    {company.rut || <span className="text-white/30 italic">Sin RUT asignado</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-white font-medium text-xs">{company.owner?.name}</p>
                        <p className="text-[11px] text-white/40">{company.owner?.email}</p>
                      </div>
                      {company.owner && onEditCredentials && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="!p-1.5 hover:border-red/40 hover:text-red shrink-0"
                          onClick={() =>
                            onEditCredentials({
                              userId: company.owner.id,
                              name: company.owner.name,
                              email: company.owner.email,
                              isOwner: true,
                              companyId: company.id,
                              roleType: "COMPANY",
                              role: "OWNER",
                            })
                          }
                          title="Editar credenciales del Dueño Titular"
                        >
                          <IconLock className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 min-w-[260px]">
                    <SearchableSelect
                      options={planOptions}
                      value={company.planId || ""}
                      onChange={(val) => onAssignPlan(company.id, val || null)}
                      placeholder="Buscar y asignar plan..."
                      noResultsText="No se encontraron planes"
                      inputClassName="!py-1.5 !text-xs !bg-[#141A26] !border-white/10 hover:!border-red/40"
                      usePortal={true}
                      direction="auto"
                    />
                    {company.plan && (() => {
                      const planPrice = Number(company.plan.price || 0);
                      const extraBranches = Math.max(0, branchCount - 1);
                      const branchesCost = extraBranches * 2.50;
                      const extraCashiers = company.stores?.reduce((acc, s) => {
                        const cashiers = s.members?.filter((m) => m.role === "CASHIER")?.length || 0;
                        return acc + Math.max(0, cashiers - 1);
                      }, 0) || 0;
                      const cashiersCost = extraCashiers * 0.35;
                      const totalNetUF = planPrice + branchesCost + cashiersCost;
                      const totalGrossUF = totalNetUF * 1.19;

                      return (
                        <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1 text-[11px] font-mono shadow-inner">
                          <div className="flex items-center justify-between text-white/60">
                            <span>Plan Base ({company.plan.name}):</span>
                            <span className="text-white font-bold">{planPrice.toFixed(2)} UF</span>
                          </div>
                          {extraBranches > 0 && (
                            <div className="flex items-center justify-between text-purple-300">
                              <span>{extraBranches} {extraBranches === 1 ? "sucursal extra" : "sucursales extra"}:</span>
                              <span className="font-bold">+{branchesCost.toFixed(2)} UF</span>
                            </div>
                          )}
                          {extraCashiers > 0 && (
                            <div className="flex items-center justify-between text-amber-300">
                              <span>{extraCashiers} {extraCashiers === 1 ? "cajero extra" : "cajeros extra"}:</span>
                              <span className="font-bold">+{cashiersCost.toFixed(2)} UF</span>
                            </div>
                          )}
                          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
                            <span className="text-white/70 font-semibold">Total Neto:</span>
                            <span className="text-white font-extrabold">{totalNetUF.toFixed(2)} UF <span className="text-emerald-400 font-semibold">+ IVA</span></span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                            <span>Total Bruto (19% IVA):</span>
                            <span>{totalGrossUF.toFixed(2)} UF/mes</span>
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold text-white">
                      <IconMapPin className="w-3.5 h-3.5 text-red" />
                      {branchCount}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono font-bold text-emerald-400">
                    ${Number(company.balance).toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="!p-2 text-xs hover:border-red/40 hover:text-white"
                        onClick={() => onManageCompanyUsers(company)}
                        title="Administrar usuarios y accesos corporativos"
                      >
                        <IconUsers className="w-4 h-4 text-red" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="!px-2.5 !py-2 text-xs gap-1 hover:border-purple-500/40"
                        onClick={() => toggleExpand(company.id)}
                        title={isExpanded ? "Ocultar sucursales" : "Ver sucursales"}
                      >
                        <IconStore className="w-4 h-4 text-purple-400" />
                        {isExpanded ? <IconChevronUp className="w-3.5 h-3.5" /> : <IconChevronDown className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </td>
                </tr>

                {/* Subtabla Desplegable de Sucursales */}
                {isExpanded && (
                  <tr className="bg-[#090C12]">
                    <td colSpan={7} className="p-4 pl-12 border-y border-white/10">
                      <div className="rounded-2xl border border-white/10 bg-[#0E121B] p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-3">
                            <h4 className="text-xs font-bold text-white/90 uppercase tracking-wider flex items-center gap-2">
                              <IconMapPin className="w-3.5 h-3.5 text-red" />
                              Sucursales de {company.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                              <span className="text-white/60">
                                Plan: <strong className="text-white">{company.plan?.name || "Sin Plan"} ({Number(company.plan?.price || 0).toFixed(2)} UF)</strong>
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                1 Casa Matriz incluida ($0 extra)
                              </span>
                              {branchCount > 1 && (
                                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                                  {branchCount - 1} extra (+{((branchCount - 1) * 2.5).toFixed(2)} UF/mes + IVA)
                                </span>
                              )}
                              {(() => {
                                const extraCashiers = company.stores?.reduce((acc, s) => {
                                  const cashiers = s.members?.filter((m) => m.role === "CASHIER")?.length || 0;
                                  return acc + Math.max(0, cashiers - 1);
                                }, 0) || 0;
                                if (extraCashiers > 0) {
                                  return (
                                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                                      {extraCashiers} cajero(s) extra (+{(extraCashiers * 0.35).toFixed(2)} UF/mes + IVA)
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                              {company.plan && (
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                                  Total a Facturar: {(
                                    (Number(company.plan.price || 0) +
                                    Math.max(0, branchCount - 1) * 2.5 +
                                    (company.stores?.reduce((acc, s) => {
                                      const cashiers = s.members?.filter((m) => m.role === "CASHIER")?.length || 0;
                                      return acc + Math.max(0, cashiers - 1);
                                    }, 0) || 0) * 0.35) * 1.19
                                  ).toFixed(2)} UF con IVA
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="primary"
                            className="!px-3 !py-1 text-xs gap-1.5 self-start sm:self-auto"
                            onClick={() => onAddBranch(company)}
                          >
                            <IconPlus className="w-3.5 h-3.5" />
                            <span>Agregar Sucursal</span>
                          </Button>
                        </div>

                        {company.stores.length > 0 ? (
                          <div className="space-y-2">
                            {company.stores.map((branch: Branch) => (
                              <div
                                key={branch.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {branch.logoUrl ? (
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                                      <Image src={branch.logoUrl} alt={branch.name} fill unoptimized className="object-contain p-0.5" />
                                    </div>
                                  ) : (
                                    <div
                                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                        branch.isMainBranch ? "bg-emerald-400" : "bg-purple-400"
                                      }`}
                                    />
                                  )}
                                  <div className="truncate">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-xs truncate">{branch.name}</span>
                                      {branch.isMainBranch ? (
                                        <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold uppercase">
                                          Casa Matriz (Incluida)
                                        </span>
                                      ) : (
                                        <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold uppercase">
                                          Sucursal Extra (+2.5 UF)
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-purple-400 font-mono mt-0.5">
                                      subdomain: {branch.subdomain}
                                    </p>
                                    {branch.address && (
                                      <p className="text-[10px] text-white/40 truncate">{branch.address}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="!p-2 hover:border-red/40 hover:text-red text-xs"
                                    onClick={() => onManageStoreUsers(branch)}
                                    title="Gestionar personal y cajeros de esta sucursal"
                                  >
                                    <IconUser className="w-4 h-4 text-red" />
                                  </Button>
                                  <a
                                    href={getStoreUrl(branch.subdomain)}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Ver tienda pública"
                                  >
                                    <Button size="sm" variant="primary" className="!px-2.5 !py-1.5">
                                      <IconExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                  </a>
                                  <Link href={`/superadmin/stores/${branch.id}/edit`} title="Editar sucursal">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="!px-2.5 !py-1.5 hover:border-red/40 hover:text-red"
                                    >
                                      <IconPencil className="w-3.5 h-3.5" />
                                    </Button>
                                  </Link>
                                  {!branch.isMainBranch && (
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      className="!px-2.5 !py-1.5"
                                      onClick={() => onDelete(branch.id)}
                                      title="Eliminar sucursal"
                                    >
                                      <IconTrash className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 italic py-2">Sin sucursales registradas.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}

          {companies.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                No hay empresas ni tiendas registradas en el sistema.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
