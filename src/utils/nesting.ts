/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Part, NestedSheet, NestedPartPlacement } from '../types/cutting';

interface FreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ItemToPack {
  id: string;
  partName: string;
  unit: string;
  board: string;
  w: number;
  h: number;
  itemNumber: number;
  totalQuantity: number;
}

/**
 * 2D Guillotine Bin Packing with Kerf spacing for workshop sheet cutting optimization.
 */
export function computeSheetNesting(
  parts: Part[],
  sheetWidth: number,
  sheetLength: number,
  sawKerf = 4
): Record<string, NestedSheet[]> {
  // Group parts by board material
  const boardsMap: Record<string, Part[]> = {};
  parts.forEach((p) => {
    if (!boardsMap[p.b]) boardsMap[p.b] = [];
    boardsMap[p.b].push(p);
  });

  const result: Record<string, NestedSheet[]> = {};

  Object.entries(boardsMap).forEach(([board, boardParts]) => {
    // Unroll quantities into individual items
    const items: ItemToPack[] = [];
    boardParts.forEach((part) => {
      for (let i = 1; i <= part.q; i++) {
        items.push({
          id: `${part.p}-${part.w}-${part.l}-${i}`,
          partName: part.p,
          unit: part.u,
          board: part.b,
          w: part.w,
          h: part.l,
          itemNumber: i,
          totalQuantity: part.q,
        });
      }
    });

    // Sort items by area descending (largest first)
    items.sort((a, b) => b.w * b.h - a.w * a.h);

    const sheets: NestedSheet[] = [];
    let currentSheetIndex = 1;

    let remainingItems = [...items];

    while (remainingItems.length > 0) {
      const placements: NestedPartPlacement[] = [];
      const freeRects: FreeRect[] = [{ x: 0, y: 0, w: sheetWidth, h: sheetLength }];
      const nextRemaining: ItemToPack[] = [];

      for (const item of remainingItems) {
        let bestRectIdx = -1;
        let rotated = false;
        let bestShortFit = Infinity;

        // Try both orientations (unrotated and rotated 90 degrees)
        for (let r = 0; r < freeRects.length; r++) {
          const rect = freeRects[r];

          // Option A: normal orientation
          if (item.w <= rect.w && item.h <= rect.h) {
            const shortFit = Math.min(rect.w - item.w, rect.h - item.h);
            if (shortFit < bestShortFit) {
              bestShortFit = shortFit;
              bestRectIdx = r;
              rotated = false;
            }
          }

          // Option B: rotated 90 degrees
          if (item.h <= rect.w && item.w <= rect.h) {
            const shortFit = Math.min(rect.w - item.h, rect.h - item.w);
            if (shortFit < bestShortFit) {
              bestShortFit = shortFit;
              bestRectIdx = r;
              rotated = true;
            }
          }
        }

        if (bestRectIdx >= 0) {
          const chosenRect = freeRects[bestRectIdx];
          const partW = rotated ? item.h : item.w;
          const partH = rotated ? item.w : item.h;

          // Place the item
          placements.push({
            id: item.id,
            partName: item.partName,
            unit: item.unit,
            board: item.board,
            x: chosenRect.x,
            y: chosenRect.y,
            w: partW,
            h: partH,
            rotated,
            itemNumber: item.itemNumber,
            totalQuantity: item.totalQuantity,
          });

          // Guillotine split of chosen rect
          freeRects.splice(bestRectIdx, 1);

          const placedW = partW + sawKerf;
          const placedH = partH + sawKerf;

          // Split along shorter axis
          const rightRect: FreeRect = {
            x: chosenRect.x + placedW,
            y: chosenRect.y,
            w: Math.max(0, chosenRect.w - placedW),
            h: placedH,
          };

          const bottomRect: FreeRect = {
            x: chosenRect.x,
            y: chosenRect.y + placedH,
            w: chosenRect.w,
            h: Math.max(0, chosenRect.h - placedH),
          };

          if (rightRect.w > 50 && rightRect.h > 50) freeRects.push(rightRect);
          if (bottomRect.w > 50 && bottomRect.h > 50) freeRects.push(bottomRect);
        } else {
          // Could not fit on current sheet
          nextRemaining.push(item);
        }
      }

      // Compute used area on this sheet
      const usedArea = placements.reduce((sum, p) => sum + (p.w * p.h) / 1e6, 0);
      const totalSheetArea = (sheetWidth * sheetLength) / 1e6;

      sheets.push({
        sheetIndex: currentSheetIndex++,
        board,
        sheetWidth,
        sheetLength,
        placements,
        usedArea,
        totalArea: totalSheetArea,
        utilizationPercent: totalSheetArea > 0 ? (usedArea / totalSheetArea) * 100 : 0,
      });

      if (nextRemaining.length === remainingItems.length) {
        // Safety break if an item is larger than the whole stock sheet
        console.warn('Item larger than entire sheet detected.');
        break;
      }

      remainingItems = nextRemaining;
    }

    result[board] = sheets;
  });

  return result;
}
