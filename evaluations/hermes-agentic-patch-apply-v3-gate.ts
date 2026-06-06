import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(root, "reports/agentic-workflow/hermes-agentic-patch-apply-v3.json"),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/patches/patch-apply-v3.md",
  "hermes/agentic-workflow/approvals/patch-apply-v3.example.json",
  "reports/agentic-workflow/hermes-agentic-patch-apply-v3.json",
  "reports/agentic-workflow/hermes-agentic-patch-apply-v3.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-patch-apply-v3"
  },
  {
    id: "ready-for-human-review",
    pass: report.status === "ready-for-human-review"
  },
  {
    id: "approval-granted",
    pass: report.checks?.approvalGranted === true
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
    id: "patch-applied",
    pass: report.checks?.patchApplied === true
  },
  {
    id: "diff-captured",
    pass: report.checks?.diffCaptured === true
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
    id: "no-auto-push",
    pass: report.checks?.noAutoPush === true
  },
  {
    id: "no-auto-merge",
    pass: report.checks?.noAutoMerge === true
  },
  {
    id: "constrained-patch-only",
    pass: report.checks?.constrainedPatchOnly === true
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
