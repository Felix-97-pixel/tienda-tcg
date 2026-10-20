import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  features?: string[];
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  features: string[];
}

const getInitialState = (): AdminAuthState => {
  if (typeof window !== "undefined") {
    let adminUserStr = localStorage.getItem("admin_user");
    let adminFeaturesStr = localStorage.getItem("admin_features");

    // Auto-migración suave: si el usuario tenía sesión de ADMIN/SUPERADMIN en el storage regular "user",
    // la movemos al almacenamiento aislado de administración para no deslogearlo bruscamente.
    if (!adminUserStr) {
      const regularUserStr = localStorage.getItem("user");
      if (regularUserStr) {
        try {
          const parsed = JSON.parse(regularUserStr);
          if (parsed.role === "ADMIN" || parsed.role === "SUPERADMIN") {
            adminUserStr = regularUserStr;
            adminFeaturesStr = localStorage.getItem("features");
            localStorage.setItem("admin_user", adminUserStr);
            if (adminFeaturesStr) {
              localStorage.setItem("admin_features", adminFeaturesStr);
            }
            // Limpiar del storage de clientes normales
            localStorage.removeItem("user");
            localStorage.removeItem("features");
          }
        } catch (e) {
          // ignore
        }
      }
    }

    if (adminUserStr) {
      try {
        const user = JSON.parse(adminUserStr);
        const features = adminFeaturesStr ? JSON.parse(adminFeaturesStr) : [];
        return { user, isAuthenticated: true, features };
      } catch (e) {
        return { user: null, isAuthenticated: false, features: [] };
      }
    }
  }
  return { user: null, isAuthenticated: false, features: [] };
};

const initialState: AdminAuthState = getInitialState();

export const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    adminLoginSuccess: (state, action: PayloadAction<{ user: AdminUser; features?: string[] }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (action.payload.features) {
        state.features = action.payload.features;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_user", JSON.stringify(action.payload.user));
        if (action.payload.features) {
          localStorage.setItem("admin_features", JSON.stringify(action.payload.features));
        }
      }
    },
    updateAdminFeatures: (state, action: PayloadAction<string[]>) => {
      state.features = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_features", JSON.stringify(action.payload));
      }
    },
    adminLogout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.features = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_user");
        localStorage.removeItem("admin_features");
      }
    },
  },
});

export const { adminLoginSuccess, updateAdminFeatures, adminLogout } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;
