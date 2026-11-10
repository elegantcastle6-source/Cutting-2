/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Customer, AppSettings, Part, PresetConfig, AppDatabase } from './types/cutting';
import {
  loadDatabase,
  saveDatabase,
  downloadFile,
  generateCsvExport,
  generateTextExport,
} from './utils/storage';
import {
  sortPartsInCarpentrySequence,
  mergeDuplicatePartsInList,
} from './utils/calculator';
import { generateStandalonePCSoftware } from './utils/standaloneExport';
import { Sidebar } from './components/Sidebar';
import { CustomerHeader } from './components/CustomerHeader';
import { UnitManager } from './components/UnitManager';
import { SinglePartAdder } from './components/SinglePartAdder';
import { ParametricCalculator } from './components/ParametricCalculator';
import { PreviewModal } from './components/PreviewModal';
import { CuttingListView } from './components/CuttingListView';
import { ThermalLabelsModal } from './components/ThermalLabelsModal';
import { PrintReportView } from './components/PrintReportView';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import {
  Printer,
  Moon,
  Sun,
  Laptop,
  Layers,
  Sparkles,
  Eye,
} from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<AppDatabase>(() => loadDatabase());
  const [viewMode, setViewMode] = useState<'unit' | 'board' | 'nesting'>('unit');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('all');
  const [previewData, setPreviewData] = useState<{
    parts: Part[];
    messages: string[];
  } | null>(null);
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [printScope, setPrintScope] = useState<'current' | 'all'>('current');
  const [darkMode, setDarkMode] = useState(false);
  const [printFontSize, setPrintFontSize] = useState<number>(() => db.set.printFontSize || 11);
  const [printLayout, setPrintLayout] = useState<'standard' | 'right-first' | 'split' | 'full'>(() => db.set.printLayout || 'standard');
  const [fitSinglePage, setFitSinglePage] = useState<boolean>(() => db.set.fitSinglePage ?? true);

  // Synchronize database to localStorage whenever it changes
  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  // Synchronize dark mode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Synchronize print font size to CSS variable on document
  useEffect(() => {
    document.documentElement.style.setProperty('--print-font-size', `${printFontSize}px`);
  }, [printFontSize]);

  const currentCustomer: Customer =
    db.customers.find((c) => c.id === db.cur) || db.customers[0];

  // Helper to update current customer
  const updateCurrentCustomer = (updates: Partial<Customer>) => {
    setDb((prev) => {
      const nextCustomers = prev.customers.map((c) =>
        c.id === prev.cur ? { ...c, ...updates } : c
      );
      return { ...prev, customers: nextCustomers };
    });
  };

  // Helper to update settings
  const updateSettings = (updates: Partial<AppSettings>) => {
    setDb((prev) => ({
      ...prev,
      set: { ...prev.set, ...updates },
    }));
  };

  // Customer Management
  const handleSelectCustomer = (id: string) => {
    setDb((prev) => ({ ...prev, cur: id }));
  };

  const handleNewCustomer = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newCust: Customer = {
      id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      code: `C-${db.customers.length + 101}`,
      name: 'New Customer',
      date: today,
      notes: '',
      units: ['Cupboard 1'],
      unit: 'Cupboard 1',
      parts: [],
      mainBoard: 'Color 273 18mm',
      backBoard: 'Color 273 6mm',
      backType: '6',
    };

    setDb((prev) => ({
      ...prev,
      customers: [newCust, ...prev.customers],
      cur: newCust.id,
    }));
  };

  const handleDeleteCustomer = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${currentCustomer.name || 'this customer'}" and all its parts?`
      )
    ) {
      setDb((prev) => {
        const remaining = prev.customers.filter((c) => c.id !== prev.cur);
        if (remaining.length === 0) {
          const fresh: Customer = {
            id: `c-${Date.now().toString(36)}`,
            code: 'C-101',
            name: 'New Customer',
            date: new Date().toISOString().slice(0, 10),
            notes: '',
            units: ['Cupboard 1'],
            unit: 'Cupboard 1',
            parts: [],
            mainBoard: 'Color 273 18mm',
            backBoard: 'Color 273 6mm',
            backType: '6',
          };
          return { ...prev, customers: [fresh], cur: fresh.id };
        }
        return { ...prev, customers: remaining, cur: remaining[0].id };
      });
    }
  };

  // Unit Management
  const handleSelectUnit = (unitName: string) => {
    updateCurrentCustomer({ unit: unitName });
    setSelectedUnitFilter(unitName);
  };

  const handleAddUnit = (unitName: string) => {
    const updatedUnits = [...currentCustomer.units, unitName];
    updateCurrentCustomer({
      units: updatedUnits,
      unit: unitName,
    });
    setSelectedUnitFilter(unitName);
  };

  const handleRenameUnit = (oldName: string, newName: string) => {
    const updatedUnits = currentCustomer.units.map((u) => (u === oldName ? newName : u));
    const updatedParts = currentCustomer.parts.map((p) =>
      p.u === oldName ? { ...p, u: newName } : p
    );
    updateCurrentCustomer({
      units: updatedUnits,
      unit: newName,
      parts: updatedParts,
    });
    if (selectedUnitFilter === oldName) {
      setSelectedUnitFilter(newName);
    }
  };

  const handleCopyUnit = (sourceUnit: string, newName: string) => {
    const updatedUnits = [...currentCustomer.units, newName];
    const sourceParts = currentCustomer.parts
      .filter((p) => p.u === sourceUnit)
      .map((p) => ({
        ...p,
        id: `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        u: newName,
      }));

    updateCurrentCustomer({
      units: updatedUnits,
      unit: newName,
      parts: [...currentCustomer.parts, ...sourceParts],
    });
    setSelectedUnitFilter(newName);
  };

  const handleDeleteUnit = (unitName: string) => {
    if (currentCustomer.units.length <= 1) {
      alert('You must keep at least one cabinet unit.');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete unit "${unitName}" and all its parts?`
      )
    ) {
      const remainingUnits = currentCustomer.units.filter((u) => u !== unitName);
      const remainingParts = currentCustomer.parts.filter((p) => p.u !== unitName);
      updateCurrentCustomer({
        units: remainingUnits,
        unit: remainingUnits[0],
        parts: remainingParts,
      });
      if (selectedUnitFilter === unitName) {
        setSelectedUnitFilter('all');
      }
    }
  };

  // Part Management with Auto-Merge & Carpentry Sequence Sorting
  const handleAddSinglePart = (part: Part) => {
    const existingIndex = currentCustomer.parts.findIndex(
      (p) =>
        p.u.trim() === part.u.trim() &&
        p.b.trim() === part.b.trim() &&
        p.p.trim().toLowerCase() === part.p.trim().toLowerCase() &&
        Math.round(p.w) === Math.round(part.w) &&
        Math.round(p.l) === Math.round(part.l)
    );

    if (existingIndex >= 0) {
      const copy = [...currentCustomer.parts];
      copy[existingIndex] = {
        ...copy[existingIndex],
        q: copy[existingIndex].q + part.q,
      };
      updateCurrentCustomer({
        parts: sortPartsInCarpentrySequence(copy),
      });
    } else {
      updateCurrentCustomer({
        parts: sortPartsInCarpentrySequence([...currentCustomer.parts, part]),
      });
    }
  };

  const handleAddSplitParts = (partA: Part, partB: Part) => {
    const combined = [...currentCustomer.parts];
    [partA, partB].forEach((sp) => {
      const existingIdx = combined.findIndex(
        (p) =>
          p.u.trim() === sp.u.trim() &&
          p.b.trim() === sp.b.trim() &&
          p.p.trim().toLowerCase() === sp.p.trim().toLowerCase() &&
          Math.round(p.w) === Math.round(sp.w) &&
          Math.round(p.l) === Math.round(sp.l)
      );
      if (existingIdx >= 0) {
        combined[existingIdx] = {
          ...combined[existingIdx],
          q: combined[existingIdx].q + sp.q,
        };
      } else {
        combined.push(sp);
      }
    });

    updateCurrentCustomer({
      parts: sortPartsInCarpentrySequence(combined),
    });
  };

  const handleUpdatePart = (index: number, field: keyof Part, value: any) => {
    const copy = [...currentCustomer.parts];
    copy[index] = { ...copy[index], [field]: value };
    updateCurrentCustomer({ parts: copy });
  };

  const handleDeletePart = (index: number) => {
    const copy = [...currentCustomer.parts];
    copy.splice(index, 1);
    updateCurrentCustomer({ parts: copy });
  };

  const handleDeleteMergedBoardSize = (board: string, key: string) => {
    const copy = currentCustomer.parts.filter(
      (x) => !(x.b === board && `${x.w}x${x.l}` === key)
    );
    updateCurrentCustomer({ parts: copy });
  };

  const handleClearParts = (targetUnit?: string) => {
    const activeUnit =
      targetUnit && targetUnit !== 'all'
        ? targetUnit
        : selectedUnitFilter !== 'all'
        ? selectedUnitFilter
        : currentCustomer.unit;

    if (activeUnit && activeUnit !== 'all') {
      const unitPartsCount = currentCustomer.parts.filter((p) => p.u === activeUnit).length;
      if (unitPartsCount === 0) {
        alert(`No parts found in selected unit "${activeUnit}".`);
        return;
      }
      if (
        window.confirm(
          `Clear all ${unitPartsCount} parts in selected unit "${activeUnit}"?\n\nParts in other units will remain safe.`
        )
      ) {
        updateCurrentCustomer({
          parts: currentCustomer.parts.filter((p) => p.u !== activeUnit),
        });
      }
      return;
    }

    if (
      window.confirm(
        `Clear all parts across ALL units for customer "${currentCustomer.name || 'this customer'}"?`
      )
    ) {
      updateCurrentCustomer({ parts: [] });
    }
  };

  // Merge same name + same size parts and arrange in sequence
  const handleMergeAndSortUnit = (targetUnit?: string) => {
    const unitName = targetUnit || currentCustomer.unit;
    const unitParts = currentCustomer.parts.filter((p) => p.u === unitName);
    const otherParts = currentCustomer.parts.filter((p) => p.u !== unitName);

    const mergedUnitParts = mergeDuplicatePartsInList(unitParts);
    const countDiff = unitParts.length - mergedUnitParts.length;

    updateCurrentCustomer({
      parts: sortPartsInCarpentrySequence([...otherParts, ...mergedUnitParts]),
    });

    if (countDiff > 0) {
      alert(
        `Merged ${countDiff} duplicate part row(s) with identical size in "${unitName}" and arranged all parts in standard carpentry sequence (Side Panels, Top, Bottom, Divider, Shelves, Back, Doors, Drawers)!`
      );
    } else {
      alert(
        `All parts in "${unitName}" are already unified and arranged in standard carpentry sequence!`
      );
    }
  };

  // Preset Management
  const handleSavePreset = (name: string, preset: PresetConfig) => {
    setDb((prev) => ({
      ...prev,
      set: {
        ...prev.set,
        presets: {
          ...prev.set.presets,
          [name]: preset,
        },
      },
    }));
  };

  const handleAddNewPresetType = (name: string, preset: PresetConfig) => {
    setDb((prev) => ({
      ...prev,
      set: {
        ...prev.set,
        presets: {
          ...prev.set.presets,
          [name]: preset,
        },
      },
    }));
  };

  // Save calculated pieces from PreviewModal (auto-merges same name & size in the unit)
  const handleSavePreviewParts = (newParts: Part[], targetUnit: string) => {
    const finalUnit = (targetUnit && targetUnit.trim()) || currentCustomer.unit;
    const updatedUnits = currentCustomer.units.includes(finalUnit)
      ? currentCustomer.units
      : [...currentCustomer.units, finalUnit];

    const targetParts = newParts.map((p) => ({ ...p, u: finalUnit }));
    const combined = [...currentCustomer.parts];
    let mergedCount = 0;

    for (const newPart of targetParts) {
      const existingIdx = combined.findIndex(
        (p) =>
          p.u.trim() === newPart.u.trim() &&
          p.b.trim() === newPart.b.trim() &&
          p.p.trim().toLowerCase() === newPart.p.trim().toLowerCase() &&
          Math.round(p.w) === Math.round(newPart.w) &&
          Math.round(p.l) === Math.round(newPart.l)
      );

      if (existingIdx >= 0) {
        combined[existingIdx] = {
          ...combined[existingIdx],
          q: combined[existingIdx].q + newPart.q,
        };
        mergedCount++;
      } else {
        combined.push(newPart);
      }
    }

    const sorted = sortPartsInCarpentrySequence(combined);
    updateCurrentCustomer({
      units: updatedUnits,
      unit: finalUnit,
      parts: sorted,
    });

    // Make separate selection for By Unit immediately after saving!
    setSelectedUnitFilter(finalUnit);
    setViewMode('unit');
    setPreviewData(null);
  };

  // Exports and Backups
  const handleDownloadCsv = () => {
    const csvContent = generateCsvExport(currentCustomer, viewMode === 'board' ? 'board' : 'unit', db.set);
    const filename = `cutting-list-${(currentCustomer.name || 'customer')
      .replace(/[\s\W]+/g, '_')
      .toLowerCase()}-${currentCustomer.date}.csv`;
    downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
  };

  const handleDownloadTxt = () => {
    const txtContent = generateTextExport(currentCustomer, viewMode === 'board' ? 'board' : 'unit', db.set);
    const filename = `cutting-list-${(currentCustomer.name || 'customer')
      .replace(/[\s\W]+/g, '_')
      .toLowerCase()}-${currentCustomer.date}.txt`;
    downloadFile(filename, txtContent, 'text/plain;charset=utf-8;');
  };

  const handleCopyTxt = () => {
    const txtContent = generateTextExport(currentCustomer, viewMode === 'board' ? 'board' : 'unit', db.set);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(txtContent)
        .then(() => alert('Cutting list copied to clipboard!'))
        .catch(() => alert('Could not copy to clipboard.'));
    } else {
      alert('Clipboard writing is not supported in this browser.');
    }
  };

  const handleBackup = () => {
    const json = JSON.stringify(db, null, 2);
    const filename = `cutting-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    downloadFile(filename, json, 'application/json');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!Array.isArray(parsed.customers) || !parsed.cur) {
          throw new Error('Invalid backup schema');
        }
        setDb(parsed);
        alert('Cutting list database restored successfully!');
      } catch (err) {
        alert('Invalid JSON backup file. Please select a valid backup.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrintFontSizeChange = (size: number) => {
    setPrintFontSize(size);
    updateSettings({ printFontSize: size });
  };

  const handlePrintLayoutChange = (layout: 'standard' | 'right-first' | 'split' | 'full') => {
    setPrintLayout(layout);
    updateSettings({ printLayout: layout });
  };

  const handleFitSinglePageChange = (fit: boolean) => {
    setFitSinglePage(fit);
    updateSettings({ fitSinglePage: fit });
  };

  const handleExportStandalone = () => {
    const htmlContent = generateStandalonePCSoftware(
      currentCustomer,
      { ...db.set, fitSinglePage, printLayout, printFontSize },
      printFontSize,
      printLayout,
      fitSinglePage
    );
    downloadFile('Cutting-List-Pro-Desktop.html', htmlContent, 'text/html;charset=utf-8;');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Banner (Screen Only) */}
      <header className="bg-emerald-800 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-xs print:hidden z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-300" />
          <span>Cutting List Pro &mdash; Carpentry Workshop &amp; Sheet Cutting Suite</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportStandalone}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 transition cursor-pointer"
            title="Download offline PC version"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Download Offline PC Software</span>
          </button>

          <button
            onClick={() => setShowPrintPreview(true)}
            className="flex items-center gap-1 hover:text-emerald-200 transition cursor-pointer"
            title="Open interactive A4 Print Preview with live font size scaling"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-300" />
            <span>Print Preview</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 hover:text-emerald-200 transition cursor-pointer"
            title="Press Ctrl+P to Print A4 Cutting List"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1 rounded hover:bg-emerald-700 transition cursor-pointer"
            title="Toggle Dark / Light Theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="flex flex-1 overflow-hidden print:block">
        {/* Left Sidebar */}
        <Sidebar
          db={db}
          onSelectCustomer={handleSelectCustomer}
          onNewCustomer={handleNewCustomer}
          onBackup={handleBackup}
          onRestore={handleRestore}
          onExportStandalone={handleExportStandalone}
        />

        {/* Central Workspace Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-7xl mx-auto w-full print:p-0 print:max-w-none">
          {/* Customer & Workshop Specs */}
          <div className="print:hidden">
            <CustomerHeader
              customer={currentCustomer}
              settings={db.set}
              onUpdateCustomer={updateCurrentCustomer}
              onUpdateSettings={updateSettings}
              onDeleteCustomer={handleDeleteCustomer}
            />

            {/* Unit Tabs & Manager */}
            <UnitManager
              customer={currentCustomer}
              onSelectUnit={handleSelectUnit}
              onAddUnit={handleAddUnit}
              onRenameUnit={handleRenameUnit}
              onCopyUnit={handleCopyUnit}
              onDeleteUnit={handleDeleteUnit}
              onMergeAndSortUnit={() => handleMergeAndSortUnit(currentCustomer.unit)}
              onClearUnitParts={handleClearParts}
            />

            {/* Fast Single Part Entry */}
            <SinglePartAdder
              customer={currentCustomer}
              settings={db.set}
              onAddPart={handleAddSinglePart}
              onAddSplitParts={handleAddSplitParts}
            />

            {/* Parametric Cabinet Calculator Engine */}
            <ParametricCalculator
              customer={currentCustomer}
              settings={db.set}
              onPreviewParts={(res) => setPreviewData(res)}
              onSavePreset={handleSavePreset}
              onAddNewPresetType={handleAddNewPresetType}
            />
          </div>

          {/* Cutting List, Reports & 2D Nesting Views */}
          <div className="print:hidden">
            <CuttingListView
              customer={currentCustomer}
              settings={db.set}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              selectedUnitFilter={selectedUnitFilter}
              onSelectUnitFilter={setSelectedUnitFilter}
              onUpdatePart={handleUpdatePart}
              onDeletePart={handleDeletePart}
              onDeleteMergedBoardSize={handleDeleteMergedBoardSize}
              onClearAllParts={handleClearParts}
              onMergeAndSortUnit={handleMergeAndSortUnit}
              onOpenThermalLabels={() => setShowThermalModal(true)}
              onOpenPrintPreview={() => setShowPrintPreview(true)}
              onDownloadCsv={handleDownloadCsv}
              onDownloadTxt={handleDownloadTxt}
              onCopyTxt={handleCopyTxt}
              printScope={printScope}
              onChangePrintScope={setPrintScope}
              printFontSize={printFontSize}
              onChangePrintFontSize={handlePrintFontSizeChange}
              printLayout={printLayout}
              onChangePrintLayout={handlePrintLayoutChange}
              fitSinglePage={fitSinglePage}
              onChangeFitSinglePage={handleFitSinglePageChange}
            />
          </div>

          {/* Dedicated Clean Print Report (Visible only during window.print()) */}
          <PrintReportView
            customer={currentCustomer}
            settings={db.set}
            viewMode={viewMode}
            selectedUnitFilter={selectedUnitFilter}
            printScope={printScope}
            printFontSize={printFontSize}
            printLayout={printLayout}
            fitSinglePage={fitSinglePage}
          />
        </main>
      </div>

      {/* Preview Modal for Parametric Calculator */}
      {previewData && (
        <PreviewModal
          currentUnit={currentCustomer.unit}
          availableUnits={currentCustomer.units}
          initialParts={previewData.parts}
          messages={previewData.messages}
          settings={db.set}
          onSaveToUnit={handleSavePreviewParts}
          onDiscard={() => setPreviewData(null)}
        />
      )}

      {/* Interactive A4 Print Preview Modal */}
      {showPrintPreview && (
        <PrintPreviewModal
          customer={currentCustomer}
          settings={db.set}
          viewMode={viewMode}
          selectedUnitFilter={selectedUnitFilter}
          printScope={printScope}
          onChangePrintScope={setPrintScope}
          printFontSize={printFontSize}
          onChangePrintFontSize={handlePrintFontSizeChange}
          printLayout={printLayout}
          onChangePrintLayout={handlePrintLayoutChange}
          fitSinglePage={fitSinglePage}
          onChangeFitSinglePage={handleFitSinglePageChange}
          onClose={() => setShowPrintPreview(false)}
        />
      )}

      {/* Thermal Labels & Part Stickers Modal */}
      {showThermalModal && (
        <ThermalLabelsModal
          customer={currentCustomer}
          onClose={() => setShowThermalModal(false)}
        />
      )}
    </div>
  );
}
