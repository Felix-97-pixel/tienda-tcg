"use client";
import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import {
  IconBox,
  IconStore,
  IconWrench,
  IconTrophy,
  IconMessageSquare,
  IconMail,
  IconClock,
  IconMapPin,
  IconCopy,
  IconChevronDown,
  IconCheckCircle,
  IconShieldCheck,
  IconSend,
  IconSparkles,
} from "@/components/ui/Icons";

interface FormData {
  name: string;
  email: string;
  phone: string;
  orderNumber: string;
  category: string;
  message: string;
}

export default function Contact() {
  const t = useTranslations("contact");

  const CATEGORIES = [
    { id: "pedido", label: t("form.categories.pedido"), icon: IconBox },
    { id: "tienda", label: t("form.categories.tienda"), icon: IconStore },
    { id: "soporte", label: t("form.categories.soporte"), icon: IconWrench },
    { id: "torneo", label: t("form.categories.torneo"), icon: IconTrophy },
    { id: "otro", label: t("form.categories.otro"), icon: IconMessageSquare },
  ];

  const FAQS = [
    { q: t("faq_list.q1"), a: t("faq_list.a1") },
    { q: t("faq_list.q2"), a: t("faq_list.a2") },
    { q: t("faq_list.q3"), a: t("faq_list.a3") },
    { q: t("faq_list.q4"), a: t("faq_list.a4") },
  ];

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    orderNumber: "",
    category: "pedido",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    toast.success(t("copy_toast", { label }));
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(t("form.err_name"));
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error(t("form.err_email"));
      return;
    }
    if (formData.message.trim().length < 10) {
      toast.error(t("form.err_message"));
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success(t("form.success_toast"));
    }, 900);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      orderNumber: "",
      category: "pedido",
      message: "",
    });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-24 sm:pt-28 pb-24 selection:bg-[#E10E0E] selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-red-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 mb-8">
          <Link href="/" className="hover:text-red-400 transition-colors">
            {t("breadcrumb_home")}
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">{t("breadcrumb_current")}</span>
        </div>

        {/* Hero Section */}
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm shadow-red-500/20">
            <span className="w-2 h-2 rounded-full bg-[#E10E0E] animate-pulse" />
            {t("badge")}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {t("title_prefix")}{" "}
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              {t("title_highlight")}
            </span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Main Grid: Info Cards (Left) + Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Corporate Info & Direct Channels (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Identity Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/15 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-700 via-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30 border border-white/10 shrink-0">
                  <span className="text-white font-black text-2xl leading-none">T</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight leading-snug">
                    {t("identity.company")}
                  </h2>
                  <p className="text-xs text-red-400 font-mono tracking-wider font-semibold">
                    {t("identity.subtitle")}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {t("identity.description")}
              </p>

              {/* Status Badge */}
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>{t("identity.status")}</span>
              </div>
            </div>

            {/* Direct Channels */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-5">
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-white/50">
                {t("channels_title")}
              </h3>

              {/* Channel 1: Support Email */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-red-500/30 transition-all group flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                    <IconMail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">
                      {t("channels.support_title")}
                    </span>
                    <a
                      href="mailto:soporte@taptrade.cl"
                      className="text-sm font-bold text-white hover:text-red-400 transition-colors"
                    >
                      soporte@taptrade.cl
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("soporte@taptrade.cl", t("channels.support_title"))}
                  className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5 flex items-center gap-1.5"
                  title={t("copy")}
                >
                  <IconCopy className="w-3 h-3 text-slate-400" />
                  <span>{copiedEmail === "soporte@taptrade.cl" ? t("copied") : t("copy")}</span>
                </button>
              </div>

              {/* Channel 2: General / Business Email */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/30 transition-all group flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <IconStore className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">
                      {t("channels.general_title")}
                    </span>
                    <a
                      href="mailto:contacto@taptrade.cl"
                      className="text-sm font-bold text-white hover:text-amber-400 transition-colors"
                    >
                      contacto@taptrade.cl
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("contacto@taptrade.cl", t("channels.general_title"))}
                  className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5 flex items-center gap-1.5"
                  title={t("copy")}
                >
                  <IconCopy className="w-3 h-3 text-slate-400" />
                  <span>{copiedEmail === "contacto@taptrade.cl" ? t("copied") : t("copy")}</span>
                </button>
              </div>

              {/* Channel 3: Business Hours */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <IconClock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">
                    {t("channels.hours_title")}
                  </span>
                  <p className="text-sm font-bold text-white">{t("channels.hours_week")}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t("channels.hours_weekend")}</p>
                </div>
              </div>

              {/* Channel 4: Logistics Coverage */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                  <IconMapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">
                    {t("channels.logistics_title")}
                  </span>
                  <p className="text-sm font-bold text-white">{t("channels.logistics_area")}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t("channels.logistics_desc")}</p>
                </div>
              </div>
            </div>

            {/* Quick Action for Sellers */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-500/20 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                  {t("seller_cta.title")}
                </span>
                <p className="text-xs text-slate-300 mt-0.5">{t("seller_cta.desc")}</p>
              </div>
              <Link
                href="/landing"
                className="px-3.5 py-2 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white text-xs font-bold transition-all shadow-md shadow-red-500/30 shrink-0"
              >
                {t("seller_cta.button")}
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 lg:p-10 rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl relative">
              {submitted ? (
                /* Success View */
                <div className="py-12 text-center space-y-5 animate-fade-in">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                    <IconCheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{t("form.success_title")}</h3>
                    <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      {t("form.success_desc", { name: formData.name, email: formData.email })}
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors border border-white/10"
                    >
                      {t("form.send_another")}
                    </button>
                    <Link
                      href="/shop"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-90 text-white text-xs font-bold transition-opacity shadow-lg shadow-red-500/25 flex items-center gap-1.5"
                    >
                      <IconSparkles className="w-3.5 h-3.5 text-white" />
                      <span>{t("form.explore_catalog")}</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {t("form.title")}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      {t("form.subtitle")}
                    </p>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
                      {t("form.category_label")} <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        const isSelected = formData.category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.id })}
                            className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center gap-2.5 group ${
                              isSelected
                                ? "bg-red-500/15 border-red-500 text-white font-bold shadow-md shadow-red-500/20"
                                : "bg-[#121622] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-[#E10E0E] text-white shadow-sm shadow-red-500/30"
                                  : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
                              }`}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                            </span>
                            <span className="truncate">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        {t("form.name_label")} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t("form.name_placeholder")}
                        className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        {t("form.email_label")} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t("form.email_placeholder")}
                        className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone & Order Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        {t("form.phone_label")}{" "}
                        <span className="text-slate-500 font-normal lowercase">{t("form.optional")}</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={t("form.phone_placeholder")}
                        className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        {t("form.order_label")}{" "}
                        <span className="text-slate-500 font-normal lowercase">{t("form.optional")}</span>
                      </label>
                      <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        placeholder={t("form.order_placeholder")}
                        className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      {t("form.message_label")} <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t("form.message_placeholder")}
                      className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <IconShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t("form.privacy_guarantee")}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:opacity-95 text-white font-bold text-sm tracking-wide transition-all shadow-xl shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          <span>{t("form.sending_btn")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("form.submit_btn")}</span>
                          <IconSend className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Frequently Asked Questions */}
        <div className="mt-20 pt-16 border-t border-white/[0.08]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
              {t("faqs_badge")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              {t("faqs_title")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              {t("faqs_subtitle")}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-red-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span
                    className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 shrink-0 transition-all duration-200 ${
                      openFaq === idx ? "rotate-180 text-red-400 bg-red-500/10" : ""
                    }`}
                  >
                    <IconChevronDown className="w-3.5 h-3.5" />
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
