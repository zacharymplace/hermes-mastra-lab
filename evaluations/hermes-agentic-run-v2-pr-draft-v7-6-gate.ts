import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-draft-v7.6.json";

const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/pr-draft-v7.6.json",
  reportPath,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-draft-v7.6.md"
];

const checks = [
  { id: "runtime-labeled", pass: report.runtime === "hermes-agentic-run-v2-pr-draft-v7.6" },
  { id: "status-drafted", pass: report.status === "drafted-for-human-review" },
  { id: "source-validation-ready", pass: report.checks?.sourceValidationReady === true },
  { id: "pr-draft-written", pass: report.checks?.prDraftWritten === true },
  { id: "body-written", pass: report.checks?.bodyWritten === true },
  { id: "commands-declared", pass: report.checks?.commandsDeclared === true },
  { id: "pr-draft-only", pass: report.checks?.prDraftOnly === true },
  { id: "no-branch-created", pass: report.checks?.noBranchCreated === true },
  { id: "no-push", pass: report.checks?.noPush === true },
  { id: "no-pr-opened", pass: report.checks?.noPrOpened === true },
  { id: "no-merge", pass: report.checks?.noMerge === true },
  {
    id: "human-approval-required",
    pass: report.checks?.humanApprovalRequiredForGithubActions === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((artifact) => fs.existsSync(path.join(root, artifact)))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
