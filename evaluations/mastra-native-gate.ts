import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "hermes/mastra-native-workflow.json");

const result = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass: result.runtime === "mastra-native-workflow"
  },
  {
    id: "deterministic-mode",
    pass: result.mode === "local-deterministic"
  },
  {
    id: "recommendation-present",
    pass: Boolean(result.recommendation?.title)
  },
  {
    id: "candidate-count",
    pass: Array.isArray(result.candidates) && result.candidates.length >= 3
  },
  {
    id: "native-workflow-note",
    pass: result.notes?.some((note: string) =>
      note.includes("Mastra-native workflow")
    )
  },
  {
    id: "domain-logic-contained",
    pass: result.notes?.some((note: string) =>
      note.includes("domain logic still lives outside Mastra")
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
