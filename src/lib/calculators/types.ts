/**
 * The contract every calculator implements.
 *
 * A calculator supplies field definitions and a pure `compute`. The shared
 * <Calculator> shell owns layout, validation display, formatting, and the
 * results panel — so a new calculator is a data file, not a new page script.
 */

export type Values = Record<string, string | number>;

export interface NumberField {
  type: 'number';
  name: string;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  default: number;
  help?: string;
  /** Pair with the next half-width field on one row. Defaults to full. */
  width?: 'full' | 'half';
  /** Swap the label based on other field values (e.g. Length → Diameter). */
  labelFor?: (values: Values) => string;
  /** Hide this field entirely for some shapes/modes. */
  hiddenWhen?: (values: Values) => boolean;
}

export interface ChoiceField {
  type: 'choice';
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  default: string;
  /** Render as a chip row (default) or a native select for long lists. */
  display?: 'chips' | 'select';
}

export type Field = NumberField | ChoiceField;

export interface ResultRow {
  label: string;
  value: string;
}

export interface CalculatorResult {
  /** The single number the page exists to produce. */
  headline: { value: string; unit: string; sub?: string };
  /** The arithmetic actually applied — shown to build trust and earn links. */
  formula: string;
  rows: ResultRow[];
  /** Set when input is invalid; the shell shows this and blanks the results. */
  error?: string;
  /** Values other calculators can chain from, serialised into links. */
  chain?: Record<string, number>;
}

export interface CalculatorDef {
  id: string;
  /** Heading above the input panel. */
  inputTitle: string;
  fields: Field[];
  compute: (values: Values) => CalculatorResult;
  /** Query params this calculator will read on load, e.g. ['gallons']. */
  acceptsParams?: string[];
}

export const defaultValues = (def: CalculatorDef): Values =>
  Object.fromEntries(def.fields.map((field) => [field.name, field.default]));

export const num = (values: Values, name: string): number =>
  typeof values[name] === 'number'
    ? (values[name] as number)
    : Number(values[name]);

export const fmt = (value: number, digits = 0): string =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
