import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/mastra-failure-recovery.json"), "utf8")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "mastra-failure-recovery-qualification"
  },
  {
    id: "real-api-mode",
    pass: report.mode === "local-real-mastra-api"
  },
  {
    id: "first-attempt-failed",
    pass:
      report.checks?.firstAttemptFailed === true &&
      ["failed", "threw"].includes(report.firstRun?.status)
  },
  {
    id: "failure-reason-captured",
    pass: report.checks?.failureReasonCaptured === true
  },
  {
    id: "attempt-state-recorded",
    pass: report.checks?.attemptStateRecorded === true
  },
  {
    id: "second-attempt-succeeded",
    pass: report.checks?.secondAttemptSucceeded === true
  },
  {
    id: "recovery-state-recorded",
    pass: report.checks?.recoveryStateRecorded === true
  },
  {
    id: "output-artifact-written",
    pass: report.checks?.outputArtifactWritten === true
  },
  {
    id: "recovered-output-valid",
    pass: report.checks?.recoveredOutputValid === true
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
