import * as UTIF from "utif2";
import type { ImageFile } from "../types";

function isTiff(file: File): boolean {
  return file.type === "image/tiff";
}

function decodeTiff(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buf = reader.result as ArrayBuffer;
        const ifds = UTIF.decode(buf);
        if (ifds.length === 0) {
          reject(new Error("TIFF file contains no images."));
          return;
        }
        UTIF.decodeImage(buf, ifds[0]);
        const rgba = UTIF.toRGBA8(ifds[0]);
        const { width, height } = ifds[0];

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not create canvas context."));
          return;
        }
        const clamped = new Uint8ClampedArray(width * height * 4);
        clamped.set(rgba);
        const imageData = new ImageData(clamped, width, height);
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        reject(new Error("Could not decode TIFF image. The file may be corrupted."));
      }
    };
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsArrayBuffer(file);
  });
}

function loadFromUrl(file: File, url: string): Promise<ImageFile> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        file,
        name: file.name.replace(/\.[^.]+$/, ""),
        element: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image. The file may be corrupted."));
    };
    img.src = url;
  });
}

export async function loadImageFile(file: File): Promise<ImageFile> {
  if (isTiff(file)) {
    const dataUrl = await decodeTiff(file);
    return loadFromUrl(file, dataUrl);
  }
  const url = URL.createObjectURL(file);
  return loadFromUrl(file, url);
}
