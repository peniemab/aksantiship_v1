import {
  buildBourseDetailResponse,
  parseEducationLevelParam,
} from "@/lib/bourses/service";
import type { BourseDetailResponse } from "@/lib/bourses/types";
import { NextResponse } from "next/server";

/**
 * GET /api/bourses/:id
 *
 * Query params :
 * - niveauEtudes : optionnel — inclut le score de compatibilité profil
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const niveauEtudes = parseEducationLevelParam(searchParams.get("niveauEtudes"));

  const result = buildBourseDetailResponse(id, niveauEtudes);

  if (!result) {
    return NextResponse.json({ error: "Bourse introuvable." }, { status: 404 });
  }

  const response: BourseDetailResponse = result;
  return NextResponse.json(response);
}
