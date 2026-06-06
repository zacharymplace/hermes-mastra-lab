import fs from "node:fs";

const reportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-report-v8.8.json";

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const artifacts = [
  "hermes/agentic-workflow/run-v3/quality-gate-adoption-report/v8.8.json",
  reportPath,
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-report-v8.8.md"
];

const checks = [
  { id: "runtime-labeled", pass: report.runtime === "hermes-agentic-run-v3-quality-gate-adoption-report-v8.8" },
  { id: "status-reported", pass: report.status === "reported" },
  { id: "adoption-contract-ready", pass: report.checks?.adoptionContractReady === true },
  { id: "implementation-ready", pass: report.checks?.implementationReady === true },
  { id: "validation-ready", pass: report.checks?.validationReady === true },
  { id: "required-checks-declared", pass: report.checks?.requiredChecksDeclared === true },
  { id: "future-phases-declared", pass: report.checks?.futurePhasesDeclared === true },
  { id: "adoption-rules-declared", pass: report.checks?.adoptionRulesDeclared === true },
  { id: "quality-checks-validated", pass: report.checks?.qualityChecksValidated === true },
  { id: "validations-passed", pass: report.checks?.validationsPassed === true },
  { id: "report-only", pass: report.checks?.reportOnly === true },
  { id: "no-patch-applied", pass: report.checks?.noPatchApplied === true },
  { id: "no-branch-created", pass: report.checks?.noBranchCreated === true },
  { id: "no-push", pass: report.checks?.noPush === true },
  { id: "no-merge", pass: report.checks?.noMerge === true },
  { id: "no-pr-opened", pass: report.checks?.noPrOpened === true },
  { id: "artifacts-exist", pass: artifacts.every((p) => fs.existsSync(p)) }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
