/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Part, AppSettings } from '../types/cutting';
import { isOverSheet, parseBoardCodeAndThickness } from '../utils/calculator';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  Trash2,
  Layers,
  Palette,
  Edit3,
} from 'lucide-react';

interface PreviewModalProps {
  currentUnit: string;
  availableUnits: string[];
  initialParts: Part[];
  messages: string[];
  settings: AppSettings;
  onSaveToUnit: (parts: Part[], targetUnit: string) => void;
  onDiscard: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  currentUnit,
  availableUnits,
  initialParts,
  messages,
  settings,
  onSaveToUnit,
  onDiscard,
}) => {
  const [targetUnit, setTargetUnit] = useState<string>(currentUnit);
  const [parts, setParts] = useState<Part[]>(initialParts);
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('ALL');

  const updatePart = (index: number, field: keyof Part, value: any) => {
    setParts((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const updatePartCode = (index: number, newCode: string, currentThickness: string) => {
    const code = newCode.trim();
    const thick = currentThickness.trim() || '18mm';
    const newBoard = code
      ? code.toLowerCase().startsWith('color')
        ? `${code} ${thick}`
        : `Color ${code} ${thick}`
      : `Color 273 ${thick}`;
    updatePart(index, 'b', newBoard);
  };

  const updatePartThickness = (index: number, currentCode: string, newThickness: string) => {
    const code = currentCode.trim() || '273';
    const thick = newThickness.trim() || '18mm';
    const newBoard = code.toLowerCase().startsWith('color')
      ? `${code} ${thick}`
      : `Color ${code} ${thick}`;
    updatePart(index, 'b', newBoard);
  };

  const handleBatchUpdateColor = (oldBoard: string) => {
    const current = parseBoardCodeAndThickness(oldBoard);
    const newCode = window.prompt(
      `Enter new Board Color Code for all pieces in "${oldBoard}":`,
      current.code
    );
    if (newCode === null) return;
    const cleanCode = newCode.trim() || current.code;
    const newBoard = cleanCode.toLowerCase().startsWith('color')
      ? `${cleanCode} ${current.thickness}`
      : `Color ${cleanCode} ${current.thickness}`;

    setParts((prev) =>
      prev.map((p) => (p.b.trim() === oldBoard.trim() ? { ...p, b: newBoard } : p))
    );
  };

  const removePart = (index: number) => {
    setParts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const finalUnit = targetUnit.trim() || currentUnit;
    const validParts = parts
      .filter((p) => p.q > 0 && p.w > 0 && p.l > 0)
      .map((p) => ({ ...p, u: finalUnit }));
    if (!validParts.length) {
      alert('No valid parts to save.');
      return;
    }
    onSaveToUnit(validParts, finalUnit);
  };

  const totalPieces = parts.reduce((sum, p) => sum + (Number(p.q) || 0), 0);

  // Group parts strictly separated color-wise / board-wise
  const boardGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        board: string;
        code: string;
        thickness: string;
        items: { part: Part; index: number }[];
        totalQty: number;
        totalAreaM2: number;
      }
    > = {};

    parts.forEach((p, index) => {
      const bKey = (p.b || 'Color 273 18mm').trim();
      const bInfo = parseBoardCodeAndThickness(bKey);
      if (!groups[bKey]) {
        groups[bKey] = {
          board: bKey,
          code: bInfo.code,
          thickness: bInfo.thickness,
          items: [],
          totalQty: 0,
          totalAreaM2: 0,
        };
      }
      groups[bKey].items.push({ part: p, index });
      groups[bKey].totalQty += Number(p.q) || 0;
      groups[bKey].totalAreaM2 += ((Number(p.w) || 0) * (Number(p.l) || 0) * (Number(p.q) || 0)) / 1e6;
    });

    return Object.values(groups);
  }, [parts]);

  const displayedGroups =
    selectedColorFilter === 'ALL'
      ? boardGroups
      : boardGroups.filter((g) => g.board === selectedColorFilter);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Cabinet Pieces Preview (Separated Color-Wise)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review computed pieces grouped by board color. Code and thickness are fully editable. Identical pieces merge automatically in the selected unit.
            </p>

            {/* Target Unit Selector */}
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                Save to Cabinet Unit:
              </span>
              <select
                value={targetUnit}
                onChange={(e) => {
                  if (e.target.value === '__NEW__') {
                    const name = prompt('Enter new cabinet unit name (e.g. Cupboard 2, Shoe Rack):');
                    if (name && name.trim()) {
                      setTargetUnit(name.trim());
                    }
                  } else {
                    setTargetUnit(e.target.value);
                  }
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-md border-2 border-emerald-600 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 focus:outline-none shadow-2xs cursor-pointer"
              >
                {availableUnits.map((u) => (
                  <option key={u} value={u}>
                    {u} {u === currentUnit ? '(Current Unit)' : ''}
                  </option>
                ))}
                {!availableUnits.includes(targetUnit) && (
                  <option value={targetUnit}>{targetUnit} (New)</option>
                )}
                <option value="__NEW__">+ Create New Unit...</option>
              </select>
            </div>
          </div>

          <button
            onClick={onDiscard}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational / Warning Messages */}
        {messages.length > 0 && (
          <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              {messages.map((msg, i) => (
                <div key={i} className="font-medium">
                  {msg}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color-Wise Tabs Filter Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide shrink-0">
            <Palette className="w-3.5 h-3.5 text-emerald-600" />
            <span>Separated Color-Wise:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedColorFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                selectedColorFilter === 'ALL'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All Colors ({boardGroups.length} groups · {totalPieces} pcs)
            </button>
            {boardGroups.map((g) => (
              <button
                key={g.board}
                onClick={() => setSelectedColorFilter(g.board)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                  selectedColorFilter === g.board
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{g.board}</span>
                <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 font-black">
                  {g.totalQty} pcs
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Parts Table Grouped Separately Color-Wise */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayedGroups.map((group) => (
            <div
              key={group.board}
              className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900"
            >
              {/* Board Color Group Header */}
              <div className="px-4 py-2.5 bg-slate-100/90 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    {group.board}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Code: {group.code} · {group.thickness}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({group.items.length} parts, {group.totalQty} total pcs · {group.totalAreaM2.toFixed(2)} m²)
                  </span>
                </div>

                <button
                  onClick={() => handleBatchUpdateColor(group.board)}
                  className="px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 flex items-center gap-1 transition cursor-pointer"
                  title="Change color/code for all parts in this group"
                >
                  <Edit3 className="w-3 h-3 text-emerald-600" />
                  <span>Batch Edit Color</span>
                </button>
              </div>

              {/* Table for this Board Color */}
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2 px-3">Part Name (Editable)</th>
                    <th className="py-2 px-3">Code &amp; Thickness (Editable)</th>
                    <th className="py-2 px-3 text-right">Width (mm)</th>
                    <th className="py-2 px-3 text-right">Length (mm)</th>
                    <th className="py-2 px-3 text-right">Qty</th>
                    <th className="py-2 px-3 text-center">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {group.items.map(({ part: p, index }) => {
                    const exceeds = isOverSheet(p.w, p.l, settings.sl, settings.sw);
                    const bInfo = parseBoardCodeAndThickness(p.b);

                    return (
                      <tr
                        key={p.id || index}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-850 transition"
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={p.p}
                            onChange={(e) => updatePart(index, 'p', e.target.value)}
                            placeholder="Part Name"
                            title="Edit Part Name before saving"
                            className="w-32 sm:w-40 px-2 py-0.5 text-xs font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                          />
                        </td>
                        {/* Editable Code & Thickness */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="text"
                              value={bInfo.code}
                              onChange={(e) =>
                                updatePartCode(index, e.target.value, bInfo.thickness)
                              }
                              placeholder="Code"
                              title="Edit Board Color Code"
                              className="w-20 px-2 py-0.5 text-xs font-mono font-bold rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                            <select
                              value={bInfo.thickness}
                              onChange={(e) =>
                                updatePartThickness(index, bInfo.code, e.target.value)
                              }
                              title="Edit Board Thickness"
                              className="px-2 py-0.5 text-xs font-mono font-bold rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                            >
                              <option value="18mm">18mm</option>
                              <option value="6mm">6mm</option>
                              <option value="12mm">12mm</option>
                              <option value="9mm">9mm</option>
                              <option value="25mm">25mm</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={p.w}
                            onChange={(e) =>
                              updatePart(index, 'w', Number(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1 text-xs font-mono font-bold text-right border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            value={p.l}
                            onChange={(e) =>
                              updatePart(index, 'l', Number(e.target.value) || 0)
                            }
                            className="w-20 px-2 py-1 text-xs font-mono font-bold text-right border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="1"
                            value={p.q}
                            onChange={(e) =>
                              updatePart(index, 'q', Number(e.target.value) || 1)
                            }
                            className="w-16 px-2 py-1 text-xs font-mono font-bold text-right border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          {exceeds ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                              <AlertTriangle className="w-3 h-3" />
                              Exceeds Sheet
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                              <CheckCircle2 className="w-3 h-3" />
                              OK
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => removePart(index)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Remove part from preview"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Total Parts to Add:{' '}
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
              {totalPieces} pcs across {boardGroups.length} board colors
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDiscard}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition shadow-md shadow-emerald-900/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Merge &amp; Save {totalPieces} Pieces to "{targetUnit}"</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
