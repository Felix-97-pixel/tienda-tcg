"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSuperAdminPlans } from "@/app/superadmin/_components/Config/hooks/useSuperAdminPlans";
import {
  IconCheckCircle,
  IconStore,
  IconPlus,
  IconPencil,
  IconTrash,
  IconTag,
  IconEye,
  IconX,
} from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

export default function PlansPage() {
  const t = useTranslations("plans_page");
  const {
    plans,
    loading,
    isModalOpen,
    editingPlan,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleDelete,
  } = useSuperAdminPlans();

  const [activeTab, setActiveTab] = React.useState<"ALL" | "STANDARD" | "OFFER">("ALL");

  const filteredPlans = plans.filter((p) => {
    if (activeTab === "STANDARD") return p.isStandard;
    if (activeTab === "OFFER") return !p.isStandard;
    return true;
  });

  const standardCount = plans.filter((p) => p.isStandard).length;
  const offerCount = plans.filter((p) => !p.isStandard).length;

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">{t("title")}</h1>
          <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<IconPlus className="w-5 h-5" />}>
          {t("btn_new_plan")}
        </Button>
      </div>

      {/* Selector de pestañas / Filtro */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "ALL"
              ? "bg-white/10 text-white border border-white/20 shadow-sm"
              : "text-gray-4 hover:text-white hover:bg-white/5"
          }`}
        >
          <span>{t("tab_all")}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-gray-3">{plans.length}</span>
        </button>

        <button
          onClick={() => setActiveTab("STANDARD")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "STANDARD"
              ? "bg-blue/20 text-blue border border-blue/30 shadow-sm"
              : "text-gray-4 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue"></span>
          <span>{t("tab_standard")}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue/20 text-blue">{standardCount}</span>
        </button>

        <button
          onClick={() => setActiveTab("OFFER")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "OFFER"
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm"
              : "text-gray-4 hover:text-white hover:bg-white/5"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>{t("tab_offer")}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-400">{offerCount}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                plan.isStandard
                  ? "bg-[#111318] border-white/10 shadow-lg shadow-black/40 hover:border-blue/50"
                  : "bg-gradient-to-b from-[#181512] to-[#111318] border-amber-500/20 hover:border-amber-500/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {plan.isStandard ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue/15 text-blue border border-blue/30 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse"></span>
                      {t("tab_standard")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
                      <IconTag className="w-3 h-3" />
                      {t("tab_offer")}
                    </span>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(plan)}
                      title={t("edit_plan_title")}
                      className="w-8 h-8 rounded-full bg-white/5 text-gray-3 flex items-center justify-center hover:bg-blue hover:text-white transition-colors cursor-pointer"
                    >
                      <IconPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      title={t("delete_plan_title")}
                      className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h2 className="text-xl font-black text-white mb-2">{plan.name}</h2>
                <p className="text-sm text-gray-4 mb-4 line-clamp-2 min-h-[40px]">{plan.description}</p>

                <div className="text-3xl font-black text-white mb-6">
                  {Number(plan.price).toLocaleString()} <span className="text-base font-bold text-emerald-400">UF</span>{" "}
                  <span className="text-sm font-medium text-gray-5">{t("per_month_suffix")}</span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-[#111318] rounded-xl p-3 flex-1 border border-white/5">
                    <p className="text-[10px] text-gray-5 font-bold uppercase tracking-wider mb-1">{t("max_skus")}</p>
                    <p className="text-sm font-bold text-white font-mono">
                      {plan.skuLimit === -1 ? t("unlimited") : plan.skuLimit.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 rounded-xl p-3 flex-1 border border-emerald-500/20">
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
                      {t("sales_commission")}
                    </p>
                    <p className="text-sm font-bold text-emerald-400 flex items-center gap-1 font-mono">
                      <IconCheckCircle className="w-3.5 h-3.5" />
                      {t("zero_percent_saas")}
                    </p>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 mb-4 flex items-center justify-between text-xs">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <IconStore className="w-3.5 h-3.5 text-purple-400" />
                    {t("base_branch")}
                  </span>
                  <span className="font-bold text-emerald-400 font-mono text-[11px]">{t("one_hq")}</span>
                </div>

                {/* Nota de Módulos Base Incluidos */}
                <div className="pt-4 border-t border-white/5 space-y-1.5">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{t("included_modules_badge")}</span>
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {t("included_modules_desc")}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filteredPlans.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-5 border-2 border-dashed border-white/5 rounded-2xl">
              {t("no_plans_in_category")}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1a1d24] border border-white/10 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-white">
                {editingPlan ? t("modal_edit_title") : t("modal_new_title")}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-4 hover:text-white cursor-pointer">
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="plan-form" onSubmit={handleSave} className="space-y-6">
                {/* Selector de Plan Estándar vs Oferta */}
                <div
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    formData.isStandard
                      ? "bg-blue/10 border-blue/40 shadow-sm"
                      : "bg-[#111318] border-white/5 hover:border-white/15"
                  }`}
                  onClick={() => setFormData({ ...formData, isStandard: !formData.isStandard })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 p-2 rounded-lg ${
                          formData.isStandard ? "bg-blue text-white" : "bg-white/5 text-gray-4"
                        }`}
                      >
                        <IconEye className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-black text-white">
                            {formData.isStandard ? t("plan_standard_public") : t("plan_offer_private")}
                          </p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              formData.isStandard ? "bg-blue text-white" : "bg-amber-500 text-black"
                            }`}
                          >
                            {formData.isStandard ? t("visible_on_landing") : t("hidden_from_landing")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-4 mt-0.5">
                          {formData.isStandard ? t("standard_desc") : t("offer_desc")}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                        formData.isStandard ? "bg-blue" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          formData.isStandard ? "translate-x-6" : "translate-x-0"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("field_name")}
                    placeholder={t("placeholder_name")}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    label={t("field_price_uf")}
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("field_sku_limit")}
                    type="number"
                    required
                    value={formData.skuLimit}
                    onChange={(e) => setFormData({ ...formData, skuLimit: e.target.value })}
                  />
                  <div>
                    <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">
                      {t("field_sales_fee")}
                    </label>
                    <div className="w-full bg-[#111318] border border-emerald-500/30 rounded-xl px-4 py-3 flex items-center justify-between text-sm">
                      <span className="font-bold text-emerald-400 flex items-center gap-2">
                        <IconCheckCircle className="w-4 h-4 text-emerald-400" />
                        {t("zero_commission")}
                      </span>
                      <span className="text-[11px] text-gray-4 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                        {t("saas_pure")}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-4 uppercase tracking-wider mb-2">
                    {t("field_description")}
                  </label>
                  <textarea
                    className="w-full bg-[#111318] border border-stroke rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none transition-colors resize-none h-20"
                    placeholder={t("placeholder_description")}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3.5 text-xs flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 shrink-0 mt-0.5">
                    <IconStore className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{t("billing_rule_title")}</span>
                    <span className="text-gray-400">{t("billing_rule_desc")}</span>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-white/10 shrink-0 flex justify-end gap-3 bg-[#111318]">
              <Button type="button" variant="secondary" onClick={handleCloseModal}>
                {t("btn_cancel")}
              </Button>
              <Button type="submit" form="plan-form">
                {t("btn_save_plan")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}