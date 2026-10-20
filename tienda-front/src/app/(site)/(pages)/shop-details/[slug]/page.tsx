import React from "react";
import ShopDetails from "@/app/(site)/(pages)/shop-details/_components";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalles del Producto | TapTrade TCG Marketplace",
  description: "Compara precios y condiciones entre todas las tiendas verificadas en TapTrade.",
};

const ShopDetailsPage = () => {
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;
