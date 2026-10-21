# Frontend LiveFoot — Angular 22

Application TypeScript avec composants standalone, routes chargées à la demande,
services injectables et signals. Angular est épinglé en version 22.2.3.
Utiliser Node 24 LTS (24.15.0 minimum), par exemple `nvm use` dans ce dossier.

```bash
npm ci
npm run dev
```

Le serveur Angular écoute sur http://localhost:4200. Les requêtes `/api` sont
transmises au backend http://127.0.0.1:8099 via `proxy.conf.json`.

```bash
npm run lint
npm run build:seo
npm run test:smoke
npm run preview
```

`build:seo` compile dans `dist/browser`, puis génère les 64 routes éditoriales
pour chacun des domaines, dont la variante `dist-tn/browser`. Les routes sont
calculées à partir de `src/app/content`, et toute erreur de pré-rendu arrête le
build. Aucun appel au fournisseur de scores ou au modèle IA n'est nécessaire.

`test:smoke` utilise Chromium/Puppeteer avec des réponses API simulées pour
vérifier navigation, SEO, scores SSE, recherche, classements, compositions,
consentement, analyse IA, chat et affichage mobile. Installer Chromium si besoin :
`npx puppeteer browsers install chrome`.

Le Dockerfile nginx reçoit les dossiers `dist` et `dist-tn`, avec leurs
sous-dossiers `browser`. Les commandes de publication manuelles et le workflow
automatique au push restent décrits dans le README principal.
