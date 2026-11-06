"use client";
import React from "react";
import { API_URL } from "@/utils/api";
import { Button } from "@/components/ui/Button";
import { useSuperAdminBackups } from "@/app/superadmin/_components/Sync/hooks/useSuperAdminBackups";
import RollbackConfirmModal from "@/app/superadmin/_components/Sync/RollbackConfirmModal";
import { useTranslations } from "next-intl";
import { IconRefresh, IconArrowLeft } from "@/components/ui/Icons";

export default function BackupsPage() {
  const t = useTranslations("backups_page");
  const {
    backups,
    fetchBackups,
    isUploading,
    pendingFile,
    showConfirmModal,
    fileInputRef,
    handleFileSelected,
    handleConfirmRollback,
    handleCancelRollback,
  } = useSuperAdminBackups();

  return (
    <div className="p-6 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
      </div>

      <div className="max-w-6xl">
        <div className="bg-[#0f1115] rounded-2xl shadow-xl p-6 border border-white/5 border-t-4 border-red flex flex-col">
          <div className="flex-1">
            <h2 className="font-bold text-white mb-1">{t("list_title")}</h2>
            <p className="text-xs text-gray-4 mb-4">
              {t("list_desc")}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Descargar Backups */}
              <div className="bg-[#1a1d24] p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">{t("latest_backups")}</h3>
                  <Button variant="secondary" size="sm" onClick={fetchBackups}>
                    <IconRefresh className="w-4 h-4" />
                  </Button>
                </div>
                {backups.length === 0 ? (
                  <p className="text-sm text-gray-500">{t("no_backups")}</p>
                ) : (
                  <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {backups.map((b) => (
                      <li key={b.id} className="flex items-center justify-between bg-black/20 p-2 rounded">
                        <div className="flex items-center gap-2 min-w-0 mr-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 uppercase flex-shrink-0">
                            {b.game}
                          </span>
                          <span className="text-xs text-gray-300 truncate">{b.filename}</span>
                        </div>
                        <a
                          href={`${API_URL}/sync/backups/download/${b.id}`}
                          download
                          className="text-xs bg-blue/20 text-blue px-3 py-1 rounded hover:bg-blue/30 transition flex-shrink-0"
                        >
                          {t("btn_download")}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Hacer Rollback */}
              <div className="bg-[#1a1d24] p-4 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center text-red mb-3">
                  <IconArrowLeft className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{t("rollback_title")}</h3>
                <p className="text-xs text-gray-400 mb-4 max-w-sm">
                  {t("rollback_desc")}
                </p>
                <div className="relative w-full max-w-sm">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelected}
                    disabled={isUploading}
                  />
                  <Button variant="danger" disabled={isUploading} className="w-full">
                    {isUploading ? t("reverting") : t("btn_select_csv")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RollbackConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelRollback}
        onConfirm={handleConfirmRollback}
        pendingFile={pendingFile}
      />
    </div>
  );
}