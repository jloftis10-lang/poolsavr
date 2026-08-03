/**
 * Generates the social share image at public/og.png.
 *
 * Run with `npm run og` after changing brand colours or the wordmark.
 * Crawlers do not reliably render SVG, so this bakes a PNG.
 */
import sharp from 'sharp';

const NAVY = '#012151';
const BLUE = '#0988fc';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="#000d20"/>
    </linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="100%" stop-color="#0e7490"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="90" r="320" fill="${BLUE}" opacity="0.16"/>

  <!-- wordmark -->
  <text x="80" y="130" font-family="DejaVu Sans, Verdana, sans-serif" font-size="46" font-weight="bold" letter-spacing="2">
    <tspan fill="#ffffff">POOL</tspan><tspan fill="${BLUE}">SAVR</tspan>
  </text>

  <text x="80" y="300" font-family="DejaVu Sans, Verdana, sans-serif" font-size="72" font-weight="bold" fill="#ffffff">
    How many gallons
  </text>
  <text x="80" y="385" font-family="DejaVu Sans, Verdana, sans-serif" font-size="72" font-weight="bold" fill="${BLUE}">
    is your pool?
  </text>

  <text x="80" y="455" font-family="DejaVu Sans, Verdana, sans-serif" font-size="30" fill="#93b8e2">
    Free calculators. No signup.
  </text>

  <!-- measured pool motif -->
  <g transform="translate(830 380)">
    <rect x="0" y="0" width="300" height="150" rx="18" fill="url(#water)" opacity="0.95"/>
    <rect x="-8" y="-8" width="316" height="166" rx="22" fill="none" stroke="${BLUE}" stroke-width="3" stroke-dasharray="10 7"/>
    <rect x="-16" y="-16" width="16" height="16" rx="4" fill="#ffffff"/>
    <rect x="300" y="-16" width="16" height="16" rx="4" fill="#ffffff"/>
    <rect x="-16" y="150" width="16" height="16" rx="4" fill="#ffffff"/>
    <rect x="300" y="150" width="16" height="16" rx="4" fill="#ffffff"/>
  </g>

  <rect x="0" y="614" width="1200" height="16" fill="${BLUE}"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('wrote public/og.png');
