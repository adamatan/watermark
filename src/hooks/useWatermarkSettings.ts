import { useState } from "react";
import type { LayerSettings, WatermarkSettings } from "../types";
import { makeDefaultSettings, makeLayer2Defaults, DOUBLE_PRESET } from "../constants";

export function useWatermarkSettings() {
  const [settings, setSettings] = useState<WatermarkSettings>(makeDefaultSettings);

  function updateLayerSettings(layerIndex: 0 | 1, patch: Partial<LayerSettings>) {
    setSettings((prev) => {
      const layers = [...prev.layers] as [LayerSettings, LayerSettings | null];
      const current = layers[layerIndex];
      if (current === null) return prev;
      layers[layerIndex] = { ...current, ...patch };
      return { ...prev, layers };
    });
  }

  function updateGlobalSettings(patch: Partial<Pick<WatermarkSettings, "noiseLevel" | "noiseBoost">>) {
    setSettings((prev) => ({ ...prev, ...patch }));
  }

  function enableLayer2(layer1: LayerSettings) {
    setSettings((prev) => {
      const layers: [LayerSettings, LayerSettings | null] = [prev.layers[0], makeLayer2Defaults(layer1)];
      return { ...prev, layers };
    });
  }

  function disableLayer2() {
    setSettings((prev) => {
      const layers: [LayerSettings, LayerSettings | null] = [prev.layers[0], null];
      return { ...prev, layers };
    });
  }

  function applyDoublePreset() {
    setSettings((prev) => {
      const text = prev.layers[1]?.text ?? prev.layers[0].text;
      const layer1: LayerSettings = { ...prev.layers[0], ...DOUBLE_PRESET.layer1 };
      const layer2: LayerSettings = { text, ...DOUBLE_PRESET.layer2 };
      return { ...prev, layers: [layer1, layer2] };
    });
  }

  function resetSettings() {
    setSettings(makeDefaultSettings());
  }

  return { settings, updateLayerSettings, updateGlobalSettings, enableLayer2, disableLayer2, applyDoublePreset, resetSettings };
}
