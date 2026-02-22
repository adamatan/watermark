export function addNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const offset = Math.floor(Math.random() * 31) - 15; // [-15, 15]
    data[i] = Math.min(255, Math.max(0, data[i] + offset));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + offset));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + offset));
    // alpha (i+3) unchanged
  }
  ctx.putImageData(imageData, 0, 0);
}
