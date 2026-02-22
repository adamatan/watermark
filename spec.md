# Watermark FE - Technical Specification

## 1. Project Structure

```
watermark-fe/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component, layout shell
│   ├── index.css                 # Tailwind directives + base styles
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── constants.ts              # Default values, limits, font list
│   ├── components/
│   │   ├── DropZone.tsx          # Image upload via drag-and-drop / click
│   │   ├── SettingsPanel.tsx     # All watermark configuration controls
│   │   ├── PreviewCanvas.tsx     # Live watermarked image preview
│   │   ├── DownloadBar.tsx       # PNG / JPEG / PDF download buttons
│   │   └── Footer.tsx            # Privacy notice + open source link
│   ├── hooks/
│   │   ├── useWatermarkSettings.ts  # State management for all settings
│   │   └── useDebouncedValue.ts     # Generic debounce hook
│   └── lib/
│       ├── renderWatermark.ts    # Core canvas rendering logic
│       ├── exportImage.ts        # PNG / JPEG blob generation
│       ├── exportPdf.ts          # PDF generation via jsPDF
│       ├── addNoise.ts           # Anti-removal noise overlay
│       └── fileValidation.ts     # File type + size checks
├── PRD.md
└── spec.md
```

## 2. Dependencies

```jsonc
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "jspdf": "^2.5"           // PDF export, no external calls
  },
  "devDependencies": {
    "typescript": "^5.4",
    "vite": "^5.4",
    "@vitejs/plugin-react": "^4.3",
    "tailwindcss": "^3.4",
    "postcss": "^8.4",
    "autoprefixer": "^10.4",
    "@types/react": "^18.3",
    "@types/react-dom": "^18.3"
  }
}
```

No other runtime dependencies. The app must not fetch anything at runtime (no Google Fonts, no CDN scripts, no analytics).

## 3. Type Definitions (`src/types.ts`)

```typescript
export interface WatermarkSettings {
  text: string;             // Watermark text, default: "Watermarked <YYYY-MM-DD>"
  color: string;            // Hex color, default: "#000000"
  opacity: number;          // 0.05 - 1.0, default: 0.3
  fontSize: number;         // 12 - 200 (px), default: 48
  rotation: number;         // -90 to 90 (degrees), default: -45
  spacing: number;          // 50 - 500 (px), default: 200
  fontFamily: FontFamily;   // System font enum, default: "Arial"
  noiseEnabled: boolean;    // Anti-removal noise, default: false
}

export type FontFamily =
  | "Arial"
  | "Times New Roman"
  | "Courier New"
  | "Georgia"
  | "Verdana";

export interface ImageFile {
  file: File;               // Original File object
  name: string;             // Original filename without extension
  element: HTMLImageElement; // Decoded image element (for canvas drawing)
  width: number;            // Natural width in px
  height: number;           // Natural height in px
}

export type ExportFormat = "png" | "jpeg" | "pdf";
```

## 4. Constants (`src/constants.ts`)

```typescript
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/gif",
] as const;

export const FONT_FAMILIES: FontFamily[] = [
  "Arial",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
];

export const DEFAULT_SETTINGS: WatermarkSettings = {
  text: `Watermarked ${new Date().toISOString().slice(0, 10)}`,
  color: "#000000",
  opacity: 0.3,
  fontSize: 48,
  rotation: -45,
  spacing: 200,
  fontFamily: "Arial",
  noiseEnabled: false,
};

export const DEBOUNCE_MS = 150;
export const JPEG_QUALITY = 0.92;
```

## 5. Component Specifications

### 5.1 `App.tsx` — Root Component

**Responsibility**: Owns top-level state, composes all child components.

**State**:
- `imageFile: ImageFile | null` — The uploaded image (null = show drop zone).
- `settings: WatermarkSettings` — Current watermark settings (via `useWatermarkSettings` hook).

**Layout logic**:
- When `imageFile` is null: render `DropZone` full-width.
- When `imageFile` is set: render `DropZone` (collapsed, allows replacing image), `SettingsPanel`, `PreviewCanvas`, `DownloadBar`.
- `Footer` always renders at the bottom.

**Data flow** (top-down):
```
App
 ├─ DropZone        ← receives onImageLoad callback
 ├─ SettingsPanel    ← receives settings + onChange handlers
 ├─ PreviewCanvas    ← receives imageFile + debouncedSettings (read-only)
 ├─ DownloadBar      ← receives imageFile + settings
 └─ Footer
```

### 5.2 `DropZone.tsx`

**Props**:
```typescript
interface DropZoneProps {
  onImageLoad: (image: ImageFile) => void;
  hasImage: boolean; // true = collapsed mode
}
```

**Behavior**:
- Renders a `<div>` with `onDragOver`, `onDragLeave`, `onDrop` handlers.
- Contains a hidden `<input type="file" accept="image/*">` triggered on click.
- On file received (drop or select):
  1. Call `validateFile(file)` from `lib/fileValidation.ts`.
  2. If invalid: display inline error message (red text, auto-dismiss after 5s).
  3. If valid: create `HTMLImageElement`, load file via `URL.createObjectURL`, wait for `onload`, then call `onImageLoad` with the `ImageFile` object.
- **Collapsed mode** (`hasImage=true`): Renders as a smaller bar with text "Drop a new image or click to replace" instead of the full drop zone.

**Visual states**:
- Default: dashed border, muted text.
- Drag-over: highlighted border (blue), background tint.
- Error: red border, error message.

### 5.3 `SettingsPanel.tsx`

**Props**:
```typescript
interface SettingsPanelProps {
  settings: WatermarkSettings;
  onChange: (patch: Partial<WatermarkSettings>) => void;
}
```

**Controls** (each calls `onChange` with a single-key patch):

| Control | Element | Notes |
|---------|---------|-------|
| Text | `<input type="text">` | `onChange({text: value})` |
| Color | `<input type="color">` | Native color picker, no library needed |
| Opacity | `<input type="range">` | Display percentage label: `Math.round(value * 100) + "%"` |
| Font size | `<input type="range">` | Display px label |
| Rotation | `<input type="range">` | Display degree label with `°` suffix |
| Spacing | `<input type="range">` | Display px label |
| Font family | `<select>` | Options from `FONT_FAMILIES` |
| Noise | `<input type="checkbox">` | Toggle, label changes to "On"/"Off" |

**Layout**: CSS grid, 2 columns on desktop (label+control per row), stacks to 1 column below 640px.

**Visibility**: This entire component is hidden when no image is loaded.

### 5.4 `PreviewCanvas.tsx`

**Props**:
```typescript
interface PreviewCanvasProps {
  imageFile: ImageFile;
  settings: WatermarkSettings; // Already debounced by parent
}
```

**Behavior**:
- Manages an internal `<canvas>` element via `useRef`.
- On every props change, calls `renderWatermark()` to repaint the canvas.
- The canvas is rendered at the image's **natural resolution** but displayed with CSS `max-width: 100%; height: auto` so it scales to fit the viewport.
- The same canvas ref is used by `DownloadBar` for export (passed up via a ref forwarded from `App`, or via a render callback — see section 6).

**Rendering trigger**:
- `useEffect` that depends on `[imageFile, settings]`.
- The `settings` prop should be the debounced version (debounced in `App.tsx` using `useDebouncedValue`).

### 5.5 `DownloadBar.tsx`

**Props**:
```typescript
interface DownloadBarProps {
  imageFile: ImageFile;
  settings: WatermarkSettings; // Non-debounced, final values
  canvasRef: React.RefObject<HTMLCanvasElement>;
}
```

**Behavior**:
- Three buttons: "Download PNG", "Download JPEG", "Download PDF".
- On click, each button:
  1. Renders a fresh full-resolution watermark to an offscreen canvas (do NOT reuse the preview canvas — it may be mid-debounce).
  2. Calls the appropriate export function.
  3. Creates a temporary `<a>` element with `href=blobURL`, `download=filename`, clicks it, then revokes the blob URL.
- Buttons are disabled while an export is in progress (show a brief "Exporting..." state).

**Filename pattern**: `<original-name>-watermarked.<ext>`
- Example: `passport-watermarked.png`

### 5.6 `Footer.tsx`

**Props**: None.

Renders a `<footer>` with:
- Text: "Your images never leave your browser. All processing happens locally on your device."
- Link: "View source on GitHub" (href configurable via an env var or hardcoded once the repo exists).

## 6. Canvas Ref Strategy

The preview canvas and the download export both need access to canvas rendering. Two canvases are used:

1. **Preview canvas** — lives inside `PreviewCanvas`, rendered at natural resolution, displayed scaled via CSS. Repaints on debounced settings changes.
2. **Export canvas** — created on-demand in `DownloadBar` click handlers as an offscreen `document.createElement("canvas")`. Rendered once at full resolution with final (non-debounced) settings, used for export, then discarded.

This avoids race conditions between debounced preview updates and export.

## 7. Core Library Modules

### 7.1 `lib/renderWatermark.ts`

```typescript
export function renderWatermark(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  settings: WatermarkSettings
): void;
```

**Algorithm**:

1. Set canvas dimensions to `image.naturalWidth` x `image.naturalHeight`.
2. Draw the source image at (0, 0).
3. Configure text rendering:
   - `ctx.font = "${settings.fontSize}px ${settings.fontFamily}"`
   - `ctx.fillStyle = settings.color`
   - `ctx.globalAlpha = settings.opacity`
   - `ctx.textAlign = "center"`
   - `ctx.textBaseline = "middle"`
4. Calculate grid coverage:
   - Measure text width via `ctx.measureText(settings.text).width`.
   - Compute the diagonal length of the canvas: `diagonal = Math.sqrt(w² + h²)`.
   - The grid must cover a square of side `diagonal` centered on the canvas, to ensure full coverage at any rotation angle.
5. For each grid cell in the coverage area:
   - `ctx.save()`
   - Translate to cell center.
   - Rotate by `settings.rotation` degrees (convert to radians).
   - Draw `ctx.fillText(settings.text, 0, 0)`.
   - `ctx.restore()`
6. If `settings.noiseEnabled`, call `addNoise(ctx, w, h)`.
7. Reset `ctx.globalAlpha = 1.0`.

**Grid iteration detail**:
```
const radians = (settings.rotation * Math.PI) / 180;
const textWidth = ctx.measureText(settings.text).width;
const cellWidth = textWidth + settings.spacing;
const cellHeight = settings.fontSize + settings.spacing;
const diagonal = Math.sqrt(w * w + h * h);
const startX = w / 2 - diagonal;
const startY = h / 2 - diagonal;
const endX = w / 2 + diagonal;
const endY = h / 2 + diagonal;

for (let y = startY; y < endY; y += cellHeight) {
  for (let x = startX; x < endX; x += cellWidth) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(radians);
    ctx.fillText(settings.text, 0, 0);
    ctx.restore();
  }
}
```

### 7.2 `lib/addNoise.ts`

```typescript
export function addNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void;
```

**Algorithm**:
1. Get the current canvas pixel data via `ctx.getImageData(0, 0, width, height)`.
2. Iterate over every pixel. For each pixel:
   - Generate a random offset in range [-15, +15].
   - Add the offset to R, G, B channels (clamped to 0-255).
   - Leave alpha unchanged.
3. Put the modified image data back via `ctx.putImageData()`.

**Performance note**: This is O(width × height) and will be slow on large images. For v1 this is acceptable. A future optimization could sample every Nth pixel or use a Web Worker.

### 7.3 `lib/exportImage.ts`

```typescript
export function exportAsBlob(
  canvas: HTMLCanvasElement,
  format: "png" | "jpeg"
): Promise<Blob>;
```

**Implementation**:
- Uses `canvas.toBlob()` wrapped in a Promise.
- For JPEG: passes `{ type: "image/jpeg", quality: JPEG_QUALITY }`.
- For PNG: passes `{ type: "image/png" }`.
- For JPEG export: if the source image has transparency, the canvas must first composite onto a white background. This is handled by drawing a white rect before drawing the image in `renderWatermark` when called for JPEG export, OR by rendering to a separate canvas with white background. Recommended approach: the export function creates its own canvas, fills white, draws the watermarked canvas onto it, then exports.

### 7.4 `lib/exportPdf.ts`

```typescript
export function exportAsPdf(
  canvas: HTMLCanvasElement,
  filename: string
): void;
```

**Implementation**:
1. Get a PNG data URL from the canvas via `canvas.toDataURL("image/png")`.
2. Determine page orientation: landscape if `width > height`, portrait otherwise.
3. Create a new `jsPDF` instance with the determined orientation.
4. Calculate scaling to fit the image within the PDF page dimensions with margins.
5. Add the image via `doc.addImage(dataUrl, "PNG", x, y, scaledWidth, scaledHeight)`.
6. Save via `doc.save(filename)`.

### 7.5 `lib/fileValidation.ts`

```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): ValidationResult;
```

**Checks** (in order):
1. `file.size > MAX_FILE_SIZE_BYTES` → `{ valid: false, error: "File exceeds 50 MB limit." }`
2. `!ACCEPTED_MIME_TYPES.includes(file.type)` → `{ valid: false, error: "Unsupported file format. Please upload a JPEG, PNG, WebP, BMP, TIFF, or GIF." }`
3. Otherwise → `{ valid: true }`

## 8. Hooks

### 8.1 `hooks/useWatermarkSettings.ts`

```typescript
export function useWatermarkSettings(): {
  settings: WatermarkSettings;
  updateSettings: (patch: Partial<WatermarkSettings>) => void;
  resetSettings: () => void;
};
```

- Initializes from `DEFAULT_SETTINGS`.
- `updateSettings` merges the patch into current state via `setState(prev => ({...prev, ...patch}))`.
- `resetSettings` resets to `DEFAULT_SETTINGS` (recalculating the date).

### 8.2 `hooks/useDebouncedValue.ts`

```typescript
export function useDebouncedValue<T>(value: T, delayMs: number): T;
```

- Standard debounce hook using `useEffect` + `setTimeout`.
- Returns the debounced value.
- Used in `App.tsx`: `const debouncedSettings = useDebouncedValue(settings, DEBOUNCE_MS)`.

## 9. Data Flow Diagram

```
User Action          State Change              Render Effect
───────────          ────────────              ─────────────
Drop image    →  imageFile = ImageFile     →  Show settings, preview, download bar
                                              Preview canvas renders watermark

Change setting →  settings = {...patch}    →  debouncedSettings updates after 150ms
                                              Preview canvas re-renders

Click Download →  (no state change)        →  Create offscreen canvas
                                              Render at full resolution
                                              Generate blob → trigger download
                                              Revoke blob URL

Drop new image →  imageFile = new ImageFile → Preview re-renders with new image
                  settings unchanged           (settings persist across images)
```

## 10. Error Handling

| Scenario | Handling |
|----------|----------|
| File too large (>50 MB) | Inline error in DropZone, auto-dismiss after 5s. Image not loaded. |
| Unsupported format | Inline error in DropZone, auto-dismiss after 5s. Image not loaded. |
| Image fails to decode | Inline error: "Could not load image. The file may be corrupted." |
| Canvas export fails | Alert or inline error on download button. Log to console. |
| Empty watermark text | Allow it — renders no watermark (user's choice). |

No global error boundary needed for v1. Console errors are acceptable for unexpected edge cases.

## 11. Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| >= 1024px (desktop) | Settings in 2-column grid. Preview and download side by side possible. |
| 640px - 1023px (tablet) | Settings in 2-column grid. Full-width preview. |
| < 640px (mobile) | Settings stack to 1 column. Download buttons stack vertically. DropZone shows "Tap to upload" instead of drag text. |

Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) — no custom media queries.

## 12. Build & Deployment

### Build

```bash
npm install
npm run build     # → dist/
```

Vite produces a static `dist/` folder with:
- `index.html`
- `assets/*.js` (single chunk, all deps bundled)
- `assets/*.css` (Tailwind, purged)

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
  },
});
```

### Deployment

Static hosting only. No server required. Compatible with:
- GitHub Pages
- Netlify (drop `dist/` folder)
- Any static file server

### CSP Recommendation

Since the app must not make external calls, the hosting platform should set:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'
```

`blob:` and `data:` are required for canvas export and image preview via `createObjectURL`.

## 13. Testing Strategy

### Unit Tests (recommended for v1)

| Module | Test Cases |
|--------|-----------|
| `fileValidation.ts` | Accepts valid types, rejects oversized files, rejects invalid MIME types |
| `renderWatermark.ts` | Canvas has correct dimensions, text is drawn (mock `fillText` call count), rotation is applied |
| `exportImage.ts` | Returns Blob of correct MIME type, JPEG has white background |
| `useDebouncedValue` | Value updates after delay, resets on rapid changes |

### Manual Testing Checklist

- [ ] Drag and drop works (Chrome, Firefox, Safari)
- [ ] Click to upload works
- [ ] File validation shows errors for >50 MB and unsupported types
- [ ] All 8 settings update the live preview
- [ ] PNG download produces correct file at original resolution
- [ ] JPEG download produces correct file, no transparency
- [ ] PDF download opens correctly, image fills page
- [ ] Noise toggle visibly adds noise to the image
- [ ] Replacing an image preserves current settings
- [ ] Mobile layout stacks correctly at narrow viewports
- [ ] No network requests are made (DevTools Network tab is empty after initial load)

## 14. Security Considerations

- **No server communication**: Enforce via CSP. Verify in testing via DevTools.
- **No `eval()` or dynamic script loading**: Vite's build output does not use `eval` in production mode.
- **Blob URL lifecycle**: All blob URLs created via `URL.createObjectURL` must be revoked after use via `URL.revokeObjectURL` to prevent memory leaks.
- **Input sanitization**: Watermark text is rendered via Canvas `fillText()`, which does not interpret HTML/JS — no XSS risk from user-provided text.

## 15. Task Breakdown Guide

The following decomposition is recommended for planning:

### Phase 1: Project Scaffolding
- Initialize Vite + React + TypeScript project
- Configure Tailwind CSS
- Create file/folder structure
- Define types and constants
- Verify `npm run dev` and `npm run build` work

### Phase 2: Image Upload
- Build `DropZone` component (drag-and-drop + click)
- Implement `fileValidation.ts`
- Wire up image loading and `ImageFile` creation
- Handle error display

### Phase 3: Watermark Rendering
- Implement `renderWatermark.ts` (grid algorithm)
- Implement `addNoise.ts`
- Build `PreviewCanvas` component
- Verify live rendering with hardcoded settings

### Phase 4: Settings Panel
- Build `SettingsPanel` component with all 8 controls
- Implement `useWatermarkSettings` hook
- Implement `useDebouncedValue` hook
- Wire settings → debounce → preview pipeline

### Phase 5: Export & Download
- Implement `exportImage.ts` (PNG + JPEG)
- Implement `exportPdf.ts`
- Build `DownloadBar` component
- Verify all three formats produce correct output

### Phase 6: Polish
- Build `Footer` component
- Responsive layout adjustments
- Collapsed DropZone mode (replace image)
- Edge case handling (empty text, very large images, GIF first frame)
- Cross-browser testing
