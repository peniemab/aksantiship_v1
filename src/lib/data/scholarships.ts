import type { Scholarship } from "../types";

/**
 * Données bourses (source temporaire).
 * Consommées uniquement via `lib/bourses/repository.ts` et l'API `/api/bourses`.
 * À migrer vers PostgreSQL/Supabase en phase 2.
 */

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "turkiye-burslari",
    nom: "Turkiye Burslari",
    paysHote: "Turquie",
    cyclesFinances: ["undergraduate", "master", "doctorate"],
    niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
    dateCloture: "2026-03-15",
    avantages: [
      "Frais de scolarité couverts",
      "Allocation mensuelle",
      "Logement et assurance santé",
      "Billet d'avion aller-retour",
    ],
    conditionsEligibilite: [
      "Âge maximum 21 ans (licence), 30 ans (master)",
      "Moyenne minimale de 70%",
      "Diplôme requis selon le cycle visé",
    ],
    lienOfficiel: "https://www.turkiyeburslari.gov.tr",
    status: "encours",
  },
  {
    id: "roumanie-mae",
    nom: "Bourse du Ministère des Affaires Étrangères Roumain",
    paysHote: "Roumanie",
    cyclesFinances: ["undergraduate", "master", "doctorate"],
    niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
    dateCloture: "2026-04-20",
    avantages: [
      "Exonération des frais de scolarité",
      "Allocation mensuelle",
      "Hébergement en résidence universitaire",
    ],
    conditionsEligibilite: [
      "Moyenne minimale de 70% au dernier diplôme",
      "Bac minimum pour undergraduate, licence pour master",
      "Âge maximum 35 ans",
    ],
    lienOfficiel: "https://www.mae.ro",
    status: "encours",
  },
  {
    id: "programme-excellentia",
    nom: "Programme Excellentia",
    paysHote: "Belgique",
    cyclesFinances: ["master"],
    niveauDisponible: ["Master"],
    dateCloture: "2026-06-30",
    avantages: [
      "Bourse complète pour master en Belgique",
      "Stage en entreprise",
      "Mentorat académique",
    ],
    conditionsEligibilite: [
      "Licence / Bachelor obligatoire",
      "Projet d'études cohérent",
      "Maîtrise du français ou de l'anglais",
    ],
    lienOfficiel: "https://www.excellentia.be",
    status: "a_venir",
    communaute: "Fédération Wallonie-Bruxelles",
    langueEnseignement: "Français",
  },
  {
    id: "bourse-eifel",
    nom: "Bourse Eiffel",
    paysHote: "France",
    cyclesFinances: ["master", "doctorate"],
    niveauDisponible: ["Master", "Doctorat"],
    dateCloture: "2025-01-10",
    avantages: [
      "Allocation mensuelle de 1 181 € (master)",
      "Frais de voyage et assurance",
      "Prestige du programme gouvernemental",
    ],
    conditionsEligibilite: [
      "Licence / Bachelor minimum pour le master",
      "Master requis pour le doctorat",
      "Excellence académique requise",
    ],
    lienOfficiel: "https://www.campusfrance.org/fr/bourse-eiffel",
    status: "fermee",
  },
  {
    id: "chevening",
    nom: "Chevening Scholarship",
    paysHote: "Royaume-Uni",
    cyclesFinances: ["master"],
    niveauDisponible: ["Master"],
    dateCloture: "2026-11-07",
    avantages: [
      "Frais de scolarité intégralement couverts",
      "Allocation mensuelle",
      "Billet d'avion",
    ],
    conditionsEligibilite: [
      "Licence / Bachelor obligatoire",
      "Minimum 2 ans d'expérience professionnelle",
      "Leadership démontré",
    ],
    lienOfficiel: "https://www.chevening.org",
    status: "a_venir",
  },
  {
    id: "mastercard-foundation",
    nom: "Mastercard Foundation Scholars",
    paysHote: "International",
    cyclesFinances: ["undergraduate", "master"],
    niveauDisponible: ["Licence / Bachelor", "Master"],
    dateCloture: "2026-08-15",
    avantages: [
      "Bourse intégrale (frais + vie)",
      "Programme de leadership",
      "Accompagnement académique",
    ],
    conditionsEligibilite: [
      "Bac ou équivalent pour undergraduate",
      "Licence pour master",
      "Résidence en Afrique subsaharienne",
    ],
    lienOfficiel: "https://mastercardfdn.org",
    status: "encours",
  },
  {
    id: "daad-undergraduate",
    nom: "DAAD Undergraduate Scholarship",
    paysHote: "Allemagne",
    cyclesFinances: ["undergraduate"],
    niveauDisponible: ["Licence / Bachelor"],
    dateCloture: "2026-07-01",
    avantages: [
      "Frais de scolarité partiels ou complets",
      "Allocation mensuelle",
      "Cours de langue allemande",
    ],
    conditionsEligibilite: [
      "Bachelier / Finaliste ou Bac obtenu",
      "Pas encore de diplôme universitaire",
      "Niveau d'allemand ou d'anglais B1 minimum",
    ],
    lienOfficiel: "https://www.daad.de",
    status: "encours",
  },
];

export const FEATURED_SCHOLARSHIP_IDS = [
  "turkiye-burslari",
  "japan-mext-research",
  "roumanie-mae",
  "programme-excellentia",
  "bourse-eifel",
];
