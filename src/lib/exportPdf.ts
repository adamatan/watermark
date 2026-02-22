import { jsPDF } from "jspdf";
import type { ImageFile, WatermarkSettings } from "../types";
import { renderWatermark } from "./renderWatermark";

function renderImageToDataUrl(imageFile: ImageFile, settings: WatermarkSettings): string {
  const canvas = document.createElement("canvas");
  canvas.width = imageFile.width;
  canvas.height = imageFile.height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  renderWatermark(canvas, imageFile.element, settings);
  return canvas.toDataURL("image/jpeg", 0.92);
}

function addImageToDoc(doc: jsPDF, dataUrl: string, imgW: number, imgH: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 10;
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2;
  const scale = Math.min(availW / imgW, availH / imgH);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const offsetX = margin + (availW - drawW) / 2;
  const offsetY = margin + (availH - drawH) / 2;
  doc.addImage(dataUrl, "JPEG", offsetX, offsetY, drawW, drawH);
}

export function exportAsPdf(
  imageFile: ImageFile,
  settings: WatermarkSettings,
  filename: string
): void {
  const dataUrl = renderImageToDataUrl(imageFile, settings);
  const imgW = imageFile.width;
  const imgH = imageFile.height;
  const orientation = imgW >= imgH ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "mm" });
  addImageToDoc(doc, dataUrl, imgW, imgH);
  doc.save(filename);
}

export function exportAllAsPdf(
  imageFiles: ImageFile[],
  settings: WatermarkSettings,
  filename: string
): void {
  const first = imageFiles[0];
  const firstOrientation = first.width >= first.height ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation: firstOrientation, unit: "mm" });

  imageFiles.forEach((imageFile, index) => {
    if (index > 0) {
      const orientation = imageFile.width >= imageFile.height ? "landscape" : "portrait";
      doc.addPage("a4", orientation);
    }
    const dataUrl = renderImageToDataUrl(imageFile, settings);
    addImageToDoc(doc, dataUrl, imageFile.width, imageFile.height);
  });

  doc.save(filename);
}
