import React from "react";
import Error from "@/app/(site)/(pages)/error/_components";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Página no encontrada (404) | TapTrade TCG Marketplace",
  description: "La página que buscas no existe o ha sido movida en TapTrade.",
};

const ErrorPage = () => {
  return (
    <main>
      <Error />
    </main>
  );
};

export default ErrorPage;
