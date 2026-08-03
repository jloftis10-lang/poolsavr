import { dilutionToLowerSalt, MAHC_RANGES, saltNeeded } from '../chemistry';
import { fmt, num, type CalculatorDef } from './types';

export const saltLevel: CalculatorDef = {
  id: 'salt-level',
  inputTitle: 'Your pool and reading',
  resultLabel: 'Salt to add',
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
      help: 'Salt is dosed per gallon, so this figure drives the whole result.',
    },
    {
      type: 'number',
      name: 'current',
      width: 'half',
      label: 'Current salt',
      unit: 'ppm',
      min: 0,
      step: 100,
      default: 2400,
    },
    {
      type: 'number',
      name: 'target',
      width: 'half',
      label: 'Target salt',
      unit: 'ppm',
      min: 0,
      step: 100,
      default: 3200,
      help: 'Most chlorine generators want 2,700–3,400 ppm. Check your unit.',
    },
  ],

  compute(values) {
    const gallons = num(values, 'gallons');
    const current = num(values, 'current');
    const target = num(values, 'target');

    const blank = {
      headline: { value: '—', unit: 'pounds of salt' },
      formula: '—',
      rows: [
        { label: '40 lb bags', value: '—' },
        { label: 'Raising salt by', value: '—' },
        { label: 'Typical generator range', value: '—' },
        { label: 'Per 1,000 gallons', value: '—' },
      ],
    };

    if (!Number.isFinite(gallons) || gallons <= 0) {
      return { ...blank, error: 'Enter your pool volume in gallons.' };
    }
    if (![current, target].every((value) => Number.isFinite(value) && value >= 0)) {
      return { ...blank, error: 'Salt readings cannot be negative.' };
    }

    // There is no chemical that removes salt — only replacing water lowers it.
    if (target < current) {
      const drain = dilutionToLowerSalt(gallons, current, target);
      return {
        headline: {
          value: fmt(drain),
          unit: 'gallons to replace',
          sub: `${fmt((drain / gallons) * 100)}% of the pool`,
        },
        formula: `${fmt(gallons)} gal × (1 − ${target} ÷ ${current}) = ${fmt(drain)} gal to swap for fresh water`,
        rows: [
          { label: 'Method', value: 'Drain and refill' },
          { label: 'Lowering salt by', value: `${fmt(current - target)} ppm` },
          {
            label: 'Typical generator range',
            value: `${fmt(MAHC_RANGES.saltTypical.min)}–${fmt(MAHC_RANGES.saltTypical.max)} ppm`,
          },
          { label: 'Salt to add', value: 'none' },
        ],
        chain: { gallons: Math.round(gallons) },
      };
    }

    const { pounds, bags40lb } = saltNeeded(gallons, current, target);
    const rise = target - current;

    if (pounds <= 0) {
      return {
        ...blank,
        headline: { value: 'None', unit: 'already at target' },
        formula: `Current ${fmt(current)} ppm already meets your ${fmt(target)} ppm target.`,
        rows: [
          { label: '40 lb bags', value: '0' },
          { label: 'Raising salt by', value: '0 ppm' },
          {
            label: 'Typical generator range',
            value: `${fmt(MAHC_RANGES.saltTypical.min)}–${fmt(MAHC_RANGES.saltTypical.max)} ppm`,
          },
          { label: 'Per 1,000 gallons', value: '—' },
        ],
        chain: { gallons: Math.round(gallons) },
      };
    }

    return {
      headline: {
        value: fmt(pounds),
        unit: 'pounds of salt',
        sub: `about ${bags40lb < 1 ? 'less than one' : fmt(Math.ceil(bags40lb))} 40 lb bag${bags40lb > 1 ? 's' : ''}`,
      },
      formula: `${fmt(gallons)} gal × ${fmt(rise)} ppm ÷ 120 ppm per lb per 1,000 gal = ${fmt(pounds)} lb`,
      rows: [
        { label: '40 lb bags', value: fmt(bags40lb, 1) },
        { label: 'Raising salt by', value: `${fmt(rise)} ppm` },
        {
          label: 'Typical generator range',
          value: `${fmt(MAHC_RANGES.saltTypical.min)}–${fmt(MAHC_RANGES.saltTypical.max)} ppm`,
        },
        {
          label: 'Per 1,000 gallons',
          value: `${fmt(pounds / (gallons / 1000), 1)} lb`,
        },
      ],
      chain: { gallons: Math.round(gallons) },
    };
  },
};
