export function addNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  amplitude: number,
  boostMask?: Uint8ClampedArray,
  boostAmplitude: number = 0
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const amp =
      boostMask && boostAmplitude > 0
        ? amplitude + (boostMask[i + 3] / 255) * boostAmplitude
        : amplitude;
    if (amp <= 0) continue;
    const offset = Math.round((Math.random() - 0.5) * 2 * amp);
    data[i] = Math.min(255, Math.max(0, data[i] + offset));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + offset));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + offset));
    // alpha (i+3) unchanged
  }
  ctx.putImageData(imageData, 0, 0);
}
