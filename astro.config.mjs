import { defineConfig } from 'astro/config';
import { loadProviderConfig } from './scripts/provider-config.mjs';

const provider = loadProviderConfig();

function siteOrigin(siteUrl) {
  try {
    return new URL(siteUrl).origin;
  } catch {
    return siteUrl;
  }
}

export default defineConfig({
  site: siteOrigin(provider.siteUrl),
  base: provider.base,
  output: 'static',
  // Keep HTML-aware spacing between inline elements after the Astro 7 upgrade.
  compressHTML: true,
  trailingSlash: 'always',
  build: {
    assets: '_assets',
  },
});
