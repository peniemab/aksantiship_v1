import { getScholarshipStatsServer } from "@/lib/bourses/repository.server";
import { NextResponse } from "next/server";

/** GET /api/bourses/stats — volumes par source de données */
export async function GET() {
  const stats = getScholarshipStatsServer();
  return NextResponse.json({
    ...stats,
    message: `${stats.total} bourses disponibles (${stats.curated} curated, ${stats.catalog} catalogue, ${stats.synced} synchronisées RSS).`,
  });
}
