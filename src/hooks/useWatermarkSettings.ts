import { useState } from "react";
import type { WatermarkSettings } from "../types";
import { makeDefaultSettings } from "../constants";

export function useWatermarkSettings() {
  const [settings, setSettings] = useState<WatermarkSettings>(
    makeDefaultSettings
  );

  function updateSettings(patch: Partial<WatermarkSettings>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function resetSettings() {
    setSettings(makeDefaultSettings());
  }

  return { settings, updateSettings, resetSettings };
}
