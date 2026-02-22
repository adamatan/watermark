import { jsPDF } from "jspdf";
import type { ImageFile, WatermarkSettings } from "../types";
import { renderWatermark } from "./renderWatermark";

export function exportAsPdf(
  imageFile: ImageFile,
  settings: WatermarkSettings,
  filename: string
): void {
  const canvas = document.createElement("canvas");
  // White background for PDF
  canvas.width = imageFile.width;
  canvas.height = imageFile.height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  renderWatermark(canvas, imageFile.element, settings);

  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

  const imgW = imageFile.width;
  const imgH = imageFile.height;
  const orientation = imgW >= imgH ? "landscape" : "portrait";

  const doc = new jsPDF({ orientation, unit: "mm" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Fit image within page with 10mm margin
  const margin = 10;
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2;

  const scale = Math.min(availW / imgW, availH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const offsetX = margin + (availW - drawW) / 2;
  const offsetY = margin + (availH - drawH) / 2;

  doc.addImage(dataUrl, "JPEG", offsetX, offsetY, drawW, drawH);
  doc.save(filename);
}
