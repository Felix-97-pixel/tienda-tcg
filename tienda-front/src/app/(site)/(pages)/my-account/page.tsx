import MyAccount from "@/app/(site)/(pages)/my-account/_components";
import React, { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Cuenta | TapTrade",
  description: "Gestiona tus pedidos, direcciones y datos de cuenta",
};

const MyAccountPage = () => {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#222630]" />}>
        <MyAccount />
      </Suspense>
    </main>
  );
};

export default MyAccountPage;
