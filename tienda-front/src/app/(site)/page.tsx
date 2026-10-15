import React from "react";
import Home from "@/app/landing/_components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TapTrade Chile | El Marketplace Oficial de Cartas TCG (Magic, Pokémon, Riftbound)",
  description: "Compra y vende singles, cajas y boosters en vivo de tiendas verificadas de Chile. Despacho oficial con Chilexpress, Starken y Retiro en Tienda $0.",
};

export default function StoreFrontHomePage() {
  return (
    <>
      <Home />
    </>
  );
}
