import { configureStore } from "@reduxjs/toolkit";
import cryptoReducer from "./features/crypto/cryptoSlice";

export const store = configureStore({
    reducer: {
        crypto: cryptoReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store; 