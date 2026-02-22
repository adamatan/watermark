import { jsPDF } from "jspdf";
import type { ImageFile, WatermarkSettings } from "../types";
import { renderWatermark } from "./renderWatermark";

function renderToDataUrl(
  imageFile: ImageFile,
  settings: WatermarkSettings
): { dataUrl: string; width: number; height: number } {
  // Render watermark to a temporary canvas
  const tempCanvas = document.createElement("canvas");
  renderWatermark(tempCanvas, imageFile.element, settings);

  // Composite onto a white background canvas (handles PNG transparency)
  const canvas = document.createElement("canvas");
  canvas.width = tempCanvas.width;
  canvas.height = tempCanvas.height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.92),
    width: canvas.width,
    height: canvas.height,
  };
}

function addImagePage(
  doc: jsPDF,
  dataUrl: string,
  imgW: number,
  imgH: number
): void {
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
}

export function exportAsPdf(
  imageFile: ImageFile,
  settings: WatermarkSettings,
  filename: string
): void {
  const { dataUrl, width, height } = renderToDataUrl(imageFile, settings);
  const orientation = width >= height ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "mm" });
  addImagePage(doc, dataUrl, width, height);
  doc.save(filename);
}

export function exportAllAsPdf(
  imageFiles: ImageFile[],
  settings: WatermarkSettings,
  filename: string
): void {
  let doc: jsPDF | null = null;

  for (const imageFile of imageFiles) {
    const { dataUrl, width, height } = renderToDataUrl(imageFile, settings);
    const orientation = width >= height ? "landscape" : "portrait";

    if (!doc) {
      doc = new jsPDF({ orientation, unit: "mm" });
    } else {
      doc.addPage("a4", orientation);
    }

    addImagePage(doc, dataUrl, width, height);
  }

  if (doc) doc.save(filename);
}
