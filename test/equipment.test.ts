import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  btuToHeat,
  hoursToHeat,
  nextHeaterSize,
  recommendedHeaterBtu,
  requiredFlowGpm,
  turnoversPerDay,
  getExposure,
  getPipe,
} from '../src/lib/equipment.ts';

const near = (actual: number, expected: number, tolerance: number, what: string) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${what}: got ${actual.toFixed(2)}, expected ${expected} ±${tolerance}`,
  );

test('heater sizing matches the published manufacturer rule', () => {
  // Worked example from the industry guides: 15x30 pool (450 sq ft), 17°F rise.
  near(recommendedHeaterBtu(450, 17, 12), 91800, 1, '450 sq ft, 17°F rise');
});

test('exposure factors move the recommendation the right way', () => {
  const sheltered = recommendedHeaterBtu(450, 17, getExposure('sheltered').factor);
  const average = recommendedHeaterBtu(450, 17, getExposure('average').factor);
  const windy = recommendedHeaterBtu(450, 17, getExposure('windy').factor);
  assert.ok(sheltered < average && average < windy, 'sheltered < average < windy');
});

test('energy to heat follows 8.34 lb per gallon', () => {
  near(btuToHeat(20000, 10), 1668000, 1, '20,000 gal by 10°F');
});

test('time to heat accounts for burner efficiency', () => {
  // 20,000 gal, +10°F, 250k BTU heater at 84% => 1,668,000 / 210,000
  near(hoursToHeat(20000, 10, 250000, 0.84), 7.94, 0.05, '250k BTU');
  // A bigger heater is proportionally faster.
  near(
    hoursToHeat(20000, 10, 500000, 0.84),
    hoursToHeat(20000, 10, 250000, 0.84) / 2,
    0.01,
    'double output, half the time',
  );
  assert.equal(hoursToHeat(20000, 10, 0), Infinity, 'no heater never gets there');
});

test('heater sizes round up to a real product', () => {
  assert.equal(nextHeaterSize(91800), 100000);
  assert.equal(nextHeaterSize(100000), 100000);
  assert.equal(nextHeaterSize(260000), 300000);
  assert.equal(nextHeaterSize(9999999), 400000, 'clamps to the largest listed');
});

test('turnover flow matches the standard calculation', () => {
  near(requiredFlowGpm(20000, 8), 41.67, 0.01, '20,000 gal in 8 hours');
  near(requiredFlowGpm(20000, 6), 55.56, 0.01, '20,000 gal in 6 hours');
  assert.equal(requiredFlowGpm(20000, 0), Infinity, 'zero hours is impossible');
});

test('pipe limits are ordered and looked up safely', () => {
  assert.equal(getPipe('1.5').maxGpm, 45);
  assert.equal(getPipe('2').maxGpm, 80);
  assert.equal(getPipe('nonsense').maxGpm, 80, 'falls back to 2 inch');
});

test('turnovers per day', () => {
  // 41.67 GPM for 8 hours on a 20,000 gal pool is exactly one turnover.
  near(turnoversPerDay(20000, 41.667, 8), 1, 0.01, 'one turnover');
  near(turnoversPerDay(20000, 41.667, 16), 2, 0.01, 'two turnovers');
  assert.equal(turnoversPerDay(0, 40, 8), 0, 'no pool, no turnover');
});
