import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(root, "reports/priorities/sentra-project-prioritization.json"),
    "utf8"
  )
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "sentra-multi-project-prioritization-v1"
  },
  {
    id: "candidates-present",
    pass: report.checks?.hasCandidates === true
  },
  {
    id: "selected-project-present",
    pass: report.checks?.selectedProjectPresent === true
  },
  {
    id: "scores-computed",
    pass: report.checks?.scoresComputed === true
  },
  {
    id: "highest-score-selected",
    pass: report.checks?.selectedHighestScore === true
  },
  {
    id: "risks-captured",
    pass: report.checks?.risksCaptured === true
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
