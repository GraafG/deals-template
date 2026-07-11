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

Deployment repos typically add a provider-specific script such as `build:tripper`, `build:vriendenloterij`, or `build:msstore`.
