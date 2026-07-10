import type { Scholarship } from "../types";

export interface CanadaUniversityPortal {
  id: string;
  nom: string;
  organisme: string;
  province: string;
  langueEnseignement: string;
  lienOfficiel: string;
}

/** Grandes universités — lien officiel bourses / aide financière (toutes provinces). */
export const CANADA_UNIVERSITY_PORTALS: CanadaUniversityPortal[] = [
  { id: "ubc", organisme: "University of British Columbia", nom: "UBC — bourses étudiants internationaux", province: "Colombie-Britannique", langueEnseignement: "Anglais", lienOfficiel: "https://you.ubc.ca/financial-planning/scholarships-awards-international-students/" },
  { id: "utoronto", organisme: "University of Toronto", nom: "U of T — bourses étudiants internationaux", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://future.utoronto.ca/scholarships-international-students" },
  { id: "mcgill", organisme: "McGill University", nom: "McGill — bourses d'entrée et aide financière", province: "Québec", langueEnseignement: "Anglais", lienOfficiel: "https://www.mcgill.ca/studentaid/scholarships-aid/future-undergrads/entrance-scholarships" },
  { id: "umontreal", organisme: "Université de Montréal", nom: "UdeM — répertoire des bourses", province: "Québec", langueEnseignement: "Français", lienOfficiel: "https://bourses.umontreal.ca/repertoire-des-bourses/" },
  { id: "laval", organisme: "Université Laval", nom: "ULaval — financement étudiants internationaux", province: "Québec", langueEnseignement: "Français", lienOfficiel: "https://www.ulaval.ca/espace-etudiant/bourses-et-aide-financiere/financement-pour-les-etudiantes-et-etudiants-de-linternational" },
  { id: "uottawa", organisme: "Université d'Ottawa", nom: "uOttawa — bourses de mérite", province: "Ontario", langueEnseignement: "Français / Anglais", lienOfficiel: "https://www.uottawa.ca/etudes/bourses-finances/bourses-merite" },
  { id: "ualberta", organisme: "University of Alberta", nom: "UAlberta — bourses internationales d'entrée", province: "Alberta", langueEnseignement: "Anglais", lienOfficiel: "https://www.ualberta.ca/en/admissions/tuition-and-scholarships/international-entrance-scholarships/index.html" },
  { id: "ucalgary", organisme: "University of Calgary", nom: "UCalgary — awards and scholarships", province: "Alberta", langueEnseignement: "Anglais", lienOfficiel: "https://www.ucalgary.ca/registrar/awards" },
  { id: "uwaterloo", organisme: "University of Waterloo", nom: "Waterloo — bourses étudiants internationaux", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://uwaterloo.ca/future-students/financing/international-scholarships" },
  { id: "western", organisme: "Western University", nom: "Western — international student scholarships", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://registrar.uwo.ca/student_finances/scholarships/international.html" },
  { id: "queens", organisme: "Queen's University", nom: "Queen's — financial aid and awards", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://www.queensu.ca/studentawards/international-students" },
  { id: "mcmaster", organisme: "McMaster University", nom: "McMaster — scholarships and awards", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://registrar.mcmaster.ca/awards-and-scholarships/" },
  { id: "york", organisme: "York University", nom: "York U — international scholarships", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://sfs.yorku.ca/awards/international-students" },
  { id: "tmu", organisme: "Toronto Metropolitan University", nom: "TMU — scholarships and awards", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://www.torontomu.ca/admissions/international/scholarships/" },
  { id: "concordia", organisme: "Concordia University", nom: "Concordia — funding and awards", province: "Québec", langueEnseignement: "Anglais / Français", lienOfficiel: "https://www.concordia.ca/admissions/funding.html" },
  { id: "sherbrooke", organisme: "Université de Sherbrooke", nom: "UdeS — bourses", province: "Québec", langueEnseignement: "Français", lienOfficiel: "https://www.usherbrooke.ca/admission/bourses/" },
  { id: "uqam", organisme: "UQAM", nom: "UQAM — aide financière et bourses", province: "Québec", langueEnseignement: "Français", lienOfficiel: "https://admission.uqam.ca/aide-financiere/" },
  { id: "sfu", organisme: "Simon Fraser University", nom: "SFU — awards and scholarships", province: "Colombie-Britannique", langueEnseignement: "Anglais", lienOfficiel: "https://www.sfu.ca/students/awards.html" },
  { id: "uvic", organisme: "University of Victoria", nom: "UVic — scholarships and bursaries", province: "Colombie-Britannique", langueEnseignement: "Anglais", lienOfficiel: "https://www.uvic.ca/admissions/undergraduate/fees-finance/scholarships/" },
  { id: "dalhousie", organisme: "Dalhousie University", nom: "Dalhousie — scholarships", province: "Nouvelle-Écosse", langueEnseignement: "Anglais", lienOfficiel: "https://www.dal.ca/admissions/money_matters/scholarships.html" },
  { id: "mun", organisme: "Memorial University", nom: "Memorial — international scholarships", province: "Terre-Neuve-et-Labrador", langueEnseignement: "Anglais", lienOfficiel: "https://www.mun.ca/scholarships/international/" },
  { id: "unb", organisme: "University of New Brunswick", nom: "UNB — scholarships", province: "Nouveau-Brunswick", langueEnseignement: "Anglais / Français", lienOfficiel: "https://www.unb.ca/financialservices/scholarships/" },
  { id: "manitoba", organisme: "University of Manitoba", nom: "U of Manitoba — international awards", province: "Manitoba", langueEnseignement: "Anglais", lienOfficiel: "https://umanitoba.ca/financial-aid-and-awards/scholarships/international-students" },
  { id: "usask", organisme: "University of Saskatchewan", nom: "U of Saskatchewan — scholarships", province: "Saskatchewan", langueEnseignement: "Anglais", lienOfficiel: "https://students.usask.ca/money/awards/international-students.php" },
  { id: "uregina", organisme: "University of Regina", nom: "U of Regina — scholarships", province: "Saskatchewan", langueEnseignement: "Anglais", lienOfficiel: "https://www.uregina.ca/finances/scholarships-awards/index.html" },
  { id: "carleton", organisme: "Carleton University", nom: "Carleton — scholarships", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://carleton.ca/awards/" },
  { id: "uoguelph", organisme: "University of Guelph", nom: "Guelph — scholarships", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://www.uoguelph.ca/registrar/student-finances/scholarships" },
  { id: "windsor", organisme: "University of Windsor", nom: "Windsor — scholarships and bursaries", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://www.uwindsor.ca/studentawards/" },
  { id: "lakehead", organisme: "Lakehead University", nom: "Lakehead — scholarships", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://www.lakeheadu.ca/students/future/scholarships" },
  { id: "brock", organisme: "Brock University", nom: "Brock — scholarships", province: "Ontario", langueEnseignement: "Anglais", lienOfficiel: "https://brocku.ca/scholarships/" },
  { id: "hecmontreal", organisme: "HEC Montréal", nom: "HEC Montréal — bourses", province: "Québec", langueEnseignement: "Français", lienOfficiel: "https://www.hec.ca/programmes/bourses/index.html" },
  { id: "polymtl", organisme: "Polytechnique Montréal", nom: "Polytechnique — aide financière", province: "Québec", langueEnseignement: "Français", lienOfficiel: "https://www.polymtl.ca/futur-etudiant/aide-financiere" },
  { id: "ubc-okanagan", organisme: "UBC Okanagan", nom: "UBC Okanagan — awards", province: "Colombie-Britannique", langueEnseignement: "Anglais", lienOfficiel: "https://students.ok.ubc.ca/finance/awards-scholarships-bursaries/" },
];

export function buildCanadaUniversityPortalScholarships(syncedAt: string): Scholarship[] {
  return CANADA_UNIVERSITY_PORTALS.map((p) => ({
    id: `canada-portail-${p.id}`,
    nom: p.nom,
    paysHote: "Canada",
    cyclesFinances: ["undergraduate", "master", "doctorate"],
    niveauDisponible: ["Licence / Bachelor", "Master", "Doctorat"],
    dateCloture: "2026-08-31",
    avantages: [`Portail officiel — ${p.organisme}`, "Liste complète sur le site de l'université"],
    conditionsEligibilite: [
      `Province : ${p.province}`,
      `Langue : ${p.langueEnseignement}`,
      "Critères et dates selon chaque programme universitaire",
    ],
    lienOfficiel: p.lienOfficiel,
    status: "encours" as const,
    source: "canada-portail",
    syncedAt,
    organisme: p.organisme,
    province: p.province,
    langueEnseignement: p.langueEnseignement,
    typeCandidature: "directe",
    nationalitesEligibles: ["Étudiants internationaux (selon programme)"],
  }));
}
