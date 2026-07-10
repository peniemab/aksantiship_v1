/** Parse un export texte du catalogue DAAD (titres ## ...) */
export function parseDaadSnapshotText(text: string): { title: string; provider: string }[] {
  const lines = text.split("\n");
  const items: { title: string; provider: string }[] = [];

  for (const line of lines) {
    const m = line.match(/^## (.+)$/);
    if (!m) continue;
    const raw = m[1].trim();
    if (raw.startsWith("Refine your selection")) continue;
    if (raw === "Important Information • DAAD") continue;

    const parts = raw.split("•").map((s) => s.trim());
    const provider = parts.length > 1 ? parts[parts.length - 1] : "DAAD";
    const title = parts.length > 1 ? parts.slice(0, -1).join(" • ") : raw;
    items.push({ title, provider });
  }

  const byKey = new Map<string, { title: string; provider: string }>();
  for (const item of items) {
    byKey.set(`${item.title}::${item.provider}`, item);
  }
  return [...byKey.values()];
}
