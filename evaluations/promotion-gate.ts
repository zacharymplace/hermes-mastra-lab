import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "hermes/idea-recommendation.json");

const report = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const rec = report.recommendation;

const checks = [
  {
    id: "has-recommendation",
    pass: Boolean(rec?.title && rec?.summary)
  },
  {
    id: "score-threshold",
    pass: rec?.score >= 18
  },
  {
    id: "verdict-advance",
    pass: rec?.verdict === "advance"
  },
  {
    id: "has-risks",
    pass: Array.isArray(rec?.risks) && rec.risks.length > 0
  },
  {
    id: "has-candidate-comparison",
    pass: Array.isArray(report.candidates) && report.candidates.length >= 3
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
