import { useRef, useState, useCallback, DragEvent, ChangeEvent } from "react";
import type { ImageFile } from "../types";
import { validateFile } from "../lib/fileValidation";

interface DropZoneProps {
  onImagesAdd: (images: ImageFile[]) => void;
  hasImages: boolean;
}

function loadImageFile(file: File): Promise<ImageFile> {
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

export function DropZone({ onImagesAdd, hasImages }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
            const imageFile = await loadImageFile(file);
            loaded.push(imageFile);
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

  const borderClass = isDragOver
    ? "border-blue-500 bg-blue-50"
    : error
      ? "border-red-400 bg-red-50"
      : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50";

  if (hasImages) {
    return (
      <div>
        <div
          onClick={onClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-sm text-gray-500 ${borderClass}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Drop more images
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onChange} />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onClick={onClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${borderClass}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 font-medium">
          Drop images here{" "}
          <span className="hidden sm:inline">or click to upload</span>
          <span className="sm:hidden">or tap to upload</span>
        </p>
        <p className="mt-1 text-sm text-gray-400">JPEG, PNG, WebP, BMP, TIFF, GIF — up to 50 MB each</p>
      </div>
      {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onChange} />
    </div>
  );
}
