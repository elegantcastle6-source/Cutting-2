/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Customer, AppSettings } from '../types/cutting';
import { computeSheetNesting } from '../utils/nesting';
import {
  Maximize,
  RotateCw,
  Layers,
  Sparkles,
  Info,
  Printer,
} from 'lucide-react';

interface SheetNestingViewProps {
  customer: Customer;
  settings: AppSettings;
}

// Visual color palette for distinct parts on sheets
const PART_COLORS = [
  '#ecfdf5', // emerald-50
  '#f0fdf4', // green-50
  '#eff6ff', // blue-50
  '#f5f3ff', // purple-50
  '#fdf2f8', // pink-50
  '#fff7ed', // orange-50
  '#fefce8', // yellow-50
  '#f0fdfa', // teal-50
];

const BORDER_COLORS = [
  '#059669', // emerald-600
  '#16a34a', // green-600
  '#2563eb', // blue-600
  '#7c3aed', // purple-600
  '#db2777', // pink-600
  '#ea580c', // orange-600
  '#ca8a04', // yellow-600
  '#0d9488', // teal-600
];

export const SheetNestingView: React.FC<SheetNestingViewProps> = ({
  customer,
  settings,
}) => {
  // Compute nested sheets
  const nestingData = useMemo(() => {
    return computeSheetNesting(
      customer.parts,
      settings.sw || 1220,
      settings.sl || 2440,
      4 // standard 4mm saw kerf
    );
  }, [customer.parts, settings.sl, settings.sw]);

  const boards = Object.keys(nestingData);
  const [selectedBoard, setSelectedBoard] = useState<string>(boards[0] || '');

  // Keep selected board valid
  const currentBoard = boards.includes(selectedBoard) ? selectedBoard : boards[0] || '';
  const sheets = nestingData[currentBoard] || [];

  if (!customer.parts.length) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
        No parts added yet. Add single parts or use the Parametric Cabinet Calculator to visualize sheet cutting diagrams.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mr-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Board Material:
          </span>
          {boards.map((b) => {
            const count = (nestingData[b] || []).length;
            const isSelected = b === currentBoard;

            return (
              <button
                key={b}
                onClick={() => setSelectedBoard(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{b}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/15">
                  {count} {count === 1 ? 'Sheet' : 'Sheets'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="font-mono">
            Sheet Stock: {settings.sl} × {settings.sw} mm
          </span>
          <span>·</span>
          <span className="font-mono">Saw Kerf: 4mm</span>
        </div>
      </div>

      {/* Sheets Grid */}
      <div className="space-y-6">
        {sheets.map((sheet) => {
          // Scale dimensions for SVG canvas
          // We display the sheet horizontally (Length = 2440mm on X, Width = 1220mm on Y)
          const svgW = settings.sl;
          const svgH = settings.sw;

          return (
            <div
              key={sheet.sheetIndex}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm"
            >
              {/* Sheet Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center font-mono">
                    #{sheet.sheetIndex}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                      Sheet {sheet.sheetIndex} of {sheets.length} &mdash; {sheet.board}
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Stock: {settings.sl} × {settings.sw} mm ({sheet.totalArea.toFixed(2)} m²) · Used:{' '}
                      {sheet.usedArea.toFixed(2)} m²
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Utilization Meter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Yield:</span>
                    <div className="w-24 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, sheet.utilizationPercent)}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                      {sheet.utilizationPercent.toFixed(1)}%
                    </span>
                  </div>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {sheet.placements.length} cuts
                  </span>
                </div>
              </div>

              {/* 2D Interactive Cutting Canvas */}
              <div className="border border-slate-300 dark:border-slate-700 rounded-lg p-3 bg-slate-950 overflow-x-auto shadow-inner">
                <div className="min-w-[700px]">
                  <svg
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    className="w-full h-auto bg-slate-900 border-2 border-emerald-500/50 rounded shadow-md"
                    style={{ aspectRatio: `${svgW} / ${svgH}` }}
                  >
                    {/* Background Grid Pattern */}
                    <defs>
                      <pattern
                        id={`grid-${sheet.sheetIndex}`}
                        width="100"
                        height="100"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 100 0 L 0 0 0 100"
                          fill="none"
                          stroke="rgba(255,255,255,0.04)"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width={svgW} height={svgH} fill={`url(#grid-${sheet.sheetIndex})`} />

                    {/* Placed Pieces */}
                    {sheet.placements.map((p, idx) => {
                      // Swap x and y if length is rendered on X axis
                      const rectX = p.y;
                      const rectY = p.x;
                      const rectW = p.h;
                      const rectH = p.w;

                      const colorIdx = idx % PART_COLORS.length;
                      const fillColor = PART_COLORS[colorIdx];
                      const strokeColor = BORDER_COLORS[colorIdx];

                      return (
                        <g key={p.id} className="cursor-pointer group">
                          {/* Part Rectangle */}
                          <rect
                            x={rectX}
                            y={rectY}
                            width={rectW}
                            height={rectH}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth="3"
                            rx="4"
                            className="transition-opacity group-hover:opacity-90"
                          />

                          {/* Dimensions & Labels (Scaled SVG Text) */}
                          {rectW > 120 && rectH > 60 && (
                            <>
                              <text
                                x={rectX + rectW / 2}
                                y={rectY + rectH / 2 - 8}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#0f172a"
                                fontSize={Math.min(26, Math.max(14, rectH / 6))}
                                fontWeight="800"
                                fontFamily="system-ui, sans-serif"
                              >
                                {p.partName}
                              </text>

                              <text
                                x={rectX + rectW / 2}
                                y={rectY + rectH / 2 + 14}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#334155"
                                fontSize={Math.min(22, Math.max(12, rectH / 7))}
                                fontWeight="700"
                                fontFamily="ui-monospace, monospace"
                              >
                                {p.w} × {p.h} mm
                              </text>

                              <text
                                x={rectX + 12}
                                y={rectY + 18}
                                fill="#059669"
                                fontSize="12"
                                fontWeight="800"
                                fontFamily="system-ui, sans-serif"
                              >
                                {p.unit} ({p.itemNumber}/{p.totalQuantity})
                              </text>
                            </>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Placements breakdown list */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-[11px]">
                {sheet.placements.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex flex-col justify-between"
                  >
                    <div className="font-bold text-slate-800 dark:text-slate-100 truncate">
                      {p.partName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {p.unit}
                    </div>
                    <div className="font-mono text-emerald-700 dark:text-emerald-400 font-extrabold mt-1">
                      {p.w} × {p.h} mm
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
