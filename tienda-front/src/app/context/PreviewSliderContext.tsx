"use client";
import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

interface PreviewSliderType {
  isModalPreviewOpen: boolean;
  openPreviewModal: () => void;
  closePreviewModal: () => void;
}

const PreviewSlider = createContext<PreviewSliderType | undefined>(undefined);

export const usePreviewSlider = () => {
  const context = useContext(PreviewSlider);
  if (!context) {
    throw new Error("usePreviewSlider must be used within a ModalProvider");
  }
  return context;
};

export const PreviewSliderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalPreviewOpen, setIsModalOpen] = useState(false);

  const openPreviewModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closePreviewModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({ isModalPreviewOpen, openPreviewModal, closePreviewModal }),
    [isModalPreviewOpen, openPreviewModal, closePreviewModal]
  );

  return (
    <PreviewSlider.Provider value={value}>
      {children}
    </PreviewSlider.Provider>
  );
};
