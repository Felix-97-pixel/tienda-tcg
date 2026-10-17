import React, { Suspense } from "react";
import TcgMarketplaceCatalog from "./_components/TcgMarketplaceCatalog";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Cartas TCG | Singles y Sellado | TapTrade Chile",
  description: "Explora el marketplace oficial de cartas TCG de Chile. Singles de Pokémon, Magic, Yu-Gi-Oh!, One Piece y Riftbound de tiendas verificadas con despacho o retiro presencial.",
};

const ShopPage = () => {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#07090E] pt-32 text-center text-white/50 font-mono">Cargando catálogo...</div>}>
        <TcgMarketplaceCatalog />
      </Suspense>
    </main>
  );
};

export default ShopPage;
