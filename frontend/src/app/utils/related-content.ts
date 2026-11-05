import { articles } from '../content/articles';
import { guides } from '../content/guides';
import { teams } from '../content/teams';
import { competitions } from '../content/competitions';

export interface RelatedLink {
  label: string;
  path: string;
  type: 'article' | 'guide' | 'team' | 'competition';
}

const TEAM_COMPETITION_MAP: Record<string, string> = {
  psg: 'ligue-1',
  om: 'ligue-1',
  ol: 'ligue-1',
  lille: 'ligue-1',
  monaco: 'ligue-1',
  rennes: 'ligue-1',
  nice: 'ligue-1',
  lens: 'ligue-1',
  'real-madrid': 'la-liga',
  barcelona: 'la-liga',
  'atletico-madrid': 'la-liga',
  'man-city': 'premier-league',
  'man-united': 'premier-league',
  liverpool: 'premier-league',
  arsenal: 'premier-league',
  chelsea: 'premier-league',
  bayern: 'bundesliga',
  dortmund: 'bundesliga',
  juventus: 'serie-a',
  inter: 'serie-a',
};

const COMPETITION_TEAMS_MAP: Record<string, string[]> = {
  'ligue-1': ['psg', 'om', 'ol', 'lille', 'monaco', 'rennes', 'nice', 'lens'],
  'premier-league': ['man-city', 'liverpool', 'arsenal', 'chelsea', 'man-united'],
  'la-liga': ['real-madrid', 'barcelona', 'atletico-madrid'],
  'serie-a': ['juventus', 'inter'],
  bundesliga: ['bayern', 'dortmund'],
  'champions-league': ['real-madrid', 'barcelona', 'man-city', 'liverpool', 'bayern', 'psg'],
};

export function getRelatedForTeam(slug: string): RelatedLink[] {
  const links: RelatedLink[] = [];
  const compSlug = TEAM_COMPETITION_MAP[slug];
  if (compSlug) {
    const comp = competitions.find((c) => c.slug === compSlug);
    if (comp) links.push({ label: comp.name!, path: `/competitions/${compSlug}`, type: 'competition' });
  }

  const idx = teams.findIndex((t) => t.slug === slug);
  const neighbors = teams.filter((_, i) => i !== idx).slice(0, 3);
  for (const t of neighbors) {
    links.push({ label: t.name!, path: `/teams/${t.slug}`, type: 'team' });
  }

  links.push({ label: 'Analyses tactiques', path: '/news', type: 'article' });
  return links.slice(0, 5);
}

export function getRelatedForCompetition(slug: string): RelatedLink[] {
  const links: RelatedLink[] = [];
  const teamSlugs = COMPETITION_TEAMS_MAP[slug] ?? [];
  for (const ts of teamSlugs.slice(0, 4)) {
    const t = teams.find((x) => x.slug === ts);
    if (t) links.push({ label: t.name!, path: `/teams/${ts}`, type: 'team' });
  }
  links.push({ label: 'Guides football', path: '/guides', type: 'guide' });
  return links.slice(0, 5);
}

export function getRelatedForArticle(slug: string): RelatedLink[] {
  const links: RelatedLink[] = [];
  const idx = articles.findIndex((a) => a.slug === slug);
  const neighbors = articles.filter((_, i) => i !== idx);
  for (const a of [...neighbors.slice(idx, idx + 2), ...neighbors.slice(0, 1)]) {
    links.push({ label: a.title!, path: `/news/${a.slug}`, type: 'article' });
  }
  links.push({ label: 'Guides football', path: '/guides', type: 'guide' });
  links.push({ label: 'Scores en direct', path: '/en-direct', type: 'competition' });
  return links.slice(0, 5);
}

export function getRelatedForGuide(slug: string): RelatedLink[] {
  const links: RelatedLink[] = [];
  const idx = guides.findIndex((g) => g.slug === slug);
  const neighbors = guides.filter((_, i) => i !== idx);
  for (const g of [...neighbors.slice(idx, idx + 2), ...neighbors.slice(0, 1)]) {
    links.push({ label: g.title, path: `/guides/${g.slug}`, type: 'guide' });
  }
  links.push({ label: 'Actualites football', path: '/news', type: 'article' });
  links.push({ label: 'Scores en direct', path: '/en-direct', type: 'competition' });
  return links.slice(0, 5);
}
