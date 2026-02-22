import type { WatermarkSettings } from "../types";
import { FONT_FAMILIES } from "../constants";

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

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        More Settings
      </h2>

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
        min={50}
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
    </div>
  );
}
