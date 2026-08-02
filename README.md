# PoolSavr marketing site

Marketing site for PoolSavr — pool measurement and instant quotes from satellite
imagery.

Built with [Astro](https://astro.build) (static output) and
[Tailwind CSS v4](https://tailwindcss.com). Deployed on Vercel.

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # type-check + static build to dist/
npm run preview  # serve the production build
```

## Structure

```
api/lead.js            Vercel serverless function that receives form submissions
src/pages/             One file per route (index, quote, pricing, about, contact, …)
src/components/        Header, Footer, Logo, SatelliteVisual, AddressForm, Faq
src/layouts/Layout.astro   Shared shell, SEO tags, and the form-submit handler
src/styles/global.css  Brand tokens (colors, fonts) and shared utility classes
```

## Lead capture

Both the quote flow and the contact form POST JSON to `/api/lead`. The handler
validates the payload, drops honeypot submissions, and then:

- forwards the lead to `LEAD_WEBHOOK_URL` if that environment variable is set
  (point it at Zapier, Make, a CRM endpoint, or your own service), or
- logs the lead to the Vercel function logs if it is not.

Set `LEAD_WEBHOOK_URL` in the Vercel project's environment variables to start
delivering leads somewhere durable. Until then, leads are only in the logs.

## Branding

The wordmark is set in Chakra Petch (`src/components/Logo.astro`) using the navy
`#0b1e3d` / blue `#1c74e9` pairing from the logo. Palette tokens live in the
`@theme` block at the top of `src/styles/global.css`.

## Notes

- The measurement figures shown in the quote flow are illustrative sample data.
  Wire the flow to the real measurement API when it is available.
- `privacy.astro` and `terms.astro` contain placeholder copy that needs legal
  review before launch.
