export type SeoFaq = {
  question: string;
  answer: string;
};

export const homeFaqs: SeoFaq[] = [
  {
    question: "Comment suivre un match de football en direct ?",
    answer: "La page d'accueil et la page en direct affichent les scores, statuts, buts, cartons et evenements principaux des matchs disponibles.",
  },
  {
    question: "Les scores sont-ils mis a jour automatiquement ?",
    answer: "Oui, les donnees de live sont rafraichies regulierement afin de suivre l'evolution des matchs sans recharger la page.",
  },
  {
    question: "Quelles competitions sont couvertes ?",
    answer: "LiveFoot couvre les grandes competitions europeennes et internationales, notamment Ligue 1, Premier League, Liga, Serie A et Ligue des champions.",
  },
];

export const liveFaqs: SeoFaq[] = [
  {
    question: "Que signifie un statut comme NS, HT ou FT ?",
    answer: "NS indique un match pas encore commence, HT indique la mi-temps et FT indique un match termine.",
  },
  {
    question: "Pourquoi un score peut-il changer apres un but ?",
    answer: "Un score peut etre corrige apres verification, but refuse, erreur de feuille de match ou mise a jour du fournisseur de donnees.",
  },
  {
    question: "Les donnees live remplacent-elles une source officielle ?",
    answer: "Non. Le live sert au suivi en temps reel, mais les resultats officiels restent ceux valides par les competitions et instances concernees.",
  },
];

export const teamsFaqs: SeoFaq[] = [
  {
    question: "Comment choisir une equipe a suivre ?",
    answer: "Utilisez les pages equipes pour retrouver l'historique, le style de jeu, les points d'analyse et les liens vers les scores en direct.",
  },
  {
    question: "Les pages equipes sont-elles utiles pendant un match ?",
    answer: "Oui, elles donnent du contexte sur le club et completent le live avec des reperes tactiques, historiques et statistiques.",
  },
];

export const competitionsFaqs: SeoFaq[] = [
  {
    question: "Pourquoi les formats de competitions changent-ils ?",
    answer: "Les formats evoluent selon les decisions des ligues et federations, le nombre d'equipes, les droits TV et les calendriers europeens.",
  },
  {
    question: "Ou retrouver les scores d'une competition ?",
    answer: "La page en direct regroupe les matchs disponibles par competition, avec les scores et les evenements mis a jour regulierement.",
  },
];
