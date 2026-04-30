import { Metadata } from "next";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "@/components/Common/ScrollToTop";
import ClientProviders from "./ClientProviders";

export const metadata: Metadata = {
  title: "TapTrade | Compra y Venta de Cartas TCG",
  description: "Tu tienda especializada en cartas Magic, Pokémon, Yu-Gi-Oh y más.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body>
        <ClientProviders>
          <Header />
          {children}
        </ClientProviders>
        <ScrollToTop />
        <Footer />
      </body>
    </html>
  );
}
