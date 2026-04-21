"use client";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/features/auth-slice";
import { Turnstile } from "@marsidev/react-turnstile";

const Signin = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      return setError("Por favor, completa el CAPTCHA de seguridad.");
    }

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== "undefined") ? process.env.NEXT_PUBLIC_API_URL : `http://${window.location.hostname}:3001`;
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Necesario para enviar y recibir la cookie
        body: JSON.stringify({ email, password, captchaToken }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }
      
      dispatch(loginSuccess({ user: data.user }));
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Breadcrumb title={"Signin"} pages={["Signin"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Sign In to Your Account
              </h2>
              <p>Enter your detail below</p>
            </div>

            <div>
              {error && <p className="text-red-500 text-center mb-4 text-red">{error}</p>}
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="email" className="block mb-2.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    autoComplete="on"
                    className="rounded-lg border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="mb-5 flex justify-center">
                  <Turnstile
                    siteKey="1x00000000000000000000AA"
                    onSuccess={(token) => setCaptchaToken(token)}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5"
                >
                  Sign in to account
                </button>

                <p className="text-center mt-6">
                  Don&apos;t have an account?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Sign Up Now!
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
