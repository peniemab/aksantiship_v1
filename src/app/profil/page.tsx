"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Alert, Button, FormField, Input, Select } from "@/components/ui/Form";
import {
  ACTIVITY_OPTIONS,
  DIPLOMA_OPTIONS,
  DOCUMENT_OPTIONS,
  EDUCATION_LEVEL_OPTIONS,
  ENGLISH_LEVEL_OPTIONS,
  LANGUAGE_CERTIFICATES,
  NATIONALITY_OPTIONS,
  PARENTAL_STATUS_OPTIONS,
} from "@/lib/constants";
import { suggestEducationLevel } from "@/lib/education-levels";
import type { EducationLevel } from "@/lib/education-levels";
import type { ActivityStatus, CandidateProfile, DiplomaLevel } from "@/lib/types";
import { calculateAge, canUpdateProfile } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DRAFT_KEY = "aksantiship_draft_profil";
const STEP_KEY = "aksantiship_draft_profil_step";

const STEPS = [
  { id: 1, title: "Identité", short: "Qui vous êtes" },
  { id: 2, title: "Parcours", short: "Études & activité" },
  { id: 3, title: "Éligibilité", short: "Langues & documents" },
] as const;

type ProfileFormState = {
  nom: string;
  postNom: string;
  prenom: string;
  dateNaissance: string;
  nationalite: string;
  nationaliteAutre: string;
  niveauEtudes: EducationLevel | "";
  dernierDiplome: DiplomaLevel | "";
  filiere: string;
  moyenneDernierDiplome: string;
  moyenneBac: string;
  activiteEnCours: ActivityStatus | "";
  niveauAnglais: string;
  statutParental: string;
  anneesExperience: string;
  domaineProfessionnel: string;
  certificatLangue: string;
  passeport: string;
  documents: string[];
};

const emptyForm: ProfileFormState = {
  nom: "",
  postNom: "",
  prenom: "",
  dateNaissance: "",
  nationalite: "",
  nationaliteAutre: "",
  niveauEtudes: "",
  dernierDiplome: "",
  filiere: "",
  moyenneDernierDiplome: "",
  moyenneBac: "",
  activiteEnCours: "",
  niveauAnglais: "",
  statutParental: "",
  anneesExperience: "",
  domaineProfessionnel: "",
  certificatLangue: "Aucun",
  passeport: "",
  documents: [],
};

const PROFILE_BLOCK_INSET = "mx-1 sm:mx-1.5";

function StepIndicator({ step }: { step: number }) {
  const percent = Math.round((step / STEPS.length) * 100);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div
          className="h-2.5 w-full overflow-hidden rounded-full bg-border/80"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`Étape ${step} sur ${STEPS.length}`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-aksanti-red to-ship-orange transition-all duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((s, index) => {
          const done = step > s.id;
          const current = step === s.id;
          return (
            <li key={s.id} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                <span
                  className={[
                    "flex size-8 items-center justify-center rounded-full text-sm font-bold transition",
                    done || current
                      ? "bg-aksanti-red text-white"
                      : "bg-surface text-muted ring-1 ring-border",
                  ].join(" ")}
                  aria-current={current ? "step" : undefined}
                >
                  {done ? "✓" : s.id}
                </span>
                <span
                  className={[
                    "truncate text-center text-[11px] font-semibold sm:text-xs",
                    current ? "text-aksanti-red" : "text-muted",
                  ].join(" ")}
                >
                  {s.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <span
                  className={[
                    "mb-5 h-0.5 w-full max-w-8 shrink-0 rounded sm:max-w-12",
                    step > s.id ? "bg-aksanti-red" : "bg-border",
                  ].join(" ")}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ProfileForm() {
  const { user, profile, hasActiveSubscription, savePendingProfile } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [niveauManuallySet, setNiveauManuallySet] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isPrimary = form.dernierDiplome === "certificat_primaire";
  const isBac = form.dernierDiplome === "bac";
  const isTravailleur = form.activiteEnCours === "travailleur";
  const isEditing = !!profile;
  const canEdit = !isEditing || canUpdateProfile(profile?.updatedAt, hasActiveSubscription);

  useEffect(() => {
    if (profile) {
      setForm({
        nom: profile.nom,
        postNom: profile.postNom,
        prenom: profile.prenom,
        dateNaissance: profile.dateNaissance,
        nationalite: profile.nationalite
          ? NATIONALITY_OPTIONS.includes(
              profile.nationalite as (typeof NATIONALITY_OPTIONS)[number],
            )
            ? profile.nationalite
            : "Autre"
          : "",
        nationaliteAutre:
          profile.nationalite &&
          !NATIONALITY_OPTIONS.includes(
            profile.nationalite as (typeof NATIONALITY_OPTIONS)[number],
          )
            ? profile.nationalite
            : "",
        niveauEtudes: profile.niveauEtudes,
        dernierDiplome: profile.dernierDiplome,
        filiere: profile.filiere ?? "",
        moyenneDernierDiplome: profile.moyenneDernierDiplome?.toString() ?? "",
        moyenneBac: profile.moyenneBac?.toString() ?? "",
        activiteEnCours: profile.activiteEnCours,
        niveauAnglais: profile.niveauAnglais,
        statutParental: profile.statutParental,
        anneesExperience: profile.anneesExperience?.toString() ?? "",
        domaineProfessionnel: profile.domaineProfessionnel ?? "",
        certificatLangue: profile.certificatLangue,
        passeport: profile.passeport ? "oui" : "non",
        documents: profile.documents,
      });
      setNiveauManuallySet(true);
      setHydrated(true);
      return;
    }

    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      const savedStep = sessionStorage.getItem(STEP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ProfileFormState;
        setForm({ ...emptyForm, ...parsed, documents: parsed.documents ?? [] });
      } else if (user) {
        setForm((f) => ({
          ...f,
          nom: user.nom,
          postNom: user.postNom,
          prenom: user.prenom,
        }));
      }
      if (savedStep) {
        const n = Number(savedStep);
        if (n >= 1 && n <= 3) setStep(n);
      }
    } catch {
      if (user) {
        setForm((f) => ({
          ...f,
          nom: user.nom,
          postNom: user.postNom,
          prenom: user.prenom,
        }));
      }
    }
    setHydrated(true);
  }, [profile, user]);

  useEffect(() => {
    if (!hydrated || profile || !canEdit) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      sessionStorage.setItem(STEP_KEY, String(step));
    } catch {
      /* ignore */
    }
  }, [form, step, hydrated, profile, canEdit]);

  useEffect(() => {
    if (niveauManuallySet || !form.dernierDiplome || !form.activiteEnCours) return;
    const suggested = suggestEducationLevel(form.dernierDiplome, form.activiteEnCours);
    setForm((f) => ({ ...f, niveauEtudes: suggested }));
  }, [form.dernierDiplome, form.activiteEnCours, niveauManuallySet]);

  const age = form.dateNaissance ? calculateAge(form.dateNaissance) : null;

  const toggleDocument = (doc: string) => {
    setForm((f) => ({
      ...f,
      documents: f.documents.includes(doc)
        ? f.documents.filter((d) => d !== doc)
        : [...f.documents, doc],
    }));
  };

  const validateStep = (current: number): string | null => {
    if (current === 1) {
      if (!form.nom.trim() || !form.postNom.trim() || !form.prenom.trim()) {
        return "Veuillez renseigner nom, post-nom et prénom.";
      }
      if (!form.dateNaissance) return "Veuillez indiquer votre date de naissance.";
      if (!form.nationalite) return "Veuillez indiquer votre nationalité.";
      if (form.nationalite === "Autre" && !form.nationaliteAutre.trim()) {
        return "Veuillez préciser votre nationalité.";
      }
      return null;
    }

    if (current === 2) {
      if (!form.dernierDiplome || !form.activiteEnCours || !form.niveauEtudes) {
        return "Veuillez renseigner diplôme, activité et niveau d'études.";
      }
      if (!isPrimary && !form.filiere.trim()) {
        return "Veuillez indiquer votre filière.";
      }
      if (!isPrimary && !form.moyenneDernierDiplome) {
        return "Veuillez indiquer la moyenne de votre dernier diplôme.";
      }
      if (!isPrimary && !isBac && !form.moyenneBac) {
        return "Veuillez indiquer votre moyenne au bac.";
      }
      if (isTravailleur) {
        if (!form.anneesExperience) return "Indiquez vos années d'expérience.";
        if (!form.domaineProfessionnel.trim()) return "Indiquez votre domaine professionnel.";
      }
      return null;
    }

    if (current === 3) {
      if (!form.niveauAnglais || !form.statutParental || !form.passeport) {
        return "Veuillez renseigner anglais, statut parental et passeport.";
      }
      return null;
    }

    return null;
  };

  const goNext = () => {
    setError("");
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canEdit) {
      setError(
        "La mise à jour du profil n'est possible qu'après 1 mois et avec un abonnement actif.",
      );
      return;
    }

    for (const s of [1, 2, 3]) {
      const err = validateStep(s);
      if (err) {
        setStep(s);
        setError(err);
        return;
      }
    }

    const resolvedNationalite =
      form.nationalite === "Autre" ? form.nationaliteAutre.trim() : form.nationalite;

    const candidateProfile: CandidateProfile = {
      nom: form.nom.trim(),
      postNom: form.postNom.trim(),
      prenom: form.prenom.trim(),
      dateNaissance: form.dateNaissance,
      age: age ?? 0,
      nationalite: resolvedNationalite,
      niveauEtudes: form.niveauEtudes as EducationLevel,
      dernierDiplome: form.dernierDiplome as DiplomaLevel,
      filiere: isPrimary ? undefined : form.filiere || undefined,
      moyenneDernierDiplome: isPrimary
        ? undefined
        : parseFloat(form.moyenneDernierDiplome) || undefined,
      moyenneBac: isBac
        ? parseFloat(form.moyenneDernierDiplome) || undefined
        : parseFloat(form.moyenneBac) || undefined,
      activiteEnCours: form.activiteEnCours as ActivityStatus,
      niveauAnglais: form.niveauAnglais as CandidateProfile["niveauAnglais"],
      statutParental: form.statutParental as CandidateProfile["statutParental"],
      anneesExperience: isTravailleur ? parseInt(form.anneesExperience) || 0 : undefined,
      domaineProfessionnel: isTravailleur ? form.domaineProfessionnel : undefined,
      certificatLangue: form.certificatLangue,
      passeport: form.passeport === "oui",
      documents: form.documents,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      await savePendingProfile(candidateProfile);
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(STEP_KEY);
      router.push("/paiement?type=profil");
    } catch {
      setError("Enregistrement impossible. Réessayez.");
      setSubmitting(false);
    }
  };

  const selectedLevel = EDUCATION_LEVEL_OPTIONS.find((o) => o.value === form.niveauEtudes);
  const currentStepMeta = STEPS[step - 1]!;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div
        className={`${PROFILE_BLOCK_INSET} mt-1.5 rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-6 sm:mt-2 sm:rounded-2xl sm:px-6 sm:py-8`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl sm:size-14 sm:text-3xl">
            ℹ️
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xl font-bold text-blue-900 sm:text-2xl">Compte ≠ Profil</p>
            <p className="text-base leading-relaxed text-blue-800/90 sm:text-lg">
              Votre compte (<strong className="font-semibold text-blue-900">{user?.email}</strong>) sert
              à vous connecter. Ce formulaire crée votre{" "}
              <strong className="font-semibold text-blue-900">profil candidat</strong> en 3 étapes.
            </p>
          </div>
        </div>
      </div>

      <div className={`${PROFILE_BLOCK_INSET} space-y-6 pb-6 pt-6 sm:pb-8`}>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">
            {isEditing ? "Mon profil candidat" : "Créer mon profil"}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Étape {step}/3 — {currentStepMeta.short}
          </p>
        </div>

        <StepIndicator step={step} />

        {isEditing && !canEdit && (
          <Alert type="warning">
            Mise à jour possible uniquement après 1 mois avec abonnement actif.{" "}
            {!hasActiveSubscription && (
              <Link href="/abonnement" className="font-semibold underline">
                Souscrire
              </Link>
            )}
          </Alert>
        )}

        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="min-w-0 space-y-6 overflow-x-hidden">
          {step === 1 && (
            <fieldset className="space-y-4 rounded-xl border border-border bg-surface/40 p-4 sm:p-5">
              <legend className="px-2 text-sm font-bold text-foreground">Identité</legend>

              <div className="grid min-w-0 gap-4 sm:grid-cols-3">
                <FormField label="Nom" required>
                  <Input
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    required
                    disabled={!canEdit}
                    autoComplete="family-name"
                  />
                </FormField>
                <FormField label="Post nom" required>
                  <Input
                    value={form.postNom}
                    onChange={(e) => setForm({ ...form, postNom: e.target.value })}
                    required
                    disabled={!canEdit}
                  />
                </FormField>
                <FormField label="Prénom" required>
                  <Input
                    value={form.prenom}
                    onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                    required
                    disabled={!canEdit}
                    autoComplete="given-name"
                  />
                </FormField>
              </div>

              <FormField label="Date de naissance" required>
                <Input
                  type="date"
                  value={form.dateNaissance}
                  onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
                  required
                  disabled={!canEdit}
                  max={new Date().toISOString().split("T")[0]}
                />
              </FormField>

              {age !== null && (
                <p className="text-sm text-muted">
                  Âge calculé : <strong className="text-foreground">{age} ans</strong>
                </p>
              )}

              <FormField
                label="Nationalité"
                required
                hint="Certaines bourses sont réservées à des pays ou régions précises"
              >
                <Select
                  value={form.nationalite}
                  onChange={(e) => setForm({ ...form, nationalite: e.target.value })}
                  required
                  disabled={!canEdit}
                >
                  <option value="">Sélectionner...</option>
                  {NATIONALITY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </FormField>

              {form.nationalite === "Autre" && (
                <FormField label="Précisez votre nationalité" required>
                  <Input
                    value={form.nationaliteAutre}
                    onChange={(e) => setForm({ ...form, nationaliteAutre: e.target.value })}
                    placeholder="Ex. Zambie, Tanzanie..."
                    required
                    disabled={!canEdit}
                  />
                </FormField>
              )}
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="space-y-4 rounded-xl border-2 border-ship-orange/30 bg-ship-orange/5 p-4 sm:p-5">
              <legend className="px-2 text-sm font-bold text-ship-orange-dark">
                Parcours scolaire (critère principal de filtrage)
              </legend>

              <FormField label="Dernier diplôme obtenu" required>
                <Select
                  value={form.dernierDiplome}
                  onChange={(e) => {
                    setNiveauManuallySet(false);
                    setForm({ ...form, dernierDiplome: e.target.value as DiplomaLevel });
                  }}
                  required
                  disabled={!canEdit}
                >
                  <option value="">Sélectionner...</option>
                  {DIPLOMA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Activité en cours" required>
                <Select
                  value={form.activiteEnCours}
                  onChange={(e) => {
                    setNiveauManuallySet(false);
                    setForm({ ...form, activiteEnCours: e.target.value as ActivityStatus });
                  }}
                  required
                  disabled={!canEdit}
                >
                  <option value="">Sélectionner...</option>
                  {ACTIVITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Niveau d'études actuel"
                required
                hint="Auto-suggéré selon diplôme et activité, modifiable si besoin"
              >
                <Select
                  value={form.niveauEtudes}
                  onChange={(e) => {
                    setNiveauManuallySet(true);
                    setForm({ ...form, niveauEtudes: e.target.value as EducationLevel });
                  }}
                  required
                  disabled={!canEdit}
                >
                  <option value="">Sélectionner...</option>
                  {EDUCATION_LEVEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}, {o.isced}
                    </option>
                  ))}
                </Select>
              </FormField>

              {selectedLevel && (
                <p className="rounded-lg bg-white px-4 py-3 text-sm text-muted">
                  <strong>{selectedLevel.label}</strong>. {selectedLevel.description}
                </p>
              )}

              {!isPrimary && (
                <>
                  <FormField label="Filière suivie" required>
                    <Input
                      value={form.filiere}
                      onChange={(e) => setForm({ ...form, filiere: e.target.value })}
                      required
                      disabled={!canEdit}
                    />
                  </FormField>
                  <FormField label="Moyenne obtenue au dernier diplôme" required>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.moyenneDernierDiplome}
                      onChange={(e) =>
                        setForm({ ...form, moyenneDernierDiplome: e.target.value })
                      }
                      required
                      disabled={!canEdit}
                    />
                  </FormField>
                </>
              )}

              <FormField
                label="Moyenne obtenue au bac"
                required={!isBac && !isPrimary}
                hint={isBac ? "Verrouillé : le bac est votre dernier diplôme" : undefined}
              >
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={isBac ? form.moyenneDernierDiplome : form.moyenneBac}
                  onChange={(e) => setForm({ ...form, moyenneBac: e.target.value })}
                  disabled={!canEdit || isBac}
                  required={!isBac && !isPrimary}
                />
              </FormField>

              {isTravailleur && (
                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  <FormField label="Années d'expérience professionnelle" required>
                    <Input
                      type="number"
                      min="0"
                      value={form.anneesExperience}
                      onChange={(e) => setForm({ ...form, anneesExperience: e.target.value })}
                      required
                      disabled={!canEdit}
                    />
                  </FormField>
                  <FormField label="Domaine professionnel" required>
                    <Input
                      value={form.domaineProfessionnel}
                      onChange={(e) =>
                        setForm({ ...form, domaineProfessionnel: e.target.value })
                      }
                      required
                      disabled={!canEdit}
                    />
                  </FormField>
                </div>
              )}
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="space-y-4 rounded-xl border border-border bg-surface/40 p-4 sm:p-5">
              <legend className="px-2 text-sm font-bold text-foreground">
                Éligibilité & documents
              </legend>

              <FormField label="Niveau d'anglais" required>
                <Select
                  value={form.niveauAnglais}
                  onChange={(e) => setForm({ ...form, niveauAnglais: e.target.value })}
                  required
                  disabled={!canEdit}
                >
                  <option value="">Sélectionner...</option>
                  {ENGLISH_LEVEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Statut parental" required>
                <Select
                  value={form.statutParental}
                  onChange={(e) => setForm({ ...form, statutParental: e.target.value })}
                  required
                  disabled={!canEdit}
                >
                  <option value="">Sélectionner...</option>
                  {PARENTAL_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Certificat de langue" required>
                <Select
                  value={form.certificatLangue}
                  onChange={(e) => setForm({ ...form, certificatLangue: e.target.value })}
                  required
                  disabled={!canEdit}
                >
                  {LANGUAGE_CERTIFICATES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Passeport" required>
                <Select
                  value={form.passeport}
                  onChange={(e) => setForm({ ...form, passeport: e.target.value })}
                  required
                  disabled={!canEdit}
                >
                  <option value="">Sélectionner...</option>
                  <option value="oui">Oui</option>
                  <option value="non">Non</option>
                </Select>
              </FormField>

              <FormField label="Documents à votre possession">
                <div id="documents" className="grid gap-2 sm:grid-cols-2">
                  {DOCUMENT_OPTIONS.map((doc) => (
                    <label
                      key={doc}
                      className="flex items-start gap-2 rounded-lg border border-border bg-white p-3 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={form.documents.includes(doc)}
                        onChange={() => toggleDocument(doc)}
                        disabled={!canEdit}
                        className="mt-0.5 accent-aksanti-red"
                      />
                      <span>{doc}</span>
                    </label>
                  ))}
                </div>
              </FormField>
            </fieldset>
          )}

          {canEdit && (
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={goBack} disabled={submitting}>
                  Précédent
                </Button>
              ) : (
                <span />
              )}

              {step < 3 ? (
                <Button type="button" onClick={goNext} className="w-full sm:w-auto sm:min-w-[10rem]">
                  Continuer
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full sm:w-auto sm:min-w-[14rem]"
                  disabled={submitting}
                >
                  {submitting
                    ? "Enregistrement…"
                    : isEditing
                      ? "Mettre à jour et payer"
                      : "Enregistrer et souscrire"}
                </Button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="mx-auto max-w-3xl min-w-0 px-1 sm:px-2">
          <RequireAuth requireVerified>
            <ProfileForm />
          </RequireAuth>
        </div>
      </main>
      <Footer />
    </>
  );
}
