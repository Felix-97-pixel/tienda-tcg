"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/features/auth-slice";
import { API_URL } from "@/utils/api";

export function useAdminSignin() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      return setError("Por favor, completa el CAPTCHA de seguridad.");
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, captchaToken }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      // Asegurarse de que el usuario es administrador o dueño de tienda
      if (data.user.role !== "ADMIN" && data.user.role !== "SUPERADMIN") {
        throw new Error("Acceso denegado. No tienes permisos de administrador.");
      }
      
      dispatch(loginSuccess({ user: data.user }));

      if (data.user.role === "SUPERADMIN") {
        router.push("/superadmin");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    setCaptchaToken,
    error,
    isLoading,
    handleSubmit
  };
}
