/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { PaintBucket, X, Check } from 'lucide-react';

interface FillColorPickerProps {
  color?: string;
  onChange: (color: string) => void;
  title?: string;
  size?: 'sm' | 'xs';
}

const PRESET_COLORS = [
  { name: 'Default / None', value: '', border: '#cbd5e1' },
  { name: 'Amber Yellow', value: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  { name: 'Emerald Green', value: '#d1fae5', text: '#065f46', border: '#6ee7b7' },
  { name: 'Sky Blue', value: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  { name: 'Rose Red', value: '#ffe4e6', text: '#9f1239', border: '#fda4af' },
  { name: 'Purple Violet', value: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' },
  { name: 'Warm Orange', value: '#ffedd5', text: '#9a3412', border: '#fdba74' },
  { name: 'Cyan Teal', value: '#cffafe', text: '#155e75', border: '#67e8f9' },
  { name: 'Walnut Bronze', value: '#a7651f', text: '#ffffff', border: '#8b4513' },
  { name: 'Bright Yellow', value: '#fef08a', text: '#854d0e', border: '#fde047' },
  { name: 'Soft Gray', value: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
];

export const FillColorPicker: React.FC<FillColorPickerProps> = ({
  color = '',
  onChange,
  title = 'Fill Color',
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hasColor = Boolean(color && color.trim());

  return (
    <div className="relative inline-flex items-center" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title={title}
        style={hasColor ? { backgroundColor: color } : undefined}
        className={`relative inline-flex items-center justify-center rounded transition cursor-pointer select-none border ${
          size === 'xs' ? 'w-5 h-5 p-0.5' : 'w-6 h-6 p-1'
        } ${
          hasColor
            ? 'border-slate-400/80 shadow-2xs'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <PaintBucket
          className={`${size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${
            hasColor ? 'text-slate-900 drop-shadow-xs' : 'text-slate-500'
          }`}
        />
        {hasColor && (
          <span
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white dark:border-slate-900"
            style={{ backgroundColor: color }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2.5 w-52 text-xs">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-[11px] text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1">
              <PaintBucket className="w-3 h-3 text-emerald-600" />
              <span>Fill Highlight Color</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Quick preset color chips */}
          <div className="grid grid-cols-6 gap-1.5 mb-2.5">
            {PRESET_COLORS.map((c) => {
              const isSelected = (color || '').toLowerCase() === (c.value || '').toLowerCase();
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    onChange(c.value);
                    setIsOpen(false);
                  }}
                  title={c.name}
                  style={{
                    backgroundColor: c.value || 'transparent',
                    borderColor: c.border,
                  }}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center transition cursor-pointer hover:scale-110 ${
                    isSelected ? 'ring-2 ring-emerald-500 ring-offset-1' : ''
                  }`}
                >
                  {isSelected && (
                    <Check
                      className={`w-3 h-3 ${
                        c.value === '#a7651f' ? 'text-white' : 'text-slate-900'
                      }`}
                    />
                  )}
                  {!c.value && <span className="text-[10px] text-slate-400">&times;</span>}
                </button>
              );
            })}
          </div>

          {/* Custom color wheel input */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 cursor-pointer">
              <span>Custom:</span>
              <input
                type="color"
                value={color || '#d1fae5'}
                onChange={(e) => onChange(e.target.value)}
                className="w-6 h-6 p-0 border border-slate-300 dark:border-slate-600 rounded cursor-pointer"
              />
            </label>

            {hasColor && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Clear Fill
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
