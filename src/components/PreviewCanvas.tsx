import { useEffect, useRef } from "react";
import type { ImageFile, WatermarkSettings } from "../types";
import { renderWatermark } from "../lib/renderWatermark";

interface PreviewCanvasProps {
  imageFile: ImageFile;
  settings: WatermarkSettings;
}

export function PreviewCanvas({ imageFile, settings }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderWatermark(canvas, imageFile.element, settings);
  }, [imageFile, settings]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Live Preview
      </h2>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto rounded-lg shadow"
          style={{ maxHeight: "60vh" }}
        />
      </div>
    </div>
  );
}
