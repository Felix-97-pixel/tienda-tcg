import React, { Suspense } from "react";
import PaymentResult from "@/app/(site)/(pages)/checkout/_components/PaymentResult";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resultado del pago | TapTrade TCG",
  description: "Estado de tu transacción Webpay",
};

const CheckoutResultPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <PaymentResult />
    </Suspense>
  );
};

export default CheckoutResultPage;
