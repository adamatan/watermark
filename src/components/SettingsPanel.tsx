import { useState } from "react";
import type { LayerSettings, WatermarkSettings } from "../types";
import { FONT_FAMILIES, PRESETS, PRESET_NAMES, activePreset, isDoublePresetActive, type PresetName } from "../constants";

interface SettingsPanelProps {
  settings: WatermarkSettings;
  onLayerChange: (layerIndex: 0 | 1, patch: Partial<LayerSettings>) => void;
  onGlobalChange: (patch: Partial<Pick<WatermarkSettings, "noiseLevel" | "noiseBoost">>) => void;
  onEnableLayer2: (layer1: LayerSettings) => void;
  onDisableLayer2: () => void;
  onApplyDoublePreset: () => void;
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
      </div>
      <span className="text-xs text-gray-600">{checked ? "On" : "Off"}</span>
    </label>
  );
}

const PRESET_STYLES: Record<PresetName, { dot: string; active: string; base: string }> = {
  Default: { dot: "bg-blue-600",  active: "border-blue-600 text-blue-700 bg-blue-50",  base: "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50/50" },
  Double:  { dot: "", active: "border-indigo-500 text-indigo-700 bg-indigo-50", base: "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50" },
  Subtle:  { dot: "bg-blue-400",  active: "border-blue-400 text-blue-600 bg-blue-50/60", base: "border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/40" },
  Stamp:   { dot: "bg-red-500 border-2 border-dashed border-red-700", active: "border-red-500 text-red-700 bg-red-50", base: "border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50/50" },
};

export function SettingsPanel({ settings, onLayerChange, onGlobalChange, onEnableLayer2, onDisableLayer2, onApplyDoublePreset }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [expanded, setExpanded] = useState(false);

  const layer2 = settings.layers[1];
  const layer2Enabled = layer2 !== null;

  // If layer2 is off and user somehow ends up on tab 1, fall back to tab 0
  const effectiveTab: 0 | 1 = !layer2Enabled && activeTab === 1 ? 0 : activeTab;
  const currentLayer = settings.layers[effectiveTab] ?? settings.layers[0];

  // "Double" is active when both layers match its definition; otherwise match single-layer presets
  const current: PresetName | null =
    effectiveTab === 0 && isDoublePresetActive(settings)
      ? "Double"
      : activePreset(currentLayer);

  function handleLayer2TabClick() {
    if (!layer2Enabled) {
      // Enable with layer1's text + contrasting preset
      onEnableLayer2(settings.layers[0]);
    }
    setActiveTab(1);
  }

  function handleLayer2Toggle(on: boolean) {
    if (on) {
      onEnableLayer2(settings.layers[0]);
      setActiveTab(1);
    } else {
      onDisableLayer2();
      setActiveTab(0);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab(0)}
          className={`px-4 py-2.5 text-xs font-medium transition-colors ${
            effectiveTab === 0
              ? "text-blue-700 border-b-2 border-blue-600 bg-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Layer 1
        </button>

        <button
          onClick={handleLayer2TabClick}
          className={`px-4 py-2.5 text-xs font-medium transition-colors ${
            effectiveTab === 1
              ? "text-blue-700 border-b-2 border-blue-600 bg-white"
              : layer2Enabled
                ? "text-gray-500 hover:text-gray-700"
                : "text-gray-400 hover:text-blue-600"
          }`}
        >
          Layer 2
        </button>
      </div>

      {/* Layer 2 on/off toggle — shown only when Layer 2 tab is active */}
      {effectiveTab === 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-xs font-medium text-gray-500">Enable Layer 2</span>
          <Toggle checked={layer2Enabled} onChange={handleLayer2Toggle} />
        </div>
      )}

      {/* Layer content — show normally for layer 1, only when enabled for layer 2 */}
      {(effectiveTab === 0 || layer2Enabled) && (
        <>
          {/* Watermark text */}
          <div className="p-4 space-y-2">
            <label className="text-sm font-medium text-gray-700">Watermark text</label>
            <textarea
              value={currentLayer.text}
              onChange={(e) => onLayerChange(effectiveTab, { text: e.target.value })}
              placeholder={effectiveTab === 1 ? "Enter Layer 2 text" : "Enter watermark text"}
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
                const handleClick =
                  name === "Double"
                    ? () => { onApplyDoublePreset(); setActiveTab(0); }
                    : () => onLayerChange(effectiveTab, PRESETS[name]);
                return (
                  <button
                    key={name}
                    onClick={handleClick}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border py-2.5 px-1 text-xs font-medium transition-colors ${
                      isActive ? s.active : s.base
                    }`}
                  >
                    {name === "Double" ? (
                      <span
                        className={`w-4 h-4 rounded-full flex-shrink-0 ${isActive ? "ring-2 ring-offset-1 ring-indigo-500" : ""}`}
                        style={{ background: "linear-gradient(to right, #1714CC 50%, #DC2626 50%)" }}
                      />
                    ) : (
                      <span className={`w-4 h-4 rounded-full flex-shrink-0 ${s.dot} ${isActive ? "ring-2 ring-offset-1 ring-current" : ""}`} />
                    )}
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

          {/* Per-layer advanced settings */}
          {expanded && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
              {/* Color */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentLayer.color}
                    onChange={(e) => onLayerChange(effectiveTab, { color: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded border border-gray-300 p-0.5 flex-shrink-0"
                  />
                  <span className="text-xs text-gray-500 font-mono">{currentLayer.color.toUpperCase()}</span>
                </div>
              </div>

              <SliderRow
                label="Opacity"
                value={Math.round(currentLayer.opacity * 100)}
                min={5}
                max={100}
                unit="%"
                onChange={(v) => onLayerChange(effectiveTab, { opacity: v / 100 })}
              />

              <SliderRow
                label="Font size"
                value={currentLayer.fontSize}
                min={12}
                max={200}
                unit="px"
                onChange={(v) => onLayerChange(effectiveTab, { fontSize: v })}
              />

              <SliderRow
                label="Rotation"
                value={currentLayer.rotation}
                min={-90}
                max={90}
                unit="°"
                onChange={(v) => onLayerChange(effectiveTab, { rotation: v })}
              />

              <SliderRow
                label="Spacing"
                value={currentLayer.spacing}
                min={0}
                max={500}
                unit="px"
                onChange={(v) => onLayerChange(effectiveTab, { spacing: v })}
              />

              {/* Font family */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Font</label>
                <select
                  value={currentLayer.fontFamily}
                  onChange={(e) =>
                    onLayerChange(effectiveTab, { fontFamily: e.target.value as LayerSettings["fontFamily"] })
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

              {/* Border toggle */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-600">Border frame</label>
                <Toggle
                  checked={currentLayer.borderEnabled}
                  onChange={(v) => onLayerChange(effectiveTab, { borderEnabled: v })}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Global noise section */}
      <div className="px-4 py-4 space-y-4 border-t border-gray-200">
        <p className="text-xs font-medium text-gray-500">Noise (global)</p>
        <SliderRow
          label="Base noise"
          value={settings.noiseLevel}
          min={0}
          max={60}
          unit=""
          onChange={(v) => onGlobalChange({ noiseLevel: v })}
        />
        <SliderRow
          label="Watermark boost"
          value={settings.noiseBoost}
          min={0}
          max={60}
          unit=""
          onChange={(v) => onGlobalChange({ noiseBoost: v })}
        />
      </div>
    </div>
  );
}
