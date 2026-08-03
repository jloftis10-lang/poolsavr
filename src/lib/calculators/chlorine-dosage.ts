import {
  CHLORINE_PRODUCTS,
  chlorineDose,
  getChlorineProduct,
  MAHC_RANGES,
} from '../chemistry';
import { fmt, num, type CalculatorDef } from './types';

export const chlorineDosage: CalculatorDef = {
  id: 'chlorine-dosage',
  inputTitle: 'Your pool and readings',
  resultLabel: 'Add this much',
  acceptsParams: ['gallons'],
  fields: [
    {
      type: 'number',
      name: 'gallons',
      label: 'Pool volume',
      unit: 'gallons',
      min: 100,
      step: 500,
      default: 20000,
      help: "Don't know it? The volume calculator works it out from your dimensions.",
    },
    {
      type: 'choice',
      name: 'product',
      legend: 'What are you adding?',
      display: 'select',
      options: CHLORINE_PRODUCTS.map((product) => ({
        value: product.id,
        label: product.label,
      })),
      default: 'liquid-125',
    },
    {
      type: 'number',
      name: 'current',
      width: 'half',
      label: 'Current free chlorine',
      unit: 'ppm',
      min: 0,
      step: 0.5,
      default: 1,
    },
    {
      type: 'number',
      name: 'target',
      width: 'half',
      label: 'Target free chlorine',
      unit: 'ppm',
      min: 0,
      step: 0.5,
      default: 3,
    },
  ],

  compute(values) {
    const gallons = num(values, 'gallons');
    const current = num(values, 'current');
    const target = num(values, 'target');
    const product = getChlorineProduct(String(values.product));

    const blank = {
      headline: { value: '—', unit: product.form === 'liquid' ? 'fl oz' : 'oz' },
      formula: '—',
      rows: [
        { label: 'Raising chlorine by', value: '—' },
        { label: 'Product strength', value: '—' },
        { label: 'Also adds', value: '—' },
        { label: 'MAHC range', value: '—' },
      ],
    };

    if (!Number.isFinite(gallons) || gallons <= 0) {
      return { ...blank, error: 'Enter your pool volume in gallons.' };
    }
    if (![current, target].every((value) => Number.isFinite(value) && value >= 0)) {
      return { ...blank, error: 'Chlorine readings cannot be negative.' };
    }
    if (target <= current) {
      return {
        ...blank,
        headline: { value: 'None', unit: 'already at target' },
        formula: `Current ${current} ppm is already at or above your ${target} ppm target.`,
        rows: [
          { label: 'Raising chlorine by', value: '0 ppm' },
          { label: 'Product strength', value: `${product.strength}%` },
          { label: 'Also adds', value: 'nothing' },
          {
            label: 'MAHC range',
            value: `${MAHC_RANGES.freeChlorineWithCya.min}–${MAHC_RANGES.freeChlorineWithCya.max} ppm`,
          },
        ],
      };
    }

    const dose = chlorineDose(gallons, current, target, product);

    const byproduct = dose.cyaAdded
      ? `${fmt(dose.cyaAdded, 1)} ppm stabiliser`
      : dose.calciumAdded
        ? `${fmt(dose.calciumAdded, 1)} ppm calcium`
        : 'nothing else';

    const perPpm = chlorineDose(gallons, 0, 1, product).amount;

    return {
      headline: {
        value: fmt(dose.amount, 1),
        unit: dose.unit,
        sub: dose.friendly,
      },
      formula:
        product.form === 'liquid'
          ? `${fmt(gallons)} gal × ${fmt(dose.ppmRise, 1)} ppm ÷ ${product.strength}% = ${fmt(dose.amount, 1)} fl oz`
          : `${fmt(gallons)} gal × ${fmt(dose.ppmRise, 1)} ppm ÷ ${product.strength}% = ${fmt(dose.amount, 1)} oz`,
      rows: [
        { label: 'Raising chlorine by', value: `${fmt(dose.ppmRise, 1)} ppm` },
        {
          label: 'Per 1 ppm',
          value: `${fmt(perPpm, 1)} ${dose.unit}`,
        },
        { label: 'Also adds', value: byproduct },
        {
          label: 'MAHC range',
          value: `${MAHC_RANGES.freeChlorineWithCya.min}–${MAHC_RANGES.freeChlorineWithCya.max} ppm`,
        },
      ],
      chain: { gallons: Math.round(gallons) },
    };
  },
};
