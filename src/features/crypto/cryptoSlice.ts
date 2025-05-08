import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  image: string;
  sparkline: number[];
  lastUpdated: Date;
}

interface CryptoState {
  assets: CryptoAsset[];
  loading: boolean;
  error: string | null;
}

const initialState: CryptoState = {
  assets: [],
  loading: false,
  error: null
};

const cryptoSlice = createSlice({
  name: "crypto",
  initialState,
  reducers: {
    updateAssets: (state, action: PayloadAction<CryptoAsset[]>) => {
      state.assets = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
});

export const { updateAssets, setLoading, setError } = cryptoSlice.actions;
export default cryptoSlice.reducer;
