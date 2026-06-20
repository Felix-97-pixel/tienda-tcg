import Contact from "@/app/(site)/(pages)/contact/_components";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact Page | NextCommerce Nextjs E-commerce template",
  description: "This is Contact Page for NextCommerce Template",
  // other metadata
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
