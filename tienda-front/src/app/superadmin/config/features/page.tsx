"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FeaturesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/superadmin/config/plans");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] text-gray-400 text-sm">
      Redirigiendo a Planes de Suscripción...
    </div>
  );
}
