import React from "react";
import CheckoutWebpay from "@/components/Checkout";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Checkout | TapTrade TCG",
  description: "Completa tu compra de forma segura con Webpay Plus",
};

const CheckoutPage = () => {
  return (
    <main>
      <CheckoutWebpay />
    </main>
  );
};

export default CheckoutPage;
