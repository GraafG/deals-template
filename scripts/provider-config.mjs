import { existsSync, readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';

export function listProviderIds() {
  const providersDir = resolve('providers');
  if (!existsSync(providersDir)) return [];
  return readdirSync(providersDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(resolve(providersDir, name, 'site.config.json')))
    .sort();
}

function describeAvailableProviders() {
  const ids = listProviderIds();
  if (ids.length === 0) {
    return 'No providers found: expected at least one providers/<id>/site.config.json';
  }
  return `Available providers: ${ids.join(', ')}`;
}

// Deliberately has no fallback provider. A silent default builds a different
// provider's site and still exits 0, which hides the misconfiguration instead
// of surfacing it.
export function resolveProviderId(explicitProviderId) {
  const providerId =
    explicitProviderId || process.env.PROVIDER_ID || process.env.PUBLIC_PROVIDER_ID;

  if (!providerId) {
    throw new Error(
      'No provider specified. Pass one as an argument ' +
        '(node scripts/build-provider.mjs <provider>) or set PROVIDER_ID.\n' +
        describeAvailableProviders()
    );
  }

  if (!listProviderIds().includes(providerId)) {
    throw new Error(`Unknown provider "${providerId}".\n${describeAvailableProviders()}`);
  }

  return providerId;
}

export function getProviderId() {
  return resolveProviderId();
}

export function loadProviderConfig(providerId = getProviderId()) {
  const configPath = resolve('providers', providerId, 'site.config.json');
  if (!existsSync(configPath)) {
    throw new Error(`Unknown provider "${providerId}". Expected ${configPath}`);
  }
  return JSON.parse(readFileSync(configPath, 'utf-8'));
}
