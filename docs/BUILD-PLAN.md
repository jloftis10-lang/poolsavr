# PoolSavr build plan — Phase 2 onward

Companion to `POOLSAVR-WEBSITE-BUILD-SPEC`. That document says what to build and
why. This one says in what order, against the code that now exists, and names
the things that will block us.

Phase numbering follows the spec so the two documents line up.

---

## Where things stand

Shipped and verified (commit `71acac6`):

| Thing | State |
| --- | --- |
| Astro 7 static + Tailwind 4 | working |
| `src/config.ts` — `APP_LIVE` + per-placement CTA labels | working, 3 of 5 placements in use |
| `src/lib/pool-math.js` — pure, testable | working, verified against volume charts |
| `/` and `/calculators/pool-volume/` | built to spec templates |
| `/about`, `/contact`, `/waitlist`, `/thank-you`, `/privacy`, `/terms` | supporting pages |
| `api/lead.js` | validates + honeypot; needs `LEAD_WEBHOOK_URL` |
| Organization / BreadcrumbList / FAQPage / WebApplication schema | on applicable pages |

Not started: every hub page, 8 calculators, 7 cost pages, 11 care and remodeling
guides, `/pool-data/`, metro pages.

### The thing to fix before writing any new page

`src/pages/calculators/pool-volume.astro` is **553 lines**, and its calculator
logic is a bespoke inline `<script>` bound to hard-coded element IDs. It works,
but it is a one-off.

Building the next eight calculators the same way means eight copies of the same
wiring, and eight places to fix every bug. The same applies to prose: there is no
article layout, so 18 editorial pages would each hand-roll their own structure.

**Phase 2A exists to build that shared machinery.** It produces almost no new
indexable pages, which makes it feel like a detour. It is not — everything after
it moves several times faster, and the alternative is a rewrite around page
thirty.

---

## Phase 2A — Shared machinery

No new content. Refactor `/calculators/pool-volume/` onto the new machinery and
confirm it still renders and calculates identically.

### 1. The `<Calculator>` island

One component, config-driven, `client:visible` (never `client:load` — spec).

```
src/components/calculator/Calculator.astro    shell, results panel, formula row, CTA slot
src/components/calculator/fields.ts           field type definitions
src/lib/calculators/<name>.ts                 pure compute fn + field config per calculator
```

Each calculator supplies: field definitions, a pure `compute(values)` returning
result rows, and a `formula(values, result)` returning the displayed arithmetic.
Nothing else. The shell owns layout, validation, formatting, error states, URL
state, and the results panel.

Requirements carried over from the pool-volume build, which must not regress:

- Tool above the fold; on mobile the form fits in the first viewport.
- Live recalculation on `input` and `change`.
- The applied formula is always shown — this is what earns forum links.
- Validation clears results and explains itself in plain language.
- Works with no JS for crawlers: server-render the default-state result.

### 2. Query-param chaining

`src/lib/calculators/url.ts` — read and write `?gallons=`. The volume calculator
writes it into outbound links; the chemistry calculators prefill from it. This is
what turns nine pages into one funnel.

### 3. Content Collections

Editorial pages become MD/MDX, not `.astro`. `src/content.config.ts` with schemas
for `costs`, `guides`, and `metros`, enforcing the spec's frontmatter: `title`,
`description`, `targetKeyword`, `publishDate`, `updatedDate`, `author`, plus
per-collection fields (e.g. `priceLow`/`priceHigh` on costs).

Typed frontmatter is what stops page forty from silently shipping without a meta
description.

### 4. Layout templates

- `ArticleLayout.astro` — care/remodeling template order from the spec
- `CostLayout.astro` — number first, then table, then CTA
- `HubLayout.astro` — links down to every child

### 5. Schema helpers

`src/lib/schema.ts` exporting `breadcrumb()`, `faqPage()`, `article()`,
`howTo()`, `webApplication()`. Currently hand-written per page; that will not
survive 40 pages. **No `LocalBusiness` on metro pages** — spec is explicit, and it
is a misrepresentation with real penalty risk.

### 6. CTA placements not yet built

`costPage` and `careGuide` labels exist in `src/config.ts` but nothing uses them.
Add:

- `<CtaInline>` — one mid-article block, after the first major section. One only.
- `<CtaBlock>` — full-width, end of article.

### 7. Trust signals

- `src/data/authors.ts` + `<AuthorByline>` + `/authors/[slug]/`
- Visible "last updated" from frontmatter
- **Blocked:** needs a real named person with real pool credentials. I will not
  invent one — fabricated expertise on dosing and cost advice is exactly what the
  helpful-content system targets. See *Blockers*.

### 8. Housekeeping

- Delete `src/components/AddressForm.astro` — orphaned by the removed quote flow,
  currently imported by nothing.
- Self-host fonts: two weights, subset, `font-display: swap`.
- Per-page OG images (generate at build from title + brand).
- Analytics (Plausible or Fathom) with event tracking per CTA placement, so we
  learn which slot converts.

---

## Phase 2B — The calculator suite

Eight calculators on the Phase 2A component, plus `/calculators/` as hub.

| Page | Depends on | Notes |
| --- | --- | --- |
| `surface-area/` | pool-math | Already computed; mostly a new article + framing |
| `chlorine-dosage/` | new `chemistry.ts` | Dose by product: liquid, cal-hypo, dichlor, trichlor |
| `pool-shock/` | chemistry.ts | By severity; cross-link green-pool both ways |
| `salt-level/` | chemistry.ts | Current vs target ppm |
| `muriatic-acid/` | chemistry.ts | pH and alkalinity down |
| `baking-soda-alkalinity/` | chemistry.ts | Alkalinity up |
| `heater-size/` | new `equipment.ts` | BTU by volume, surface area, temp rise |
| `pump-size/` | equipment.ts | Turnover rate and flow |

Every one prefills gallons from `?gallons=`, links back to volume, and carries
FAQPage + WebApplication + BreadcrumbList schema. 800–1,200 words each.

**Chemistry needs sourcing, not recall.** Dosing advice is health-adjacent: a
wrong cal-hypo figure can hurt someone or wreck a pool surface. Every constant
gets a cited source, a stated assumption (e.g. "assumes 0 ppm stabiliser"), and a
safety note on never mixing products. I would rather ship six well-sourced
calculators than eight confident-sounding ones.

---

## Phase 3 — Cost pillar

Seven pages, 1,500–2,500 words each: `pool-resurfacing/`, `pool-remodel/`,
`replaster/`, `pebble-finishes/`, `tile-replacement/`, `coping-and-decking/`,
`monthly-maintenance/`, plus the `/cost/` hub.

Template order is fixed by the spec: H1 → the number immediately → cost table by
size → square-footage-framed CTA → what drives price → by finish → regional
variation → worked example → how to reduce cost → FAQ → related.

Costs live in `src/data/costs.ts`, not inline in prose, so the annual refresh is
one file.

**This phase is gated on real pricing.** These pages compete against contractors
quoting real jobs; invented ranges lose and mislead. See *Blockers*.

---

## Phase 4 — Care and remodeling

Eleven pages on `ArticleLayout` with HowTo schema.

Care (1,200–2,000 words): `green-pool/` first — huge, seasonal, urgent, and every
step needs gallons, which makes it the tightest possible link into the volume
calculator. Then `cloudy-water/`, `losing-water/` (bucket test; leads toward
structural repair, which is remodeling intent in disguise), `algae-types/`,
`water-chemistry-basics/`, `opening-and-closing/` (seasonal — publish well ahead
of spring).

Remodeling: `when-to-resurface/` (symptom-led, the link target from every care
page), `finish-types/`, `plaster-vs-pebble/` (comparison table where each option
genuinely wins somewhere), `process-and-timeline/`,
`questions-to-ask-a-contractor/` — structured so a contractor directory can slot
in later without a rewrite.

Every care page routes to a calculator. Every calculator routes to the app CTA.

---

## Phase 5 — Pool data and metros

`/pool-data/average-pool-size/` publishes now with cited industry figures, and the
`[metro]` route is built now too, backed by `src/data/metros.ts`. When the app has
measured real pools, swapping the data source touches nothing structural. That is
the moat: original research nobody else can publish.

Then metro pages — **20–30 only**, from the spec's pool-density table (Phoenix,
Miami, Tampa, Orlando, Las Vegas, LA, Riverside, San Diego, Sacramento, DFW…).

Each needs 600–900 words of genuinely local substance: regional cost range that
actually differs from national, swim season length, climate-appropriate finishes,
water hardness, typical pool age, permit notes. Below that bar they read as
doorway pages, and **the penalty applies to the whole domain** — it can sink the
calculator pages too.

Expand only after the first set is indexed and holding rankings.

---

## Phase 6 — Ongoing

Two to four pages weekly, chosen from Search Console query data rather than
brainstorming. Mine People Also Ask for the target queries; each answer becomes an
FAQ entry or its own page. Refresh cost pages on a schedule — that content decays
fastest.

---

## Blockers — things I cannot invent

These need your input. Each one is a place where making something up would be
worse than shipping later.

1. **A named author with real pool credentials.** Required on every editorial
   page. Anonymous advice underperforms badly in this category, and inventing a
   persona is a fabrication risk. Who is this — you, or someone you can credit?
2. **Real 2026 cost data.** Regional ranges by finish and pool size. Either
   supply figures you trust, or name sources I should cite. Gates Phase 3.
3. **Local metro substance.** Water hardness, permit rules, season length per
   metro. Gates the metro half of Phase 5.
4. **Chemistry sources.** Which references you want dosing figures cited to.
5. **ESP + confirmation email.** `LEAD_WEBHOOK_URL` is the hook; a provider with
   double opt-in is still unwired.
6. **Analytics + Search Console access.** Spec wants verification before first
   indexing.

Phases 2A and 2B can proceed today. 3 and 5 cannot finish without 2 and 3 above.

---

## Definition of done, per page

No page ships without all of these:

- One `<h1>` containing the target keyword naturally
- Unique title ≤ 60 chars and meta description ≤ 155, both hand-written, each
  containing a concrete number or specific promise
- Canonical URL, OG and Twitter tags, per-page image
- Applicable JSON-LD, validated
- Reachable within three clicks of home; links up, down, and sideways with
  descriptive anchors — never "click here", never "read more"
- Meets the word floor for its type, because it is thorough, not padded
- Lighthouse mobile 95+; no client JS on non-calculator pages
- Verified in a real browser at 390px and 1440px, zero console errors

The standing rule from the spec governs all of it: **fewer, better pages beat
more, weaker ones.** A hundred padded pages drag down the ten good ones, because
the helpful-content system judges the domain as a whole.

---

## Suggested order of work

1. Phase 2A machinery, with pool-volume refactored onto it as the proof
2. `green-pool/` out of order, early — it is the highest-volume page on the plan
   and validates `ArticleLayout` + HowTo schema against something that matters
3. Phase 2B calculators, volume-chained
4. Phase 3 cost pillar once pricing data lands
5. Phase 4 remainder
6. Phase 5 data page, then metros
