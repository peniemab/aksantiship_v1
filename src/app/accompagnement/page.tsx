"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { Alert, Button, FormField, Input, Select } from "@/components/ui/Form";
import { ACCOMPANIMENT_PRICE_USD } from "@/lib/constants";
import { useBourses } from "@/hooks/useBourses";
import { useAuth } from "@/context/AuthContext";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";
import { useState } from "react";

function AccompanimentForm() {
  const { user, profile, addAccompaniment } = useAuth();
  const router = useRouter();
  const { bourses, loading } = useBourses(
    profile
      ? {
          niveauEtudes: profile.niveauEtudes,
          nationalite: profile.nationalite,
          matchOnly: true,
        }
      : {},
  );
  const [form, setForm] = useState({
    nomPrenom: user ? `${user.prenom} ${user.nom}` : "",
    email: user?.email ?? "",
    whatsapp: user?.telephone ?? "",
    bourseId: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.bourseId) {
      setError("Veuillez sélectionner une bourse.");
      return;
    }

    const bourse = bourses.find((s) => s.id === form.bourseId);
    if (!bourse) return;

    const id = await addAccompaniment({
      nomPrenom: form.nomPrenom,
      email: form.email,
      whatsapp: form.whatsapp,
      bourseId: form.bourseId,
      bourseNom: bourse.nom,
    });

    router.push(`/paiement?type=accompagnement&id=${id}`);
  };

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-extrabold text-foreground">Demander un accompagnement</h1>
      <p className="mt-3 text-muted leading-relaxed">
        Cette option permet de demander un accompagnement pédagogique et orienté résultats
        pour l&apos;opportunité qui vous intéresse.
      </p>

      <div className="mt-4 rounded-xl bg-ship-orange/10 px-4 py-3 text-sm text-ship-orange-dark">
        Tarif accompagnement : <strong>${ACCOMPANIMENT_PRICE_USD}</strong> par bourse
      </div>

      {error && <div className="mt-4"><Alert type="error">{error}</Alert></div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField label="Nom et Prénom" required>
          <Input value={form.nomPrenom} onChange={(e) => setForm({ ...form, nomPrenom: e.target.value })} required />
        </FormField>
        <FormField label="Adresse mail" required>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </FormField>
        <FormField label="Numéro WhatsApp" required>
          <Input type="tel" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required />
        </FormField>
        <FormField label="Sélectionner la bourse choisie" required>
          <Select
            value={form.bourseId}
            onChange={(e) => setForm({ ...form, bourseId: e.target.value })}
            required
            disabled={loading}
          >
            <option value="">{loading ? "Chargement..." : "Choisir une bourse..."}</option>
            {bourses.map((s) => (
              <option key={s.id} value={s.id}>{s.nom}, {s.paysHote}</option>
            ))}
          </Select>
        </FormField>
        <Button type="submit" variant="secondary" className="w-full">
          Valider la demande
        </Button>
      </form>
    </div>
  );
}

function AccompanimentPublic() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
      <h1 className="text-3xl font-extrabold text-foreground">Demander un accompagnement</h1>
      <p className="mt-3 text-muted">
        Connectez-vous ou créez un compte pour demander un accompagnement personnalisé.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href="/auth/connexion" className="rounded-full bg-aksanti-red px-6 py-3 text-sm font-bold text-white">
          Se connecter
        </a>
        <a href="/auth/inscription" className="rounded-full border-2 border-aksanti-red px-6 py-3 text-sm font-bold text-aksanti-red">
          Créer un compte
        </a>
      </div>
    </div>
  );
}

export default function AccompagnementPage() {
  const { user } = useAuth();

  return (
    <>
      <Header />
      <main className="flex-1 bg-surface py-10">
        <div className="mx-auto px-4 sm:px-6">
          {user ? (
            <RequireAuth requireVerified>
              <AccompanimentForm />
            </RequireAuth>
          ) : (
            <AccompanimentPublic />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
