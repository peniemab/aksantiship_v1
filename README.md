# Aksantiship

Portail de recherche de bourses d'études pour les candidats africains qui veulent financer leurs études à l'international.

Le nom vient de **Aksanti** (merci, en swahili) + **ship** (scholarship). L'idée : accompagner chaque candidat pas à pas, du profil jusqu'à la bonne opportunité.

---

## Ce que fait la plateforme

Je vise trois choses principales :

1. **Analyser le profil** du candidat (niveau d'études, diplômes, langues, documents…)
2. **Filtrer les bourses** qui correspondent vraiment à son profil — une bourse Master ne doit pas apparaître chez quelqu'un qui vient tout juste d'obtenir son bac
3. **Organiser les opportunités** selon leur statut : en cours, à venir, fermées

### Public visé

- **Finalistes** (bacheliers)
- **Étudiants** en cours de cursus
- **Diplômés** (licence, master, doctorat)

### Fonctionnalités en place (MVP)

- Page d'accueil vitrine
- Création de compte + connexion (email, mot de passe, vérification email simulée)
- Profil candidat séparé du compte (avec niveaux alignés sur la norme internationale : Bachelor, Master, PhD)
- Analyse du profil
- Mes opportunités (filtrées par compatibilité + statut)
- Abonnement et accompagnement (paiement en mode démo)
- API interne `/api/bourses` (données en fichier pour l'instant, prête pour une vraie BDD)

---

## Stack technique

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**

Pas de base de données pour le moment. Auth, profils et sessions sont stockés en **localStorage** côté navigateur — c'est volontaire pour cette phase de prototypage.

---

## Lancer le projet en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Autres commandes

```bash
npm run build          # build production
npm run start          # serveur production
npm run lint           # eslint
npm run sync:bourses   # RSS + Chine (calendrier automatique)
npm run sync:china     # Chine partielle (~3500 bourses)
npm run sync:china:full   # Catalogue CUCAS complet (~11 470 bourses)
npm run sync:france       # Campus France (~380 programmes)
npm run sync:germany      # Allemagne DAAD (~163 programmes)
npm run sync:belgium      # Belgique Study in Belgium (~40 programmes)
npm run sync:canada       # Canada — fédéral + portails + UdeM/UBC/U of T
npm run sync:japan        # Japon Study in Japan + JPSS (~697 programmes)
npm run sync:all          # Tous les pays (Chine conservée telle quelle)
npm run sync:all:full     # Idem + Chine catalogue complet CUCAS (~11 470)
npm run sync:china:full   # Chine seule — import complet CUCAS
```

---

## Synchronisation des bourses (maintenance annuelle)

Les bourses sont stockées dans `data/` et mises à jour par des scripts, pas à la main.

**Convention de nommage** : `data/{pays}-{source}-scholarships.json` — un fichier JSON par pays synchronisé, même structure partout (`syncedAt`, `count`, `source`, `scholarships[]`). Les échantillons HTML de debug vont dans `data/samples/` (ignorés par git).

| Fichier | Pays | Source officielle |
|---------|------|-------------------|
| `data/china-cucas-scholarships.json` | Chine | CUCAS |
| `data/france-campusfrance-scholarships.json` | France | CampusBourses |
| `data/germany-daad-scholarships.json` | Allemagne | DAAD |
| `data/belgium-scholarships.json` | Belgique | Study in Belgium + Flandre |
| `data/canada-educanada-scholarships.json` | Canada | ÉduCanada + portails universités + scrapers |
| `data/japan-studyinjapan-jpss-scholarships.json` | Japon | Study in Japan + JPSS |
| `data/daad-catalog-titles.json` | Allemagne | Snapshot DAAD (fallback réseau) |
| `data/scholarships-synced.json` | International | Flux RSS |

### France (CampusBourses — ~380 programmes)

Relancer **chaque année**, **octobre–janvier** (Eiffel, programmes d'excellence) :

```bash
npm run sync:france
```

Puis committer :

```bash
git add data/france-campusfrance-scholarships.json
git commit -m "Mettre à jour le catalogue des bourses France"
```

Les dates `endAt` viennent de Campus France. Les bourses expirées sont masquées automatiquement.

### Allemagne (DAAD — ~163 programmes)

Relancer **chaque année**, **juillet–octobre** (Deutschlandstipendium, fondations) et **octobre–janvier** (bourses master DAAD) :

```bash
npm run sync:germany
```

Si le site DAAD est inaccessible depuis votre réseau, le script utilise le snapshot local `data/daad-catalog-titles.json`. Pour le régénérer depuis un export HTML :

```bash
npm run sync:daad:catalog
```

Puis committer :

```bash
git add data/germany-daad-scholarships.json data/daad-catalog-titles.json
git commit -m "Mettre à jour le catalogue des bourses Allemagne (DAAD)"
```

Sur `/pays/allemagne`, filtrez par **langue requise** (Anglais / Allemand). Les dates limites varient selon le pays d'origine — consultez toujours la fiche DAAD.

### Belgique (Study in Belgium + Flandre — ~40 programmes)

Relancer **chaque année**, **septembre–janvier** (ARES, FWB) et **février–avril** (Master Mind, universités flamandes) :

```bash
npm run sync:belgium
```

Puis committer :

```bash
git add data/belgium-scholarships.json
git commit -m "Mettre à jour le catalogue des bourses Belgique"
```

Sur `/pays/belgique`, filtrez par **communauté** (Wallonie-Bruxelles / Flandre) et **langue d'enseignement** (Français / Néerlandais / Anglais).

### Canada (ÉduCanada + UdeM — ~150 programmes)

Relancer **chaque année**, **janvier–mars** (BEC, ELAP) et **septembre–novembre** (Pearson, McCall MacBain) :

```bash
npm run sync:canada
```

Puis committer :

```bash
git add data/canada-educanada-scholarships.json
git commit -m "Mettre à jour le catalogue des bourses Canada"
```

Sur `/pays/canada`, filtrez par **mode de candidature** :
- Candidature directe
- Via l'université (ex. BEC — pas de dossier étudiant direct)
- Automatique à l'admission (ex. Ottawa, Toronto)

Les cartes affichent un badge explicite et adaptent le libellé du lien officiel.

### Japon (Study in Japan + JPSS — ~697 programmes)

Relancer **chaque année**, **avril–mai** (MEXT ambassade), **juin–septembre** (MEXT universités) et **septembre–janvier** (fondations privées) :

```bash
npm run sync:japan
```

Sources fusionnées :
- **29** programmes curatés MEXT / portails officiels
- **664** bourses et exonérations (Study in Japan — recherche JASSO)
- **140** fondations et collectivités (JPSS)

Puis committer :

```bash
git add data/japan-studyinjapan-jpss-scholarships.json
git commit -m "Mettre à jour le catalogue des bourses Japon"
```

### Sync global (tous les pays branchés)

```bash
npm run sync:all          # France + Allemagne + Belgique + Canada + Japon + RSS (Chine non touchée)
npm run sync:all:full     # Idem + import complet Chine CUCAS
npm run sync:china:full   # Mettre à jour la Chine seule (~11 470 bourses)
```

**Important :** ne lancez pas `sync:all` en pensant qu'il met à jour la Chine — il **préserve** le fichier existant. Un sync partiel CUCAS écrasait auparavant le catalogue complet ; c'est corrigé, mais il faut relancer `sync:china:full` pour restaurer les ~9 000+ bourses si le fichier a déjà été réduit.

Pays avec import automatique complet : **Chine**, **France**, **Allemagne**, **Belgique**, **Canada**, **Japon**. Les autres pays du catalogue statique (`scholarships-catalog.ts`) et les flux RSS complètent la couverture internationale jusqu'à l'ajout de scrapers dédiés (ex. Turquie).

### Chine (à relancer chaque année, surtout décembre–mars)

```bash
npm run sync:china:full
```

Puis committer :

### RSS + calendrier automatique

```bash
npm run sync:bourses
```

En production, planifier via cron : `GET /api/cron/sync-bourses` (header `Authorization: Bearer CRON_SECRET`).

---

## Structure du projet (l'essentiel)

```
src/
├── app/
│   ├── api/bourses/       # API interne des bourses
│   ├── auth/              # inscription, connexion, reset mdp
│   ├── profil/            # profil candidat
│   ├── analyse-profil/
│   ├── opportunites/
│   ├── abonnement/
│   ├── accompagnement/
│   └── paiement/
├── components/
├── context/               # AuthContext (session locale)
├── hooks/                 # useBourses
└── lib/
    ├── bourses/           # repository, service, client API
    ├── data/              # données bourses (temporaire)
    ├── education-levels.ts
    └── matching.ts        # logique profil ↔ bourse
```

---

## API bourses

| Endpoint | Description |
|----------|-------------|
| `GET /api/bourses` | Liste des bourses |
| `GET /api/bourses?featured=true` | Bourses vitrine (accueil) |
| `GET /api/bourses?status=encours` | Filtre par statut |
| `GET /api/bourses?niveauEtudes=bachelor&matchOnly=true` | Bourses compatibles avec un niveau |
| `GET /api/bourses/:id` | Détail d'une bourse |

Exemple :

```
GET /api/bourses?niveauEtudes=finaliste&matchOnly=true&includeMatch=true
```

---

## Parcours utilisateur (pour tester)

1. Créer un compte → `/auth/inscription`
2. Simuler la vérification email → `/auth/verifier-email`
3. Remplir le profil → `/profil`
4. Payer (démo) → enregistrement du profil
5. Voir l'analyse → `/analyse-profil`
6. Consulter les bourses filtrées → `/opportunites`

---

## Prochaines étapes (ma roadmap)

- [ ] Brancher **Supabase** ou **PostgreSQL** pour comptes, profils et bourses
- [ ] Back-office admin pour ajouter/modifier les bourses sans toucher au code
- [ ] Vrai envoi d'emails (confirmation, reset mdp)
- [ ] Passerelle de paiement (Mobile Money, etc.)
- [x] Enrichir le catalogue Chine via CUCAS (~9 000+ bourses)
- [x] Sync **France** (Campus France / CampusBourses)
- [x] Sync **Allemagne** (catalogue DAAD + filtres langue)
- [x] Sync **Belgique** (Study in Belgium + Master Mind, filtres communauté/langue)
- [x] Sync **Canada** (ÉduCanada + UdeM, badges candidature)
- [x] Sync **Japon** (Study in Japan 664 + JPSS 140 + MEXT curaté)
- [ ] Sync dédiée **Turquie** (Türkiye Bursları, prochain pays prioritaire)

---

## À propos

Projet porté par **Aksantifly** — Kinshasa, RDC.

> *« Aksantiship t'accompagne pas à pas dans la recherche d'une opportunité pour financer tes études à l'international. »*

---

## Licence

Projet privé — tous droits réservés.
