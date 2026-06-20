import React from "react";
import Error from "@/app/(site)/(pages)/error/_components";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Error Page | NextCommerce Nextjs E-commerce template",
  description: "This is Error Page for NextCommerce Template",
  // other metadata
};

const ErrorPage = () => {
  return (
    <main>
      <Error />
    </main>
  );
};

export default ErrorPage;
