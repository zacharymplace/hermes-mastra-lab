import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const sourcePath = path.join(root, "sentra/promotions/current.json");
const outPath = path.join(root, "sentra/promotion-input.json");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const artifact = {
  runtime: "sentra-promotion-input-v1",
  generatedAt: new Date().toISOString(),
  sourceArtifact: "sentra/promotions/current.json",
  goal: source.goal,
  constraints: source.constraints,
  context: source.context,
  notes: [
    "This is the Sentra-authored input artifact for Hermes promotion.",
    "Hermes promotion workflow should read this artifact instead of static sample input.",
    "Sentra owns current operating context; Hermes owns recommendation and promotion."
  ]
};

fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2) + "\n");

console.log(JSON.stringify(artifact, null, 2));
