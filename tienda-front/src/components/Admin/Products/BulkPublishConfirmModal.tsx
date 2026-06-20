"use client";
import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

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
  const [isPublishing, setIsPublishing] = useState(false);

  const handleBulkPublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch(`${API_URL}/products/inventory/bulk-publish`, {
        method: "PATCH",
        credentials: "include",
      });
      if (res.ok) {
        showToast("Inventario publicado correctamente", "success");
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
          <div className="w-16 h-16 bg-blue/10 rounded-full flex items-center justify-center text-blue">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">¿Estás seguro?</h3>
          <p className="text-gray-4">
            Estás a punto de publicar **todo** tu inventario pausado de manera simultánea. Estas cartas estarán disponibles para que tus clientes las compren de inmediato.
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
