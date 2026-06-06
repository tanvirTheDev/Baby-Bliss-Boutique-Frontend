"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/settings";
import { SettingsContext } from "@/context/settings-context";

function applyColorVars(
  primary?: string | null,
  secondary?: string | null,
  accent?: string | null
) {
  const root = document.documentElement;
  if (primary) root.style.setProperty("--dynamic-primary", primary);
  if (secondary) root.style.setProperty("--dynamic-secondary", secondary);
  if (accent) root.style.setProperty("--dynamic-accent", accent);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: settings, isSuccess } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await settingsService.get();
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!settings) return;
    applyColorVars(settings.primaryColor, settings.secondaryColor, settings.accentColor);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings: settings ?? null, isLoaded: isSuccess }}>
      {children}
    </SettingsContext.Provider>
  );
}
