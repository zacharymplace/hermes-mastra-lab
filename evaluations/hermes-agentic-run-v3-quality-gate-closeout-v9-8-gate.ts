import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-closeout-v9.8.json"
);

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v3/quality-gate-closeout/v9.8.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-closeout-v9.8.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-closeout-v9.8.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v3-quality-gate-closeout-v9.8"
  },
  {
    id: "status-closed-out",
    pass: report.status === "closed-out"
  },
  {
    id: "input-artifacts-present",
    pass: report.checks?.inputArtifactsPresent === true
  },
  {
    id: "index-ready",
    pass: report.checks?.indexReady === true
  },
  {
    id: "quality-gate-validated",
    pass: report.checks?.qualityGateValidated === true
  },
  {
    id: "quality-gate-passed",
    pass: report.checks?.qualityGatePassed === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "next-step-declared",
    pass:
      report.closeout?.nextRecommendedStep?.id ===
      "run-v4-quality-gated-source-patch-proposal-v10.0"
  },
  {
    id: "closeout-only",
    pass: report.safetyBoundary?.closeoutOnly === true
  },
  {
    id: "no-broad-source-rewrite",
    pass: report.safetyBoundary?.broadSourceRewrite === false
  },
  {
    id: "no-patch-applied",
    pass: report.safetyBoundary?.patchApplied === false
  },
  {
    id: "no-branch-created",
    pass: report.safetyBoundary?.branchCreated === false
  },
  {
    id: "no-push",
    pass: report.safetyBoundary?.pushed === false
  },
  {
    id: "no-merge",
    pass: report.safetyBoundary?.merged === false
  },
  {
    id: "no-pr-opened",
    pass: report.safetyBoundary?.prOpened === false
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((p) => fs.existsSync(path.join(root, p)))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
