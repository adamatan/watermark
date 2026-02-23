import type { LayerSettings, WatermarkSettings } from "../types";
import { addNoise } from "./addNoise";

function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: LayerSettings,
  w: number,
  h: number
): void {
  if (!layer.text.trim()) return;

  const radians = (layer.rotation * Math.PI) / 180;

  ctx.save();
  ctx.font = `${layer.fontSize}px "${layer.fontFamily}"`;
  ctx.fillStyle = layer.color;
  ctx.globalAlpha = layer.opacity;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = layer.text.split("\n");
  const lineHeight = layer.fontSize * 1.2;
  const blockHeight = lineHeight * lines.length;
  const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));

  const cellWidth = maxLineWidth + layer.spacing;
  const cellHeight = blockHeight + layer.spacing;

  const diagonal = Math.sqrt(w * w + h * h);
  const startX = w / 2 - diagonal + layer.offsetX;
  const startY = h / 2 - diagonal + layer.offsetY;
  const endX = w / 2 + diagonal + layer.offsetX;
  const endY = h / 2 + diagonal + layer.offsetY;

  for (let y = startY; y < endY; y += cellHeight) {
    for (let x = startX; x < endX; x += cellWidth) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(radians);
      const blockTop = -blockHeight / 2 + lineHeight / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, blockTop + i * lineHeight);
      });
      if (layer.borderEnabled) {
        const pad = 8;
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = layer.fontSize * 0.08;
        ctx.strokeRect(
          -maxLineWidth / 2 - pad,
          -blockHeight / 2 - pad,
          maxLineWidth + pad * 2,
          blockHeight + pad * 2
        );
      }
      ctx.restore();
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1.0;
}

function drawLayerOnOffscreen(
  offCtx: CanvasRenderingContext2D,
  layer: LayerSettings,
  w: number,
  h: number
): void {
  if (!layer.text.trim()) return;

  const radians = (layer.rotation * Math.PI) / 180;
  const lines = layer.text.split("\n");
  const lineHeight = layer.fontSize * 1.2;
  const blockHeight = lineHeight * lines.length;

  offCtx.font = `${layer.fontSize}px "${layer.fontFamily}"`;
  offCtx.fillStyle = "#000";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";

  const maxLineWidth = Math.max(...lines.map((l) => offCtx.measureText(l).width));
  const cellWidth = maxLineWidth + layer.spacing;
  const cellHeight = blockHeight + layer.spacing;

  const diagonal = Math.sqrt(w * w + h * h);
  const startX = w / 2 - diagonal + layer.offsetX;
  const startY = h / 2 - diagonal + layer.offsetY;
  const endX = w / 2 + diagonal + layer.offsetX;
  const endY = h / 2 + diagonal + layer.offsetY;

  for (let y = startY; y < endY; y += cellHeight) {
    for (let x = startX; x < endX; x += cellWidth) {
      offCtx.save();
      offCtx.translate(x, y);
      offCtx.rotate(radians);
      const blockTop = -blockHeight / 2 + lineHeight / 2;
      lines.forEach((line, i) => {
        offCtx.fillText(line, 0, blockTop + i * lineHeight);
      });
      offCtx.restore();
    }
  }
}

export function renderWatermark(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  settings: WatermarkSettings
): void {
  const w = image.naturalWidth;
  const h = image.naturalHeight;

  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(image, 0, 0);

  const activeLayers = settings.layers.filter((l): l is LayerSettings => l !== null);

  for (const layer of activeLayers) {
    drawLayer(ctx, layer, w, h);
  }

  if (settings.noiseLevel > 0 || settings.noiseBoost > 0) {
    let boostMask: Uint8ClampedArray | undefined;

    if (settings.noiseBoost > 0) {
      const offscreen = document.createElement("canvas");
      offscreen.width = w;
      offscreen.height = h;
      const offCtx = offscreen.getContext("2d")!;

      for (const layer of activeLayers) {
        drawLayerOnOffscreen(offCtx, layer, w, h);
      }

      const maxFontSize = Math.max(...activeLayers.map((l) => l.fontSize), 36);
      const blurCanvas = document.createElement("canvas");
      blurCanvas.width = w;
      blurCanvas.height = h;
      const blurCtx = blurCanvas.getContext("2d")!;
      blurCtx.filter = `blur(${maxFontSize}px)`;
      blurCtx.drawImage(offscreen, 0, 0);
      boostMask = blurCtx.getImageData(0, 0, w, h).data;
    }

    addNoise(ctx, w, h, settings.noiseLevel, boostMask, settings.noiseBoost);
  }
}
