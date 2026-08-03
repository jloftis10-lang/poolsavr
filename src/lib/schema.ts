/**
 * JSON-LD builders. Hand-writing schema per page does not survive 40 pages.
 *
 * Deliberately absent: LocalBusiness. The spec forbids it on metro pages —
 * there is no physical location in those cities, and the markup would be a
 * misrepresentation with real penalty risk.
 */

export const SITE = 'https://www.poolsavr.com';

const abs = (path: string) =>
  path.startsWith('http') ? path : `${SITE}${path.startsWith('/') ? path : `/${path}`}`;

export const organization = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PoolSavr',
  url: `${SITE}/`,
  logo: `${SITE}/favicon.svg`,
  description:
    'Free pool volume, surface area, and perimeter calculators, plus satellite pool measurement in development.',
});

export const breadcrumb = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: abs(crumb.path),
  })),
});

export const faqPage = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
});

export const webApplication = (options: {
  name: string;
  path: string;
  description?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: options.name,
  description: options.description,
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  url: abs(options.path),
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
});

export const article = (options: {
  headline: string;
  description: string;
  path: string;
  authorName: string;
  authorPath: string;
  publishDate: Date;
  updatedDate?: Date;
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: options.headline,
  description: options.description,
  url: abs(options.path),
  mainEntityOfPage: abs(options.path),
  author: {
    '@type': 'Person',
    name: options.authorName,
    url: abs(options.authorPath),
  },
  publisher: {
    '@type': 'Organization',
    name: 'PoolSavr',
    logo: { '@type': 'ImageObject', url: `${SITE}/favicon.svg` },
  },
  datePublished: options.publishDate.toISOString().slice(0, 10),
  dateModified: (options.updatedDate ?? options.publishDate)
    .toISOString()
    .slice(0, 10),
  ...(options.image ? { image: abs(options.image) } : {}),
});

export const howTo = (options: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
  totalTime?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: options.name,
  description: options.description,
  ...(options.totalTime ? { totalTime: options.totalTime } : {}),
  step: options.steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: step.name,
    text: step.text,
  })),
});
