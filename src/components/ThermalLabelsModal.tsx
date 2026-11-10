/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Customer } from '../types/cutting';
import { Tag, Printer, X, Eye, FileText } from 'lucide-react';

interface ThermalLabelsModalProps {
  customer: Customer;
  onClose: () => void;
}

export const ThermalLabelsModal: React.FC<ThermalLabelsModalProps> = ({
  customer,
  onClose,
}) => {
  const [size, setSize] = useState('60x40');
  const [scope, setScope] = useState<'cur' | 'all'>('cur');

  const [labelW, labelH] = size.split('x').map(Number);

  const unitsToPrint = scope === 'all' ? customer.units : [customer.unit];

  // Generate unrolled sticker pieces
  const stickers: {
    unit: string;
    partName: string;
    board: string;
    w: number;
    l: number;
    index: number;
    total: number;
    pColor?: string;
  }[] = [];

  unitsToPrint.forEach((unitName) => {
    customer.parts
      .filter((p) => p.u === unitName && p.q > 0)
      .forEach((part) => {
        for (let i = 1; i <= part.q; i++) {
          stickers.push({
            unit: unitName,
            partName: part.p,
            board: part.b,
            w: part.w,
            l: part.l,
            index: i,
            total: part.q,
            pColor: part.pColor,
          });
        }
      });
  });

  const handlePrint = () => {
    if (!stickers.length) {
      alert('No parts to print stickers for.');
      return;
    }

    // Create dynamic print container
    const oldContainer = document.getElementById('thermal-print-container');
    if (oldContainer) oldContainer.remove();

    const oldStyle = document.getElementById('thermal-print-style');
    if (oldStyle) oldStyle.remove();

    const styleEl = document.createElement('style');
    styleEl.id = 'thermal-print-style';
    styleEl.innerHTML = `
      @media print {
        @page {
          size: ${labelW}mm ${labelH}mm;
          margin: 0;
        }
        body * {
          visibility: hidden !important;
        }
        #thermal-print-container, #thermal-print-container * {
          visibility: visible !important;
        }
        #thermal-print-container {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
        }
        .thermal-label-page {
          width: ${labelW}mm !important;
          height: ${labelH}mm !important;
          padding: 2mm 3mm !important;
          box-sizing: border-box !important;
          page-break-after: always !important;
          break-after: page !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          font-family: Arial, -apple-system, sans-serif !important;
          color: #000 !important;
          background: #fff !important;
        }
      }
    `;
    document.head.appendChild(styleEl);

    const container = document.createElement('div');
    container.id = 'thermal-print-container';

    stickers.forEach((s) => {
      const page = document.createElement('div');
      page.className = 'thermal-label-page';
      page.innerHTML = `
        <div style="display:flex;justify-content:space-between;font-size:8pt;font-weight:bold;border-bottom:0.5pt solid #888;padding-bottom:1mm;">
          <span style="${customer.codeColor ? `background:${customer.codeColor};color:#0f172a;padding:1px 5px;border-radius:2px;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-weight:bold;` : ''}">${customer.code || '-'}</span>
          <span style="font-size:8.5pt;">${customer.name || 'Workshop'}</span>
        </div>
        <div style="margin-top:1.5mm;font-size:10pt;font-weight:900;line-height:1.2;">
          ${s.unit} &mdash; ${s.partName}
        </div>
        <div style="font-size:14pt;font-weight:900;font-family:monospace;margin:1.5mm 0;letter-spacing:0.5px;">
          ${s.w} &times; ${s.l} mm
        </div>
        <div style="display:flex;justify-content:space-between;font-size:8pt;border-top:0.5pt solid #888;padding-top:1mm;">
          <span style="font-weight:600;">${s.board}</span>
          <span style="font-weight:bold;font-family:monospace;">${s.index}/${s.total}</span>
        </div>
      `;
      container.appendChild(page);
    });

    document.body.appendChild(container);

    const cleanup = () => {
      styleEl.remove();
      container.remove();
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Thermal Sticker &amp; Part Label Printer
              </h3>
              <p className="text-xs text-slate-500">
                Print barcode/label stickers for panel saw, edgebander, and assembly tagging.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-1">
                Sticker Size
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="60x40">60 × 40 mm (Standard)</option>
                <option value="50x30">50 × 30 mm (Compact)</option>
                <option value="80x50">80 × 50 mm (Medium)</option>
                <option value="100x50">100 × 50 mm (Wide)</option>
                <option value="100x75">100 × 75 mm (Large)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-1">
                Print Scope
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as 'cur' | 'all')}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="cur">Current Unit ({customer.unit})</option>
                <option value="all">All Units ({customer.units.length} units)</option>
              </select>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Total Labels to Print:{' '}
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                {stickers.length} stickers
              </span>
            </div>
          </div>
        </div>

        {/* Live Label Preview Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
            <Eye className="w-3.5 h-3.5" />
            <span>Live Sticker Preview ({size} mm)</span>
          </div>

          {stickers.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No parts found in the selected scope.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {stickers.slice(0, 12).map((s, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-slate-300 rounded-lg p-3 shadow-xs text-slate-900 flex flex-col justify-between font-sans relative aspect-[3/2] select-none"
                >
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold border-b border-slate-200 pb-1">
                    <span
                      style={
                        customer.codeColor
                          ? { backgroundColor: customer.codeColor, padding: '1px 5px', borderRadius: '3px' }
                          : undefined
                      }
                      className="text-emerald-800"
                    >
                      {customer.code || '-'}
                    </span>
                    <span className="truncate max-w-[120px]">{customer.name || 'Workshop'}</span>
                  </div>

                  <div className="my-1">
                    <div className="text-[11px] font-extrabold line-clamp-1">
                      {s.unit} &mdash; {s.partName}
                    </div>
                    <div className="text-sm font-black font-mono tracking-tight text-slate-950">
                      {s.w} × {s.l} mm
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] border-t border-slate-200 pt-1 font-semibold text-slate-600">
                    <span className="truncate max-w-[110px]">{s.board}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {s.index}/{s.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {stickers.length > 12 && (
            <div className="text-center mt-3 text-xs text-slate-500 italic">
              Showing first 12 of {stickers.length} stickers... All {stickers.length} will print when you send to printer.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Supports Zebra, Dymo, Xprinter, TSC, and all standard thermal label printers.
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handlePrint}
              disabled={stickers.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition shadow-md shadow-emerald-900/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print {stickers.length} Stickers</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
