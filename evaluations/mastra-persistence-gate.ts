import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/mastra-persistence-qualification.json"), "utf8")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "mastra-persistence-qualification"
  },
  {
    id: "storage-mode",
    pass: report.mode === "local-libsql-storage"
  },
  {
    id: "suspended-before-review",
    pass: report.checks?.suspendedBeforeReview === true
  },
  {
    id: "persisted-state-found",
    pass: report.checks?.recoveredPersistedState === true
  },
  {
    id: "suspended-step-recovered",
    pass: report.checks?.recoveredSuspendedStep === true
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
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
