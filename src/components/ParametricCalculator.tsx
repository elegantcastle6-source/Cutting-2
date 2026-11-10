/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Customer, AppSettings, PresetConfig, Part } from '../types/cutting';
import { calculateCabinetParts, CalculationResult } from '../utils/calculator';
import {
  Calculator,
  Sliders,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  PlusSquare,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface ParametricCalculatorProps {
  customer: Customer;
  settings: AppSettings;
  onPreviewParts: (result: CalculationResult) => void;
  onSavePreset: (name: string, preset: PresetConfig) => void;
  onAddNewPresetType: (name: string, preset: PresetConfig) => void;
}

export const ParametricCalculator: React.FC<ParametricCalculatorProps> = ({
  customer,
  settings,
  onPreviewParts,
  onSavePreset,
  onAddNewPresetType,
}) => {
  const [selectedPresetType, setSelectedPresetType] = useState('Cupboard');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Active form configuration state
  const [config, setConfig] = useState<PresetConfig>(() => {
    return settings.presets[selectedPresetType] || settings.presets['Cupboard'] || {};
  });

  // Whenever preset type changes, load its values and reset quantity to 1
  const handlePresetChange = (type: string) => {
    setSelectedPresetType(type);
    const preset = settings.presets[type] || settings.presets['Cupboard'] || {};
    if (type === 'Skirting Base unit') {
      setConfig({
        ...preset,
        clay: 'side',
        cskr: preset.cskr ?? 80,
        ctop: preset.ctop ?? 'yes',
        cside_floor: preset.cside_floor ?? 'yes',
        cside_sub: preset.cside_sub ?? 18,
        cbot_sub: preset.cbot_sub ?? 36,
        cn2: 1,
      });
    } else if (type === 'TV Unit') {
      setConfig({
        ...preset,
        clay: 'side',
        cdy: preset.cdy ?? 'yes',
        cdr: preset.cdr !== undefined ? preset.cdr : 3,
        cdh: preset.cdh || 140,
        cdls: preset.cdls || 50,
        ctp: (preset.ctp === 20 || preset.ctp === undefined) ? 0 : preset.ctp,
        ctl: preset.ctl ?? 0,
        cside_sub: preset.cside_sub ?? 0,
        cbot_sub: preset.cbot_sub ?? 36,
        cn2: 1,
      });
    } else {
      setConfig({
        ...preset,
        cn2: 1,
      });
    }
  };

  const updateConfig = (key: keyof PresetConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const isSideLayout = config.clay === 'side';
  const hasDrawers = isSideLayout || config.cdy === 'yes';

  const handleGeneratePreview = () => {
    const finalConfig = { ...config };
    // Keep 0 drawers if selected (which triggers Doors/Shutters mode)
    const result = calculateCabinetParts(
      finalConfig,
      customer.unit,
      settings,
      customer.mainBoard,
      customer.backBoard,
      customer.backType,
      customer.drawerBottomBoard,
      customer.drawerBottomType
    );
    onPreviewParts(result);
  };

  const handleSaveCurrentRules = () => {
    onSavePreset(selectedPresetType, { ...config });
    alert(`Rules saved specifically for "${selectedPresetType}". Other presets remain unchanged.`);
  };

  const handleResetToDefault = () => {
    const defaultPreset = settings.presets[selectedPresetType] || {};
    setConfig({
      ...defaultPreset,
      cn2: 1,
    });
    alert(`Reset sizes and quantity back to defaults for "${selectedPresetType}".`);
  };

  const handleCreateNewType = () => {
    const name = window.prompt(
      'Enter new cabinet preset name (e.g. Wardrobe 3-Door, Dressing, Shoe Cabinet):'
    );
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    const newConf = { ...config, cu: trimmed, cn2: 1 };
    onAddNewPresetType(trimmed, newConf);
    setSelectedPresetType(trimmed);
    setConfig(newConf);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-4">
      {/* Title & Top Presets Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Parametric Cabinet Calculator
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSaveCurrentRules}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1 transition cursor-pointer"
            title="Save changes specifically to this preset"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600" />
            <span>Save Rules</span>
          </button>

          <button
            onClick={handleResetToDefault}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1 transition cursor-pointer"
            title="Reset added sizes and quantity auto remove as default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleCreateNewType}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1 transition cursor-pointer"
            title="Create a new custom cabinet preset type"
          >
            <PlusSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>+ New Type</span>
          </button>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-2.5 py-1 text-xs font-semibold rounded border flex items-center gap-1 transition cursor-pointer ${
              showAdvanced
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide Carpentry Rules' : 'Detailed Carpentry Rules'}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Preset Type Selector */}
      <div className="mb-3.5">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
          Preset Unit Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(settings.presets)
            .filter((type) => type !== 'Drawer Unit')
            .map((type) => (
            <button
              key={type}
              onClick={() => handlePresetChange(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                selectedPresetType === type
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Dimensions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Cabinets (Qty)
          </label>
          <input
            type="number"
            min="1"
            value={config.cn2 ?? 1}
            onChange={(e) => updateConfig('cn2', Number(e.target.value) || 1)}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Width (mm)
          </label>
          <input
            type="number"
            value={config.cw ?? 1000}
            onChange={(e) => updateConfig('cw', Number(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Height (mm)
          </label>
          <input
            type="number"
            value={config.ch ?? 2100}
            onChange={(e) => updateConfig('ch', Number(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Depth (mm)
          </label>
          <input
            type="number"
            value={config.cd ?? 580}
            onChange={(e) => updateConfig('cd', Number(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Board Thick (mm)
          </label>
          <input
            type="number"
            value={config.ct ?? 18}
            onChange={(e) => updateConfig('ct', Number(e.target.value) || 18)}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Column 6: How Many Doors (Active when Drawers = 0 for TV Unit & Skirting Base Unit) */}
        <div>
          {isSideLayout ? (
            Number(config.cdr) === 0 ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border-2 border-emerald-500 shadow-2xs">
                <label className="block text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>How Many Doors</span>
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-600 text-white rounded font-mono font-bold">0 Drawers</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.cdn ?? 2}
                  onChange={(e) => updateConfig('cdn', Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-emerald-400 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-semibold block mt-0.5">Doors (Shutters) Active</span>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  How Many Doors
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.cdn ?? 2}
                  onChange={(e) => updateConfig('cdn', Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5">Active if Drawers = 0</span>
              </div>
            )
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Doors (Qty)
              </label>
              <input
                type="number"
                min="0"
                value={config.cdn ?? 2}
                onChange={(e) => updateConfig('cdn', Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Secondary Configuration: Shelves & Drawers */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        {!isSideLayout ? (
          <>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Fix Shelves
              </label>
              <input
                type="number"
                value={config.cf ?? 0}
                onChange={(e) => updateConfig('cf', Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Adjust Shelves
              </label>
              <input
                type="number"
                value={config.cas ?? 3}
                onChange={(e) => updateConfig('cas', Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                Drawer Option
              </label>
              <select
                value={config.cdy ?? 'no'}
                onChange={(e) => {
                  const val = e.target.value;
                  updateConfig('cdy', val);
                  if (val === 'yes' && (config.cdr || 0) === 0) {
                    updateConfig('cdr', 1);
                  }
                }}
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="no">No Drawer</option>
                <option value="yes">With Drawer</option>
              </select>
            </div>

            {/* Cupboard Only: Top Depth (-) Deduction (0/blank = same size as bottom) */}
            <div>
              <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
                Top Depth: D - (mm)
              </label>
              <input
                type="number"
                value={config.ctd_sub ?? ''}
                onChange={(e) => updateConfig('ctd_sub', e.target.value === '' ? 0 : Number(e.target.value) || 0)}
                placeholder="0 (Same as Bottom)"
                title="Top Depth deduction in Cupboard. If blank or 0, Top and Bottom are the exact same size (D)"
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                {(config.ctd_sub ?? 0) > 0 ? `Top = D - ${config.ctd_sub}mm` : '0/Blank = Same as Bottom (D)'}
              </span>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
                Side Panel: H - (mm)
              </label>
              <input
                type="number"
                value={config.cside_sub !== undefined && config.cside_sub !== null ? config.cside_sub : (selectedPresetType === 'Skirting Base unit' ? 18 : 0)}
                onChange={(e) => updateConfig('cside_sub', e.target.value === '' ? 0 : Number(e.target.value) || 0)}
                title="Side panel height deduction. If set to 0, Top panel sits inside between 2 side panels: Top Width = W - 2 Side Panels (-36mm)"
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                {selectedPresetType === 'TV Unit'
                  ? 'TV Unit: Top is same size as written (W × D)'
                  : (config.cside_sub ?? (selectedPresetType === 'Skirting Base unit' ? 18 : 0)) === 0
                    ? '0 = Top inside (Top = W - 2 Sides)'
                    : '-18mm in Height (Top on sides)'}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
                Bottom: W - (mm)
              </label>
              <input
                type="number"
                value={config.cbot_sub ?? (selectedPresetType === 'Skirting Base unit' ? 36 : 0)}
                onChange={(e) => updateConfig('cbot_sub', Number(e.target.value) || 0)}
                title="Bottom panel width deduction (-36mm between two 18mm side panels)"
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">-36mm in Width</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
                Skirting (mm)
              </label>
              <input
                type="number"
                value={config.cskr ?? (selectedPresetType === 'Skirting Base unit' ? 80 : 0)}
                onChange={(e) => updateConfig('cskr', Number(e.target.value) || 0)}
                title="Skirting kickboard height (reduces divider size)"
                className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">Reduces Divider H</span>
            </div>
          </>
        )}

        {hasDrawers && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Drawers in Box (0 = Doors)
            </label>
            <input
              type="number"
              min="0"
              value={config.cdr ?? 0}
              onChange={(e) => updateConfig('cdr', Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>
        )}

        {hasDrawers && !isSideLayout && (
          <div>
            <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-1">
              Face Height (mm)
            </label>
            <input
              type="number"
              value={config.cdfh ?? 180}
              onChange={(e) => updateConfig('cdfh', Number(e.target.value) || 0)}
              placeholder="180"
              title="Drawer Front Face Height. Width = (W - 36) - 50mm both sides - Gap - Lipping"
              className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
              Face W: W-36-100-Gap
            </span>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Drawer Layout
          </label>
          <select
            value={config.clay ?? 'stack'}
            onChange={(e) => updateConfig('clay', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="stack">Stacked (Cupboard)</option>
            <option value="side">Side by Side (Drawer / Base Unit)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Door / Front Gap (mm)
          </label>
          <input
            type="number"
            value={config.cfw ?? 4}
            onChange={(e) => updateConfig('cfw', Number(e.target.value) || 0)}
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Advanced Collapsible Carpentry Rules */}
      {showAdvanced && (
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Precise Workshop Carpentry Offsets &amp; Clearances</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                Skirting Height (mm)
              </label>
              <input
                type="number"
                value={config.cskr ?? 0}
                onChange={(e) => updateConfig('cskr', Number(e.target.value) || 0)}
                title="If skirting size is added, it will automatically reduce divider height!"
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400">Reduces Divider Height</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                Back Width: Inner - (mm)
              </label>
              <input
                type="number"
                value={config.cbw ?? 0}
                onChange={(e) => updateConfig('cbw', Number(e.target.value) || 0)}
                placeholder="0"
                title="Back Width deduction from Inner Width (e.g. 0mm, 2mm, 4mm, 18mm)"
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400">Deducts from Inner Width</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                Back Height: H - (mm)
              </label>
              <input
                type="number"
                value={config.cbh !== undefined && config.cbh !== 0 ? config.cbh : ''}
                onChange={(e) => updateConfig('cbh', e.target.value === '' ? 0 : Number(e.target.value) || 0)}
                placeholder="0 (Panel H - Top - Bottom)"
                title="Back Height deduction. If 0 or blank, Back Height = Side Panel Height - Top - Bottom (H - 2T)"
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                {(config.cbh ?? 0) > 0 ? `Deduction: H - ${config.cbh}mm` : '0/Blank = Panel H - Top - Bottom'}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                Top Panel Option
              </label>
              <select
                value={config.ctop ?? 'yes'}
                onChange={(e) => updateConfig('ctop', e.target.value)}
                className="w-full px-2 py-1 text-xs rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="yes">With Top Panel (+18mm)</option>
                <option value="no">No Top (Countertop / Not top)</option>
              </select>
              <span className="text-[9px] text-slate-500">For marble/granite stone or open top</span>
            </div>

            {!isSideLayout && (
              <div>
                <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                  Cupboard Top Depth: D - (mm)
                </label>
                <input
                  type="number"
                  value={config.ctd_sub ?? ''}
                  onChange={(e) => updateConfig('ctd_sub', e.target.value === '' ? 0 : Number(e.target.value) || 0)}
                  placeholder="0 (Same as Bottom)"
                  className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                  {(config.ctd_sub ?? 0) > 0 ? `D - ${config.ctd_sub}mm` : '0/Blank = Same size as Bottom'}
                </span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                Side Panels Floor
              </label>
              <select
                value={config.cside_floor ?? (selectedPresetType === 'Skirting Base unit' ? 'yes' : 'no')}
                onChange={(e) => updateConfig('cside_floor', e.target.value)}
                className="w-full px-2 py-1 text-xs rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="yes">Sides to Floor (Length = H)</option>
                <option value="no">Inside Under Top (Length = H - 2T)</option>
              </select>
              <span className="text-[9px] text-slate-500">Side panels touch the floor</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                Side Panel Height: H - (mm)
              </label>
              <input
                type="number"
                value={config.cside_sub !== undefined && config.cside_sub !== null ? config.cside_sub : (selectedPresetType === 'Skirting Base unit' ? 18 : 0)}
                onChange={(e) => updateConfig('cside_sub', e.target.value === '' ? 0 : Number(e.target.value) || 0)}
                title="Deduct 18mm for top board sitting on side panels. If set to 0, Top panel sits inside between 2 side panels: Top Width = W - 2 Side Panels (-36mm)"
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                {(config.cside_sub ?? (selectedPresetType === 'Skirting Base unit' ? 18 : 0)) === 0
                  ? '0 = Top inside (Top = W - 2 Sides)'
                  : 'Side Height Deduction (-18mm)'}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                Bottom Width: W - (mm)
              </label>
              <input
                type="number"
                value={config.cbot_sub ?? (selectedPresetType === 'Skirting Base unit' ? 36 : 0)}
                onChange={(e) => updateConfig('cbot_sub', Number(e.target.value) || 0)}
                title="Deduct 36mm for bottom panel fitted between two 18mm side panels"
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">Bottom Width Deduction (-36mm)</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                Drawer Side Leave Space (mm)
              </label>
              <input
                type="number"
                value={config.cdwr ?? 50}
                onChange={(e) => updateConfig('cdwr', Number(e.target.value) || 0)}
                title="Hinge clearance reduction per side (default: 50mm)"
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase mb-1">
                Connector Side (mm)
              </label>
              <input
                type="number"
                value={config.ccn ?? 0}
                onChange={(e) => updateConfig('ccn', Number(e.target.value) || 0)}
                placeholder="17 or 18"
                title="Adjustable deduction for connector side panel (e.g. 17 or 18mm)"
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Slide Channel Pair (mm)
              </label>
              <input
                type="number"
                value={config.csl ?? 26}
                onChange={(e) => updateConfig('csl', Number(e.target.value) || 0)}
                title="Pair of slide runners thickness (e.g. 26mm)"
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Drawer Depth Sub (mm)
              </label>
              <input
                type="number"
                value={config.cdsr ?? 100}
                onChange={(e) => updateConfig('cdsr', Number(e.target.value) || 0)}
                title="Recess from cupboard depth D (e.g. 100mm)"
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Drawer Height (mm)
              </label>
              <input
                type="number"
                value={config.cdh ?? 140}
                onChange={(e) => updateConfig('cdh', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1">
                Cupboard Face Height (mm)
              </label>
              <input
                type="number"
                value={config.cdfh ?? 180}
                onChange={(e) => updateConfig('cdfh', Number(e.target.value) || 0)}
                placeholder="180"
                title="Cupboard Drawer Face Height. Face Width = W - 36 - 100 - Gap - Lipping"
                className="w-full px-2 py-1 text-xs font-mono font-bold rounded border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-0.5">W - 36 - 100 - Gap</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Inside Box Mode
              </label>
              <select
                value={config.cdmode ?? 'door'}
                onChange={(e) => updateConfig('cdmode', e.target.value)}
                className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="door">Each Door Space</option>
                <option value="full">One Full Open Space</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Drawers Placement
              </label>
              <select
                value={config.cdsec ?? 'all'}
                onChange={(e) => updateConfig('cdsec', e.target.value)}
                className="w-full px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="all">Every Door Space</option>
                <option value="one">One Door Space Only</option>
              </select>
            </div>

            {/* 6mm Bottom Add W/L (mm) or 18mm Flat Fit note */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                {(config.cdbk ?? '6') === '18' ? '18mm Fit / Groove (mm)' : '6mm Groove Add W/L (mm)'}
              </label>
              {(config.cdbk ?? '6') === '18' ? (
                <div className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
                  0mm (Flat Fit)
                </div>
              ) : (
                <input
                  type="number"
                  value={config.cdb6w ?? 17}
                  onChange={(e) => updateConfig('cdb6w', Number(e.target.value) || 0)}
                  title="Groove depth allowance added to width and length for 6mm bottom"
                  className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              )}
              <span className="text-[9px] text-slate-500 block mt-0.5">
                {(config.cdbk ?? '6') === '18' ? 'No groove allowance for 18mm' : 'Default: 17mm into grooves'}
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Fix Shelf Depth - (mm)
              </label>
              <input
                type="number"
                value={config.cfr ?? 20}
                onChange={(e) => updateConfig('cfr', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Adjust Shelf Depth - (mm)
              </label>
              <input
                type="number"
                value={config.car ?? 36}
                onChange={(e) => updateConfig('car', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Lipping per edge (mm)
              </label>
              <input
                type="number"
                value={config.clp ?? 0}
                onChange={(e) => updateConfig('clp', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Split Tall Pieces At (mm)
              </label>
              <input
                type="number"
                value={config.csp ?? ''}
                onChange={(e) => updateConfig('csp', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Auto (half / shelf)"
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Top Depth = Depth + (mm)
              </label>
              <input
                type="number"
                value={config.ctp ?? (selectedPresetType === 'TV Unit' ? 0 : 20)}
                onChange={(e) => updateConfig('ctp', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              {selectedPresetType === 'TV Unit' && (
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {(config.ctp ?? 0) === 0 ? 'Top Depth = Exact Depth (D)' : `Depth + ${config.ctp}mm`}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Divider Depth = Depth - (mm)
              </label>
              <input
                type="number"
                value={config.cdv ?? 20}
                onChange={(e) => updateConfig('cdv', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Front Height = Height - (mm)
              </label>
              <input
                type="number"
                value={config.cfh ?? 23}
                onChange={(e) => updateConfig('cfh', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Top Length = Width + (mm)
              </label>
              <input
                type="number"
                value={config.ctl ?? 0}
                onChange={(e) => updateConfig('ctl', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              {selectedPresetType === 'TV Unit' && (
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {(config.ctl ?? 0) === 0 ? 'Top Length = Exact Width (W)' : `Width + ${config.ctl}mm`}
                </span>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Drawer Length = Depth - (mm)
              </label>
              <input
                type="number"
                value={config.cdls ?? 50}
                onChange={(e) => updateConfig('cdls', Number(e.target.value) || 0)}
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                Drawer Area Width (mm)
              </label>
              <input
                type="text"
                value={config.cdw ?? ''}
                onChange={(e) => updateConfig('cdw', e.target.value)}
                placeholder="Blank = all inner width"
                className="w-full px-2 py-1 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Calculation Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          Side Panels = Height × Depth. Doors deduct gaps and lipping allowances.
        </div>

        <button
          onClick={handleGeneratePreview}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-emerald-900/20 active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Preview Cabinet Pieces</span>
        </button>
      </div>
    </section>
  );
};
