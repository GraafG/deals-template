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
  trailingSlash: 'always',
  // Preserve HTML-aware whitespace instead of Astro 7's JSX-style default.
  compressHTML: true,
  build: {
    assets: '_assets',
  },
});
