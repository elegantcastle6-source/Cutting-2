/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Customer, AppSettings, Part } from '../types/cutting';
import {
  isOverSheet,
  calculateSheetConsumption,
  getMergedPartsByBoard,
  formatTagBreakdown,
  getCarpentrySequenceIndex,
  parseBoardCodeAndThickness,
} from '../utils/calculator';
import { SheetNestingView } from './SheetNestingView';
import {
  FileText,
  Printer,
  Tag,
  Download,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
  Layers,
  Sparkles,
  ArrowUpDown,
  Combine,
  Box,
  Filter,
} from 'lucide-react';

interface CuttingListViewProps {
  customer: Customer;
  settings: AppSettings;
  viewMode: 'unit' | 'board' | 'nesting';
  onChangeViewMode: (mode: 'unit' | 'board' | 'nesting') => void;
  selectedUnitFilter: string;
  onSelectUnitFilter: (unit: string) => void;
  onUpdatePart: (index: number, field: keyof Part, value: any) => void;
  onDeletePart: (index: number) => void;
  onDeleteMergedBoardSize: (board: string, key: string) => void;
  onClearAllParts: (unitName?: string) => void;
  onMergeAndSortUnit?: (unitName?: string) => void;
  onOpenThermalLabels: () => void;
  onDownloadCsv: () => void;
  onDownloadTxt: () => void;
  onCopyTxt: () => void;
  printFontSize?: number;
  onChangePrintFontSize?: (size: number) => void;
  printLayout?: 'right-first' | 'standard';
  onChangePrintLayout?: (layout: 'right-first' | 'standard') => void;
}

export const CuttingListView: React.FC<CuttingListViewProps> = ({
  customer,
  settings,
  viewMode,
  onChangeViewMode,
  selectedUnitFilter,
  onSelectUnitFilter,
  onUpdatePart,
  onDeletePart,
  onDeleteMergedBoardSize,
  onClearAllParts,
  onMergeAndSortUnit,
  onOpenThermalLabels,
  onDownloadCsv,
  onDownloadTxt,
  onCopyTxt,
  printFontSize = 11,
  onChangePrintFontSize,
  printLayout = 'right-first',
  onChangePrintLayout,
}) => {
  const parts = customer.parts || [];
  const isFilteredUnit = viewMode === 'unit' && selectedUnitFilter && selectedUnitFilter !== 'all';
  const displayedParts = isFilteredUnit ? parts.filter((p) => p.u === selectedUnitFilter) : parts;
  const consumption = calculateSheetConsumption(displayedParts, settings);

  const SL = settings.sl || 2440;
  const SW = settings.sw || 1220;

  // Group parts by board for board view
  const boardsMap: Record<string, Part[]> = {};
  parts.forEach((p) => {
    if (!boardsMap[p.b]) boardsMap[p.b] = [];
    boardsMap[p.b].push(p);
  });

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-6">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
        {/* Left: View Mode Toggles */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onChangeViewMode('unit')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer border ${
              viewMode === 'unit'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            By Unit
          </button>

          <button
            onClick={() => onChangeViewMode('board')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer border ${
              viewMode === 'board'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            By Board (Cutting List)
          </button>

          <button
            onClick={() => onChangeViewMode('nesting')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer border flex items-center gap-1.5 ${
              viewMode === 'nesting'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>2D Sheet Diagram</span>
          </button>
        </div>

        {/* Right: Actions (Print, Labels, Export, Clear) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="Print clean A4 cutting list report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print List (A4)</span>
          </button>

          <button
            onClick={onOpenThermalLabels}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="Print workshop barcode stickers for each piece"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Print Stickers</span>
          </button>

          {viewMode === 'unit' && onMergeAndSortUnit && (
            <button
              onClick={() => onMergeAndSortUnit(customer.unit)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
              title="Merge identical parts in this unit and arrange in standard carpentry sequence"
            >
              <Combine className="w-3.5 h-3.5" />
              <span>Merge &amp; Sort Unit</span>
            </button>
          )}

          <button
            onClick={onDownloadCsv}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
            title="Export cutting list to Excel CSV"
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={onDownloadTxt}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
            title="Export cutting list as plain text file"
          >
            <FileText className="w-3 h-3 text-slate-500" />
            <span>TXT</span>
          </button>

          <button
            onClick={onCopyTxt}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center gap-1 transition cursor-pointer"
            title="Copy cutting list to clipboard"
          >
            <Copy className="w-3 h-3 text-slate-500" />
            <span>Copy</span>
          </button>

          <button
            onClick={() => onClearAllParts(isFilteredUnit ? selectedUnitFilter : customer.unit)}
            className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md border border-rose-200 dark:border-rose-900/40 transition cursor-pointer flex items-center gap-1.5 ml-1"
            title={`Clear all parts in selected unit "${isFilteredUnit ? selectedUnitFilter : customer.unit}"`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear "{isFilteredUnit ? selectedUnitFilter : customer.unit}" Parts</span>
          </button>
        </div>
      </div>

      {/* Print Settings & Font Size Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 mb-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
            <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Print Font Size:</span>
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            {[9, 10, 11, 12, 13].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChangePrintFontSize?.(size)}
                className={`px-2 py-0.5 text-xs font-bold rounded transition cursor-pointer ${
                  printFontSize === size
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={`Set A4 print table font size to ${size}px`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">
            Page Print Layout:
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            <button
              type="button"
              onClick={() => onChangePrintLayout?.('right-first')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded transition cursor-pointer flex items-center gap-1 ${
                printLayout === 'right-first'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Fill right side column first all the way down, then left column"
            >
              <span>👉 Fill Right First</span>
            </button>
            <button
              type="button"
              onClick={() => onChangePrintLayout?.('standard')}
              className={`px-2.5 py-0.5 text-xs font-bold rounded transition cursor-pointer ${
                printLayout === 'standard'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Standard left-to-right 2-column layout"
            >
              <span>Standard (Left First)</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 ml-1"
            title="Print clean A4 cutting list report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Now</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'nesting' ? (
        <SheetNestingView customer={customer} settings={settings} />
      ) : parts.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
          No parts added yet. Add a single part above or use the Parametric Cabinet Calculator.
        </div>
      ) : viewMode === 'unit' ? (
        /* ================= BY UNIT VIEW ================= */
        <div className="space-y-4">
          {/* SEPARATE UNIT SELECTION TABS */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5 mr-1">
                <Box className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Separate Unit View:</span>
              </span>

              {/* All Units Tab */}
              <button
                onClick={() => onSelectUnitFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                  selectedUnitFilter === 'all'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <span>All Units</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/15">
                  {parts.reduce((a, b) => a + b.q, 0)} pcs
                </span>
              </button>

              {/* Individual Unit Tabs */}
              {customer.units.map((u) => {
                const uPieces = parts.filter((p) => p.u === u).reduce((a, b) => a + b.q, 0);
                const isSelected = selectedUnitFilter === u;

                return (
                  <button
                    key={u}
                    onClick={() => onSelectUnitFilter(u)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>{u}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/15">
                      {uPieces}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedUnitFilter !== 'all' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-800">
                  Viewing Unit Separately: <strong className="font-extrabold text-emerald-900 dark:text-emerald-200">{selectedUnitFilter}</strong>
                </span>

                {onMergeAndSortUnit && (
                  <button
                    onClick={() => onMergeAndSortUnit(selectedUnitFilter)}
                    className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/80 flex items-center gap-1 transition cursor-pointer"
                    title={`Merge duplicate sizes and sort ${selectedUnitFilter} into carpentry sequence`}
                  >
                    <span>⚡ Auto-Merge &amp; Sort</span>
                  </button>
                )}

                <button
                  onClick={() => onClearAllParts(selectedUnitFilter)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1 transition cursor-pointer"
                  title={`Clear all parts in selected unit "${selectedUnitFilter}"`}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Unit Parts</span>
                </button>
              </div>
            )}
          </div>

          {/* Render Filtered Units */}
          {(() => {
            const unitsToRender =
              selectedUnitFilter === 'all'
                ? customer.units
                : customer.units.filter((u) => u === selectedUnitFilter);

            const hasAnyParts = unitsToRender.some((u) => parts.some((p) => p.u === u));

            if (!hasAnyParts) {
              return (
                <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  No parts found in {selectedUnitFilter === 'all' ? 'any unit' : `"${selectedUnitFilter}"`}. Use the Parametric Calculator or Single Part form above to add pieces.
                </div>
              );
            }

            return unitsToRender.map((unitName) => {
              // Find parts belonging to this unit
              const unitPartEntries = parts
                .map((x, originalIndex) => ({ part: x, originalIndex }))
                .filter((item) => item.part.u === unitName);

              if (!unitPartEntries.length) return null;

              // Sub-group by board within unit
              const boardGroups: Record<string, { part: Part; originalIndex: number }[]> = {};
              unitPartEntries.forEach((item) => {
                if (!boardGroups[item.part.b]) boardGroups[item.part.b] = [];
                boardGroups[item.part.b].push(item);
              });

              return (
                <div key={unitName} className="space-y-4">
                  {Object.entries(boardGroups).map(([board, groupItems]) => {
                    const unitBoardPieces = groupItems.reduce(
                      (sum, item) => sum + item.part.q,
                      0
                    );

                    // Sort groupItems by carpentry sequence (Side Panels -> Top -> Bottom -> Dividers -> Shelves -> Back -> Doors -> Drawers)
                    groupItems.sort((a, b) => {
                      const rankA = getCarpentrySequenceIndex(a.part.p);
                      const rankB = getCarpentrySequenceIndex(b.part.p);
                      if (rankA !== rankB) return rankA - rankB;
                      const nameComp = a.part.p.localeCompare(b.part.p);
                      if (nameComp !== 0) return nameComp;
                      return b.part.l * b.part.w - a.part.l * a.part.w;
                    });

                    return (
                      <div
                        key={board}
                        className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs"
                      >
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                              Unit: <span className="text-emerald-700 dark:text-emerald-400">{unitName}</span>
                            </span>
                            <span className="text-slate-400">&mdash;</span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                              Board: <strong className="text-slate-800 dark:text-slate-200">{board}</strong>
                            </span>
                          </div>

                        <div className="flex items-center gap-2.5">
                          {onMergeAndSortUnit && (
                            <button
                              onClick={() => onMergeAndSortUnit(unitName)}
                              className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 flex items-center gap-1 cursor-pointer bg-white dark:bg-slate-700/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/80 shadow-2xs hover:bg-emerald-50 dark:hover:bg-slate-700 transition"
                              title="Merge parts with same name and same size in this unit, and arrange in carpentry sequence"
                            >
                              <Combine className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Auto-Merge &amp; Sort</span>
                            </button>
                          )}
                          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                            ({unitBoardPieces} pcs)
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-100/70 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                              <th className="py-2.5 px-3">Part Name (Editable)</th>
                              <th className="py-2.5 px-3">Code &amp; Thickness</th>
                              <th className="py-2.5 px-3 text-right">Width (mm)</th>
                              <th className="py-2.5 px-3 text-right">Length (mm)</th>
                              <th className="py-2.5 px-3 text-right">Qty</th>
                              <th className="py-2.5 px-3 text-center">Status</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {groupItems.map(({ part, originalIndex }) => {
                              const exceeds = isOverSheet(part.w, part.l, SL, SW);
                              const bInfo = parseBoardCodeAndThickness(part.b);

                              return (
                                <tr
                                  key={part.id || originalIndex}
                                  className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition"
                                >
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <input
                                      type="text"
                                      value={part.p}
                                      onChange={(e) => onUpdatePart(originalIndex, 'p', e.target.value)}
                                      placeholder="Part Name"
                                      title="Edit Part Name"
                                      className="w-32 sm:w-44 px-2 py-1 text-xs font-bold rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 shadow-2xs"
                                    />
                                  </td>
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 select-none shadow-2xs"
                                      title="Color & thickness locked/frozen for editing"
                                    >
                                      <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{bInfo.code}</span>
                                      <span className="text-slate-400">·</span>
                                      <span className="text-slate-600 dark:text-slate-300">{bInfo.thickness}</span>
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <input
                                      type="number"
                                      value={part.w}
                                      onChange={(e) =>
                                        onUpdatePart(
                                          originalIndex,
                                          'w',
                                          Number(e.target.value) || 0
                                        )
                                      }
                                      className="w-20 px-2 py-1 text-xs font-mono font-bold text-right border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <input
                                      type="number"
                                      value={part.l}
                                      onChange={(e) =>
                                        onUpdatePart(
                                          originalIndex,
                                          'l',
                                          Number(e.target.value) || 0
                                        )
                                      }
                                      className="w-20 px-2 py-1 text-xs font-mono font-bold text-right border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 focus:outline-none focus:border-emerald-500"
                                    />
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <input
                                      type="number"
                                      min="1"
                                      value={part.q}
                                      onChange={(e) =>
                                        onUpdatePart(
                                          originalIndex,
                                          'q',
                                          Number(e.target.value) || 1
                                        )
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
                                      onClick={() => onDeletePart(originalIndex)}
                                      className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          });
        })()}
      </div>
      ) : (
        /* ================= BY BOARD (MASTER CUTTING LIST) ================= */
        <div className="space-y-6">
          {Object.entries(boardsMap).map(([board, boardParts]) => {
            const mergedRows = getMergedPartsByBoard(boardParts, settings);
            let totalBoardPieces = 0;
            let totalBoardArea = 0;

            mergedRows.forEach((r) => {
              totalBoardPieces += r.q;
              totalBoardArea += (r.q * r.l * r.w) / 1e6;
            });

            const sheetAreaM2 = (SL * SW) / 1e6;
            const wasteFactor = 1 + (settings.ws || 0) / 100;
            const sheetsExact = (totalBoardArea * wasteFactor) / sheetAreaM2;
            const sheetsNeeded = Math.ceil(sheetsExact);

            return (
              <div
                key={board}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Board: {board}</span>
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    {totalBoardPieces} pieces total
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2.5 px-3">Width × Length (mm)</th>
                        <th className="py-2.5 px-3 text-right">Qty</th>
                        <th className="py-2.5 px-3">Used For (Unit: Part × Qty)</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {mergedRows.map((row) => {
                        const key = `${row.w}x${row.l}`;
                        const exceeds = isOverSheet(row.w, row.l, SL, SW);

                        return (
                          <tr
                            key={key}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition"
                          >
                            <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {row.w} × {row.l}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                              {row.q}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-medium">
                              {formatTagBreakdown(row.tags)}
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
                                onClick={() => onDeleteMergedBoardSize(board, key)}
                                className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Subtotal Footer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between text-xs font-mono gap-4">
                  <div>
                    Total Pieces:{' '}
                    <strong className="text-slate-900 dark:text-slate-100 text-sm">
                      {totalBoardPieces}
                    </strong>
                  </div>
                  <div>
                    Net Area:{' '}
                    <strong className="text-slate-900 dark:text-slate-100">
                      {totalBoardArea.toFixed(2)} m²
                    </strong>
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                    Sheets Needed (+{settings.ws}% waste):{' '}
                    <span className="text-base font-black">{sheetsNeeded}</span>{' '}
                    <span className="text-[11px] text-slate-500 font-normal">
                      ({sheetsExact.toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sheet Consumption Summary Table (Appears across views) */}
      {consumption.length > 0 && viewMode !== 'nesting' && (
        <div className="mt-8 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Sheet Consumption Summary ({isFilteredUnit ? `Unit: ${selectedUnitFilter}` : 'All Units'}) &mdash; Stock: {settings.sl} × {settings.sw} mm (+{settings.ws}% Waste)
              </span>
            </h3>
            {isFilteredUnit && (
              <button
                onClick={() => onSelectUnitFilter('all')}
                className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800"
              >
                View All Units Consumption
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 dark:bg-slate-850 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Board Material</th>
                  <th className="py-2.5 px-3 text-right">Pieces</th>
                  <th className="py-2.5 px-3 text-right">Total Net Area (m²)</th>
                  <th className="py-2.5 px-3 text-right">Sheets Needed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {consumption.map((item) => (
                  <tr
                    key={item.board}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition"
                  >
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-slate-100">
                      {item.board}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-700 dark:text-slate-300">
                      {item.pieces}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                      {item.totalArea.toFixed(2)} m²
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 dark:text-emerald-400 font-black text-sm">
                      {item.sheetsNeeded}{' '}
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({item.sheetsExact.toFixed(2)})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
