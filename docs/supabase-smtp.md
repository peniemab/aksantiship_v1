# E-mails Supabase Auth (SMTP Resend) — Aksantiship

L’**envoi** des e-mails (confirmation de compte, reset mot de passe) est géré par **Supabase Auth**, pas par Next.js.  
La config SMTP se fait dans le **dashboard Supabase** + un compte **Resend**.

Même approche que pema-class.

## Pourquoi Resend (même en free) ?

| Mode | Limite | Problème |
|------|--------|----------|
| SMTP Supabase intégré (free) | ~2–4 e-mails / heure | Confirmation bloquée très vite |
| **SMTP custom Resend (free)** | **100 e-mails / jour** | Suffisant pour démarrer |

Aucun package Resend dans le code Next.js pour l’auth — Supabase envoie via SMTP.

---

## 1. Compte Resend

1. Créer un compte sur [resend.com](https://resend.com).
2. **API Keys** → Create API Key (ex. `aksantiship-supabase`).
3. Copier la clé `re_…` (à coller uniquement dans Supabase SMTP, **jamais** dans le repo).

### Tests sans domaine (démarrage rapide)

- Expéditeur : `onboarding@resend.dev`
- Destinataire : **uniquement** l’e-mail de ton compte Resend (sinon Resend refuse l’envoi)

### Prod (plus tard)

1. **Domains** → ajouter ton domaine (ex. `aksantiship.com`)
2. Copier les DNS (SPF, DKIM) chez ton registrar
3. Attendre vérification ✅
4. Expéditeur : `noreply@ton-domaine.com`

---

## 2. Supabase → SMTP Settings

Dashboard → **Project Settings** → **Authentication** → **SMTP Settings** :

| Champ | Valeur |
|-------|--------|
| Enable custom SMTP | ✅ |
| Host | `smtp.resend.com` |
| Port | `465` (SSL) ou `587` (STARTTLS) |
| Username | `resend` |
| Password | Ta clé API Resend (`re_…`) |
| Sender email | `onboarding@resend.dev` (test) ou `noreply@ton-domaine.com` (prod) |
| Sender name | `Aksantiship` |

Enregistrer.

---

## 3. Supabase → URL Configuration

**Authentication** → **URL Configuration** :

| Champ | Dev | Prod |
|-------|-----|------|
| **Site URL** | `http://localhost:3000` | `https://aksantiship.vercel.app` |
| **Redirect URLs** | `http://localhost:3000/**` | `https://aksantiship.vercel.app/**` |

Doit correspondre à `.env.local` / Vercel :

```env
APP_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
```

En prod (Vercel) :

```env
APP_BASE_URL=https://aksantiship.vercel.app
NEXT_PUBLIC_APP_BASE_URL=https://aksantiship.vercel.app
```

Le lien de confirmation utilise déjà :
`{APP_BASE_URL}/auth/callback?next=/auth/verifier-email`

---

## 4. Providers Email

**Authentication** → **Providers** → **Email** :

- **Enable Email** : ✅
- **Confirm email** : ✅ (obligatoire pour le flux Aksantiship actuel)

---

## 5. Modèles d’e-mail (français)

**Authentication** → **Email Templates**

### Confirm signup

**Subject :**
```
Confirmez votre compte Aksantiship
```

**Body :**
```html
<h2>Bienvenue sur Aksantiship</h2>
<p>Cliquez sur le lien ci-dessous pour confirmer votre adresse e-mail :</p>
<p><a href="{{ .ConfirmationURL }}">Confirmer mon compte</a></p>
<p>Si vous n'êtes pas à l'origine de cette inscription, ignorez cet e-mail.</p>
<p>— L'équipe Aksantiship</p>
```

### Reset password (quand le flux reset sera branché)

**Subject :**
```
Réinitialisez votre mot de passe Aksantiship
```

**Body :**
```html
<h2>Mot de passe oublié</h2>
<p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
<p><a href="{{ .ConfirmationURL }}">Réinitialiser mon mot de passe</a></p>
<p>Ce lien expire sous peu. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>
<p>— L'équipe Aksantiship</p>
```

---

## 6. Test

1. SMTP Resend activé dans Supabase
2. Inscription avec **l’e-mail de ton compte Resend** (si tu utilises `onboarding@resend.dev`)
3. Ouvrir la boîte mail → cliquer le lien
4. Arrivée sur `/auth/callback` → `/auth/verifier-email` → compte confirmé → tableau de bord
5. Si besoin : bouton **Renvoyer l’e-mail** sur `/auth/verifier-email`

### Erreurs fréquentes

| Symptôme | Cause | Fix |
|----------|-------|-----|
| Pas d’e-mail | SMTP default Supabase / quota | Activer Resend (étape 2) |
| Resend refuse l’envoi | Destinataire ≠ compte Resend | En test, n’envoyer qu’à ton e-mail Resend |
| Lien « invalide ou expiré » | Redirect URL absente | Ajouter `http://localhost:3000/**` |
| Lien pointe localhost en prod | `NEXT_PUBLIC_APP_BASE_URL` manquant sur Vercel | Définir l’URL prod |
| E-mail en spam | Pas de DKIM | Vérifier le domaine Resend |

---

## Sécurité

- **Ne jamais** committer la clé Resend (`re_…`)
- Elle vit uniquement dans le dashboard Supabase (SMTP Password)
- `.env.local` ne contient **pas** de clé Resend pour l’auth

---

## Côté code (déjà en place)

- `src/app/auth/inscription` → `signUp` + `emailRedirectTo`
- `src/app/auth/verifier-email` → renvoi + rafraîchissement du statut
- `src/app/auth/callback/route.ts` → échange code → session
- `src/lib/auth/auth-redirect-url.ts` → URL de callback

Aucune clé SMTP dans le repo.
