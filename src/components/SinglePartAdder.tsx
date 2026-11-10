/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Customer, AppSettings, Part } from '../types/cutting';
import { PlusCircle, Scissors } from 'lucide-react';

interface SinglePartAdderProps {
  customer: Customer;
  settings: AppSettings;
  onAddPart: (part: Part) => void;
  onAddSplitParts?: (partA: Part, partB: Part) => void;
}

export const SinglePartAdder: React.FC<SinglePartAdderProps> = ({
  customer,
  settings,
  onAddPart,
  onAddSplitParts,
}) => {
  const [board, setBoard] = useState(customer.mainBoard || 'Color 273 18mm');
  const [partName, setPartName] = useState('Side Panel');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [qty, setQty] = useState('1');

  // Collect all unique boards currently used across parts + customer defaults
  const usedBoards = [
    ...new Set([
      customer.mainBoard || 'Color 273 18mm',
      customer.backBoard || 'Color 273 6mm',
      ...customer.parts.map((p) => p.b),
    ]),
  ].filter(Boolean);

  const handleAdd = () => {
    const b = (board || customer.mainBoard || 'Color 273 18mm').trim();
    const p = (partName || 'Part').trim();
    const w = Number(width);
    const l = Number(length);
    const q = Math.max(1, Number(qty) || 1);

    if (!b || !w || !l || !q) {
      alert('Please enter Board, Part Name, Width, Length, and Qty.');
      return;
    }

    const SL = settings.sl || 2440;

    // Check if length is longer than the stock sheet
    if (l > SL && onAddSplitParts) {
      const confirmSplit = window.confirm(
        `Length ${l}mm exceeds the sheet size (${SL}mm).\n\nDo you want to automatically split this into two pieces (lower and upper)?`
      );

      if (confirmSplit) {
        const half = Math.floor(l / 2);
        const partA: Part = {
          id: `${Date.now()}-a`,
          b,
          u: customer.unit,
          p: `${p} (lower)`,
          w: Math.round(w),
          l: half,
          q,
        };
        const partB: Part = {
          id: `${Date.now()}-b`,
          b,
          u: customer.unit,
          p: `${p} (upper)`,
          w: Math.round(w),
          l: l - half,
          q,
        };
        onAddSplitParts(partA, partB);
        setWidth('');
        setLength('');
        setQty('1');
        return;
      }
    }

    onAddPart({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      b,
      u: customer.unit,
      p,
      w: Math.round(w),
      l: Math.round(l),
      q,
    });

    setWidth('');
    setLength('');
    setQty('1');
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Add Single Part <span className="text-slate-400 normal-case">(Width First, Then Length)</span>
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">
          Adding to: <span className="font-bold text-slate-800 dark:text-slate-200">{customer.unit}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 items-end">
        {/* Board Selection */}
        <div className="col-span-2 sm:col-span-2">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Board / Color
          </label>
          <input
            type="text"
            list="boards-list"
            value={board}
            onChange={(e) => setBoard(e.target.value)}
            placeholder="e.g. Color 273 18mm"
            className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <datalist id="boards-list">
            {usedBoards.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </div>

        {/* Part Name Selection */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Part Name
          </label>
          <input
            type="text"
            list="parts-preset-list"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            placeholder="Side Panel"
            className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <datalist id="parts-preset-list">
            <option value="Side Panel" />
            <option value="Top" />
            <option value="Bottom" />
            <option value="Divider" />
            <option value="Fix Shelves" />
            <option value="Adjust Shelves" />
            <option value="Door" />
            <option value="Face" />
            <option value="Drawer sides" />
            <option value="Drawer front" />
            <option value="Drawer back" />
            <option value="Drawer bottom" />
            <option value="Back 18mm" />
            <option value="Back 6mm" />
            <option value="Wall Panel" />
            <option value="Skirting" />
            <option value="Filler" />
          </datalist>
        </div>

        {/* Width (mm) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Width (mm)
          </label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="580"
            className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 text-right"
          />
        </div>

        {/* Length (mm) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Length (mm)
          </label>
          <input
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="2100"
            className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 text-right"
          />
        </div>

        {/* Qty & Add Button */}
        <div className="flex gap-2">
          <div className="w-16 shrink-0">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Qty
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 text-right"
            />
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md transition shadow-xs cursor-pointer flex items-center justify-center gap-1 active:scale-95"
          >
            <span>Add</span>
          </button>
        </div>
      </div>
    </section>
  );
};
