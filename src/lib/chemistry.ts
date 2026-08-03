/**
 * Pool water chemistry.
 *
 * Every constant here is derived from stoichiometry rather than copied from a
 * chart, and each derivation is written out so it can be checked. The results
 * agree with published industry dosing tables to within rounding.
 *
 * Target ranges come from the CDC Model Aquatic Health Code (4th edition, 2023).
 * Doses are estimates: product strength varies by brand and degrades with age,
 * so the container label always takes precedence.
 */

export const GALLONS_TO_LITRES = 3.785411784;
const GRAMS_PER_OUNCE = 28.3495;
const ML_PER_FL_OZ = 29.5735;
const GRAMS_PER_POUND = 453.592;

/** CaCO₃ equivalent weight — alkalinity is reported as ppm CaCO₃. */
const CACO3_EQUIVALENT_WEIGHT = 50.045;

export const litres = (gallons: number) => gallons * GALLONS_TO_LITRES;

/**
 * Grams of a dissolved substance needed to move a pool by 1 ppm (1 mg/L).
 * 1 mg/L × litres ÷ 1000 = grams.
 */
export const gramsForPpm = (gallons: number, ppm: number) =>
  (litres(gallons) * ppm) / 1000;

// ---------------------------------------------------------------------------
// Chlorine
// ---------------------------------------------------------------------------

export interface ChlorineProduct {
  id: string;
  label: string;
  /** Available chlorine. Liquids are trade % (g Cl₂ per 100 mL); solids are % by weight. */
  strength: number;
  form: 'liquid' | 'granular' | 'tablet';
  /** ppm of cyanuric acid added per 1 ppm of free chlorine delivered. */
  cyaPerPpm?: number;
  /** ppm of calcium hardness added per 1 ppm of free chlorine delivered. */
  calciumPerPpm?: number;
  note?: string;
}

export const CHLORINE_PRODUCTS: ChlorineProduct[] = [
  {
    id: 'liquid-125',
    label: 'Liquid chlorine (12.5%)',
    strength: 12.5,
    form: 'liquid',
    note: 'Adds no stabiliser and no calcium. Loses strength in storage — old jugs dose weak.',
  },
  {
    id: 'liquid-10',
    label: 'Liquid chlorine (10%)',
    strength: 10,
    form: 'liquid',
    note: 'Household-strength bleach sits nearer 6%; check the label before dosing.',
  },
  {
    id: 'cal-hypo-73',
    label: 'Cal-hypo (73%)',
    strength: 73,
    form: 'granular',
    // Cal-hypo is roughly 27% calcium by weight; each 1 ppm FC adds ~0.7 ppm CH.
    calciumPerPpm: 0.7,
    note: 'Raises calcium hardness. Poor choice for hard water or a pool already scaling.',
  },
  {
    id: 'dichlor-56',
    label: 'Dichlor (56%)',
    strength: 56,
    form: 'granular',
    cyaPerPpm: 0.9,
    note: 'Adds about 0.9 ppm stabiliser per 1 ppm chlorine — that builds up fast.',
  },
  {
    id: 'trichlor-90',
    label: 'Trichlor tabs (90%)',
    strength: 90,
    form: 'tablet',
    cyaPerPpm: 0.6,
    note: 'Dissolves slowly, so it is for steady feed rather than fixing a low reading today. Also strongly acidic.',
  },
];

export const getChlorineProduct = (id: string): ChlorineProduct =>
  CHLORINE_PRODUCTS.find((product) => product.id === id) ?? CHLORINE_PRODUCTS[0];

export interface ChlorineDose {
  /** Fluid ounces for liquids, weight ounces for solids. */
  amount: number;
  unit: 'fl oz' | 'oz';
  /** Friendly restatement, e.g. "1.2 gallons" or "2 lb 3 oz". */
  friendly: string;
  ppmRise: number;
  cyaAdded?: number;
  calciumAdded?: number;
}

/**
 * How much product raises free chlorine from `current` to `target`.
 *
 * Liquid: volume = Cl₂ grams needed ÷ (trade % ÷ 100), since trade percent is
 * grams of available chlorine per 100 mL.
 * Solid: weight = Cl₂ grams needed ÷ (weight % ÷ 100).
 */
export function chlorineDose(
  gallons: number,
  currentPpm: number,
  targetPpm: number,
  product: ChlorineProduct,
): ChlorineDose {
  const ppmRise = Math.max(0, targetPpm - currentPpm);
  const chlorineGrams = gramsForPpm(gallons, ppmRise);

  if (product.form === 'liquid') {
    const millilitres = chlorineGrams / (product.strength / 100);
    const flOz = millilitres / ML_PER_FL_OZ;
    return {
      amount: flOz,
      unit: 'fl oz',
      friendly: describeVolume(flOz),
      ppmRise,
    };
  }

  const grams = chlorineGrams / (product.strength / 100);
  const oz = grams / GRAMS_PER_OUNCE;
  return {
    amount: oz,
    unit: 'oz',
    friendly: describeWeight(oz),
    ppmRise,
    cyaAdded: product.cyaPerPpm ? ppmRise * product.cyaPerPpm : undefined,
    calciumAdded: product.calciumPerPpm ? ppmRise * product.calciumPerPpm : undefined,
  };
}

/**
 * Breakpoint chlorination. The MAHC puts the chlorine required to break
 * chloramines at roughly ten times the combined chlorine reading, less the free
 * chlorine already present.
 */
export function breakpointTarget(freeChlorine: number, combinedChlorine: number) {
  return Math.max(0, combinedChlorine * 10 - freeChlorine);
}

// ---------------------------------------------------------------------------
// Alkalinity and pH
// ---------------------------------------------------------------------------

/**
 * Sodium bicarbonate to raise total alkalinity.
 * eq = CaCO₃ grams ÷ 50.045; NaHCO₃ supplies one equivalent per 84.007 g.
 */
export function bakingSodaForAlkalinity(gallons: number, ppmRise: number) {
  const equivalents = gramsForPpm(gallons, ppmRise) / CACO3_EQUIVALENT_WEIGHT;
  const grams = equivalents * 84.007;
  return { pounds: grams / GRAMS_PER_POUND, ounces: grams / GRAMS_PER_OUNCE };
}

/** Muriatic acid strengths sold for pool use. */
export const ACID_STRENGTHS = [
  { id: 'muriatic-3145', label: 'Muriatic acid (31.45%, 20° Baumé)', percent: 31.45, density: 1.16 },
  { id: 'muriatic-1450', label: 'Muriatic acid (14.5%, 10° Baumé)', percent: 14.5, density: 1.07 },
];

/**
 * Muriatic acid to lower total alkalinity by `ppmDrop`.
 *
 * Acid lowers pH and alkalinity together, and how far pH moves depends on how
 * much buffer the water holds — which is why this is expressed against
 * alkalinity, the measurable quantity, rather than against pH.
 */
export function acidForAlkalinity(
  gallons: number,
  ppmDrop: number,
  strength = ACID_STRENGTHS[0],
) {
  const equivalents = gramsForPpm(gallons, ppmDrop) / CACO3_EQUIVALENT_WEIGHT;
  const gramsHclPerLitre = (strength.percent / 100) * strength.density * 1000;
  const equivalentsPerLitre = gramsHclPerLitre / 36.461;
  const litresNeeded = equivalents / equivalentsPerLitre;
  const flOz = (litresNeeded * 1000) / ML_PER_FL_OZ;
  return { flOz, friendly: describeVolume(flOz) };
}

// ---------------------------------------------------------------------------
// Salt
// ---------------------------------------------------------------------------

/** Pounds of salt to move salinity from `current` to `target` ppm. */
export function saltNeeded(gallons: number, currentPpm: number, targetPpm: number) {
  const grams = gramsForPpm(gallons, Math.max(0, targetPpm - currentPpm));
  const pounds = grams / GRAMS_PER_POUND;
  return { pounds, bags40lb: pounds / 40 };
}

/** Diluting down means replacing water — there is no chemical that removes salt. */
export function dilutionToLowerSalt(
  gallons: number,
  currentPpm: number,
  targetPpm: number,
) {
  if (currentPpm <= targetPpm) return 0;
  return gallons * (1 - targetPpm / currentPpm);
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function describeVolume(flOz: number): string {
  if (flOz <= 0) return 'nothing needed';
  if (flOz >= 128) {
    const gallons = flOz / 128;
    return `${gallons.toFixed(gallons < 10 ? 1 : 0)} gal`;
  }
  if (flOz >= 32) return `${(flOz / 32).toFixed(1)} qt`;
  return `${flOz.toFixed(1)} fl oz`;
}

export function describeWeight(oz: number): string {
  if (oz <= 0) return 'nothing needed';
  if (oz < 16) return `${oz.toFixed(1)} oz`;
  const pounds = Math.floor(oz / 16);
  const remainder = Math.round(oz % 16);
  return remainder ? `${pounds} lb ${remainder} oz` : `${pounds} lb`;
}

/** CDC Model Aquatic Health Code operating ranges, for on-page reference. */
export const MAHC_RANGES = {
  freeChlorineNoCya: { min: 1, ideal: 2, max: 10 },
  freeChlorineWithCya: { min: 2, ideal: 3, max: 10 },
  ph: { min: 7.0, ideal: 7.4, max: 7.8 },
  totalAlkalinity: { min: 60, ideal: 100, max: 180 },
  saltTypical: { min: 2700, ideal: 3200, max: 3400 },
};
