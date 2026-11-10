/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppDatabase, Customer, AppSettings, Part } from '../types/cutting';
import { DEFAULT_PRESETS, getMergedPartsByBoard, formatTagBreakdown } from './calculator';

const STORAGE_KEY = 'cutting_list_pro_db_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  co: 'AL TASMEEM CARPENTRY',
  sl: 2440,
  sw: 1220,
  ws: 15,
  printFontSize: 11,
  printLayout: 'standard',
  presets: DEFAULT_PRESETS,
};

export const INITIAL_CUSTOMER: Customer = {
  id: 'c-init-1',
  code: 'C-104',
  name: 'Ahmed Al Mansoori',
  date: new Date().toISOString().slice(0, 10),
  notes: 'Master Bedroom, Hinged 2-Door Wardrobe',
  units: ['Cupboard 1', 'Dressing Table'],
  unit: 'Cupboard 1',
  mainBoard: 'Color 273 18mm',
  backBoard: 'Color 273 6mm',
  backType: '6',
  drawerBottomBoard: 'Color 273 6mm',
  drawerBottomType: '6',
  parts: [
    { id: 'p-1', b: 'Color 273 18mm', u: 'Cupboard 1', p: 'Side Panel', w: 580, l: 2100, q: 2 },
    { id: 'p-2', b: 'Color 273 18mm', u: 'Cupboard 1', p: 'Top', w: 554, l: 964, q: 1 },
    { id: 'p-3', b: 'Color 273 18mm', u: 'Cupboard 1', p: 'Bottom', w: 580, l: 964, q: 1 },
    { id: 'p-4', b: 'Color 273 18mm', u: 'Cupboard 1', p: 'Adjust Shelves', w: 544, l: 964, q: 3 },
    { id: 'p-5', b: 'Color 273 18mm', u: 'Cupboard 1', p: 'Door', w: 496, l: 2096, q: 2 },
    { id: 'p-6', b: 'Color 273 6mm', u: 'Cupboard 1', p: 'Back 6mm', w: 964, l: 2064, q: 1 },
    { id: 'p-7', b: 'Color 273 18mm', u: 'Dressing Table', p: 'Side Panel', w: 450, l: 750, q: 2 },
    { id: 'p-8', b: 'Color 273 18mm', u: 'Dressing Table', p: 'Top', w: 470, l: 1200, q: 1 },
    { id: 'p-9', b: 'Color 273 18mm', u: 'Dressing Table', p: 'Drawer sides', w: 140, l: 400, q: 4 },
  ],
};

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.customers) && parsed.customers.length > 0) {
        // Ensure data migration consistency
        parsed.customers.forEach((c: Customer) => {
          c.parts = c.parts || [];
          if (!Array.isArray(c.units) || c.units.length === 0) {
            c.units = [...new Set(c.parts.map((p) => p.u).filter(Boolean))];
            if (c.units.length === 0) c.units = ['Cupboard 1'];
          }
          if (!c.unit || !c.units.includes(c.unit)) {
            c.unit = c.units[0];
          }
          if (!c.mainBoard) c.mainBoard = 'Color 273 18mm';
          if (!c.backBoard) c.backBoard = 'Color 273 6mm';
          if (!c.backType) c.backType = '6';
          if (!c.drawerBottomBoard) c.drawerBottomBoard = c.backBoard || 'Color 273 6mm';
          if (!c.drawerBottomType) c.drawerBottomType = /18\s*mm/i.test(c.drawerBottomBoard) ? '18' : '6';
        });

        const loadedPresets = {
          ...DEFAULT_PRESETS,
          ...(parsed.set?.presets || {}),
        };
        delete (loadedPresets as any)['Drawer Unit'];
        if (loadedPresets['Cupboard']) {
          if (loadedPresets['Cupboard'].ctd_sub === undefined) loadedPresets['Cupboard'].ctd_sub = 0;
          if (loadedPresets['Cupboard'].cdfh === undefined) loadedPresets['Cupboard'].cdfh = 180;
          if (loadedPresets['Cupboard'].cbh === 10 || loadedPresets['Cupboard'].cbh === undefined) {
            loadedPresets['Cupboard'].cbh = 0;
          }
        }

        if (
          !loadedPresets['TV Unit'] ||
          loadedPresets['TV Unit'].clay !== 'side'
        ) {
          loadedPresets['TV Unit'] = { ...DEFAULT_PRESETS['TV Unit'] };
        } else {
          delete loadedPresets['TV Unit'].cdg;
          if (loadedPresets['TV Unit'].cside_sub === undefined) {
            loadedPresets['TV Unit'].cside_sub = 0;
          }
          if (loadedPresets['TV Unit'].cbot_sub === undefined) {
            loadedPresets['TV Unit'].cbot_sub = 36;
          }
          if (loadedPresets['TV Unit'].ctp === 20 || loadedPresets['TV Unit'].ctp === undefined) {
            loadedPresets['TV Unit'].ctp = 0;
          }
          if (loadedPresets['TV Unit'].ctl === undefined) {
            loadedPresets['TV Unit'].ctl = 0;
          }
        }

        if (
          !loadedPresets['Skirting Base unit'] ||
          loadedPresets['Skirting Base unit'].clay !== 'side'
        ) {
          loadedPresets['Skirting Base unit'] = { ...DEFAULT_PRESETS['Skirting Base unit'] };
        } else {
          delete loadedPresets['Skirting Base unit'].cdg;
          if (loadedPresets['Skirting Base unit'].cside_sub === undefined) {
            loadedPresets['Skirting Base unit'].cside_sub = 18;
          }
          if (loadedPresets['Skirting Base unit'].cbot_sub === undefined) {
            loadedPresets['Skirting Base unit'].cbot_sub = 36;
          }
        }

        parsed.set = {
          ...DEFAULT_SETTINGS,
          ...(parsed.set || {}),
          printFontSize: parsed.set?.printFontSize || 11,
          printLayout: parsed.set?.printLayout || 'standard',
          presets: loadedPresets,
        };

        if (!parsed.customers.some((c: Customer) => c.id === parsed.cur)) {
          parsed.cur = parsed.customers[0].id;
        }

        return parsed as AppDatabase;
      }
    }
  } catch (err) {
    console.error('Failed to load database from localStorage, initializing default:', err);
  }

  const initialDb: AppDatabase = {
    customers: [INITIAL_CUSTOMER],
    cur: INITIAL_CUSTOMER.id,
    set: DEFAULT_SETTINGS,
  };
  saveDatabase(initialDb);
  return initialDb;
}

export function saveDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateCsvExport(
  customer: Customer,
  viewMode: 'unit' | 'board',
  settings: AppSettings
): string {
  const escapeCsv = (str: string | number) => `"${String(str).replace(/"/g, '""')}"`;

  if (viewMode === 'unit') {
    let csv = 'Unit,Part Name,Board Material,Width (mm),Length (mm),Qty,Area (m2)\r\n';
    customer.parts.forEach((p) => {
      const area = ((p.w * p.l * p.q) / 1e6).toFixed(3);
      csv += [
        escapeCsv(p.u),
        escapeCsv(p.p),
        escapeCsv(p.b),
        p.w,
        p.l,
        p.q,
        area,
      ].join(',') + '\r\n';
    });
    return '\ufeff' + csv;
  }

  // Board View CSV
  let csv = 'Board Material,Width (mm),Length (mm),Qty,Used For,Exceeds Sheet\r\n';
  const boardsMap: Record<string, Part[]> = {};
  customer.parts.forEach((p) => {
    if (!boardsMap[p.b]) boardsMap[p.b] = [];
    boardsMap[p.b].push(p);
  });

  Object.entries(boardsMap).forEach(([board, parts]) => {
    const merged = getMergedPartsByBoard(parts, settings);
    merged.forEach((row) => {
      csv += [
        escapeCsv(board),
        row.w,
        row.l,
        row.q,
        escapeCsv(formatTagBreakdown(row.tags)),
        row.exceedsSheet ? 'EXCEEDS_STOCK' : 'OK',
      ].join(',') + '\r\n';
    });
  });

  return '\ufeff' + csv;
}

export function generateTextExport(
  customer: Customer,
  viewMode: 'unit' | 'board',
  settings: AppSettings
): string {
  let txt = `========================================================\n`;
  txt += `${settings.co || 'WORKSHOP CUTTING LIST'}\n`;
  txt += `Cust Code: ${customer.code || '-'} | Name: ${customer.name || 'Untitled'} | Date: ${customer.date}\n`;
  if (customer.notes) txt += `Notes: ${customer.notes}\n`;
  txt += `========================================================\n\n`;

  if (viewMode === 'unit') {
    customer.units.forEach((u) => {
      const unitParts = customer.parts.filter((p) => p.u === u);
      if (!unitParts.length) return;
      txt += `>>> UNIT: ${u} (${unitParts.reduce((acc, p) => acc + p.q, 0)} pcs)\n`;
      unitParts.forEach((p) => {
        txt += `  - ${p.p.padEnd(20)}: ${String(p.w).padStart(5)} × ${String(p.l).padStart(5)} mm  Qty: ${String(p.q).padStart(2)}  [${p.b}]\n`;
      });
      txt += '\n';
    });
  } else {
    const boardsMap: Record<string, Part[]> = {};
    customer.parts.forEach((p) => {
      if (!boardsMap[p.b]) boardsMap[p.b] = [];
      boardsMap[p.b].push(p);
    });

    Object.entries(boardsMap).forEach(([board, parts]) => {
      const merged = getMergedPartsByBoard(parts, settings);
      txt += `>>> BOARD: ${board}\n`;
      merged.forEach((r) => {
        txt += `  ${String(r.w).padStart(5)} × ${String(r.l).padStart(5)} mm  |  Qty: ${String(r.q).padStart(3)}  |  ${formatTagBreakdown(r.tags)}\n`;
      });
      txt += '\n';
    });
  }

  return txt;
}
