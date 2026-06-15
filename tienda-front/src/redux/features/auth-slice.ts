import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  features?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  features: string[];
}

const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    const featuresStr = localStorage.getItem("features");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const features = featuresStr ? JSON.parse(featuresStr) : [];
        return { user, isAuthenticated: true, features };
      } catch (e) {
        return { user: null, isAuthenticated: false, features: [] };
      }
    }
  }
  return { user: null, isAuthenticated: false, features: [] };
};

const initialState: AuthState = getInitialState();

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User, features?: string[] }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      if (action.payload.features) {
        state.features = action.payload.features;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.features) {
          localStorage.setItem("features", JSON.stringify(action.payload.features));
        }
      }
    },
    updateFeatures: (state, action: PayloadAction<string[]>) => {
      state.features = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("features", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.features = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("features");
      }
    },
  },
});

export const { loginSuccess, updateFeatures, logout } = authSlice.actions;
export default authSlice.reducer;
