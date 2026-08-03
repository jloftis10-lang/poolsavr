import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACID_STRENGTHS,
  acidForAlkalinity,
  bakingSodaForAlkalinity,
  breakpointTarget,
  chlorineDose,
  describeVolume,
  describeWeight,
  dilutionToLowerSalt,
  getChlorineProduct,
  saltNeeded,
} from '../src/lib/chemistry.ts';

/**
 * These pin the derived doses against published industry dosing tables. If a
 * constant here changes, someone is being told to put a different amount of
 * chemical in their pool — so these should fail loudly.
 */
const near = (actual: number, expected: number, tolerance: number, what: string) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${what}: got ${actual.toFixed(3)}, expected ${expected} ±${tolerance}`,
  );

test('liquid chlorine matches published dosing tables', () => {
  // 10,000 gal, +1 ppm
  near(chlorineDose(10000, 0, 1, getChlorineProduct('liquid-125')).amount, 10.2, 0.3, '12.5%');
  near(chlorineDose(10000, 0, 1, getChlorineProduct('liquid-10')).amount, 12.8, 0.3, '10%');
});

test('granular and tablet chlorine match published dosing tables', () => {
  near(chlorineDose(10000, 0, 1, getChlorineProduct('cal-hypo-73')).amount, 1.83, 0.05, 'cal-hypo 73%');
  near(chlorineDose(10000, 0, 1, getChlorineProduct('dichlor-56')).amount, 2.38, 0.05, 'dichlor 56%');
  near(chlorineDose(10000, 0, 1, getChlorineProduct('trichlor-90')).amount, 1.48, 0.05, 'trichlor 90%');
});

test('dose scales linearly with volume and ppm', () => {
  const single = chlorineDose(10000, 0, 1, getChlorineProduct('liquid-125')).amount;
  near(chlorineDose(20000, 0, 3, getChlorineProduct('liquid-125')).amount, single * 6, 1, 'x6');
});

test('current reading is subtracted, and doses never go negative', () => {
  const product = getChlorineProduct('liquid-125');
  const threePpm = chlorineDose(10000, 0, 3, product).amount;
  near(chlorineDose(10000, 2, 5, product).amount, threePpm, 0.01, '2 -> 5 ppm');
  assert.equal(chlorineDose(10000, 5, 2, product).amount, 0, 'target below current');
});

test('stabiliser and calcium byproducts are reported', () => {
  assert.equal(chlorineDose(10000, 0, 5, getChlorineProduct('dichlor-56')).cyaAdded, 4.5);
  assert.equal(chlorineDose(10000, 0, 5, getChlorineProduct('cal-hypo-73')).calciumAdded, 3.5);
  // Liquid chlorine adds neither.
  const liquid = chlorineDose(10000, 0, 5, getChlorineProduct('liquid-125'));
  assert.equal(liquid.cyaAdded, undefined);
  assert.equal(liquid.calciumAdded, undefined);
});

test('breakpoint follows the MAHC 10x combined-chlorine rule', () => {
  assert.equal(breakpointTarget(2, 0.5), 3);
  assert.equal(breakpointTarget(9, 0.5), 0, 'never negative');
});

test('alkalinity up and down match published figures', () => {
  near(bakingSodaForAlkalinity(10000, 10).pounds, 1.4, 0.05, 'baking soda +10 ppm');
  near(acidForAlkalinity(10000, 10).flOz, 25.6, 0.5, 'muriatic 31.45% -10 ppm');
  // Weaker acid takes proportionally more.
  const weak = acidForAlkalinity(10000, 10, ACID_STRENGTHS[1]).flOz;
  assert.ok(weak > 45, `10° Baumé should need far more, got ${weak.toFixed(1)}`);
});

test('salt dosing and dilution', () => {
  near(saltNeeded(10000, 0, 3200).pounds, 267, 2, '0 -> 3200 ppm');
  near(saltNeeded(1000, 0, 120).pounds, 1, 0.02, '1 lb per 1,000 gal ≈ 120 ppm');
  assert.equal(saltNeeded(10000, 3400, 3200).pounds, 0, 'already above target');
  near(dilutionToLowerSalt(10000, 4000, 3200), 2000, 1, 'drain to dilute');
  assert.equal(dilutionToLowerSalt(10000, 3000, 3200), 0, 'already below target');
});

test('amounts are restated in units people actually use', () => {
  assert.equal(describeVolume(0), 'nothing needed');
  assert.equal(describeVolume(10.24), '10.2 fl oz');
  assert.equal(describeVolume(64), '2.0 qt');
  assert.equal(describeVolume(256), '2.0 gal');
  assert.equal(describeWeight(1.83), '1.8 oz');
  assert.equal(describeWeight(32), '2 lb');
  assert.equal(describeWeight(35), '2 lb 3 oz');
});
