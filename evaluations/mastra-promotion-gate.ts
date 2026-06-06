import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/mastra-promotion-v1.json"), "utf8")
);

const checks = [
  {
    id: "decision-present",
    pass: ["promote", "continue-evaluation", "reject"].includes(report.decision)
  },
  {
    id: "inputs-present",
    pass:
      Boolean(report.inputs?.mastraQualification) &&
      Boolean(report.inputs?.langfuseQualification) &&
      Boolean(report.inputs?.failureQualification)
  },
  {
    id: "evidence-present",
    pass: Array.isArray(report.evidence) && report.evidence.length >= 4
  },
  {
    id: "blockers-present",
    pass: Array.isArray(report.blockers) && report.blockers.length >= 4
  },
  {
    id: "high-blockers-prevent-promotion",
    pass:
      report.blockers.some(
        (blocker: any) =>
          blocker.status === "open" && blocker.severity === "high"
      )
        ? report.decision !== "promote"
        : true
  },
  {
    id: "required-for-promotion-present",
    pass:
      Array.isArray(report.requiredForPromotion) &&
      report.requiredForPromotion.length >= 4
  },
  {
    id: "framework-independent-boundary",
    pass: report.decisionBoundary?.includes("framework-independent")
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
