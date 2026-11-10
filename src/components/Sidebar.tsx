/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Customer, AppDatabase } from '../types/cutting';
import {
  Users,
  Plus,
  Search,
  Download,
  Upload,
  Laptop,
  Layers,
  Sparkles,
  Calendar,
  Box,
} from 'lucide-react';

interface SidebarProps {
  db: AppDatabase;
  onSelectCustomer: (id: string) => void;
  onNewCustomer: () => void;
  onBackup: () => void;
  onRestore: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExportStandalone: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  db,
  onSelectCustomer,
  onNewCustomer,
  onBackup,
  onRestore,
  onExportStandalone,
}) => {
  const [search, setSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = db.customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.code || '').toLowerCase().includes(q) ||
      (c.notes || '').toLowerCase().includes(q)
    );
  });

  const totalParts = db.customers.reduce((acc, c) => acc + (c.parts?.length || 0), 0);
  const activeCustomer = db.customers.find((c) => c.id === db.cur) || db.customers[0];

  return (
    <aside className="w-80 shrink-0 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col h-screen select-none print:hidden">
      {/* Brand & App Title */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black shadow-lg shadow-emerald-900/40">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">CUTTING LIST</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {db.set.co || 'Carpentry Workshop Suite'}
            </div>
          </div>
        </div>
      </div>

      {/* Top Action: New Customer Button */}
      <div className="p-3 pb-2">
        <button
          onClick={onNewCustomer}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-sm active:scale-[0.99] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Customer Order</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, code..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/90 border border-slate-700/80 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Customer Count / Section Header */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/60 bg-slate-900/40">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Customers ({filteredCustomers.length})
        </span>
        <span className="text-[10px] text-slate-500 lowercase">
          {totalParts} total parts
        </span>
      </div>

      {/* Customer List Scrollable */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No customer orders found
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const isSelected = cust.id === activeCustomer?.id;
            const partsCount = (cust.parts || []).length;
            const unitsCount = (cust.units || []).length;

            return (
              <div
                key={cust.id}
                onClick={() => onSelectCustomer(cust.id)}
                className={`group p-2.5 rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 text-white shadow-md shadow-black/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r" />
                )}
                <div className="flex items-start justify-between gap-1 pl-1">
                  <div className="font-semibold text-xs leading-snug line-clamp-1 text-slate-100">
                    {cust.name || 'Untitled Customer'}
                  </div>
                  {cust.code && (
                    <span className="shrink-0 text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-700/60 text-emerald-400 border border-slate-600/50">
                      {cust.code}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-1 pl-1 text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Box className="w-3 h-3 text-slate-500" />
                    {unitsCount} {unitsCount === 1 ? 'unit' : 'units'} · {partsCount} parts
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    {cust.date || '-'}
                  </span>
                </div>

                {cust.notes && (
                  <div className="mt-1 pl-1 text-[10px] text-slate-400 italic line-clamp-1 border-t border-slate-800/60 pt-0.5">
                    {cust.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Standalone PC App Promotion Banner */}
      <div className="p-3 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800/80">
        <button
          onClick={onExportStandalone}
          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-500 transition-all text-xs font-semibold group cursor-pointer shadow-sm"
          title="Download single-file standalone offline software for Windows/Mac"
        >
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <div className="font-bold text-[11px] text-emerald-300">Download PC Software</div>
              <div className="text-[10px] text-emerald-400/80 font-normal">Runs 100% Offline (.html)</div>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Backup & Restore Tools */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] flex items-center gap-2">
        <button
          onClick={onBackup}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition cursor-pointer border border-slate-700/60"
          title="Backup all customer cutting lists to JSON file"
        >
          <Download className="w-3 h-3 text-slate-400" />
          <span>Backup JSON</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition cursor-pointer border border-slate-700/60"
          title="Restore database from a saved JSON backup"
        >
          <Upload className="w-3 h-3 text-slate-400" />
          <span>Restore</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onRestore}
          accept=".json"
          className="hidden"
        />
      </div>
    </aside>
  );
};
