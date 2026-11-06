"use client";
import React from "react";
import ExpansionTable from "@/app/superadmin/_components/Expansions/ExpansionTable";
import LinkExpansionModal from "@/app/superadmin/_components/Expansions/LinkExpansionModal";
import AutoMapModal from "@/app/superadmin/_components/Expansions/AutoMapModal";
import { Button } from "@/components/ui/Button";
import { useSuperAdminExpansions } from "@/app/superadmin/_components/Config/hooks/useSuperAdminExpansions";
import { useTranslations } from "next-intl";
import { IconWrench } from "@/components/ui/Icons";

export default function ExpansionsPage() {
  const t = useTranslations("expansions_page");
  const {
    expansions,
    loading,
    page,
    setPage,
    totalPages,
    gameFilter,
    setGameFilter,
    search,
    setSearch,
    games,
    isLinkModalOpen,
    setIsLinkModalOpen,
    selectedExpansion,
    isAutoMapModalOpen,
    setIsAutoMapModalOpen,
    handleLinkClick,
    handleLinkSuccess,
    handleAutoMapSuccess,
  } = useSuperAdminExpansions();

  return (
    <div className="p-6 pb-24">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t("title")}</h1>
          <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsAutoMapModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 border-purple-500 shadow-lg shadow-purple-500/20"
        >
          <IconWrench className="w-4 h-4 mr-2" />
          {t("btn_automap")}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue/50"
          />
        </div>
        <select
          value={gameFilter}
          onChange={(e) => {
            setGameFilter(e.target.value);
            setPage(1);
          }}
          className="bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue/50"
        >
          <option value="all">{t("filter_all_games")}</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <ExpansionTable expansions={expansions} loading={loading} onLink={handleLinkClick} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            {t("btn_prev")}
          </Button>
          <span className="text-white flex items-center px-4 font-medium">
            {t("page_info", { page, total: totalPages })}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t("btn_next")}
          </Button>
        </div>
      )}

      {/* Modals */}
      {isLinkModalOpen && selectedExpansion && (
        <LinkExpansionModal
          expansion={selectedExpansion}
          onClose={() => setIsLinkModalOpen(false)}
          onSuccess={handleLinkSuccess}
        />
      )}

      {isAutoMapModalOpen && (
        <AutoMapModal onClose={() => setIsAutoMapModalOpen(false)} onSuccess={handleAutoMapSuccess} />
      )}
    </div>
  );
}