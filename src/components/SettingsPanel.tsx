import { useState } from "react";
import type { WatermarkSettings } from "../types";
import { FONT_FAMILIES, PRESETS, type PresetName } from "../constants";

interface SettingsPanelProps {
  settings: WatermarkSettings;
  onChange: (patch: Partial<WatermarkSettings>) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (value: number) => void;
}

function SliderRow({ label, value, min, max, step = 1, unit, onChange }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <span className="text-xs text-gray-500 tabular-nums">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </div>
  );
}

const PRESET_STYLES: Record<PresetName, { dot: string; active: string; base: string }> = {
  Default: { dot: "bg-blue-600",  active: "border-blue-600 text-blue-700 bg-blue-50",  base: "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50" },
  Bold:    { dot: "bg-red-500",   active: "border-red-500 text-red-700 bg-red-50",    base: "border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50/50" },
  Subtle:  { dot: "bg-blue-400",  active: "border-blue-400 text-blue-600 bg-blue-50/60", base: "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/40" },
  Stamp:   { dot: "bg-red-500 border-2 border-dashed border-red-700", active: "border-red-500 text-red-700 bg-red-50", base: "border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50/50" },
};

const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

function activePreset(settings: WatermarkSettings): PresetName | null {
  for (const name of PRESET_NAMES) {
    const p = PRESETS[name];
    if (
      p.color === settings.color &&
      p.opacity === settings.opacity &&
      p.fontSize === settings.fontSize &&
      p.rotation === settings.rotation &&
      p.spacing === settings.spacing &&
      p.fontFamily === settings.fontFamily &&
      p.borderEnabled === settings.borderEnabled
    ) {
      return name;
    }
  }
  return null;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const current = activePreset(settings);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Watermark text */}
      <div className="p-4 space-y-2">
        <label className="text-sm font-medium text-gray-700">Watermark text</label>
        <textarea
          value={settings.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Enter watermark text"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Preset buttons */}
      <div className="px-4 pb-4 space-y-2">
        <p className="text-xs font-medium text-gray-500">Style preset</p>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_NAMES.map((name) => {
            const s = PRESET_STYLES[name];
            const isActive = current === name;
            return (
              <button
                key={name}
                onClick={() => onChange(PRESETS[name])}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-2.5 px-1 text-xs font-medium transition-colors ${
                  isActive ? s.active : s.base
                }`}
              >
                <span className={`w-4 h-4 rounded-full ${s.dot} ${isActive ? "ring-2 ring-offset-1 ring-current" : ""}`} />
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expand / collapse toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-500 hover:text-gray-700 border-t border-gray-100 hover:bg-gray-50 transition-colors"
      >
        <span>Customize</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Advanced settings (collapsible) */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* Color */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.color}
                onChange={(e) => onChange({ color: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded border border-gray-300 p-0.5 flex-shrink-0"
              />
              <span className="text-xs text-gray-500 font-mono">{settings.color.toUpperCase()}</span>
            </div>
          </div>

          <SliderRow
            label="Opacity"
            value={Math.round(settings.opacity * 100)}
            min={5}
            max={100}
            unit="%"
            onChange={(v) => onChange({ opacity: v / 100 })}
          />

          <SliderRow
            label="Font size"
            value={settings.fontSize}
            min={12}
            max={200}
            unit="px"
            onChange={(v) => onChange({ fontSize: v })}
          />

          <SliderRow
            label="Rotation"
            value={settings.rotation}
            min={-90}
            max={90}
            unit="°"
            onChange={(v) => onChange({ rotation: v })}
          />

          <SliderRow
            label="Spacing"
            value={settings.spacing}
            min={0}
            max={500}
            unit="px"
            onChange={(v) => onChange({ spacing: v })}
          />

          {/* Font family */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Font</label>
            <select
              value={settings.fontFamily}
              onChange={(e) =>
                onChange({ fontFamily: e.target.value as WatermarkSettings["fontFamily"] })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Noise toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">Anti-removal noise</label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.noiseEnabled}
                  onChange={(e) => onChange({ noiseEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-xs text-gray-600">{settings.noiseEnabled ? "On" : "Off"}</span>
            </label>
          </div>

          {/* Border toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-600">Border frame</label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.borderEnabled}
                  onChange={(e) => onChange({ borderEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-xs text-gray-600">{settings.borderEnabled ? "On" : "Off"}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
