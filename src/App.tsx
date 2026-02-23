import { useState, useEffect } from "react";
import type { ImageFile } from "./types";
import { useWatermarkSettings } from "./hooks/useWatermarkSettings";
import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { DEBOUNCE_MS } from "./constants";
import { DropZone } from "./components/DropZone";
import { SettingsPanel } from "./components/SettingsPanel";
import { ImageCard } from "./components/ImageCard";
import { DownloadBar } from "./components/DownloadBar";
import { Footer } from "./components/Footer";

function loadImageFromUrl(url: string, name: string): Promise<ImageFile> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({
        file: new File([], name),
        name: name.replace(/\.[^.]+$/, ""),
        element: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    img.onerror = reject;
    img.src = url;
  });
}

export default function App() {
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const { settings, updateLayerSettings, updateGlobalSettings, enableLayer2, disableLayer2, applyDoublePreset } = useWatermarkSettings();
  const debouncedSettings = useDebouncedValue(settings, DEBOUNCE_MS);

  useEffect(() => {
    loadImageFromUrl(`${import.meta.env.BASE_URL}sample.png`, "sample.png")
      .then((img) => setImageFiles([img]))
      .catch(() => {});
  }, []);

  function addImages(newImages: ImageFile[]) {
    setImageFiles((prev) => {
      // Remove sample images (file.size === 0) when the user uploads real files
      const withoutSamples = prev.filter((img) => img.file.size > 0);
      // Deduplicate by name
      const existingNames = new Set(withoutSamples.map((img) => img.name));
      const uniqueNew = newImages.filter((img) => !existingNames.has(img.name));
      return [...uniqueNew, ...withoutSamples];
    });
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }

  const hasImages = imageFiles.length > 0;
  // Only count user-uploaded files; the sample (file.size === 0) doesn't trigger compact mode
  const hasRealImages = imageFiles.some((img) => img.file.size > 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 21h16M4 17h12v4H4zM7 17v-3a3 3 0 0 1 6 0v3" />
            <path fill="currentColor" stroke="none" d="M20 4s-2.5 3.5-2.5 5.5a2.5 2.5 0 0 0 5 0C22.5 7.5 20 4 20 4z" />
          </svg>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">Watermark</h1>
            <p className="text-xs text-gray-500">Private, client-side image watermarking</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-6">

          {/* Full-width drop zone */}
          <DropZone onImagesAdd={addImages} hasImages={hasRealImages} />

          {/* Two-column layout: controls + image grid */}
          {hasImages && (
            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* Left column — controls */}
              <div className="w-full lg:w-80 flex-shrink-0 space-y-4">

                <DownloadBar imageFiles={imageFiles} settings={settings} />

                <SettingsPanel
                  settings={settings}
                  onLayerChange={updateLayerSettings}
                  onGlobalChange={updateGlobalSettings}
                  onEnableLayer2={enableLayer2}
                  onDisableLayer2={disableLayer2}
                  onApplyDoublePreset={applyDoublePreset}
                />
              </div>

              {/* Right column — image grid */}
              <div className="flex-1 min-w-0">
                <div
                  className="grid gap-6"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))" }}
                >
                  {imageFiles.map((imageFile, index) => (
                    <ImageCard
                      key={`${imageFile.name}-${index}`}
                      imageFile={imageFile}
                      settings={debouncedSettings}
                      onRemove={() => removeImage(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
