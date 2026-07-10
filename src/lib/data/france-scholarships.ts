import type { Scholarship } from "../types";

/** Programmes français majeurs (hors catalogue CampusBourses). */
export const FRANCE_CURATED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "france-eiffel",
    nom: "Programme de bourses d'excellence Eiffel",
    paysHote: "France",
    cyclesFinances: ["master", "doctorate"],
    niveauDisponible: ["Master", "Doctorat"],
    dateCloture: "2027-01-08",
    avantages: ["Allocation mensuelle", "Frais de voyage", "Couverture santé"],
    conditionsEligibilite: [
      "Ouverture des candidatures : octobre",
      "Clôture : janvier (rentrée suivante)",
      "Excellence académique internationale",
    ],
    lienOfficiel: "https://www.campusfrance.org/fr/le-programme-des-bourses-eiffel",
    status: "a_venir",
    source: "curated",
    nationalitesEligibles: ["Toutes nationalités"],
  },
  {
    id: "france-crous-dse",
    nom: "Bourses sur critères sociaux (CROUS / DSE)",
    paysHote: "France",
    cyclesFinances: ["undergraduate", "master", "doctorate"],
    niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
    dateCloture: "2026-05-31",
    avantages: ["Aide annuelle sur critères sociaux", "Accès aux logements CROUS"],
    conditionsEligibilite: [
      "Étudiants inscrits en France",
      "Dossier social étudiant (DSE) avant le 31 mai",
      "Plus de 660 000 boursiers/an",
    ],
    lienOfficiel: "https://www.crous.fr",
    status: "fermee",
    source: "curated",
    nationalitesEligibles: ["France"],
  },
  {
    id: "france-campus-bourses",
    nom: "CampusBourses — annuaire officiel (380+ programmes)",
    paysHote: "France",
    cyclesFinances: ["undergraduate", "master", "doctorate"],
    niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
    dateCloture: "2026-08-31",
    avantages: [
      "380 programmes référencés",
      "Ambassades, régions, écoles, fondations",
      "Recherche par nationalité et niveau",
    ],
    conditionsEligibilite: ["Filtrer selon votre nationalité sur CampusBourses"],
    lienOfficiel: "https://campusbourses.campusfrance.org/#/catalog?lang=fr",
    status: "encours",
    source: "curated",
    nationalitesEligibles: ["Toutes nationalités"],
  },
];
