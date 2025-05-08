import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    assets: [],
    loading: false,
    error: null
};

const cryptoSlice = createSlice({
    name: "crypto",
    initialState,
    reducers: {
        updateAssets: (state, action) => {
            state.assets = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        }
    },
});

export const { updateAssets, setLoading, setError } = cryptoSlice.actions;
export default cryptoSlice.reducer; 