# PoolSavr marketing site

Marketing site for PoolSavr. Built to rank for pool-measurement searches ahead
of the measurement app, which is a separate build.

Astro (static output) + Tailwind CSS v4, deployed on Vercel.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + static build to dist/
npm run preview  # serve the production build
```

## Phase 1 scope (shipped)

Home and `/calculators/pool-volume/` are the two pages that matter right now —
they exist to get indexed early, because ranking has a 6–12 month fuse. Everything
else (`/about`, `/contact`, `/waitlist`, `/privacy`, `/terms`) is supporting.

Later phases — the rest of the calculator suite, cost pillar, care and remodeling
guides, `/pool-data/`, and metro pages — are documented in the build spec, not
here. Do not mass-generate location pages.

## The one line that flips the site to the app

`src/config.ts` holds `APP_LIVE`. It is `false`, so every CTA points at the email
waitlist. When the measurement app ships, set it to `true`: every CTA across
every page switches destination and label at once, and the hero subheadline
switches to the address-first promise.

Per-placement CTA labels (header, calculator result, cost page, care guide,
footer) live in the same file. Use `<Cta placement="..." />` — never hard-code a
CTA link.

## Lead capture

Forms POST JSON to `/api/lead` (a Vercel serverless function in `api/lead.js`).
It validates, drops honeypot submissions, and then:

- forwards the lead to `LEAD_WEBHOOK_URL` if that env var is set, or
- logs it to the Vercel function logs if not.

**Set `LEAD_WEBHOOK_URL` in Vercel before launch**, or leads exist only in logs.
A real ESP with double opt-in and a confirmation email is still outstanding — see
below.

## Structure

```
api/lead.js                          Vercel function receiving form submissions
src/config.ts                        APP_LIVE switch + CTA labels per placement
src/content.config.ts                Typed frontmatter for costs/guides/metros
src/data/authors.ts                  Editorial bylines
src/lib/pool-math.js                 Pure volume/area/perimeter math
src/lib/schema.ts                    JSON-LD builders
src/lib/calculators/                 Per-calculator field config + pure compute
src/components/calculator/Calculator.astro   Shared calculator island
src/components/Cta|CtaInline|CtaBlock.astro  CTA placements
src/components/Sources|Disclaimer.astro      Citations + estimate disclaimers
src/layouts/Layout.astro             Shell, SEO tags, Organization schema
src/styles/global.css                Brand tokens + shared utility classes
src/assets/poolsavr-logo.png         Source logo (colors sampled from this)
```

## Adding a calculator

1. Write `src/lib/calculators/<name>.ts` exporting a `CalculatorDef`: field
   definitions plus one pure `compute(values)`.
2. Register it in `src/lib/calculators/index.ts`.
3. Drop `<Calculator id="<name>" />` into a page.

The shell handles layout, validation, formatting, dynamic labels, conditional
fields, and `?gallons=` prefill. Keep the math in a pure module so it can be
tested with plain Node — that is how the volume figures were verified.

## Branding

Colors are sampled from the logo file: navy `#012151`, blue `#0988fc`. The
wordmark is set in Chakra Petch (`src/components/Logo.astro`) rather than using
the raster logo, so it stays sharp and works on dark backgrounds.

## Known gaps before launch

These need accounts or credentials and could not be done from the repo alone:

- **Analytics + Search Console.** Plausible/Fathom script, Google Search Console
  and Bing Webmaster verification. The spec wants these verified *before* first
  indexing.
- **ESP + confirmation email.** `LEAD_WEBHOOK_URL` is the hook; a real provider
  with double opt-in still needs wiring.
- **Self-hosted fonts.** Currently Google Fonts. The performance budget calls for
  self-hosting, subset, two weights, `font-display: swap`.
- **Per-page OG images.** OG/Twitter tags are present but there is no per-page
  image yet.
- **Author credentials.** Pages are bylined to William Waddell, founder. If he
  holds a CPO or similar certification, add it to `credentials` in
  `src/data/authors.ts` — it carries real weight in this category.
- **Legal review.** `privacy.astro` and `terms.astro` are placeholder copy.
