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
    noiseEnabled: true,
  };
}

export const DEBOUNCE_MS = 150;
export const JPEG_QUALITY = 0.92;

export type PresetName = "Blue" | "Green" | "Red" | "Subtle";

type PresetOverrides = Omit<WatermarkSettings, "text" | "noiseEnabled">;

export const PRESETS: Record<PresetName, PresetOverrides> = {
  Blue: {
    color: "#1714CC",
    opacity: 0.5,
    fontSize: 36,
    rotation: 26,
    spacing: 100,
    fontFamily: "Arial",
  },
  Green: {
    color: "#16A34A",
    opacity: 0.5,
    fontSize: 36,
    rotation: 26,
    spacing: 100,
    fontFamily: "Arial",
  },
  Red: {
    color: "#DC2626",
    opacity: 0.5,
    fontSize: 36,
    rotation: 26,
    spacing: 100,
    fontFamily: "Arial",
  },
  Subtle: {
    color: "#6B7280",
    opacity: 0.18,
    fontSize: 28,
    rotation: 26,
    spacing: 130,
    fontFamily: "Arial",
  },
};
