/**
 * Metro data for the location pages.
 *
 * Deliberately small. The spec is explicit that near-identical location pages
 * are a doorway-page pattern and that the penalty applies to the whole domain,
 * so a metro only earns a page when there is genuinely local substance to write
 * about — different water chemistry, different rules, different season, a
 * different reason the work costs what it costs.
 *
 * Expand only after the first set is indexed and holding rankings, and only
 * with equally researched entries.
 */

export interface Metro {
  slug: string;
  city: string;
  state: string;
  stateCode: string;
  stateSlug: string;
  /** Share of homes with a pool, from the pool-density ranking. */
  poolDensity: string;
  densityRank: number;
  /** Local cost multiplier against the national ranges. */
  costMultiplier: string;
  resurfacingLow: number;
  resurfacingHigh: number;
  /** Months a typical pool is comfortable without heating. */
  unheatedSeason: string;
  waterHardness: string;
  hardnessNote: string;
  typicalPoolAge: string;
  /** What the climate does to a pool, in plain terms. */
  climateNote: string;
  /** Finishes that suit local conditions, and why. */
  finishNote: string;
  /** Genuinely local rules. Verify before relying on it — these change. */
  rulesNote: string;
  /** The one thing that surprises people locally. */
  localQuirk: { title: string; body: string };
  nearby: string[];
}

export const METROS: Metro[] = [
  {
    slug: 'san-diego',
    city: 'San Diego',
    state: 'California',
    stateCode: 'CA',
    stateSlug: 'california',
    poolDensity: '17.0%',
    densityRank: 8,
    costMultiplier: '1.15× – 1.4× national',
    resurfacingLow: 7000,
    resurfacingHigh: 20000,
    unheatedSeason: 'about 4 months (July–October)',
    waterHardness: '216–284 ppm (roughly 13–17 grains)',
    hardnessNote:
      'San Diego imports most of its water from the Colorado River and the State Water Project, and it arrives loaded with calcium picked up along the way. The city’s own quality reporting puts hardness in the very hard band.',
    typicalPoolAge: 'Many built 1960–1990, so a large share are on their second or third finish',
    climateNote:
      'The mild climate is deceptive. Coastal air keeps summer nights cool, so unheated water sits below comfortable for most of the year — far more San Diego pools need a heater than the weather forecast suggests.',
    finishNote:
      'Hard water makes scale the main enemy here. Pebble and quartz hide the calcium marks that show plainly on white plaster, and both handle the frequent acid additions that hard water demands.',
    rulesNote:
      'Pool draining generally goes to the sanitary sewer rather than the street, and coastal jurisdictions take stormwater discharge seriously. Confirm requirements with your city before any contractor drains the pool.',
    localQuirk: {
      title: 'Your swim season is shorter than your climate',
      body: 'San Diego has some of the best weather in the country and one of the shorter unheated swim seasons in this list. Marine layer and cool nights pull water temperature down overnight even in June. Budget for a heater and a cover — the cover matters more here than the heater does, because it holds the heat you already paid for.',
    },
    nearby: ['riverside', 'phoenix'],
  },
  {
    slug: 'phoenix',
    city: 'Phoenix',
    state: 'Arizona',
    stateCode: 'AZ',
    stateSlug: 'arizona',
    poolDensity: '32.7%',
    densityRank: 1,
    costMultiplier: '0.9× – 1.0× national',
    resurfacingLow: 5500,
    resurfacingHigh: 14000,
    unheatedSeason: 'about 7–8 months (April–October)',
    waterHardness: '172–302 ppm (roughly 10–18 grains)',
    hardnessNote:
      'Phoenix water is hard and varies noticeably by which treatment plant serves your address, so two neighbourhoods can have meaningfully different scaling behaviour.',
    typicalPoolAge: 'A wide spread, with heavy building from the 1990s onward',
    climateNote:
      'Extreme summer heat drives evaporation and burns through chlorine faster than almost anywhere else. Water above 90°F consumes chlorine quickly and grows algae fast, which is why Phoenix pools need more attention in July than a northern pool needs all year.',
    finishNote:
      'Relentless UV and heat favour durable finishes. Pebble is popular here for good reason — it holds up where plaster fades and etches, and the longer replacement cycle matters when summer work is unpleasant to schedule.',
    rulesNote:
      'Draining generally goes to the sanitary sewer clean-out. Municipalities across the valley differ on backwash and discharge rules, so confirm with your city rather than assuming the neighbouring one applies.',
    localQuirk: {
      title: 'The highest pool density in the country cuts both ways',
      body: 'Nearly a third of Phoenix homes have a pool, which means more crews competing for work and keener pricing than almost anywhere. It also means the good contractors are booked solid from March onward. Schedule resurfacing for late autumn or winter and you get both the discount and the crew you actually wanted.',
    },
    nearby: ['las-vegas', 'san-diego'],
  },
  {
    slug: 'las-vegas',
    city: 'Las Vegas',
    state: 'Nevada',
    stateCode: 'NV',
    stateSlug: 'nevada',
    poolDensity: '23.8%',
    densityRank: 5,
    costMultiplier: '0.95× – 1.1× national',
    resurfacingLow: 6000,
    resurfacingHigh: 15000,
    unheatedSeason: 'about 6 months (May–October)',
    waterHardness: 'around 280 ppm (roughly 16 grains)',
    hardnessNote:
      'Colorado River water arrives very hard. Scale at the waterline and inside heaters is a routine maintenance item here rather than an occasional problem.',
    typicalPoolAge: 'Heavy building through the 1990s and 2000s boom, so many pools are now due their second finish',
    climateNote:
      'Evaporation is the defining local fact. An uncovered Las Vegas pool can lose seven to eight feet of water over a year, taking its chemicals and heat along with it.',
    finishNote:
      'Hard water plus intense sun makes stain-hiding finishes worth the premium. Pebble and quartz cope better than white plaster, which shows scale within a season or two.',
    rulesNote:
      'Southern Nevada has the strictest rules in this list. Pool water must be drained to the sanitary sewer where one is available — draining to the street or a storm drain violates local ordinance. Pools over 25,000 gallons, or drains for construction, need coordinating with the Southern Nevada Water Authority in advance.',
    localQuirk: {
      title: 'New pools are capped at 600 square feet',
      body: 'Building code limits new residential pools and spas to 600 square feet of surface area per property, a conservation measure expected to save tens of millions of gallons over a decade. If you are planning a new pool or reshaping an existing one, that number is a hard constraint — and it is worth knowing your current surface area before you start drawing anything.',
    },
    nearby: ['phoenix', 'san-diego'],
  },
  {
    slug: 'tampa',
    city: 'Tampa',
    state: 'Florida',
    stateCode: 'FL',
    stateSlug: 'florida',
    poolDensity: '27.7%',
    densityRank: 3,
    costMultiplier: '0.9× – 1.05× national',
    resurfacingLow: 5500,
    resurfacingHigh: 14000,
    unheatedSeason: 'about 7 months (April–October)',
    waterHardness: 'up to roughly 17 grains, varying by supply',
    hardnessNote:
      'Central Florida groundwater runs through limestone, so hardness is high and calcium scale is a constant background task.',
    typicalPoolAge: 'A very wide spread, with a large stock of 1970s and 1980s pools',
    climateNote:
      'Heat and humidity give a long season, but the rain is what defines pool care here. A heavy afternoon storm dilutes chlorine, drops pH and washes organics in — which is why Tampa pools go green after weather rather than after neglect.',
    finishNote:
      'Long season and frequent rebalancing favour finishes that tolerate chemical swings. Quartz and pebble both cope better than plaster with the acid-and-shock cycle that summer storms demand.',
    rulesNote:
      'Drain to the sanitary sewer, not to the street or a storm drain — Florida stormwater rules are enforced, and discharge eventually reaches the bay. Hurricane season also affects scheduling: crews compress work into the drier months.',
    localQuirk: {
      title: 'Draining your pool is genuinely risky here',
      body: 'Tampa’s water table sits high, and a drained pool in saturated ground can float — the shell lifts out of the ground, which is a catastrophic and largely uninsurable failure. This is not a theoretical risk locally. Any contractor draining a Tampa pool should have a plan for it, and it is a fair question to ask before signing. It is also a strong argument against draining to fix chemistry problems that have other solutions.',
    },
    nearby: ['orlando', 'miami'],
  },
  {
    slug: 'austin',
    city: 'Austin',
    state: 'Texas',
    stateCode: 'TX',
    stateSlug: 'texas',
    poolDensity: '7.7%',
    densityRank: 16,
    costMultiplier: '0.95× – 1.1× national',
    resurfacingLow: 6000,
    resurfacingHigh: 15000,
    unheatedSeason: 'about 5–6 months (May–October)',
    waterHardness: '15–20 grains — among the hardest in the country',
    hardnessNote:
      'Austin draws from limestone aquifers, which puts local hardness at the extreme end nationally. Calcium management is not an occasional chore here; it is the main ongoing chemistry task.',
    typicalPoolAge: 'Newer on average than the western metros, reflecting recent growth',
    climateNote:
      'Long hot summers with a genuine winter attached. That combination is unusual in this list and it is what makes Austin pool care distinctive — you get western-style summer chemistry and northern-style freeze risk in the same year.',
    finishNote:
      'Very hard water makes scale-hiding finishes worth serious consideration. Pebble and quartz mask the calcium marks that appear quickly on white plaster in this water.',
    rulesNote:
      'Drain to the sanitary sewer. Hill Country jurisdictions vary, and permitting for structural work differs between the city and surrounding counties, so confirm which authority covers your address before assuming.',
    localQuirk: {
      title: 'Freeze protection is not optional',
      body: 'Austin gets hard freezes rarely enough that people are unprepared, and severely enough that pipes burst when they arrive. The February 2021 event damaged large numbers of pool systems across Texas. If you run your pool year-round, know how to protect the equipment before the forecast turns — losing power during a hard freeze with water sitting in the plumbing is how equipment pads are destroyed.',
    },
    nearby: ['dallas', 'houston'],
  },
];

export const getMetro = (slug: string) => METROS.find((metro) => metro.slug === slug);

/**
 * Industry reference figures for the average-pool-size page.
 *
 * These are the commonly published rules of thumb, not measured data — stated
 * as such on the page. The intent is to replace them with real measurements
 * once the app has run, which is what turns this into original research nobody
 * else can publish.
 */
export const AVERAGE_POOL = {
  commonSize: '16 × 32 ft',
  typicalRange: '10,000–30,000 gallons',
  averageDepth: '5.5 ft',
  averageSurfaceArea: '~500–600 sq ft',
  averageInterior: '~950 sq ft',
  sizes: [
    { size: '12 × 24 ft', surface: 288, interior: 450, gallons: '~9,700' },
    { size: '14 × 28 ft', surface: 392, interior: 600, gallons: '~13,200' },
    { size: '16 × 32 ft', surface: 512, interior: 950, gallons: '~17,200' },
    { size: '18 × 36 ft', surface: 648, interior: 1200, gallons: '~26,700' },
    { size: '20 × 40 ft', surface: 800, interior: 1450, gallons: '~32,900' },
  ],
};
