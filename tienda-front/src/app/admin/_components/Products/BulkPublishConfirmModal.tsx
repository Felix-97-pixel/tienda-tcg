"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { adminFetch } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { useActiveBranch } from "@/hooks/useActiveBranch";
import { IconSparkles, IconStore } from "@/components/ui/Icons";

interface BulkPublishConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkPublishConfirmModal({
  isOpen,
  onClose,
  onSuccess,
}: BulkPublishConfirmModalProps) {
  const t = useTranslations("buylist_page");
  const { showToast } = useToast();
  const { activeBranch } = useActiveBranch();
  const [isPublishing, setIsPublishing] = useState(false);

  const handleBulkPublish = async () => {
    setIsPublishing(true);
    try {
      const res = await adminFetch("/products/inventory/bulk-publish", {
        method: "PATCH",
      });
      if (res.ok) {
        showToast(t("bulk_publish_title"), "success");
        onSuccess();
        onClose();
      } else {
        showToast("Error", "error");
      }
    } catch (e) {
      showToast("Error", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("bulk_publish_title")}>
      <div className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center text-blue">
            <IconSparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">{t("are_you_sure")}</h3>
          {activeBranch && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
              <IconStore className="w-3.5 h-3.5 text-blue" />
              <span>{t("active_branch_label")} <strong className="text-white">{activeBranch.name}</strong></span>
            </div>
          )}
          <p className="text-gray-4 text-sm leading-relaxed">
            {t("bulk_publish_desc")}
          </p>
        </div>
        <div className="flex gap-3 mt-8">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isPublishing}>
            {t("btn_cancel")}
          </Button>
          <Button variant="success" className="flex-1" onClick={handleBulkPublish} isLoading={isPublishing}>
            {isPublishing ? t("btn_publishing") : t("btn_yes_publish_all")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
