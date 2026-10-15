import React from "react";
import Cart from "@/app/(site)/(pages)/cart/_components";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Carrito de Compras | TapTrade TCG Marketplace",
  description: "Revisa tus cartas coleccionables, calcula envíos de tiendas de Chile y finaliza tu compra segura en TapTrade.",
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
