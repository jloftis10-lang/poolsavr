import { poolVolume } from './pool-volume';
import type { CalculatorDef } from './types';

/**
 * Every calculator on the site, keyed by id. The <Calculator> island reads the
 * id off a data attribute and looks it up here, so adding a calculator means
 * adding one module and one line — no new page script.
 */
export const CALCULATORS: Record<string, CalculatorDef> = {
  [poolVolume.id]: poolVolume,
};

export const getCalculator = (id: string): CalculatorDef => {
  const def = CALCULATORS[id];
  if (!def) throw new Error(`Unknown calculator: ${id}`);
  return def;
};
