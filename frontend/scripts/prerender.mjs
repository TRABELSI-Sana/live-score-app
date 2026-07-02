import { launch } from "puppeteer";
import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "../dist");

const articleSlugs = [
  "comment-lire-un-classement", "regles-hors-jeu", "tactique-433", "tactique-352",
  "pressing-football", "xg-statistiques", "cartons-discipline", "phases-arretees",
  "suivre-match-en-direct", "lire-compositions", "transitions", "derby",
  "calendrier-fatigue", "mercato", "jeunes-talents", "gardien-moderne",
  "defense-zone", "defense-individuelle", "contre-attaque", "possession",
  "var-protocole", "formats-competitions", "paris-responsables", "culture-supporter",
  "analyse-apres-match",
];

const teamSlugs = [
  "psg", "om", "ol", "lille", "monaco", "rennes", "nice", "lens",
  "real-madrid", "barcelona", "atletico-madrid", "man-city", "man-united",
  "liverpool", "arsenal", "chelsea", "bayern", "dortmund", "juventus", "inter",
];

const competitionSlugs = ["ligue-1", "premier-league", "champions-league"];

const guideSlugs = [
  "comment-lire-un-score-en-direct", "classement-foot-calcul",
  "statuts-match-not-started-in-play-finished", "cartons-penalty-hors-jeu-evenements",
  "sources-donnees-live-limites", "guide-ligue1-liguedeschampions-coupes",
  "seo-contenu-editorial-pour-un-site-de-scores", "faq-livefoot",
];

const routes = [
  "/",
  "/en-direct",
  "/guides",
  "/news",
  "/teams",
  "/competitions",
  ...guideSlugs.map((s) => `/guides/${s}`),
  ...articleSlugs.map((s) => `/news/${s}`),
  ...teamSlugs.map((s) => `/teams/${s}`),
  ...competitionSlugs.map((s) => `/competitions/${s}`),
];

function serveDist() {
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
  };

  const server = createServer((req, res) => {
    let filePath = resolve(DIST, req.url === "/" ? "index.html" : req.url.slice(1));
    if (!existsSync(filePath) || !filePath.includes(".")) {
      filePath = resolve(DIST, "index.html");
    }
    const ext = "." + filePath.split(".").pop();
    const mime = mimeTypes[ext] || "application/octet-stream";
    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { "Content-Type": mime });
      res.end(content);
    } catch {
      const fallback = readFileSync(resolve(DIST, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(fallback);
    }
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function prerender() {
  console.log(`Prerendering ${routes.length} routes...`);

  const { server, port } = await serveDist();
  const browser = await launch({ headless: true, args: ["--no-sandbox"] });

  let done = 0;
  const concurrency = 4;
  const queue = [...routes];

  async function processRoute(route) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("/api/")) {
        req.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      } else {
        req.continue();
      }
    });

    try {
      await page.goto(`http://127.0.0.1:${port}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
      await page.waitForSelector("#root", { timeout: 5000 });
      await new Promise((r) => setTimeout(r, 800));

      // Wait for Helmet to update the head
      await page.waitForFunction(() => {
        const titles = document.querySelectorAll("title[data-rh]");
        return titles.length > 0;
      }, { timeout: 3000 }).catch(() => {});

      const helmetTitle = await page.evaluate(() => {
        const el = document.querySelector("title[data-rh]");
        return el ? el.textContent : document.title;
      });
      let html = await page.content();

      // Replace all title tags with the Helmet-computed one
      html = html.replace(/<title[^>]*>[^<]*<\/title>/g, "");
      html = html.replace("</head>", `<title>${helmetTitle}</title></head>`);

      // Fix local URLs to production
      const localOrigin = `http://127.0.0.1:${port}`;
      html = html.replaceAll(localOrigin, "https://livefoot.online");

      // Remove duplicate tags — keep last occurrence (Helmet-injected)
      function dedup(pattern) {
        const matches = html.match(pattern);
        if (matches && matches.length > 1) {
          for (let i = 0; i < matches.length - 1; i++) {
            html = html.replace(matches[i], "");
          }
        }
      }

      dedup(/<title>[^<]*<\/title>/g);
      dedup(/<meta name="description"[^>]*>/g);
      dedup(/<meta property="og:title"[^>]*>/g);
      dedup(/<meta property="og:description"[^>]*>/g);
      dedup(/<meta property="og:url"[^>]*>/g);
      dedup(/<meta property="og:type"[^>]*>/g);
      dedup(/<meta property="og:image"[^>]*>/g);
      dedup(/<meta property="og:locale"[^>]*>/g);
      dedup(/<meta name="twitter:card"[^>]*>/g);
      dedup(/<meta name="twitter:title"[^>]*>/g);
      dedup(/<meta name="twitter:description"[^>]*>/g);
      dedup(/<meta name="twitter:image"[^>]*>/g);
      dedup(/<link rel="canonical"[^>]*>/g);

      // Remove the old static structured-data script (pages inject their own via Helmet)
      html = html.replace(/<script type="application\/ld\+json" id="structured-data">[\s\S]*?<\/script>/, "");

      // Remove the dynamic URL-rewriting script (prerendered URLs are correct)
      html = html.replace(/<script>\s*\(function\s*\(\)\s*\{[\s\S]*?var\s+canonical[\s\S]*?<\/script>/, "");

      const outPath = route === "/"
        ? resolve(DIST, "index.html")
        : resolve(DIST, route.slice(1), "index.html");

      const outDir = dirname(outPath);
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      writeFileSync(outPath, html);
      done++;
      if (done % 10 === 0) console.log(`  ${done}/${routes.length} done`);
    } catch (err) {
      console.warn(`  WARN: Failed to prerender ${route}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const route = queue.shift();
          if (route) await processRoute(route);
        }
      })()
    );
  }
  await Promise.all(workers);

  await browser.close();
  server.close();
  console.log(`Done! ${done}/${routes.length} routes prerendered.`);
}

prerender().catch((err) => {
  console.error("Prerender failed:", err);
  process.exit(1);
});
