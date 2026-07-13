# Agent instructions for deals-template

This is the canonical shared template for provider-configured deal tracker repos. Changes here should be reusable by Tripper, VriendenLoterij, MS Store, and future providers.

## Context
- Template repo: `GraafG/deals-template`.
- Example provider: `providers/example`.
- Provider config lives in `providers/<provider>/site.config.json`.
- Provider snapshots and history live under `providers/<provider>/data/`.
- Shared Astro UI lives in `src/`.
- Shared build/deploy helpers live in `scripts/`.
- Deployment repos should differ mainly by provider config, data, scraper/import scripts, and GitHub Pages base path.

## Commands
- Install: `npm install`
- Build example provider: `npm run build:example`
- Generic build: `node scripts/build-provider.mjs <provider>`
- Preview after build: `npm run preview`

## Rules for agents
- Keep this repo provider-neutral. Do not hard-code Tripper, VriendenLoterij, or MS Store behavior into shared code.
- Model provider differences in `site.config.json` and provider-local scripts/data.
- Never delete or rewrite provider history in downstream repos when porting template changes.
- Propagate shared bug fixes from downstream repos back into this template.
- Use GitHub CLI (`gh`) for PRs, workflow runs, repo metadata, and branch checks when possible.
- Prefer small reusable changes in `src/` and `scripts/` over copying divergent code into deployment repos.

## Important implementation notes
- `src/pages/index.astro` renders inline event handlers, so any function used from `onclick` must be assigned to `window`.
- Providers may disable maps with `SITE_CONFIG.features.map === false`.
- Some provider history entries may lack a `prices` array; UI code must guard with `Array.isArray(...)`.
