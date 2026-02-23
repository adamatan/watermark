import type { FontFamily, LayerSettings, WatermarkSettings } from "./types";

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/gif",
  "application/pdf",
] as const;

export const FONT_FAMILIES: FontFamily[] = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
];

export const DEBOUNCE_MS = 150;
export const JPEG_QUALITY = 0.92;

export type PresetName = "Default" | "Double" | "Subtle" | "Stamp";

export type PresetOverrides = Omit<LayerSettings, "text">;

// Ordered list used to render preset buttons
export const PRESET_NAMES: PresetName[] = ["Default", "Double", "Subtle", "Stamp"];

// Single-layer presets (apply to the active layer only)
export const PRESETS: Record<Exclude<PresetName, "Double">, PresetOverrides> = {
  Default: {
    color: "#1714CC",
    opacity: 0.5,
    fontSize: 36,
    rotation: 26,
    spacing: 100,
    fontFamily: "Arial",
    borderEnabled: false,
  },
  Subtle: {
    color: "#1714CC",
    opacity: 0.20,
    fontSize: 36,
    rotation: 26,
    spacing: 60,
    fontFamily: "Arial",
    borderEnabled: false,
  },
  Stamp: {
    color: "#DC2626",
    opacity: 0.5,
    fontSize: 50,
    rotation: 26,
    spacing: 50,
    fontFamily: "Arial",
    borderEnabled: true,
  },
};

// Dual-layer preset: applies to both layers simultaneously
export interface DualPreset {
  layer1: PresetOverrides;
  layer2: PresetOverrides;
}

export const DOUBLE_PRESET: DualPreset = {
  layer1: {
    color: "#1714CC",
    opacity: 0.40,
    fontSize: 36,
    rotation: 26,
    spacing: 100,
    fontFamily: "Arial",
    borderEnabled: false,
  },
  layer2: {
    color: "#DC2626",
    opacity: 0.30,
    fontSize: 40,
    rotation: -40,
    spacing: 120,
    fontFamily: "Courier New",
    borderEnabled: false,
  },
};

function layerMatchesOverrides(layer: LayerSettings, overrides: PresetOverrides): boolean {
  return (
    layer.color === overrides.color &&
    layer.opacity === overrides.opacity &&
    layer.fontSize === overrides.fontSize &&
    layer.rotation === overrides.rotation &&
    layer.spacing === overrides.spacing &&
    layer.fontFamily === overrides.fontFamily &&
    layer.borderEnabled === overrides.borderEnabled
  );
}

export function activePreset(layer: LayerSettings): Exclude<PresetName, "Double"> | null {
  for (const name of Object.keys(PRESETS) as Array<Exclude<PresetName, "Double">>) {
    if (layerMatchesOverrides(layer, PRESETS[name])) return name;
  }
  return null;
}

export function isDoublePresetActive(settings: WatermarkSettings): boolean {
  const layer2 = settings.layers[1];
  return (
    layer2 !== null &&
    layerMatchesOverrides(settings.layers[0], DOUBLE_PRESET.layer1) &&
    layerMatchesOverrides(layer2, DOUBLE_PRESET.layer2)
  );
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function makeDefaultLayerSettings(): LayerSettings {
  return {
    text: `Sent to Hotel Patagonia\nOn ${todayISO()}\nFor check in only`,
    color: "#1714CC",
    opacity: 0.5,
    fontSize: 36,
    rotation: 26,
    spacing: 100,
    fontFamily: "Arial",
    borderEnabled: false,
  };
}

export function makeLayer2Defaults(layer1: LayerSettings): LayerSettings {
  const layer1Preset = activePreset(layer1);
  const presetName: Exclude<PresetName, "Double"> = layer1Preset === "Subtle" ? "Default" : "Subtle";
  return {
    text: layer1.text,
    ...PRESETS[presetName],
  };
}

export function makeDefaultSettings(): WatermarkSettings {
  return {
    layers: [makeDefaultLayerSettings(), null],
    noiseLevel: 15,
    noiseBoost: 0,
  };
}
