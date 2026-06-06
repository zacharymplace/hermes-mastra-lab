import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "hermes/idea-recommendation.json");
const outPath = path.join(root, "hermes/idea-recommendation.md");

const report = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const rec = report.recommendation;

const lines = [
  "# Hermes Idea Recommendation",
  "",
  `Generated: ${report.generatedAt}`,
  `Goal: ${report.goal}`,
  "",
  "## Recommendation",
  "",
  `**${rec.title}**`,
  "",
  rec.summary,
  "",
  `Score: ${rec.score}`,
  `Verdict: ${rec.verdict}`,
  "",
  "## Rationale",
  "",
  ...rec.rationale.map((item: string) => `- ${item}`),
  "",
  "## Risks",
  "",
  ...rec.risks.map((item: string) => `- ${item}`),
  "",
  "## Candidates",
  "",
  ...report.candidates.map(
    (item: any) => `- ${item.title}: ${item.score} (${item.verdict})`
  ),
  ""
];

fs.writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${outPath}`);
