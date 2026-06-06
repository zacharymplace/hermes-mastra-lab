import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "hermes/mastra-native-human-review.json");

const result = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass: result.runtime === "mastra-native-human-review"
  },
  {
    id: "review-mode",
    pass: result.mode === "local-deterministic-review-simulation"
  },
  {
    id: "status-approved",
    pass: result.status === "approved"
  },
  {
    id: "review-present",
    pass: Boolean(result.review?.decision && result.review?.reason)
  },
  {
    id: "explicit-promotion-note",
    pass: result.notes?.some((note: string) =>
      note.includes("promotion remains explicit")
    )
  },
  {
    id: "recommendation-present",
    pass: Boolean(result.recommendation?.title)
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
