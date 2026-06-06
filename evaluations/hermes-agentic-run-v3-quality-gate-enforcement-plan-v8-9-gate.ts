import fs from "node:fs";

const reportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.json";

const machinePath =
  "hermes/agentic-workflow/run-v3/quality-gate-enforcement-plan/v8.9.json";

const markdownPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.md";

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass:
      report.runtime ===
      "hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9"
  },
  {
    id: "status-planned",
    pass: report.status === "planned"
  },
  {
    id: "adoption-report-ready",
    pass: report.checks?.adoptionReportReady === true
  },
  {
    id: "adoption-contract-ready",
    pass: report.checks?.adoptionContractReady === true
  },
  {
    id: "required-checks-carried-forward",
    pass: report.checks?.requiredChecksCarriedForward === true
  },
  {
    id: "future-phases-carried-forward",
    pass: report.checks?.futurePhasesCarriedForward === true
  },
  {
    id: "enforcement-points-declared",
    pass: report.checks?.enforcementPointsDeclared === true
  },
  {
    id: "required-gate-outputs-declared",
    pass: report.checks?.requiredGateOutputsDeclared === true
  },
  {
    id: "enforcement-rules-declared",
    pass: report.checks?.enforcementRulesDeclared === true
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "plan-only",
    pass: report.checks?.planOnly === true
  },
  {
    id: "no-patch-applied",
    pass: report.checks?.noPatchApplied === true
  },
  {
    id: "no-branch-created",
    pass: report.checks?.noBranchCreated === true
  },
  {
    id: "no-push",
    pass: report.checks?.noPush === true
  },
  {
    id: "no-merge",
    pass: report.checks?.noMerge === true
  },
  {
    id: "no-pr-opened",
    pass: report.checks?.noPrOpened === true
  },
  {
    id: "artifacts-exist",
    pass:
      fs.existsSync(reportPath) &&
      fs.existsSync(machinePath) &&
      fs.existsSync(markdownPath)
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
