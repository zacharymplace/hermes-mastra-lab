import fs from "node:fs";

const requiredFiles = [
  "sentra/sample-input.json",
  "agents/generator.ts",
  "agents/critic.ts",
  "evaluations/scorer.ts",
  "evaluations/promotion-gate.ts",
  "workflows/idea-recommendation.ts",
  "workflows/write-experiment-report.ts",
  "hermes/idea-recommendation.json",
  "hermes/idea-recommendation.md",
  "docs/mastra-evaluation.md"
];

const missing = requiredFiles.filter((file) => !fs.existsSync(file));

const status = {
  name: "hermes-mastra-lab",
  status: missing.length === 0 ? "healthy" : "unhealthy",
  requiredFiles: requiredFiles.length,
  missing
};

console.log(JSON.stringify(status, null, 2));

if (missing.length > 0) {
  process.exit(1);
}
