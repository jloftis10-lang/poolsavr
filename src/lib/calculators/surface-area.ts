import { perimeter, surfaceArea } from '../pool-math.js';
import { fmt, num, type CalculatorDef, type Values } from './types';

const SHAPES = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'oval', label: 'Oval' },
  { value: 'round', label: 'Round' },
  { value: 'freeform', label: 'Kidney / freeform' },
];

const isRound = (values: Values) => values.shape === 'round';

export const poolSurfaceArea: CalculatorDef = {
  id: 'surface-area',
  inputTitle: 'Your pool',
  resultLabel: 'Surface area',
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
  ],

  compute(values) {
    const shape = String(values.shape ?? 'rectangle');
    const round = shape === 'round';
    const length = num(values, 'length');
    const width = round ? length : num(values, 'width');

    const blank = {
      headline: { value: '—', unit: 'square feet' },
      formula: '—',
      rows: [
        { label: 'Perimeter', value: '—' },
        { label: 'Square metres', value: '—' },
        { label: 'Solar cover size', value: '—' },
        { label: 'Resurfacing basis', value: '—' },
      ],
    };

    if (![length, width].every((value) => Number.isFinite(value) && value > 0)) {
      return { ...blank, error: 'Enter a positive number in every field.' };
    }

    const area = surfaceArea(shape, length, width);
    const edge = perimeter(shape, length, width);

    const formula = round
      ? `3.14 × (${length} ÷ 2)² = ${fmt(area)} sq ft`
      : shape === 'oval'
        ? `3.14 × (${length} ÷ 2) × (${width} ÷ 2) = ${fmt(area)} sq ft`
        : shape === 'freeform'
          ? `${length} × ${width} × 0.85 = ${fmt(area)} sq ft`
          : `${length} × ${width} = ${fmt(area)} sq ft`;

    return {
      headline: {
        value: fmt(area),
        unit: 'square feet',
        sub: `${fmt(edge)} ft perimeter`,
      },
      formula,
      rows: [
        { label: 'Perimeter', value: `${fmt(edge)} ft` },
        { label: 'Square metres', value: `${fmt(area * 0.092903, 1)} m²` },
        {
          label: 'Solar cover size',
          value: round ? `${length} ft round` : `${length} × ${width} ft`,
        },
        { label: 'Resurfacing basis', value: `${fmt(area)} sq ft` },
      ],
      chain: { area: Math.round(area) },
    };
  },
};
