import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";
import type { ImageFile } from "../types";
import { validateFile } from "../lib/fileValidation";
import { loadImageFile } from "../lib/imageLoader";
import { CameraModal } from "./CameraModal";

interface DropZoneProps {
  onImagesAdd: (images: ImageFile[]) => void;
  hasImages: boolean;
}

export function DropZone({ onImagesAdd, hasImages }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showError(msg: string) {
    setError(msg);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 5000);
  }

  const handleFiles = useCallback(
    async (files: File[]) => {
      const errors: string[] = [];
      const loaded: ImageFile[] = [];

      await Promise.all(
        files.map(async (file) => {
          const result = validateFile(file);
          if (!result.valid) {
            errors.push(`${file.name}: ${result.error}`);
            return;
          }
          try {
            const imageFiles = await loadImageFile(file);
            loaded.push(...imageFiles);
          } catch (e) {
            errors.push(`${file.name}: ${(e as Error).message}`);
          }
        })
      );

      if (errors.length) showError(errors.join(" · "));
      else setError(null);

      if (loaded.length) onImagesAdd(loaded);
    },
    [onImagesAdd]
  );

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }

  function onClick() {
    inputRef.current?.click();
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) handleFiles(Array.from(e.target.files));
    e.target.value = "";
  }

  const uploadBorderClass = isDragOver
    ? "border-blue-500 bg-blue-50"
    : error
      ? "border-red-400 bg-red-50"
      : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50";

  if (hasImages) {
    return (
      <div>
        <div className="flex items-center gap-4">
          <div
            onClick={onClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`flex flex-1 flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${uploadBorderClass}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">Add more images</p>
          </div>
          <span className="text-2xl text-gray-400 font-semibold shrink-0 px-4">Or</span>
          <div
            onClick={() => setShowCamera(true)}
            className="flex flex-1 flex-col items-center justify-center h-36 rounded-2xl border-2 cursor-pointer transition-colors border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">Take another photo</p>
          </div>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={onChange} />
        {showCamera && (
          <CameraModal
            onCapture={(img) => { onImagesAdd([img]); setShowCamera(false); }}
            onClose={() => setShowCamera(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        {/* Upload card */}
        <div
          onClick={onClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex flex-1 flex-col items-center justify-center h-72 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${uploadBorderClass}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 font-medium">
            <span className="hidden sm:inline">Drop or click to upload</span>
            <span className="sm:hidden">Tap to upload</span>
          </p>
          <p className="mt-1 text-sm text-gray-400 text-center px-4">JPEG, PNG, WebP, BMP, TIFF, GIF, PDF — up to 50 MB each</p>
        </div>

        <span className="text-2xl text-gray-400 font-semibold shrink-0 px-4">Or</span>

        {/* Camera card */}
        <div
          onClick={() => setShowCamera(true)}
          className="flex flex-1 flex-col items-center justify-center h-72 rounded-2xl border-2 cursor-pointer transition-colors border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-600 font-medium">Take a photo</p>
          <p className="mt-1 text-sm text-gray-400">Use your camera</p>
        </div>
      </div>

      {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={onChange} />
      {showCamera && (
        <CameraModal
          onCapture={(img) => { onImagesAdd([img]); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
