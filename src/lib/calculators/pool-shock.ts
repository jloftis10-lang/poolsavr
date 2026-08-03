import {
  breakpointTarget,
  chlorineDose,
  getChlorineProduct,
  CHLORINE_PRODUCTS,
} from '../chemistry';
import { fmt, num, type CalculatorDef } from './types';

/** Shock products — trichlor is excluded; it dissolves far too slowly to shock with. */
const SHOCK_PRODUCTS = CHLORINE_PRODUCTS.filter(
  (product) => product.form !== 'tablet',
);

export const poolShock: CalculatorDef = {
  id: 'pool-shock',
  inputTitle: 'Your pool and readings',
  resultLabel: 'Shock dose',
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
      help: 'Shock is dosed per gallon, so this number drives everything below.',
    },
    {
      type: 'choice',
      name: 'product',
      legend: 'Shock product',
      display: 'select',
      options: SHOCK_PRODUCTS.map((product) => ({
        value: product.id,
        label: product.label,
      })),
      default: 'cal-hypo-73',
    },
    {
      type: 'number',
      name: 'free',
      width: 'half',
      label: 'Free chlorine',
      unit: 'ppm',
      min: 0,
      step: 0.5,
      default: 1,
    },
    {
      type: 'number',
      name: 'total',
      width: 'half',
      label: 'Total chlorine',
      unit: 'ppm',
      min: 0,
      step: 0.5,
      default: 2,
      help: 'Combined chloramines are total minus free — that is what shocking burns off.',
    },
  ],

  compute(values) {
    const gallons = num(values, 'gallons');
    const free = num(values, 'free');
    const total = num(values, 'total');
    const product = getChlorineProduct(String(values.product));
    const unit = product.form === 'liquid' ? 'fl oz' : 'oz';

    const blank = {
      headline: { value: '—', unit },
      formula: '—',
      rows: [
        { label: 'Combined chlorine', value: '—' },
        { label: 'Breakpoint target', value: '—' },
        { label: 'Raising chlorine by', value: '—' },
        { label: 'Also adds', value: '—' },
      ],
    };

    if (!Number.isFinite(gallons) || gallons <= 0) {
      return { ...blank, error: 'Enter your pool volume in gallons.' };
    }
    if (![free, total].every((value) => Number.isFinite(value) && value >= 0)) {
      return { ...blank, error: 'Chlorine readings cannot be negative.' };
    }
    if (total < free) {
      return {
        ...blank,
        error: 'Total chlorine cannot be lower than free chlorine — re-test.',
      };
    }

    const combined = total - free;
    const rise = breakpointTarget(free, combined);

    if (rise <= 0) {
      return {
        ...blank,
        headline: { value: 'None', unit: 'no chloramines to burn' },
        formula: `Combined chlorine is ${fmt(combined, 1)} ppm — nothing to break.`,
        rows: [
          { label: 'Combined chlorine', value: `${fmt(combined, 1)} ppm` },
          { label: 'Breakpoint target', value: '—' },
          { label: 'Raising chlorine by', value: '0 ppm' },
          { label: 'Also adds', value: 'nothing' },
        ],
      };
    }

    const dose = chlorineDose(gallons, 0, rise, product);
    const byproduct = dose.cyaAdded
      ? `${fmt(dose.cyaAdded, 1)} ppm stabiliser`
      : dose.calciumAdded
        ? `${fmt(dose.calciumAdded, 1)} ppm calcium`
        : 'nothing else';

    return {
      headline: {
        value: fmt(dose.amount, 1),
        unit,
        sub: dose.friendly,
      },
      // The MAHC puts breakpoint at roughly 10x combined chlorine.
      formula: `(${fmt(combined, 1)} ppm combined × 10) − ${fmt(free, 1)} ppm free = ${fmt(rise, 1)} ppm needed`,
      rows: [
        { label: 'Combined chlorine', value: `${fmt(combined, 1)} ppm` },
        { label: 'Breakpoint target', value: `${fmt(free + rise, 1)} ppm` },
        { label: 'Raising chlorine by', value: `${fmt(rise, 1)} ppm` },
        { label: 'Also adds', value: byproduct },
      ],
      chain: { gallons: Math.round(gallons) },
    };
  },
};
