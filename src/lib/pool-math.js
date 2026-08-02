export const GALLONS_PER_CUBIC_FOOT = 7.48052;
export const LITERS_PER_GALLON = 3.785412;

/**
 * Freeform pools rarely fill their bounding box. 0.85 is the factor the
 * industry uses for kidney and lagoon shapes.
 */
const FREEFORM_FACTOR = 0.85;

/** Ramanujan's approximation — accurate to well under 1% for pool proportions. */
function ellipsePerimeter(semiA, semiB) {
  const h = (semiA + semiB) * 3;
  return Math.PI * (h - Math.sqrt((3 * semiA + semiB) * (semiA + 3 * semiB)));
}

export function surfaceArea(shape, length, width) {
  switch (shape) {
    case 'rectangle':
      return length * width;
    case 'round':
      return Math.PI * (length / 2) ** 2;
    case 'oval':
      return Math.PI * (length / 2) * (width / 2);
    case 'freeform':
      return length * width * FREEFORM_FACTOR;
    default:
      throw new Error(`Unknown shape: ${shape}`);
  }
}

export function perimeter(shape, length, width) {
  switch (shape) {
    case 'rectangle':
      return 2 * (length + width);
    case 'round':
      return Math.PI * length;
    case 'oval':
      return ellipsePerimeter(length / 2, width / 2);
    case 'freeform':
      return ellipsePerimeter(length / 2, width / 2) * 1.05;
    default:
      throw new Error(`Unknown shape: ${shape}`);
  }
}

export function averageDepth(shallowDepth, deepDepth) {
  return (shallowDepth + deepDepth) / 2;
}

/**
 * @returns {{area:number, perimeter:number, avgDepth:number, cubicFeet:number,
 *   gallons:number, liters:number}}
 */
export function calculatePool({ shape, length, width, shallowDepth, deepDepth }) {
  // A round pool is defined by a single diameter.
  const effectiveWidth = shape === 'round' ? length : width;

  const area = surfaceArea(shape, length, effectiveWidth);
  const avgDepth = averageDepth(shallowDepth, deepDepth);
  const cubicFeet = area * avgDepth;

  return {
    area,
    perimeter: perimeter(shape, length, effectiveWidth),
    avgDepth,
    cubicFeet,
    gallons: cubicFeet * GALLONS_PER_CUBIC_FOOT,
    liters: cubicFeet * GALLONS_PER_CUBIC_FOOT * LITERS_PER_GALLON,
  };
}
