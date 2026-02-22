import { useState } from "react";
import JSZip from "jszip";
import type { ImageFile, WatermarkSettings, ExportFormat } from "../types";
import { exportAsBlob } from "../lib/exportImage";
import { exportAsPdf, exportAllAsPdf } from "../lib/exportPdf";

interface DownloadBarProps {
  imageFiles: ImageFile[];
  settings: WatermarkSettings;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 200);
}

async function downloadSingle(
  imageFile: ImageFile,
  settings: WatermarkSettings,
  format: "png" | "jpeg" | "pdf"
) {
  const base = `${imageFile.name}-watermarked`;
  if (format === "pdf") {
    exportAsPdf(imageFile, settings, `${base}.pdf`);
  } else {
    const blob = await exportAsBlob(imageFile, settings, format);
    triggerDownload(blob, `${base}.${format === "jpeg" ? "jpg" : "png"}`);
  }
}

async function downloadZip(
  imageFiles: ImageFile[],
  settings: WatermarkSettings,
  format: "png" | "jpeg" | "pdf"
) {
  const zip = new JSZip();
  const ext = format === "jpeg" ? "jpg" : format;

  await Promise.all(
    imageFiles.map(async (imageFile) => {
      const filename = `${imageFile.name}-watermarked.${ext}`;
      if (format === "pdf") {
        // Render to a blob by creating a temporary canvas + jsPDF in-memory
        const blob = await exportAsBlob(imageFile, settings, "png");
        zip.file(filename.replace(".pdf", ".png"), blob);
      } else {
        const blob = await exportAsBlob(imageFile, settings, format);
        zip.file(filename, blob);
      }
    })
  );

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, `watermarked-images.zip`);
}

export function DownloadBar({ imageFiles, settings }: DownloadBarProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const multi = imageFiles.length > 1;

  async function handleDownload(format: ExportFormat) {
    if (exporting || imageFiles.length === 0) return;
    setExporting(format);
    try {
      if (multi && format !== "pdf") {
        await downloadZip(imageFiles, settings, format);
      } else if (multi && format === "pdf") {
        exportAllAsPdf(imageFiles, settings, "watermarked-images.pdf");
      } else {
        await downloadSingle(imageFiles[0], settings, format);
      }
    } catch (e) {
      console.error("Export failed:", e);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  const formats: { format: ExportFormat; label: string }[] = [
    { format: "png", label: "PNG" },
    { format: "jpeg", label: "JPG" },
    { format: "pdf", label: "PDF" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Download {multi ? `(${imageFiles.length} images)` : ""}
      </p>
      <div className="flex gap-2">
        {formats.map(({ format, label }) => {
          const isLoading = exporting === format;
          return (
            <button
              key={format}
              onClick={() => handleDownload(format)}
              disabled={exporting !== null || imageFiles.length === 0}
              className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              <span className="text-xs font-bold tracking-wide">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
