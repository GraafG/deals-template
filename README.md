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

```pwsh
npm ci
npm run build:example
```

The Astro-scoped npm override keeps its optional `sharp` dependency on the same
patched version as the direct dependency (`>=0.35.4`, fixing
[GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)).
Remove the override when upgrading to an Astro version that natively requires
patched sharp; Astro 4 otherwise installs a separate, vulnerable `sharp@0.33.5`.

Deployment repos typically add a provider-specific script such as `build:tripper`, `build:vriendenloterij`, or `build:msstore`.
