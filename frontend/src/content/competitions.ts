export type ContentItem = {
  slug: string;
  title?: string;
  name?: string;
  description?: string;
  updatedAt: string;
  body: string;
};

export const competitions: ContentItem[] = [
  {
    slug: `ligue-1`,
    name: `Ligue 1`,
    description: `Suivez la Ligue 1 en direct : resultats, classement, scores des matchs du championnat de France en temps reel.`,
    updatedAt: `2026-07-07`,
    body: `La Ligue 1, organisée par la Ligue de Football Professionnel, constitue l’élite du football en France. Depuis la réforme récente, 18 clubs disputent le championnat sur 34 journées, en matches aller-retour.

Issue de l’ancienne Division 1 créée en 1932, la compétition a progressivement changé de format, de nom et de gouvernance pour s’adapter au football moderne. Elle reste le principal accès français vers les compétitions européennes.

Le palmarès met en avant des cycles très différents selon les époques: Saint-Étienne et Marseille ont marqué l’histoire, Lyon a dominé les années 2000, puis Paris a installé une longue période de suprématie nationale.

Pour analyser une saison de Ligue 1, il faut suivre le trio points-différence de buts-dynamique récente. Cet angle permet de distinguer une vraie tendance sportive d’une simple série de résultats isolés.`,
  },
  {
    slug: `premier-league`,
    name: `Premier League`,
    description: `Suivez la Premier League en direct : resultats, classement, scores du championnat d'Angleterre en temps reel.`,
    updatedAt: `2026-07-07`,
    body: `La Premier League est le championnat de première division en Angleterre. Elle réunit 20 équipes et fonctionne sur 38 journées, avec un système de promotion-relégation connecté à l’English Football League.

Lancée en 1992 à la place de la First Division, elle s’est construite sur une forte exposition internationale. Les accords audiovisuels, la modernisation des stades et l’attractivité des effectifs ont accéléré son rayonnement mondial.

Son histoire récente est rythmée par des rivalités majeures: Manchester United, Arsenal, Chelsea, Liverpool et Manchester City ont porté des périodes dominantes différentes, avec des styles de jeu parfois opposés.

Sur le plan tactique, la Premier League est souvent associée à une intensité élevée et à des transitions rapides. Pour juger la solidité d’un club, la comparaison domicile/extérieur reste l’un des indicateurs les plus fiables.`,
  },
  {
    slug: `champions-league`,
    name: `UEFA Champions League`,
    description: `Suivez la Ligue des champions en direct : resultats, scores, groupes et parcours des clubs en coupe d’Europe.`,
    updatedAt: `2026-07-07`,
    body: `La Ligue des champions de l’UEFA est la plus prestigieuse competition annuelle entre clubs europeens. Les participants sont qualifies selon leurs resultats en championnat national, puis confrontes dans un format melant phase de ligue et elimination directe.

Elle prolonge la Coupe des clubs champions europeens nee en 1955, avant de prendre sa forme moderne dans les annees 1990. Cette evolution a elargi la representation des ligues et multiplie les affiches de tres haut niveau.

Le Real Madrid detient le record de titres (15), mais d’autres institutions comme Milan, Liverpool, le Bayern Munich ou le FC Barcelone ont aussi ecrit des chapitres decisifs de la competition.

Depuis 2024, le nouveau format a 36 equipes en ligue unique a remplace les groupes de 4. Chaque equipe joue 8 matchs contre des adversaires differents, ce qui produit plus de matchs a enjeu et elimine les rencontres sans interet en fin de phase de groupes.`,
  },
  {
    slug: `la-liga`,
    name: `La Liga`,
    description: `Suivez la Liga espagnole en direct : resultats, classement, scores de Real Madrid, Barca et Atletico en temps reel.`,
    updatedAt: `2026-07-07`,
    body: `La Liga est le championnat de premiere division en Espagne. Elle reunit 20 equipes et fonctionne sur 38 journees en matchs aller-retour, avec promotion-relegation connectee a la Segunda Division.

Historiquement dominee par le Real Madrid et le FC Barcelona (le fameux duopole), la Liga a vu l’Atletico de Madrid s’imposer comme un troisieme force depuis les annees 2010. D’autres clubs comme le Villarreal, la Real Sociedad ou le Betis Seville contribuent a la richesse tactique du championnat.

La Liga est reputee pour la qualite technique de son football : jeu de passes, maitrise du tempo et intelligence tactique. C’est traditionnellement un championnat ou la possession et la construction depuis l’arriere sont valorisees, meme si les styles ont evolue ces dernieres annees.

Critere de departage specifique : en Liga, les confrontations directes priment sur la difference de buts generale. Cela signifie qu’un match entre deux equipes a egalite de points peut etre determinant pour le classement final, ce qui ajoute du piment a chaque confrontation directe entre concurrents.`,
  },
  {
    slug: `serie-a`,
    name: `Serie A`,
    description: `Suivez la Serie A italienne en direct : resultats, classement, scores de la Juventus, Inter, Milan et Naples en temps reel.`,
    updatedAt: `2026-07-07`,
    body: `La Serie A est le championnat de premiere division en Italie. Elle reunit 20 equipes sur 38 journees en format aller-retour. C’est l’un des championnats les plus anciens et les plus tactiques au monde.

L’Italie est le berceau du catenaccio (defense de zone ultra-organisee) et a produit certains des meilleurs defenseurs et tacticiens de l’histoire du football. La Juventus domine le palmares avec 36 Scudetti, suivie par l’Inter et le Milan AC.

Ces dernieres annees, la Serie A a retrouve sa competitivite avec des champions differents (Naples 2023, Inter 2024) et un niveau tactique toujours eleve. Le championnat attire a nouveau des talents internationaux de premier plan.

Critere de departage specifique : comme en Liga, la Serie A utilise les confrontations directes avant la difference de buts. Cela rend les matchs entre concurrents directs encore plus decisifs pour le classement final. Les derbys (Milan, Rome, Turin) sont parmi les plus intenses d’Europe.`,
  },
];

export function getBySlug(slug: string): ContentItem | undefined {
  return competitions.find((i) => i.slug === slug);
}
