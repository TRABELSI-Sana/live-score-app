export type Guide = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string; // YYYY-MM-DD
  body: string; // Markdown-like plain text (simple)
};

export const guides: Guide[] = [
  {
    slug: "comment-lire-un-score-en-direct",
    title: "Comment lire un score en direct (et éviter les pièges)",
    description:
      "Différences entre score, statut, temps de jeu, prolongations, tirs au but et corrections après VAR.",
    updatedAt: "2026-03-04",
    body:
      `Un score “en direct” n’est pas seulement un chiffre. Pour le comprendre correctement, il faut lire trois éléments en même temps : le score, le statut du match, et le temps de jeu.

1) Score : c’est le résultat à l’instant T. En football, le score peut être corrigé (but refusé, erreur de feuille de match, mise à jour du fournisseur).

2) Statut : c’est le contexte. “NOT STARTED” signifie que le match n’a pas débuté. “IN PLAY” signifie que le chrono tourne. “HALF TIME” indique la pause. “FINISHED” signifie que le match est terminé (mais pas forcément homologué dans certains cas).

3) Temps de jeu : 45’ + temps additionnel, puis 90’ + temps additionnel. En coupe, il peut y avoir prolongations (2 × 15’) puis tirs au but.

Prolongations et tirs au but : certaines sources affichent le score “après prolongations” et, séparément, la série de tirs au but. Ne confonds pas les deux. Exemple : 1–1 (ap) puis 4–3 tab.

VAR et corrections : un but peut apparaître puis disparaître (but refusé). Sur les flux d’événements, tu peux voir un événement “GOAL DISALLOWED”. C’est normal : ce n’est pas un bug du site, c’est la réalité des mises à jour live.

Conseil pratique : pour juger un match, regarde le trio score/statut/minute. Un 0–0 à 5’ n’a pas le même sens qu’un 0–0 à 88’.
`,
  },
  {
    slug: "classement-foot-calcul",
    title: "Classement : points, différence de buts, confrontations",
    description:
      "Comment sont départagées les équipes : points, goal-average, confrontations directes selon les compétitions.",
    updatedAt: "2026-03-04",
    body:
      `Le classement d’un championnat ne dépend pas que des points. Les règles de départage peuvent changer selon la ligue.

Base la plus fréquente :
- Victoire = 3 points, nul = 1 point, défaite = 0 point.

Ensuite viennent les critères de départage (ordre variable selon les compétitions) :
1) Différence de buts générale (buts marqués - buts encaissés).
2) Nombre de buts marqués.
3) Confrontations directes : points sur les matchs entre les équipes concernées.
4) Différence de buts sur les confrontations directes.
5) Buts marqués à l’extérieur (plus rare aujourd’hui en championnat).

Confrontations directes : en Liga ou Serie A, elles peuvent passer avant la différence de buts générale. En Ligue 1, les règles peuvent évoluer d’une saison à l’autre : il faut vérifier le règlement de la compétition.

Pourquoi ça compte : si tu suis la course à l’Europe ou au maintien, un but à la 90+5’ peut faire basculer une place au classement, même avec le même nombre de points.

Bon réflexe : quand deux équipes sont à égalité, lis les colonnes “Diff” (différence de buts) et “BP” (buts pour). Puis regarde si la compétition privilégie les confrontations directes.
`,
  },
  {
    slug: "statuts-match-not-started-in-play-finished",
    title: "Tous les statuts de match expliqués (NS, HT, FT, AET, PEN…)",
    description:
      "Glossaire des statuts les plus fréquents et comment les interpréter pendant un live.",
    updatedAt: "2026-03-04",
    body:
      `Les flux live utilisent des abréviations. Voici les plus utiles :

- NS (Not Started) : match pas commencé.
- 1H / 2H : première/deuxième mi-temps.
- HT : mi-temps.
- FT : fin du temps réglementaire.
- ET : prolongations en cours.
- AET : terminé après prolongations.
- PEN : tirs au but (séance en cours ou résultat après tab, selon la source).
- POSTPONED : match reporté.
- CANCELLED : match annulé.
- SUSPENDED / INTERRUPTED : match interrompu.

Attention : certaines API normalisent différemment. Le plus important est d’éviter une confusion classique : FT ne veut pas dire “homologué”, mais “terminé dans le flux”. Des corrections peuvent survenir après FT.

Pour une expérience fiable : lis toujours le statut + le score. Un match “SUSPENDED” à 1–0 ne doit pas être interprété comme une victoire finale.
`,
  },
  {
    slug: "cartons-penalty-hors-jeu-evenements",
    title: "Cartons, penalty, hors-jeu : comprendre les événements minute par minute",
    description:
      "Décrypter les événements (⚽️, 🟨, 🟥) et leur impact réel sur le match.",
    updatedAt: "2026-03-04",
    body:
      `Le minute par minute sert à raconter le match. Les événements les plus utiles :

⚽️ But : peut être normal, sur penalty, ou contre son camp. Un but peut aussi être refusé (VAR, hors-jeu, faute).

🟨 Carton jaune : avertissement. Deux jaunes = rouge (souvent affiché “SECOND YELLOW”).

🟥 Carton rouge : expulsion. L’équipe joue en infériorité numérique ; le match peut basculer.

Penalty : souvent un événement “PENALTY” suivi d’un “GOAL (P)” si transformé. Si raté, le score ne change pas.

Hors-jeu : toutes les sources ne le remontent pas. Mais un but refusé pour hors-jeu se matérialise souvent par “GOAL DISALLOWED”.

Pourquoi tu peux voir des doublons : les fournisseurs live publient parfois un but à 49’, puis le “repostent” à 50’. C’est un bruit classique. L’important est de garder une timeline lisible (un seul but compté, pas deux).
`,
  },
  {
    slug: "sources-donnees-live-limites",
    title: "Données live : fiabilité, latence, limites (et pourquoi ça bouge)",
    description:
      "Pourquoi les scores peuvent changer, pourquoi il y a de la latence, et comment interpréter une mise à jour.",
    updatedAt: "2026-03-04",
    body:
      `Un site de scores dépend d’une chaîne : stade → opérateur → fournisseur de données → API → ton écran. Chaque maillon ajoute de la latence.

Latence typique : quelques secondes à 1 minute selon la compétition, le fournisseur, et la charge.

Corrections :
- But d’abord affiché puis refusé.
- Minute corrigée.
- Buteur ou passeur modifié.
- Statut ajusté (HT, FT, AET).

Ce n’est pas “faux”, c’est un flux en cours de stabilisation. Pour vérifier : recoupe avec le statut (IN PLAY/FINISHED) et la liste d’événements.

Bon usage : utilise le live pour suivre, pas comme une preuve officielle. Pour des validations officielles (pari, classement final), il faut attendre la confirmation du match et des instances.
`,
  },
  {
    slug: "guide-ligue1-liguedeschampions-coupes",
    title: "Championnats vs coupes : ce qui change (prolongations, tab, règles)",
    description:
      "Différences de format entre ligues et coupes, et comment lire un résultat final dans chaque cas.",
    updatedAt: "2026-03-04",
    body:
      `En championnat, un match nul est possible et le score final suffit presque toujours.

En coupe, l’objectif est souvent de départager les équipes :
- Match aller/retour : le score cumulé (aggregate) compte.
- Prolongations : 2 × 15’ si égalité.
- Tirs au but : si l’égalité persiste.

Lecture d’un résultat :
- “1–1 (ap)” signifie égalité après prolongations.
- “4–3 tab” (ou PEN) signifie victoire aux tirs au but.

Règles qui peuvent varier :
- But à l’extérieur (souvent supprimé en compétitions UEFA modernes, mais peut exister dans certains tournois).
- Rejouer le match vs tirs au but (certains formats amateurs).

Conseil : quand tu suis une coupe, regarde toujours si le match est un retour et si un “aggregate” est affiché.
`,
  },
  {
    slug: "seo-contenu-editorial-pour-un-site-de-scores",
    title: "Créer du contenu éditorial utile autour des scores (sans copier les autres)",
    description:
      "Idées d’articles evergreen et de pages “valeur ajoutée” pour un site de scores.",
    updatedAt: "2026-03-04",
    body:
      `Pour qu’un site de scores soit perçu comme un média (et pas comme un simple miroir d’API), il faut de la valeur ajoutée.

Idées “evergreen” (ne dépendent pas d’un match précis) :
- Guides : lire un score, comprendre un classement, statuts, règles des coupes.
- Dossiers : histoire d’une compétition, formats, records, lexique.
- Explications : comment fonctionne la VAR, pourquoi un but est refusé, rôle des xG (si tu en as).

Idées “match day” (plus éditorial) :
- Présentation des affiches du jour (2–3 paragraphes par compétition).
- Focus sur les enjeux : maintien, Europe, derby.
- 3 points à suivre : joueurs clés, dynamique, blessures.

Ce qu’il faut éviter :
- Copier-coller des résumés d’autres sites.
- Publier uniquement du texte généré automatiquement sans relecture.

Objectif : que chaque page ait une raison d’exister, même si l’utilisateur ne regarde pas un seul score.
`,
  },
  {
    slug: "faq-livefoot",
    title: "FAQ : questions fréquentes sur les scores en direct",
    description:
      "Réponses courtes et claires aux questions qu’on se pose pendant un live.",
    updatedAt: "2026-03-04",
    body:
      `Pourquoi le score a changé ? → But refusé, correction fournisseur, ou mise à jour tardive.

Pourquoi je vois 49’ puis 50’ pour le même but ? → Bruit de flux ; l’événement est re-publié.

Pourquoi le classement n’est pas à jour ? → Certaines ligues publient le classement en différé ; il peut aussi manquer des données.

Pourquoi un match est “SUSPENDED” ? → Interruption (météo, incident, décision arbitrale). Le résultat n’est pas final.

Pourquoi l’heure n’est pas la mienne ? → Les heures peuvent être en UTC selon la source. Vérifie le fuseau.

Est-ce officiel ? → Non. Le live est informatif. Pour une validation officielle, consulte les instances de la compétition.
`,
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
