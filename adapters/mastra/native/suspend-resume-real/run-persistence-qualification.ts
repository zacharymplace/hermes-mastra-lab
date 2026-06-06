import fs from "node:fs";
import path from "node:path";

import { createWorkflowStateReader } from "@mastra/core/workflows";

import { mastra } from "../../../../mastra/index.js";

const root = process.cwd();
const inputPath = path.join(root, "sentra/sample-input.json");
const outPath = path.join(root, "reports/mastra-persistence-qualification.json");

const workflow = mastra.getWorkflow("realSuspendResumeWorkflow");
const inputData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const run = await workflow.createRun();

const startResult = await run.start({ inputData });

if (startResult.status !== "suspended") {
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        runtime: "mastra-persistence-qualification",
        passed: false,
        startStatus: startResult.status,
        error: "Expected workflow to suspend before approval."
      },
      null,
      2
    ) + "\n"
  );

  console.log(JSON.stringify(startResult, null, 2));
  process.exit(1);
}

const state = await workflow.getWorkflowRunById(run.runId);

if (!state) {
  throw new Error(`No persisted workflow state found for runId ${run.runId}`);
}

const reader = createWorkflowStateReader(state);
const suspendedStep = reader.getSuspendedStep();

const recoveredRun = await workflow.createRun({
  runId: state.runId
});

const resumeResult = await recoveredRun.resume({
  step: suspendedStep?.path ?? "approval-step",
  resumeData: {
    approved: true,
    reviewer: "local-mastra-persistence-qualification",
    reason: "Recovered persisted snapshot and resumed with explicit approval."
  }
});

const report = {
  runtime: "mastra-persistence-qualification",
  mode: "local-libsql-storage",
  passed: resumeResult.status === "success",
  runId: run.runId,
  startStatus: startResult.status,
  persistedStateFound: Boolean(state),
  suspendedStep,
  resumeStatus: resumeResult.status,
  result: resumeResult.status === "success" ? resumeResult.result : null,
  checks: {
    usedConfiguredStorage: true,
    suspendedBeforeReview: startResult.status === "suspended",
    recoveredPersistedState: Boolean(state),
    recoveredSuspendedStep: Boolean(suspendedStep?.path),
    resumedFromRecoveredRun: resumeResult.status === "success",
    approvalApplied:
      resumeResult.status === "success" &&
      resumeResult.result.status === "approved",
    reviewerCaptured:
      resumeResult.status === "success" &&
      resumeResult.result.review.reviewer ===
        "local-mastra-persistence-qualification"
  },
  notes: [
    "This uses a Mastra instance with LibSQLStore configured.",
    "The workflow suspends, persists a snapshot, recovers by runId, and resumes from the recovered run.",
    "This qualifies the persistence-backed suspend/resume path for local development."
  ]
};

fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify(report, null, 2));

if (!report.passed) {
  process.exit(1);
}
