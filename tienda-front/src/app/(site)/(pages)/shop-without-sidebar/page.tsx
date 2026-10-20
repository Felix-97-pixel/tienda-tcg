import React from "react";
import ShopWithoutSidebar from "@/app/(site)/(pages)/shop-without-sidebar/_components";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Catálogo Completo TCG | TapTrade Marketplace",
  description: "Explora todas las cartas, sellados y accesorios de las mejores tiendas TCG de Chile.",
};

const ShopWithoutSidebarPage = () => {
  return (
    <main>
      <ShopWithoutSidebar />
    </main>
  );
};

export default ShopWithoutSidebarPage;
