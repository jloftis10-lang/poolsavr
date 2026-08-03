/**
 * National cost estimates, gathered from published 2026 industry figures.
 *
 * These are ESTIMATES, not quotes. Every page that renders them also renders
 * <Disclaimer kind="cost" /> and a <Sources> list. Regional swings of 30% in
 * either direction are normal.
 *
 * Cost content decays faster than anything else on the site — revisit this file
 * at least annually and bump `lastReviewed`.
 */

export const lastReviewed = 'August 2026';

export interface Source {
  title: string;
  publisher: string;
  url: string;
  accessed?: string;
}

/** Reused across the cost pillar. */
export const COST_SOURCES: Record<string, Source> = {
  homeguideResurfacing: {
    title: 'How Much Does Pool Resurfacing Cost?',
    publisher: 'HomeGuide',
    url: 'https://homeguide.com/costs/pool-resurfacing-cost',
    accessed: 'August 2026',
  },
  homeguideTile: {
    title: 'How Much Does Pool Tile Cost?',
    publisher: 'HomeGuide',
    url: 'https://homeguide.com/costs/pool-tile-cost',
    accessed: 'August 2026',
  },
  homeguideMaintenance: {
    title: 'Pool Maintenance Costs — Monthly & Yearly Cleaning Service Cost',
    publisher: 'HomeGuide',
    url: 'https://homeguide.com/costs/pool-maintenance-cost',
    accessed: 'August 2026',
  },
  angiRemodel: {
    title: 'How Much Does a Pool Remodel Cost?',
    publisher: 'Angi',
    url: 'https://www.angi.com/articles/pool-remodel-cost.htm',
    accessed: 'August 2026',
  },
  angiTile: {
    title: 'How Much Does Pool Tile Cost?',
    publisher: 'Angi',
    url: 'https://www.angi.com/articles/pool-tile-cost.htm',
    accessed: 'August 2026',
  },
  homeAdvisorMaintenance: {
    title: 'What Does Pool Maintenance Cost?',
    publisher: 'HomeAdvisor',
    url: 'https://www.homeadvisor.com/cost/swimming-pools-hot-tubs-and-saunas/maintain-a-swimming-pool/',
    accessed: 'August 2026',
  },
};

export interface Finish {
  id: string;
  name: string;
  lowPerSqFt: number;
  highPerSqFt: number;
  lifespanLow: number;
  lifespanHigh: number;
  note: string;
}

/** Interior finishes, priced per square foot of interior surface. */
export const FINISHES: Finish[] = [
  {
    id: 'plaster',
    name: 'White plaster',
    lowPerSqFt: 4,
    highPerSqFt: 8,
    lifespanLow: 7,
    lifespanHigh: 12,
    note: 'The baseline. Cheapest up front and the shortest-lived, so over 20 years it is rarely the cheapest option.',
  },
  {
    id: 'quartz',
    name: 'Quartz aggregate',
    lowPerSqFt: 5,
    highPerSqFt: 10,
    lifespanLow: 10,
    lifespanHigh: 15,
    note: 'Plaster with quartz blended in. Harder, more stain-resistant, and a modest step up in price.',
  },
  {
    id: 'pebble',
    name: 'Pebble aggregate',
    lowPerSqFt: 10,
    highPerSqFt: 15,
    lifespanLow: 15,
    lifespanHigh: 25,
    note: 'Exposed stone. The most durable common finish and the most expensive, with a texture some people dislike underfoot.',
  },
];

export const getFinish = (id: string) =>
  FINISHES.find((finish) => finish.id === id) ?? FINISHES[0];

/**
 * Resurfacing cost for a given interior surface area.
 * Priced on interior area — floor plus walls — not the water's surface.
 */
export function resurfacingCost(interiorSqFt: number, finish: Finish) {
  return {
    low: interiorSqFt * finish.lowPerSqFt,
    high: interiorSqFt * finish.highPerSqFt,
  };
}

/** Cost per year of surface life, which is the comparison that actually matters. */
export function costPerYear(interiorSqFt: number, finish: Finish) {
  const { low, high } = resurfacingCost(interiorSqFt, finish);
  return {
    low: low / finish.lifespanHigh,
    high: high / finish.lifespanLow,
  };
}

/** Typical interior areas by pool size, for the reference tables. */
export const POOL_SIZES = [
  { size: '12 × 24 ft', interiorSqFt: 450 },
  { size: '14 × 28 ft', interiorSqFt: 600 },
  { size: '16 × 32 ft', interiorSqFt: 950 },
  { size: '18 × 36 ft', interiorSqFt: 1200 },
  { size: '20 × 40 ft', interiorSqFt: 1450 },
];

/** Line items in a whole-project remodel, priced by their own unit. */
export const LINE_ITEMS = [
  {
    id: 'interior',
    name: 'Interior finish',
    unit: 'per sq ft of interior surface',
    low: 4,
    high: 15,
    typicalLow: 4000,
    typicalHigh: 14000,
  },
  {
    id: 'waterline-tile',
    name: 'Waterline tile',
    unit: 'per linear foot of perimeter',
    low: 25,
    high: 30,
    typicalLow: 1500,
    typicalHigh: 4000,
  },
  {
    id: 'coping',
    name: 'Coping',
    unit: 'per linear foot of perimeter',
    low: 30,
    high: 50,
    typicalLow: 2000,
    typicalHigh: 5500,
  },
  {
    id: 'decking',
    name: 'Decking',
    unit: 'per sq ft of deck',
    low: 6,
    high: 20,
    typicalLow: 6000,
    typicalHigh: 15000,
  },
  {
    id: 'equipment',
    name: 'Equipment (pump, filter, heater)',
    unit: 'per project',
    low: 2500,
    high: 9000,
    typicalLow: 2500,
    typicalHigh: 9000,
  },
];

/** Budget tiers for a whole-project remodel. */
export const REMODEL_TIERS = [
  {
    name: 'Cosmetic refresh',
    low: 14000,
    high: 28000,
    includes: ['Interior finish', 'Waterline tile', 'Coping'],
    note: 'The common scope when the shell is sound and the pool simply looks dated.',
  },
  {
    name: 'Full remodel',
    low: 30000,
    high: 65000,
    includes: [
      'Interior finish',
      'Waterline tile',
      'Coping',
      'Decking',
      'Equipment',
    ],
    note: 'Everything visible plus the equipment pad. Where most whole-project remodels land.',
  },
  {
    name: 'Structural remodel',
    low: 55000,
    high: 120000,
    includes: [
      'Everything above',
      'Spa addition or reshaping',
      'Automation',
      'Structural repair',
    ],
    note: 'Changing the pool itself rather than resurfacing it. Effectively a rebuild.',
  },
];

/** Monthly maintenance, DIY versus professional service. */
export const MAINTENANCE = {
  diy: { low: 80, high: 150 },
  professional: { low: 150, high: 300 },
  nationalAverage: 140,
  breakdown: [
    { item: 'Chemicals', low: 30, high: 60 },
    { item: 'Electricity (pump)', low: 50, high: 100 },
    { item: 'Water (top-up)', low: 10, high: 30 },
    { item: 'Filter media and parts', low: 5, high: 15 },
  ],
};

/** Regional multipliers applied to national figures. Directional, not precise. */
export const REGIONS = [
  {
    name: 'Southwest (AZ, NV, inland CA)',
    multiplier: '0.9× – 1.0×',
    note: 'High pool density and year-round work keep crews competitive and pricing keen.',
  },
  {
    name: 'Southeast (FL, GA, TX Gulf)',
    multiplier: '0.9× – 1.05×',
    note: 'Plenty of competition, though hurricane season compresses the schedule.',
  },
  {
    name: 'Coastal California',
    multiplier: '1.15× – 1.4×',
    note: 'Labour and permitting costs are the highest in the country.',
  },
  {
    name: 'Northeast and Midwest',
    multiplier: '1.1× – 1.3×',
    note: 'A short season concentrates demand into a few months, and fewer specialist crews compete for it.',
  },
];

export const money = (value: number) =>
  `$${Math.round(value).toLocaleString('en-US')}`;

export const range = (low: number, high: number) => `${money(low)}–${money(high)}`;
