import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Script } from 'node:vm';
import { test } from 'node:test';
import sharp from 'sharp';
import sharpService from 'astro/assets/services/sharp';

const read = (path) => readFileSync(path, 'utf8');
const json = (path) => JSON.parse(read(path));
const provider = json('providers/example/site.config.json');
const history = json(join(provider.dataDir, 'history.json'));
const dates = json(join(provider.dataDir, 'index.json'));
const snapshotPath = `${dates[0].replaceAll('-', '/')}.json`;
const deals = json(join(provider.dataDir, snapshotPath));
const slug = (url) => new URL(url).pathname.replace(/\/$/, '').split('/').at(-1);
const home = read('dist/index.html');
const privacy = read('dist/privacy/index.html');
const base = `${provider.base.replace(/\/$/, '')}/`;

test('example build retains static page and endpoint routes', () => {
  for (const url of Object.keys(history)) {
    const detail = read(`dist/deal/${slug(url)}/index.html`);
    assert.ok(detail.includes(`${provider.siteUrl}/deal/${slug(url)}/`));
  }
  assert.ok(home.includes(`content="${base}"`));
  assert.ok(home.includes(`href="${base}privacy/"`));
  for (const route of ['feed.xml', 'sitemap.xml', 'robots.txt', 'opensearch.xml']) {
    assert.ok(read(`dist/${route}`).includes(provider.siteUrl), route);
  }
  for (const deal of deals) {
    assert.ok(home.includes(`href="${base}deal/${slug(deal.url)}/"`));
    assert.ok(read('dist/feed.xml').includes(`${provider.siteUrl}/deal/${slug(deal.url)}/`));
    assert.ok(read('dist/sitemap.xml').includes(`${provider.siteUrl}/deal/${slug(deal.url)}/`));
  }
  const stylesheets = [...home.matchAll(/href="([^"]+\.css)"/g)]
    .map((match) => match[1]).filter((href) => href.startsWith(base));
  assert.ok(stylesheets.length > 0);
  for (const href of stylesheets) {
    assert.ok(read(join('dist', href.slice(base.length))).length > 0);
  }
});

test('snapshot and history contents survive the build unchanged', () => {
  assert.deepEqual(json('dist/data/index.json'), dates);
  assert.deepEqual(json('dist/data/history.json'), history);
  assert.deepEqual(json(join('dist/data', snapshotPath)), deals);
});

test('HTML-aware inline spacing and client initialization are preserved', () => {
  assert.match(privacy, /<strong>Niets\.<\/strong> /);
  assert.match(privacy, /vanaf\s+<code>fonts\.googleapis\.com<\/code> en <code>/);
  assert.match(home, /class="price-original">[^<]+<\/span> <span class="price-deal">/);
  const scripts = [...home.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length > 0);
  for (const [, attributes, source] of scripts) {
    if (attributes.includes('application/ld+json')) {
      assert.ok(Array.isArray(JSON.parse(source)));
    } else {
      assert.doesNotThrow(() => new Script(source));
    }
  }
  assert.match(home, /window\.showView = showView/);
  assert.match(home, /window\.toggleSparkline = toggleSparkline/);
  assert.match(home, /init\(\);/);
  if (provider.features.map === false) {
    assert.doesNotMatch(home, /id="(?:btn-map|btn-split|map-container)"/);
    assert.doesNotMatch(privacy, /<strong>OpenStreetMap<\/strong>/);
  }
});

test('default and per-deal OG images remain decodable 1200 by 630 PNGs', async () => {
  const files = ['dist/og-default.png', ...readdirSync('dist/og').map((file) => join('dist/og', file))];
  assert.equal(files.length, deals.length + 1);
  for (const file of files) {
    const image = sharp(file);
    const metadata = await image.metadata();
    assert.equal(metadata.format, 'png', file);
    assert.equal(metadata.width, 1200, file);
    assert.equal(metadata.height, 630, file);
    assert.ok((await image.raw().toBuffer()).length > 0, file);
  }
});

test('Astro image service transforms local raster images using patched sharp', async () => {
  const input = readFileSync('dist/og-default.png');
  const warnings = [];
  const logger = { warn: (message) => warnings.push(message) };
  for (const format of ['png', 'jpeg', 'webp', 'avif']) {
    const result = await sharpService.transform(
      input,
      { src: '/og-default.png', width: 80, height: 42, format },
      { service: { config: {} } },
      logger,
    );
    assert.equal(result.format, format === 'avif' ? 'heif' : format);
    const metadata = await sharp(result.data).metadata();
    if (format === 'avif') assert.equal(metadata.compression, 'av1');
    assert.equal(metadata.width, 80, format);
    assert.equal(metadata.height, 42, format);
    assert.ok((await sharp(result.data).raw().toBuffer()).length > 0, format);
  }
  assert.deepEqual(warnings, []);
});
