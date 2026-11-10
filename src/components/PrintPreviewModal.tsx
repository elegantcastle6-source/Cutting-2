/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Customer, AppSettings } from '../types/cutting';
import { PrintReportView } from './PrintReportView';
import { Printer, X, Check, FileText, CheckCircle2 } from 'lucide-react';

interface PrintPreviewModalProps {
  customer: Customer;
  settings: AppSettings;
  viewMode: 'unit' | 'board' | 'nesting';
  selectedUnitFilter: string;
  printScope: 'current' | 'all';
  onChangePrintScope: (scope: 'current' | 'all') => void;
  printFontSize: number;
  onChangePrintFontSize: (size: number) => void;
  printLayout: 'standard' | 'right-first' | 'split' | 'full';
  onChangePrintLayout: (layout: 'standard' | 'right-first' | 'split' | 'full') => void;
  fitSinglePage?: boolean;
  onChangeFitSinglePage?: (fit: boolean) => void;
  onClose: () => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  customer,
  settings,
  viewMode,
  selectedUnitFilter,
  printScope,
  onChangePrintScope,
  printFontSize,
  onChangePrintFontSize,
  printLayout,
  onChangePrintLayout,
  fitSinglePage = true,
  onChangeFitSinglePage,
  onClose,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const activeUnitName =
    selectedUnitFilter && selectedUnitFilter !== 'all'
      ? selectedUnitFilter
      : customer.unit || 'Current Unit';

  const handlePrint = () => {
    window.print();
  };

  const isFullDown = printLayout !== 'split' && printLayout !== 'right-first';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex flex-col justify-between overflow-hidden">
      {/* Top Floating Control Bar */}
      <header className="bg-slate-900 border-b border-slate-700 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-md z-20">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h2 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span>A4 Print Preview</span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Fit Single Page</span>
            </span>
          </h2>
        </div>

        {/* Live Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Fit Single Page Mode Toggle */}
          {onChangeFitSinglePage && (
            <button
              type="button"
              onClick={() => onChangeFitSinglePage(!fitSinglePage)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                fitSinglePage
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
              title="Compact spacing and row heights to fit entirely on a single A4 page"
            >
              <span>📄 Fit 1 Page:</span>
              <span className="font-black">{fitSinglePage ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Unit Layout Selector: All The Way Down (Not Split) vs 2 Columns */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => onChangePrintLayout('standard')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1 ${
                isFullDown
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Unit cutting list runs all the way down in one continuous full-width table"
            >
              <span>⬇️ All The Way Down (Not Split)</span>
            </button>
            <button
              type="button"
              onClick={() => onChangePrintLayout('split')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center gap-1 ${
                !isFullDown
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Split unit into 2 columns (left and right)"
            >
              <span>↔️ 2 Columns</span>
            </button>
          </div>

          {/* Live Font Size Controls */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase px-1.5">
              Font:
            </span>
            {[9, 10, 11, 12, 13].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChangePrintFontSize(size)}
                className={`px-2 py-0.5 text-xs font-bold rounded transition cursor-pointer ${
                  printFontSize === size
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
                title={`Set print table font size to ${size}px`}
              >
                {size}px
              </button>
            ))}
          </div>

          {/* Scope Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <span className="text-[11px] font-bold text-slate-400 uppercase px-1.5">
              Scope:
            </span>
            <button
              type="button"
              onClick={() => onChangePrintScope('current')}
              className={`px-2 py-0.5 text-xs font-bold rounded transition cursor-pointer ${
                printScope === 'current'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
              title={`Print only the current unit: ${activeUnitName}`}
            >
              Current Unit ({activeUnitName})
            </button>
            <button
              type="button"
              onClick={() => onChangePrintScope('all')}
              className={`px-2 py-0.5 text-xs font-bold rounded transition cursor-pointer ${
                printScope === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
              title="Print all units in customer order"
            >
              All Units
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            title="Open browser print dialog (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Now</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Preview Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-slate-900/60">
        <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-4 sm:p-6 rounded-sm shadow-2xl border border-slate-400 my-auto">
          <PrintReportView
            customer={customer}
            settings={settings}
            viewMode={viewMode}
            selectedUnitFilter={selectedUnitFilter}
            printScope={printScope}
            printFontSize={printFontSize}
            printLayout={printLayout}
            fitSinglePage={fitSinglePage}
            isPreviewMode={true}
          />
        </div>
      </div>

      {/* Bottom Status / Hint Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            <b>Unit All The Way Down (Not Split)</b> &bull; Font size: <b>{printFontSize}px</b> &bull; Scope: <b>{printScope === 'current' ? `Unit: ${activeUnitName}` : 'All Units'}</b>
          </span>
        </span>
        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Fitted to single A4 sheet without spilling over.</span>
        </span>
      </footer>
    </div>
  );
};
