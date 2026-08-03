/**
 * Heater and pump sizing.
 *
 * Heater sizing uses the surface-area rule published in the sizing guides from
 * Hayward, Pentair and Raypak: BTU/hr = surface area × temperature rise × 12,
 * where the multiplier absorbs evaporation and convection losses. Sheltered
 * pools use a lower factor, windy or shaded ones a higher factor.
 *
 * Time-to-heat is straight thermodynamics: one BTU raises one pound of water by
 * one degree Fahrenheit, and water weighs 8.34 lb per US gallon.
 */

export const POUNDS_PER_GALLON = 8.34;

export const EXPOSURES = [
  { id: 'sheltered', label: 'Sheltered, sunny', factor: 10 },
  { id: 'average', label: 'Average conditions', factor: 12 },
  { id: 'windy', label: 'Windy or shaded', factor: 15 },
];

export const getExposure = (id: string) =>
  EXPOSURES.find((exposure) => exposure.id === id) ?? EXPOSURES[1];

/** BTU/hr a heater needs to hold a temperature rise against surface losses. */
export function recommendedHeaterBtu(
  surfaceAreaSqFt: number,
  temperatureRise: number,
  exposureFactor = 12,
) {
  return surfaceAreaSqFt * temperatureRise * exposureFactor;
}

/** Energy to lift the whole body of water by `temperatureRise` °F. */
export function btuToHeat(gallons: number, temperatureRise: number) {
  return gallons * POUNDS_PER_GALLON * temperatureRise;
}

/**
 * Hours for a given heater to achieve the rise, ignoring losses during heat-up.
 * Real-world time runs longer — an uncovered pool is losing heat the whole time.
 */
export function hoursToHeat(
  gallons: number,
  temperatureRise: number,
  heaterBtuPerHour: number,
  efficiency = 0.84,
) {
  const output = heaterBtuPerHour * efficiency;
  if (output <= 0) return Infinity;
  return btuToHeat(gallons, temperatureRise) / output;
}

/** Common gas heater sizes, for picking the next one up. */
export const HEATER_SIZES = [100000, 150000, 200000, 250000, 300000, 400000];

export const nextHeaterSize = (btu: number) =>
  HEATER_SIZES.find((size) => size >= btu) ?? HEATER_SIZES[HEATER_SIZES.length - 1];

// ---------------------------------------------------------------------------
// Pump
// ---------------------------------------------------------------------------

/** Flow needed to turn the pool over once in `turnoverHours`. */
export function requiredFlowGpm(gallons: number, turnoverHours: number) {
  if (turnoverHours <= 0) return Infinity;
  return gallons / (turnoverHours * 60);
}

/**
 * Practical flow ceilings by suction pipe size, at the velocities the trade
 * treats as safe (roughly 6 ft/s suction, 8 ft/s return). Exceeding these
 * causes noise, cavitation, and wasted energy — the pipe, not the pump, is
 * usually the real limit.
 */
export const PIPE_LIMITS = [
  { id: '1.5', label: '1½ inch', maxGpm: 45 },
  { id: '2', label: '2 inch', maxGpm: 80 },
  { id: '2.5', label: '2½ inch', maxGpm: 120 },
  { id: '3', label: '3 inch', maxGpm: 160 },
];

export const getPipe = (id: string) =>
  PIPE_LIMITS.find((pipe) => pipe.id === id) ?? PIPE_LIMITS[1];

/** Turnovers achieved per day at a given flow. */
export const turnoversPerDay = (gallons: number, gpm: number, runHours: number) =>
  gallons > 0 ? (gpm * 60 * runHours) / gallons : 0;
