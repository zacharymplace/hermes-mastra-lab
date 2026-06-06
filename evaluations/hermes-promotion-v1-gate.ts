import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(
    path.join(root, "reports/promotions/hermes-promotion-v1.json"),
    "utf8"
  )
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-promotion-workflow-v1"
  },
  {
    id: "operational-mode",
    pass: report.mode === "operational-local"
  },
  {
    id: "status-promoted",
    pass: report.status === "promoted"
  },
  {
    id: "recommendation-advanced",
    pass: report.checks?.recommendationAdvanced === true
  },
  {
    id: "score-threshold-met",
    pass: report.checks?.scoreThresholdMet === true
  },
  {
    id: "external-review-approved",
    pass: report.checks?.externalReviewApproved === true
  },
  {
    id: "reviewer-captured",
    pass: report.checks?.reviewerCaptured === true
  },
  {
    id: "reason-captured",
    pass: report.checks?.reasonCaptured === true
  },
  {
    id: "artifacts-written",
    pass:
      Array.isArray(report.outputArtifacts) &&
      report.outputArtifacts.every((artifact: string) =>
        fs.existsSync(path.join(root, artifact))
      )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
