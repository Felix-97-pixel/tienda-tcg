import AdminSignin from "@/app/admin/_components/AdminSignin";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login | TapTrade",
  description: "Acceso al panel de administración de tu tienda",
};

const SigninPage = () => {
  return (
    <main>
      <AdminSignin />
    </main>
  );
};

export default SigninPage;
