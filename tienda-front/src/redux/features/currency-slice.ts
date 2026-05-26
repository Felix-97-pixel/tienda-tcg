import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { API_URL } from "@/utils/api";

export interface CurrencyState {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyState = {
  id: "",
  code: "USD",
  name: "Dólar",
  symbol: "$",
  exchangeRate: 1,
  isDefault: true,
  loading: false,
  error: null,
};

export const fetchDefaultCurrency = createAsyncThunk(
  "currency/fetchDefaultCurrency",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/currencies/default`);
      if (!response.ok) {
        throw new Error("Failed to fetch default currency");
      }
      const data = await response.json();
      if (!data) return initialState;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<Partial<CurrencyState>>) => {
      return { ...state, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDefaultCurrency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDefaultCurrency.fulfilled, (state, action) => {
        state.loading = false;
        state.id = action.payload.id || state.id;
        state.code = action.payload.code || state.code;
        state.name = action.payload.name || state.name;
        state.symbol = action.payload.symbol || state.symbol;
        state.exchangeRate = Number(action.payload.exchangeRate) || state.exchangeRate;
        state.isDefault = action.payload.isDefault ?? state.isDefault;
      })
      .addCase(fetchDefaultCurrency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;
