import fs from "node:fs";
import path from "node:path";

import { failureRecoveryWorkflow } from "./workflow.js";

const root = process.cwd();

const markerPath = path.join(root, "tmp/failure-recovery-attempts.txt");
const stepOutputPath = path.join(root, "tmp/failure-recovery-step-output.json");
const outPath = path.join(root, "reports/mastra-failure-recovery.json");

fs.rmSync(markerPath, { force: true });
fs.rmSync(stepOutputPath, { force: true });

const inputData = {
  failMarkerPath: markerPath,
  outputPath: stepOutputPath
};

const firstRun = await failureRecoveryWorkflow.createRun();

let firstStatus = "unknown";
let firstError = "";

try {
  const firstResult = await firstRun.start({ inputData });
  firstStatus = firstResult.status;
} catch (error) {
  firstStatus = "threw";
  firstError = error instanceof Error ? error.message : String(error);
}

const attemptsAfterFailure = fs.existsSync(markerPath)
  ? Number(fs.readFileSync(markerPath, "utf8"))
  : 0;

const secondRun = await failureRecoveryWorkflow.createRun();
const secondResult = await secondRun.start({ inputData });

const attemptsAfterRecovery = fs.existsSync(markerPath)
  ? Number(fs.readFileSync(markerPath, "utf8"))
  : 0;

const stepOutput = fs.existsSync(stepOutputPath)
  ? JSON.parse(fs.readFileSync(stepOutputPath, "utf8"))
  : null;

const report = {
  runtime: "mastra-failure-recovery-qualification",
  mode: "local-real-mastra-api",
  passed:
    firstStatus === "threw" &&
    firstError.includes("Intentional first-attempt failure") &&
    attemptsAfterFailure === 1 &&
    secondResult.status === "success" &&
    attemptsAfterRecovery === 2 &&
    stepOutput?.status === "recovered",
  firstRun: {
    status: firstStatus,
    error: firstError
  },
  secondRun: {
    status: secondResult.status,
    result: secondResult.status === "success" ? secondResult.result : null
  },
  checks: {
    firstAttemptFailed: firstStatus === "threw",
    failureReasonCaptured: firstError.includes("Intentional first-attempt failure"),
    attemptStateRecorded: attemptsAfterFailure === 1,
    secondAttemptSucceeded: secondResult.status === "success",
    recoveryStateRecorded: attemptsAfterRecovery === 2,
    outputArtifactWritten: Boolean(stepOutput),
    recoveredOutputValid: stepOutput?.status === "recovered"
  },
  notes: [
    "This qualifies explicit failure recovery by rerunning a failed workflow after persisted attempt state exists.",
    "It does not yet prove built-in automatic retry policy behavior.",
    "The next test should inspect Mastra-native retry configuration if available."
  ]
};

fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify(report, null, 2));

if (!report.passed) {
  process.exit(1);
}
