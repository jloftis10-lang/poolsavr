/**
 * Site-wide call-to-action configuration.
 *
 * The address-measurement app does not exist yet, so every CTA points at the
 * email waitlist. The day the app ships, flip `APP_LIVE` to true: every CTA
 * across every page changes its destination and its label at once. That is the
 * one line that changes.
 */
export const APP_LIVE = false;

/** Where CTAs point once the app is live. */
export const APP_URL = '/measure';

/** Where CTAs point until then. */
export const WAITLIST_URL = '/waitlist';

export const ctaHref = APP_LIVE ? APP_URL : WAITLIST_URL;

/**
 * Each placement gets its own label — the reader's state of mind differs at
 * each one, and a generic label wastes the highest-intent moment on the page.
 */
export type CtaPlacement =
  | 'header'
  | 'calculatorResult'
  | 'costPage'
  | 'careGuide'
  | 'footer';

const LABELS: Record<CtaPlacement, { preLaunch: string; postLaunch: string }> = {
  header: { preLaunch: 'Get early access', postLaunch: 'Measure my pool' },
  calculatorResult: {
    preLaunch: 'Get early access',
    postLaunch: 'Measure it from my address',
  },
  costPage: {
    preLaunch: 'Get early access',
    postLaunch: "Find my pool's square footage",
  },
  careGuide: { preLaunch: 'Get early access', postLaunch: 'Get my exact gallons' },
  footer: { preLaunch: 'Join the list', postLaunch: 'Measure my pool' },
};

export function ctaLabel(placement: CtaPlacement = 'header'): string {
  const label = LABELS[placement];
  return APP_LIVE ? label.postLaunch : label.preLaunch;
}

/** Supporting line shown beneath the CTA at certain placements. */
const SUPPORTING: Partial<Record<CtaPlacement, string>> = {
  calculatorResult: "Not sure of your dimensions? We'll measure it from above.",
  costPage: 'Every quote starts with square footage. Get yours free.',
  careGuide: 'Dosing wrong starts with guessing your volume.',
};

export function ctaSupporting(placement: CtaPlacement): string | undefined {
  return SUPPORTING[placement];
}

/**
 * The hero subheadline promises address measurement, which is not live yet.
 * Until it is, the hero sells the thing that actually works today.
 */
export const heroSubheadline = APP_LIVE
  ? "Enter your address. We'll measure it from above — free, no signup, about five seconds."
  : 'Enter your pool’s dimensions and get gallons, surface area, and perimeter — free, no signup, about ten seconds.';
