import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "hermes/mastra-adapter-spike.json");

const result = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass: result.runtime === "mastra-adapter-spike"
  },
  {
    id: "deterministic-mode",
    pass: result.mode === "local-deterministic"
  },
  {
    id: "has-recommendation",
    pass: Boolean(result.recommendation?.title)
  },
  {
    id: "candidate-count",
    pass: Array.isArray(result.candidates) && result.candidates.length >= 3
  },
  {
    id: "framework-independent-note",
    pass: result.notes?.some((note: string) =>
      note.includes("framework-independent")
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
