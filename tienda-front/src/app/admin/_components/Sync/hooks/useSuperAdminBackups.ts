"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

export interface Backup {
  id: string;
  filename: string;
  game: string;
  createdAt: string;
}

export function useSuperAdminBackups() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/sync/backups/all`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

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

  return {
    backups,
    fetchBackups,
    isUploading,
    pendingFile,
    showConfirmModal,
    fileInputRef,
    handleFileSelected,
    handleConfirmRollback,
    handleCancelRollback
  };
}
