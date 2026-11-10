/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Part {
  id?: string;
  b: string;       // Board material / color
  u: string;       // Unit name (e.g. Cupboard 1)
  p: string;       // Part name (e.g. Side Panel, Door)
  w: number;       // Width in mm
  l: number;       // Length in mm
  q: number;       // Quantity
  pColor?: string; // Custom fill color for Part Name
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  date: string;
  notes: string;
  units: string[];
  unit: string;
  parts: Part[];
  mainBoard: string;
  backBoard: string;
  backType: '6' | '18' | '0';
  drawerBottomBoard?: string;
  drawerBottomType?: '6' | '18';
  codeColor?: string; // Custom fill color for Customer Code
}

export interface PresetConfig {
  cdy?: string;      // Drawer option: "no" | "yes"
  cdxr?: number;     // Drawer clearance
  cdmode?: string;   // Inside box mode: "door" | "full"
  cdwr?: number;     // Drawer Side Leave Space (mm) - hinge clearance (default 50)
  cfw?: number;      // Door/Front gap (mm)
  clp?: number;      // Lipping per edge (mm)
  cu?: string;       // Unit prefix
  cw?: number;       // Cabinet Width
  ch?: number;       // Cabinet Height
  cd?: number;       // Cabinet Depth
  ct?: number;       // Board Thickness
  cdn?: number;      // Doors count
  cf?: number;       // Fix Shelves count
  cas?: number;      // Adjust Shelves count
  cdr?: number;      // Drawers in Box
  cds?: string | number; // Drawer Shelves
  cdsr?: number;     // Drawer Depth Sub (mm)
  cbt?: string;      // Back Type: "6" | "18" | "0"
  cbw?: number;      // Back Width addition
  cbh?: number;      // Back Height deduction
  cdh?: number;      // Drawer Height
  csl?: number;      // Slide channel thickness (runners)
  cdlr?: number;     // Drawer length deduction
  cfr?: number;      // Fix Shelf Depth deduction
  car?: number;      // Adjust Shelf Depth deduction
  cskr?: number;     // Skirting height
  clay?: string;     // Layout: "stack" | "side"
  cn2?: number;      // Cabinet multiplier
  ccn?: number;      // Connector Side panel deduction (17 or 18mm)
  ctp?: number;      // Top protrusion
  cdv?: number;      // Divider depth reduction
  cfh?: number;      // Face height reduction
  ctl?: number;      // Top length addition
  cdls?: number;     // Drawer slide depth reduction
  cdw?: string | number; // Drawer area width
  cdbk?: string;     // Drawer bottom board: "6" | "18"
  cdb_color?: string; // Drawer bottom board color / code & thickness (editable)
  cdb6w?: number;    // 6mm Bottom Add W/L
  cdsec?: string;    // Drawers Placement: "all" | "one"
  csp?: number;      // Split tall pieces at mm
  cdg?: number;      // Drawer gap allowance (mm)
  ctop?: string;     // Top Panel: 'yes' (with top +18mm) | 'no' (not top / countertop)
  cside_floor?: string; // Side panels to floor: 'yes' | 'no'
  cside_sub?: number;   // Side panel height deduction (e.g. 18mm for top on sides)
  cbot_sub?: number;    // Bottom panel width deduction (e.g. 36mm for bottom between sides)
  ctd_sub?: number;     // Cupboard Top Depth deduction: D - (mm). 0/blank = same size as bottom
  cdfh?: number;        // Cupboard Drawer Face Height (mm)
}

export interface AppSettings {
  co: string;        // Company Name
  sl: number;        // Sheet Length (mm), default 2440
  sw: number;        // Sheet Width (mm), default 1220
  ws: number;        // Saw Waste %, default 15
  printFontSize?: number; // Workshop print font size (9-13px)
  printLayout?: 'standard' | 'right-first' | 'split' | 'full'; // Print column layout
  fitSinglePage?: boolean; // Fit unit on single A4 page
  presets: Record<string, PresetConfig>;
}

export interface AppDatabase {
  customers: Customer[];
  cur: string;
  set: AppSettings;
}

export interface MergedPartRow {
  w: number;
  l: number;
  q: number;
  tags: Record<string, Record<string, number>>; // unit -> partName -> qty
  exceedsSheet: boolean;
}

export interface NestedPartPlacement {
  id: string;
  partName: string;
  unit: string;
  board: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotated: boolean;
  itemNumber: number;
  totalQuantity: number;
}

export interface NestedSheet {
  sheetIndex: number;
  board: string;
  sheetWidth: number;
  sheetLength: number;
  placements: NestedPartPlacement[];
  usedArea: number;
  totalArea: number;
  utilizationPercent: number;
}
