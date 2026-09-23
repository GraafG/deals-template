# Deals template

Shared Astro template for static deal trackers. Each deployment repo supplies provider configuration, scraper/import code, and data while reusing the same UI, history rendering, RSS, sitemap, OG image generation, and GitHub Pages workflow.

## Provider contract

Add a provider under `providers/<id>/`:

- `site.config.json` - branding, base URL, source URL, feature flags, data path.
- `data/index.json` and dated JSON snapshots in `data/YYYY/MM/DD.json`.
- `data/history.json` - normalized price history keyed by product/deal URL.
- Optional scraper/import scripts that normalize source data into the shared snapshot schema.

Important feature flags:

- `features.map`: set `false` for online-only stores without geo/location data.
- `features.referral`: set `true` and add `referral` config when outbound links need a referral parameter.
- `features.winacties`: set `true` for providers that track winactie-style offers.

## Build

Use Node.js 24 LTS (see `.nvmrc`), or Node.js 22.19.0+ on the 22 LTS line.
Astro itself requires 22.12.0, but the locked dependency graph requires 22.19.0.
CI uses npm 11.19.1, also recorded in `package.json`.

```pwsh
npm ci
npm run build:example
npm run test:build
npm audit
```

The offline build checks use Node's built-in test runner and the example provider
to cover routes, data, inline spacing/scripts, OG PNGs, and Astro's image service.

Astro 7 and the direct image-generation dependency both require patched
`sharp` (`>=0.35.4`, fixing
[GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)).
The Astro 4 scoped override is no longer needed. Regenerate dependency locks with
`npx --yes npm@11.19.1 install` to retain cross-platform native/libc metadata.
The lockfile also resolves Astro's transitive `devalue` dependency to a patched
version (`>=5.9.2`, fixing
[GHSA-9rgm-9g3h-6x36](https://github.com/advisories/GHSA-9rgm-9g3h-6x36)).
Check the full dependency graph with `npm audit` after dependency updates.

The Astro configuration explicitly retains HTML-aware whitespace compression
(`compressHTML: true`) rather than Astro 7's JSX-style default, preserving spaces
between inline elements. The site remains statically rendered with trailing
slashes on page routes and extension-based endpoints such as `feed.xml` and
`og/<slug>.png` without trailing slashes.

Deployment repos typically add a provider-specific script such as `build:tripper`, `build:vriendenloterij`, or `build:msstore`.
