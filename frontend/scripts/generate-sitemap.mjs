import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { articles } from '../src/app/content/articles.ts';
import { guides } from '../src/app/content/guides.ts';
import { teams } from '../src/app/content/teams.ts';
import { competitions } from '../src/app/content/competitions.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const today = new Date().toISOString().slice(0, 10);

function entry(loc, lastmod, changefreq, priority) {
  return (base) => `  <url>
    <loc>${base}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="fr" href="https://livefoot.online${loc}"/>
    <xhtml:link rel="alternate" hreflang="fr-TN" href="https://livefoot.tn${loc}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="https://livefoot.online${loc}"/>
  </url>`;
}

const entries = [
  entry('/', today, 'always', '1.0'),
  entry('/en-direct', today, 'always', '0.9'),
  entry('/guides', today, 'weekly', '0.8'),
  entry('/news', today, 'weekly', '0.8'),
  entry('/teams', today, 'weekly', '0.8'),
  entry('/competitions', today, 'weekly', '0.8'),
  ...articles.map((a) => entry(`/news/${a.slug}`, a.updatedAt, 'monthly', '0.7')),
  ...teams.map((t) => entry(`/teams/${t.slug}`, t.updatedAt, 'weekly', '0.7')),
  ...competitions.map((c) => entry(`/competitions/${c.slug}`, c.updatedAt, 'weekly', '0.8')),
  ...guides.map((g) => entry(`/guides/${g.slug}`, g.updatedAt, 'monthly', '0.7')),
];

function buildSitemap(base) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map((e) => e(base)).join('\n')}
</urlset>
`;
}

writeFileSync(resolve(root, 'public/sitemap.xml'), buildSitemap('https://livefoot.online'));
writeFileSync(resolve(root, 'public/sitemap-tn.xml'), buildSitemap('https://livefoot.tn'));
console.log(`Sitemaps generated: ${entries.length} URLs (${today})`);
