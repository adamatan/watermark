import type { ImageFile, WatermarkSettings } from "../types";
import { JPEG_QUALITY } from "../constants";
import { renderWatermark } from "./renderWatermark";

function createExportCanvas(
  imageFile: ImageFile,
  settings: WatermarkSettings,
  whiteBackground: boolean
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = imageFile.width;
  canvas.height = imageFile.height;

  if (whiteBackground) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  renderWatermark(canvas, imageFile.element, settings);
  return canvas;
}

export function exportAsBlob(
  imageFile: ImageFile,
  settings: WatermarkSettings,
  format: "png" | "jpeg"
): Promise<Blob> {
  const canvas = createExportCanvas(imageFile, settings, format === "jpeg");

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export produced no blob."));
      },
      format === "jpeg" ? "image/jpeg" : "image/png",
      format === "jpeg" ? JPEG_QUALITY : undefined
    );
  });
}
