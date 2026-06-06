import fs from "node:fs";
import path from "node:path";

import { ideaRecommendationWorkflow } from "./idea-workflow.js";

const root = process.cwd();
const inputPath = path.join(root, "sentra/sample-input.json");
const outPath = path.join(root, "hermes/mastra-native-workflow.json");

const inputData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const run = await ideaRecommendationWorkflow.createRun();
const result = await run.start({ inputData });

if (result.status !== "success") {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

fs.writeFileSync(outPath, JSON.stringify(result.result, null, 2) + "\n");

console.log(JSON.stringify(result.result, null, 2));
