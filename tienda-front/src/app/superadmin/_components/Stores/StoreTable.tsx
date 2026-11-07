"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
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
  IconShieldCheck,
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
  onManageCompliance?: (company: Company) => void;
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
  onManageCompliance,
}: StoreTableProps) {
  const t = useTranslations("stores_page");
  const [expandedCompanyIds, setExpandedCompanyIds] = useState<Record<string, boolean>>({});

  const planOptions = [
    { label: t("no_plan_assigned"), value: "" },
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
    return <Loader text={t("loading_companies")} className="min-h-[40vh] bg-transparent py-10" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-[#0a0a0a] text-gray-400">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">{t("col_company")}</th>
            <th className="px-4 py-3">{t("col_rut")}</th>
            <th className="px-4 py-3">{t("col_owner")}</th>
            <th className="px-4 py-3">{t("col_plan")}</th>
            <th className="px-4 py-3">{t("col_branches")}</th>
            <th className="px-4 py-3">{t("col_wallet")}</th>
            <th className="px-4 py-3 rounded-tr-lg text-right">{t("col_detail")}</th>
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
                          {branchCount} {t("col_branches").toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-xs font-mono text-white/70 space-y-1">
                    <div>
                      {company.rut || <span className="text-white/30 italic">{t("no_rut_assigned")}</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          company.verificationStatus === "SUSPENDED" ||
                          company.verificationStatus === "BLOCKED"
                            ? "bg-red/15 text-red border-red/30"
                            : company.verificationStatus === "PENDING_VERIFICATION" ||
                              company.verificationStatus === "PENDING_DOCS"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {company.verificationStatus || "ENABLED"}
                      </span>
                      {company.customCommissionRate !== null &&
                        company.customCommissionRate !== undefined && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            Com: {Number(company.customCommissionRate)}%
                          </span>
                        )}
                    </div>
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
                          title={t("edit_credentials_title")}
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
                      placeholder={t("search_assign_plan")}
                      noResultsText={t("no_plans_found")}
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
                            <span>{t("base_plan_label", { name: company.plan.name })}</span>
                            <span className="text-white font-bold">{planPrice.toFixed(2)} UF</span>
                          </div>
                          {extraBranches > 0 && (
                            <div className="flex items-center justify-between text-purple-300">
                              <span>+{extraBranches}:</span>
                              <span className="font-bold">+{branchesCost.toFixed(2)} UF</span>
                            </div>
                          )}
                          {extraCashiers > 0 && (
                            <div className="flex items-center justify-between text-amber-300">
                              <span>+{extraCashiers} POS:</span>
                              <span className="font-bold">+{cashiersCost.toFixed(2)} UF</span>
                            </div>
                          )}
                          <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
                            <span className="text-white/70 font-semibold">{t("total_net")}</span>
                            <span className="text-white font-extrabold">{totalNetUF.toFixed(2)} UF <span className="text-emerald-400 font-semibold">{t("plus_vat")}</span></span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                            <span>{t("total_gross_vat")}</span>
                            <span>{totalGrossUF.toFixed(2)} {t("per_month_uf")}</span>
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
                      {onManageCompliance && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="!p-2 text-xs hover:border-emerald-500/40 hover:text-white"
                          onClick={() => onManageCompliance(company)}
                          title={t("compliance_btn_title")}
                        >
                          <IconShieldCheck className="w-4 h-4 text-emerald-400" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="!p-2 text-xs hover:border-red/40 hover:text-white"
                        onClick={() => onManageCompanyUsers(company)}
                        title={t("corp_access_title")}
                      >
                        <IconUsers className="w-4 h-4 text-red" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="!px-2.5 !py-2 text-xs gap-1 hover:border-purple-500/40"
                        onClick={() => toggleExpand(company.id)}
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
                              {t("branches_of", { name: company.name })}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                              <span className="text-white/60">
                                <strong className="text-white">{company.plan?.name || t("no_plan_assigned")} ({Number(company.plan?.price || 0).toFixed(2)} UF)</strong>
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                {t("hq_included_badge")}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="primary"
                            className="!px-3 !py-1 text-xs gap-1.5 self-start sm:self-auto"
                            onClick={() => onAddBranch(company)}
                          >
                            <IconPlus className="w-3.5 h-3.5" />
                            <span>{t("add_branch_btn")}</span>
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
                                          {t("hq_badge")}
                                        </span>
                                      ) : (
                                        <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold uppercase">
                                          {t("extra_branch_badge")}
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
                                  >
                                    <IconUser className="w-4 h-4 text-red" />
                                  </Button>
                                  <a
                                    href={getStoreUrl(branch.subdomain)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Button size="sm" variant="primary" className="!px-2.5 !py-1.5">
                                      <IconExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                  </a>
                                  <Link href={`/superadmin/stores/${branch.id}/edit`}>
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
                                    >
                                      <IconTrash className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/40 italic py-2">{t("no_branches")}</p>
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
                {t("no_companies")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
