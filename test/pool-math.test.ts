import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePool, surfaceArea, perimeter } from '../src/lib/pool-math.js';

/** Pinned against standard published pool volume charts. */
const near = (actual: number, expected: number, tolerance: number, what: string) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${what}: got ${actual.toFixed(1)}, expected ${expected} ±${tolerance}`,
  );

test('rectangular volume matches published charts', () => {
  const r = calculatePool({ shape: 'rectangle', length: 32, width: 18, shallowDepth: 3, deepDepth: 8 });
  near(r.gallons, 23698, 5, '32x18 avg 5.5ft');
  near(r.area, 576, 0.1, 'surface area');
  near(r.perimeter, 100, 0.1, 'perimeter');
  near(r.avgDepth, 5.5, 0.001, 'average depth');
});

test('round volume matches published charts', () => {
  const r = calculatePool({ shape: 'round', length: 24, width: 0, shallowDepth: 4, deepDepth: 4 });
  near(r.gallons, 13536, 5, '24ft round at 4ft');
});

test('oval uses ellipse area', () => {
  const r = calculatePool({ shape: 'oval', length: 30, width: 15, shallowDepth: 3, deepDepth: 6 });
  near(r.area, Math.PI * 15 * 7.5, 0.1, 'ellipse area');
  near(r.gallons, 11897, 5, '30x15 oval');
});

test('freeform applies the 0.85 industry factor', () => {
  const rect = calculatePool({ shape: 'rectangle', length: 30, width: 15, shallowDepth: 3, deepDepth: 6 });
  const free = calculatePool({ shape: 'freeform', length: 30, width: 15, shallowDepth: 3, deepDepth: 6 });
  near(free.gallons, rect.gallons * 0.85, 1, 'freeform vs rectangle');
});

test('round ignores width and uses the diameter', () => {
  const a = calculatePool({ shape: 'round', length: 24, width: 0, shallowDepth: 4, deepDepth: 4 });
  const b = calculatePool({ shape: 'round', length: 24, width: 999, shallowDepth: 4, deepDepth: 4 });
  assert.equal(a.gallons, b.gallons);
});

test('average depth is the mean of the two ends', () => {
  const r = calculatePool({ shape: 'rectangle', length: 20, width: 10, shallowDepth: 3, deepDepth: 9 });
  assert.equal(r.avgDepth, 6);
});

test('geometry helpers agree with closed forms', () => {
  assert.equal(surfaceArea('rectangle', 20, 10), 200);
  near(surfaceArea('round', 20, 20), Math.PI * 100, 0.001, 'circle area');
  assert.equal(perimeter('rectangle', 20, 10), 60);
  near(perimeter('round', 20, 20), Math.PI * 20, 0.001, 'circumference');
});

test('unknown shapes fail loudly rather than silently returning zero', () => {
  assert.throws(() => surfaceArea('hexagon', 10, 10), /Unknown shape/);
});
