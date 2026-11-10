/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Part, PresetConfig, AppSettings, Customer, MergedPartRow } from '../types/cutting';

export const DEFAULT_PRESETS: Record<string, PresetConfig> = {
  'Cupboard': {
    cdy: 'no',
    cdxr: 36,
    cdmode: 'door',
    cdwr: 50,
    cfw: 4,
    clp: 0,
    cu: 'Cupboard',
    cw: 1000,
    ch: 2100,
    cd: 580,
    ct: 18,
    cdn: 2,
    cf: 0,
    cas: 3,
    cdr: 0,
    cds: '',
    cdsr: 100,
    cbt: '6',
    cbw: 0,
    cbh: 0,
    cdh: 140,
    csl: 26,
    cdlr: 30,
    cfr: 20,
    car: 36,
    cskr: 0,
    clay: 'stack',
    cn2: 1,
    ccn: 0,
    ctd_sub: 0,
    cdfh: 180,
  },
  'TV Unit': {
    clay: 'side',
    ctp: 0,
    cdv: 20,
    cfw: 5,
    clp: 0,
    cfh: 23,
    ctl: 0,
    cdls: 50,
    cdw: '',
    csp: undefined,
    cdy: 'yes',
    cu: 'TV Unit',
    cw: 1800,
    ch: 450,
    cd: 400,
    ct: 18,
    cdn: 0,
    cf: 0,
    cas: 0,
    cdr: 3,
    cds: '',
    cdsr: 20,
    cbt: '18',
    cbw: 0,
    cbh: 0,
    cdh: 140,
    csl: 26,
    cdlr: 30,
    cfr: 20,
    car: 40,
    cskr: 0,
    cn2: 1,
    cdbk: '6',
    cdb6w: 17,
    ctop: 'yes',
    cside_floor: 'no',
    cside_sub: 0,
    cbot_sub: 36,
  },
  'Skirting Base unit': {
    clay: 'side',
    ctp: 20,
    cdv: 20,
    cfw: 5,
    clp: 0,
    cfh: 23,
    ctl: 0,
    cdls: 50,
    cdw: '',
    csp: undefined,
    cdy: 'yes',
    cu: 'Skirting Base unit',
    cw: 1800,
    ch: 800,
    cd: 580,
    ct: 18,
    cdn: 2,
    cf: 0,
    cas: 0,
    cdr: 3,
    cds: '',
    cdsr: 20,
    cbt: '18',
    cbw: 0,
    cbh: 0,
    cdh: 140,
    csl: 26,
    cdlr: 30,
    cfr: 20,
    car: 40,
    cskr: 80,
    cn2: 1,
    cdbk: '6',
    cdb6w: 17,
    ctop: 'yes',
    cside_floor: 'yes',
    cside_sub: 18,
    cbot_sub: 36,
  },
};

/**
 * Splits a board string like "Color 273 18mm", "White 18mm", or "273 18mm"
 * into a structured Code & Thickness representation for clean, frozen display.
 */
export function parseBoardCodeAndThickness(board: string): { code: string; thickness: string } {
  if (!board) return { code: '273', thickness: '18mm' };
  const trimmed = board.trim();
  const match = trimmed.match(/^(.*?)(?:[_\s-]+)?(\d+(?:\.\d+)?\s*mm)$/i);
  if (match) {
    const rawCode = match[1].replace(/^(Color|Code)\s*/i, '').trim();
    return {
      code: rawCode || match[1].trim(),
      thickness: match[2].toLowerCase().replace(/\s+/g, ''),
    };
  }
  return { code: trimmed, thickness: '18mm' };
}

/**
 * Checks whether a given piece exceeds standard sheet length or width (allowing rotation).
 */
export function isOverSheet(w: number, l: number, sl = 2440, sw = 1220): boolean {
  return Math.max(w, l) > sl || Math.min(w, l) > sw;
}

/**
 * Splits tall pieces if they exceed the sheet length.
 */
export function splitLen(
  L: number,
  sl: number,
  fr: number[],
  manual: number,
  ref: number
): { a: number; b: number; shelf: boolean } {
  if (manual > 0 && ref > 0) {
    const a = Math.round((manual * L) / ref);
    if (a > 0 && a < L) return { a, b: Math.round(L) - a, shelf: true };
  }
  const c = fr
    .map((f) => f * L)
    .filter((x) => x <= sl && L - x <= sl)
    .sort((p, q) => Math.abs(p - L / 2) - Math.abs(q - L / 2));
  const a = Math.round(c.length ? c[0] : L / 2);
  return { a, b: Math.round(L) - a, shelf: c.length > 0 };
}

export interface CalculationResult {
  parts: Part[];
  messages: string[];
}

/**
 * Generates cabinet pieces based on carpentry presets and rules.
 */
export function calculateCabinetParts(
  preset: PresetConfig,
  currentUnit: string,
  settings: AppSettings,
  customerMainBoard: string,
  customerBackBoard: string,
  customerBackType: string,
  customerDrawerBottomBoard?: string,
  customerDrawerBottomType?: string
): CalculationResult {
  const parts: Part[] = [];
  const messages: string[] = [];

  const b = (customerMainBoard || 'Color 273 18mm').trim();
  const b6 = (customerBackBoard || 'Color 273 6mm').trim();
  const bt = preset.cbt || customerBackType || '6';
  const b18 = bt === '18' ? (customerBackBoard || b) : b;
  const u = currentUnit;

  const K = Math.max(1, Number(preset.cn2) || 1);
  const W = Number(preset.cw) || 1000;
  const H = Number(preset.ch) || 2100;
  const D = Number(preset.cd) || 580;
  const T = Number(preset.ct) || 18;
  const N = Number(preset.cdn) ?? 2;
  const F = Number(preset.cf) || 0;
  const A = Number(preset.cas) || 0;
  const ptype = preset.cu || 'Cupboard';
  const isSide = preset.clay === 'side';
  const NOD = !isSide && (preset.cdy === 'no' || (preset.cdr ?? 0) === 0 && preset.cdy !== 'yes');
  const DR = NOD ? 0 : Number(preset.cdr) || 0;

  if (!W || !H || !D) {
    return { parts: [], messages: ['Invalid cabinet dimensions (W, H, D).'] };
  }

  const iw = W - 2 * T;
  const dsq = NOD ? 0 : preset.cds === '' || preset.cds === undefined ? (DR > 0 ? 1 : 0) : Number(preset.cds) || 0;
  const dsd = D - (Number(preset.cdsr) ?? 100);
  const dlen = dsd - (Number(preset.cdlr) ?? 30);
  const dh = Number(preset.cdh) || 140;
  const sl = Number(preset.csl) ?? 26;
  const bw = iw + (Number(preset.cbw) || 0);
  const cbhVal = Number(preset.cbh);
  const topThick = preset.ctop === 'no' ? 0 : T;
  const botThick = T;
  // Cupboard Back Height: If cbh is 0 or empty, Back Height = Panel Height - Top - Bottom
  const bh = (cbhVal > 0)
    ? Math.max(50, H - cbhVal - (Number(preset.cskr) || 0))
    : Math.max(50, H - topThick - botThick - (Number(preset.cskr) || 0));

  const lp = 2 * (Number(preset.clp) || 0);
  const bot6 = preset.cdbk !== undefined
    ? preset.cdbk === '6'
    : (customerDrawerBottomType ? customerDrawerBottomType === '6' : ((customerDrawerBottomBoard && /18\s*mm/i.test(customerDrawerBottomBoard)) ? false : true));
  const gw = bot6 ? (Number(preset.cdb6w) ?? 17) : 0;

  // Resolve drawer bottom board strictly based on 6mm vs 18mm selection and editable color:
  let bbd: string;
  if (preset.cdb_color && preset.cdb_color.trim()) {
    bbd = preset.cdb_color.trim();
  } else if (customerDrawerBottomBoard && customerDrawerBottomBoard.trim()) {
    bbd = customerDrawerBottomBoard.trim();
    if (bot6 && !/6\s*mm/i.test(bbd)) {
      bbd = bbd.replace(/\s*18\s*mm/i, '') + ' 6mm';
    } else if (!bot6 && !/18\s*mm/i.test(bbd)) {
      bbd = bbd.replace(/\s*6\s*mm/i, '') + ' 18mm';
    }
  } else if (bot6) {
    bbd = b6;
    if (!/6\s*mm/i.test(bbd)) {
      bbd = bbd.replace(/\s*18\s*mm/i, '') + ' 6mm';
    }
  } else {
    bbd = b;
    if (!/18\s*mm/i.test(bbd)) {
      bbd = bbd.replace(/\s*6\s*mm/i, '') + ' 18mm';
    }
  }

  const SL = Number(settings.sl) || 2440;
  const manual = Number(preset.csp) || 0;
  const fr: number[] = [];
  for (let i = 1; i <= F + A; i++) fr.push(i / (F + A + 1));

  const q0 = (bb: string, p: string, l: number, w: number, q: number) => {
    if (q > 0 && l > 0 && w > 0) {
      parts.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        b: bb,
        u,
        p,
        l: Math.round(l),
        w: Math.round(w),
        q: Math.round(q * K),
      });
    }
  };

  const add = (bb: string, p: string, l: number, w: number, q: number) => {
    if (!(q > 0 && l > 0 && w > 0)) return;
    if (/^(Side Panel|Back)/.test(p) && l > SL) {
      const sp = splitLen(l, SL, fr, manual, H);
      q0(bb, `${p} (lower)`, sp.a, w, q);
      q0(bb, `${p} (upper)`, sp.b, w, q);
      messages.push(
        `${p} (${Math.round(l)}mm) exceeds ${SL}mm stock sheet. Split into ${sp.a} + ${sp.b}mm ${
          sp.shelf ? 'at shelf position.' : 'in center.'
        }`
      );
      return;
    }
    q0(bb, p, l, w, q);
  };

  if (preset.clay === 'side') {
    const isSkirtingBase = (preset.cu || '').toLowerCase().includes('skirt') || Number(preset.cskr) > 0;
    const skirting = Math.max(0, Number(preset.cskr) || 0);
    const hasDrawers = preset.cdy !== 'no' && (Number(preset.cdr) ?? 0) > 0;
    const n = Math.max(1, Number(preset.cdr) || (Number(preset.cdn) > 0 ? Number(preset.cdn) : 2));
    const area = preset.cdw !== undefined && preset.cdw !== '' ? Number(preset.cdw) : iw;

    // Side Panels:
    // Side panels go to the floor for base units (or if side to floor is enabled)
    // Deduction for top board: -18mm in height (user configurable via cside_sub)
    const sideToFloor = preset.cside_floor === 'yes' || isSkirtingBase;
    const sideSub = preset.cside_sub !== undefined ? Number(preset.cside_sub) : (isSkirtingBase ? 18 : 0);
    const hin = Math.max(100, H - 2 * T);
    const sideLength = sideToFloor ? Math.max(50, H - sideSub) : hin;
    add(b, 'Side Panel', sideLength, D, 2);

    // Top:
    // If side panel H - (mm) is set to 0 (sideSub === 0), side panels are full height H,
    // which means Top panel sits inside between the 2 side panels: Top length/width = W - 2 side panels (W - 2*T)
    // If sideSub > 0 (e.g. 18mm), side panels are H - 18mm, Top sits over the sides: Top length = W
    // Top:
    // For TV Unit, Top is the same size as written by the user: Length = W + (ctl || 0), Depth = D + (ctp || 0)
    // For other units with side layout:
    // If sideSub === 0, Top panel sits inside between the 2 side panels: Top length = W - 2*T + ctl
    // If sideSub > 0, side panels are shorter, Top sits over the sides: Top length = W + ctl
    const isTVUnit = (preset.cu || '').toLowerCase().includes('tv') || ptype === 'TV Unit';
    const hasTop = preset.ctop !== 'no';
    if (hasTop) {
      const topLength = (isTVUnit || sideSub > 0)
        ? Math.max(50, W + (Number(preset.ctl) || 0))
        : Math.max(50, W - 2 * T + (Number(preset.ctl) || 0));
      const topDepth = isTVUnit
        ? Math.max(50, D + (Number(preset.ctp) || 0))
        : (sideSub === 0
            ? Math.max(50, D + (Number(preset.ctp) || 0))
            : Math.max(50, D + (Number(preset.ctp) ?? 20)));
      add(b, 'Top', topLength, topDepth, 1);
    }

    // Bottom:
    // For Skirting Base unit, bottom sits between side panels: -36mm in width (user configurable via cbot_sub)
    const botSub = preset.cbot_sub !== undefined ? Number(preset.cbot_sub) : (isSkirtingBase ? 36 : 0);
    const bottomW = Math.max(50, W - botSub);
    add(b, 'Bottom', bottomW, D, 1);

    // Divider:
    // Adding Skirting Size reduces the divider size!
    const dividerH = Math.max(50, hin - skirting);
    const dividerCount = hasDrawers
      ? (n > 1 ? n - 1 : 0)
      : (Number(preset.cdn) > 1 ? Number(preset.cdn) - 1 : (n > 1 ? n - 1 : 1));
    if (dividerCount > 0) {
      add(b, 'Divider', dividerH, D - (Number(preset.cdv) ?? 20), dividerCount);
    }

    // Drawer Width Formula:
    // W (e.g. 1800) - 2 side panels (2*T) - how many dividers (dividerCount * T),
    // divided by drawer qty (/ n) - slide channel (sl) - 2 drawer sides (2*T)
    const totalClearWidth = (preset.cdw !== undefined && preset.cdw !== '' && Number(preset.cdw) > 0)
      ? (Number(preset.cdw) - dividerCount * T)
      : (W - 2 * T - dividerCount * T);
    const openingPerDrawer = totalClearWidth / n;
    const boxOuterWidth = openingPerDrawer - sl;
    const fb = Math.max(80, Math.round(boxOuterWidth - 2 * T));

    const dl = Math.max(100, D - (Number(preset.cdls) ?? 50));
    const dheight = Math.max(80, dh || 140);

    // Skirting kickboard if skirting > 0:
    if (skirting > 0) {
      add(b, 'Skirting', iw, skirting, 1);
    }

    // Back Panel:
    // Back width = Inner Width - deduction (mm)
    const backSubW = Number(preset.cbw) || 0;
    const backW = Math.max(50, area - backSubW);
    const backH = Math.max(50, hin - skirting - (Number(preset.cbh) || 0));

    if (bt === '6') add(b6, 'Back 6mm', backW, backH, 1);
    if (bt === '18') add(b18, 'Back 18mm', backW, backH, 1);

    // Drawers vs Doors (Shutters):
    // If (0) Drawer in Box is chosen, generate Doors (Shutters) instead of drawer boxes
    if (!hasDrawers) {
      const doorCount = Number(preset.cdn) > 0 ? Number(preset.cdn) : (n > 1 ? n : 2);
      const doorGap = Number(preset.cfw) ?? 5;
      const doorHeight = Math.max(
        50,
        H - skirting - (Number(preset.cfh) ?? 23) - lp
      );
      const doorWidth = Math.max(
        50,
        Math.floor(W / doorCount - doorGap) - lp
      );
      add(b, 'Door', doorHeight, doorWidth, doorCount);
    } else {
      add(b, 'Drawer sides', dl, dheight, 2 * n);
      add(b, 'Drawer front', fb, dheight, n);
      add(b, 'Drawer back', fb, dheight, n);
      const drawerBottomPartName = bot6 ? 'Drawer bottom 6mm' : 'Drawer bottom 18mm';
      add(bbd, drawerBottomPartName, Math.max(80, dl - 2 * T + gw), Math.max(80, fb + gw), n);
      add(
        b,
        'Face',
        Math.max(50, H - skirting - (Number(preset.cfh) ?? 23) - lp),
        Math.max(50, Math.floor(W / n - (Number(preset.cfw) ?? 5)) - lp),
        n
      );
    }

    return { parts: sortPartsInCarpentrySequence(parts), messages };
  }

  // Standard Cupboard & Tall Wardrobe
  add(b, 'Side Panel', H, D, 2);
  const topDepthSub = Number(preset.ctd_sub) || 0;
  const topDepth = Math.max(50, D - topDepthSub);
  add(b, 'Top', iw, topDepth, 1);
  add(b, 'Bottom', iw, D, 1);

  const bay = (preset.cdmode ?? 'door') === 'door' && N > 1;
  const shw = bay ? (iw - (N - 1) * T) / N : iw;
  const shm = bay ? N : 1;

  if (F > 0) add(b, 'Fix Shelves', shw, D - (Number(preset.cfr) ?? 20), F * shm);
  if (A > 0) add(b, 'Adjust Shelves', shw, D - (Number(preset.car) ?? 36), A * shm);
  if (dsq > 0) add(b, 'Drawer Shelves', shw, dsd, dsq * shm);

  if (bay && N > 1) add(b, 'Divider', H - 2 * T, D - 26, N - 1);

  if (DR > 0) {
    const leaveSpace = Number(preset.cdwr) ?? 50;
    const runnerThick = Number(preset.csl) ?? 26;
    const connSide = Math.abs(Number(preset.ccn) || 0);
    const isDoorSpace = (preset.cdmode ?? 'door') === 'door' && N > 1;
    let bx: number;
    let by = 1;

    if (isDoorSpace) {
      const bayWidth = (iw - (N - 1) * T) / N;
      bx = Math.round(bayWidth - leaveSpace - runnerThick - connSide);
      by = preset.cdsec === 'one' ? 1 : N;
    } else {
      const hingeSides = N === 1 ? 1 : (N === 0 ? 0 : 2);
      const totalLeave = hingeSides * leaveSpace;
      bx = Math.round(iw - totalLeave - runnerThick - connSide);
      by = 1;
    }

    const innerFront = Math.max(80, Math.round(bx - 2 * T));
    const dheight = Math.max(80, dh || 140);
    const dlength = Math.max(100, dlen || D - 130);

    // Drawer Front Face for Cupboard:
    // Cupboard Width = 1000 - 36 for side Panel - 50mm on both sides (2 * leaveSpace) if cupboard one full Open Space - Gap - Lipping
    const gap = Number(preset.cfw) ?? 4;
    let faceW: number;
    if (isDoorSpace) {
      const bayWidth = (iw - (N - 1) * T) / N;
      faceW = Math.max(50, Math.round(bayWidth - leaveSpace - gap - lp));
    } else {
      const hingeSides = N === 1 ? 1 : 2;
      const bothSidesLeave = hingeSides * leaveSpace;
      faceW = Math.max(50, Math.round(iw - bothSidesLeave - gap - lp));
    }
    const faceHeightInput = preset.cdfh !== undefined && preset.cdfh !== null && Number(preset.cdfh) > 0
      ? Number(preset.cdfh)
      : (Number(preset.cfh) > 0 ? Number(preset.cfh) : (dh ? dh + 40 : 180));
    const faceH = Math.max(50, Math.round(faceHeightInput - lp));

    add(b, 'Face', faceH, faceW, DR * by);
    add(b, 'Drawer sides', dlength, dheight, 2 * DR * by);
    add(b, 'Drawer front', innerFront, dheight, DR * by);
    add(b, 'Drawer back', innerFront, dheight, DR * by);
    const drawerBottomPartName = bot6 ? 'Drawer bottom 6mm' : 'Drawer bottom 18mm';
    add(bbd, drawerBottomPartName, Math.max(80, dlength - 2 * T + gw), Math.max(80, innerFront + gw), DR * by);
  }

  if (bt === '6') add(b6, 'Back 6mm', bh, bw, 1);
  if (bt === '18') add(b18, 'Back 18mm', bh, bw, 1);

  if (N > 0) {
    add(
      b,
      'Door',
      H - (Number(preset.cfw) ?? 4) - (Number(preset.cskr) || 0) - lp,
      Math.floor(W / N - (Number(preset.cfw) ?? 4)) - lp,
      N
    );
  }

  return { parts: sortPartsInCarpentrySequence(parts), messages };
}

export interface SheetConsumptionItem {
  board: string;
  pieces: number;
  totalArea: number; // in m²
  sheetsNeeded: number;
  sheetsExact: number;
}

/**
 * Calculates sheet consumption per board material.
 */
export function calculateSheetConsumption(
  parts: Part[],
  settings: AppSettings
): SheetConsumptionItem[] {
  const map: Record<string, { pieces: number; totalArea: number }> = {};

  parts.forEach((p) => {
    if (!map[p.b]) {
      map[p.b] = { pieces: 0, totalArea: 0 };
    }
    map[p.b].pieces += p.q;
    map[p.b].totalArea += (p.q * p.l * p.w) / 1e6;
  });

  const sheetAreaM2 = (settings.sl * settings.sw) / 1e6;
  const wasteFactor = 1 + (settings.ws || 0) / 100;

  return Object.entries(map).map(([board, data]) => {
    const rawSheets = (data.totalArea * wasteFactor) / sheetAreaM2;
    return {
      board,
      pieces: data.pieces,
      totalArea: data.totalArea,
      sheetsExact: rawSheets,
      sheetsNeeded: Math.ceil(rawSheets),
    };
  });
}

/**
 * Merges parts for a single board material into consolidated W x L cutting rows.
 */
export function getMergedPartsByBoard(
  boardParts: Part[],
  settings: AppSettings
): MergedPartRow[] {
  const map: Record<string, MergedPartRow> = {};

  boardParts.forEach((part) => {
    const key = `${part.w}x${part.l}`;
    if (!map[key]) {
      map[key] = {
        w: part.w,
        l: part.l,
        q: 0,
        tags: {},
        exceedsSheet: isOverSheet(part.w, part.l, settings.sl, settings.sw),
      };
    }
    map[key].q += part.q;
    const unitName = part.u || 'General';
    if (!map[key].tags[unitName]) {
      map[key].tags[unitName] = {};
    }
    map[key].tags[unitName][part.p] = (map[key].tags[unitName][part.p] || 0) + part.q;
  });

  return Object.values(map).sort((a, b) => b.l * b.w - a.l * a.w);
}

/**
 * Formats tag breakdown string for display: "Cupboard 1: Side Panel ×2 | Cupboard 2: Side Panel ×2"
 */
export function formatTagBreakdown(tags: Record<string, Record<string, number>>): string {
  return Object.entries(tags)
    .map(([unit, partObj]) => {
      const partsStr = Object.entries(partObj)
        .map(([name, qty]) => `${name} ×${qty}`)
        .join(', ');
      return `${unit}: ${partsStr}`;
    })
    .join(' | ');
}

/**
 * Standard Carpentry Assembly Sequence Hierarchy:
 * 1. Side Panel / End Panel / Outer Sides
 * 2. Top / Top Panel
 * 3. Bottom / Bottom Panel
 * 4. Divider / Partition / Center Divider
 * 5. Fix Shelves / Fixed Shelf
 * 6. Adjust Shelves / Adjustable Shelf
 * 7. Drawer Shelves
 * 8. Back Panel / Back 18mm / Back 6mm
 * 9. Door / Doors
 * 10. Face / Drawer Front Face
 * 11. Drawer sides
 * 12. Drawer front
 * 13. Drawer back
 * 14. Drawer bottom
 * 15. Skirting / Plinth / Kickboard
 * 16. Wall Panel / Pelmet / Filler / Other trims
 */
export function getCarpentrySequenceIndex(partName: string): number {
  const n = (partName || '').toLowerCase().trim();

  if (n.includes('side panel') || n.startsWith('side')) return 10;
  if (n.startsWith('top')) return 20;
  if (n.startsWith('bottom')) return 30;
  if (n.includes('divider') || n.includes('partition')) return 40;
  if (n.includes('fix shelf') || n.includes('fix shelves') || n.includes('fixed shelf')) return 50;
  if (
    n.includes('adjust shelf') ||
    n.includes('adjust shelves') ||
    n.includes('adjustable shelf') ||
    n.includes('shelf') ||
    n.includes('shelves')
  ) {
    return 60;
  }
  if (n.includes('drawer shelf') || n.includes('drawer shelves')) return 70;
  if (n.startsWith('back')) return 80;
  if (n.startsWith('door')) return 90;
  if (n.startsWith('face') || n.includes('front face')) return 100;
  if (n.includes('drawer side')) return 110;
  if (n.includes('drawer front')) return 120;
  if (n.includes('drawer back')) return 130;
  if (n.includes('drawer bottom')) return 140;
  if (n.includes('skirting') || n.includes('plinth') || n.includes('kickboard')) return 150;
  if (n.includes('wall panel') || n.includes('panel')) return 160;
  if (n.includes('filler') || n.includes('pelmet')) return 170;

  return 200; // general / custom parts
}

/**
 * Sorts parts in standard carpentry sequence:
 * Primary: Carpentry sequence category (Side Panel -> Top -> Bottom -> Divider -> Fix Shelves -> Adjust Shelves -> Back -> Door -> Drawers...)
 * Secondary: Part name alphabetical
 * Tertiary: Area descending (larger pieces first)
 */
export function sortPartsInCarpentrySequence(parts: Part[]): Part[] {
  return [...parts].sort((a, b) => {
    const rankA = getCarpentrySequenceIndex(a.p);
    const rankB = getCarpentrySequenceIndex(b.p);
    if (rankA !== rankB) return rankA - rankB;

    const nameCompare = a.p.localeCompare(b.p);
    if (nameCompare !== 0) return nameCompare;

    // Largest dimensions first
    return b.l * b.w - a.l * a.w;
  });
}

/**
 * Merges identical parts within the same unit that have:
 * - Same Unit (u)
 * - Same Board Material (b)
 * - Same Part Name (p)
 * - Same Width (w)
 * - Same Length (l)
 * Combines their quantities (q) and returns deduplicated list sorted in sequence.
 */
export function mergeDuplicatePartsInList(parts: Part[]): Part[] {
  const map = new Map<string, Part>();

  for (const part of parts) {
    // Normalizing key: unit, board, part name (trimmed/case-insensitive), width, length
    const key = `${part.u.trim()}|||${part.b.trim()}|||${part.p.trim().toLowerCase()}|||${Math.round(part.w)}|||${Math.round(part.l)}`;
    const existing = map.get(key);
    if (existing) {
      existing.q += part.q;
      if (!existing.pColor && part.pColor) existing.pColor = part.pColor;
    } else {
      map.set(key, { ...part, w: Math.round(part.w), l: Math.round(part.l) });
    }
  }

  return sortPartsInCarpentrySequence(Array.from(map.values()));
}
