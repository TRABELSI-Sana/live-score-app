export type ContentItem = {
  slug: string;
  title?: string;
  name?: string;
  description?: string;
  updatedAt: string;
  body: string;
};

export const teams: ContentItem[] = [
  {
    slug: "psg",
    name: "Paris Saint-Germain",
    description: "Suivez le PSG en direct : resultats Ligue 1, historique, style de jeu et analyse tactique du Paris Saint-Germain.",
    updatedAt: "2026-07-07",
    body: `Le Paris Saint-Germain, fonde en 1970, est le club le plus titre du football francais depuis le debut des annees 2010. Base au Parc des Princes (48 000 places) dans le 16e arrondissement de Paris, le PSG evolue en Ligue 1.

## Palmares et histoire

Avec plus de 10 titres de champion de France, le PSG domine le football hexagonal depuis le rachat par QSI en 2011. Le club a egalement remporte de nombreuses Coupes de France et Coupes de la Ligue. En Ligue des champions, le PSG a atteint la finale en 2020 et reste un candidat regulier aux demi-finales.

## Style de jeu

Le PSG s'appuie historiquement sur un effectif offensif de tres haut niveau. Le club privilegie la possession et le jeu de position, avec des ailiers rapides et un milieu technique capable de casser les lignes. En transition offensive, la vitesse des attaquants permet des contres devastateurs.

## Points cles pour suivre les matchs

Quand vous regardez un match du PSG en direct, observez la capacite de l'equipe a creer des decalages sur les cotes. Le rapport entre possession et occasions franches (xG) est souvent revelateur : une domination sterile indique un bloc adverse bien organise. A domicile au Parc des Princes, le PSG affiche generalement un taux de victoire superieur a 80%.

## Contexte actuel

Le PSG construit un projet collectif apres l'ere des superstars individuelles. L'accent est mis sur la formation, le collectif et la competitivite europeenne a long terme.`,
  },
  {
    slug: "om",
    name: "Olympique de Marseille",
    description: "Suivez l'OM en direct : resultats Ligue 1, actualite, style de jeu et histoire de l'Olympique de Marseille.",
    updatedAt: "2026-07-07",
    body: `L'Olympique de Marseille, fonde en 1899, est le club le plus populaire de France. Installe au Stade Velodrome (67 000 places), l'OM est le seul club francais a avoir remporte la Ligue des champions en 1993.

## Palmares et histoire

L'OM compte de nombreux titres de champion de France et reste marque par la victoire historique en Coupe d'Europe face au Milan AC a Munich. Le club a aussi atteint la finale de la Ligue Europa en 2018, confirmant sa dimension europeenne.

## Style de jeu

L'OM est traditionnellement un club offensif, porte par la ferveur de son public. Le pressing haut et l'intensite physique sont des marqueurs recurents du jeu marseillais. Le Velodrome impose un rythme que peu d'equipes visiteurs parviennent a gerer sur 90 minutes.

## Points cles pour suivre les matchs

En direct, surveillez l'impact du public sur le pressing marseillais : les periodes d'intensite coincident souvent avec les moments ou le Velodrome s'enflamme. La difference de rendement domicile/exterieur est historiquement plus marquee a l'OM que dans tout autre club de Ligue 1.

## Rivalites

Le Classique PSG-OM est le match le plus suivi du football francais. Les derbys regionaux contre Nice et les confrontations face a Lyon (Olympico) sont egalement des rencontres a haute intensite emotionnelle.`,
  },
  {
    slug: "ol",
    name: "Olympique Lyonnais",
    description: "Suivez l'OL en direct : resultats Ligue 1, 7 titres consecutifs, academie et analyse de l'Olympique Lyonnais.",
    updatedAt: "2026-07-07",
    body: `L'Olympique Lyonnais, fonde en 1950, a marque l'histoire du football francais en remportant 7 titres de champion consecutifs entre 2002 et 2008. Le club evolue au Groupama Stadium (59 000 places) a Decines-Charpieu.

## Palmares et histoire

Le cycle de domination lyonnais (2002-2008) reste unique dans le football francais moderne. Le club a egalement atteint les demi-finales de la Ligue des champions en 2010 et 2020, prouvant sa capacite a briller sur la scene europeenne.

## Style de jeu

L'OL est historiquement reconnu pour sa formation de haut niveau (Benzema, Lacazette, Fekir, Tolisso, Aouar). Le jeu lyonnais privilegie la technique, la construction depuis l'arriere et la qualite des transitions. Le milieu de terrain est souvent le secteur cle du dispositif.

## Points cles pour suivre les matchs

Observez la qualite technique des milieux et la capacite de l'OL a ressortir le ballon proprement sous pressing. Les statistiques de passes progressives et de creation d'occasions depuis le jeu sont souvent superieures a la moyenne de Ligue 1. L'OL est egalement un club qui performe bien en seconde periode grace a la profondeur de son banc.

## Academie

L'academie de l'OL est consideree comme la meilleure de France. Elle a produit des dizaines d'internationaux et reste un pilier du modele economique du club.`,
  },
  {
    slug: "lille",
    name: "LOSC Lille",
    description: "Suivez le LOSC en direct : resultats Ligue 1, titre 2021, formation et analyse tactique de Lille.",
    updatedAt: "2026-07-07",
    body: `Le LOSC Lille, fonde en 1944, est base au Stade Pierre-Mauroy (50 000 places) a Villeneuve-d'Ascq. Champion de France en 2021, le club a confirme son statut parmi l'elite du football francais.

## Palmares et histoire

Le titre de 2021, acquis devant le PSG lors d'une saison memorable, a rappele le doble de 2011 (Ligue 1 + Coupe de France). Le LOSC est un habitue des phases de groupes de Ligue des champions et constitue regulierement un adversaire redoutable sur la scene europeenne.

## Style de jeu

Le LOSC est reconnu pour son jeu de transitions rapides et son efficacite defensive. Le pressing organise a mi-hauteur et les contres eclairs sont des marques de fabrique. Le club s'appuie sur des joueurs rapides et puissants, capables de frapper en quelques passes apres une recuperation.

## Points cles pour suivre les matchs

En direct, observez le ratio entre possession et occasions creees : le LOSC accepte souvent de laisser le ballon pour mieux frapper en transition. Un xG eleve avec peu de possession est typique d'une bonne performance lilloise. Les victoires a l'exterieur sont un indicateur cle de la forme du LOSC.

## Modele economique

Le LOSC est repute pour sa capacite a recruter intelligemment et a revendre avec plus-value (Pepe, Osimhen, David). Ce modele permet au club de rester competitif malgre un budget inferieur aux cadors.`,
  },
  {
    slug: "monaco",
    name: "AS Monaco",
    description: "Suivez l'AS Monaco en direct : resultats Ligue 1, parcours europeen, jeunes talents et style offensif.",
    updatedAt: "2026-07-07",
    body: `L'AS Monaco, fondee en 1924, evolue au Stade Louis-II (18 500 places) dans la Principaute de Monaco. Le club est un pilier historique du football francais avec de nombreux titres de champion.

## Palmares et histoire

Monaco a atteint la finale de la Ligue des champions en 2004 et a realise un parcours epique en 2017 (demi-finale) avec une equipe spectaculaire (Mbappe, Bernardo Silva, Fabinho, Bakayoko). Le club a ete sacre champion en 2017, brisant la domination parisienne.

## Style de jeu

Monaco est traditionnellement un club offensif, base sur le developpement de jeunes talents. Le jeu rapide vers l'avant, la prise de risque et l'audace tactique sont des constantes du projet monegasque. Le 4-2-3-1 ou le 4-4-2 losange sont des systemes recurrents.

## Points cles pour suivre les matchs

Surveillez les statistiques offensives : buts par match, tirs par match et xG sont souvent au-dessus de la moyenne. Monaco est un club qui peut marquer contre n'importe qui mais qui peut aussi conceder beaucoup. Les matchs de Monaco sont rarement ennuyeux — le nombre de buts par rencontre est generalement eleve.

## Contexte actuel

Le club poursuit son modele base sur le developpement de jeunes joueurs a fort potentiel, recrutes tot et revendus aux plus grands clubs europeens apres 2-3 saisons de progression.`,
  },
  {
    slug: "rennes",
    name: "Stade Rennais",
    description: "Suivez le Stade Rennais en direct : resultats Ligue 1, Coupe de France 2019, formation bretonne et tactique.",
    updatedAt: "2026-07-07",
    body: `Le Stade Rennais, fonde en 1901, evolue au Roazhon Park (29 000 places). Le club breton s'est impose comme un acteur majeur du haut de tableau de la Ligue 1 depuis la fin des annees 2010.

## Palmares et histoire

La victoire en Coupe de France 2019 contre le PSG (aux tirs au but) reste un moment fondateur du Rennes moderne. Le club a ensuite participe a la Ligue des champions 2020-2021 et s'est installe regulierement dans les places europeennes.

## Style de jeu

Rennes privilegie un jeu de possession ambitieux avec des milieux techniques et des ailiers percutants. Le club investit dans la formation et dans des profils creatifs capables de desequilibrer dans les 30 derniers metres. La construction patiente est une marque de fabrique.

## Points cles pour suivre les matchs

Observez la maitrise technique au milieu et la qualite des circuits de passes. Rennes est souvent dominant en termes de possession mais peut manquer d'efficacite dans les matchs serres. Le ratio tirs/buts et la precision devant le but sont des indicateurs importants.

## Formation

Le centre de formation rennais est parmi les plus reputes de France. Il a revele des joueurs comme Dembele, Camavinga et de nombreux internationaux francais.`,
  },
  {
    slug: "nice",
    name: "OGC Nice",
    description: "Suivez l'OGC Nice en direct : resultats Ligue 1, Allianz Riviera, parcours recent et analyse tactique.",
    updatedAt: "2026-07-07",
    body: `L'OGC Nice, fonde en 1904, evolue a l'Allianz Riviera (36 000 places), stade moderne inaugure en 2013. Le club azureen est un habitue du haut de tableau de la Ligue 1 et a retrouve les competitions europeennes ces dernieres annees.

## Palmares et histoire

Nice compte 4 titres de champion de France, le dernier datant de 1959. Le club a connu un renouveau a partir de 2016 avec une 3e place et a confirme son ambition avec des investissements importants. La Conference League et la Ligue Europa sont devenues des rendez-vous reguliers.

## Style de jeu

Nice s'appuie sur une solidite defensive et une organisation rigoureuse. Le bloc compact et la discipline tactique permettent au club de rivaliser avec des effectifs plus chers. Le jeu direct et les transitions rapides sont privilegies, avec des ailiers capables d'eliminer en un-contre-un.

## Points cles pour suivre les matchs

En direct, surveillez la solidite du bloc defensif nicois : peu d'occasions concedees et un xG against (xGA) faible sont les indicateurs d'un bon match. A domicile a l'Allianz Riviera, Nice est particulierement difficile a manoeuvrer. Les victoires 1-0 ou 2-1 sont frequentes.

## Projet actuel

Le rachat par INEOS en 2019 a apporte une vision a long terme. Le club vise une installation durable dans le top 5 et des parcours europeens reguliers.`,
  },
  {
    slug: "lens",
    name: "RC Lens",
    description: "Suivez le RC Lens en direct : resultats Ligue 1, ambiance Bollaert, montee en puissance et analyse des Sang et Or.",
    updatedAt: "2026-07-07",
    body: `Le RC Lens, fonde en 1906, evolue au Stade Bollaert-Delelis (38 000 places) dans le Pas-de-Calais. Le club, porte par un public exceptionnel, s'est reinstalle dans l'elite apres sa remontee en 2020.

## Palmares et histoire

Champion de France en 1998, le RC Lens a connu des periodes en Ligue 2 avant un retour triomphal en Ligue 1. Depuis 2020, le club enchaine les bonnes saisons et a retrouve la Ligue des champions en 2023-2024, recompense d'une 2e place historique.

## Style de jeu

Le RC Lens est reconnu pour son intensite physique et son pressing agressif. Le jeu de Lens repose sur la course, l'engagement et la solidarite collective. Le club court plus que la plupart de ses adversaires et recupere le ballon haut. Le public de Bollaert amplifie cette intensite.

## Points cles pour suivre les matchs

Surveillez les kilometres parcourus et les recuperations hautes : ce sont les indicateurs-cles d'un RC Lens performant. Les Sang et Or sont particulierement dangereux en debut de match quand l'intensite est maximale. A domicile, l'ambiance de Bollaert cree un avantage mesurable (taux de victoire significativement superieur).

## Identite

Le RC Lens incarne le football populaire : un club ancre dans son territoire, porte par la passion de ses supporters et une identite de combat et de solidarite.`,
  },
  {
    slug: "real-madrid",
    name: "Real Madrid",
    description: "Suivez le Real Madrid en direct : resultats Liga, palmares Champions League record et analyse du plus grand club du monde.",
    updatedAt: "2026-07-07",
    body: `Le Real Madrid, fonde en 1902, est le club le plus titre de l'histoire de la Ligue des champions avec 15 trophees. Base au Santiago Bernabeu (81 000 places, renove en 2023), le club madrilene evolue en Liga espagnole.

## Palmares et histoire

15 Ligues des champions, 36 titres de Liga, 20 Coupes du Roi : le Real Madrid est le club le plus decore au monde. De Di Stefano a Cristiano Ronaldo en passant par Zidane, le club a toujours attire les plus grands joueurs de chaque generation.

## Style de jeu

Le Real Madrid s'adapte a chaque ere mais conserve des constantes : l'efficacite dans les grands matchs, la capacite a renverser des situations compromises et un mental d'acier en phase finale de competition. Le jeu madrilene combine possession patiente et accelerations devastatrices.

## Points cles pour suivre les matchs

En direct, observez la gestion des temps forts : le Real excelle dans l'art de frapper au bon moment, souvent en fin de match (la fameuse "remontada"). Les statistiques de buts marques apres la 75e minute sont historiquement superieures a la moyenne. Le Bernabeu reste une forteresse en Ligue des champions.

## Contexte actuel

Le Real Madrid poursuit son renouvellement de generation tout en maintenant l'exigence du plus haut niveau. Le nouveau Bernabeu symbolise cette ambition de rester la reference mondiale.`,
  },
  {
    slug: "barcelona",
    name: "FC Barcelona",
    description: "Suivez le FC Barcelone en direct : resultats Liga, tiki-taka, Masia et analyse du Barca au Camp Nou.",
    updatedAt: "2026-07-07",
    body: `Le FC Barcelona, fonde en 1899, est l'un des clubs les plus emblematiques du football mondial. Le club catalan evolue au nouveau Spotify Camp Nou (105 000 places), le plus grand stade d'Europe en cours de renovation.

## Palmares et histoire

5 Ligues des champions, 27 titres de Liga, et une philosophie de jeu qui a revolutionne le football mondial. L'ere Guardiola (2008-2012) avec Messi, Xavi et Iniesta a defini le tiki-taka et influence des generations d'entraineurs.

## Style de jeu

Le Barca est synonyme de jeu de possession, de passes courtes et de superiorite numerique au milieu. La Masia, centre de formation legendaire, produit des joueurs formes dans cette philosophie depuis l'enfance. Le pressing apres perte de balle (gegenpressing) est egalement un pilier tactique.

## Points cles pour suivre les matchs

Surveillez la possession et le nombre de passes dans le dernier tiers : un Barca dominant depasse souvent 65% de possession avec un reseau de passes tres dense. Les indicateurs de progression du ballon (passes progressives, carries) sont revelateurs. A domicile au Camp Nou, l'effet de la possession rend le Barca tres difficile a battre.

## La Masia

Le centre de formation du Barca a produit certains des meilleurs joueurs de l'histoire : Messi, Xavi, Iniesta, Busquets, Puyol. Cette tradition se poursuit avec de nouveaux talents qui emergent regulierement.`,
  },
  {
    slug: "atletico-madrid",
    name: "Atletico de Madrid",
    description: "Suivez l'Atletico Madrid en direct : resultats Liga, solidite defensive legendaire et analyse du Cholismo.",
    updatedAt: "2026-07-07",
    body: `L'Atletico de Madrid, fonde en 1903, evolue au Civitas Metropolitano (68 000 places). Sous la direction de Diego Simeone depuis 2011, le club est devenu l'un des meilleurs au monde grace a une identite defensive unique.

## Palmares et histoire

Champion de Liga en 2014 et 2021, finaliste de la Ligue des champions en 2014 et 2016, l'Atletico s'est impose comme un outsider capable de detroner les geants. Le club a remporte de nombreuses Ligues Europa et s'est installe au plus haut niveau europeen.

## Style de jeu — Le Cholismo

L'Atletico de Simeone est bati sur la rigueur defensive, l'intensite au duel et la solidarite collective. Le bloc bas bien organise, le pressing par sequences et l'efficacite sur coups de pied arretes sont les armes principales. Chaque point se merite, chaque match se dispute comme une finale.

## Points cles pour suivre les matchs

En direct, comptez les occasions concedees (generalement tres peu) et observez l'efficacite sur les situations de jeu arrete. Un xGA (buts attendus contre) tres bas est la signature d'un bon match de l'Atletico. Les victoires 1-0 avec un but sur corner ou coup franc sont un classique du Cholismo.

## Philosophie

"Partido a partido" (match apres match) resume la mentalite de l'Atletico : pas de raccourci, pas de suffisance, une concentration totale sur le prochain adversaire. Cette regularite permet au club de rivaliser avec des budgets bien superieurs.`,
  },
  {
    slug: "man-city",
    name: "Manchester City",
    description: "Suivez Manchester City en direct : resultats Premier League, ere Guardiola, treble 2023 et domination tactique.",
    updatedAt: "2026-07-07",
    body: `Manchester City, fonde en 1880, evolue a l'Etihad Stadium (53 000 places). Depuis le rachat par le City Football Group en 2008 et l'arrivee de Pep Guardiola en 2016, le club domine la Premier League.

## Palmares et histoire

Multiple champion d'Angleterre, City a realise le treble historique en 2023 (Premier League, FA Cup, Ligue des champions). C'est le premier club anglais a accomplir cet exploit depuis Manchester United en 1999. L'ere Guardiola a produit certaines des meilleures equipes de l'histoire du football anglais.

## Style de jeu

Le City de Guardiola est la reference mondiale du jeu de position. Possession extreme (souvent >65%), faux 9, inversions de roles, et une fluidite tactique qui rend l'equipe imprevisible malgre la domination du ballon. Les arrieres lateraux se transforment en milieux, les milieux en faux ailiers.

## Points cles pour suivre les matchs

En direct, observez la rotation des positions et la surcharge d'un cote avant le changement de jeu eclair. Les statistiques de possession, passes dans le dernier tiers et expected goals sont generalement ecrasantes. Un City a 70%+ de possession avec un xG superieur a 2.0 est en mode croisiere.

## Impact Guardiola

L'influence tactique de Guardiola sur City a redessine les standards de la Premier League. La capacite a gagner en controlant totalement le jeu — plutot qu'en reactions — est la marque distinctive de cette equipe.`,
  },
  {
    slug: "man-united",
    name: "Manchester United",
    description: "Suivez Manchester United en direct : resultats Premier League, histoire d'Old Trafford et reconstruction des Red Devils.",
    updatedAt: "2026-07-07",
    body: `Manchester United, fonde en 1878, est l'un des clubs les plus celebres au monde. Base a Old Trafford (74 000 places), surnomme le "Theatre of Dreams", United est le club le plus titre d'Angleterre.

## Palmares et histoire

20 titres de champion, 3 Ligues des champions et un treble legendaire en 1999 sous Sir Alex Ferguson. L'ere Ferguson (1986-2013) a defini les standards du club : excellence, mentalite de vainqueur et capacite a renverser les matchs dans le temps additionnel (le fameux "Fergie Time").

## Style de jeu

Historiquement, Manchester United privilegie un jeu offensif avec des ailiers rapides et un jeu direct vers la surface adverse. La tradition du club favorise les attaquants spectaculaires (Best, Cantona, Ronaldo, Rooney) et un football engage qui va de l'avant.

## Points cles pour suivre les matchs

A Old Trafford, surveillez la pression mise sur l'adversaire dans les 20 premieres minutes — quand United prend les devants, le Theatre of Dreams pousse et le club est difficile a rattraper. A l'exterieur, la capacite a gerer les fins de match est un indicateur cle de la forme actuelle.

## Reconstruction

Apres le depart de Ferguson, United cherche a retrouver son niveau d'antan. Le club dispose de l'un des budgets les plus importants du football mondial et travaille a batir un projet coherent a long terme.`,
  },
  {
    slug: "liverpool",
    name: "Liverpool",
    description: "Suivez Liverpool en direct : resultats Premier League, 6 Ligue des champions, Anfield et le gegenpressing des Reds.",
    updatedAt: "2026-07-07",
    body: `Liverpool, fonde en 1892, evolue a Anfield (61 000 places apres agrandissement). Le club est l'un des plus titres d'Europe avec 6 Ligues des champions et une histoire emotionnelle unique dans le football.

## Palmares et histoire

6 Ligues des champions (dont la remontee epique contre le Barca en 2019), 19 titres de champion et la victoire tant attendue en Premier League en 2020 apres 30 ans d'attente. Istanbul 2005 reste l'une des plus grandes finales de l'histoire du football.

## Style de jeu

Liverpool est synonyme d'intensite : pressing haut coordonne (gegenpressing), transitions eclairs et un rythme de jeu suffocant pour l'adversaire. Les lateraux offensifs (Alexander-Arnold, Robertson) sont des createurs cles, et le trio d'attaque combine vitesse et technique.

## Points cles pour suivre les matchs

En direct, mesurez le PPDA (passes par action defensive) : un Liverpool performant presse tres haut et recupere en moins de 6 secondes apres la perte. Les buts marques dans les 15 premieres minutes sont frequents quand le pressing fonctionne. Anfield et le "You'll Never Walk Alone" creent un avantage psychologique mesurable.

## Anfield

L'atmosphere d'Anfield, notamment lors des soirees de Ligue des champions, est consideree comme l'une des plus intenses au monde. Le Kop est le coeur battant du club.`,
  },
  {
    slug: "arsenal",
    name: "Arsenal",
    description: "Suivez Arsenal en direct : resultats Premier League, Emirates Stadium, ere Arteta et retour au sommet des Gunners.",
    updatedAt: "2026-07-07",
    body: `Arsenal, fonde en 1886, evolue a l'Emirates Stadium (60 000 places) dans le nord de Londres. Le club est l'un des plus constants de l'histoire anglaise avec une presence ininterrompue dans l'elite depuis 1919.

## Palmares et histoire

13 titres de champion dont la saison "Invincibles" de 2003-2004 (38 matchs, 0 defaite), un record unique dans le football anglais moderne. L'ere Arsene Wenger (1996-2018) a transforme le club et le football anglais avec un jeu de passes revolutionnaire pour l'epoque.

## Style de jeu

Sous Mikel Arteta, Arsenal a combine la tradition de jeu au sol avec une intensite et une rigueur defensives modernes. La construction methodique depuis l'arriere, les mouvements coordonnes et le pressing structure font d'Arsenal l'une des equipes les plus plaisantes a regarder en Premier League.

## Points cles pour suivre les matchs

Observez les rotations au milieu et les mouvements des milieux relayeurs dans le demi-espace. Un Arsenal performant montre une superiorite dans la creation depuis le jeu (plutot que sur coups de pied arretes). Le ratio buts dans le jeu / buts sur situations arretees est un bon indicateur de la qualite du football produit.

## Renouveau

Le projet Arteta a transforme Arsenal d'un pretendant au top 4 en un candidat au titre, s'appuyant sur un groupe jeune et en constante progression.`,
  },
  {
    slug: "chelsea",
    name: "Chelsea",
    description: "Suivez Chelsea en direct : resultats Premier League, Stamford Bridge, titres europeens et rebuild des Blues.",
    updatedAt: "2026-07-07",
    body: `Chelsea, fonde en 1905, evolue a Stamford Bridge (40 000 places) dans le quartier de Fulham a Londres. Le club a connu une transformation majeure depuis 2003 et l'arrivee de Roman Abramovich, devenant un poids lourd du football europeen.

## Palmares et histoire

2 Ligues des champions (2012, 2021), 6 titres de Premier League et de multiples trophees europeens. La victoire en 2012 contre le Bayern a Munich reste un exploit monumental, tout comme le sacre de 2021 sous Thomas Tuchel, seulement quelques mois apres son arrivee.

## Style de jeu

Chelsea est historiquement un club pragmatique : solidite defensive, gestion intelligente des matchs et efficacite en contre. Le club a la capacite de s'adapter a differents styles selon l'entraineur, passant du jeu ultra-defensif (Mourinho) au pressing moderne (Tuchel).

## Points cles pour suivre les matchs

A Stamford Bridge, surveillez la compacite du bloc et la qualite des transitions. Chelsea est un club qui gagne souvent les grands matchs grace a la discipline tactique plutot qu'a la domination. Les clean sheets et les buts en contre-attaque sont des signatures classiques.

## Reconstruction

Le rachat par le consortium Boehly/Clearlake en 2022 a ouvert une nouvelle ere avec des investissements massifs dans l'effectif. Le club travaille a stabiliser un projet coherent sur le long terme.`,
  },
  {
    slug: "bayern",
    name: "Bayern Munich",
    description: "Suivez le Bayern Munich en direct : resultats Bundesliga, domination allemande et 6 Ligues des champions.",
    updatedAt: "2026-07-07",
    body: `Le Bayern Munich, fonde en 1900, evolue a l'Allianz Arena (75 000 places). Le club est la reference absolue du football allemand et l'un des clubs les plus puissants au monde.

## Palmares et histoire

6 Ligues des champions, plus de 30 Bundesligas et une domination quasi-ininterrompue du football allemand depuis les annees 1970. Le Bayern a remporte le sextuple en 2020 (tous les trophees possibles en une saison), un exploit rarissime dans l'histoire du football.

## Style de jeu

Le Bayern combine puissance physique et qualite technique germanique. Le pressing haut, la possession dominante et les lateraux offensifs sont des constantes. Le club attire les meilleurs joueurs de Bundesliga et maintient un niveau de competition interne intense.

## Points cles pour suivre les matchs

En direct, observez la superiorite territoriale : le Bayern impose souvent le jeu dans le camp adverse pendant de longues periodes. Les statistiques de possession dans le dernier tiers et le nombre de centres sont des indicateurs cles. En Bundesliga, le Bayern marque frequemment 3+ buts par match.

## Modele

Le Bayern est repute pour sa gestion financiere saine (pas de dette, actionnariat 51% des membres) tout en restant ultra-competitif. Le club combine tradition, stabilite et excellence sportive.`,
  },
  {
    slug: "dortmund",
    name: "Borussia Dortmund",
    description: "Suivez le Borussia Dortmund en direct : resultats Bundesliga, Mur Jaune, jeunes talents et spectacle au Signal Iduna Park.",
    updatedAt: "2026-07-07",
    body: `Le Borussia Dortmund, fonde en 1909, evolue au Signal Iduna Park (81 000 places), le plus grand stade d'Allemagne. Le "Mur Jaune" (Sudtribune, 25 000 debout) est la plus grande tribune debout d'Europe.

## Palmares et histoire

Champion d'Europe en 1997, multiple champion d'Allemagne et finaliste de la Ligue des champions en 2013 et 2024. Le BVB est le principal rival du Bayern Munich et le symbole du football populaire allemand.

## Style de jeu

Le Dortmund est historiquement un club spectaculaire : attaques rapides, jeu vertical et intensite emotionnelle. Le club excelle dans le developpement de jeunes attaquants (Haaland, Bellingham, Sancho, Dembele, Pulisic) et produit un football tourne vers l'avant.

## Points cles pour suivre les matchs

Surveillez le nombre de sprints et de courses intensives : le BVB est l'une des equipes les plus rapides d'Europe en transition. A domicile, le Mur Jaune cree une pression acoustique qui destabilise les adversaires — le taux de victoire au Signal Iduna Park est parmi les plus eleves d'Europe. Les matchs du BVB sont souvent riches en buts.

## Identite

Dortmund incarne le football authentique : un club ne dans un bassin ouvrier, porte par 80 000 supporters passionnes, qui privilegie le spectacle et la formation plutot que les depenses illimitees.`,
  },
  {
    slug: "juventus",
    name: "Juventus",
    description: "Suivez la Juventus en direct : resultats Serie A, record de Scudetti, tradition defensive et histoire de la Vieille Dame.",
    updatedAt: "2026-07-07",
    body: `La Juventus, fondee en 1897, evolue a l'Allianz Stadium (41 000 places) a Turin. Surnommee la "Vieille Dame", la Juve est le club le plus titre d'Italie avec 36 Scudetti.

## Palmares et histoire

36 titres de Serie A (dont 9 consecutifs de 2012 a 2020), 2 Ligues des champions et une serie de finales europeennes. La Juventus a domine le football italien de maniere quasi-ininterrompue et reste la reference en termes de constance sur une saison.

## Style de jeu

La Juve est historiquement batie sur la solidite defensive — le "catenaccio" moderne. Les grands defenseurs (Scirea, Cannavaro, Chiellini, Bonucci) ont fait la legende du club. Le pragmatisme, la gestion des matchs et l'efficacite dans les moments-cles sont les marques de fabrique.

## Points cles pour suivre les matchs

En direct, observez la gestion des avantages : la Juve excelle a "tuer" les matchs une fois devant au score. Le nombre de clean sheets par saison est un indicateur historique de la sante de l'equipe. Les victoires 1-0 et 2-1 sont tres frequentes — la Juve gagne rarement par 4 buts mais perd encore plus rarement.

## Tradition

La Juventus attire les meilleurs joueurs italiens de chaque generation et reste le club de reference pour les joueurs qui veulent gagner en Serie A. La culture du travail et l'exigence quotidienne definissent l'institution.`,
  },
  {
    slug: "inter",
    name: "Inter Milan",
    description: "Suivez l'Inter Milan en direct : resultats Serie A, triplete 2010, derby della Madonnina et renouveau nerazzurro.",
    updatedAt: "2026-07-07",
    body: `L'Inter Milan, fondee en 1908, evolue a San Siro (75 000 places), stade partage avec le rival AC Milan. Le club nerazzurro est l'un des trois seuls clubs italiens a n'avoir jamais ete relegue.

## Palmares et histoire

3 Ligues des champions dont le triplete historique en 2010 sous Jose Mourinho (Scudetto + Coupe d'Italie + Ligue des champions), 20 Scudetti et une rivalite seculaire avec le Milan AC et la Juventus. L'Inter est le club des "pazzi" (les fous) — toujours spectaculaire, jamais previsible.

## Style de jeu

L'Inter moderne s'appuie sur un 3-5-2 efficace avec des pistons qui couvrent tout le couloir. La solidite de la charniere a trois et la qualite des milieux relayeurs permettent une construction patiente. L'attaque repose souvent sur une paire d'attaquants complementaires (un pivot, un rapide).

## Points cles pour suivre les matchs

Surveillez le rendement des pistons (kilometres parcourus, centres, duels gagnes) et la maitrise du milieu a trois. Un Inter dominant controle le tempo et ne laisse que des miettes a l'adversaire. Le Derby della Madonnina (Inter vs Milan) est l'un des plus intenses au monde — les statistiques habituelles ne s'y appliquent pas.

## Renaissance

Apres des annees de transition post-Mourinho, l'Inter est revenue au plus haut niveau en remportant le Scudetto et en atteignant la finale de la Ligue des champions 2023. Le club est redevenu un serieux pretendant europeen.`,
  },
];

export function getBySlug(slug: string): ContentItem | undefined {
  return teams.find((i) => i.slug === slug);
}
