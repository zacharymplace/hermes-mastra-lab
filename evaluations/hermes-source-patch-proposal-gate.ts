import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/source-patches/hermes-source-patch-proposal.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "reports/agentic-workflow/source-patches/hermes-source-patch-proposal.json",
  "reports/agentic-workflow/source-patches/hermes-source-patch-proposal.md",
  "hermes/agentic-workflow/source-patches/v1.json"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-source-patch-proposal-v1"
  },
  {
    id: "status-proposed",
    pass: report.status === "proposed"
  },
  {
    id: "selected-agentic-project",
    pass: report.checks?.selectedProjectIsAgenticWorkflow === true
  },
  {
    id: "execution-report-ready",
    pass: report.checks?.executionReportReady === true
  },
  {
    id: "proposal-only",
    pass: report.checks?.proposalOnly === true
  },
  {
    id: "source-changes-not-applied",
    pass: report.checks?.sourceChangesNotApplied === true
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
    id: "no-push",
    pass: report.checks?.noPush === true
  },
  {
    id: "target-files-declared",
    pass: report.checks?.targetFilesDeclared === true
  },
  {
    id: "validation-commands-declared",
    pass: report.checks?.validationCommandsDeclared === true
  },
  {
    id: "rollback-notes-declared",
    pass: report.checks?.rollbackNotesDeclared === true
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
