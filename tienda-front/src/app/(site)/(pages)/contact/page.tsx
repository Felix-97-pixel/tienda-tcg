import Contact from "@/app/(site)/(pages)/contact/_components";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contacto y Soporte Oficial | TapTrade TCG Chile",
  description: "Comunícate con el equipo de soporte de TapTrade SpA. Resolvemos dudas sobre compras, envíos, apertura de tiendas TCG y transacciones seguras en Chile.",
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
