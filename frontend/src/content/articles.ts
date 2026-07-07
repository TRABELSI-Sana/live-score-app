export type ContentItem = {
  slug: string;
  title?: string;
  name?: string;
  description?: string;
  updatedAt: string;
  body: string;
};

export const articles: ContentItem[] = [
  {
    slug: "comment-lire-un-classement",
    title: "Comprendre un classement : points, difference de buts, matchs joues",
    description: "Comment lire un classement de football : systeme de points, difference de buts, criteres de departage et regles specifiques par competition.",
    updatedAt: "2026-07-07",
    body: `## Comment fonctionne un classement de football

Un classement de championnat repose sur un systeme de points : 3 points pour une victoire, 1 pour un nul, 0 pour une defaite. Ce systeme, adopte par la FIFA en 1994, remplace l'ancien bareme (2 points par victoire) et favorise le jeu offensif.

## Les criteres de departage

Quand deux equipes ont le meme nombre de points, plusieurs criteres les departement :

1. **Difference de buts generale** (buts marques - buts encaisses)
2. **Nombre de buts marques** (avantage a l'equipe la plus offensive)
3. **Confrontations directes** (points entre les equipes concernees)
4. **Difference de buts sur confrontations directes**

L'ordre de ces criteres varie selon les competitions. En Liga et Serie A, les confrontations directes passent avant la difference de buts generale. En Ligue 1 et Premier League, c'est la difference de buts qui prime.

## Pourquoi c'est important pour suivre les matchs en direct

En fin de saison, un seul but peut faire basculer une place au classement. Quand vous suivez un match en direct et que deux equipes sont a egalite de points, chaque but compte double : il ameliore la difference de buts de l'equipe qui marque ET degrade celle de l'adversaire.

## Conseil pratique

Sur LiveFoot, consultez les colonnes "Diff" (difference de buts) et "BP" (buts pour) pour anticiper les scenarios de fin de journee. En cas d'egalite parfaite, les regles de la competition tranchent — verifiez toujours le reglement specifique.`,
  },
  {
    slug: "regles-hors-jeu",
    title: "Les regles du hors-jeu : explication simple et cas limites",
    description: "Comprendre la regle du hors-jeu en football : position, moment de la passe, exceptions et impact de la VAR sur les decisions.",
    updatedAt: "2026-07-07",
    body: `## La regle du hors-jeu expliquee simplement

Un joueur est en position de hors-jeu si, au moment ou le ballon est joue par un coequipier, il se trouve plus pres de la ligne de but adverse que le ballon ET l'avant-dernier defenseur (gardien inclus). Etre en position de hors-jeu n'est pas une infraction en soi — il faut participer activement au jeu.

## Les trois criteres de participation active

L'arbitre ne signale le hors-jeu que si le joueur :
- **Touche le ballon** joue par un coequipier
- **Interfere avec un adversaire** (gene sa vision, conteste le ballon)
- **Tire un avantage** de sa position (rebond sur poteau, arret du gardien)

## Exceptions importantes

Le hors-jeu ne s'applique pas sur :
- Les rentrees de touche
- Les corners
- Les coups de pied de but
- Les passes en retrait (vers son propre camp)

## L'impact de la VAR

Depuis l'introduction de la VAR, les decisions de hors-jeu sont verifiees au millimetre. Les lignes tracees par la technologie peuvent annuler un but pour quelques centimetres. C'est pourquoi, en suivant un match en direct, un but peut etre celebre puis annule apres verification — un delai qui dure generalement 60 a 90 secondes.

## Cas limites frequents

Le cas le plus debattu : un joueur en position de hors-jeu qui ne touche pas le ballon mais qui, par sa presence, influence le gardien. La decision reste subjective et depend de l'interpretation de l'arbitre, meme avec la VAR.`,
  },
  {
    slug: "tactique-433",
    title: "Le 4-3-3 : formation, variantes et equipes qui l'utilisent",
    description: "Analyse du systeme 4-3-3 en football : roles des joueurs, variantes offensives et defensives, forces et faiblesses tactiques.",
    updatedAt: "2026-07-07",
    body: `## Qu'est-ce que le 4-3-3 ?

Le 4-3-3 est l'une des formations les plus utilisees dans le football moderne. Elle aligne 4 defenseurs, 3 milieux et 3 attaquants. Sa popularite vient de son equilibre entre solidite defensive et potentiel offensif.

## Les roles dans un 4-3-3

- **Defenseurs centraux (x2)** : socle defensif, relance propre
- **Lateraux (x2)** : couloir entier, projection offensive
- **Milieu defensif (sentinelle)** : ecran devant la defense, orientation du jeu
- **Milieux relayeurs (x2)** : lien entre defense et attaque, courses de soutien
- **Ailiers (x2)** : largeur, dribble, appels en profondeur
- **Avant-centre** : point de fixation, finition

## Variantes courantes

Le 4-3-3 se decline en plusieurs versions :
- **4-3-3 a plat** : trois milieux sur la meme ligne (equilibre)
- **4-3-3 en pointe basse** : un 6 + deux 8 (Barcelone de Guardiola)
- **4-3-3 en pointe haute** : deux 6 + un 10 (plus defensif)
- **4-3-3 avec faux 9** : l'avant-centre decroche au milieu (Man City)

## Forces et faiblesses

**Forces** : superiorite numerique au milieu, largeur naturelle, pressing haut facilite
**Faiblesses** : lateraux exposes si les ailiers ne replient pas, espace entre les lignes si le milieu est etire

## Equipes de reference

Le FC Barcelone de 2008-2012, Liverpool de Klopp et Manchester City de Guardiola ont popularise differentes variantes du 4-3-3. En suivant ces equipes en direct, observez comment le triangle du milieu s'adapte selon les phases de jeu.`,
  },
  {
    slug: "tactique-352",
    title: "Le 3-5-2 : systeme a trois defenseurs, pistons et paires d'attaquants",
    description: "Analyse du systeme 3-5-2 : role des pistons, charniere a trois, avantages en possession et vulnerabilites sur les cotes.",
    updatedAt: "2026-07-07",
    body: `## Qu'est-ce que le 3-5-2 ?

Le 3-5-2 aligne 3 defenseurs centraux, 5 milieux (dont 2 pistons lateraux) et 2 attaquants. C'est un systeme qui offre une superiorite numerique au milieu et en attaque, au prix d'une exposition sur les cotes.

## Les roles specifiques

- **Charniere a trois** : le defenseur central axial organise, les deux lateraux couvrent la largeur
- **Pistons (x2)** : joueurs-cles qui couvrent tout le couloir (defensif + offensif). Exigence physique enorme.
- **Milieu a trois** : un defensif + deux relayeurs, ou deux defensifs + un createur
- **Paire d'attaquants** : complementarite essentielle (un pivot + un rapide, ou deux mobiles)

## Avantages tactiques

- Superiorite numerique au milieu (5 vs 4 ou 3)
- Deux attaquants qui fixent la charniere adverse
- Transition defense-attaque rapide par les pistons
- Flexibilite : se transforme en 5-3-2 en phase defensive

## Faiblesses a surveiller

- Les pistons couvrent 80+ metres : fatigue en seconde mi-temps
- Espaces derriere les pistons si la bascule est lente
- Vulnerable aux equipes qui utilisent des ailiers rapides en 1v1

## En direct : quoi observer

Quand une equipe joue en 3-5-2, surveillez la hauteur des pistons. S'ils sont haut = equipe dominante. S'ils sont bas = le 3-5-2 devient un 5-3-2 defensif. La fatigue des pistons en seconde mi-temps est souvent le moment ou l'adversaire prend l'avantage sur les cotes.

## Equipes de reference

L'Inter Milan de Conte (2020-2021), l'Atalanta et la selection italienne ont montre l'efficacite du 3-5-2 au plus haut niveau.`,
  },
  {
    slug: "pressing-football",
    title: "Le pressing : types, declencheurs et impact sur le score",
    description: "Comprendre le pressing en football : pressing haut, moyen, bas, gegenpressing, et comment il influence le deroulement d'un match.",
    updatedAt: "2026-07-07",
    body: `## Qu'est-ce que le pressing ?

Le pressing est l'action collective de recuperer le ballon le plus rapidement possible apres l'avoir perdu, ou d'empecher l'adversaire de construire. C'est devenu l'element tactique le plus important du football moderne.

## Les types de pressing

### Pressing haut
Recuperation dans le camp adverse (30 derniers metres). Objectif : empecher la relance et creer des occasions pres du but.
Equipes de reference : Liverpool, Manchester City.

### Pressing moyen (mi-bloc)
Recuperation au milieu du terrain. Objectif : couper les lignes de passe entre defenseurs et milieux adverses.
Equipes de reference : Atletico Madrid, LOSC Lille.

### Pressing bas (bloc bas)
Recuperation dans son propre camp. Objectif : fermer les espaces et repartir en contre-attaque.
Equipes de reference : equipes en difficulte ou en inferiorite.

### Gegenpressing (contre-pressing)
Pressing immediat dans les 5-6 secondes apres la perte du ballon. Objectif : recuperer avant que l'adversaire ne se reorganise.
Equipes de reference : Liverpool de Klopp, Dortmund.

## Declencheurs du pressing

Les equipes ne pressent pas en permanence. Les declencheurs courants :
- Passe laterale ou en retrait de l'adversaire
- Mauvais controle
- Joueur dos au jeu
- Ballon dans un couloir (moins d'options de sortie)

## Impact sur les matchs en direct

Un pressing efficace se mesure au PPDA (passes adverses par action defensive). Un PPDA bas (6-8) indique un pressing tres agressif. En direct, observez si les buts arrivent apres des recuperations hautes — c'est le signe d'un pressing qui fonctionne.

## Limites

Le pressing haut est extremement couteux physiquement. Les equipes ne peuvent generalement le maintenir que 60-70 minutes. Les buts concedes en fin de match indiquent souvent un pressing qui s'effondre avec la fatigue.`,
  },
  {
    slug: "xg-statistiques",
    title: "Les expected goals (xG) : comprendre la statistique reine du football",
    description: "Qu'est-ce que le xG en football ? Comment les expected goals mesurent la qualite des occasions et predisent les resultats futurs.",
    updatedAt: "2026-07-07",
    body: `## Qu'est-ce que le xG (expected goals) ?

Le xG mesure la probabilite qu'un tir se transforme en but, en se basant sur des milliers de situations similaires dans l'histoire. Un tir a 0.75 xG signifie que, dans des conditions identiques, ce tir est converti 75% du temps.

## Comment c'est calcule

Les facteurs pris en compte :
- **Distance au but** : plus on est pres, plus le xG est eleve
- **Angle de tir** : un tir axial a plus de chances qu'un tir excentre
- **Type d'action** : tete, pied fort, pied faible
- **Contexte** : contre-attaque, coup franc, corner, jeu ouvert
- **Position du gardien** : hors de sa ligne ou bien place

## Comment l'utiliser en suivant les matchs

Le xG d'un match vous dit si le score reflete la realite du jeu :
- **xG 2.5 - Score 1-0** : l'equipe a domine mais manque de realisme
- **xG 0.5 - Score 2-0** : l'equipe a ete hyper efficace sur peu d'occasions
- **xG proche du score** : le resultat est logique

## Limites du xG

Le xG ne prend pas en compte :
- La qualite individuelle du tireur (Messi vs un remplacant)
- La pression psychologique (penalty en finale vs en amical)
- Les arrets exceptionnels du gardien

## Pourquoi c'est utile sur le long terme

Sur 1 match, le xG peut tromper. Sur 10 matchs, une equipe qui surperforme son xG (marque plus que prevu) va generalement regresser vers sa moyenne. C'est un excellent outil pour distinguer la chance de la qualite reelle.`,
  },
  {
    slug: "cartons-discipline",
    title: "Cartons jaunes et rouges : regles, accumulation et impact tactique",
    description: "Tout sur les cartons en football : motifs, accumulation, suspensions automatiques et comment la discipline influence les resultats.",
    updatedAt: "2026-07-07",
    body: `## Les regles des cartons

### Carton jaune (avertissement)
Sanctionne les fautes tactiques, le jeu deloyal, les contestations et le comportement antisportif. Deux jaunes dans le meme match = expulsion (rouge).

### Carton rouge (expulsion)
Sanctionne les fautes grossieres, le jeu brutal, les insultes, une main deliberee empechant un but ou un tacle par derriere sur un joueur lance vers le but. Le joueur quitte immediatement le terrain.

## L'accumulation et les suspensions

En Ligue 1 : 3 cartons jaunes = 1 match de suspension. En Ligue des champions : 3 jaunes en phase de groupes = suspension pour le match suivant (remise a zero en phase a elimination).

## Impact tactique des cartons

Un joueur averti en premiere mi-temps change la donne tactique :
- L'entraineur peut choisir de le remplacer (pour eviter le rouge)
- Le joueur doit adapter son jeu (moins de duels, moins d'engagement)
- L'adversaire peut cibler ce joueur pour provoquer un second jaune

## En direct : ce que les cartons revelent

Un match avec beaucoup de cartons (5+) indique :
- Un match a haute intensite et enjeu
- Un arbitre strict ou des equipes nerveuses
- Des fautes tactiques deliberees pour casser le rythme

Surveillez les cartons en debut de match : ils contraignent le plan tactique pour les 70 minutes restantes. Un defenseur central averti a la 20e est un probleme majeur pour toute l'equipe.

## Statistique utile

Les equipes les plus disciplinees (moins de cartons) sont generalement mieux classees. La correlation n'est pas parfaite mais elle existe : moins de fautes = plus de possession = plus de controle du match.`,
  },
  {
    slug: "phases-arretees",
    title: "Coups de pied arretes : corners, coups francs et penalties",
    description: "L'importance des phases arretees en football : statistiques, strategies sur corners et coups francs, et taux de conversion des penalties.",
    updatedAt: "2026-07-07",
    body: `## Pourquoi les phases arretees sont decisives

Environ 30% des buts en football proviennent de situations arretees (corners, coups francs, penalties). Dans les matchs serres et les phases finales de competition, ce pourcentage monte encore. C'est souvent la difference entre gagner et faire nul.

## Les corners

- Taux de conversion moyen : 3-4% (un but tous les 25-30 corners environ)
- Strategies : premier poteau, deuxieme poteau, retrait, corner court
- Les equipes grandes et puissantes en tirent davantage profit
- En direct, surveillez les mouvements coordonnes : blocs, ecrans et courses croisees

## Les coups francs directs

- Taux de conversion : environ 5-6% pour les frappes directes
- Distance ideale : 20 a 25 metres (ni trop pres pour le mur, ni trop loin pour la puissance)
- Les specialistes (comme Messi, Juninho historiquement) peuvent doubler ce taux
- L'angle, la trajectoire et la position du mur sont determinants

## Les penalties

- Taux de conversion global : environ 76-78%
- Le gardien plonge du bon cote dans ~30% des cas
- Les penaltys en fin de match (85'+) ont un taux legerement inferieur (pression)
- En seances de tirs au but, le taux descend a environ 71%

## Suivre en direct

Quand vous voyez un coup franc ou un corner sur LiveFoot, sachez que c'est une occasion reelle. Les equipes qui dominent les phases arretees (corners obtenus, coups francs dans les 30 metres) ont un avantage statistique mesurable, surtout contre des equipes qui defendent bas.`,
  },
  {
    slug: "suivre-match-en-direct",
    title: "Comment suivre un match en direct sans le regarder",
    description: "Guide pour comprendre un match de football a travers les scores en direct, les evenements et les statistiques temps reel.",
    updatedAt: "2026-07-07",
    body: `## Au-dela du score : comprendre un match a distance

Suivre un match en direct via un site de scores, c'est lire une histoire en accelere. Le score seul ne raconte qu'une partie. Voici comment tirer le maximum d'information sans voir les images.

## Les evenements cles a surveiller

1. **Minute du premier but** : un but avant la 15e change completement la physionomie
2. **Cartons** : un rouge modifie radicalement l'equilibre
3. **Remplacements** : le timing et les profils entrants revelent la strategie
4. **Buts en fin de match (75'+)** : indiquent souvent la fatigue ou le forcing

## Lire la chronologie

La timeline d'evenements raconte l'histoire du match :
- Concentration d'evenements en debut de match = match ouvert, rythme eleve
- Peu d'evenements entre 25' et 60' = match cadenasse, equipes qui se neutralisent
- Explosion d'evenements apres 70' = match qui se debride (fatigue, remplacements offensifs)

## Les statistiques temps reel utiles

Par ordre d'importance :
1. **Tirs cadres** : qui menace reellement ?
2. **Possession** : qui controle le tempo ?
3. **Corners** : pression dans le camp adverse
4. **Fautes** : intensite et engagement

## Conseil LiveFoot

Combinez la timeline des evenements avec les indicateurs de statut du match. Un 0-0 a la 80e avec 15 tirs d'un cote est tres different d'un 0-0 sans occasions. Les statistiques contextualisent le score et vous permettent d'anticiper la suite.`,
  },
  {
    slug: "lire-compositions",
    title: "Compositions d'equipe : ce qu'elles revelent avant le coup d'envoi",
    description: "Comment analyser une composition d'equipe : systeme tactique, choix de l'entraineur, rotation et indices sur le plan de jeu.",
    updatedAt: "2026-07-07",
    body: `## Pourquoi les compositions sont une mine d'information

Les compositions sont annoncees environ 1 heure avant le match. En les analysant, vous pouvez anticiper le plan de jeu, les rapports de force et meme le niveau d'engagement d'une equipe (titulaires ou rotation).

## Decoder le systeme tactique

La liste des 11 joueurs revele le systeme :
- 4 defenseurs + 3 milieux + 3 attaquants = 4-3-3
- 3 defenseurs centraux + 2 pistons = 3-5-2 ou 5-3-2
- 2 attaquants = probable 4-4-2 ou 3-5-2

## Les indices du plan de jeu

- **Milieu supplementaire** (4 milieux au lieu de 3) : match a controler, adversaire respecte
- **Attaquant supplementaire** : match a gagner absolument, prise de risque
- **Lateral offensif titulaire vs lateral defensif** : intention de dominer ou de securiser
- **Gardien numero 2** : match de coupe, rotation assumee

## Rotation et enjeu

Comptez le nombre de changements par rapport au dernier match :
- 0-2 changements : equipe type, enjeu maximum
- 3-5 changements : rotation geree, confiance dans l'effectif
- 6+ changements : match secondaire ou fatigue a gerer (enchainement de matchs)

## Confronter les compositions au contexte

Une composition qui "tourne" en championnat apres un gros match de coupe = l'entraineur privilegie la coupe. A l'inverse, une equipe type en championnat apres une elimination = toute l'energie est recanalisee vers le championnat.

## Sur LiveFoot

Consultez les compositions des que disponibles pour contextualiser le match avant meme le coup d'envoi. C'est l'information la plus sous-estimee du football en direct.`,
  },
  {
    slug: "transitions",
    title: "Transitions offensives et defensives : la cle du football moderne",
    description: "Comment les transitions (attaque rapide apres recuperation) determinent le resultat des matchs et pourquoi elles sont devenues centrales.",
    updatedAt: "2026-07-07",
    body: `## Qu'est-ce qu'une transition ?

Une transition est le moment ou une equipe passe de la phase defensive a la phase offensive (transition offensive) ou inversement (transition defensive). Ces 3 a 5 secondes de bascule sont devenues le moment le plus decisif du football moderne.

## Transition offensive (contre-attaque)

Le principe : recuperer le ballon et attaquer avant que l'adversaire ne se replace.

Conditions ideales :
- Recuperation haute (dans le camp adverse)
- Adversaire desequilibre (joueurs montes en attaque)
- Porteur capable de jouer vite vers l'avant
- Coureurs en profondeur deja lances

## Transition defensive

Le moment le plus dangereux pour une equipe : elle vient de perdre le ballon et n'est pas encore replacee.

Solutions :
- **Gegenpressing** : recuperer immediatement (Liverpool, City)
- **Repli rapide** : courir vers son propre but (plus prudent mais passif)
- **Faute tactique** : stopper la transition adverse (carton jaune assume)

## Impact sur les matchs en direct

Les buts en transition sont souvent les plus spectaculaires et les plus difficiles a defendre. En suivant un match en direct, une concentration de buts rapides (2 buts en 5 minutes) indique souvent des transitions mal gerees par une equipe qui se decouvre.

## Statistiques revelantes

- Nombre de contres-attaques aboutissant a un tir
- Temps moyen entre recuperation et tir
- Buts apres recuperation dans les 40 metres adverses

Les equipes les plus dangereuses en transition ne sont pas forcement celles qui ont la possession — c'est meme souvent l'inverse.`,
  },
  {
    slug: "derby",
    title: "Les derbys : rivalites, histoire et enjeux au-dela du score",
    description: "Comprendre les derbys en football : origines des rivalites, impact sur le classement et pourquoi les statistiques habituelles ne s'appliquent pas.",
    updatedAt: "2026-07-07",
    body: `## Qu'est-ce qu'un derby ?

Un derby est un match entre deux equipes rivales, generalement de la meme ville ou region. L'intensite emotionnelle depasse le cadre sportif : identite locale, histoire, classes sociales et passion des supporters s'y melent.

## Les grands derbys europeens

- **El Clasico** : Real Madrid vs FC Barcelona (Espagne vs Catalogne)
- **Derby della Madonnina** : Inter vs AC Milan (meme stade, deux identites)
- **Le Classique** : PSG vs OM (Paris vs Marseille, Nord vs Sud)
- **North-West Derby** : Liverpool vs Manchester United
- **Old Firm** : Celtic vs Rangers (Glasgow, dimension religieuse)
- **Derby du Nord** : Lens vs Lille (Pas-de-Calais)

## Pourquoi les stats ne s'appliquent pas

Dans un derby, les formes recentes comptent moins. Une equipe 15e au classement peut battre le leader. Les raisons :
- Motivation decuplee (les joueurs jouent pour les supporters, pas pour les points)
- Engagement physique au-dessus de la moyenne (plus de duels, plus de fautes)
- Arbitrage sous pression (stade hostile, ambiance electrique)
- Facteur psychologique : la peur de perdre face au rival

## Ce qu'il faut surveiller en direct

- **Nombre de cartons** : indicateur d'intensite (souvent le double d'un match normal)
- **Premier but** : psychologiquement decisif dans un derby
- **Fautes au milieu** : les derbys se jouent souvent dans l'entrejeu avec beaucoup d'impact
- **Temps additionnel** : souvent genereux (incidents, celebrations, altercations)

## A savoir

Les derbys produisent statistiquement plus de nuls que les matchs classiques. La peur de perdre prend souvent le dessus sur l'envie de gagner, ce qui donne des matchs fermes et tendus.`,
  },
  {
    slug: "calendrier-fatigue",
    title: "Calendrier et fatigue : pourquoi l'encainement des matchs change tout",
    description: "L'impact du calendrier sur les performances en football : rotation, fatigue, matchs tous les 3 jours et gestion de l'effectif.",
    updatedAt: "2026-07-07",
    body: `## Le probleme du calendrier moderne

Les clubs de haut niveau jouent 50 a 70 matchs par saison. Avec la nouvelle Ligue des champions elargie, les selections nationales et les coupes domestiques, certains joueurs depassent 60 matchs. La fatigue est devenue un facteur tactique a part entiere.

## L'impact mesurable sur les performances

Les etudes montrent :
- **Distance parcourue** : baisse de 3-5% quand l'equipe joue tous les 3 jours
- **Sprints haute intensite** : baisse de 8-12% apres 3 matchs en 8 jours
- **Blessures musculaires** : risque x2.5 quand le temps de recuperation est inferieur a 72h
- **Buts encaisses** : les equipes concedent plus en 2e mi-temps lors du 3e match consecutif en une semaine

## La rotation : arme tactique

Les entraineurs utilisent la rotation (changer 3-5 joueurs) pour preserver la fraicheur. Mais tourner a un cout :
- Perte d'automatismes entre les joueurs
- Joueurs remplacants moins performants individuellement
- Risque de decrochage si la rotation est trop importante

## En direct : quand la fatigue se voit

Signes de fatigue dans un match en direct :
- Buts concentres apres la 75e minute
- Baisse de pressing en seconde mi-temps
- Erreurs individuelles inhabituelles (mauvais controles, passes en retrait risquees)
- Remplacements defensifs precoces (avant la 60e)

## Conseil de suivi

Avant un match, verifiez le calendrier recent de l'equipe. Une equipe qui a joue mercredi en coupe d'Europe puis samedi en championnat est statistiquement moins performante que son adversaire qui a eu une semaine complete de preparation.`,
  },
  {
    slug: "mercato",
    title: "Le mercato : fenetres de transferts, regles et impact sportif",
    description: "Guide du mercato en football : periodes de transferts, regles FIFA, prets, clauses liberatoires et impact des arrivees sur les resultats.",
    updatedAt: "2026-07-07",
    body: `## Les fenetres de transfert

Deux periodes de transferts existent chaque saison :
- **Mercato d'ete** : du 1er juin au 31 aout (dates exactes variables par pays)
- **Mercato d'hiver** : du 1er au 31 janvier

En dehors de ces periodes, aucun transfert n'est possible (sauf joueurs libres non inscrits).

## Types de transferts

### Transfert definitif
Achat du joueur avec indemnite de transfert. Le joueur change de club de maniere permanente.

### Pret (avec ou sans option d'achat)
Le joueur rejoint un club temporairement (6 mois ou 1 an). L'option d'achat permet de le garder definitivement a un prix fixe a l'avance.

### Joueur libre
Fin de contrat : le joueur part sans indemnite. Seul le salaire est negocie.

### Clause liberatoire
Montant fixe dans le contrat qui permet a n'importe quel club de recruter le joueur sans negocier avec le club vendeur.

## Impact sur les matchs en direct

Les nouvelles recrues mettent generalement 4 a 8 semaines pour s'integrer. En debut de saison ou apres le mercato d'hiver, les performances peuvent etre instables :
- Nouveaux joueurs pas encore integres tactiquement
- Anciens joueurs perturbes par les departs de coequipiers
- Nouvel equilibre a trouver dans le vestiaire

## A surveiller

Un club qui recrute beaucoup en janvier est generalement en difficulte. A l'inverse, un club stable qui ne bouge pas est souvent satisfait de son effectif — signe de confiance.`,
  },
  {
    slug: "jeunes-talents",
    title: "Jeunes talents : comment reperer les futurs grands joueurs",
    description: "Criteres pour identifier les jeunes talents du football : statistiques precoces, academies de reference et parcours types vers le haut niveau.",
    updatedAt: "2026-07-07",
    body: `## Les indicateurs d'un jeune talent

Reperer un futur grand joueur avant tout le monde, c'est observer des signaux precoces :
- **Titulaire avant 20 ans** dans un club de Ligue 1 ou equivalent
- **Statistiques au-dessus de la moyenne d'age** (buts, passes decisives, duels gagnes)
- **Selections en equipe nationale jeune** puis rapide integration chez les A
- **Progression annuelle visible** (plus de matchs, meilleures stats chaque saison)

## Les academies de reference

Certains centres de formation produisent regulierement des talents de classe mondiale :
- **La Masia (Barcelone)** : Messi, Xavi, Iniesta, Pedri
- **Clairefontaine + clubs L1** : Mbappe, Camavinga, Tchouameni
- **Ajax Amsterdam** : De Jong, De Ligt, Bergwijn
- **OL Academy** : Benzema, Lacazette, Cherki
- **Sporting CP** : Ronaldo, Fernandes, Amorim

## Les parcours types

Le parcours classique d'un jeune talent :
1. Formation dans un club reconnu (14-18 ans)
2. Premiers matchs pro a 17-19 ans
3. Saison complete en tant que titulaire a 19-21 ans
4. Transfert vers un grand club europeen a 21-23 ans
5. Pic de carriere a 25-30 ans

## En direct : reperer les talents emergents

Quand vous suivez des matchs sur LiveFoot, notez les jeunes joueurs (U21) qui :
- Marquent ou font des passes decisives regulierement
- Sont titulaires dans des matchs a enjeu (pas seulement en rotation)
- Jouent pour des equipes qui se qualifient en Europe

## Fausses pistes

Attention aux "one season wonders" : un joueur exceptionnel sur 6 mois ne confirme pas toujours. La regularite sur 2+ saisons est le vrai indicateur de talent durable.`,
  },
  {
    slug: "gardien-moderne",
    title: "Le gardien moderne : role, statistiques et evolution du poste",
    description: "Evolution du poste de gardien de but : jeu au pied, sorties, statistiques cles et pourquoi le gardien est devenu le premier relanceur.",
    updatedAt: "2026-07-07",
    body: `## Le gardien n'est plus un simple arreteur

Le gardien de but moderne est devenu le premier constructeur du jeu. Sa capacite a relancer proprement sous pressing, a couvrir l'espace derriere une defense haute et a communiquer avec sa charniere est aussi importante que ses arrets.

## Les statistiques cles d'un gardien

### Statistiques classiques
- **Clean sheets** : matchs sans but encaisse
- **Pourcentage d'arrets** : tirs cadres arretes / total de tirs cadres
- **Buts encaisses par match** : indicateur brut de solidite

### Statistiques modernes
- **Post-shot xG minus goals** : mesure la qualite des arrets par rapport a la difficulte
- **Passes sous pression reussies** : capacite a relancer proprement
- **Sorties hors surface** : couverture de l'espace derriere la defense
- **Long balls accuracy** : precision des longs ballons de relance

## Le jeu au pied : nouvelle exigence

Les entraineurs modernes (Guardiola, Arteta, De Zerbi) exigent un gardien capable de :
- Jouer court sous pressing (role de libero)
- Relancer long avec precision vers les ailiers
- Participer au jeu de possession comme 11e joueur de champ

## En direct : quand le gardien fait la difference

Observez les moments ou le gardien est sollicite au pied : si l'adversaire presse haut et que le gardien reussit a sortir proprement, c'est un avantage enorme. A l'inverse, une erreur de relance sous pression mene souvent a un but (occasion a xG > 0.5).

## Gardiens de reference

Neuer a revolutionne le poste avec ses sorties et sa relance. Ederson et Alisson ont porte ce role encore plus loin en Premier League. En Ligue 1, les gardiens sont de plus en plus evalues sur leur jeu au pied autant que sur leurs arrets.`,
  },
  {
    slug: "defense-zone",
    title: "La defense de zone : principes, avantages et limites",
    description: "Comment fonctionne la defense de zone en football : positionnement, couverture d'espace, coordination collective et differences avec le marquage individuel.",
    updatedAt: "2026-07-07",
    body: `## Principe de la defense de zone

En defense de zone, chaque joueur est responsable d'un espace plutot que d'un adversaire specifique. L'objectif est de maintenir une structure compacte qui couvre les zones dangereuses, quel que soit le placement des attaquants adverses.

## Comment ca fonctionne

Les defenseurs se positionnent en fonction :
- Du ballon (orientation vers le porteur)
- De leurs coequipiers (distances fixes entre les lignes)
- Des zones dangereuses (axe du but prioritaire)

Quand le ballon bouge, tout le bloc coulisse ensemble. C'est un mouvement coordonne ou chaque joueur ajuste sa position en temps reel.

## Avantages

- **Compacite** : espaces entre les lignes reduits (difficile de jouer entre les lignes)
- **Couverture mutuelle** : un defenseur battu est immediatement couvert par un coequipier
- **Moins d'energie** : pas besoin de courir apres un joueur sur tout le terrain
- **Previsibilite** : chacun sait ou sont ses coequipiers

## Limites

- **Joueurs entre les lignes** : un attaquant qui se positionne entre deux zones peut etre "oublie"
- **Surcharges** : 3 attaquants dans la zone de 2 defenseurs creent un surnombre
- **Manque de responsabilite individuelle** : "c'est pas mon joueur" peut mener a des oublis

## En direct

Une equipe qui defend en zone concede des occasions quand l'adversaire trouve des joueurs entre les lignes (entre defense et milieu). Observez les passes dans le demi-espace : c'est la vulnerabilite principale de la zone. Si ces passes sont neutralisees, la zone est efficace.

## A savoir

La plupart des equipes modernes utilisent un systeme hybride : zone dans le bloc + marquage individuel dans la surface sur corners et coups francs.`,
  },
  {
    slug: "defense-individuelle",
    title: "Le marquage individuel : principes, avantages et risques",
    description: "Comprendre le marquage individuel en football : suivi du joueur, prise a un contre un, avantages en pressing et risques d'exposition.",
    updatedAt: "2026-07-07",
    body: `## Principe du marquage individuel

En marquage individuel, chaque defenseur est assigne a un attaquant specifique et le suit partout sur le terrain. C'est un systeme base sur la responsabilite personnelle plutot que sur la couverture d'espace.

## Comment ca fonctionne

Chaque joueur defensif a une "mission" claire :
- Suivre son adversaire direct dans tous ses deplacements
- Empecher toute reception de balle dans des zones dangereuses
- Gagner les duels directs (aeriens et au sol)

## Avantages

- **Responsabilite claire** : impossible de se defausser, chacun sait qui il doit surveiller
- **Efficace en pressing** : chaque joueur presse son vis-a-vis direct
- **Neutralise les createurs** : un meneur de jeu suivi partout est neutralise
- **Intensite** : force l'adversaire a des duels constants

## Risques importants

- **Desorganisation** : si l'adversaire decroche ou permute, le defenseur le suit et quitte sa zone
- **Inferiorite locale** : un attaquant qui attire son marqueur cree un espace pour un coequipier
- **Dependance au duel** : si un defenseur est battu, personne ne couvre immediatement
- **Fatigue** : suivre un joueur mobile pendant 90 minutes est tres couteux

## Utilisation moderne

Peu d'equipes utilisent un marquage individuel strict sur tout le terrain. En revanche, c'est encore courant :
- Sur les phases arretees (corner, coup franc)
- Pour neutraliser un joueur-cle adverse (mission specifique)
- En debut de match pour casser le rythme de l'adversaire

## En direct

Si vous voyez un joueur adverse qui "disparait" du match (0 ballon touche, aucune implication), c'est souvent le signe qu'il est marqué individuellement avec succes. A l'inverse, un marquage battu en debut d'action mene souvent aux plus belles occasions du match.`,
  },
  {
    slug: "contre-attaque",
    title: "La contre-attaque : quand et comment elle fonctionne",
    description: "Analyse de la contre-attaque en football : conditions ideales, profils de joueurs, difference avec la transition rapide et equipes specialistes.",
    updatedAt: "2026-07-07",
    body: `## Qu'est-ce qu'une contre-attaque ?

La contre-attaque est une action offensive rapide lancee immediatement apres la recuperation du ballon, profitant du desequilibre de l'adversaire. L'objectif : atteindre le but adverse en moins de 10 secondes, avant que la defense ne se replace.

## Conditions ideales

Pour qu'une contre-attaque fonctionne :
- **L'adversaire est monte** : lateraux et milieux hauts, espaces dans le dos
- **Recuperation dans sa moitie** : plus d'espace pour accelerer
- **Porteur capable de lever la tete** : premiere passe vers l'avant decisive
- **Coureurs rapides deja positionnes** : ailiers ou attaquants aux qualites de sprint

## Profils de joueurs ideaux

- **Attaquant rapide** : sprint > 34 km/h, capable de prendre la profondeur
- **Milieu relayeur** : vision du jeu, passe longue precise
- **Ailier crocheteur** : capable de battre un defenseur en 1v1 a pleine vitesse
- **Lateral athletique** : accompagne l'action en soutien

## Contre-attaque vs transition rapide

La difference est subtile :
- **Contre-attaque** : l'equipe CHOISIT de ne pas avoir la possession et attend la recuperation pour frapper
- **Transition rapide** : l'equipe joue la possession mais sait exploiter les pertes de ballon adverses

## En direct : reperer les equipes de contre

Indices dans les statistiques :
- Possession faible (40-45%) mais xG eleve
- Peu de tirs mais beaucoup de tirs dans la surface
- Buts rapides apres des periodes de domination adverse
- Victoires frequentes a l'exterieur (contre des equipes qui attaquent)

## Equipes specialistes

Leicester (2016), l'Atletico de Simeone et le Real Madrid en Ligue des champions sont des references. En Ligue 1, le LOSC et Monaco utilisent regulierement la contre-attaque comme arme principale a l'exterieur.`,
  },
  {
    slug: "possession",
    title: "La possession : controle, domination ou illusion ?",
    description: "Analyse de la possession en football : quand elle est utile, quand elle est sterile, et comment distinguer possession dominante et possession passive.",
    updatedAt: "2026-07-07",
    body: `## La possession ne garantit pas la victoire

Avoir le ballon 70% du temps ne signifie pas dominer le match. La Premier League a demontre que des equipes a 35% de possession peuvent gagner regulierement. La question n'est pas "combien" mais "que fait-on avec".

## Possession dominante vs possession sterile

### Possession dominante
- Passes dans le dernier tiers elevees
- Progression vers le but constante
- xG superieur a l'adversaire
- L'adversaire defend dans ses 30 metres

### Possession sterile
- Passes laterales et en retrait majoritaires
- Peu de penetration dans la surface
- xG faible malgre 65%+ de possession
- L'adversaire defend confortablement a 40 metres

## Les indicateurs qui comptent

Pour evaluer la qualite de la possession :
- **Passes progressives** : passes qui avancent le ballon de 10+ metres vers le but
- **Carries progressifs** : conduites de balle qui gagnent du terrain
- **Touches dans la surface** : combien de fois le ballon arrive dans la zone de verite
- **Sequences de passes aboutissant a un tir** : la possession cree-t-elle du danger ?

## En direct

Si une equipe a 70% de possession mais 0 tir cadre a la 60e minute, c'est de la possession sterile. L'adversaire defend bien et attend son moment. Inversement, 55% de possession avec 5 tirs cadres indique une possession efficace et dangereuse.

## Le faux dilemme possession vs contre

Les meilleures equipes du monde (Manchester City, Barcelone) combinent les deux : elles dominent la possession MAIS savent aussi frapper en transition quand l'adversaire perd le ballon. C'est cette polyvalence qui les rend si difficiles a battre.`,
  },
  {
    slug: "var-protocole",
    title: "La VAR : protocole, decisions et impact sur le football",
    description: "Comment fonctionne la VAR en football : protocole d'intervention, types de decisions verifiees, temps d'arret et controverses.",
    updatedAt: "2026-07-07",
    body: `## Qu'est-ce que la VAR ?

La VAR (Video Assistant Referee) est un systeme d'assistance video pour les arbitres, introduit officiellement par la FIFA en 2018. Un arbitre assistant video, installe dans une salle dediee, revisionne les images pour corriger les "erreurs claires et evidentes".

## Les 4 situations verifiees

La VAR n'intervient que sur :
1. **Buts** : validite (hors-jeu, faute prealable, main)
2. **Penalties** : accorder ou annuler un penalty
3. **Cartons rouges directs** : expulsions manquees ou erronees
4. **Erreur d'identite** : mauvais joueur sanctionne

La VAR ne revient PAS sur les cartons jaunes, les fautes simples ou les decisions de jeu courant.

## Le protocole en pratique

1. L'action se produit sur le terrain
2. L'arbitre prend une decision initiale
3. La VAR verifie si c'est une "erreur claire et evidente"
4. Si oui, la VAR recommande une revision
5. L'arbitre peut aller voir l'ecran (OFR - On Field Review) ou accepter la recommandation

## Impact sur le suivi en direct

En suivant un match sur LiveFoot, un delai de 60 a 120 secondes peut separer un but marque et sa confirmation (ou annulation). Les evenements "Goal" puis "Goal Disallowed" sont normaux — ce n'est pas un bug, c'est la VAR en action.

## Chiffres cles

- La VAR corrige environ 5-8% des decisions par match
- Le temps moyen d'une verification : 70 secondes
- Les penalties sont la decision la plus souvent reversee
- Le hors-jeu est la cause numero 1 d'annulation de but

## Controverses

La subjectivite reste presente : la notion de "main volontaire", le placement exact de la ligne de hors-jeu et le critere d'"erreur evidente" divisent toujours. La VAR reduit les erreurs grossieres mais n'elimine pas le debat.`,
  },
  {
    slug: "formats-competitions",
    title: "Formats des competitions : championnat, coupe et phases finales",
    description: "Guide des formats de competitions de football : championnat a points, elimination directe, phases de groupes, nouvelle Ligue des champions et calendrier.",
    updatedAt: "2026-07-07",
    body: `## Les grands formats du football

### Championnat (ligue)
Toutes les equipes s'affrontent deux fois (aller-retour). Le classement final determine le champion, les qualifies en Europe et les relegues. Format utilise en Ligue 1, Premier League, Liga, Serie A, Bundesliga.

### Coupe (elimination directe)
Match unique ou aller-retour. Le perdant est elimine. Pas de classement : seul le vainqueur avance. Format de la Coupe de France, FA Cup, Copa del Rey.

### Phase de groupes + elimination
Combine les deux : d'abord un mini-championnat dans des groupes de 4, puis elimination directe pour les qualifies. Ancien format de la Ligue des champions.

## La nouvelle Ligue des champions (2024+)

Le format a change radicalement :
- **36 equipes** dans une ligue unique (plus de groupes de 4)
- **8 matchs** par equipe (adversaires differents, pas aller-retour)
- **Top 8** qualifie directement en 8e de finale
- **9e a 24e** joue un barrage supplementaire
- **25e a 36e** elimine

Ce format produit plus de matchs a enjeu et elimine les "matchs morts" en fin de phase de groupes.

## Impact sur le suivi en direct

Le format influence la facon de suivre les matchs :
- **Championnat** : chaque point compte, un nul n'est jamais inutile
- **Coupe** : tout se joue sur un match, la forme du jour prime sur le classement
- **Ligue des champions** : la difference de buts peut departager, chaque but compte meme dans une victoire assuree

## Conseil

Quand vous suivez un match en direct, identifiez d'abord le format et l'enjeu. Un 0-0 en 8e de finale retour (avec victoire 2-0 a l'aller) n'a pas le meme sens qu'un 0-0 en championnat entre deux equipes qui luttent pour le maintien.`,
  },
  {
    slug: "paris-responsables",
    title: "Paris sportifs : comprendre les cotes et jouer responsable",
    description: "Comment fonctionnent les cotes des paris sportifs en football, ce qu'elles revelent sur les probabilites et les principes du jeu responsable.",
    updatedAt: "2026-07-07",
    body: `## Comment fonctionnent les cotes

Une cote represente la probabilite estimee d'un evenement, exprimee en multiplicateur de mise :
- Cote 2.00 = 50% de probabilite implicite (1/2.00)
- Cote 3.00 = 33% de probabilite implicite (1/3.00)
- Cote 1.50 = 67% de probabilite implicite (1/1.50)

## La marge du bookmaker

La somme des probabilites implicites depasse toujours 100% (generalement 105-110%). Cette difference est la marge du bookmaker — son benefice garanti sur le long terme, quel que soit le resultat.

## Ce que les cotes revelent

Les cotes sont un excellent indicateur du favori et de l'equilibre d'un match :
- **Grosse difference** (1.20 vs 8.00) : match tres desequilibre, large favori
- **Cotes proches** (2.50 vs 2.80) : match equilibre, difficile a predire
- **Cote nul basse** (2.80-3.00) : les deux equipes se neutralisent souvent

## Principes du jeu responsable

- **Ne jamais miser plus qu'on peut perdre** : definir un budget strict
- **Pas de "rattrapage"** : augmenter les mises apres une perte est le chemin vers l'addiction
- **Le long terme** : les bookmakers sont toujours gagnants sur la duree grace a leur marge
- **Se fixer des limites** : temps, montants, frequence
- **Reconnaitre les signes** : si le jeu cesse d'etre un divertissement, c'est un probleme

## En France

Les paris sportifs sont encadres par l'ANJ (Autorite Nationale des Jeux). Seuls les operateurs agrees peuvent proposer des paris en ligne. L'age minimum est 18 ans. Des outils d'auto-exclusion existent sur chaque plateforme.

## A retenir

Les cotes ne predisent pas le resultat — elles refletent les probabilites estimees par le marche. Utilisez-les comme indicateur d'equilibre d'un match, pas comme garantie de resultat.`,
  },
  {
    slug: "culture-supporter",
    title: "Culture supporter : tifos, chants et ambiance de stade",
    description: "La culture supporter en football : tifos, ultras, chants, ambiance de stade et leur influence reelle sur les performances de l'equipe.",
    updatedAt: "2026-07-07",
    body: `## L'avantage du terrain : mythe ou realite ?

Les statistiques confirment un avantage mesurable pour l'equipe a domicile :
- En Ligue 1 : environ 45% de victoires a domicile, 27% nuls, 28% victoires exterieur
- En Premier League : ratio similaire (44%-26%-30%)
- Cet avantage a diminue post-COVID (huis clos) mais est revenu a la normale

## Les tifos : art visuel collectif

Un tifo est une animation visuelle geante deployee par les supporters avant le match :
- Banderoles, drapeaux, mosaiques de cartons colores
- Coordonnes par les groupes ultras (preparation de plusieurs semaines)
- Objectif : impressionner l'adversaire, galvaniser l'equipe, marquer les evenements

## Les chants et leur impact

Les chants collectifs creent une pression acoustique mesurable :
- **Anfield (Liverpool)** : "You'll Never Walk Alone" avant les matchs europeens
- **Velodrome (OM)** : ambiance constante pendant 90 minutes
- **Bollaert (Lens)** : le 12e homme reconnu par tous les visiteurs
- **Signal Iduna Park (Dortmund)** : le Mur Jaune (25 000 debout)

## Influence mesuree sur le jeu

Des etudes montrent que l'ambiance du stade influence :
- Les decisions arbitrales (leger biais en faveur de l'equipe locale)
- L'engagement physique des joueurs (plus de sprints, plus de duels)
- La gestion des moments-cles (l'equipe locale pousse plus en fin de match)

## En direct : quand l'ambiance change le match

Les matchs ou le stade "porte" l'equipe sont reconnaissables dans les statistiques :
- Concentration de tirs et corners en debut de match (impulsion du public)
- Buts en fin de premiere mi-temps ou debut de seconde (relance par les supporters)
- Peu de buts encaisses a domicile dans les 15 dernieres minutes (pression sur l'adversaire)

## Stades de reference en France

Velodrome (OM), Bollaert (Lens), Beaujoire (Nantes), Geoffroy-Guichard (Saint-Etienne) sont connus pour leur ambiance exceptionnelle qui influence directement les resultats.`,
  },
  {
    slug: "analyse-apres-match",
    title: "L'analyse apres-match : comment debriefer un resultat",
    description: "Guide pour analyser un match de football apres le coup de sifflet final : statistiques cles, contexte tactique et ce que le score ne dit pas.",
    updatedAt: "2026-07-07",
    body: `## Pourquoi analyser apres le match

Le score final est un resume extreme. Un 2-1 peut cacher une domination totale du perdant ou une victoire logique du vainqueur. L'analyse post-match permet de comprendre ce qui s'est reellement passe.

## Les statistiques a regarder en premier

### 1. Expected Goals (xG)
Compare le xG au score reel :
- xG 2.5 vs 1 but marque = enorme gachis offensif
- xG 0.5 vs 2 buts marques = hyper efficacite (ou chance)

### 2. Tirs et tirs cadres
Un ratio tirs cadres / tirs total superieur a 40% indique une bonne qualite de frappe.

### 3. Possession vs penetration
60% de possession avec 0 tir dans la surface = domination sterile.

### 4. Duels gagnes et fautes
Indiquent l'intensite physique et l'engagement des equipes.

## Les questions a se poser

1. **Le score reflete-t-il le jeu ?** (xG vs score reel)
2. **Qui a domine les moments-cles ?** (10 minutes autour de chaque but)
3. **Quel a ete le tournant ?** (but, carton rouge, remplacement)
4. **La fatigue a-t-elle joue ?** (buts apres 75e, baisse de pressing)
5. **Le plan tactique a-t-il fonctionne ?** (systeme, roles, ajustements)

## Les pieges a eviter

- **Resultatisme** : juger uniquement sur le score (un bon match peut etre perdu)
- **Biais de confirmation** : chercher des stats qui confirment son avis
- **Surinterpretation** : un match est un echantillon, pas une tendance

## Sur LiveFoot

Apres chaque match, revisitez la timeline des evenements. L'enchainement but > remplacement > tactique > but raconte une histoire que le score seul ne peut pas transmettre. Combinez chronologie et statistiques pour une analyse complete.`,
  },
];

export function getBySlug(slug: string): ContentItem | undefined {
  return articles.find((i) => i.slug === slug);
}
