/**
 * Generates a per-deal OG image PNG at /og/[slug].png
 * Built statically at Astro build time using sharp.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getAllDealDetails } from '../../lib/deals';
import { SITE_CONFIG, SITE_DOMAIN } from '../../lib/config';
import sharp from 'sharp';

export const getStaticPaths: GetStaticPaths = () => {
  const deals = getAllDealDetails();
  return deals
    .filter(d => d.slug && d.isActive)
    .map(d => ({ params: { slug: d.slug }, props: { deal: d } }));
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (lines.length >= maxLines) break;
    if (line && (line + ' ' + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines && line !== lines[maxLines - 1]) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\w+$/, '…');
  }
  return lines;
}

export const GET: APIRoute = async ({ props }) => {
  const { deal } = props as { deal: ReturnType<typeof getAllDealDetails>[0] };

  const price = deal.discounted_price != null ? `€${deal.discounted_price.toFixed(2)}` : '';
  const original = deal.original_price != null && deal.discounted_price != null ? `€${deal.original_price.toFixed(2)}` : '';
  const discount = deal.discount_num ? `-${deal.discount_num}%` : '';
  const provider = deal.provider ?? '';
  const location = deal.location ?? '';

  const nameLines = wrapText(deal.name, 30, 3);
  const lineH = 72;
  const nameY = 210;

  const nameTextEls = nameLines.map((l, i) =>
    `<text x="80" y="${nameY + i * lineH}" font-size="58" font-weight="800"
     font-family="system-ui,-apple-system,Segoe UI,sans-serif" fill="white">${esc(l)}</text>`
  ).join('\n  ');

  const priceY = nameY + nameLines.length * lineH + 30;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${esc(SITE_CONFIG.theme.primary)}"/>
      <stop offset="100%" stop-color="${esc(SITE_CONFIG.theme.secondary)}"/>
    </linearGradient>
    <linearGradient id="circ" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.01)"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="980" cy="80"  r="340" fill="url(#circ)"/>
  <circle cx="150" cy="540" r="220" fill="url(#circ)"/>

  <!-- Brand -->
  <text x="80" y="110" font-size="34" font-family="system-ui,-apple-system,Segoe UI,sans-serif"
        fill="rgba(255,255,255,0.65)">${esc(SITE_CONFIG.theme.mark)} ${esc(SITE_CONFIG.name)}</text>
  <line x1="80" y1="128" x2="440" y2="128" stroke="rgba(255,255,255,0.20)" stroke-width="1"/>

  <!-- Deal name -->
  ${nameTextEls}

  <!-- Price row -->
  ${price ? `<text x="80" y="${priceY}" font-size="64" font-weight="800"
      font-family="system-ui,-apple-system,Segoe UI,sans-serif" fill="#fbbf24">${esc(price)}</text>` : ''}
  ${original ? `<text x="${80 + price.length * 36 + 16}" y="${priceY}" font-size="40"
      font-family="system-ui,-apple-system,Segoe UI,sans-serif"
      fill="rgba(255,255,255,0.45)" text-decoration="line-through">${esc(original)}</text>` : ''}
  ${discount ? `<rect x="${80 + price.length * 36 + (original ? original.length * 24 + 32 : 16)}"
      y="${priceY - 44}" width="${discount.length * 26 + 24}" height="52" rx="8" fill="#fbbf24"/>
    <text x="${80 + price.length * 36 + (original ? original.length * 24 + 44 : 28)}"
      y="${priceY - 8}" font-size="34" font-weight="700"
      font-family="system-ui,-apple-system,Segoe UI,sans-serif"
      fill="${esc(SITE_CONFIG.theme.primary)}">${esc(discount)}</text>` : ''}

  <!-- Provider / location -->
  ${provider ? `<text x="80" y="${Math.min(priceY + 60, 590)}" font-size="28"
      font-family="system-ui,-apple-system,Segoe UI,sans-serif"
      fill="rgba(255,255,255,0.55)">${esc(provider)}${location ? ' · ' + esc(location) : ''}</text>` : ''}

  <!-- URL bottom right -->
  <text x="1140" y="604" font-size="24"
        font-family="system-ui,-apple-system,Segoe UI,sans-serif"
        fill="rgba(255,255,255,0.35)" text-anchor="end">${esc(SITE_DOMAIN)}</text>
</svg>`;

  const png = await sharp(Buffer.from(svg))
    .png({ compressionLevel: 8 })
    .toBuffer();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
