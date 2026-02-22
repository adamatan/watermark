import type { ImageFile, WatermarkSettings } from "../types";
import { PreviewCanvas } from "./PreviewCanvas";

interface ImageCardProps {
  imageFile: ImageFile;
  settings: WatermarkSettings;
  onRemove: () => void;
}

export function ImageCard({ imageFile, settings, onRemove }: ImageCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      {/* Filename + remove */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <span className="text-xs text-gray-500 truncate">{imageFile.name}</span>
        <button
          onClick={onRemove}
          title="Remove"
          className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Preview */}
      <div className="p-3 flex-1">
        <PreviewCanvas imageFile={imageFile} settings={settings} />
      </div>
    </div>
  );
}
