"use client";
import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function BackupsPage() {
  const [backups, setBackups] = useState<{ id: string; filename: string; game: string; createdAt: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchBackups = async () => {
    try {
      const res = await fetch(`${API_URL}/sync/backups/all`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setShowConfirmModal(true);
  };

  const handleConfirmRollback = async () => {
    if (!pendingFile) return;

    const formData = new FormData();
    formData.append('file', pendingFile);
    
    setShowConfirmModal(false);
    setIsUploading(true);
    try {
      const res = await fetch(`${API_URL}/sync/rollback`, {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Rollback exitoso", "success");
      } else {
        showToast(data.message || "Error al hacer rollback", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    } finally {
      setIsUploading(false);
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCancelRollback = () => {
    setShowConfirmModal(false);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div>
        <h1 className="text-2xl font-bold text-white">Backups y Rollback (Precios)</h1>
        <p className="text-gray-4 text-sm mt-1">Descarga el historial de las últimas importaciones y revierte cambios si es necesario.</p>
      </div>

      <div className="max-w-6xl">
        <div className="bg-[#0f1115] rounded-2xl shadow-xl p-6 border border-white/5 border-t-4 border-red flex flex-col">
          <div className="flex-1">
            <h2 className="font-bold text-white mb-1">Listado General de Backups</h2>
            <p className="text-xs text-gray-4 mb-4">
              Cada vez que actualizas precios de Magic, Pokémon o Riftbound, se genera un CSV con las inserciones. 
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Descargar Backups */}
              <div className="bg-[#1a1d24] p-4 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white">Últimos Backups Generados</h3>
                  <Button variant="secondary" size="sm" onClick={fetchBackups}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </Button>
                </div>
                {backups.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay backups disponibles.</p>
                ) : (
                  <ul className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {backups.map((b) => (
                      <li key={b.id} className="flex items-center justify-between bg-black/20 p-2 rounded">
                        <div className="flex items-center gap-2 min-w-0 mr-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 uppercase flex-shrink-0">{b.game}</span>
                          <span className="text-xs text-gray-300 truncate">{b.filename}</span>
                        </div>
                        <a 
                          href={`${API_URL}/sync/backups/download/${b.id}`}
                          download
                          className="text-xs bg-blue/20 text-blue px-3 py-1 rounded hover:bg-blue/30 transition flex-shrink-0"
                        >
                          Descargar
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Hacer Rollback */}
              <div className="bg-[#1a1d24] p-4 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center text-red mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                </div>
                <h3 className="text-sm font-bold text-white mb-2">Revertir Precios con CSV</h3>
                <p className="text-xs text-gray-400 mb-4 max-w-sm">
                  Sube cualquier archivo CSV de backup. El sistema eliminará los precios exactos que estén registrados en el documento.
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
                    {isUploading ? "Revirtiendo..." : "Seleccionar CSV y Revertir"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Rollback */}
      <Modal isOpen={showConfirmModal} onClose={handleCancelRollback} maxWidth="sm">
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
              onClick={handleCancelRollback} 
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmRollback} 
              className="flex-1"
            >
              Sí, Revertir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
