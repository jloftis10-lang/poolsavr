import {
  EXPOSURES,
  getExposure,
  hoursToHeat,
  nextHeaterSize,
  recommendedHeaterBtu,
} from '../equipment';
import { fmt, num, type CalculatorDef } from './types';

export const heaterSize: CalculatorDef = {
  id: 'heater-size',
  inputTitle: 'Your pool and target',
  resultLabel: 'Heater size',
  acceptsParams: ['area', 'gallons'],
  fields: [
    {
      type: 'number',
      name: 'area',
      width: 'half',
      label: 'Surface area',
      unit: 'sq ft',
      min: 10,
      step: 10,
      default: 512,
    },
    {
      type: 'number',
      name: 'gallons',
      width: 'half',
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
      label: 'Current water temp',
      unit: '°F',
      min: 32,
      step: 1,
      default: 68,
    },
    {
      type: 'number',
      name: 'target',
      width: 'half',
      label: 'Target water temp',
      unit: '°F',
      min: 32,
      step: 1,
      default: 84,
    },
    {
      type: 'choice',
      name: 'exposure',
      legend: 'Exposure',
      options: EXPOSURES.map((exposure) => ({
        value: exposure.id,
        label: exposure.label,
      })),
      default: 'average',
    },
  ],

  compute(values) {
    const area = num(values, 'area');
    const gallons = num(values, 'gallons');
    const current = num(values, 'current');
    const target = num(values, 'target');
    const exposure = getExposure(String(values.exposure));

    const blank = {
      headline: { value: '—', unit: 'BTU per hour' },
      formula: '—',
      rows: [
        { label: 'Temperature rise', value: '—' },
        { label: 'Next size up', value: '—' },
        { label: 'Time to heat', value: '—' },
        { label: 'Exposure factor', value: '—' },
      ],
    };

    if (![area, gallons].every((value) => Number.isFinite(value) && value > 0)) {
      return { ...blank, error: 'Enter your surface area and pool volume.' };
    }
    if (![current, target].every((value) => Number.isFinite(value))) {
      return { ...blank, error: 'Enter both water temperatures.' };
    }
    if (target <= current) {
      return {
        ...blank,
        headline: { value: 'None', unit: 'no heating needed' },
        formula: `Target ${target}°F is at or below the current ${current}°F.`,
        rows: [
          { label: 'Temperature rise', value: '0 °F' },
          { label: 'Next size up', value: '—' },
          { label: 'Time to heat', value: '—' },
          { label: 'Exposure factor', value: `×${exposure.factor}` },
        ],
      };
    }

    const rise = target - current;
    const btu = recommendedHeaterBtu(area, rise, exposure.factor);
    const recommended = nextHeaterSize(btu);
    const hours = hoursToHeat(gallons, rise, recommended);

    return {
      headline: {
        value: fmt(btu),
        unit: 'BTU per hour minimum',
        sub: `buy at least ${fmt(recommended)} BTU`,
      },
      // The manufacturer sizing rule: area × rise × exposure factor.
      formula: `${fmt(area)} sq ft × ${fmt(rise)}°F × ${exposure.factor} = ${fmt(btu)} BTU/hr`,
      rows: [
        { label: 'Temperature rise', value: `${fmt(rise)} °F` },
        { label: 'Recommended size', value: `${fmt(recommended)} BTU` },
        {
          label: 'Time to heat',
          value: Number.isFinite(hours) ? `about ${fmt(hours, 1)} hours` : '—',
        },
        { label: 'Exposure factor', value: `×${exposure.factor}` },
      ],
      chain: { gallons: Math.round(gallons), area: Math.round(area) },
    };
  },
};
