import fs from "node:fs";
import path from "node:path";

import { generateIdeas, type IdeaInput } from "../agents/generator.js";
import { critiqueIdea } from "../agents/critic.js";
import { scoreIdea } from "../evaluations/scorer.js";

const root = process.cwd();
const inputPath = path.join(root, "sentra/sample-input.json");
const outPath = path.join(root, "hermes/idea-recommendation.json");

const input = JSON.parse(fs.readFileSync(inputPath, "utf8")) as IdeaInput;

const ideas = generateIdeas(input)
  .map(critiqueIdea)
  .map(scoreIdea)
  .sort((a, b) => b.score - a.score);

const recommendation = {
  generatedAt: new Date().toISOString(),
  goal: input.goal,
  recommendation: ideas[0],
  candidates: ideas
};

fs.writeFileSync(outPath, JSON.stringify(recommendation, null, 2) + "\n");

console.log(JSON.stringify(recommendation, null, 2));
