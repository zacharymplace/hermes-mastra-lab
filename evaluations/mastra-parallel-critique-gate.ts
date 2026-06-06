import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const inputPath = path.join(root, "hermes/mastra-native-parallel-critique.json");

const result = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass: result.runtime === "mastra-native-parallel-critique"
  },
  {
    id: "candidate-count",
    pass: Array.isArray(result.candidates) && result.candidates.length >= 3
  },
  {
    id: "parallel-critiques-present",
    pass: result.candidates.every(
      (candidate: any) =>
        Array.isArray(candidate.critiques) && candidate.critiques.length === 3
    )
  },
  {
    id: "lane-coverage",
    pass: result.candidates.every((candidate: any) => {
      const lanes = candidate.critiques.map((critique: any) => critique.lane);
      return ["strategy", "execution", "architecture"].every((lane) =>
        lanes.includes(lane)
      );
    })
  },
  {
    id: "fanout-note",
    pass: result.notes?.some((note: string) => note.includes("fan-out/fan-in"))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
