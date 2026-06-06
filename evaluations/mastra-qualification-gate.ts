import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "reports/mastra-qualification.json");

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const checks = [
  {
    id: "recommendation-present",
    pass: ["advance-with-constraints", "continue-evaluation", "hold"].includes(
      report.recommendation
    )
  },
  {
    id: "score-present",
    pass: report.score?.total > 0 && report.score?.max === 30
  },
  {
    id: "all-six-stages-present",
    pass: Array.isArray(report.stages) && report.stages.length === 6
  },
  {
    id: "all-stages-pass",
    pass: report.stages.every((stage: any) => stage.status === "pass")
  },
  {
    id: "criteria-present",
    pass: Array.isArray(report.criteria) && report.criteria.length === 6
  },
  {
    id: "decision-boundary-preserved",
    pass: report.decisionBoundary?.includes("framework-independent")
  },
  {
    id: "next-tests-present",
    pass: Array.isArray(report.nextTests) && report.nextTests.length >= 3
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
