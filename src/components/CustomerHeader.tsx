/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Customer, AppSettings } from '../types/cutting';
import {
  Building2,
  Trash2,
  Maximize2,
  Percent,
  Layers,
  Palette,
  FileSpreadsheet,
} from 'lucide-react';

import { FillColorPicker } from './FillColorPicker';

interface CustomerHeaderProps {
  customer: Customer;
  settings: AppSettings;
  onUpdateCustomer: (updates: Partial<Customer>) => void;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onDeleteCustomer: () => void;
}

export const CustomerHeader: React.FC<CustomerHeaderProps> = ({
  customer,
  settings,
  onUpdateCustomer,
  onUpdateSettings,
  onDeleteCustomer,
}) => {
  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-4">
      {/* Top row: Section title & Delete customer button */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Customer Order &amp; Workshop Specs
          </h2>
        </div>
        <button
          onClick={onDeleteCustomer}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
          title="Delete current customer order"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Order</span>
        </button>
      </div>

      {/* Primary Customer Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Cust Code
            </label>
            <FillColorPicker
              color={customer.codeColor}
              onChange={(color) => onUpdateCustomer({ codeColor: color })}
              title="Fill Color for Customer Code"
              size="xs"
            />
          </div>
          <input
            type="text"
            value={customer.code}
            onChange={(e) => onUpdateCustomer({ code: e.target.value })}
            placeholder="e.g. C-104"
            style={
              customer.codeColor
                ? {
                    backgroundColor: customer.codeColor,
                    color: '#0f172a',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }
                : undefined
            }
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
            Customer Name
          </label>
          <input
            type="text"
            value={customer.name}
            onChange={(e) => onUpdateCustomer({ name: e.target.value })}
            placeholder="e.g. Ahmed Al Mansoori"
            className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
            Order Date
          </label>
          <input
            type="date"
            value={customer.date}
            onChange={(e) => onUpdateCustomer({ date: e.target.value })}
            className="w-full px-2.5 py-1.5 text-xs font-mono rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
            Order Notes / Location
          </label>
          <input
            type="text"
            value={customer.notes}
            onChange={(e) => onUpdateCustomer({ notes: e.target.value })}
            placeholder="e.g. Master Bedroom, Hinged..."
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      {/* Workshop Board Materials Bar (Synced with Calculator) */}
      <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
            <Palette className="w-3.5 h-3.5" />
            <span>Workshop Order Board Materials</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
            Synced with Calculator
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1 uppercase tracking-wide">
              Main Board 18mm Name
            </label>
            <input
              type="text"
              value={customer.mainBoard}
              onChange={(e) => onUpdateCustomer({ mainBoard: e.target.value })}
              placeholder="e.g. Color 273 18mm"
              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1 uppercase tracking-wide">
              Back Board 18mm / 6mm Name
            </label>
            <input
              type="text"
              value={customer.backBoard}
              onChange={(e) => onUpdateCustomer({ backBoard: e.target.value })}
              placeholder="e.g. Color 273 6mm"
              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1 uppercase tracking-wide">
              Back Panel Option
            </label>
            <select
              value={customer.backType || '6'}
              onChange={(e) => onUpdateCustomer({ backType: e.target.value as '6' | '18' | '0' })}
              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="6">6mm Back Panel</option>
              <option value="18">18mm Back Panel</option>
              <option value="0">No Back Panel</option>
            </select>
          </div>

          {/* Drawer Bottom Board - Shifted UP next to Back Panel Option */}
          <div>
            <label className="block text-[11px] font-bold text-emerald-900 dark:text-emerald-200 mb-1 uppercase tracking-wide">
              Drawer Bottom Board
            </label>
            <select
              value={customer.drawerBottomType || ((customer.drawerBottomBoard && /18\s*mm/i.test(customer.drawerBottomBoard)) ? '18' : '6')}
              onChange={(e) => {
                const val = e.target.value as '6' | '18';
                const current = customer.drawerBottomBoard || '';
                let nextColor = current;
                if (val === '18') {
                  if (!current || /6\s*mm/i.test(current)) {
                    nextColor = current ? current.replace(/6\s*mm/i, '18mm') : (customer.mainBoard || 'Color 273 18mm');
                  }
                } else {
                  if (!current || /18\s*mm/i.test(current)) {
                    nextColor = current ? current.replace(/18\s*mm/i, '6mm') : (customer.backBoard || 'Color 273 6mm');
                  }
                }
                onUpdateCustomer({
                  drawerBottomType: val,
                  drawerBottomBoard: nextColor,
                });
              }}
              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="6">6mm Board</option>
              <option value="18">18mm Board</option>
            </select>
          </div>

          {/* Drawer Bottom Color - Shifted UP next to Drawer Bottom Board */}
          <div>
            <label
              style={{ backgroundColor: '#a7651f' }}
              className="block text-[11px] font-bold text-white uppercase mb-1 px-1.5 py-0.5 rounded flex items-center justify-between"
            >
              <span>Drawer Bottom Color</span>
              <span className="text-[9px] font-mono px-1 bg-black/25 text-white rounded">
                {(customer.drawerBottomType || ((customer.drawerBottomBoard && /18\s*mm/i.test(customer.drawerBottomBoard)) ? '18' : '6')) === '18' ? '18mm' : '6mm'}
              </span>
            </label>
            <input
              type="text"
              value={customer.drawerBottomBoard || ''}
              onChange={(e) => onUpdateCustomer({ drawerBottomBoard: e.target.value })}
              placeholder={
                (customer.drawerBottomType || ((customer.drawerBottomBoard && /18\s*mm/i.test(customer.drawerBottomBoard)) ? '18' : '6')) === '18'
                  ? 'e.g. Color 273 18mm'
                  : 'e.g. Color 273 6mm'
              }
              title="Edit the exact color or board name for drawer bottom pieces"
              className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Workshop Sheet Specs & Saw Waste */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            Company Name
          </label>
          <input
            type="text"
            value={settings.co}
            onChange={(e) => onUpdateSettings({ co: e.target.value })}
            placeholder="e.g. AL TASMEEM CARPENTRY"
            className="w-full px-2.5 py-1.5 text-xs font-semibold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Maximize2 className="w-3 h-3 text-slate-400" />
            Sheet Length (mm)
          </label>
          <input
            type="number"
            value={settings.sl}
            onChange={(e) => onUpdateSettings({ sl: Number(e.target.value) || 2440 })}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            Sheet Width (mm)
          </label>
          <input
            type="number"
            value={settings.sw}
            onChange={(e) => onUpdateSettings({ sw: Number(e.target.value) || 1220 })}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
            <Percent className="w-3 h-3 text-slate-400" />
            Saw Blade Waste %
          </label>
          <input
            type="number"
            value={settings.ws}
            onChange={(e) => onUpdateSettings({ ws: Number(e.target.value) || 0 })}
            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
    </section>
  );
};
