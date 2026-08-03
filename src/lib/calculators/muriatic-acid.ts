import { ACID_STRENGTHS, acidForAlkalinity, MAHC_RANGES } from '../chemistry';
import { fmt, num, type CalculatorDef } from './types';

export const muriaticAcid: CalculatorDef = {
  id: 'muriatic-acid',
  inputTitle: 'Your pool and readings',
  resultLabel: 'Acid to add',
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
      type: 'choice',
      name: 'strength',
      legend: 'Acid strength',
      display: 'select',
      options: ACID_STRENGTHS.map((acid) => ({ value: acid.id, label: acid.label })),
      default: 'muriatic-3145',
    },
    {
      type: 'number',
      name: 'current',
      width: 'half',
      label: 'Current alkalinity',
      unit: 'ppm',
      min: 0,
      step: 10,
      default: 150,
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
      help: 'Acid lowers pH and alkalinity together, so this is dosed against alkalinity.',
    },
  ],

  compute(values) {
    const gallons = num(values, 'gallons');
    const current = num(values, 'current');
    const target = num(values, 'target');
    const strength =
      ACID_STRENGTHS.find((acid) => acid.id === values.strength) ?? ACID_STRENGTHS[0];

    const blank = {
      headline: { value: '—', unit: 'fl oz' },
      formula: '—',
      rows: [
        { label: 'Lowering alkalinity by', value: '—' },
        { label: 'Acid strength', value: '—' },
        { label: 'MAHC alkalinity range', value: '—' },
        { label: 'Per 10 ppm', value: '—' },
      ],
    };

    if (!Number.isFinite(gallons) || gallons <= 0) {
      return { ...blank, error: 'Enter your pool volume in gallons.' };
    }
    if (![current, target].every((value) => Number.isFinite(value) && value >= 0)) {
      return { ...blank, error: 'Alkalinity readings cannot be negative.' };
    }
    if (target >= current) {
      return {
        ...blank,
        headline: { value: 'None', unit: 'alkalinity already at or below target' },
        formula: `Current ${fmt(current)} ppm is already at or below your ${fmt(target)} ppm target.`,
        rows: [
          { label: 'Lowering alkalinity by', value: '0 ppm' },
          { label: 'Acid strength', value: `${strength.percent}%` },
          {
            label: 'MAHC alkalinity range',
            value: `${MAHC_RANGES.totalAlkalinity.min}–${MAHC_RANGES.totalAlkalinity.max} ppm`,
          },
          { label: 'Per 10 ppm', value: '—' },
        ],
        chain: { gallons: Math.round(gallons) },
      };
    }

    const drop = current - target;
    const dose = acidForAlkalinity(gallons, drop, strength);
    const perTen = acidForAlkalinity(gallons, 10, strength);

    return {
      headline: {
        value: fmt(dose.flOz, 1),
        unit: 'fluid ounces',
        sub: dose.friendly,
      },
      formula: `${fmt(gallons)} gal × ${fmt(drop)} ppm ÷ ${strength.percent}% acid = ${fmt(dose.flOz, 1)} fl oz`,
      rows: [
        { label: 'Lowering alkalinity by', value: `${fmt(drop)} ppm` },
        { label: 'Acid strength', value: `${strength.percent}%` },
        {
          label: 'MAHC alkalinity range',
          value: `${MAHC_RANGES.totalAlkalinity.min}–${MAHC_RANGES.totalAlkalinity.max} ppm`,
        },
        { label: 'Per 10 ppm', value: `${fmt(perTen.flOz, 1)} fl oz` },
      ],
      chain: { gallons: Math.round(gallons) },
    };
  },
};
