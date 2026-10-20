import React from "react";
import MailSuccess from "@/app/(site)/(pages)/mail-success/_components";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Mensaje Enviado con Éxito | TapTrade TCG Marketplace",
  description: "Tu solicitud ha sido recibida correctamente por el equipo de TapTrade.",
};

const MailSuccessPage = () => {
  return (
    <main>
      <MailSuccess />
    </main>
  );
};

export default MailSuccessPage;
