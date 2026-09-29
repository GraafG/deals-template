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

Use Node.js 24 LTS (see `.nvmrc`). Node.js 22.19+ on the 22.x line is also
supported; the locked dependency graph requires more than Astro's 22.12.0 floor.
Downstream build/deployment workflows must use a supported Node.js version too.

```pwsh
npm ci
npm run build:example
```

Use npm 11.19.1 when regenerating `package-lock.json` to preserve platform and
optional-dependency metadata.

Astro >=7.2.8 fixes
[GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)
by requiring patched sharp.
The Astro-scoped npm override keeps its optional `sharp` dependency on the same
patched version as the direct dependency (`>=0.35.4`, fixing
[GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)).
The override is retained as a guard against a separate, older sharp installation.
`compressHTML: true` preserves the template's HTML-aware whitespace across the
Astro 7 upgrade instead of adopting its new JSX-style whitespace default.

Deployment repos typically add a provider-specific script such as `build:tripper`, `build:vriendenloterij`, or `build:msstore`.
