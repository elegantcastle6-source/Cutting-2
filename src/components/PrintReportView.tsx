/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Customer, AppSettings, Part } from '../types/cutting';
import {
  calculateSheetConsumption,
  getMergedPartsByBoard,
  formatTagBreakdown,
  sortPartsInCarpentrySequence,
} from '../utils/calculator';

interface PrintReportViewProps {
  customer: Customer;
  settings: AppSettings;
  viewMode: 'unit' | 'board' | 'nesting';
  printFontSize?: number;
  printLayout?: 'right-first' | 'standard';
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  customer,
  settings,
  viewMode,
  printFontSize = 11,
  printLayout = 'right-first',
}) => {
  const parts = customer.parts || [];
  const consumption = calculateSheetConsumption(parts, settings);

  const usedUnits = customer.units.filter((u) => parts.some((p) => p.u === u));
  const singleUnitTitle = usedUnits.length === 1 ? usedUnits[0] : '';

  const boardsMap: Record<string, Part[]> = {};
  parts.forEach((p) => {
    if (!boardsMap[p.b]) boardsMap[p.b] = [];
    boardsMap[p.b].push(p);
  });

  const cellPad = printFontSize <= 9 ? 'px-1 py-0.5' : printFontSize <= 11 ? 'px-1.5 py-1' : 'px-2 py-1.5';
  const headerPad = printFontSize <= 9 ? 'px-1 py-0.5' : 'px-1.5 py-1';
  const headerFontSize = `${Math.max(8, printFontSize - 1)}px`;
  const bodyFontSize = `${printFontSize}px`;

  return (
    <div className="hidden print:block text-black bg-white p-0 font-sans" style={{ fontSize: bodyFontSize }}>
      {/* Official Workshop Document Header */}
      <div className="border-b-2 border-black pb-2 mb-3">
        <div className="flex justify-between items-baseline font-bold text-xs">
          <span>
            Cust code:{' '}
            <span
              style={
                customer.codeColor
                  ? {
                      backgroundColor: customer.codeColor,
                      color: '#0f172a',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                      display: 'inline-block',
                    }
                  : undefined
              }
            >
              {customer.code || '-'}
            </span>
            {customer.notes ? ` · Notes: ${customer.notes}` : ''}
          </span>
          <span className="text-xl font-extrabold text-center tracking-tight">
            {customer.name || 'Untitled Customer'}
          </span>
          <span className="text-sm font-bold text-right">{singleUnitTitle}</span>
        </div>

        <div className="flex justify-between items-baseline mt-1 text-xs font-semibold text-gray-700">
          <span>{settings.co || 'CARPENTRY WORKSHOP'}</span>
          <span>Date: {customer.date}</span>
        </div>
      </div>

      {/* Parts Output */}
      {viewMode !== 'board' ? (
        /* PRINT BY UNIT - 2 COLUMNS FIT FOR A4 */
        <div className="space-y-3">
          {customer.units.map((unitName) => {
            const unitParts = parts.filter((p) => p.u === unitName);
            if (!unitParts.length) return null;

            const unitBoards: Record<string, Part[]> = {};
            unitParts.forEach((p) => {
              if (!unitBoards[p.b]) unitBoards[p.b] = [];
              unitBoards[p.b].push(p);
            });

            return Object.entries(unitBoards).map(([board, rawBParts]) => {
              const bParts = sortPartsInCarpentrySequence(rawBParts);
              const pcs = bParts.reduce((acc, p) => acc + p.q, 0);

              const shouldSplit = bParts.length > 2;
              const half = shouldSplit ? Math.ceil(bParts.length / 2) : bParts.length;
              const col1 = bParts.slice(0, half);
              const col2 = shouldSplit ? bParts.slice(half) : [];

              const renderUnitTable = (items: Part[]) => (
                <table className="w-full border-collapse border border-gray-400" style={{ fontSize: bodyFontSize }}>
                  <thead>
                    <tr
                      className="bg-gray-100 border-b border-gray-400 text-left font-bold"
                      style={{ fontSize: headerFontSize }}
                    >
                      <th className={`border border-gray-400 ${headerPad}`}>Part Name</th>
                      <th className={`border border-gray-400 ${headerPad} text-right`}>Width (mm)</th>
                      <th className={`border border-gray-400 ${headerPad} text-right`}>Length (mm)</th>
                      <th className={`border border-gray-400 ${headerPad} text-right`}>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p, idx) => (
                      <tr key={idx} className="border-b border-gray-300">
                        <td className={`border border-gray-400 ${cellPad} font-semibold leading-tight`}>
                          {p.p}
                        </td>
                        <td className={`border border-gray-400 ${cellPad} text-right font-mono font-bold`}>
                          {p.w}
                        </td>
                        <td className={`border border-gray-400 ${cellPad} text-right font-mono font-bold`}>
                          {p.l}
                        </td>
                        <td className={`border border-gray-400 ${cellPad} text-right font-mono font-black`}>
                          {p.q}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );

              return (
                <div key={`${unitName}-${board}`} className="mb-3 break-inside-avoid">
                  <div className="bg-gray-100 border border-gray-400 px-2 py-1 flex justify-between items-center text-xs font-bold mb-1">
                    <span>
                      Unit: {unitName} &mdash; Board: {board}
                    </span>
                    <span>({pcs} pcs)</span>
                  </div>

                  {/* 2-Column Grid: If right-first, col1 is placed on the Right and col2 on the Left */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      {printLayout === 'right-first'
                        ? col2.length > 0 ? renderUnitTable(col2) : null
                        : renderUnitTable(col1)}
                    </div>
                    <div>
                      {printLayout === 'right-first'
                        ? renderUnitTable(col1)
                        : col2.length > 0 ? renderUnitTable(col2) : null}
                    </div>
                  </div>
                </div>
              );
            });
          })}
        </div>
      ) : (
        /* PRINT BY BOARD (MASTER CUTTING LIST) - 2 COLUMNS FIT FOR A4 */
        <div className="space-y-3">
          {Object.entries(boardsMap).map(([board, bParts]) => {
            const merged = getMergedPartsByBoard(bParts, settings);
            let pcs = 0;
            let area = 0;

            merged.forEach((r) => {
              pcs += r.q;
              area += (r.q * r.l * r.w) / 1e6;
            });

            const sheetAreaM2 = (settings.sl * settings.sw) / 1e6;
            const wasteFactor = 1 + (settings.ws || 0) / 100;
            const sheetsNeeded = Math.ceil((area * wasteFactor) / sheetAreaM2);

            const shouldSplit = merged.length > 2;
            const half = shouldSplit ? Math.ceil(merged.length / 2) : merged.length;
            const col1 = merged.slice(0, half);
            const col2 = shouldSplit ? merged.slice(half) : [];

            const renderBoardTable = (items: typeof merged) => (
              <table className="w-full border-collapse border border-gray-400" style={{ fontSize: bodyFontSize }}>
                <thead>
                  <tr
                    className="bg-gray-100 border-b border-gray-400 text-left font-bold"
                    style={{ fontSize: headerFontSize }}
                  >
                    <th className={`border border-gray-400 ${headerPad}`}>Width × Length (mm)</th>
                    <th className={`border border-gray-400 ${headerPad} text-right`}>Qty</th>
                    <th className={`border border-gray-400 ${headerPad}`}>Used For</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, idx) => (
                    <tr key={idx} className="border-b border-gray-300">
                      <td className={`border border-gray-400 ${cellPad} font-mono font-bold whitespace-nowrap`}>
                        {r.w} × {r.l}
                      </td>
                      <td className={`border border-gray-400 ${cellPad} text-right font-mono font-black`}>
                        {r.q}
                      </td>
                      <td className={`border border-gray-400 ${cellPad} text-[10px] leading-tight text-gray-700`}>
                        {formatTagBreakdown(r.tags)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );

            return (
              <div key={board} className="mb-3 break-inside-avoid">
                <div className="bg-gray-100 border border-gray-400 px-2 py-1 flex justify-between items-center text-xs font-bold mb-1">
                  <span>Board: {board}</span>
                  <span>{pcs} pieces</span>
                </div>

                {/* 2-Column Grid: If right-first, col1 is placed on the Right and col2 on the Left */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    {printLayout === 'right-first'
                      ? col2.length > 0 ? renderBoardTable(col2) : null
                      : renderBoardTable(col1)}
                  </div>
                  <div>
                    {printLayout === 'right-first'
                      ? renderBoardTable(col1)
                      : col2.length > 0 ? renderBoardTable(col2) : null}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-400 mt-1 px-2 py-1 flex justify-between text-xs font-mono font-bold">
                  <span>Total Pieces: {pcs}</span>
                  <span>Net Area: {area.toFixed(2)} m²</span>
                  <span>
                    Sheets Needed (+{settings.ws}% waste): {sheetsNeeded}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sheet Consumption Summary Table */}
      {consumption.length > 0 && (
        <div className="mt-4 border border-gray-400 break-inside-avoid">
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-1 text-xs font-bold">
            Sheet Consumption Summary (All Units) &mdash; Stock: {settings.sl} × {settings.sw} mm (+{settings.ws}% Waste)
          </div>
          <table className="w-full border-collapse" style={{ fontSize: bodyFontSize }}>
            <thead>
              <tr className="bg-gray-50 border-b border-gray-400 text-left font-bold" style={{ fontSize: headerFontSize }}>
                <th className={`border border-gray-400 ${headerPad}`}>Board Material</th>
                <th className={`border border-gray-400 ${headerPad} text-right`}>Pieces</th>
                <th className={`border border-gray-400 ${headerPad} text-right`}>Total Net Area (m²)</th>
                <th className={`border border-gray-400 ${headerPad} text-right`}>Sheets Needed</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {consumption.map((item) => (
                <tr key={item.board} className="border-b border-gray-300">
                  <td className={`border border-gray-400 ${cellPad} font-sans font-bold`}>{item.board}</td>
                  <td className={`border border-gray-400 ${cellPad} text-right font-bold`}>{item.pieces}</td>
                  <td className={`border border-gray-400 ${cellPad} text-right`}>{item.totalArea.toFixed(2)} m²</td>
                  <td className={`border border-gray-400 ${cellPad} text-right font-black`}>
                    {item.sheetsNeeded} ({item.sheetsExact.toFixed(2)})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
