import type { WatermarkSettings } from "../types";
import { addNoise } from "./addNoise";

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

  // Draw the source image
  ctx.drawImage(image, 0, 0);

  if (!settings.text.trim()) {
    if (settings.noiseEnabled) addNoise(ctx, w, h);
    return;
  }

  const radians = (settings.rotation * Math.PI) / 180;

  ctx.save();
  ctx.font = `${settings.fontSize}px "${settings.fontFamily}"`;
  ctx.fillStyle = settings.color;
  ctx.globalAlpha = settings.opacity;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = settings.text.split("\n");
  const lineHeight = settings.fontSize * 1.2;
  const blockHeight = lineHeight * lines.length;
  const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));

  const cellWidth = maxLineWidth + settings.spacing;
  const cellHeight = blockHeight + settings.spacing;

  // Cover the full diagonal so every rotation angle is filled
  const diagonal = Math.sqrt(w * w + h * h);
  const startX = w / 2 - diagonal;
  const startY = h / 2 - diagonal;
  const endX = w / 2 + diagonal;
  const endY = h / 2 + diagonal;

  for (let y = startY; y < endY; y += cellHeight) {
    for (let x = startX; x < endX; x += cellWidth) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(radians);
      // Center the block vertically, then draw each line
      const blockTop = -blockHeight / 2 + lineHeight / 2;
      lines.forEach((line, i) => {
        ctx.fillText(line, 0, blockTop + i * lineHeight);
      });
      ctx.restore();
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1.0;

  if (settings.noiseEnabled) {
    addNoise(ctx, w, h);
  }
}
