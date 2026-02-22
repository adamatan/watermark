# Watermark FE - Product Requirements Document

## Overview

A client-side web application that adds watermarks to sensitive images (e.g. passport scans, ID documents). All processing happens entirely in the browser - no server calls, no data leaves the user's device.

## Core Principles

- **Privacy first**: Zero server communication. All image processing is local.
- **Open source**: No analytics, no tracking, no usage metrics.
- **Self-contained**: All dependencies bundled at build time. No CDN calls, no external resource loading at runtime.

## Tech Stack

| Layer        | Choice                  |
|-------------|-------------------------|
| Framework   | React 18+ with TypeScript |
| Build tool  | Vite                    |
| Styling     | Tailwind CSS            |
| Canvas      | HTML5 Canvas API        |
| PDF export  | jsPDF (bundled)         |

## User Flow

1. User opens the app and sees a drop zone with instructions.
2. User drags an image onto the drop zone (or clicks to browse).
3. The image appears in a preview area with a default watermark applied: `Watermarked <current date>` (e.g. "Watermarked 2026-02-21").
4. User can edit the watermark text, overriding the default.
5. User adjusts settings (color, transparency, font size, rotation, spacing, font family, noise protection) and sees live preview updates.
6. User downloads the watermarked image in their preferred format (PNG, JPEG, or PDF).

## Features

### Image Upload

- **Drag and drop zone**: Large, clearly labeled area. Visual feedback on drag-over (border highlight, background change).
- **Click to browse**: Fallback for users who prefer a file picker.
- **Accepted formats**: JPEG, PNG, WebP, BMP, TIFF, GIF (first frame only).
- **File size limit**: Hard limit at 50 MB. Files above this are rejected with a clear error message.
- **Validation**: Display a user-friendly error for unsupported formats or oversized files.

### Watermark Rendering

- **Layout**: Diagonal repeated grid covering the entire image. Text is repeated at a configurable angle across the full canvas so that cropping any region still shows the watermark.
- **Default text**: `Watermarked <current date>` using the user's local date in ISO format (YYYY-MM-DD). The text input is pre-filled with this value and fully editable.

### Settings Panel

All settings update the live preview in real time.

| Setting             | Control Type   | Default           | Range / Options                              |
|--------------------|---------------|-------------------|----------------------------------------------|
| Watermark text      | Text input     | `Watermarked <date>` | Free text                                   |
| Font color          | Color picker   | `#000000` (black) | Any color                                    |
| Opacity             | Slider         | 30%               | 5% - 100%                                   |
| Font size           | Slider         | 48px              | 12px - 200px                                 |
| Rotation angle      | Slider         | -45°              | -90° to 90°                                  |
| Grid spacing        | Slider         | 200px             | 50px - 500px                                 |
| Font family         | Dropdown       | Arial             | Arial, Times New Roman, Courier New, Georgia, Verdana (system fonts, no external loading) |
| Anti-removal noise  | Toggle         | Off               | On/Off - when enabled, adds subtle noise/distortion around watermark text |

### Live Preview

- Displayed below the settings panel.
- Updates in real time as settings change (debounced for performance on large images).
- Rendered using an HTML5 Canvas element.
- The preview is scaled to fit the viewport while maintaining aspect ratio.
- The actual export uses the original image resolution.

### Download

Three download buttons, clearly labeled:

| Format | Behavior |
|--------|----------|
| **PNG** | Lossless export at original resolution. Preserves transparency if present in source image. |
| **JPEG** | Lossy export at original resolution. Quality: 92%. White background replaces any transparency. |
| **PDF** | Single-page PDF with the watermarked image fitted to the page. Uses jsPDF, bundled locally. |

Each button triggers an immediate browser download with a filename pattern: `<original-filename>-watermarked.<ext>`

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  Watermark App                                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │         Drop image here or click to upload    │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌──── Settings ─────────────────────────────────┐  │
│  │ Watermark text: [Watermarked 2026-02-21    ]  │  │
│  │ Color: [■ #000000]   Opacity: [====○----] 30% │  │
│  │ Font size: [====○---------] 48px              │  │
│  │ Rotation: [====○---------] -45°               │  │
│  │ Spacing: [=====○--------] 200px               │  │
│  │ Font: [Arial          ▼]                      │  │
│  │ Anti-removal noise: [ ] Off                   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │            Live Preview                       │  │
│  │     (watermarked image rendered here)         │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  [ Download PNG ] [ Download JPEG ] [ Download PDF ]│
│                                                     │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │
│  Your images never leave your browser.              │
│  All processing happens locally. Open source.       │
└─────────────────────────────────────────────────────┘
```

## Responsive Design

- **Desktop-first** layout, but mobile-friendly.
- On narrow viewports: settings stack vertically, preview scales down, download buttons stack.
- Drag-and-drop works on desktop; on mobile the click-to-browse file picker is the primary interaction.

## Privacy Footer

A subtle footer note at the bottom of the page:

> "Your images never leave your browser. All processing happens locally on your device. [View source on GitHub]"

No banner, no modal, no cookie consent (there are no cookies).

## Performance Considerations

- **Debounced rendering**: Slider changes debounce the canvas re-render (150ms) to avoid jank on large images.
- **Web Workers**: Consider offloading canvas rendering to a Web Worker for images above 5 MP to keep the UI responsive (nice-to-have for v1).
- **Memory**: After download, the generated blob URL is revoked to free memory.

## Non-Goals (Explicitly Out of Scope)

- No user accounts or authentication.
- No server-side processing or storage.
- No analytics, telemetry, or usage tracking.
- No image editing beyond watermarking (no crop, rotate, resize of the source image).
- No batch processing (one image at a time).
- No watermark templates or saved presets in v1.
- No internationalization in v1 (English only).

## Open Source

- License: MIT (or user's preference).
- Repository will include: source code, build instructions, and this PRD.
- No contributor agreement required.

## Browser Support

Modern evergreen browsers:
- Chrome/Edge 90+
- Firefox 90+
- Safari 15+

No IE11 support.
