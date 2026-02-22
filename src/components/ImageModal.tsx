import { useEffect, useRef, useState } from "react";
import type { ImageFile, WatermarkSettings } from "../types";
import { renderWatermark } from "../lib/renderWatermark";

const LOUPE_SIZE = 180;
const ZOOM = 4;
const SRC_SIZE = LOUPE_SIZE / ZOOM;
const GAP = 12; // px between cursor and loupe edge

interface ImageModalProps {
  imageFile: ImageFile;
  settings: WatermarkSettings;
  onClose: () => void;
}

export function ImageModal({ imageFile, settings, onClose }: ImageModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
  const [loupe, setLoupe] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderWatermark(canvas, imageFile.element, settings);
  }, [imageFile, settings]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const loupeCvs = loupeRef.current;
    if (!canvas || !loupeCvs) return;

    const rect = canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;

    // Map CSS coords → canvas pixel coords
    const cx = (cssX / rect.width) * canvas.width;
    const cy = (cssY / rect.height) * canvas.height;

    // Draw magnified region
    const lCtx = loupeCvs.getContext("2d");
    if (!lCtx) return;
    lCtx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
    lCtx.drawImage(
      canvas,
      cx - SRC_SIZE / 2, cy - SRC_SIZE / 2, SRC_SIZE, SRC_SIZE,
      0, 0, LOUPE_SIZE, LOUPE_SIZE
    );

    // Follow cursor; flip to the other side if near a viewport edge
    let x = e.clientX + GAP;
    let y = e.clientY + GAP;
    if (x + LOUPE_SIZE > window.innerWidth)  x = e.clientX - GAP - LOUPE_SIZE;
    if (y + LOUPE_SIZE > window.innerHeight) y = e.clientY - GAP - LOUPE_SIZE;

    setLoupe((prev) => (prev.visible && prev.x === x && prev.y === y ? prev : { visible: true, x, y }));
  }

  function handleMouseLeave() {
    setLoupe((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-full max-h-full flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/80 truncate">{imageFile.name}</span>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-white/60 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto rounded-lg shadow-2xl"
          style={{ maxHeight: "85vh" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Loupe — fixed to viewport so it truly follows the cursor */}
      <canvas
        ref={loupeRef}
        width={LOUPE_SIZE}
        height={LOUPE_SIZE}
        className="fixed rounded-lg border-2 border-white shadow-lg pointer-events-none transition-opacity duration-100"
        style={{
          width: LOUPE_SIZE,
          height: LOUPE_SIZE,
          left: loupe.x,
          top: loupe.y,
          opacity: loupe.visible ? 1 : 0,
        }}
      />
    </div>
  );
}
