import fs from "node:fs";
import path from "node:path";

import { createWorkflowStateReader } from "@mastra/core/workflows";

import { mastra } from "../../../../mastra/index.js";

const root = process.cwd();
const inputPath = path.join(root, "sentra/sample-input.json");
const reviewPath = path.join(root, "reviews/pending-approval.json");
const reviewExamplePath = path.join(root, "reviews/pending-approval.example.json");
const outPath = path.join(root, "reports/mastra-external-human-input.json");

const workflow = mastra.getWorkflow("realSuspendResumeWorkflow");
const inputData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

if (!fs.existsSync(reviewPath)) {
  fs.copyFileSync(reviewExamplePath, reviewPath);
}

const run = await workflow.createRun();
const startResult = await run.start({ inputData });

if (startResult.status !== "suspended") {
  const failure = {
    runtime: "mastra-external-human-input-qualification",
    mode: "local-file-review-artifact",
    passed: false,
    startStatus: startResult.status,
    error: "Expected workflow to suspend before reading external review."
  };

  fs.writeFileSync(outPath, JSON.stringify(failure, null, 2) + "\n");
  console.log(JSON.stringify(failure, null, 2));
  process.exit(1);
}

const state = await workflow.getWorkflowRunById(run.runId);

if (!state) {
  throw new Error(`No persisted workflow state found for runId ${run.runId}`);
}

const reader = createWorkflowStateReader(state);
const suspendedStep = reader.getSuspendedStep();

if (!suspendedStep?.path) {
  throw new Error("No suspended step path found in persisted workflow state.");
}

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));

const recoveredRun = await workflow.createRun({
  runId: state.runId
});

const resumeResult = await recoveredRun.resume({
  step: suspendedStep.path,
  resumeData: review
});

const report = {
  runtime: "mastra-external-human-input-qualification",
  mode: "local-file-review-artifact",
  passed: resumeResult.status === "success",
  runId: run.runId,
  reviewArtifact: "reviews/pending-approval.json",
  review,
  startStatus: startResult.status,
  persistedStateFound: Boolean(state),
  suspendedStep,
  resumeStatus: resumeResult.status,
  result: resumeResult.status === "success" ? resumeResult.result : null,
  checks: {
    reviewArtifactExists: fs.existsSync(reviewPath),
    reviewLoadedExternally: Boolean(review.reviewer && review.reason),
    suspendedBeforeReview: startResult.status === "suspended",
    recoveredPersistedState: Boolean(state),
    recoveredSuspendedStep: Boolean(suspendedStep.path),
    resumedFromRecoveredRun: resumeResult.status === "success",
    approvalApplied:
      resumeResult.status === "success" &&
      resumeResult.result.status === "approved",
    reviewerCaptured:
      resumeResult.status === "success" &&
      resumeResult.result.review.reviewer === review.reviewer,
    reasonCaptured:
      resumeResult.status === "success" &&
      resumeResult.result.review.reason === review.reason
  },
  notes: [
    "This uses a file-based external review artifact as the human input source.",
    "The workflow suspends before external review data is read.",
    "The workflow resumes from persisted state after review data is loaded from disk.",
    "This qualifies the external-human-input promotion blocker for local development."
  ]
};

fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify(report, null, 2));

if (!report.passed) {
  process.exit(1);
}
