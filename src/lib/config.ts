import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface ProviderConfig {
  id: string;
  name: string;
  shortName: string;
  siteUrl: string;
  base: string;
  sourceUrl: string;
  /** Display name of the upstream provider the deals come from, e.g. "Example.com". */
  sourceName?: string;
  /** Privacy policy of the upstream provider, linked from the privacy page. */
  sourcePrivacyUrl?: string;
  /** Public source repository of this site, linked from the footer. */
  repoUrl?: string;
  /** Contact address published on the privacy page. */
  contactEmail?: string;
  dataDir: string;
  dealCachePath?: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    mark: string;
  };
  copy: {
    homeTitle: string;
    tagline: string;
    description: string;
    hero: string;
    rssTitle: string;
    rssDescription: string;
    ogTagline: string;
    ogBullets: string[];
    ogBadge: string;
  };
  features: {
    prices: boolean;
    referral: boolean;
    winacties: boolean;
    map?: boolean;
  };
  referral?: {
    param: string;
    value: string;
    banner: string;
  };
}

export const PROVIDER_ID = process.env.PROVIDER_ID || process.env.PUBLIC_PROVIDER_ID || 'example';

function loadProviderConfig(): ProviderConfig {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), 'providers', PROVIDER_ID, 'site.config.json'), 'utf-8')
  ) as ProviderConfig;
}

export const SITE_CONFIG = loadProviderConfig();

/** Single source of truth for the deployed site base URL. */
export const SITE_URL = SITE_CONFIG.siteUrl;

/** Site URL without protocol or trailing slash, for display (e.g. in OG images). */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, '').replace(/\/+$/, '');

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

/** Referral code appended to outbound links when referral support is enabled. */
export const REFERRAL_VALUE = SITE_CONFIG.referral?.value ?? '';
export const REFERRAL_PARAM = SITE_CONFIG.referral?.param ?? 'ref';
export const REFERRAL_ENABLED = Boolean(SITE_CONFIG.features.referral && SITE_CONFIG.referral);

export const SOURCE_SITE_URL = SITE_CONFIG.sourceUrl;
export const SOURCE_HOST = hostOf(SITE_CONFIG.sourceUrl);
export const SOURCE_NAME = SITE_CONFIG.sourceName ?? SOURCE_HOST;
export const SOURCE_PRIVACY_URL =
  SITE_CONFIG.sourcePrivacyUrl ?? `${SITE_CONFIG.sourceUrl.replace(/\/+$/, '')}/privacy/`;
export const REPO_URL = SITE_CONFIG.repoUrl ?? '';
export const CONTACT_EMAIL = SITE_CONFIG.contactEmail ?? '';
export const DATA_DIR = SITE_CONFIG.dataDir;
export const DEAL_CACHE_PATH = SITE_CONFIG.dealCachePath;
