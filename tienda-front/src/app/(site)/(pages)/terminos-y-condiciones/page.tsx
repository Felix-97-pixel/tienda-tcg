import React from "react";
import { Metadata } from "next";
import TerminosCondicionesClient from "./TerminosCondicionesClient";

export const metadata: Metadata = {
  title: "Términos y Condiciones | TapTrade",
  description: "Políticas, términos y condiciones oficiales para compras, envíos, devoluciones y créditos de tienda en TapTrade.",
};

const TerminosCondicionesPage = () => {
  return <TerminosCondicionesClient />;
};

export default TerminosCondicionesPage;
