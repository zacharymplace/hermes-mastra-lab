import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/mastra-external-human-input.json"), "utf8")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "mastra-external-human-input-qualification"
  },
  {
    id: "file-review-mode",
    pass: report.mode === "local-file-review-artifact"
  },
  {
    id: "review-artifact-exists",
    pass: report.checks?.reviewArtifactExists === true
  },
  {
    id: "review-loaded-externally",
    pass: report.checks?.reviewLoadedExternally === true
  },
  {
    id: "suspended-before-review",
    pass: report.checks?.suspendedBeforeReview === true
  },
  {
    id: "persisted-state-recovered",
    pass: report.checks?.recoveredPersistedState === true
  },
  {
    id: "resumed-from-recovered-run",
    pass: report.checks?.resumedFromRecoveredRun === true
  },
  {
    id: "approval-applied",
    pass: report.checks?.approvalApplied === true
  },
  {
    id: "reviewer-captured",
    pass: report.checks?.reviewerCaptured === true
  },
  {
    id: "reason-captured",
    pass: report.checks?.reasonCaptured === true
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
