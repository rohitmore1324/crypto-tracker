import { AppDispatch } from "../../store";
import { updatePrice, updateChange } from "../crypto/cryptoSlice";

export const startMockWebSocket = (dispatch: AppDispatch) => {
  setInterval(() => {
    const assets = ["bitcoin", "ethereum", "tether", "solana", "cardano"];
    assets.forEach((id) => {
      const priceChange = (Math.random() * 1000 - 500).toFixed(2);
      const newPrice = Math.max(1000, Math.floor(Math.random() * 100000));
      const change1h = (Math.random() * 10 - 5).toFixed(2);
      const change24h = (Math.random() * 15 - 7.5).toFixed(2);

      dispatch(updatePrice({ id, newPrice }));
      dispatch(
        updateChange({ id, change1h: +change1h, change24h: +change24h })
      );
    });
  }, 2000); // Update every 2 seconds
};
