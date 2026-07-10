export const PUBLIC_NAV_LINKS = [{ label: "Accueil", href: "/" }] as const;

export const FOOTER_PLATFORM_LINKS = [
  { label: "Conditions d'utilisation", href: "/conditions-utilisation" },
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
] as const;

export const FOOTER_CONTACT_EMAIL = "contact@aksantiship.com";

/** Parcours candidat — aligné cahier des charges (compte → profil → opportunités). */
export const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Créez votre compte",
    description:
      "Inscription gratuite. Votre espace candidat est privé et sécurisé.",
  },
  {
    step: "2",
    title: "Complétez votre profil",
    description:
      "Renseignez votre parcours académique, vos résultats et vos attestations de langue. Notre moteur d’analyse établit votre éligibilité et priorise les bourses correspondant à votre profil.",
  },
  {
    step: "3",
    title: "Accédez à vos bourses",
    description:
      "Tableau de bord, opportunités compatibles et suivi de candidatures.",
  },
] as const;

export type Partner = {
  id: string;
  name: string;
  /** Fichier dans /public/partners/ (png, jpg ou svg). */
  logo?: string;
  /** Ajustement si le fichier contient beaucoup de marge vide. */
  logoScale?: number;
  /** Classes supplémentaires sur le conteneur du logo. */
  logoSlotClass?: string;
  /** Filtre CSS pour améliorer la lisibilité. */
  logoFilter?: string;
  /** Fusionne les fonds blancs/gris des JPG avec la section. */
  logoBlendMode?: "normal" | "multiply" | "screen";
};

/** Encode le nom de fichier (le « + » de erasmus+.jpg ne l'est pas avec encodeURI). */
export function partnerLogoSrc(logo: string): string {
  const slash = logo.lastIndexOf("/");
  if (slash === -1) return encodeURIComponent(logo);
  return `${logo.slice(0, slash + 1)}${encodeURIComponent(logo.slice(slash + 1))}`;
}

export const PARTNERS: Partner[] = [
  {
    id: "campus-france",
    name: "Campus France",
    logo: "/partners/campus-france.svg",
    logoScale: 1.28,
  },
  {
    id: "republique-francaise",
    name: "République française",
    logo: "/partners/republique-francaise.webp",
    logoScale: 1.35,
    logoBlendMode: "multiply",
  },
  { id: "daad", name: "DAAD", logo: "/partners/DAAD_Logo.svg", logoScale: 0.78 },
  {
    id: "british-council",
    name: "British Council",
    logo: "/partners/BritishCouncil_Logo.png",
    logoScale: 0.92,
  },
  { id: "auf", name: "AUF", logo: "/partners/Logo_AUF.svg.webp", logoScale: 0.82 },
  {
    id: "erasmus-plus",
    name: "Erasmus+",
    logo: "/partners/erasmus+1.jpg",
    logoScale: 1.55,
    logoBlendMode: "multiply",
  },
];

/** @deprecated Utiliser PARTNERS */
export const PARTNER_ORGANISATIONS = PARTNERS.map((p) => p.name);

export const HERO_STATS = [
  { value: "98%", label: "Taux de compatibilité" },
  { value: "500+", label: "Bourses disponibles" },
  { value: "120+", label: "Pays couverts" },
] as const;

/** Seule la page d'accueil et l'authentification sont publiques. */
export const PUBLIC_APP_PATHS = [
  "/",
  "/conditions-utilisation",
  "/politique-confidentialite",
  "/auth/connexion",
  "/auth/inscription",
  "/auth/mot-de-passe-oublie",
] as const;

export function isPublicAppPath(path: string): boolean {
  if ((PUBLIC_APP_PATHS as readonly string[]).includes(path)) return true;
  return path.startsWith("/auth/");
}
