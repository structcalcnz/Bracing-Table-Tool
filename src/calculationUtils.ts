// src/calculationUtils.ts
import type { BracingRow, DisplayBracingRow, BracingData } from './types';


// * Finds the best matching key from a sorted array of numeric strings.
// * Returns the largest key that is ≤ the given length.
export function getBestMatchKey(length: number, keys: string[]): string | null {
  let bestMatch: string | null = null;

  for (const key of keys) {
    const numKey = parseFloat(key);
    if (numKey > length) break;
    bestMatch = key;
  }

  return bestMatch;
}

// Get bracing-type data from bracingData
export const getTypeData = (
  bracingData: BracingData | null,
  system: string,
  type: string
) => {
  const sys = bracingData?.systems.find(s => s.name === system);
  return sys?.types.find(t => t.name === type);
};

// Apply floor type rating limits
export const applyFloorTypeLimit = (
  floorType: 'Timber' | 'Concrete',
  rating: number | null
): number | null => {
  if (floorType === 'Timber' && rating !== null && rating > 120) return 120;
  if (floorType === 'Concrete' && rating !== null && rating > 150) return 150;
  return rating;
};

// bracing calculation
// calculate bracing row total deponds on input
export function calculateLineRows(
  lineData: { rows: BracingRow[] },
  bracingData: BracingData | null,
  floorType: 'Timber' | 'Concrete'
): DisplayBracingRow[] {
  if (!lineData || !bracingData) return [];

  return lineData.rows.map(row => {
    const typeData = getTypeData(bracingData, row.system, row.type);

    const isNumberBased = typeData && Object.keys(typeData.wind)[0] === 'n_1';

    const key = isNumberBased
      ? 'n_1'
      : typeData
        ? getBestMatchKey(
            row.lengthOrCount,
            Object.keys(typeData.wind).sort((a, b) => parseFloat(a) - parseFloat(b))
          )
        : null;

    const rawWindRating = typeData && key ? typeData.wind[key] : null;
    const rawEqRating = typeData && key ? typeData.eq[key] : null;

    const windRating = isNumberBased ? rawWindRating : applyFloorTypeLimit(floorType, rawWindRating);
    const eqRating = isNumberBased ? rawEqRating : applyFloorTypeLimit(floorType, rawEqRating);

    const isRowInvalid = !typeData || windRating === null || eqRating === null;

    let totalWind = 0;
    let totalEQ = 0;

    if (!isRowInvalid) {
      if (isNumberBased) {
        totalWind = (windRating ?? 0) * row.lengthOrCount;
        totalEQ = (eqRating ?? 0) * row.lengthOrCount;
      } else {
        const heightRatio = row.height > 0 ? 2.4 / row.height : 0;
        totalWind = (windRating ?? 0) * row.lengthOrCount * heightRatio;
        totalEQ = (eqRating ?? 0) * row.lengthOrCount * heightRatio;
      }
    }

    return {
      ...row,
      windRating,
      eqRating,      
      totalWind,
      totalEQ,
      isRowInvalid,
    };
  });
}

//calculate the bracingline total
export function calculateLineTotals(rows: DisplayBracingRow[]) {
  return rows.reduce(
    (acc, row) => ({
      lineTotalWind: acc.lineTotalWind + row.totalWind,
      lineTotalEQ: acc.lineTotalEQ + row.totalEQ,
    }),
    { lineTotalWind: 0, lineTotalEQ: 0 }
  );
}

//calculate the min demand for bracingline
export function calculateMinDemand(
  externalWallLength: number,
  totalTabDemandWind: number,
  totalTabDemandEQ: number,
  bracinglineCount: number
) {
  const safeCount = bracinglineCount > 0 ? bracinglineCount : 1;

  const minDemandWind = Math.max(
    100,
    15 * externalWallLength,
    (totalTabDemandWind / safeCount) * 0.5
  );

  const minDemandEQ = Math.max(
    100,
    15 * externalWallLength,
    (totalTabDemandEQ / safeCount) * 0.5
  );

  return { minDemandWind, minDemandEQ };
}

//check pass or NG for bracingline
export function validateLineTotals(
  lineTotalWind: number,
  lineTotalEQ: number,
  minDemandWind: number,
  minDemandEQ: number
): { isWindOk: boolean; isEqOk: boolean }{
  return {
    isWindOk: lineTotalWind >= minDemandWind,
    isEqOk: lineTotalEQ >= minDemandEQ,
  };
}

