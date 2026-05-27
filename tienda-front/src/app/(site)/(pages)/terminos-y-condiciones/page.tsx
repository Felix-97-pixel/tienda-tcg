import React from "react";
import { Metadata } from "next";
import TerminosCondicionesClient from "./TerminosCondicionesClient";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Blood Moon Games",
  description: "Políticas, términos y condiciones oficiales para compras, envíos, devoluciones y créditos de tienda en Blood Moon Games.",
};

const TerminosCondicionesPage = () => {
  return <TerminosCondicionesClient />;
};

export default TerminosCondicionesPage;
