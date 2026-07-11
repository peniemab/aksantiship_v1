import type {
  ActivityStatus,
  DiplomaLevel,
  EnglishLevel,
  ParentalStatus,
} from "./types";
import { EDUCATION_LEVEL_OPTIONS } from "./education-levels";

export const DIPLOMA_OPTIONS: { value: DiplomaLevel; label: string }[] = [
  { value: "certificat_primaire", label: "Certificat d'étude primaire" },
  { value: "bac", label: "Baccalauréat / Diplôme d'État" },
  { value: "licence", label: "Licence / Bachelor" },
  { value: "master", label: "Master" },
];

export { EDUCATION_LEVEL_OPTIONS };

export const ACTIVITY_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: "eleve", label: "Élève" },
  { value: "etudiant", label: "Étudiant" },
  { value: "travailleur", label: "Travailleur" },
];

export const ENGLISH_LEVEL_OPTIONS: { value: EnglishLevel; label: string }[] = [
  { value: "debutant", label: "Débutant (A1)" },
  { value: "elementaire", label: "Élémentaire (A2)" },
  { value: "intermediaire", label: "Intermédiaire (B1)" },
  { value: "intermediaire_superieur", label: "Intermédiaire supérieur (B2)" },
  { value: "avance", label: "Avancé (C1)" },
  { value: "bilingue", label: "Bilingue (C2)" },
  { value: "natif", label: "Natif" },
];

export const PARENTAL_STATUS_OPTIONS: {
  value: ParentalStatus;
  label: string;
}[] = [
  { value: "deux_parents_vivants", label: "Tous les deux parents sont vivants" },
  { value: "orphelin_pere", label: "Orphelin de père" },
  { value: "orphelin_mere", label: "Orphelin de mère" },
];

export const LANGUAGE_CERTIFICATES = [
  "TOEFL iBT",
  "IELTS",
  "Cambridge (FCE)",
  "Cambridge (CAE)",
  "Cambridge (CPE)",
  "Duolingo English Test",
  "PTE Academic",
  "Aucun",
];

export const NATIONALITY_OPTIONS = [
  "République démocratique du Congo",
  "Congo",
  "Angola",
  "Cameroun",
  "Côte d'Ivoire",
  "Sénégal",
  "Mali",
  "Burkina Faso",
  "Rwanda",
  "Burundi",
  "Gabon",
  "Bénin",
  "Togo",
  "Niger",
  "Guinée",
  "Madagascar",
  "Tunisie",
  "Maroc",
  "Kenya",
  "Ghana",
  "Nigeria",
  "Autre",
] as const;

export const DOCUMENT_OPTIONS = [
  "Diplôme du bac ou attestation de réussite",
  "Diplôme de licence ou attestation de réussite",
  "Relevés des côtes (5ème & 6ème)",
  "CV à jour",
  "Bulletin 4ème",
  "Passeport ou autre",
  "Projet d'étude",
];

export const SUBSCRIPTION_PRICE_USD = 15;
export const STANDARD_PLAN_MONTHLY_USD = 2;
export const PREMIUM_PLAN_MONTHLY_USD = 50;
export const ACCOMPANIMENT_PRICE_USD = 50;
export const PROFILE_UPDATE_COOLDOWN_DAYS = 30;
