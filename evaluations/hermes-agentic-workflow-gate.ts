import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(root, "reports/agentic-workflow/hermes-agentic-execution-report.json"),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/v1.json",
  "reports/agentic-workflow/hermes-agentic-execution-plan.json",
  "reports/agentic-workflow/hermes-agentic-patch-proposal.md",
  "reports/agentic-workflow/hermes-agentic-execution-report.json",
  "reports/agentic-workflow/hermes-agentic-execution-report.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-workflow-v1"
  },
  {
    id: "ready-for-approval",
    pass: report.status === "ready-for-human-approval"
  },
  {
    id: "selected-agentic-project",
    pass: report.checks?.selectedProjectIsAgenticWorkflow === true
  },
  {
    id: "execution-plan-written",
    pass: report.checks?.executionPlanWritten === true
  },
  {
    id: "patch-proposal-written",
    pass: report.checks?.patchProposalWritten === true
  },
  {
    id: "validation-commands-defined",
    pass: report.checks?.validationCommandsDefined === true
  },
  {
    id: "approval-required",
    pass: report.checks?.approvalRequired === true
  },
  {
    id: "safe-scope-defined",
    pass: report.checks?.safeScopeDefined === true
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
