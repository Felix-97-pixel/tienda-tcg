import React from "react";
import { Metadata } from "next";
import TerminosCondicionesClient from "./TerminosCondicionesClient";

export const metadata: Metadata = {
  title: "Términos y Condiciones | TapTrade Chile",
  description: "Términos y condiciones legales oficiales de la plataforma SaaS y Marketplace de TCG TapTrade SpA (RUT 78.531.106-K) en Chile.",
};

const TerminosCondicionesPage = () => {
  return <TerminosCondicionesClient />;
};

export default TerminosCondicionesPage;
