import type { Scholarship } from "../../types";
import { resolveStatusFromDeadline } from "../china-deadlines";
import {
  COMMUNAUTE_CG,
  COMMUNAUTE_FLANDRE,
  inferBelgiumDeadline,
  inferBelgiumInstructionLanguage,
  inferBelgiumLevels,
  inferBelgiumMonthlyAllowance,
  KULEUVEN_SCHOLARSHIPS_URL,
  UGENT_FUNDING_URL,
  WALLONIE_DUO_URL,
} from "../belgium-deadlines";

interface CuratedEntry {
  id: string;
  nom: string;
  url: string;
  organisme: string;
  avantages: string[];
  conditions: string[];
  nationalites?: string[];
}

const KULEUVEN_PROGRAMS: CuratedEntry[] = [
  {
    id: "belgium-kuleuven-master-mind",
    nom: "Master Mind Scholarships (KU Leuven)",
    url: "https://www.studyinflanders.be/scholarships/master-mind-scholarships",
    organisme: "Gouvernement flamand / KU Leuven",
    avantages: [
      "Grant ~10 225 €/an + exonération des frais de scolarité",
      "Candidature via KU Leuven (institution d'accueil)",
    ],
    conditions: [
      "Excellence académique internationale",
      "Master en Flandre — clôture universitaire : février–avril",
    ],
    nationalites: ["Toutes nationalités"],
  },
  {
    id: "belgium-kuleuven-inspiring",
    nom: "Inspiring the Outstanding (KU Leuven)",
    url: KULEUVEN_SCHOLARSHIPS_URL,
    organisme: "KU Leuven",
    avantages: ["Bourses d'excellence pour étudiants internationaux en master"],
    conditions: ["Critères d'excellence académique — voir portail officiel KU Leuven"],
    nationalites: ["Toutes nationalités"],
  },
  {
    id: "belgium-kuleuven-asean",
    nom: "KU Leuven ASEAN Scholarships",
    url: KULEUVEN_SCHOLARSHIPS_URL,
    organisme: "KU Leuven",
    avantages: ["Bourses pour étudiants originaires de pays ASEAN"],
    conditions: ["Nationalité ASEAN — master à KU Leuven"],
    nationalites: ["Pays ASEAN"],
  },
  {
    id: "belgium-kuleuven-africa",
    nom: "KU Leuven Africa Scholarships",
    url: KULEUVEN_SCHOLARSHIPS_URL,
    organisme: "KU Leuven",
    avantages: ["Bourses pour étudiants africains en master"],
    conditions: ["Nationalité africaine — master à KU Leuven"],
    nationalites: ["Afrique"],
  },
  {
    id: "belgium-kuleuven-latin-america",
    nom: "KU Leuven Central & South America Scholarships",
    url: KULEUVEN_SCHOLARSHIPS_URL,
    organisme: "KU Leuven",
    avantages: ["Bourses pour étudiants d'Amérique centrale et du Sud"],
    conditions: ["Nationalité éligible — master à KU Leuven"],
    nationalites: ["Amérique latine"],
  },
  {
    id: "belgium-kuleuven-icp",
    nom: "ICP Connect / VLIR-UOS (KU Leuven)",
    url: "https://www.vliruos.be/en/scholarships",
    organisme: "VLIR-UOS / KU Leuven",
    avantages: ["Bourses ICP Connect pour pays partenaires (Afrique, Asie, Amérique latine)"],
    conditions: ["29 pays éligibles — programmes ICP à KU Leuven"],
    nationalites: ["Pays VLIR-UOS"],
  },
];

const UGENT_PROGRAMS: CuratedEntry[] = [
  {
    id: "belgium-ugent-funding-portal",
    nom: "UGent — financement et bourses (portail officiel)",
    url: UGENT_FUNDING_URL,
    organisme: "Université de Gand",
    avantages: [
      "Top-up grants, Master Mind, bourses de recherche et aides régionales",
      "Programmes en néerlandais et en anglais",
    ],
    conditions: [
      "Consulter le portail officiel pour critères et délais par programme",
      "Master Mind : candidature via UGent",
    ],
    nationalites: ["Toutes nationalités"],
  },
  {
    id: "belgium-ugent-master-mind",
    nom: "Master Mind Scholarships (UGent)",
    url: "https://www.studyinflanders.be/scholarships/master-mind-scholarships",
    organisme: "Gouvernement flamand / UGent",
    avantages: [
      "Grant ~10 225 €/an + exonération des frais de scolarité",
      "Candidature via l'université flamande d'accueil",
    ],
    conditions: ["Excellence académique — master en Flandre"],
    nationalites: ["Toutes nationalités"],
  },
  {
    id: "belgium-ugent-top-up",
    nom: "Top-up grants (UGent)",
    url: UGENT_FUNDING_URL,
    organisme: "Université de Gand",
    avantages: ["Compléments financiers pour étudiants internationaux éligibles"],
    conditions: ["Critères UGent — voir portail fees & funding"],
    nationalites: ["Toutes nationalités"],
  },
];

function curatedToScholarship(
  entry: CuratedEntry,
  syncedAt: string,
  source: string,
  communaute: string,
): Scholarship {
  const { cycles, niveaux } = inferBelgiumLevels(entry.nom);
  const dateCloture = inferBelgiumDeadline(entry.nom, entry.organisme);
  const langueEnseignement = inferBelgiumInstructionLanguage(entry.nom, communaute);
  const allocationMensuelle = inferBelgiumMonthlyAllowance(entry.nom);

  return {
    id: entry.id,
    nom: entry.nom,
    paysHote: "Belgique",
    cyclesFinances: cycles,
    niveauDisponible: niveaux,
    dateCloture,
    avantages: entry.avantages,
    conditionsEligibilite: [
      `Communauté : ${communaute}`,
      `Langue d'enseignement : ${langueEnseignement}`,
      ...entry.conditions,
    ],
    lienOfficiel: entry.url,
    status: resolveStatusFromDeadline(dateCloture),
    source,
    syncedAt,
    organisme: entry.organisme,
    communaute,
    langueEnseignement,
    allocationMensuelle,
    nationalitesEligibles: entry.nationalites ?? ["Toutes nationalités"],
  };
}

export function getKuleuvenCuratedScholarships(syncedAt: string): Scholarship[] {
  return KULEUVEN_PROGRAMS.map((e) =>
    curatedToScholarship(e, syncedAt, "kuleuven", COMMUNAUTE_FLANDRE),
  );
}

export function getUgentCuratedScholarships(syncedAt: string): Scholarship[] {
  return UGENT_PROGRAMS.map((e) =>
    curatedToScholarship(e, syncedAt, "ugent", COMMUNAUTE_FLANDRE),
  );
}

export function getGermanophoneDuOScholarship(syncedAt: string): Scholarship {
  const nom = "DuO — aide à la formation (métiers en pénurie, CG)";
  const organisme = "Communauté germanophone";
  const dateCloture = inferBelgiumDeadline("DuO", organisme);

  return {
    id: "belgium-cg-duo",
    nom,
    paysHote: "Belgique",
    cyclesFinances: ["undergraduate", "master"],
    niveauDisponible: ["Formation professionnelle", "Haute école", "Master"],
    dateCloture,
    avantages: [
      "Allocation mensuelle ~350 € pour formations en métiers en pénurie",
      "Programme DuO en Communauté germanophone (Ostbelgien)",
    ],
    conditionsEligibilite: [
      `Communauté : ${COMMUNAUTE_CG}`,
      "Formation agréée en métier en pénurie",
      "Demande via le guichet officiel Wallonie (région germanophone)",
    ],
    lienOfficiel: WALLONIE_DUO_URL,
    status: resolveStatusFromDeadline(dateCloture),
    source: "cgermanophone",
    syncedAt,
    organisme,
    communaute: COMMUNAUTE_CG,
    langueEnseignement: inferBelgiumInstructionLanguage(nom, COMMUNAUTE_CG),
    allocationMensuelle: 350,
    nationalitesEligibles: ["Résidents Communauté germanophone"],
  };
}
