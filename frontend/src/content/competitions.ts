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
    updatedAt: `2026-03-04`,
    body: `La Ligue 1, organisée par la Ligue de Football Professionnel, constitue l’élite du football en France. Depuis la réforme récente, 18 clubs disputent le championnat sur 34 journées, en matches aller-retour.

Issue de l’ancienne Division 1 créée en 1932, la compétition a progressivement changé de format, de nom et de gouvernance pour s’adapter au football moderne. Elle reste le principal accès français vers les compétitions européennes.

Le palmarès met en avant des cycles très différents selon les époques: Saint-Étienne et Marseille ont marqué l’histoire, Lyon a dominé les années 2000, puis Paris a installé une longue période de suprématie nationale.

Pour analyser une saison de Ligue 1, il faut suivre le trio points-différence de buts-dynamique récente. Cet angle permet de distinguer une vraie tendance sportive d’une simple série de résultats isolés.`,
  },
  {
    slug: `premier-league`,
    name: `Premier League`,
    updatedAt: `2026-03-04`,
    body: `La Premier League est le championnat de première division en Angleterre. Elle réunit 20 équipes et fonctionne sur 38 journées, avec un système de promotion-relégation connecté à l’English Football League.

Lancée en 1992 à la place de la First Division, elle s’est construite sur une forte exposition internationale. Les accords audiovisuels, la modernisation des stades et l’attractivité des effectifs ont accéléré son rayonnement mondial.

Son histoire récente est rythmée par des rivalités majeures: Manchester United, Arsenal, Chelsea, Liverpool et Manchester City ont porté des périodes dominantes différentes, avec des styles de jeu parfois opposés.

Sur le plan tactique, la Premier League est souvent associée à une intensité élevée et à des transitions rapides. Pour juger la solidité d’un club, la comparaison domicile/extérieur reste l’un des indicateurs les plus fiables.`,
  },
  {
    slug: `champions-league`,
    name: `UEFA Champions League`,
    updatedAt: `2026-03-04`,
    body: `La Ligue des champions de l’UEFA est la plus prestigieuse compétition annuelle entre clubs européens. Les participants sont qualifiés selon leurs résultats en championnat national, puis confrontés dans un format mêlant phase de ligue et élimination directe.

Elle prolonge la Coupe des clubs champions européens née en 1955, avant de prendre sa forme moderne dans les années 1990. Cette évolution a élargi la représentation des ligues et multiplié les affiches de très haut niveau.

Le Real Madrid détient le record de titres, mais d’autres institutions comme Milan, Liverpool, le Bayern Munich ou le FC Barcelone ont aussi écrit des chapitres décisifs de la compétition.

En phase finale, chaque détail pèse lourd: gestion des temps faibles, efficacité sur coups de pied arrêtés et maîtrise émotionnelle. À ce niveau, une double confrontation peut basculer sur une seule occasion nette.`,
  },
];

export function getBySlug(slug: string): ContentItem | undefined {
  return competitions.find((i) => i.slug === slug);
}
