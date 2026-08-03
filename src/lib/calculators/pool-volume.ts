import { calculatePool } from '../pool-math.js';
import { fmt, num, type CalculatorDef, type Values } from './types';

const SHAPES = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'oval', label: 'Oval' },
  { value: 'round', label: 'Round' },
  { value: 'freeform', label: 'Kidney / freeform' },
];

const isRound = (values: Values) => values.shape === 'round';

/** Water weighs 8.34 lb per US gallon. */
const POUNDS_PER_GALLON = 8.34;

export const poolVolume: CalculatorDef = {
  id: 'pool-volume',
  inputTitle: 'Your pool',
  resultLabel: 'Pool volume',
  fields: [
    {
      type: 'choice',
      name: 'shape',
      legend: 'Pool shape',
      options: SHAPES,
      default: 'rectangle',
    },
    {
      type: 'number',
      name: 'length',
      width: 'half',
      label: 'Length',
      unit: 'ft',
      min: 1,
      step: 0.5,
      default: 32,
      labelFor: (values) => (isRound(values) ? 'Diameter' : 'Length'),
    },
    {
      type: 'number',
      name: 'width',
      width: 'half',
      label: 'Width',
      unit: 'ft',
      min: 1,
      step: 0.5,
      default: 18,
      hiddenWhen: isRound,
    },
    {
      type: 'number',
      name: 'shallow',
      width: 'half',
      label: 'Shallow end',
      unit: 'ft',
      min: 0.5,
      step: 0.5,
      default: 3,
    },
    {
      type: 'number',
      name: 'deep',
      width: 'half',
      label: 'Deep end',
      unit: 'ft',
      min: 0.5,
      step: 0.5,
      default: 8,
      help: 'Same depth throughout? Put the same number in both fields.',
    },
  ],

  compute(values) {
    const shape = String(values.shape ?? 'rectangle');
    const round = shape === 'round';

    const length = num(values, 'length');
    const width = round ? length : num(values, 'width');
    const shallowDepth = num(values, 'shallow');
    const deepDepth = num(values, 'deep');

    const blank = {
      headline: { value: '—', unit: 'US gallons' },
      formula: '—',
      rows: [
        { label: 'Surface area', value: '—' },
        { label: 'Perimeter', value: '—' },
        { label: 'Average depth', value: '—' },
        { label: 'Water weight', value: '—' },
      ],
    };

    const positive = [length, width, shallowDepth, deepDepth].every(
      (value) => Number.isFinite(value) && value > 0,
    );

    if (!positive) {
      return { ...blank, error: 'Enter a positive number in every field.' };
    }
    if (deepDepth < shallowDepth) {
      return {
        ...blank,
        error: 'The deep end must be at least as deep as the shallow end.',
      };
    }

    const result = calculatePool({
      shape,
      length,
      width,
      shallowDepth,
      deepDepth,
    });

    const depth = fmt(result.avgDepth, 1);
    const gallons = fmt(result.gallons);

    const formula = round
      ? `3.14 × (${length} ÷ 2)² × ${depth} × 7.48 = ${gallons} gal`
      : shape === 'oval'
        ? `3.14 × (${length} ÷ 2) × (${width} ÷ 2) × ${depth} × 7.48 = ${gallons} gal`
        : shape === 'freeform'
          ? `${length} × ${width} × ${depth} × 7.48 × 0.85 = ${gallons} gal`
          : `${length} × ${width} × ${depth} × 7.48 = ${gallons} gal`;

    return {
      headline: {
        value: gallons,
        unit: 'US gallons',
        sub: `${fmt(result.liters)} liters`,
      },
      formula,
      rows: [
        { label: 'Surface area', value: `${fmt(result.area)} sq ft` },
        { label: 'Perimeter', value: `${fmt(result.perimeter)} ft` },
        { label: 'Average depth', value: `${depth} ft` },
        {
          label: 'Water weight',
          value: `${fmt((result.gallons * POUNDS_PER_GALLON) / 2000, 1)} tons`,
        },
      ],
      chain: {
        gallons: Math.round(result.gallons),
        area: Math.round(result.area),
      },
    };
  },
};
