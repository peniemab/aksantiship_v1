export type DashboardNavItem = {
  label: string;
  href: string;
  icon: "dashboard" | "scholarships" | "applications" | "assistant" | "documents" | "calendar" | "favorites" | "messages" | "notifications" | "profile" | "settings";
  badge?: string;
  soon?: boolean;
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { label: "Tableau de bord", href: "/tableau-de-bord", icon: "dashboard" },
  { label: "Bourses", href: "/opportunites", icon: "scholarships" },
  { label: "Par pays", href: "/pays", icon: "calendar" },
  { label: "Mes candidatures", href: "/tableau-de-bord#candidatures", icon: "applications", soon: true },
  { label: "Assistant", href: "/analyse-profil", icon: "assistant" },
  { label: "Documents", href: "/profil#documents", icon: "documents" },
  { label: "Calendrier", href: "/tableau-de-bord#calendrier", icon: "calendar", soon: true },
  { label: "Favoris", href: "/tableau-de-bord#favoris", icon: "favorites", soon: true },
  { label: "Messages", href: "/tableau-de-bord#messages", icon: "messages", soon: true },
  { label: "Notifications", href: "/tableau-de-bord#notifications", icon: "notifications", soon: true },
  { label: "Profil", href: "/profil", icon: "profile" },
  { label: "Paramètres", href: "/abonnement", icon: "settings" },
];

export const PRICING_PLANS = {
  standard: {
    id: "standard",
    name: "Standard",
    monthlyUsd: 2,
    annualUsd: 20,
    features: [
      "Accès au catalogue de bourses",
      "Profil candidat de base",
      "Filtres par pays et niveau",
      "Alertes email (bientôt)",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    monthlyUsd: 50,
    annualUsd: 480,
    recommended: true,
    features: [
      "Tout le plan Standard",
      "Matching intelligent par profil",
      "Analyse IA des documents",
      "Vérification d'éligibilité",
      "Assistant candidature",
      "Support prioritaire",
    ],
  },
} as const;
