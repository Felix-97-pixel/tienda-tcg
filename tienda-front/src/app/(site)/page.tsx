import React from "react";
import Home from "@/app/landing/_components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio | TapTrade",
  description: "Marketplace de cartas TCG",
};

export default function StoreFrontHomePage() {
  return (
    <>
      <Home />
    </>
  );
}
