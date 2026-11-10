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
  isOverSheet,
} from '../utils/calculator';

interface PrintReportViewProps {
  customer: Customer;
  settings: AppSettings;
  viewMode: 'unit' | 'board' | 'nesting';
  selectedUnitFilter?: string;
  printScope?: 'current' | 'all';
  printFontSize?: number;
  printLayout?: 'standard' | 'right-first' | 'split' | 'full';
  fitSinglePage?: boolean;
  isPreviewMode?: boolean;
}

export const PrintReportView: React.FC<PrintReportViewProps> = ({
  customer,
  settings,
  viewMode,
  selectedUnitFilter = 'all',
  printScope = 'current',
  printFontSize = 11,
  printLayout = 'standard',
  fitSinglePage = true,
  isPreviewMode = false,
}) => {
  const allParts = customer.parts || [];

  // Determine whether we are printing just one unit or all units
  const isPrintingSingleUnit =
    printScope === 'current' &&
    selectedUnitFilter &&
    selectedUnitFilter !== 'all' &&
    customer.units.includes(selectedUnitFilter);

  const unitsToRender = isPrintingSingleUnit
    ? [selectedUnitFilter]
    : customer.units.filter((u) => allParts.some((p) => p.u === u));

  // If a single unit is being rendered, filter parts to that unit
  const activeParts = isPrintingSingleUnit
    ? allParts.filter((p) => p.u === selectedUnitFilter)
    : allParts;

  const consumption = calculateSheetConsumption(activeParts, settings);

  const usedUnits = customer.units.filter((u) => allParts.some((p) => p.u === u));
  const singleUnitTitle = isPrintingSingleUnit
    ? selectedUnitFilter
    : usedUnits.length === 1
    ? usedUnits[0]
    : '';

  // Group parts by board for board view
  const boardsMap: Record<string, Part[]> = {};
  activeParts.forEach((p) => {
    if (!boardsMap[p.b]) boardsMap[p.b] = [];
    boardsMap[p.b].push(p);
  });

  // Dynamic padding based on font size and single page fit option
  const cellPad = fitSinglePage
    ? printFontSize <= 10
      ? 'px-1.5 py-0.5'
      : 'px-2 py-0.5'
    : printFontSize <= 9
    ? 'px-1 py-0.5'
    : printFontSize <= 11
    ? 'px-1.5 py-1'
    : 'px-2 py-1.5';

  const headerPad = fitSinglePage
    ? 'px-1.5 py-0.5'
    : printFontSize <= 9
    ? 'px-1 py-0.5'
    : 'px-1.5 py-1';

  const headerFontSize = `${Math.max(8, printFontSize - 1)}px`;
  const bodyFontSize = `${printFontSize}px`;

  // Default is 'standard' / 'full' -> ALL THE WAY DOWN NOT SPLIT
  const isSplitLayout = printLayout === 'split' || printLayout === 'right-first';

  return (
    <div
      className={
        isPreviewMode
          ? `text-black bg-white ${
              fitSinglePage ? 'p-4 sm:p-5' : 'p-6'
            } font-sans w-full max-w-[210mm] mx-auto shadow-sm border border-slate-200 transition-all`
          : `hidden print:block text-black bg-white p-0 font-sans ${
              fitSinglePage && isPrintingSingleUnit ? 'print-single-page' : ''
            }`
      }
      style={{
        fontSize: bodyFontSize,
        // @ts-ignore
        '--print-font-size': bodyFontSize,
      }}
    >
      {/* Official Workshop Document Header */}
      <div
        className={`border-b-2 border-black ${
          fitSinglePage ? 'pb-1.5 mb-2' : 'pb-2 mb-3'
        }`}
      >
        <div className="grid grid-cols-3 items-baseline font-bold text-xs gap-2">
          <div>
            <span className="font-semibold text-gray-700">Cust Code: </span>
            <span
              style={
                customer.codeColor
                  ? {
                      backgroundColor: customer.codeColor,
                      color: '#0f172a',
                      padding: '1px 6px',
                      borderRadius: '3px',
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
          </div>

          <div
            className={`${
              fitSinglePage ? 'text-lg' : 'text-xl'
            } font-extrabold text-center tracking-tight leading-tight`}
          >
            {customer.name || 'Untitled Customer'}
          </div>

          <div className="text-sm font-bold text-right text-gray-800">
            {singleUnitTitle
              ? `Unit: ${singleUnitTitle}`
              : usedUnits.length > 1
              ? `Units: ${usedUnits.join(', ')}`
              : customer.unit
              ? `Unit: ${customer.unit}`
              : 'All Units'}
          </div>
        </div>

        <div className="flex justify-between items-baseline mt-0.5 text-xs font-semibold text-gray-700">
          <span>{settings.co || 'CARPENTRY WORKSHOP'}</span>
          <span>Date: {customer.date || new Date().toISOString().slice(0, 10)}</span>
        </div>

        {/* Customer Order Notes / Writing (Clearly displayed on dedicated row) */}
        {customer.notes && customer.notes.trim() && (
          <div className="mt-1 pt-0.5 border-t border-gray-300 text-xs text-gray-800 break-words leading-tight">
            <span className="font-extrabold uppercase text-[10px] text-gray-600 tracking-wider">
              Notes / Location:
            </span>{' '}
            <span className="font-bold">{customer.notes}</span>
          </div>
        )}

        {/* Board Specifications */}
        {(customer.mainBoard || customer.backBoard || customer.drawerBottomBoard) && (
          <div className="mt-0.5 flex flex-wrap gap-x-4 text-[10px] font-semibold text-gray-600 leading-tight">
            {customer.mainBoard && (
              <span>
                Main Board: <b className="text-black">{customer.mainBoard}</b>
              </span>
            )}
            {customer.backBoard && (
              <span>
                Back Board:{' '}
                <b className="text-black">
                  {customer.backBoard} ({customer.backType || '6'}mm)
                </b>
              </span>
            )}
            {customer.drawerBottomBoard && (
              <span>
                Drawer Bottom: <b className="text-black">{customer.drawerBottomBoard}</b>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Parts Output */}
      {viewMode !== 'board' ? (
        /* PRINT BY UNIT */
        <div className={fitSinglePage ? 'space-y-2.5' : 'space-y-4'}>
          {unitsToRender.map((unitName) => {
            const rawUnitParts = allParts.filter((p) => p.u === unitName);
            if (!rawUnitParts.length) return null;

            // Sort unit parts in standard carpentry sequence (Side Panels, Top, Bottom, Divider, Shelves, Back, Door, Drawers)
            const unitParts = sortPartsInCarpentrySequence(rawUnitParts);
            const totalPcs = unitParts.reduce((acc, p) => acc + p.q, 0);
            const totalAreaM2 = unitParts.reduce(
              (acc, p) => acc + (p.q * p.w * p.l) / 1e6,
              0
            );

            // If not split, render ALL THE WAY DOWN in full width:
            if (!isSplitLayout) {
              return (
                <div key={unitName} className="mb-2 break-inside-avoid">
                  {/* Unit Header Bar */}
                  <div className="bg-gray-100 border border-gray-400 px-2 py-0.5 flex justify-between items-center text-xs font-bold mb-1">
                    <span>
                      Unit: <span className="font-extrabold text-black">{unitName}</span>
                    </span>
                    <span className="font-mono">
                      {totalPcs} pieces ({totalAreaM2.toFixed(2)} m²)
                    </span>
                  </div>

                  {/* ALL THE WAY DOWN TABLE (Full Width, Not Split) */}
                  <table
                    className="w-full border-collapse border border-gray-400"
                    style={{ fontSize: bodyFontSize }}
                  >
                    <thead>
                      <tr
                        className="bg-gray-100 border-b border-gray-400 text-left font-bold"
                        style={{ fontSize: headerFontSize }}
                      >
                        <th
                          className={`border border-gray-400 ${headerPad} w-8 text-center`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          #
                        </th>
                        <th
                          className={`border border-gray-400 ${headerPad}`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          Part Name
                        </th>
                        <th
                          className={`border border-gray-400 ${headerPad}`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          Board / Material
                        </th>
                        <th
                          className={`border border-gray-400 ${headerPad} text-right w-20`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          Width (mm)
                        </th>
                        <th
                          className={`border border-gray-400 ${headerPad} text-right w-20`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          Length (mm)
                        </th>
                        <th
                          className={`border border-gray-400 ${headerPad} text-right w-12`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          Qty
                        </th>
                        <th
                          className={`border border-gray-400 ${headerPad} text-right w-16`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          Area (m²)
                        </th>
                        <th
                          className={`border border-gray-400 ${headerPad} text-center w-14`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {unitParts.map((p, idx) => {
                        const exceeds = isOverSheet(
                          p.w,
                          p.l,
                          settings.sl || 2440,
                          settings.sw || 1220
                        );
                        const pArea = (p.q * p.w * p.l) / 1e6;

                        return (
                          <tr key={p.id || idx} className="border-b border-gray-300">
                            <td
                              className={`border border-gray-400 ${cellPad} text-center font-mono text-gray-500`}
                              style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                            >
                              {idx + 1}
                            </td>
                            <td
                              className={`border border-gray-400 ${cellPad} font-semibold leading-tight`}
                              style={{
                                fontSize: bodyFontSize,
                                lineHeight: '1.25',
                                ...(p.pColor
                                  ? {
                                      backgroundColor: p.pColor,
                                      color: '#0f172a',
                                      WebkitPrintColorAdjust: 'exact',
                                      printColorAdjust: 'exact',
                                    }
                                  : {}),
                              }}
                            >
                              {p.p}
                            </td>
                            <td
                              className={`border border-gray-400 ${cellPad} text-gray-800 leading-tight`}
                              style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                            >
                              {p.b}
                            </td>
                            <td
                              className={`border border-gray-400 ${cellPad} text-right font-mono font-bold`}
                              style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                            >
                              {p.w}
                            </td>
                            <td
                              className={`border border-gray-400 ${cellPad} text-right font-mono font-bold`}
                              style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                            >
                              {p.l}
                            </td>
                            <td
                              className={`border border-gray-400 ${cellPad} text-right font-mono font-black`}
                              style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                            >
                              {p.q}
                            </td>
                            <td
                              className={`border border-gray-400 ${cellPad} text-right font-mono text-gray-600 text-[10px]`}
                              style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                            >
                              {pArea.toFixed(2)}
                            </td>
                            <td
                              className={`border border-gray-400 ${cellPad} text-center font-bold text-[10px]`}
                              style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                            >
                              {exceeds ? (
                                <span className="text-red-600 font-extrabold">OVER</span>
                              ) : (
                                <span className="text-emerald-700">OK</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-bold border-t border-gray-400">
                        <td
                          colSpan={5}
                          className={`border border-gray-400 ${cellPad} text-right`}
                          style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                        >
                          Unit Subtotal:
                        </td>
                        <td
                          className={`border border-gray-400 ${cellPad} text-right font-mono font-black`}
                          style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                        >
                          {totalPcs}
                        </td>
                        <td
                          className={`border border-gray-400 ${cellPad} text-right font-mono`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          {totalAreaM2.toFixed(2)} m²
                        </td>
                        <td className={`border border-gray-400 ${cellPad}`}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            }

            // Split 2-Columns layout (only when explicitly requested)
            const shouldSplit = unitParts.length > 2;
            const half = shouldSplit ? Math.ceil(unitParts.length / 2) : unitParts.length;
            const col1 = unitParts.slice(0, half);
            const col2 = shouldSplit ? unitParts.slice(half) : [];

            const leftCol = printLayout === 'right-first' ? (col2.length > 0 ? col2 : col1) : col1;
            const rightCol = printLayout === 'right-first' ? (col2.length > 0 ? col1 : []) : col2;

            const renderSplitTable = (items: Part[]) => (
              <table
                className="w-full border-collapse border border-gray-400"
                style={{ fontSize: bodyFontSize }}
              >
                <thead>
                  <tr
                    className="bg-gray-100 border-b border-gray-400 text-left font-bold"
                    style={{ fontSize: headerFontSize }}
                  >
                    <th
                      className={`border border-gray-400 ${headerPad}`}
                      style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                    >
                      Part Name
                    </th>
                    <th
                      className={`border border-gray-400 ${headerPad}`}
                      style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                    >
                      Board
                    </th>
                    <th
                      className={`border border-gray-400 ${headerPad} text-right`}
                      style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                    >
                      Width
                    </th>
                    <th
                      className={`border border-gray-400 ${headerPad} text-right`}
                      style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                    >
                      Length
                    </th>
                    <th
                      className={`border border-gray-400 ${headerPad} text-right`}
                      style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                    >
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p, idx) => (
                    <tr key={p.id || idx} className="border-b border-gray-300">
                      <td
                        className={`border border-gray-400 ${cellPad} font-semibold leading-tight`}
                        style={{
                          fontSize: bodyFontSize,
                          lineHeight: '1.25',
                          ...(p.pColor
                            ? {
                                backgroundColor: p.pColor,
                                color: '#0f172a',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact',
                              }
                            : {}),
                        }}
                      >
                        {p.p}
                      </td>
                      <td
                        className={`border border-gray-400 ${cellPad} text-gray-700 leading-tight truncate max-w-[90px]`}
                        style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                        title={p.b}
                      >
                        {p.b}
                      </td>
                      <td
                        className={`border border-gray-400 ${cellPad} text-right font-mono font-bold`}
                        style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                      >
                        {p.w}
                      </td>
                      <td
                        className={`border border-gray-400 ${cellPad} text-right font-mono font-bold`}
                        style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                      >
                        {p.l}
                      </td>
                      <td
                        className={`border border-gray-400 ${cellPad} text-right font-mono font-black`}
                        style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                      >
                        {p.q}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );

            return (
              <div key={unitName} className="mb-2 break-inside-avoid">
                <div className="bg-gray-100 border border-gray-400 px-2 py-0.5 flex justify-between items-center text-xs font-bold mb-1">
                  <span>
                    Unit: <span className="font-extrabold text-black">{unitName}</span>
                  </span>
                  <span>({totalPcs} pieces total)</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>{renderSplitTable(leftCol)}</div>
                  <div>{rightCol.length > 0 ? renderSplitTable(rightCol) : null}</div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* PRINT BY BOARD (MASTER CUTTING LIST) */
        <div className={fitSinglePage ? 'space-y-2' : 'space-y-3'}>
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

            return (
              <div key={board} className="mb-2 break-inside-avoid">
                <div className="bg-gray-100 border border-gray-400 px-2 py-0.5 flex justify-between items-center text-xs font-bold mb-1">
                  <span>
                    Board: <span className="font-extrabold text-black">{board}</span>
                  </span>
                  <span>{pcs} pieces</span>
                </div>

                <table
                  className="w-full border-collapse border border-gray-400"
                  style={{ fontSize: bodyFontSize }}
                >
                  <thead>
                    <tr
                      className="bg-gray-100 border-b border-gray-400 text-left font-bold"
                      style={{ fontSize: headerFontSize }}
                    >
                      <th
                        className={`border border-gray-400 ${headerPad} w-10 text-center`}
                        style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                      >
                        #
                      </th>
                      <th
                        className={`border border-gray-400 ${headerPad}`}
                        style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                      >
                        Width × Length (mm)
                      </th>
                      <th
                        className={`border border-gray-400 ${headerPad} text-right w-16`}
                        style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                      >
                        Qty
                      </th>
                      <th
                        className={`border border-gray-400 ${headerPad}`}
                        style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                      >
                        Used For (Unit: Part × Qty)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {merged.map((r, idx) => (
                      <tr key={idx} className="border-b border-gray-300">
                        <td
                          className={`border border-gray-400 ${cellPad} text-center font-mono text-gray-500`}
                          style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          className={`border border-gray-400 ${cellPad} font-mono font-bold whitespace-nowrap`}
                          style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                        >
                          {r.w} × {r.l}
                        </td>
                        <td
                          className={`border border-gray-400 ${cellPad} text-right font-mono font-black`}
                          style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                        >
                          {r.q}
                        </td>
                        <td
                          className={`border border-gray-400 ${cellPad} text-[10px] leading-tight text-gray-700`}
                          style={{
                            fontSize: `${Math.max(8, printFontSize - 1.5)}px`,
                            lineHeight: '1.2',
                          }}
                        >
                          {formatTagBreakdown(r.tags)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-gray-50 border border-gray-400 mt-0.5 px-2 py-0.5 flex justify-between text-xs font-mono font-bold">
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
        <div
          className={`border border-gray-400 break-inside-avoid ${
            fitSinglePage ? 'mt-2' : 'mt-4'
          }`}
        >
          <div className="bg-gray-100 border-b border-gray-400 px-2 py-0.5 text-xs font-bold flex justify-between items-center">
            <span>
              Sheet Consumption Summary (
              {isPrintingSingleUnit ? `Unit: ${selectedUnitFilter}` : 'All Units'}) &mdash; Stock:{' '}
              {settings.sl} × {settings.sw} mm (+{settings.ws}% Waste)
            </span>
            {fitSinglePage && (
              <span className="text-[10px] text-emerald-800 font-semibold uppercase">
                Fits On Single A4 Page
              </span>
            )}
          </div>
          <table className="w-full border-collapse" style={{ fontSize: bodyFontSize }}>
            <thead>
              <tr
                className="bg-gray-50 border-b border-gray-400 text-left font-bold"
                style={{ fontSize: headerFontSize }}
              >
                <th
                  className={`border border-gray-400 ${headerPad}`}
                  style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                >
                  Board Material
                </th>
                <th
                  className={`border border-gray-400 ${headerPad} text-right w-20`}
                  style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                >
                  Pieces
                </th>
                <th
                  className={`border border-gray-400 ${headerPad} text-right w-28`}
                  style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                >
                  Total Net Area (m²)
                </th>
                <th
                  className={`border border-gray-400 ${headerPad} text-right w-28`}
                  style={{ fontSize: headerFontSize, lineHeight: '1.25' }}
                >
                  Sheets Needed
                </th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {consumption.map((item) => (
                <tr key={item.board} className="border-b border-gray-300">
                  <td
                    className={`border border-gray-400 ${cellPad} font-sans font-bold`}
                    style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                  >
                    {item.board}
                  </td>
                  <td
                    className={`border border-gray-400 ${cellPad} text-right font-bold`}
                    style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                  >
                    {item.pieces}
                  </td>
                  <td
                    className={`border border-gray-400 ${cellPad} text-right`}
                    style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                  >
                    {item.totalArea.toFixed(2)} m²
                  </td>
                  <td
                    className={`border border-gray-400 ${cellPad} text-right font-black`}
                    style={{ fontSize: bodyFontSize, lineHeight: '1.25' }}
                  >
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
