import { getPipe, PIPE_LIMITS, requiredFlowGpm, turnoversPerDay } from '../equipment';
import { fmt, num, type CalculatorDef } from './types';

export const pumpSize: CalculatorDef = {
  id: 'pump-size',
  inputTitle: 'Your pool and plumbing',
  resultLabel: 'Flow needed',
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
      name: 'turnover',
      width: 'half',
      label: 'Turnover time',
      unit: 'hours',
      min: 1,
      max: 24,
      step: 1,
      default: 8,
    },
    {
      type: 'number',
      name: 'runtime',
      width: 'half',
      label: 'Daily run time',
      unit: 'hours',
      min: 1,
      max: 24,
      step: 1,
      default: 8,
    },
    {
      type: 'choice',
      name: 'pipe',
      legend: 'Suction pipe size',
      options: PIPE_LIMITS.map((pipe) => ({ value: pipe.id, label: pipe.label })),
      default: '2',
    },
  ],

  compute(values) {
    const gallons = num(values, 'gallons');
    const turnover = num(values, 'turnover');
    const runtime = num(values, 'runtime');
    const pipe = getPipe(String(values.pipe));

    const blank = {
      headline: { value: '—', unit: 'gallons per minute' },
      formula: '—',
      rows: [
        { label: 'Turnover time', value: '—' },
        { label: 'Pipe limit', value: '—' },
        { label: 'Turnovers per day', value: '—' },
        { label: 'Within pipe capacity', value: '—' },
      ],
    };

    if (!Number.isFinite(gallons) || gallons <= 0) {
      return { ...blank, error: 'Enter your pool volume in gallons.' };
    }
    if (!Number.isFinite(turnover) || turnover <= 0) {
      return { ...blank, error: 'Turnover time must be at least one hour.' };
    }
    if (!Number.isFinite(runtime) || runtime <= 0) {
      return { ...blank, error: 'Daily run time must be at least one hour.' };
    }

    const gpm = requiredFlowGpm(gallons, turnover);
    const turnovers = turnoversPerDay(gallons, gpm, runtime);
    const withinLimit = gpm <= pipe.maxGpm;

    return {
      headline: {
        value: fmt(gpm, 1),
        unit: 'gallons per minute',
        sub: withinLimit
          ? `${pipe.label} pipe handles this`
          : `too much for ${pipe.label} pipe`,
      },
      formula: `${fmt(gallons)} gal ÷ (${fmt(turnover)} hr × 60) = ${fmt(gpm, 1)} GPM`,
      rows: [
        { label: 'Turnover time', value: `${fmt(turnover)} hours` },
        { label: 'Pipe limit', value: `${fmt(pipe.maxGpm)} GPM` },
        { label: 'Turnovers per day', value: fmt(turnovers, 2) },
        {
          label: 'Within pipe capacity',
          value: withinLimit ? 'Yes' : 'No — size up the pipe',
        },
      ],
      chain: { gallons: Math.round(gallons) },
    };
  },
};
