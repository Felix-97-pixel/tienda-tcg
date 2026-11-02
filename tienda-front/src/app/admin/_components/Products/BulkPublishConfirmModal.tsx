"use client";
import React, { useState } from "react";
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
        showToast("Inventario publicado correctamente para la sucursal", "success");
        onSuccess();
        onClose();
      } else {
        showToast("Error al publicar el inventario", "error");
      }
    } catch (e) {
      showToast("Error de conexión al intentar publicar", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Publicación Masiva">
      <div className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue/10 border border-blue/20 rounded-full flex items-center justify-center text-blue">
            <IconSparkles className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">¿Estás seguro?</h3>
          {activeBranch && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
              <IconStore className="w-3.5 h-3.5 text-blue" />
              <span>Sucursal activa: <strong className="text-white">{activeBranch.name}</strong></span>
            </div>
          )}
          <p className="text-gray-4 text-sm leading-relaxed">
            Estás a punto de publicar <strong>todo</strong> el inventario pausado de esta sucursal de manera simultánea. Estas cartas estarán disponibles para que tus clientes las compren de inmediato.
          </p>
        </div>
        <div className="flex gap-3 mt-8">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={isPublishing}>
            Cancelar
          </Button>
          <Button variant="success" className="flex-1" onClick={handleBulkPublish} isLoading={isPublishing}>
            {isPublishing ? "Publicando..." : "Sí, publicar todo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
