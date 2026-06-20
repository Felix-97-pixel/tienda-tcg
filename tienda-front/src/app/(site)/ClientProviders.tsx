"use client";

import React, { useEffect } from "react";
import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import QuickViewModal from "@/app/(site)/(pages)/shop/_components/widgets/QuickViewModal";
import CartSidebarModal from "@/app/(site)/(pages)/shop/_components/widgets/CartSidebarModal";
import PreviewSliderModal from "@/app/(site)/(pages)/shop/_components/widgets/PreviewSlider";
import ToastContainer from "@/components/layout/ToastContainer";
import { store } from "@/redux/store";
import { fetchDefaultCurrency } from "@/redux/features/currency-slice";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(fetchDefaultCurrency());
  }, []);

  return (
    <ReduxProvider>
      <CartModalProvider>
        <ModalProvider>
          <PreviewSliderProvider>
            {children}
            <QuickViewModal />
            <CartSidebarModal />
            <PreviewSliderModal />
            <ToastContainer />
          </PreviewSliderProvider>
        </ModalProvider>
      </CartModalProvider>
    </ReduxProvider>
  );
}
