import React from "react";
import { Metadata } from "next";
import PoliticaPrivacidadClient from "./PoliticaPrivacidadClient";

export const metadata: Metadata = {
  title: "Política de Privacidad | Blood Moon Games",
  description: "Detalles y políticas de privacidad oficiales sobre el tratamiento de tus datos personales en Blood Moon Games.",
};

const PoliticaPrivacidadPage = () => {
  return <PoliticaPrivacidadClient />;
};

export default PoliticaPrivacidadPage;
