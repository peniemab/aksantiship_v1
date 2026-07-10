import { readFileSync } from "fs";
import {
  parseJassoTuitionSearchHtml,
  parseJpssScholarshipsHtml,
} from "../src/lib/bourses/sync/japan-parse-html";

const jpss = parseJpssScholarshipsHtml(
  readFileSync("data/samples/japan/jpss-page1-sample.html", "utf-8"),
);
const tuition = parseJassoTuitionSearchHtml(
  readFileSync("data/samples/japan/japan-tuition-search-sample.html", "utf-8"),
);

console.log("jpss page1", jpss.length, jpss[0]?.title);
console.log("tuition sample", tuition.length, tuition[0]?.title);
