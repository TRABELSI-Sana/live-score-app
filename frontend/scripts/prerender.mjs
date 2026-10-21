import { launch } from 'puppeteer';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { articles } from '../src/app/content/articles.ts';
import { guides } from '../src/app/content/guides.ts';
import { teams } from '../src/app/content/teams.ts';
import { competitions } from '../src/app/content/competitions.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist/browser');
const distTn = resolve(root, 'dist-tn/browser');
const shell = readFileSync(resolve(dist, 'index.html'), 'utf8');
const routes = [
  '/', '/en-direct', '/guides', '/news', '/teams', '/competitions',
  ...guides.map(({ slug }) => `/guides/${slug}`),
  ...articles.map(({ slug }) => `/news/${slug}`),
  ...teams.map(({ slug }) => `/teams/${slug}`),
  ...competitions.map(({ slug }) => `/competitions/${slug}`),
];
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.xml': 'application/xml', '.txt': 'text/plain' };
const briefing = {
  headline: 'Le foot, en un coup d’œil.', description: 'Les rencontres à suivre et les temps forts du jour.',
  liveCount: 0, upcomingCount: 0, finishedCount: 0, competitionCount: 0, highlights: [], generatedAt: '',
};

async function prerender(browser, base, output) {
  console.log(`Prerendering ${routes.length} routes for ${base}...`);
  const queue = [...routes];
  let done = 0;
  async function worker() {
    for (let route = queue.shift(); route; route = queue.shift()) {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setRequestInterception(true);
      page.on('request', request => {
        const url = new URL(request.url());
        if (url.origin !== base) return void request.abort();
        if (url.pathname.startsWith('/api/')) {
          if (url.pathname === '/api/stream/lives') return void request.respond({ contentType: 'text/event-stream', body: ': prerender\n\n' });
          return void request.respond({ contentType: 'application/json', body: JSON.stringify(url.pathname === '/api/ai/briefing' ? briefing : []) });
        }
        if (request.isNavigationRequest()) return void request.respond({ contentType: 'text/html', body: shell });
        const file = resolve(dist, `.${decodeURIComponent(url.pathname)}`);
        if (!file.startsWith(dist + '/') || !existsSync(file)) return void request.abort();
        return void request.respond({ contentType: mime[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) });
      });
      try {
        await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForFunction(expected =>
          document.querySelector('app-root h1') && document.querySelector('link[rel="canonical"]')?.getAttribute('href') === expected,
        { timeout: 15000 }, base + route);
        const metadata = await page.evaluate(() => ({
          canonicals: document.querySelectorAll('link[rel="canonical"]').length,
          h1: document.querySelector('h1')?.textContent,
          description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
          schemas: [...document.querySelectorAll('script[type="application/ld+json"]')].map(el => JSON.parse(el.textContent)),
        }));
        if (errors.length || metadata.canonicals !== 1 || !metadata.description || /introuvable/i.test(metadata.h1)) {
          throw new Error(JSON.stringify({ errors, metadata }));
        }
        const destination = resolve(output, route.slice(1), 'index.html');
        mkdirSync(dirname(destination), { recursive: true });
        writeFileSync(destination, await page.content());
        if (++done % 10 === 0) console.log(`  ${done}/${routes.length}`);
      } catch (error) {
        throw new Error(`${base}${route}: ${error.message}`, { cause: error });
      } finally {
        await page.close();
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  console.log(`Done: ${done}/${routes.length} routes for ${base}`);
}

const browser = await launch({ headless: true, args: ['--no-sandbox'] });
try {
  rmSync(resolve(root, 'dist-tn'), { force: true, recursive: true });
  cpSync(dist, distTn, { recursive: true });
  await prerender(browser, 'https://livefoot.online', dist);
  await prerender(browser, 'https://livefoot.tn', distTn);
  cpSync(resolve(distTn, 'sitemap-tn.xml'), resolve(distTn, 'sitemap.xml'));
  writeFileSync(resolve(distTn, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: https://livefoot.tn/sitemap.xml\n');
} finally {
  await browser.close();
}
