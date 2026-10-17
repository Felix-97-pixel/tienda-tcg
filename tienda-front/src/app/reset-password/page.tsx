"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      router.replace(`/restablecer-contrasena?token=${encodeURIComponent(token)}`);
    } else {
      router.replace("/restablecer-contrasena");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E] text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-red border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-white/50 font-mono tracking-wider">Redirigiendo a TapTrade...</span>
      </div>
    </div>
  );
}

export default function ResetPasswordRedirectPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordRedirectContent />
    </Suspense>
  );
}
