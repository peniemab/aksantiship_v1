import {
  buildBoursesListResponse,
  parseEducationLevelParam,
  parseStatusParam,
} from "@/lib/bourses/service";
import type { BoursesListResponse } from "@/lib/bourses/types";
import { NextResponse } from "next/server";

/**
 * GET /api/bourses
 *
 * Query params :
 * - status       : encours | fermee | a_venir
 * - featured     : true — bourses vitrine
 * - niveauEtudes : finaliste | bachelor | … — pour le matching profil
 * - matchOnly    : true — uniquement les bourses compatibles (nécessite niveauEtudes)
 * - includeMatch : true — ajoute score/raison sur chaque bourse
 * - q            : recherche texte (nom, pays, niveaux, avantages)
 * - pays         : filtre par pays hôte
 * - cycle        : undergraduate | master | doctorate
 * - nationalite  : filtre éligibilité (ex. RDC, Congo, Sénégal)
 * - langue       : filtre langue requise (ex. Anglais, Allemand)
 * - communaute   : filtre communauté belge (FWB, Flandre)
 * - langueEnseignement : filtre langue d'enseignement (Français, Néerlandais, Anglais)
 * - typeCandidature  : directe | via_etablissement | automatique_admission (Canada)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const status = parseStatusParam(searchParams.get("status"));
  const featured = searchParams.get("featured") === "true";
  const niveauEtudes = parseEducationLevelParam(searchParams.get("niveauEtudes"));
  const matchOnly = searchParams.get("matchOnly") === "true";
  const includeMatch = searchParams.get("includeMatch") === "true";
  const q = searchParams.get("q") ?? undefined;
  const pays = searchParams.get("pays") ?? undefined;
  const nationalite = searchParams.get("nationalite") ?? undefined;
  const langue = searchParams.get("langue") ?? undefined;
  const communaute = searchParams.get("communaute") ?? undefined;
  const langueEnseignement = searchParams.get("langueEnseignement") ?? undefined;
  const typeCandidature = searchParams.get("typeCandidature") ?? undefined;
  const cycleParam = searchParams.get("cycle");
  const cycle =
    cycleParam === "undergraduate" ||
    cycleParam === "master" ||
    cycleParam === "doctorate"
      ? cycleParam
      : undefined;

  if (matchOnly && !niveauEtudes) {
    return NextResponse.json(
      { error: "Le paramètre niveauEtudes est requis lorsque matchOnly=true." },
      { status: 400 },
    );
  }

  const { data, meta } = buildBoursesListResponse({
    status,
    featured,
    niveauEtudes,
    matchOnly,
    includeMatch: includeMatch || matchOnly,
    q,
    pays,
    cycle,
    nationalite,
    langue,
    communaute,
    langueEnseignement,
    typeCandidature,
  });

  const response: BoursesListResponse = { data, meta };
  return NextResponse.json(response);
}
