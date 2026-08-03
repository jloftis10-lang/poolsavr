import { bakingSodaForAlkalinity, MAHC_RANGES } from '../chemistry';
import { describeWeight } from '../chemistry';
import { fmt, num, type CalculatorDef } from './types';

export const bakingSodaAlkalinity: CalculatorDef = {
  id: 'baking-soda-alkalinity',
  inputTitle: 'Your pool and readings',
  resultLabel: 'Baking soda to add',
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
    },
    {
      type: 'number',
      name: 'current',
      width: 'half',
      label: 'Current alkalinity',
      unit: 'ppm',
      min: 0,
      step: 10,
      default: 70,
    },
    {
      type: 'number',
      name: 'target',
      width: 'half',
      label: 'Target alkalinity',
      unit: 'ppm',
      min: 0,
      step: 10,
      default: 100,
      help: 'The MAHC operating range is 60–180 ppm; most pools settle near 100.',
    },
  ],

  compute(values) {
    const gallons = num(values, 'gallons');
    const current = num(values, 'current');
    const target = num(values, 'target');

    const blank = {
      headline: { value: '—', unit: 'pounds' },
      formula: '—',
      rows: [
        { label: 'Raising alkalinity by', value: '—' },
        { label: 'Per 10 ppm', value: '—' },
        { label: 'MAHC alkalinity range', value: '—' },
        { label: 'In ounces', value: '—' },
      ],
    };

    if (!Number.isFinite(gallons) || gallons <= 0) {
      return { ...blank, error: 'Enter your pool volume in gallons.' };
    }
    if (![current, target].every((value) => Number.isFinite(value) && value >= 0)) {
      return { ...blank, error: 'Alkalinity readings cannot be negative.' };
    }
    if (target <= current) {
      return {
        ...blank,
        headline: { value: 'None', unit: 'already at target' },
        formula: `Current ${fmt(current)} ppm already meets your ${fmt(target)} ppm target. To lower alkalinity you need acid, not baking soda.`,
        rows: [
          { label: 'Raising alkalinity by', value: '0 ppm' },
          { label: 'Per 10 ppm', value: '—' },
          {
            label: 'MAHC alkalinity range',
            value: `${MAHC_RANGES.totalAlkalinity.min}–${MAHC_RANGES.totalAlkalinity.max} ppm`,
          },
          { label: 'In ounces', value: '—' },
        ],
        chain: { gallons: Math.round(gallons) },
      };
    }

    const rise = target - current;
    const dose = bakingSodaForAlkalinity(gallons, rise);
    const perTen = bakingSodaForAlkalinity(gallons, 10);

    return {
      headline: {
        value: fmt(dose.pounds, 1),
        unit: 'pounds',
        sub: describeWeight(dose.ounces),
      },
      formula: `${fmt(gallons)} gal × ${fmt(rise)} ppm = ${fmt(dose.pounds, 1)} lb sodium bicarbonate`,
      rows: [
        { label: 'Raising alkalinity by', value: `${fmt(rise)} ppm` },
        { label: 'Per 10 ppm', value: `${fmt(perTen.pounds, 2)} lb` },
        {
          label: 'MAHC alkalinity range',
          value: `${MAHC_RANGES.totalAlkalinity.min}–${MAHC_RANGES.totalAlkalinity.max} ppm`,
        },
        { label: 'In ounces', value: `${fmt(dose.ounces)} oz` },
      ],
      chain: { gallons: Math.round(gallons) },
    };
  },
};
