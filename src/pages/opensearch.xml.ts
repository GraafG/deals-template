import type { APIRoute } from 'astro';
import { SITE_CONFIG, SITE_URL } from '../lib/config';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const GET: APIRoute = () => {
  const base = SITE_URL.replace(/\/+$/, '');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${esc(SITE_CONFIG.name)}</ShortName>
  <Description>${esc(`Zoek in aanbiedingen op ${SITE_CONFIG.name}.`)}</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Language>nl-nl</Language>
  <Image height="16" width="16" type="image/svg+xml">${esc(`${base}/favicon.svg`)}</Image>
  <Url type="text/html" method="get" template="${esc(`${base}/?q={searchTerms}`)}"/>
  <Url type="application/opensearchdescription+xml" rel="self" template="${esc(`${base}/opensearch.xml`)}"/>
  <moz:SearchForm xmlns:moz="http://www.mozilla.org/2006/browser/search/">${esc(`${base}/`)}</moz:SearchForm>
</OpenSearchDescription>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/opensearchdescription+xml; charset=utf-8' },
  });
};
