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

## Organisation et point d’entrée

Chaque composant a son dossier contenant ses trois fichiers :

```text
pages/live-page/
  live-page.component.ts    logique, état et dépendances
  live-page.component.html  structure de la vue
  live-page.component.css   présentation propre au composant
```

Les styles sont encapsulés par Angular. `src/styles/main.css` ne conserve que
les variables du thème, les règles de base, la disposition des pages et les
utilitaires partagés. Les fichiers `*-shared.css` sont importés par les composants
qui partagent un même motif (modales, cartes éditoriales, panneaux assistant).

## Pourquoi il n’y a pas d’AppModule

Cette application utilise les composants **standalone**, recommandés par Angular
pour les nouveaux projets. `main.ts` appelle `bootstrapApplication(AppComponent,
appConfig)`. Les services globaux et le routeur sont configurés dans
`app.config.ts`. Les dépendances visuelles sont importées dans le décorateur
`@Component` de chaque composant ; il n’y a donc pas de tableau global
`declarations` dans un `app.module.ts`.

## Comment une URL affiche une page

```text
index.html → <app-root>
  main.ts → AppComponent (app.component.html)
    <router-outlet> → LayoutComponent
      Navbar + <main> + Footer + consentement
        <main><router-outlet> → composant de la route enfant
          /                → HomePageComponent
          /en-direct       → LivePageComponent
          /guides          → GuidesIndexPageComponent
          /guides/:slug    → GuidePageComponent
          /news/:slug      → ArticlePageComponent
          /teams/:slug     → TeamPageComponent
          /competitions/:slug → CompetitionPageComponent
```

Les associations URL/composant se trouvent dans `src/app/app.routes.ts`.
`<main>` est un élément HTML sémantique : il ne choisit aucune page lui-même.
C’est le **router-outlet à l’intérieur de main** qui reçoit la route enfant.
La barre de navigation et le pied de page appartiennent au layout, donc restent
présents lorsque la page change. Les liens `routerLink` changent la route sans
recharger tout le document. Le paramètre `:slug` est transmis au composant grâce
à `withComponentInputBinding()` dans `app.config.ts`.

Pour modifier les scores : `components/live` et `services/live-board.service.ts`.
Pour modifier le chat : `components/sidebar/general-chat/general-chat.component.*`.
Pour modifier les textes éditoriaux : `src/app/content`.
