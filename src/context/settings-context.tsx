"use client";

import { createContext, useContext } from "react";
import type { Settings } from "@/services/settings";

export interface SettingsContextValue {
  settings: Settings | null;
  isLoaded: boolean;
}

export const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  isLoaded: false,
});

export function useSettingsContext() {
  return useContext(SettingsContext);
}
