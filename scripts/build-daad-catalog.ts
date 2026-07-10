import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { parseDaadSnapshotText } from "../src/lib/bourses/sync/daad-parse-snapshot";

const input =
  process.argv[2] ??
  "C:\\Users\\makun\\.cursor\\projects\\f-dev-pro-aksantiship\\agent-tools\\36e940c7-2d96-4d4d-b0ca-ac1362514659.txt";

const text = readFileSync(input, "utf-8");
const items = parseDaadSnapshotText(text);
const out = path.join(process.cwd(), "data", "daad-catalog-titles.json");
writeFileSync(out, JSON.stringify({ count: items.length, items }, null, 2));
console.log(`Wrote ${items.length} titles to ${out}`);
