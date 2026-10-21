import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from 'puppeteer';
import { guides } from '../src/app/content/guides.ts';
import { articles } from '../src/app/content/articles.ts';
import { teams } from '../src/app/content/teams.ts';
import { competitions } from '../src/app/content/competitions.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../dist/browser');
const base = 'https://livefoot.online';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon' };
const matches = [
  { id: 1, status: 'IN_PLAY', time: '70', scores: { score: '1-0' }, competition: { id: 61, name: 'Ligue 1', country: 'France' }, home: { name: 'Paris' }, away: { name: 'Lyon' }, lastEvents: [] },
  { id: 2, status: 'NOT_STARTED', scheduled: '2026-10-21T19:00:00Z', competition: { id: 39, name: 'Premier League' }, home: { name: 'Arsenal' }, away: { name: 'Chelsea' } },
  { id: 3, status: 'FINISHED', scores: { score: '2-1' }, competition: { id: 61, name: 'Ligue 1' }, home: { name: 'Lille' }, away: { name: 'Lens' } },
];
const briefing = { headline: 'Les rencontres à suivre', description: 'Le programme du jour.', liveCount: 1, upcomingCount: 1, finishedCount: 1, competitionCount: 2, generatedAt: '2026-10-21T12:00:00Z', highlights: [{ id: 1, home: 'Paris', away: 'Lyon', competition: 'Ligue 1', phase: 'live', score: '1-0', minute: '70', label: 'Match serré', reason: 'Un but d’écart.' }] };
const browser = await launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
const posts = [];
const externalRequests = [];
let failChat = false;
page.on('pageerror', error => errors.push(error.message));
await page.evaluateOnNewDocument(() => {
  if (!sessionStorage.getItem('__smoke_initialized')) {
    localStorage.setItem('cookie_consent', 'refused');
    sessionStorage.setItem('__smoke_initialized', '1');
  }
  window.__streams = [];
  window.EventSource = class extends EventTarget {
    constructor(url) { super(); this.url = url; this.closed = false; window.__streams.push(this); }
    close() { this.closed = true; }
    emit(data) { this.dispatchEvent(new MessageEvent('live', { data: JSON.stringify(data) })); }
  };
});
await page.setRequestInterception(true);
page.on('request', request => {
  const url = new URL(request.url());
  if (url.origin !== base) { externalRequests.push(request.url()); return void request.abort(); }
  const json = data => request.respond({ contentType: 'application/json', body: JSON.stringify(data) });
  if (url.pathname === '/api/stream/board') return void json(matches);
  if (url.pathname === '/api/ai/briefing') return void json(briefing);
  if (url.pathname === '/api/ai/suggestions') return void json({ suggestions: ['Quels matchs suivre ?'] });
  if (url.pathname === '/api/ai/insights') { posts.push({ type: 'insights', data: JSON.parse(request.postData()) }); return void json({ status: 'ok', answer: 'Paris mène provisoirement avec un but d’écart.' }); }
  if (url.pathname === '/api/ai/chat') {
    const data = JSON.parse(request.postData()); posts.push({ type: 'chat', data });
    return void json(failChat ? { status: 'busy', answer: 'Assistant occupé.' } : { status: 'ok', answer: data.history.length ? 'Un Pod contient les conteneurs de votre application.' : 'Kubernetes orchestre les conteneurs.' });
  }
  if (url.pathname.endsWith('/table')) return void json({ response: [{ league: { standings: [[{ rank: 1, team: { name: 'Paris' }, points: 12, all: { played: 5 }, goalsDiff: 4 }]] } }] });
  if (url.pathname.endsWith('/lineups')) return void json({ response: [{ team: { name: 'Paris' }, formation: '4-3-3', startXI: [{ player: { name: 'Gardien Test', number: 1, grid: '1:1' } }] }] });
  if (url.pathname.startsWith('/api/')) return void json([]);
  const path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
  if (!path.startsWith(root + '/') && path !== root) return void request.abort();
  let file = extname(path) ? path : resolve(path, 'index.html');
  if (!existsSync(file)) file = resolve(root, 'index.html');
  return void request.respond({ contentType: mime[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) });
});
const waitText = async (selector, text) => page.waitForFunction((selector, text) => [...document.querySelectorAll(selector)].some(el => el.textContent.includes(text)), {}, selector, text);
async function checkSeo(path) {
  await page.waitForFunction(expected => document.querySelector('link[rel="canonical"]')?.getAttribute('href') === expected, {}, base + path);
  assert.equal(await page.$$eval('link[rel="canonical"]', nodes => nodes.length), 1);
  assert.ok(await page.$eval('meta[name="description"]', el => el.content.length > 0));
}
async function navigate(path) {
  await page.evaluate(path => document.querySelector(`a[href="${path}"]`).click(), path);
  await checkSeo(path);
}
try {
  await page.setViewport({ width: 1440, height: 1080 });
  await page.goto(base + '/en-direct', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('app-root[ng-version]');
  await waitText('.match-card', 'Paris');
  assert.equal(posts.length, 0, 'No automatic model generation');
  assert.equal(await page.evaluate(() => window.__streams.filter(s => !s.closed).length), 1, 'One shared SSE connection');
  await page.evaluate(data => window.__streams.find(s => !s.closed).emit(data), [{ ...matches[0], scores: { score: '2-0' } }, ...matches.slice(1)]);
  await waitText('.match-score', '2 : 0');
  console.log('Live snapshot and SSE updates: OK');
  await page.click('.liveboard-tab:nth-child(2)'); await waitText('.match-card', 'Arsenal');
  await page.click('.liveboard-tab:nth-child(3)'); await waitText('.match-card', 'Lille');
  await page.click('.liveboard-tab:first-child');
  await page.type('.navbar-search input', 'Arsenal'); await page.waitForSelector('.liveboard-empty');
  await page.$eval('.navbar-search input', el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await waitText('.match-card', 'Paris');
  await page.click('.competition-btn'); await waitText('.ranking-table', 'Paris'); await page.click('.modal-close');
  await page.click('.match-card-lineup-btn'); await waitText('.lineup-player-name', 'Gardien Test'); await page.click('.modal-close');
  console.log('Tabs, search, rankings and lineups: OK');
  await page.click('.assistant-switcher button:nth-child(2)');
  await page.waitForSelector('#insights-question', { visible: true });
  await page.type('#insights-question', 'Quels matchs suivre ?'); await page.click('.insights-body button[type="submit"]');
  await waitText('.insights-answer', 'Paris mène');
  await page.click('.assistant-switcher button:nth-child(3)');
  await page.waitForSelector('#chat-message', { visible: true });
  await page.type('#chat-message', 'Explique Kubernetes'); await page.click('.chat-composer button'); await waitText('.chat-message--assistant', 'Kubernetes');
  await page.waitForFunction(() => !document.querySelector('#chat-message').disabled);
  await page.type('#chat-message', 'Et un Pod ?'); await page.click('.chat-composer button'); await waitText('.chat-message--assistant', 'Un Pod');
  assert.equal(posts.at(-1).data.history.length, 2);
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForSelector('.assistant-switcher'); await page.click('.assistant-switcher button:nth-child(3)');
  await waitText('.chat-message--assistant', 'Un Pod'); assert.equal(await page.$$eval('.chat-message', els => els.length), 4);
  await page.click('.chat-toolbar button'); await page.waitForSelector('.chat-welcome');
  failChat = true; await page.type('#chat-message', 'Bonjour'); await page.click('.chat-composer button'); await page.waitForSelector('.chat-retry');
  failChat = false; await page.click('.chat-retry'); await waitText('.chat-message--assistant', 'Kubernetes');
  assert.equal(await page.$$eval('.chat-message', els => els.length), 2);
  console.log('Insights and general chat: OK');
  await page.screenshot({ path: '/tmp/livefoot-angular-desktop.png' });
  await navigate('/guides');
  await navigate('/guides/' + guides[0].slug); await waitText('h1', guides[0].title);
  // Popstate navigations reuse the same route component while changing its slug.
  await page.evaluate(path => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); }, '/guides/' + guides[1].slug);
  await checkSeo('/guides/' + guides[1].slug); await waitText('h1', guides[1].title);
  await navigate('/teams'); await navigate('/teams/' + teams[0].slug); await waitText('h1', teams[0].name);
  await page.evaluate(path => { history.pushState({}, '', path); dispatchEvent(new PopStateEvent('popstate')); }, '/teams/' + teams[1].slug);
  await checkSeo('/teams/' + teams[1].slug); await waitText('h1', teams[1].name);
  await navigate('/competitions'); await navigate('/competitions/' + competitions[0].slug); await waitText('h1', competitions[0].name);
  await navigate('/news'); await navigate('/news/' + articles[0].slug); await waitText('h1', articles[0].title);
  await page.goto(base + '/teams/inconnu', { waitUntil: 'domcontentloaded' }); await waitText('h1', 'introuvable');
  assert.equal(await page.$eval('meta[name="robots"]', el => el.content), 'noindex, follow');
  await page.goto(base + '/en-direct', { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.football-assistant');
  await page.setViewport({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal mobile overflow');
  assert.ok(await page.evaluate(() => document.querySelector('.football-assistant').getBoundingClientRect().top < document.querySelector('.liveboard-tabs').getBoundingClientRect().top), 'Assistant appears before scores on mobile');
  await page.screenshot({ path: '/tmp/livefoot-angular-mobile.png' });
  await page.click('.navbar-hamburger'); await page.waitForSelector('.navbar-mobile-menu.open');
  await page.click('.navbar-mobile-menu a[href="/guides"]'); await checkSeo('/guides');
  assert.equal(await page.$$eval('.navbar-mobile-menu.open', els => els.length), 0);
  assert.equal(externalRequests.filter(url => url.includes('adsbygoogle')).length, 0, 'No advertising before consent');
  await page.evaluate(() => localStorage.removeItem('cookie_consent'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.cookie-consent', { visible: true });
  await page.click('.cookie-btn--refuse');
  await page.waitForFunction(() => !document.querySelector('.cookie-consent'));
  assert.equal(await page.$$eval('ins.adsbygoogle', nodes => nodes.length), 0);
  await page.evaluate(() => localStorage.removeItem('cookie_consent'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.cookie-consent', { visible: true });
  await page.click('.cookie-btn--accept');
  await page.waitForSelector('ins.adsbygoogle');
  await page.waitForFunction(() => Array.isArray(window.adsbygoogle) && window.adsbygoogle.length > 0);
  assert.ok(externalRequests.some(url => url.includes('adsbygoogle')));
  assert.deepEqual(errors, []);
  console.log('Angular smoke: navigation, SEO, SSE updates, search, rankings, lineups, insights, chat/history/retry, consent and mobile OK.');
} catch (error) {
  console.error('Browser errors:', errors);
  console.error('Current URL:', page.url());
  console.error('Current text:', (await page.$eval('body', el => el.innerText)).slice(0, 1800));
  await page.screenshot({ path: '/tmp/livefoot-angular-smoke-failure.png' });
  throw error;
} finally {
  await browser.close();
}
