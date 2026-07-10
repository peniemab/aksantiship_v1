import { runScholarshipSync } from "@/lib/bourses/sync/run-sync";
import { NextResponse } from "next/server";

/**
 * GET /api/cron/sync-bourses
 * Synchronise les bourses depuis les flux RSS configurés.
 * Protégé par CRON_SECRET (header Authorization: Bearer <secret>).
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }
  }

  try {
    const report = await runScholarshipSync();
    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Échec de la synchronisation." },
      { status: 500 },
    );
  }
}
