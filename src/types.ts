export type FontFamily =
  | "Arial"
  | "Times New Roman"
  | "Courier New"
  | "Georgia"
  | "Verdana";

export interface WatermarkSettings {
  text: string;
  color: string;
  opacity: number;
  fontSize: number;
  rotation: number;
  spacing: number;
  fontFamily: FontFamily;
  noiseEnabled: boolean;
  borderEnabled: boolean;
}

export interface ImageFile {
  file: File;
  name: string;
  element: HTMLImageElement;
  width: number;
  height: number;
}

export type ExportFormat = "png" | "jpeg" | "pdf";
