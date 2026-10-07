import Loader from "@/components/ui/Loader";
import React, { Suspense } from "react";
import PaymentResult from "@/app/(site)/(pages)/checkout/_components/PaymentResult";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resultado del pago | TapTrade TCG",
  description: "Estado de tu transacción Webpay",
};

const CheckoutResultPage = () => {
  return (
    <Suspense fallback={<Loader text="Cargando..." className="min-h-[40vh] bg-transparent py-10" />}>
      <PaymentResult />
    </Suspense>
  );
};

export default CheckoutResultPage;
