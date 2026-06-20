"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">¿Confirmar Rollback?</h3>
        <p className="text-sm text-gray-400 mb-2">
          Estás a punto de revertir los precios usando el archivo:
        </p>
        <p className="text-sm font-bold text-red mb-4 break-all">
          {pendingFile?.name}
        </p>
        <p className="text-xs text-gray-500 mb-6">
          Esta acción eliminará de la base de datos todos los precios que estén registrados en el CSV. No se puede deshacer.
        </p>
        <div className="flex gap-3 w-full">
          <Button 
            variant="secondary" 
            onClick={onClose} 
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm} 
            className="flex-1"
          >
            Sí, Revertir
          </Button>
        </div>
      </div>
    </Modal>
  );
}
