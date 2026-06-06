import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.json";

const report = JSON.parse(fs.readFileSync(path.join(root, reportPath), "utf8"));

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v3/quality-gate-adoption-contract/v8.7.json",
  reportPath,
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.md"
];

const requiredChecks = [
  "generated-artifact-drift",
  "stale-timestamp-churn",
  "no-op-patch-claims",
  "human-boundary-preservation",
  "declared-target-only-changes"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7"
  },
  {
    id: "status-contracted",
    pass: report.status === "contracted"
  },
  {
    id: "validation-ready",
    pass: report.checks?.validationReady === true
  },
  {
    id: "implementation-ready",
    pass: report.checks?.implementationReady === true
  },
  {
    id: "quality-gate-validated",
    pass: report.checks?.qualityGateValidated === true
  },
  {
    id: "prior-failure-resolved",
    pass: report.checks?.priorFailureResolved === true
  },
  {
    id: "adoption-rules-declared",
    pass:
      Array.isArray(report.adoptionContract?.adoptionRules) &&
      report.adoptionContract.adoptionRules.length >= 5
  },
  {
    id: "future-phases-declared",
    pass:
      Array.isArray(report.adoptionContract?.appliesToFuturePhases) &&
      report.adoptionContract.appliesToFuturePhases.includes("source-patch-apply")
  },
  {
    id: "required-checks-declared",
    pass: requiredChecks.every((check) =>
      report.adoptionContract?.requiredBeforePatchApply?.includes(check)
    )
  },
  {
    id: "validations-passed",
    pass: report.checks?.validationsPassed === true
  },
  {
    id: "contract-only",
    pass: report.checks?.contractOnly === true
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
