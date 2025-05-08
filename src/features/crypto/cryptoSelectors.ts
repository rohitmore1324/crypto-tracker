import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export const selectAllAssets = (state: RootState) => state.crypto.assets;
export const selectAssetById = createSelector(
  [selectAllAssets, (_, id: string) => id],
  (assets, id) => assets.find((asset) => asset.id === id)
);
