import type { ImageFile } from "../types";

export function loadImageFile(file: File): Promise<ImageFile> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
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
