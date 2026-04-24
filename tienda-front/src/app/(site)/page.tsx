import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TapTrade",
  description: "Tienda especializada en TCG",
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
