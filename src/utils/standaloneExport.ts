/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Customer, AppSettings } from '../types/cutting';

/**
 * Generates a self-contained, standalone desktop HTML application
 * that the user can download and run on any Windows/Mac PC completely offline.
 */
export function generateStandalonePCSoftware(
  initialCustomer: Customer,
  settings: AppSettings
): string {
  const exportData = JSON.stringify({
    customers: [initialCustomer],
    cur: initialCustomer.id,
    set: settings,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cutting List Pro - Desktop Software</title>
<style>
:root {
  --bg: #f8fafc;
  --sf: #ffffff;
  --ink: #0f172a;
  --mute: #64748b;
  --line: #e2e8f0;
  --ac: #047857;
  --aci: #ffffff;
  --ac-bg: #ecfdf5;
  --ac-border: #a7f3d0;
  --warn: #dc2626;
  --warn-bg: #fef2f2;
  --side: #f1f5f9;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0f12;
    --sf: #141b1f;
    --ink: #f8fafc;
    --mute: #94a3b8;
    --line: #243038;
    --ac: #10b981;
    --aci: #022c22;
    --ac-bg: #064e3b33;
    --ac-border: #065f46;
    --warn: #f87171;
    --warn-bg: #450a0a33;
    --side: #0f1418;
    color-scheme: dark;
  }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 13.5px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.app { display: grid; grid-template-columns: 290px 1fr; min-height: 100vh; }
aside { background: var(--side); border-right: 1px solid var(--line); padding: 14px; display: flex; flex-direction: column; gap: 10px; }
aside h1 { font-size: 1.15rem; margin: 0; font-weight: 800; display: flex; align-items: center; justify-content: space-between; }
.badge { background: var(--ac); color: var(--aci); font-size: 10px; padding: 2px 7px; border-radius: 4px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
#list { display: flex; flex-direction: column; gap: 6px; overflow-y: auto; max-height: calc(100vh - 270px); }
.c { padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--sf); cursor: pointer; transition: all 0.15s; }
.c:hover { border-color: var(--ac); }
.c.on { border-color: var(--ac); background: var(--ac-bg); box-shadow: inset 3px 0 0 var(--ac); }
.c b { display: block; font-size: 13px; }
.c small { color: var(--mute); font-family: ui-monospace, monospace; font-size: 11px; }
main { padding: 16px 20px; max-width: 1120px; width: 100%; margin: 0 auto; }
section { background: var(--sf); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
h2 { font-size: 0.95rem; margin: 0 0 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; display: flex; align-items: center; justify-content: space-between; }
.row { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
label { display: flex; flex-direction: column; font-size: 0.78rem; color: var(--mute); gap: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.03em; }
input, textarea, select { font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 6px; padding: 7px 9px; min-width: 0; outline: none; }
input:focus, select:focus { border-color: var(--ac); box-shadow: 0 0 0 2px var(--ac-bg); }
input[type=number] { width: 95px; font-family: ui-monospace, monospace; }
.w { width: 190px; }
button { font: inherit; cursor: pointer; border: 1px solid var(--line); background: var(--sf); color: var(--ink); border-radius: 6px; padding: 7px 12px; font-weight: 600; font-size: 12.5px; transition: all 0.15s; }
button:hover { background: var(--bg); }
button.p { background: var(--ac); color: var(--aci); border-color: var(--ac); font-weight: 700; }
button.p:hover { opacity: 0.92; }
button.x { color: var(--warn); border: none; background: transparent; padding: 3px 8px; font-size: 12px; }
button.x:hover { text-decoration: underline; }
.sc { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-variant-numeric: tabular-nums; font-size: 12.5px; }
th, td { text-align: left; padding: 6px 9px; border-bottom: 1px solid var(--line); }
th { font-size: 0.72rem; color: var(--mute); text-transform: uppercase; background: var(--bg); font-weight: 700; letter-spacing: 0.03em; }
.n { text-align: right; font-family: ui-monospace, monospace; }
td.s { font-weight: 700; font-family: ui-monospace, monospace; }
.board { margin-bottom: 16px; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.board-header { background: var(--bg); padding: 8px 12px; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; }
.board-header h3 { margin: 0; font-size: 0.92rem; font-weight: 700; }
.tot { display: flex; flex-wrap: wrap; gap: 16px; padding: 8px 12px; background: var(--bg); border-top: 1px solid var(--line); font-family: ui-monospace, monospace; font-size: 12px; }
.tot b { font-size: 1rem; color: var(--ac); }
.note { color: var(--mute); font-size: 0.8rem; margin: 6px 0 0; }
.ei { width: 78px; padding: 3px 6px; font-family: ui-monospace, monospace; border: 1px solid var(--line); border-radius: 4px; background: var(--sf); }
.top-bar { background: #065f46; color: #fff; padding: 7px 16px; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 600; }
.merged-bar { background: var(--ac-bg); border: 1px solid var(--ac-border); border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
.merged-bar-title { display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--ac); margin-bottom: 8px; }
.pill-badge { font-size: 10px; background: var(--ac); color: var(--aci); padding: 1px 6px; border-radius: 4px; margin-left: 6px; font-weight: 700; }
.alert-box { padding: 8px 12px; border-radius: 6px; background: var(--warn-bg); border: 1px solid var(--warn); color: var(--warn); font-size: 12px; margin: 8px 0; }
.unit-tab-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; background: var(--bg); border: 1px solid var(--line); border-radius: 8px; margin-bottom: 12px; }
.unit-tab-group { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.unit-tab-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--mute); margin-right: 4px; display: flex; align-items: center; gap: 4px; }
.unit-chip-btn { padding: 4px 10px; font-size: 12px; font-weight: 600; border-radius: 6px; border: 1px solid var(--line); background: var(--sf); color: var(--ink); cursor: pointer; transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
.unit-chip-btn:hover { background: var(--bg); border-color: var(--ac); }
.unit-chip-btn.p { background: var(--ac); color: var(--aci); border-color: var(--ac); font-weight: 700; }
.unit-chip-count { font-size: 10px; font-family: ui-monospace, monospace; padding: 1px 5px; border-radius: 4px; background: rgba(0,0,0,0.12); }
.unit-sep-badge { font-size: 11px; font-weight: 700; color: var(--ac); background: var(--ac-bg); border: 1px solid var(--ac-border); padding: 4px 10px; border-radius: 6px; display: inline-flex; align-items: center; gap: 8px; }
.print-split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ph { display: none; }
#labels { display: none; }

@media (max-width: 820px) {
  .app { grid-template-columns: 1fr; }
  aside { border-right: none; border-bottom: 1px solid var(--line); }
  #list { max-height: 180px; }
  .print-split-grid { grid-template-columns: 1fr !important; }
}

@media print {
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body { background: #fff !important; color: #000 !important; font-size: var(--pfs, 10.5pt) !important; font-family: Arial, sans-serif !important; }
  .app, .top-bar { display: block !important; }
  aside, .np { display: none !important; }
  main { padding: 0 !important; max-width: none !important; margin: 0 !important; }
  section { border: none !important; padding: 0 !important; margin: 0 0 12pt 0 !important; box-shadow: none !important; background: transparent !important; }
  .ph { display: block !important; border-bottom: 2pt solid #000 !important; padding-bottom: 6pt !important; margin-bottom: 10pt !important; }
  #pinfo { display: grid !important; grid-template-columns: 1fr auto 1fr !important; align-items: baseline !important; font-weight: bold !important; }
  #pcc { font-size: 10pt !important; text-align: left !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  #pnm { font-size: 18pt !important; text-align: center !important; font-weight: 800 !important; }
  #pun { font-size: 14pt !important; text-align: right !important; }
  .phr { display: flex !important; justify-content: space-between !important; align-items: baseline !important; margin-top: 3pt !important; font-size: 11pt !important; font-weight: bold !important; color: #333 !important; }
  table { width: 100% !important; border-collapse: collapse !important; font-size: var(--tfs, 9.5pt) !important; table-layout: auto !important; }
  th, td { border: 1pt solid #888 !important; color: #000 !important; padding: var(--cpad, 3pt 5pt) !important; white-space: normal !important; }
  th { background: #f2f2f2 !important; font-weight: bold !important; font-size: var(--thfs, 8.5pt) !important; }
  .board { border: none !important; break-inside: avoid !important; page-break-inside: avoid !important; margin-bottom: 12pt !important; }
  .board-header { background: #f5f5f5 !important; border: 1pt solid #888 !important; padding: 4pt 6pt !important; }
  .board-header h3 { font-size: 10.5pt !important; }
  .stat-col { display: none !important; }
  .print-split-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 8px !important; direction: rtl !important; }
  .print-split-grid > * { direction: ltr !important; }
  tr { break-inside: avoid !important; page-break-inside: avoid !important; }
  .tot { background: #fafafa !important; border: 1pt solid #888 !important; border-top: none !important; padding: 4pt 6pt !important; font-size: 9.5pt !important; }
  .ei { width: 50px !important; border: none !important; background: transparent !important; padding: 0 !important; font-weight: bold !important; font-size: 9.5pt !important; }
  body[data-print="stk"] #labels { display: block !important; }
  body[data-print="stk"] .app { display: none !important; }
  .lb { box-sizing: border-box; overflow: hidden; padding: 1.5mm 2mm; color: #000; font-family: Arial, sans-serif; line-height: 1.15; break-after: page; page-break-after: always; }
  .lb:last-child { break-after: auto; page-break-after: auto; }
  @page { size: A4; margin: 8mm 10mm; }
}
</style>
</head>
<body>

<div class="top-bar np">
  <div>Cutting List Pro (Offline PC Edition) — All data saved locally on your computer</div>
  <div style="display:flex;gap:12px;align-items:center;">
    <label style="font-size:11px;display:flex;align-items:center;gap:4px;">Print Font:
      <select id="pfs_sel" style="padding:1px 4px;font-size:11px;background:#fff;color:#000;border-radius:3px;border:none;">
        <option value="9">9px</option>
        <option value="10">10px</option>
        <option value="11" selected>11px</option>
        <option value="12">12px</option>
        <option value="13">13px</option>
      </select>
    </label>
    <span>Press Ctrl+P to Print</span>
  </div>
</div>

<div class="app">
  <aside class="np">
    <h1>
      <span>Cutting List</span>
      <span class="badge">PC PRO</span>
    </h1>
    <button class="p" id="newc">+ New Customer</button>
    <input id="srch" placeholder="Search customer or code...">
    <div id="list"></div>
    <div class="row">
      <button id="bk" style="flex:1;">Backup All</button>
      <button id="rs" style="flex:1;">Restore</button>
      <input type="file" id="rf" accept=".json" hidden>
    </div>
    <p class="note">Everything runs 100% offline. No internet connection needed.</p>
  </aside>

  <main>
    <section class="np">
      <h2>
        <span>Customer &amp; Workshop Order</span>
        <button class="x" id="delc">Delete Customer</button>
      </h2>
      <div class="row">
        <div>
          <label style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
            <span>Cust Code</span>
            <input type="color" id="cc_color" title="Fill Color for Customer Code" value="#ffffff" style="width:24px;height:22px;padding:0;border:none;background:none;cursor:pointer;">
          </label>
          <input id="cc" style="width:110px" placeholder="C-104">
        </div>
        <label>Customer Name<input id="cn" class="w" style="width:230px" placeholder="Ahmed Al Mansoori"></label>
        <label>Order Date<input type="date" id="dt"></label>
        <label>Order Notes<input id="nt" style="width:240px" placeholder="Master Bedroom, Hinged..."></label>
      </div>

      <div class="merged-bar" style="margin-top:12px;">
        <div class="merged-bar-title">
          <span>Workshop Order Board Materials</span>
          <span class="pill-badge">Synced with Calculator</span>
        </div>
        <div class="row">
          <label><b>Main Board 18mm Name</b><input id="cb" class="w" placeholder="Color 273 18mm"></label>
          <label id="cb6lbl"><b>Back Board 18mm / 6mm Name</b><input id="cb6" class="w" placeholder="Color 273 6mm"></label>
          <label>Back Panel Option
            <select id="cbt">
              <option value="6">6mm Back Panel</option>
              <option value="18">18mm Back Panel</option>
              <option value="0">No Back Panel</option>
            </select>
          </label>
          <label>Drawer Bottom Board
            <select id="cdbk">
              <option value="6">6mm Board</option>
              <option value="18">18mm Board</option>
            </select>
          </label>
          <label><span style="background-color:#a7651f;color:#fff;padding:1px 5px;border-radius:4px;font-size:11px;font-weight:700;display:inline-block;margin-bottom:3px;">Drawer Bottom Color</span><input type="text" id="cdb_color" placeholder="e.g. Color 273 6mm / 18mm" title="Edit drawer bottom color"></label>
        </div>
      </div>

      <div class="row" style="margin-top:6px;">
        <label>Company Name<input id="co" style="width:280px" placeholder="AL TASMEEM CARPENTRY"></label>
        <label>Sheet Length (mm)<input type="number" id="sl" value="2440"></label>
        <label>Sheet Width (mm)<input type="number" id="sw" value="1220"></label>
        <label>Saw Waste %<input type="number" id="ws" value="15"></label>
      </div>
    </section>

    <section class="np">
      <h2>Cabinet Units</h2>
      <div class="row" id="units"></div>
      <div class="row" style="margin-top:10px;">
        <button class="p" id="ua">+ Add Unit</button>
        <button id="ur">Rename</button>
        <button id="uc">Copy Unit</button>
        <button id="uclr" style="color:var(--warn);font-weight:600;">Clear Unit Parts</button>
        <button id="ud">Delete Unit</button>
      </div>
      <p class="note" id="usel"></p>
    </section>

    <section class="np">
      <h2>Add Single Part (Width First, Then Length)</h2>
      <div class="row">
        <label>Board / Color<input id="b" class="w" list="bl" placeholder="Color 273 18mm"></label>
        <input id="u" type="hidden">
        <label>Part Name<input id="p" class="w" list="pl" placeholder="Side Panel"></label>
        <label>Width (mm)<input type="number" id="w" inputmode="numeric"></label>
        <label>Length (mm)<input type="number" id="l" inputmode="numeric"></label>
        <label>Qty<input type="number" id="q" value="1" inputmode="numeric"></label>
        <button class="p" id="add">Add Part</button>
      </div>
      <datalist id="bl"></datalist>
      <datalist id="pl">
        <option>Side Panel</option><option>Top</option><option>Bottom</option><option>Divider</option>
        <option>Fix Shelves</option><option>Adjust Shelves</option><option>Door</option><option>Face</option>
        <option>Drawer sides</option><option>Drawer front</option><option>Drawer back</option><option>Drawer bottom</option>
        <option>Back 18mm</option><option>Back 6mm</option><option>Wall Panel</option>
      </datalist>
    </section>

    <section class="np">
      <h2>
        <span>Parametric Cabinet Calculator</span>
        <div style="display:flex;gap:6px;">
          <button id="psave">Save Rules</button>
          <button id="pnew">+ New Type</button>
          <button id="padv">More Settings</button>
        </div>
      </h2>

      <div style="margin-bottom:12px;">
        <label style="display:block;margin-bottom:6px;">Preset Unit Type</label>
        <div id="ptypes-chips" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;"></div>
        <select id="ptype" style="font-size:12px;font-weight:700;display:none;"></select>
      </div>

      <div class="row">
        <input id="cu" type="hidden">
        <label>Cabinets (Qty)<input type="number" id="cn2" value="1"></label>
        <label>Width (mm)<input type="number" id="cw" value="1000"></label>
        <label>Height (mm)<input type="number" id="ch" value="2100"></label>
        <label>Depth (mm)<input type="number" id="cd" value="580"></label>
        <label>Board Thickness (mm)<input type="number" id="ct" value="18"></label>
        <label id="cdn-box">How Many Doors<input type="number" id="cdn" value="2"></label>
      </div>

      <div class="row" style="margin-top:10px;">
        <label class="stk">Fix Shelves<input type="number" id="cf" value="0"></label>
        <label class="stk">Adjust Shelves<input type="number" id="cas" value="3"></label>
        <label class="stk-only" style="color:var(--ac);font-weight:700;">Top Depth (-) (mm)<input type="number" id="ctd_sub" value="0" placeholder="0 (Same as Bottom)" title="0/blank = same size as bottom"></label>
        <label id="cdyl">Drawer Option
          <select id="cdy">
            <option value="no">No Drawer</option>
            <option value="yes">With Drawer</option>
          </select>
        </label>
        <label class="drw">Drawers in Box<input type="number" id="cdr" value="0"></label>
        <label class="drw stk-only" style="color:var(--ac);font-weight:700;">Face Height (mm)<input type="number" id="cdfh" value="180" title="Cupboard Drawer Face Height (Width: W - 36 - 100 - Gap - Lipping)"></label>
        <label>Drawer Layout
          <select id="clay">
            <option value="stack">Stacked (Cupboard)</option>
            <option value="side">Side by Side (Base / TV Unit)</option>
          </select>
        </label>
        <label>Door / Front Gap (mm)<input type="number" id="cfw" value="4"></label>
      </div>

      <div id="adv-box" style="display:none;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:12px;margin-top:12px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--mute);margin-bottom:8px;">Detailed Carpentry Rules</div>
        <div class="row">
          <label class="side-only" style="color:var(--ac);font-weight:700;">Top depth = depth + (mm)<input type="number" id="ctp" value="20"></label>
          <label class="side-only" style="color:var(--ac);font-weight:700;">Divider depth = depth - (mm)<input type="number" id="cdv" value="20"></label>
          <label class="side-only">Front height = height - (mm)<input type="number" id="cfh" value="23"></label>
          <label class="side-only">Top length = width + (mm)<input type="number" id="ctl" value="0"></label>
          <label class="side-only">Drawer length = depth - (mm)<input type="number" id="cdls" value="50"></label>
          <label class="side-only">Drawer area width (blank = inner)<input type="number" id="cdw" placeholder="Blank"></label>
          <label style="color:var(--ac);font-weight:700;" class="stk-only">Drawer Side Leave Space (mm)<input type="number" id="cdwr" value="50" title="Hinge clearance reduction per side (default: 50mm)"></label>
          <label style="color:#0f766e;font-weight:700;" class="stk-only">Connecter Side (mm)<input type="number" id="ccn" placeholder="18 or 17" title="Adjustable deduction for connector side panel (e.g. 17 or 18mm)"></label>
          <label class="drw">Slide Channel (mm)<input type="number" id="csl" value="26" title="Pair of slide runners thickness"></label>
          <label class="drw stk-only">Drawer Depth Sub (mm)<input type="number" id="cdsr" value="100" title="Recess from cupboard depth D"></label>
          <label class="drw">Drawer Height (mm)<input type="number" id="cdh" value="140"></label>
          <label class="stk-only">Inside Box Mode
            <select id="cdmode"><option value="door">Each Door Space</option><option value="full">One Full Open Space</option></select>
          </label>
          <label class="drw stk-only">Drawers Placement
            <select id="cdsec"><option value="all">Every Door Space</option><option value="one">One Door Space Only</option></select>
          </label>
          <label class="drw">6mm Bottom Add W/L<input type="number" id="cdb6w" value="17"></label>
          <label>Skirting Height (mm)<input type="number" id="cskr" value="0" title="Reduces divider height"></label>
          <label>Back Width: Inner - (mm)<input type="number" id="cbw" value="0" title="Deduction from Inner Width"></label>
          <label>Back Height: H - (mm)<input type="number" id="cbh" value="0" placeholder="0 (Panel H - Top - Bottom)" title="0/Blank = Panel Height - Top - Bottom"></label>
          <label>Top Panel
            <select id="ctop"><option value="yes">With Top Panel (+18mm)</option><option value="no">No Top (Countertop)</option></select>
          </label>
          <label>Side Panels Floor
            <select id="cside_floor"><option value="yes">Sides to Floor (Length = H)</option><option value="no">Under Top / Raised</option></select>
          </label>
          <label class="side-only" style="color:var(--ac);font-weight:700;">Side Panel: H - (mm)<input type="number" id="cside_sub" value="18" title="Side panel height deduction (-18mm for top board)"></label>
          <label class="side-only" style="color:var(--ac);font-weight:700;">Bottom: W - (mm)<input type="number" id="cbot_sub" value="36" title="Bottom panel width deduction (-36mm between side panels)"></label>
          <label class="stk-only">Fix Shelf Depth - (mm)<input type="number" id="cfr" value="20"></label>
          <label class="stk-only">Adjust Shelf Depth - (mm)<input type="number" id="car" value="36"></label>
          <label>Split Tall Pieces At (mm)<input type="number" id="csp" placeholder="Auto"></label>
          <label>Lipping per edge (mm)<input type="number" id="clp" value="0"></label>
        </div>
      </div>

      <div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center;">
        <span class="note">Side = Depth × Height. Doors take off gaps and lipping.</span>
        <button class="p" id="gen" style="font-size:13px;padding:9px 16px;">Preview Cabinet Pieces</button>
      </div>
    </section>

    <section class="np" id="pv" style="display:none;border:2px solid var(--ac);background:var(--sf);">
      <h2>
        <span>Cabinet Preview: Review &amp; Save to <b id="pvu"></b></span>
        <div style="display:flex;gap:8px;">
          <button id="pvd">Discard</button>
          <button class="p" id="pvs">Save to Unit</button>
        </div>
      </h2>
      <div id="pvm"></div>
      <div class="sc" style="margin-top:8px;">
        <table id="pvt"></table>
      </div>
    </section>

    <section>
      <div class="row np" style="margin-bottom:12px;justify-content:space-between;">
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="v1" class="p">By Unit</button>
          <button id="v2">By Board (Cutting List)</button>
          <button class="p" id="prt" style="font-weight:700;">🖨 Print List (A4)</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <label style="margin:0;">Stickers
            <select id="ssz">
              <option value="60x40">60 × 40 mm</option>
              <option value="50x30">50 × 30 mm</option>
              <option value="80x50">80 × 50 mm</option>
              <option value="100x50">100 × 50 mm</option>
              <option value="100x75">100 × 75 mm</option>
            </select>
          </label>
          <label style="margin:0;">Scope
            <select id="sfor">
              <option value="cur">Current Unit</option>
              <option value="all">All Units</option>
            </select>
          </label>
          <button class="p" id="stk">Print Stickers</button>
          <button id="mrg" style="font-weight:700;">⚡ Merge &amp; Sort</button>
          <button id="csv">Download CSV</button>
          <button id="txt">Download Text</button>
          <button id="cpy">Copy Text</button>
          <button id="clr" style="color:var(--warn);font-weight:600;">Clear Unit Parts</button>
        </div>
      </div>

      <div class="ph">
        <div id="pinfo">
          <span id="pcc"></span>
          <span id="pnm"></span>
          <span id="pun"></span>
        </div>
        <div class="phr">
          <span id="pco"></span>
          <span id="pdt"></span>
        </div>
      </div>

      <div id="out"></div>
    </section>
  </main>
</div>

<div id="labels"></div>

<script>
const $ = id => document.getElementById(id);
const val = (id, def = "") => { const el = $(id); return el ? el.value : def; };
const num = (id, def = 0) => { const el = $(id); return el && el.value !== "" ? (+el.value || 0) : def; };
const setVal = (id, v) => { const el = $(id); if (el) el.value = (v === undefined || v === null ? "" : v); };
const esc = s => String(s || "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const KEY = "cutsoft_v1";
let db = null;
try { db = JSON.parse(localStorage.getItem(KEY)); } catch(e) {}
const initialData = ${exportData};
if (!db || !Array.isArray(db.customers)) {
  db = initialData || { customers: [], cur: "", set: {} };
} else {
  // Always import or update the downloaded customer data
  if (initialData && initialData.customers && Array.isArray(initialData.customers)) {
    initialData.customers.forEach(ic => {
      const idx = db.customers.findIndex(c => c.id === ic.id);
      if (idx >= 0) {
        db.customers[idx] = ic;
      } else {
        db.customers.unshift(ic);
      }
    });
  }
  if (initialData && initialData.cur) db.cur = initialData.cur;
}

if (!db.set) db.set = (initialData && initialData.set) ? initialData.set : { co: "AL TASMEEM CARPENTRY", sl: 2440, sw: 1220, ws: 15, presets: {} };
if (!db.set.presets) db.set.presets = {};
if (initialData && initialData.set && initialData.set.presets) {
  Object.keys(initialData.set.presets).forEach(k => {
    if (k === "Drawer Unit") return;
    if (
      !db.set.presets[k] ||
      (k === "TV Unit" && db.set.presets[k].clay !== "side") ||
      (k === "Skirting Base unit" && db.set.presets[k].clay !== "side")
    ) {
      db.set.presets[k] = JSON.parse(JSON.stringify(initialData.set.presets[k]));
    }
  });
}
delete db.set.presets["Drawer Unit"];

const today = () => new Date().toISOString().slice(0, 10);
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch(e) {} }
const cur = () => db.customers.find(c => c.id === db.cur) || db.customers[0];

function newCust() {
  const c = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    code: "",
    name: "",
    date: today(),
    notes: "",
    units: ["Cupboard 1"],
    unit: "Cupboard 1",
    parts: [],
    mainBoard: "Color 273 18mm",
    backBoard: "Color 273 6mm",
    backType: "6"
  };
  db.customers.unshift(c);
  db.cur = c.id;
  save();
  fill();
  renderList();
  render();
  if ($("cn")) $("cn").focus();
}

if (!db.customers.length) newCust();
if (!cur()) db.cur = db.customers[0].id;

function fill() {
  const c = cur();
  setVal("cc", c.code);
  if ($("cc_color")) {
    $("cc_color").value = c.codeColor || "#ffffff";
    if (c.codeColor && $("cc")) {
      $("cc").style.backgroundColor = c.codeColor;
      $("cc").style.color = "#0f172a";
    } else if ($("cc")) {
      $("cc").style.backgroundColor = "";
      $("cc").style.color = "";
    }
  }
  setVal("cn", c.name);
  setVal("dt", c.date);
  setVal("nt", c.notes || "");
  setVal("co", db.set.co);
  setVal("sl", db.set.sl);
  setVal("sw", db.set.sw);
  setVal("ws", db.set.ws);
  setVal("cb", c.mainBoard || "Color 273 18mm");
  setVal("cb6", c.backBoard || "Color 273 6mm");
  setVal("cbt", c.backType || "6");
}

function renderList() {
  const q = val("srch").toLowerCase();
  const filtered = db.customers.filter(c => (c.name + " " + c.code).toLowerCase().includes(q));
  $("list").innerHTML = filtered.map(c =>
    \`<div class="c \${c.id === db.cur ? "on" : ""}" data-id="\${c.id}">
      <b>\${esc(c.name || "Untitled Customer")}</b>
      <small>Code \${esc(c.code || "-")} · \${(c.parts || []).length} parts · \${esc(c.date)}</small>
    </div>\`
  ).join("") || '<p class="note">No customer found.</p>';

  $("list").querySelectorAll(".c").forEach(d => {
    d.onclick = () => {
      db.cur = d.dataset.id;
      save();
      fill();
      renderList();
      render();
    };
  });
}

var pend = [], pendMsg = [], view = "unit", unitFilter = "all";
function un() { return cur().unit || "Unit 1"; }
function over(w, l) {
  const sl = +db.set.sl || 2440;
  const sw = +db.set.sw || 1220;
  return Math.max(w, l) > sl || Math.min(w, l) > sw;
}

function migrate() {
  db.customers.forEach(c => {
    c.parts = c.parts || [];
    c.parts.forEach(x => { if (!x.u) x.u = "Cupboard 1"; });
    if (!Array.isArray(c.units) || !c.units.length) {
      c.units = [...new Set(c.parts.map(x => x.u))];
      if (!c.units.length) c.units = ["Cupboard 1"];
    }
    c.parts.forEach(x => { if (!c.units.includes(x.u)) c.units.push(x.u); });
    if (!c.units.includes(c.unit)) c.unit = c.units[0];
    if (!c.mainBoard) c.mainBoard = "Color 273 18mm";
    if (!c.backBoard) c.backBoard = "Color 273 6mm";
    if (!c.backType) c.backType = "6";
  });
}

function shs(ar) { return ar * (1 + (+db.set.ws || 0) / 100) / ((+db.set.sl * +db.set.sw) / 1e6); }

function sumHtml(targetUnit) {
  const g = {};
  const isSep = targetUnit && targetUnit !== "all";
  const list = isSep ? (cur().parts || []).filter(x => x.u === targetUnit) : (cur().parts || []);
  list.forEach(x => { (g[x.b] = g[x.b] || []).push(x); });
  const rows = Object.entries(g).map(([b, blist]) => {
    let pcs = 0, ar = 0;
    blist.forEach(x => { pcs += x.q; ar += x.q * x.l * x.w / 1e6; });
    const sh = shs(ar);
    return \`<tr>
      <td style="font-weight:600;">\${esc(b)}</td>
      <td class="n">\${pcs}</td>
      <td class="n">\${ar.toFixed(2)} m²</td>
      <td class="n"><b>\${Math.ceil(sh)}</b> <small style="color:var(--mute)">(\${sh.toFixed(2)})</small></td>
    </tr>\`;
  }).join("");

  const scopeLabel = isSep ? ("Unit: " + esc(targetUnit)) : "All Units";

  return \`<div class="board" style="margin-top:20px;">
    <div class="board-header"><h3>Sheet Consumption Summary (\${scopeLabel}) — Stock: \${db.set.sl} × \${db.set.sw} mm (+\${db.set.ws}% Waste)</h3></div>
    <div class="sc"><table><thead><tr><th>Board Material</th><th class="n">Pieces</th><th class="n">Total Area (m²)</th><th class="n">Sheets Needed</th></tr></thead><tbody>\${rows || '<tr><td colspan="4" style="text-align:center;color:var(--mute);padding:12px;">No pieces for this unit</td></tr>'}</tbody></table></div>
  </div>\`;
}

function groups() {
  const g = {};
  (cur().parts || []).forEach(x => { (g[x.b] = g[x.b] || []).push(x); });
  return g;
}

function tagStr(r) {
  return Object.entries(r.t).map(([u, ps]) => u + ": " + Object.entries(ps).map(([p, q]) => p + " ×" + q).join(", ")).join(" | ");
}

function merged(list) {
  const m = {};
  list.forEach(x => {
    const k = x.w + "x" + x.l;
    const e = m[k] = m[k] || { l: x.l, w: x.w, q: 0, t: {} };
    e.q += x.q;
    const U = x.u || "General";
    e.t[U] = e.t[U] || {};
    e.t[U][x.p] = (e.t[U][x.p] || 0) + x.q;
  });
  return Object.values(m).sort((a, b) => b.l * b.w - a.l * a.w);
}

function rank(p) {
  const n = (p || '').toLowerCase();
  if (n.includes('side panel') || n.startsWith('side')) return 10;
  if (n.startsWith('top')) return 20;
  if (n.startsWith('bottom')) return 30;
  if (n.includes('divider') || n.includes('partition')) return 40;
  if (n.includes('fix shelf') || n.includes('fix shelves')) return 50;
  if (n.includes('adjust shelf') || n.includes('adjust shelves') || n.includes('shelf')) return 60;
  if (n.includes('drawer shelf')) return 70;
  if (n.startsWith('back')) return 80;
  if (n.startsWith('door')) return 90;
  if (n.startsWith('face')) return 100;
  if (n.includes('drawer side')) return 110;
  if (n.includes('drawer front')) return 120;
  if (n.includes('drawer back')) return 130;
  if (n.includes('drawer bottom')) return 140;
  if (n.includes('skirting')) return 150;
  return 200;
}

function sortCarpentry(arr) {
  return arr.sort((a, b) => {
    const ra = rank(a.p), rb = rank(b.p);
    if (ra !== rb) return ra - rb;
    const nc = (a.p || '').localeCompare(b.p || '');
    if (nc !== 0) return nc;
    return b.l * b.w - a.l * a.w;
  });
}

function mergeUnitParts(unitName) {
  const u = unitName || un();
  const uparts = cur().parts.filter(x => x.u === u);
  const others = cur().parts.filter(x => x.u !== u);
  const map = {};
  uparts.forEach(x => {
    const k = x.b + '|||' + (x.p || '').toLowerCase() + '|||' + Math.round(x.w) + '|||' + Math.round(x.l);
    if (map[k]) {
      map[k].q += x.q;
      if (x.pColor && !map[k].pColor) map[k].pColor = x.pColor;
    } else {
      map[k] = { ...x, w: Math.round(x.w), l: Math.round(x.l) };
    }
  });
  const mergedList = sortCarpentry(Object.values(map));
  cur().parts = [...others, ...mergedList];
}

function splitLen(L, sl, fr, manual, ref) {
  if (manual > 0 && ref > 0) {
    const a = Math.round(manual * L / ref);
    if (a > 0 && a < L) return { a: a, b: Math.round(L) - a, shelf: true };
  }
  const c = fr.map(f => f * L).filter(x => x <= sl && L - x <= sl).sort((p, q) => Math.abs(p - L / 2) - Math.abs(q - L / 2));
  const a = Math.round(c.length ? c[0] : L / 2);
  return { a: a, b: Math.round(L) - a, shelf: c.length > 0 };
}

function showPreview() {
  if (!$("pv")) return;
  sortCarpentry(pend);
  $("pv").style.display = "block";
  $("pvu").textContent = un();
  $("pvt").innerHTML = \`<thead>
    <tr>
      <th>Part Name (Editable)</th>
      <th>Board Material</th>
      <th class="n">Width (mm)</th>
      <th class="n">Length (mm)</th>
      <th class="n">Qty</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    \${pend.map((x, i) => \`<tr>
      <td><input class="ei" style="width:140px;font-weight:600;text-align:left;" type="text" data-i="\${i}" data-f="p" value="\${esc(x.p)}"></td>
      <td><input class="ei" style="width:130px;font-weight:700;color:var(--ac);text-align:left;" type="text" data-i="\${i}" data-f="b" value="\${esc(x.b)}"></td>
      <td class="n"><input class="ei" type="number" data-i="\${i}" data-f="w" value="\${x.w}"></td>
      <td class="n"><input class="ei" type="number" data-i="\${i}" data-f="l" value="\${x.l}"></td>
      <td class="n"><input class="ei" type="number" data-i="\${i}" data-f="q" value="\${x.q}"></td>
      <td>\${over(x.w, x.l) ? '<span style="color:var(--warn);font-weight:bold;">⚠ Exceeds Sheet</span>' : '<span style="color:var(--ac)">OK</span>'}</td>
    </tr>\`).join("")}
  </tbody>\`;

  $("pvt").querySelectorAll(".ei").forEach(inp => {
    inp.onchange = () => {
      const idx = +inp.dataset.i;
      const f = inp.dataset.f;
      pend[idx][f] = (f === "b" || f === "p") ? inp.value.trim() : (+inp.value || 0);
      showPreview();
    };
  });

  $("pvm").innerHTML = pendMsg.length
    ? \`<div class="alert-box">\${pendMsg.map(esc).join("<br>")}</div>\`
    : "";
  $("pv").scrollIntoView({ behavior: "smooth", block: "center" });
}

function render() {
  migrate();
  const c = cur();
  save();

  setVal("pco", db.set.co);
  const used = c.units.filter(n => c.parts.some(x => x.u === n));
  let unitTitle = "";
  if (view !== "board" && unitFilter !== "all") {
    unitTitle = "Unit: " + unitFilter;
  } else {
    unitTitle = used.length === 1 ? ("Unit: " + used[0]) : "";
  }

  if ($("pcc")) {
    $("pcc").textContent = "Cust code: " + (c.code || "-") + (c.notes ? " · Notes: " + c.notes : "");
    if (c.codeColor) {
      $("pcc").style.backgroundColor = c.codeColor;
      $("pcc").style.color = "#0f172a";
      $("pcc").style.padding = "2px 6px";
      $("pcc").style.borderRadius = "4px";
      $("pcc").style.display = "inline-block";
    } else {
      $("pcc").style.backgroundColor = "";
      $("pcc").style.color = "";
      $("pcc").style.padding = "";
      $("pcc").style.display = "";
    }
  }
  $("pnm").textContent = c.name || "Untitled Customer";
  $("pun").textContent = unitTitle;
  $("pdt").textContent = "Date: " + c.date;
  $("pco").textContent = db.set.co;

  $("usel").textContent = "New parts are currently added to unit: " + c.unit;
  $("units").innerHTML = c.units.map(n =>
    \`<button class="\${n === c.unit ? "p" : ""}" data-u="\${esc(n)}">\${esc(n)}</button>\`
  ).join("");
  $("units").querySelectorAll("button").forEach(bt => {
    bt.onclick = () => {
      c.unit = bt.dataset.u;
      unitFilter = bt.dataset.u;
      autoType();
      render();
    };
  });

  $("v1").className = view !== "board" ? "p" : "";
  $("v2").className = view === "board" ? "p" : "";

  const P = c.parts;
  $("bl").innerHTML = [...new Set(P.map(x => x.b))].map(x => \`<option value="\${esc(x)}">\`).join("");

  if (!P.length) {
    $("out").innerHTML = '<p class="note" style="padding:20px 0;text-align:center;">No parts added yet. Add a single part or use Parametric Cabinet Calculator above.</p>';
    return;
  }

  const WN = '<span style="color:var(--warn);font-weight:bold;">⚠ Exceeds Sheet</span>';

  if (view !== "board") {
    if (unitFilter !== "all" && !c.units.includes(unitFilter)) {
      unitFilter = "all";
    }

    const totalPcs = P.reduce((a, b) => a + b.q, 0);

    const unitTabsHtml = \`<div class="unit-tab-bar np">
      <div class="unit-tab-group">
        <span class="unit-tab-title">Separate Unit View:</span>
        <button type="button" class="unit-chip-btn \${unitFilter === 'all' ? 'p' : ''}" data-u="all">
          <span>All Units</span>
          <span class="unit-chip-count">\${totalPcs} pcs</span>
        </button>
        \${c.units.map(u => {
          const uPcs = P.filter(x => x.u === u).reduce((a, b) => a + b.q, 0);
          const isAct = unitFilter === u;
          return \`<button type="button" class="unit-chip-btn \${isAct ? 'p' : ''}" data-u="\${esc(u)}">
            <span>\${esc(u)}</span>
            <span class="unit-chip-count">\${uPcs} pcs</span>
          </button>\`;
        }).join("")}
      </div>
      \${unitFilter !== 'all' ? \`<div class="unit-sep-badge">
        <span>Viewing Unit Separately: <b>\${esc(unitFilter)}</b></span>
        <button type="button" id="sep-mrg" style="padding:3px 8px;font-size:11px;background:var(--ac);color:var(--aci);border:none;border-radius:4px;font-weight:700;cursor:pointer;">⚡ Auto-Merge &amp; Sort</button>
        <button type="button" id="sep-clr" style="padding:3px 8px;font-size:11px;background:var(--warn-bg);color:var(--warn);border:1px solid var(--warn);border-radius:4px;font-weight:700;cursor:pointer;">🗑 Clear Unit Parts</button>
      </div>\` : ''}
    </div>\`;

    const unitsToRender = unitFilter === "all" ? c.units : c.units.filter(u => u === unitFilter);
    const hasFilteredParts = unitsToRender.some(u => P.some(x => x.u === u));

    if (!hasFilteredParts) {
      $("out").innerHTML = unitTabsHtml + \`<div style="text-align:center;padding:32px 16px;color:var(--mute);border:1px dashed var(--line);border-radius:8px;background:var(--sf);">
        No parts found in \${unitFilter === 'all' ? 'any unit' : ('"' + esc(unitFilter) + '"')}. Use the Parametric Cabinet Calculator or Single Part form above to add pieces.
      </div>\` + sumHtml(unitFilter);

      $("out").querySelectorAll(".unit-chip-btn").forEach(btn => {
        btn.onclick = () => {
          unitFilter = btn.dataset.u;
          render();
        };
      });
      return;
    }

    const contentHtml = unitsToRender.map(n => {
      const L = P.map((x, i) => ({ x, i })).filter(o => o.x.u === n);
      if (!L.length) return "";
      const gb = [];
      L.forEach(o => {
        let g = gb.find(z => z.b === o.x.b);
        if (!g) { g = { b: o.x.b, list: [] }; gb.push(g); }
        g.list.push(o);
      });

      return gb.map(g => {
        g.list.sort((a, b) => {
          const ra = rank(a.x.p), rb = rank(b.x.p);
          if (ra !== rb) return ra - rb;
          const nc = (a.x.p || '').localeCompare(b.x.p || '');
          if (nc !== 0) return nc;
          return b.x.l * b.x.w - a.x.l * a.x.w;
        });

        const shouldSplit = g.list.length > 2;
        const half = shouldSplit ? Math.ceil(g.list.length / 2) : g.list.length;
        const c1 = g.list.slice(0, half);
        const c2 = shouldSplit ? g.list.slice(half) : [];

        const makeUnitTbl = (items) => {
          const rws = items.map(o => {
            const x = o.x;
            return \`<tr>
              <td style="font-weight:600;"><input class="ei" style="width:140px;font-weight:600;text-align:left;" type="text" data-i="\${o.i}" data-f="p" value="\${esc(x.p)}"></td>
              <td class="n"><input class="ei" type="number" data-i="\${o.i}" data-f="w" value="\${x.w}"></td>
              <td class="n"><input class="ei" type="number" data-i="\${o.i}" data-f="l" value="\${x.l}"></td>
              <td class="n" style="font-weight:700;"><input class="ei" type="number" data-i="\${o.i}" data-f="q" value="\${x.q}"></td>
              <td class="stat-col">\${over(x.w, x.l) ? WN : '<span style="color:var(--ac)">OK</span>'}</td>
              <td class="np" style="text-align:right;"><button class="x" data-d="\${o.i}">Delete</button></td>
            </tr>\`;
          }).join("");
          return \`<table>
            <thead>
              <tr>
                <th>Part Name (Editable)</th>
                <th class="n">Width (mm)</th>
                <th class="n">Length (mm)</th>
                <th class="n">Qty</th>
                <th class="stat-col">Status</th>
                <th class="np"></th>
              </tr>
            </thead>
            <tbody>\${rws}</tbody>
          </table>\`;
        };

        return \`<div class="board">
          <div class="board-header">
            <h3>Unit: \${esc(n)} — Board: \${esc(g.b)}</h3>
            <span style="font-size:11px;color:var(--mute)">(\${g.list.reduce((a, b) => a + b.x.q, 0)} pcs)</span>
          </div>
          <div class="sc \${c2.length ? 'print-split-grid' : ''}">
            <div>\${makeUnitTbl(c1)}</div>
            \${c2.length ? \`<div>\${makeUnitTbl(c2)}</div>\` : ''}
          </div>
        </div>\`;
      }).join("");
    }).join("") + sumHtml(unitFilter);

    $("out").innerHTML = unitTabsHtml + contentHtml;

    $("out").querySelectorAll(".unit-chip-btn").forEach(btn => {
      btn.onclick = () => {
        unitFilter = btn.dataset.u;
        render();
      };
    });

    const sepMrgBtn = $("sep-mrg");
    if (sepMrgBtn && unitFilter !== "all") {
      sepMrgBtn.onclick = () => {
        mergeUnitParts(unitFilter);
        renderList();
        render();
        alert("Merged and arranged parts for " + unitFilter + " in carpentry sequence!");
      };
    }

    const sepClrBtn = $("sep-clr");
    if (sepClrBtn && unitFilter !== "all") {
      sepClrBtn.onclick = () => {
        const u = unitFilter;
        const count = cur().parts.filter(x => x.u === u).length;
        if (!count) {
          alert('No parts found in selected unit: ' + u);
          return;
        }
        if (confirm('Clear all ' + count + ' parts in selected unit: ' + u + '? Parts in other units will remain safe.')) {
          cur().parts = cur().parts.filter(x => x.u !== u);
          renderList();
          render();
        }
      };
    }

    $("out").querySelectorAll(".ei").forEach(inp => {
      inp.onchange = () => {
        const f = inp.dataset.f;
        const val = f === "p" ? inp.value.trim() : (+inp.value || 0);
        cur().parts[+inp.dataset.i][f] = val;
        render();
      };
    });
    $("out").querySelectorAll("[data-d]").forEach(btn => {
      btn.onclick = () => {
        cur().parts.splice(+btn.dataset.d, 1);
        renderList();
        render();
      };
    });
    return;
  }

  $("out").innerHTML = Object.entries(groups()).map(([b, list]) => {
    let pcs = 0, area = 0;
    const mList = merged(list);
    mList.forEach(r => {
      pcs += r.q;
      area += r.q * r.l * r.w / 1e6;
    });

    const shouldSplit = mList.length > 2;
    const half = shouldSplit ? Math.ceil(mList.length / 2) : mList.length;
    const c1 = mList.slice(0, half);
    const c2 = shouldSplit ? mList.slice(half) : [];

    const makeBoardTbl = (items) => {
      const rws = items.map(r => {
        return \`<tr>
          <td class="s">\${r.w} × \${r.l}</td>
          <td class="n" style="font-weight:700;">\${r.q}</td>
          <td style="font-size:11.5px;">\${esc(tagStr(r))}</td>
          <td class="stat-col">\${over(r.w, r.l) ? WN : '<span style="color:var(--ac)">OK</span>'}</td>
          <td class="np" style="text-align:right;"><button class="x" data-b="\${esc(b)}" data-k="\${r.w}x\${r.l}">Delete</button></td>
        </tr>\`;
      }).join("");
      return \`<table>
        <thead>
          <tr>
            <th>Width × Length (mm)</th>
            <th class="n">Qty</th>
            <th>Used For</th>
            <th class="stat-col">Status</th>
            <th class="np"></th>
          </tr>
        </thead>
        <tbody>\${rws}</tbody>
      </table>\`;
    };

    const wf = 1 + (+db.set.ws || 0) / 100;
    const sA = (+db.set.sl * +db.set.sw) / 1e6;
    const totalSheets = Math.ceil(area * wf / sA);

    return \`<div class="board">
      <div class="board-header">
        <h3>Board: \${esc(b)}</h3>
        <span style="font-size:11px;color:var(--mute)">\${used.length > 1 ? "Used in: " + esc([...new Set(list.map(x => x.u))].join(", ")) : ""}</span>
      </div>
      <div class="sc \${c2.length ? 'print-split-grid' : ''}">
        <div>\${makeBoardTbl(c1)}</div>
        \${c2.length ? \`<div>\${makeBoardTbl(c2)}</div>\` : ''}
      </div>
      <div class="tot">
        <span>Total Pieces: <b>\${pcs}</b></span>
        <span>Net Area: <b>\${area.toFixed(2)} m²</b></span>
        <span>Sheets Needed (+\${db.set.ws}% waste): <b>\${totalSheets}</b></span>
      </div>
    </div>\`;
  }).join("");

  $("out").querySelectorAll(".x").forEach(btn => {
    btn.onclick = () => {
      cur().parts = cur().parts.filter(x => !(x.b === btn.dataset.b && (x.w + "x" + x.l) === btn.dataset.k));
      renderList();
      render();
    };
  });
}

function dl(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const fname = ext => "cutting-list-" + ((cur().name || "customer").replace(/[^\\w\\-]+/g, "_")) + "-" + cur().date + "." + ext;

function txt() {
  const c = cur();
  let t = db.set.co + "\\nCust code: " + c.code + "  Name: " + c.name + "  Date: " + c.date + "\\n";
  if (view !== "board") {
    c.units.forEach(n => {
      t += "\\nUnit: " + n + "\\n";
      c.parts.filter(x => x.u === n).forEach(x => {
        t += x.p + ": " + x.w + " x " + x.l + " mm  Qty " + x.q + "  (" + x.b + ")\\n";
      });
    });
  } else {
    Object.entries(groups()).forEach(([b, l]) => {
      t += "\\nBoard: " + b + "\\n";
      merged(l).forEach(r => {
        t += r.w + " x " + r.l + " mm  Qty " + r.q + "  (" + tagStr(r) + ")\\n";
      });
    });
  }
  return t;
}

function csv() {
  const q = s => '"' + String(s).replace(/"/g, '""') + '"';
  let t;
  if (view !== "board") {
    t = "Unit,Part,Board,Width,Length,Qty\\r\\n";
    cur().parts.forEach(x => {
      t += [q(x.u), q(x.p), q(x.b), x.w, x.l, x.q].join(",") + "\\r\\n";
    });
  } else {
    t = "Board,Width,Length,Qty,Used for\\r\\n";
    Object.entries(groups()).forEach(([b, l]) => {
      merged(l).forEach(r => {
        t += [q(b), r.w, r.l, r.q, q(tagStr(r))].join(",") + "\\r\\n";
      });
    });
  }
  return "\\ufeff" + t;
}

function nextName() {
  const base = (un().replace(/\\s*\\d+$/, "") || "Unit");
  let n = 1;
  while (cur().units.includes(base + " " + n)) n++;
  return base + " " + n;
}

function autoType() {
  const list = Object.keys(db.set.presets || {});
  const m = list.filter(k => un().toLowerCase().startsWith(k.toLowerCase())).sort((a, b) => b.length - a.length)[0];
  if (m) {
    ptypes(m);
    loadPreset();
  }
}

function askName(msg, def) {
  const n = (prompt(msg, def) || "").trim();
  if (!n) return null;
  if (cur().units.includes(n)) { alert("This unit name already exists."); return null; }
  return n;
}

$("ua").onclick = () => {
  const n = askName("Unit name:", nextName());
  if (!n) return;
  cur().units.push(n);
  cur().unit = n;
  autoType();
  renderList();
  render();
};

$("ur").onclick = () => {
  const o = un(), n = askName("New name for " + o + ":", o + " ");
  if (!n) return;
  cur().units = cur().units.map(x => x === o ? n : x);
  cur().parts.forEach(x => { if (x.u === o) x.u = n; });
  cur().unit = n;
  if (unitFilter === o) unitFilter = n;
  render();
};

$("uc").onclick = () => {
  const o = un(), n = askName("Copy all parts of " + o + " to:", nextName());
  if (!n) return;
  cur().units.push(n);
  cur().parts.filter(x => x.u === o).forEach(x => cur().parts.push({ ...x, u: n }));
  cur().unit = n;
  unitFilter = n;
  renderList();
  render();
};

$("ud").onclick = () => {
  const o = un();
  if (cur().units.length < 2) { alert("Keep at least one unit."); return; }
  if (confirm("Delete unit " + o + " and all its parts?")) {
    cur().parts = cur().parts.filter(x => x.u !== o);
    cur().units = cur().units.filter(x => x !== o);
    cur().unit = cur().units[0];
    if (unitFilter === o) unitFilter = "all";
    renderList();
    render();
  }
};

function stkClean() {
  delete document.body.dataset.print;
  $("labels").innerHTML = "";
  const e = document.getElementById("pgs");
  if (e) e.remove();
}

$("stk").onclick = () => {
  const c = cur();
  let sz = val("ssz", "60x40");
  const m = sz.match(/^(\\d+(?:\\.\\d+)?)\\s*[x×]\\s*(\\d+(?:\\.\\d+)?)$/i);
  if (!m) return;
  const W = +m[1], H = +m[2], k = Math.min(W / 50, H / 30), f = n => (n * k).toFixed(2) + "mm";
  const units = val("sfor") === "all" ? c.units : [c.unit];
  let html = "", n = 0;
  units.forEach(u => {
    c.parts.filter(x => x.u === u && x.q > 0).forEach(x => {
      for (let i = 1; i <= x.q; i++) {
        n++;
        html += \`<div class="lb">
          <div style="font-size:\${f(2.7)};display:flex;justify-content:space-between"><span style="\${c.codeColor ? \`background-color:\${c.codeColor};color:#0f172a;padding:1px 3px;border-radius:2px;font-weight:bold;-webkit-print-color-adjust:exact;print-color-adjust:exact;\` : ''}">\${esc(c.code)}</span><b>\${esc(c.name)}</b></div>
          <div style="font-size:\${f(3.5)};font-weight:bold;margin-top:\${f(0.5)}">\${esc(u)} – <span>\${esc(x.p)}</span></div>
          <div style="font-size:\${f(5.5)};font-weight:bold;margin:\${f(0.6)} 0;white-space:nowrap">\${x.w} × \${x.l} mm</div>
          <div style="font-size:\${f(2.7)};display:flex;justify-content:space-between"><span>\${esc(x.b)}</span><b>\${i}/\${x.q}</b></div>
        </div>\`;
      }
    });
  });

  if (!n) { alert("No parts to print stickers for."); return; }
  stkClean();
  $("labels").innerHTML = html;
  const st = document.createElement("style");
  st.id = "pgs";
  st.textContent = "@page{size:" + W + "mm " + H + "mm;margin:0}.lb{width:" + W + "mm;height:" + H + "mm}";
  document.head.appendChild(st);
  document.body.dataset.print = "stk";
  window.addEventListener("afterprint", stkClean, { once: true });
  window.print();
};

$("v1").onclick = () => { view = "unit"; render(); };
$("v2").onclick = () => { view = "board"; render(); };

if ($("mrg")) {
  $("mrg").onclick = () => {
    mergeUnitParts(un());
    renderList();
    render();
    alert("Merged duplicate parts in " + un() + " and arranged in carpentry sequence!");
  };
}

$("pvs").onclick = () => {
  const targetUnit = un();
  pend.filter(x => x.q > 0).forEach(np => {
    const ex = cur().parts.find(x => x.u === targetUnit && x.b === np.b && (x.p || '').toLowerCase() === (np.p || '').toLowerCase() && Math.round(x.w) === Math.round(np.w) && Math.round(x.l) === Math.round(np.l));
    if (ex) { ex.q += np.q; } else { cur().parts.push({ ...np, u: targetUnit }); }
  });
  mergeUnitParts(targetUnit);
  pend = [];
  $("pv").style.display = "none";
  unitFilter = targetUnit;
  view = "unit";
  renderList();
  render();
};

$("pvd").onclick = () => {
  pend = [];
  $("pv").style.display = "none";
};

$("newc").onclick = newCust;
$("srch").oninput = renderList;
$("delc").onclick = () => {
  if (confirm("Delete this customer and all parts?")) {
    db.customers = db.customers.filter(c => c.id !== db.cur);
    if (!db.customers.length) newCust();
    db.cur = db.customers[0].id;
    save();
    fill();
    renderList();
    render();
  }
};

[["cc","code"],["cn","name"],["dt","date"],["nt","notes"]].forEach(([id, k]) => {
  const el = $(id);
  if (el) el.oninput = () => { cur()[k] = el.value; renderList(); render(); };
});

if ($("cc_color")) {
  $("cc_color").oninput = () => {
    cur().codeColor = $("cc_color").value;
    if ($("cc")) {
      $("cc").style.backgroundColor = $("cc_color").value;
      $("cc").style.color = "#0f172a";
    }
    render();
  };
}

[["co","co"],["sl","sl"],["sw","sw"],["ws","ws"]].forEach(([id, k]) => {
  const el = $(id);
  if (el) el.oninput = () => { db.set[k] = id === "co" ? el.value : (+el.value || 0); render(); };
});

if ($("cb")) $("cb").oninput = () => {
  const val = $("cb").value;
  cur().mainBoard = val;
  save();
};
if ($("cb6")) $("cb6").oninput = () => {
  const val = $("cb6").value;
  cur().backBoard = val;
  save();
};
if ($("cbt")) $("cbt").onchange = () => {
  cur().backType = $("cbt").value;
  save();
};

if ($("pfs_sel")) {
  $("pfs_sel").onchange = () => {
    const s = +$("pfs_sel").value || 11;
    document.documentElement.style.setProperty("--pfs", s + "pt");
    document.documentElement.style.setProperty("--tfs", (s - 1) + "pt");
    document.documentElement.style.setProperty("--thfs", (s - 2) + "pt");
    document.documentElement.style.setProperty("--cpad", (s <= 10 ? "2pt 4pt" : s >= 12 ? "4pt 6pt" : "3pt 5pt"));
  };
}

$("add").onclick = () => {
  const b = val("b").trim() || cur().mainBoard || "Color 273 18mm";
  const p = val("p").trim() || "Part";
  const w = num("w");
  const l = num("l");
  const q = num("q", 1);
  const SL = +db.set.sl || 2440;

  if (!b || !w || !l || !q) { alert("Please fill in Board, Part Name, Width, Length and Qty."); return; }

  const push = (pp, ll) => {
    const rw = Math.round(w), rl = Math.round(ll), rq = Math.round(q);
    const ex = cur().parts.find(x => x.u === un() && x.b === b && (x.p || '').toLowerCase() === pp.toLowerCase() && Math.round(x.w) === rw && Math.round(x.l) === rl);
    if (ex) {
      ex.q += rq;
    } else {
      cur().parts.push({ b: b, u: un(), p: pp, l: rl, w: rw, q: rq });
    }
    mergeUnitParts(un());
  };

  if (l > SL && confirm("Length " + l + "mm is longer than the sheet (" + SL + "mm). Split into two pieces?")) {
    const lo = Math.floor(l / 2);
    push(p + " (lower)", lo);
    push(p + " (upper)", l - lo);
  } else {
    push(p, l);
  }

  setVal("w", "");
  setVal("l", "");
  setVal("q", 1);
  if ($("w")) $("w").focus();
  renderList();
  render();
};

["w","l","q"].forEach(id => {
  const el = $(id);
  if (el) el.addEventListener("keydown", e => { if (e.key === "Enter") $("add").click(); });
});

const PF = [
  "cdy","cdxr","cdsec","cdb6w","cskr","cdbk","cdmode","cdwr","clp","cdg","cdw","ctl","cdls","clay",
  "ctp","cdv","cfw","cfh","cu","cw","ch","cd","ct","cdn","cb","cb6","cf","cas","cdr","cds","cdsr",
  "cbt","cbw","cbh","cdh","csl","cdlr","cfr","car","csp","ccn","cn2","ctop","cside_floor","cside_sub","cbot_sub","cdb_color","ctd_sub","cdfh"
];

const DEFP = {
  "Cupboard": { cdy:"no", cdxr:36, cdmode:"door", cdwr:50, cfw:4, clp:0, cu:"Cupboard", cw:1000, ch:2100, cd:580, ct:18, cdn:2, cf:0, cas:3, cdr:0, cds:"", cdsr:100, cbt:"6", cbw:0, cbh:0, cdh:140, csl:26, cdlr:30, cfr:20, car:36, cskr:0, clay:"stack", cn2:1, ccn:0, ctd_sub:0, cdfh:180 },
  "TV Unit": { clay:"side", ctp:0, cdv:20, cfw:5, clp:0, cfh:23, cdg:24, ctl:0, cdls:50, cdw:"", cdy:"yes", cu:"TV Unit", cw:1800, ch:450, cd:400, ct:18, cdn:0, cf:0, cas:0, cdr:3, cds:"", cdsr:20, cbt:"18", cbw:0, cbh:0, cdh:140, csl:26, cdlr:30, cfr:20, car:40, cskr:0, cn2:1, cdbk:"6", cdb6w:17, ctop:"yes", cside_floor:"no" },
  "Skirting Base unit": { clay:"side", ctp:20, cdv:20, cfw:5, clp:0, cfh:23, cdg:24, ctl:0, cdls:50, cdw:"", cdy:"yes", cu:"Skirting Base unit", cw:1800, ch:800, cd:580, ct:18, cdn:2, cf:0, cas:0, cdr:3, cds:"", cdsr:20, cbt:"18", cbw:0, cbh:0, cdh:140, csl:26, cdlr:30, cfr:20, car:40, cskr:80, cn2:1, cdbk:"6", cdb6w:17, ctop:"yes", cside_floor:"yes", cside_sub:18, cbot_sub:36 }
};

if (!db.set) db.set = { presets: {} };
if (!db.set.presets) db.set.presets = {};
delete db.set.presets["Drawer Unit"];
Object.keys(DEFP).forEach(k => {
  if (!db.set.presets[k] || typeof db.set.presets[k] !== "object") {
    db.set.presets[k] = JSON.parse(JSON.stringify(DEFP[k]));
  } else {
    Object.keys(DEFP[k]).forEach(prop => {
      if (db.set.presets[k][prop] === undefined || db.set.presets[k][prop] === null) {
        db.set.presets[k][prop] = DEFP[k][prop];
      }
    });
    if (k === "TV Unit" || k === "Skirting Base unit") {
      db.set.presets[k].clay = "side";
    }
  }
});

function ptypes(sel) {
  const ptypeEl = $("ptype");
  const chipsEl = $("ptypes-chips");
  if (!ptypeEl) return;
  delete db.set.presets["Drawer Unit"];
  const list = Object.keys(db.set.presets || {}).filter(k => k !== "Drawer Unit");
  if (!list.length) list.push("Cupboard", "TV Unit", "Skirting Base unit");
  const chosen = (sel && list.includes(sel)) ? sel : (list.includes(ptypeEl.value) ? ptypeEl.value : list[0]);

  ptypeEl.innerHTML = list.map(k => \`<option value="\${esc(k)}">\${esc(k)}</option>\`).join("");
  ptypeEl.value = chosen;

  if (chipsEl) {
    chipsEl.innerHTML = list.map(k => {
      const isAct = k === chosen;
      return \`<button type="button" class="preset-chip \${isAct ? 'p' : ''}" data-type="\${esc(k)}" style="padding:4px 11px;font-size:12px;border-radius:6px;\${isAct ? 'font-weight:700;' : ''}">\${esc(k)}</button>\`;
    }).join("");

    chipsEl.querySelectorAll(".preset-chip").forEach(btn => {
      btn.onclick = () => {
        const t = btn.dataset.type;
        ptypes(t);
        loadPreset();
      };
    });
  }
}

function lay() {
  const sd = val("clay") === "side";
  document.querySelectorAll(".stk").forEach(e => e.style.display = sd ? "none" : "");
  document.querySelectorAll(".stk-only").forEach(e => e.style.display = sd ? "none" : "");
  document.querySelectorAll(".side-only").forEach(e => e.style.display = sd ? "" : "none");
  const hasDrawers = sd || val("cdy") === "yes";
  if ($("cdyl")) $("cdyl").style.display = sd ? "none" : "";
  document.querySelectorAll(".drw").forEach(e => { e.style.display = hasDrawers ? "" : "none"; });
  if ($("cdn-box")) {
    if (sd) {
      const isZero = num("cdr") === 0;
      $("cdn-box").style.display = "";
      if ($("cdn-box").firstChild) {
        $("cdn-box").firstChild.textContent = isZero ? "How Many Doors (Active: 0 Drawers)" : "How Many Doors (if Drawers = 0)";
      }
    } else {
      $("cdn-box").style.display = "";
      if ($("cdn-box").firstChild) {
        $("cdn-box").firstChild.textContent = "Doors (Qty)";
      }
    }
  }
}

if ($("clay")) $("clay").onchange = lay;
if ($("cdr")) $("cdr").oninput = lay;
if ($("cdy")) $("cdy").onchange = () => {
  if (val("cdy") === "yes" && num("cdr") === 0) setVal("cdr", 1);
  lay();
};
if ($("cdbk")) $("cdbk").onchange = () => {
  const is18 = val("cdbk") === "18";
  const curColor = val("cdb_color");
  if (is18) {
    if (!curColor || /6\s*mm/i.test(curColor)) setVal("cdb_color", val("cb") || cur().mainBoard || "Color 273 18mm");
  } else {
    if (!curColor || /18\s*mm/i.test(curColor)) setVal("cdb_color", val("cb6") || cur().backBoard || "Color 273 6mm");
  }
};

function loadPreset() {
  const type = val("ptype", "Cupboard");
  const v = (db.set.presets && db.set.presets[type]) || DEFP[type] || DEFP["Cupboard"] || {};
  const dv = DEFP[type] || DEFP["Cupboard"] || {};
  PF.forEach(id => {
    const el = $(id);
    if (!el) return;
    if (id in v && v[id] !== undefined && v[id] !== null && v[id] !== "") el.value = v[id];
    else if (id in dv && dv[id] !== undefined && dv[id] !== null) el.value = dv[id];
  });

  if (type === "Skirting Base unit") {
    setVal("clay", "side");
    setVal("cskr", 80);
    setVal("ctop", "yes");
    setVal("cside_floor", "yes");
    setVal("cside_sub", 18);
    setVal("cbot_sub", 36);
  }
  if (type === "TV Unit") {
    setVal("clay", "side");
    setVal("ctp", 0);
    setVal("ctl", 0);
    if (!num("cdh")) setVal("cdh", 140);
    if (!num("cdls")) setVal("cdls", 50);
    if (!num("cdg")) setVal("cdg", 24);
  }

  if (cur().mainBoard) setVal("cb", cur().mainBoard);
  if (cur().backBoard) setVal("cb6", cur().backBoard);
  if (cur().backType) setVal("cbt", cur().backType);
  lay();
}

function savePreset(name) {
  if (!db.set.presets) db.set.presets = {};
  const v = {};
  PF.forEach(id => {
    const el = $(id);
    if (el) v[id] = el.type === "number" ? (+el.value || 0) : el.value;
  });
  v.cu = name;
  db.set.presets[name] = v;
  save();
}

if ($("ptype")) $("ptype").onchange = () => {
  ptypes($("ptype").value);
  loadPreset();
};

if ($("psave")) $("psave").onclick = () => {
  const t = val("ptype", "Cupboard");
  savePreset(t);
  alert("Saved preset rules for " + t + ".");
};

if ($("pnew")) $("pnew").onclick = () => {
  const n = (prompt("Enter new cabinet preset name (e.g. Dressing, Shoe Rack):") || "").trim();
  if (!n) return;
  savePreset(n);
  ptypes(n);
  loadPreset();
};

if ($("padv")) $("padv").onclick = () => {
  const box = $("adv-box");
  if (!box) return;
  const isHidden = box.style.display === "none";
  box.style.display = isHidden ? "block" : "none";
  $("padv").textContent = isHidden ? "Hide Settings" : "More Settings";
};

ptypes("Cupboard");
loadPreset();
lay();

$("gen").onclick = () => {
  const b = val("cb").trim() || cur().mainBoard || "Color 273 18mm";
  const b6 = val("cb6").trim() || cur().backBoard || "Color 273 6mm";
  const bt = val("cbt", "6");
  const b18 = bt === "18" ? (val("cb6").trim() || b) : b;
  const u = un();

  const K = Math.max(1, num("cn2", 1));
  const W = num("cw", 1000);
  const H = num("ch", 2100);
  const D = num("cd", 580);
  const T = num("ct", 18);
  const N = num("cdn", 2);
  const F = num("cf", 0);
  const A = num("cas", 3);
  const ptype = val("ptype", "Cupboard");

  const isSide = val("clay") === "side";
  const NOD = !isSide && (val("cdy") === "no" || (num("cdr") === 0 && val("cdy") !== "yes"));
  const DR = NOD ? 0 : num("cdr", 0);

  if (!W || !H || !D) {
    alert("Please enter valid Width, Height, and Depth.");
    return;
  }

  const iw = W - 2 * T;
  const dsq = NOD ? 0 : (val("cds") === "" ? (DR > 0 ? 1 : 0) : num("cds"));
  const dsd = D - num("cdsr", 100);
  const dlen = dsd - num("cdlr", 30);
  const dh = num("cdh", 140);
  const sl = num("csl", 26);
  const bw = iw + num("cbw", 0);
  const cbhVal = num("cbh", 0);
  const topThick = val("ctop") === "no" ? 0 : T;
  const botThick = T;
  const bh = cbhVal > 0 ? Math.max(50, H - cbhVal - num("cskr", 0)) : Math.max(50, H - topThick - botThick - num("cskr", 0));

  const lp = 2 * num("clp", 0);
  const bot6 = val("cdbk", "6") === "6";
  const gw = bot6 ? num("cdb6w", 17) : 0;
  let bbd = val("cdb_color", "").trim();
  if (!bbd) {
    if (bot6) {
      bbd = b6;
      if (!/6\s*mm/i.test(bbd)) bbd = bbd.replace(/\s*18\s*mm/i, "") + " 6mm";
    } else {
      bbd = b;
      if (!/18\s*mm/i.test(bbd)) bbd = bbd.replace(/\s*6\s*mm/i, "") + " 18mm";
    }
  }

  pend = [];
  pendMsg = [];

  const SL = +db.set.sl || 2440;
  const manual = num("csp", 0);
  const fr = [];
  for (let i = 1; i <= F + A; i++) fr.push(i / (F + A + 1));

  const q0 = (bb, p, l, w, q) => {
    if (q > 0 && l > 0 && w > 0) {
      pend.push({ b: bb, u: u, p: p, l: Math.round(l), w: Math.round(w), q: Math.round(q * K) });
    }
  };

  const add = (bb, p, l, w, q) => {
    if (!(q > 0 && l > 0 && w > 0)) return;
    if (/^(Side Panel|Back)/.test(p) && l > SL) {
      const sp = splitLen(l, SL, fr, manual, H);
      q0(bb, p + " (lower)", sp.a, w, q);
      q0(bb, p + " (upper)", sp.b, w, q);
      pendMsg.push(p + " (" + Math.round(l) + "mm) exceeds " + SL + "mm sheet. Split into " + sp.a + " + " + sp.b + "mm " + (sp.shelf ? "at shelf." : "in center."));
      return;
    }
    q0(bb, p, l, w, q);
  };

  if (val("clay") === "side") {
    const isSkirting = (val("ptype") || "").toLowerCase().includes("skirt") || num("cskr") > 0;
    const skirting = Math.max(0, num("cskr", 0));
    const hasDrawers = val("cdy") !== "no" && DR > 0;
    const n = Math.max(1, DR || (num("cdn") > 0 ? num("cdn") : 2));
    const area = val("cdw") === "" ? iw : num("cdw");
    const hin = Math.max(100, H - 2 * T);
    const dl = Math.max(100, D - num("cdls", 50));
    const dheight = Math.max(80, dh || 140);

    const sideToFloor = val("cside_floor") === "yes" || isSkirting;
    const sideSub = $("cside_sub") ? num("cside_sub", (isSkirting ? 18 : 0)) : (isSkirting ? 18 : 0);
    const sideLength = sideToFloor ? Math.max(50, H - sideSub) : hin;
    add(b, "Side Panel", sideLength, D, 2);

    if (val("ctop") !== "no") {
      const isTV = (val("cu") || "").toLowerCase().includes("tv") || ($("ptype") && $("ptype").value === "TV Unit");
      const topLength = (isTV || sideSub > 0)
        ? Math.max(50, W + num("ctl", 0))
        : Math.max(50, W - 2 * T + num("ctl", 0));
      const topDepth = isTV
        ? Math.max(50, D + num("ctp", 0))
        : (sideSub === 0 ? Math.max(50, D + num("ctp", 0)) : Math.max(50, D + num("ctp", 20)));
      add(b, "Top", topLength, topDepth, 1);
    }
    const botSub = $("cbot_sub") ? num("cbot_sub", (isSkirting ? 36 : 0)) : (isSkirting ? 36 : 0);
    const bottomW = Math.max(50, W - botSub);
    add(b, "Bottom", bottomW, D, 1);

    const dividerH = Math.max(50, hin - skirting);
    const dividerCount = hasDrawers ? (n > 1 ? n - 1 : 0) : (num("cdn") > 1 ? num("cdn") - 1 : (n > 1 ? n - 1 : 1));
    if (dividerCount > 0) {
      add(b, "Divider", dividerH, D - num("cdv", 20), dividerCount);
    }

    // Drawer Width Formula: (W - 2 side panels - dividers*T) / n - slide channel - 2 drawer sides
    const totalClearWidth = (val("cdw") !== "" && num("cdw") > 0)
      ? (num("cdw") - dividerCount * T)
      : (W - 2 * T - dividerCount * T);
    const openingPerDrawer = totalClearWidth / n;
    const boxOuterWidth = openingPerDrawer - sl;
    const fb = Math.max(80, Math.round(boxOuterWidth - 2 * T));

    if (skirting > 0) {
      add(b, "Skirting", iw, skirting, 1);
    }

    const backW = Math.max(50, area - num("cbw", 0));
    const backH = Math.max(50, hin - skirting - num("cbh", 0));

    if (bt === "6") add(b6, "Back 6mm", backW, backH, 1);
    if (bt === "18") add(b18, "Back 18mm", backW, backH, 1);

    if (!hasDrawers) {
      const doorCount = num("cdn", 2) || 2;
      const doorHeight = Math.max(50, H - skirting - num("cfh", 23) - lp);
      const doorWidth = Math.max(50, Math.floor(W / doorCount - num("cfw", 5)) - lp);
      add(b, "Door", doorHeight, doorWidth, doorCount);
    } else {
      add(b, "Drawer sides", dl, dheight, 2 * n);
      add(b, "Drawer front", fb, dheight, n);
      add(b, "Drawer back", fb, dheight, n);
      const drawerBottomPartName = bot6 ? "Drawer bottom 6mm" : "Drawer bottom 18mm";
      add(bbd, drawerBottomPartName, Math.max(80, dl - 2 * T + gw), Math.max(80, fb + gw), n);
      add(b, "Face", Math.max(50, H - skirting - num("cfh", 23) - lp), Math.max(50, Math.floor(W / n - num("cfw", 5)) - lp), n);
    }

    sortCarpentry(pend);
    showPreview();
    return;
  }

  add(b, "Side Panel", H, D, 2);
  const topDepthSub = num("ctd_sub", 0);
  const topDepth = Math.max(50, D - topDepthSub);
  add(b, "Top", iw, topDepth, 1);
  add(b, "Bottom", iw, D, 1);

  const bay = val("cdmode", "door") === "door" && N > 1;
  const shw = bay ? (iw - (N - 1) * T) / N : iw;
  const shm = bay ? N : 1;

  if (F > 0) add(b, "Fix Shelves", shw, D - num("cfr", 20), F * shm);
  if (A > 0) add(b, "Adjust Shelves", shw, D - num("car", 36), A * shm);
  if (dsq > 0) add(b, "Drawer Shelves", shw, dsd, dsq * shm);

  if (bay && N > 1) add(b, "Divider", H - 2 * T, D - 26, N - 1);

  if (DR > 0) {
    const leaveSpace = num("cdwr", 50);
    const runnerThick = num("csl", 26);
    const connSide = Math.abs(num("ccn", 0));
    const isDoorSpace = val("cdmode", "door") === "door" && N > 1;
    let bx;
    let by = 1;

    if (isDoorSpace) {
      const bayWidth = (iw - (N - 1) * T) / N;
      bx = Math.round(bayWidth - leaveSpace - runnerThick - connSide);
      by = val("cdsec") === "one" ? 1 : N;
    } else {
      const hingeSides = N === 1 ? 1 : (N === 0 ? 0 : 2);
      const totalLeave = hingeSides * leaveSpace;
      bx = Math.round(iw - totalLeave - runnerThick - connSide);
      by = 1;
    }

    const innerFront = Math.max(80, Math.round(bx - 2 * T));
    const dheight = Math.max(80, dh || 140);
    const dlength = Math.max(100, dlen || D - 130);

    const gap = num("cfw", 4);
    let faceW;
    if (isDoorSpace) {
      const bayWidth = (iw - (N - 1) * T) / N;
      faceW = Math.max(50, Math.round(bayWidth - leaveSpace - gap - lp));
    } else {
      const hingeSides = N === 1 ? 1 : 2;
      const bothSidesLeave = hingeSides * leaveSpace;
      faceW = Math.max(50, Math.round(iw - bothSidesLeave - gap - lp));
    }
    const faceHeightInput = num("cdfh", 0) > 0 ? num("cdfh", 0) : (num("cfh", 0) > 0 ? num("cfh", 0) : (dh ? dh + 40 : 180));
    const faceH = Math.max(50, Math.round(faceHeightInput - lp));

    add(b, "Face", faceH, faceW, DR * by);
    add(b, "Drawer sides", dlength, dheight, 2 * DR * by);
    add(b, "Drawer front", innerFront, dheight, DR * by);
    add(b, "Drawer back", innerFront, dheight, DR * by);
    const drawerBottomPartName = bot6 ? "Drawer bottom 6mm" : "Drawer bottom 18mm";
    add(bbd, drawerBottomPartName, Math.max(80, dlength - 2 * T + gw), Math.max(80, innerFront + gw), DR * by);
  }

  if (bt === "6") add(b6, "Back 6mm", bh, bw, 1);
  if (bt === "18") add(b18, "Back 18mm", bh, bw, 1);

  if (N > 0) {
    add(b, "Door", H - num("cfw", 4) - num("cskr", 0) - lp, Math.floor(W / N - num("cfw", 4)) - lp, N);
  }

  sortCarpentry(pend);
  showPreview();
};

$("prt").onclick = () => window.print();

$("csv").onclick = () => dl(fname("csv"), csv(), "text/csv;charset=utf-8;");
$("txt").onclick = () => dl(fname("txt"), txt(), "text/plain;charset=utf-8;");
$("cpy").onclick = () => {
  const t = txt();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(() => alert("Cutting list copied to clipboard!"));
  } else {
    alert("Copying not supported in this browser.");
  }
};
if ($("uclr")) {
  $("uclr").onclick = () => {
    const targetUnit = un();
    const count = (cur().parts || []).filter(x => x.u === targetUnit).length;
    if (!count) {
      alert('No parts found in selected unit: ' + targetUnit);
      return;
    }
    if (confirm('Clear all ' + count + ' parts in selected unit: ' + targetUnit + '? Other units will remain safe.')) {
      cur().parts = cur().parts.filter(x => x.u !== targetUnit);
      renderList();
      render();
    }
  };
}

$("clr").onclick = () => {
  const targetUnit = (view !== "board" && unitFilter !== "all") ? unitFilter : un();
  const count = (cur().parts || []).filter(x => x.u === targetUnit).length;
  if (!count) {
    alert('No parts found in selected unit: ' + targetUnit);
    return;
  }
  if (confirm('Clear all ' + count + ' parts in selected unit: ' + targetUnit + '? Parts in other units will remain safe.')) {
    cur().parts = cur().parts.filter(x => x.u !== targetUnit);
    renderList();
    render();
  }
};
$("bk").onclick = () => dl("cutting-backup-" + today() + ".json", JSON.stringify(db, null, 2), "application/json");
$("rs").onclick = () => $("rf").click();
$("rf").onchange = e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!Array.isArray(d.customers)) throw new Error("Invalid format");
      db = d;
      save();
      fill();
      ptypes(val("ptype", "Cupboard"));
      loadPreset();
      renderList();
      render();
      alert("Backup restored successfully!");
    } catch (x) {
      alert("Invalid backup file. Please select a valid JSON backup.");
    }
  };
  r.readAsText(f);
};

fill();
renderList();
render();
ptypes("Cupboard");
loadPreset();
autoType();
</script>
</body>
</html>`;
}
