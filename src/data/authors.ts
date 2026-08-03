/**
 * Editorial bylines.
 *
 * Only claim credentials that are real. If William holds a CPO (Certified Pool
 * Operator) or similar certification, add it to `credentials` — it is worth
 * real ranking weight in this category. Until then the bio says what is true:
 * he founded PoolSavr and writes the guides.
 */

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  /** Verifiable certifications only. Rendered next to the name when present. */
  credentials?: string[];
  email?: string;
}

export const AUTHORS: Record<string, Author> = {
  'william-waddell': {
    slug: 'william-waddell',
    name: 'William Waddell',
    role: 'Founder, PoolSavr',
    bio: 'William Waddell founded PoolSavr and writes its calculators and guides. The site started from a straightforward frustration: every pool chemical is dosed per 10,000 gallons, every resurfacing quote starts from square footage, and almost nobody knows either number for their own pool. PoolSavr exists to hand people those numbers without a sales call.',
    email: 'hello@poolsavr.com',
  },
};

export const DEFAULT_AUTHOR = 'william-waddell';

export const getAuthor = (slug: string = DEFAULT_AUTHOR): Author => {
  const author = AUTHORS[slug];
  if (!author) throw new Error(`Unknown author: ${slug}`);
  return author;
};
