import type { Scholarship } from "../types";
import { COMMUNAUTE_FWB } from "../bourses/belgium-deadlines";

/** Programmes belges majeurs (hors sync Study in Belgium). */
export const BELGIUM_CURATED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "belgium-ares-master-stage",
    nom: "Bourses de master et de stage de l'ARES",
    paysHote: "Belgique",
    cyclesFinances: ["master"],
    niveauDisponible: ["Master", "Stage de spécialisation"],
    dateCloture: "2027-01-15",
    avantages: [
      "130+ bourses master / an",
      "70+ bourses stage (4–6 mois)",
      "Allocation ~1 500 €/mois, frais d'inscription, voyage, assurance",
    ],
    conditionsEligibilite: [
      "Ressortissants de pays en développement",
      "Master de spécialisation 1 an ou stage 4–6 mois en FWB",
      "Ouverture : septembre/octobre — clôture : décembre/janvier",
    ],
    lienOfficiel:
      "https://www.studyinbelgium.be/fr/bourses/bourses-de-master-et-de-stage-de-lares",
    status: "a_venir",
    source: "curated",
    organisme: "ARES",
    communaute: COMMUNAUTE_FWB,
    langueEnseignement: "Français",
    allocationMensuelle: 1500,
    nationalitesEligibles: ["Pays en développement"],
  },
  {
    id: "belgium-study-in-belgium",
    nom: "Study in Belgium — annuaire FWB (Wallonie-Bruxelles)",
    paysHote: "Belgique",
    cyclesFinances: ["undergraduate", "master", "doctorate"],
    niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
    dateCloture: "2026-09-30",
    avantages: [
      "Portail officiel des bourses francophones",
      "ARES, FNRS, WBI, Erasmus Mundus, AUF…",
    ],
    conditionsEligibilite: [
      "Filtrer par communauté : francophone vs flamande",
      "Programmes dispensés en français en Fédération Wallonie-Bruxelles",
    ],
    lienOfficiel: "https://www.studyinbelgium.be/fr/bourses",
    status: "encours",
    source: "curated",
    organisme: "Wallonie-Bruxelles International",
    communaute: COMMUNAUTE_FWB,
    langueEnseignement: "Français",
    nationalitesEligibles: ["Toutes nationalités"],
  },
];
