"use client";

import { store } from "./store";
import { Provider } from "react-redux";
import { useState, useEffect } from "react";
import { logout } from "./features/auth-slice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        // Deslogear si expira el token y no es la ruta de login
        if (response.status === 401) {
          const isLogin = typeof args[0] === 'string' && args[0].includes('/auth/login');
          if (!isLogin) {
            store.dispatch(logout());
          }
        }
        return response;
      };
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
