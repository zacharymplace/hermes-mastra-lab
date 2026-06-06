import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(root, "reports/agentic-workflow/hermes-agentic-execution-v2.json"),
    "utf8"
  )
);

const requiredArtifacts = [
  "reports/agentic-workflow/patches/latest.md",
  "reports/agentic-workflow/hermes-agentic-execution-v2.json",
  "reports/agentic-workflow/hermes-agentic-execution-v2.md",
  "hermes/agentic-workflow/executions/latest.json"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-execution-v2"
  },
  {
    id: "ready-for-human-approval",
    pass: report.status === "ready-for-human-approval"
  },
  {
    id: "selected-agentic-workflow",
    pass: report.checks?.selectedProjectIsAgenticWorkflow === true
  },
  {
    id: "patch-candidate-written",
    pass: report.checks?.patchCandidateWritten === true
  },
  {
    id: "validation-ran",
    pass: report.checks?.validationRan === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "human-approval-required",
    pass: report.checks?.humanApprovalRequired === true
  },
  {
    id: "no-auto-merge",
    pass: report.checks?.noAutoMerge === true
  },
  {
    id: "no-auto-push",
    pass: report.checks?.noAutoPush === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((artifact) =>
      fs.existsSync(path.join(root, artifact))
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
