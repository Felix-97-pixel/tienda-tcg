"use client";
import React, { useState } from "react";
import Link from "next/link";
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
} from "@/components/ui/Icons";
import SearchableSelect from "@/components/ui/SearchableSelect";

interface StoreTableProps {
  companies: Company[];
  availablePlans: SubscriptionPlan[];
  loading: boolean;
  onDelete: (id: string) => void;
  onAssignPlan: (companyId: string, planId: string | null) => void;
  onAddBranch: (company: Company) => void;
}

export default function StoreTable({
  companies,
  availablePlans,
  loading,
  onDelete,
  onAssignPlan,
  onAddBranch,
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
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-dark to-red flex items-center justify-center font-bold text-white shadow-sm">
                        <IconStore className="w-4 h-4 text-white" />
                      </div>
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
                    <p className="text-white font-medium text-xs">{company.owner?.name}</p>
                    <p className="text-[11px] text-white/40">{company.owner?.email}</p>
                  </td>
                  <td className="px-4 py-4 min-w-[220px]">
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
                    <Button
                      size="sm"
                      variant="secondary"
                      className="!px-3 !py-1.5 text-xs gap-1.5"
                      onClick={() => toggleExpand(company.id)}
                    >
                      <span>Sucursales</span>
                      {isExpanded ? <IconChevronUp className="w-3.5 h-3.5" /> : <IconChevronDown className="w-3.5 h-3.5" />}
                    </Button>
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
                            <span className="text-[10px] text-white/40 font-mono">
                              Plan: {company.plan?.name || "Sin Plan"} (Cubre 1 Casa Matriz)
                            </span>
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
                                  <div
                                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                      branch.isMainBranch ? "bg-emerald-400" : "bg-purple-400"
                                    }`}
                                  />
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
