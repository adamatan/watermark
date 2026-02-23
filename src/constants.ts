import type { FontFamily, WatermarkSettings } from "./types";

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/gif",
] as const;

export const FONT_FAMILIES: FontFamily[] = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function makeDefaultSettings(): WatermarkSettings {
  return {
    text: `Watermarked\n${todayISO()}`,
    color: "#1714CC",
    opacity: 0.5,
    fontSize: 36,
    rotation: 26,
    spacing: 100,
    fontFamily: "Arial",
    noiseLevel: 15,
    noiseBoost: 0,
    borderEnabled: false,
  };
}

export const DEBOUNCE_MS = 150;
export const JPEG_QUALITY = 0.92;

export type PresetName = "Default" | "Bold" | "Subtle" | "Stamp";

type PresetOverrides = Omit<WatermarkSettings, "text">;

export const PRESETS: Record<PresetName, PresetOverrides> = {
  Default: {
    color: "#1714CC",
    opacity: 0.5,
    fontSize: 36,
    rotation: 26,
    spacing: 100,
    fontFamily: "Arial",
    noiseLevel: 15,
    noiseBoost: 0,
    borderEnabled: false,
  },
  Bold: {
    color: "#DC2626",
    opacity: 0.5,
    fontSize: 50,
    rotation: 26,
    spacing: 50,
    fontFamily: "Arial",
    noiseLevel: 60,
    noiseBoost: 60,
    borderEnabled: false,
  },
  Subtle: {
    color: "#1714CC",
    opacity: 0.20,
    fontSize: 36,
    rotation: 26,
    spacing: 60,
    fontFamily: "Arial",
    noiseLevel: 0,
    noiseBoost: 20,
    borderEnabled: false,
  },
  Stamp: {
    color: "#DC2626",
    opacity: 0.5,
    fontSize: 50,
    rotation: 26,
    spacing: 50,
    fontFamily: "Arial",
    noiseLevel: 15,
    noiseBoost: 40,
    borderEnabled: true,
  },
};
