import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/config';

export const GET: APIRoute = () => {
  const base = SITE_URL.replace(/\/+$/, '');
  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
