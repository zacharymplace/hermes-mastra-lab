import fs from "node:fs";
import path from "node:path";

import {
  approvalStep,
  realSuspendResumeWorkflow
} from "./approval-workflow.js";

const root = process.cwd();
const inputPath = path.join(root, "sentra/sample-input.json");
const outPath = path.join(root, "reports/mastra-real-suspend-resume.json");

const inputData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const run = await realSuspendResumeWorkflow.createRun();

const startResult = await run.start({ inputData });

const report: any = {
  runtime: "mastra-real-suspend-resume-qualification",
  mode: "local-real-mastra-api",
  passed: false,
  suspendedBeforeReview: startResult.status === "suspended",
  startStatus: startResult.status,
  suspended: Array.isArray((startResult as any).suspended)
    ? (startResult as any).suspended
    : [],
  resumeStatus: "not-attempted",
  checks: {
    usedRealSuspend: startResult.status === "suspended",
    usedRealResume: false,
    requiresSnapshotPersistence: false,
    approvalApplied: false,
    reviewerCaptured: false
  },
  notes: [
    "This uses Mastra's real suspend() API.",
    "The workflow suspended before human review data existed.",
    "Resume currently requires workflow snapshot persistence/configuration."
  ]
};

if (startResult.status !== "suspended") {
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
  process.exit(1);
}

try {
  const resumeResult = await run.resume({
    step: approvalStep,
    resumeData: {
      approved: true,
      reviewer: "local-real-suspend-resume-qualification",
      reason: "Recommendation cleared threshold and was explicitly approved."
    }
  });

  report.resumeStatus = resumeResult.status;
  report.result = (resumeResult as any).result;
  report.checks.usedRealResume = true;
  report.checks.approvalApplied =
    resumeResult.status === "success" &&
    (resumeResult as any).result?.status === "approved";
  report.checks.reviewerCaptured =
    (resumeResult as any).result?.review?.reviewer ===
    "local-real-suspend-resume-qualification";
  report.passed =
    report.checks.usedRealSuspend &&
    report.checks.usedRealResume &&
    report.checks.approvalApplied &&
    report.checks.reviewerCaptured;
} catch (error) {
  report.resumeStatus = "blocked";
  report.error = error instanceof Error ? error.message : String(error);
  report.checks.requiresSnapshotPersistence =
    report.error.includes("No snapshot found");
  report.notes.push(
    "Resume failed because no snapshot was found for this workflow run."
  );
}

fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify(report, null, 2));

if (!report.checks.usedRealSuspend) {
  process.exit(1);
}
