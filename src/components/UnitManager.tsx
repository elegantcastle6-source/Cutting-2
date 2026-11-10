/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Customer } from '../types/cutting';
import {
  FolderPlus,
  Edit2,
  Copy,
  Trash2,
  Box,
  CheckCircle2,
} from 'lucide-react';

interface UnitManagerProps {
  customer: Customer;
  onSelectUnit: (unitName: string) => void;
  onAddUnit: (unitName: string) => void;
  onRenameUnit: (oldName: string, newName: string) => void;
  onCopyUnit: (sourceUnit: string, newName: string) => void;
  onDeleteUnit: (unitName: string) => void;
  onMergeAndSortUnit?: () => void;
  onClearUnitParts?: (unitName: string) => void;
}

export const UnitManager: React.FC<UnitManagerProps> = ({
  customer,
  onSelectUnit,
  onAddUnit,
  onRenameUnit,
  onCopyUnit,
  onDeleteUnit,
  onMergeAndSortUnit,
  onClearUnitParts,
}) => {
  const [modalMode, setModalMode] = useState<'add' | 'rename' | 'copy' | null>(null);
  const [modalInput, setModalInput] = useState('');

  const currentUnit = customer.unit || customer.units[0] || 'Unit 1';
  const unitParts = customer.parts.filter((p) => p.u === currentUnit);
  const totalPartsInCurrentUnit = unitParts.reduce((sum, p) => sum + p.q, 0);

  const getNextUnitName = () => {
    const base = currentUnit.replace(/\s*\d+$/, '') || 'Unit';
    let n = 1;
    while (customer.units.includes(`${base} ${n}`)) {
      n++;
    }
    return `${base} ${n}`;
  };

  const handleOpenAdd = () => {
    setModalInput(getNextUnitName());
    setModalMode('add');
  };

  const handleOpenRename = () => {
    setModalInput(currentUnit);
    setModalMode('rename');
  };

  const handleOpenCopy = () => {
    setModalInput(getNextUnitName());
    setModalMode('copy');
  };

  const handleConfirmModal = () => {
    const trimmed = modalInput.trim();
    if (!trimmed) return;

    if (modalMode === 'add') {
      if (customer.units.includes(trimmed)) {
        alert('A unit with this name already exists.');
        return;
      }
      onAddUnit(trimmed);
    } else if (modalMode === 'rename') {
      if (trimmed !== currentUnit && customer.units.includes(trimmed)) {
        alert('A unit with this name already exists.');
        return;
      }
      onRenameUnit(currentUnit, trimmed);
    } else if (modalMode === 'copy') {
      if (customer.units.includes(trimmed)) {
        alert('A unit with this name already exists.');
        return;
      }
      onCopyUnit(currentUnit, trimmed);
    }

    setModalMode(null);
  };

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Box className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Cabinet Units &amp; Rooms
          </h2>
        </div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>
            Active: <strong className="text-emerald-700 dark:text-emerald-400">{currentUnit}</strong> ({totalPartsInCurrentUnit} pcs)
          </span>
        </div>
      </div>

      {/* Unit Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        {customer.units.map((unitName) => {
          const isSelected = unitName === currentUnit;
          const count = customer.parts.filter((p) => p.u === unitName).reduce((a, b) => a + b.q, 0);

          return (
            <button
              key={unitName}
              onClick={() => onSelectUnit(unitName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{unitName}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  isSelected
                    ? 'bg-emerald-700/80 text-emerald-100'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Unit Management Controls */}
      <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handleOpenAdd}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>+ Add Unit</span>
        </button>

        <button
          onClick={handleOpenRename}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 transition cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Rename</span>
        </button>

        <button
          onClick={handleOpenCopy}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-1.5 transition cursor-pointer"
          title="Duplicate unit and all its cutting parts"
        >
          <Copy className="w-3.5 h-3.5 text-slate-500" />
          <span>Copy Unit</span>
        </button>

        {onMergeAndSortUnit && (
          <button
            onClick={onMergeAndSortUnit}
            className="px-2.5 py-1.5 text-xs font-bold rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1.5 transition cursor-pointer"
            title="Merge any duplicate parts with same name and size, and sort in standard carpentry sequence (Side Panels, Top, Bottom, Shelves, Doors...)"
          >
            <span>⚡ Merge Same Parts &amp; Sort</span>
          </button>
        )}

        {onClearUnitParts && (
          <button
            onClick={() => onClearUnitParts(currentUnit)}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-md text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center gap-1.5 transition cursor-pointer ml-auto"
            title={`Clear parts in selected unit "${currentUnit}" without deleting the unit`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Unit Parts</span>
          </button>
        )}

        <button
          onClick={() => onDeleteUnit(currentUnit)}
          className={`px-2.5 py-1.5 text-xs font-semibold rounded-md text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1.5 transition cursor-pointer ${
            !onClearUnitParts ? 'ml-auto' : ''
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Unit</span>
        </button>
      </div>

      {/* Prompt Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 w-full max-w-sm shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">
              {modalMode === 'add' && 'Create New Cabinet Unit'}
              {modalMode === 'rename' && `Rename "${currentUnit}"`}
              {modalMode === 'copy' && `Duplicate "${currentUnit}" Parts`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {modalMode === 'copy'
                ? 'All parts from this unit will be duplicated into the new unit.'
                : 'Enter a distinctive name (e.g. Master Cupboard, Shoe Rack, Dressing).'}
            </p>
            <input
              type="text"
              autoFocus
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmModal();
                if (e.key === 'Escape') setModalMode(null);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalMode(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmModal}
                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition cursor-pointer shadow-xs"
              >
                {modalMode === 'add' ? 'Add Unit' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
