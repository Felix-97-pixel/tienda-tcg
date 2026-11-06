"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconAlertTriangle } from "@/components/ui/Icons";

interface RollbackConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pendingFile: File | null;
}

export default function RollbackConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  pendingFile
}: RollbackConfirmModalProps) {
  const t = useTranslations("backups_page");
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mb-4">
          <IconAlertTriangle className="w-8 h-8 text-red" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{t("confirm_rollback_title")}</h3>
        <p className="text-sm text-gray-400 mb-2">
          {t("confirm_rollback_desc")}
        </p>
        <p className="text-sm font-bold text-red mb-4 break-all">
          {pendingFile?.name}
        </p>
        <p className="text-xs text-gray-500 mb-6">
          {t("confirm_rollback_warn")}
        </p>
        <div className="flex gap-3 w-full">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            className="flex-1"
          >
            {t("btn_cancel")}
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm} 
            className="flex-1"
          >
            {t("btn_confirm_revert")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
