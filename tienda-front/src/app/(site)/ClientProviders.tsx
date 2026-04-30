"use client";

import React from "react";
import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import PreviewSliderModal from "@/components/Common/PreviewSlider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <CartModalProvider>
        <ModalProvider>
          <PreviewSliderProvider>
            {children}
            <QuickViewModal />
            <CartSidebarModal />
            <PreviewSliderModal />
          </PreviewSliderProvider>
        </ModalProvider>
      </CartModalProvider>
    </ReduxProvider>
  );
}
