export type FontFamily =
  | "Arial"
  | "Times New Roman"
  | "Courier New"
  | "Georgia"
  | "Verdana";

export interface LayerSettings {
  text: string;
  color: string;
  opacity: number;
  fontSize: number;
  rotation: number;
  spacing: number;
  offsetX: number;
  offsetY: number;
  fontFamily: FontFamily;
  borderEnabled: boolean;
}

export interface WatermarkSettings {
  layers: [LayerSettings, LayerSettings | null];
  noiseLevel: number;
  noiseBoost: number;
}

export interface ImageFile {
  file: File;
  name: string;
  element: HTMLImageElement;
  width: number;
  height: number;
}

export type ExportFormat = "png" | "jpeg" | "pdf";
