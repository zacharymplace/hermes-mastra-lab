import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.json";

const artifact = JSON.parse(
  fs.readFileSync(path.join(root, reportPath), "utf8")
);

const exists = (p: string) => fs.existsSync(path.join(root, p));

const checks = [
  {
    id: "runtime-labeled",
    pass:
      artifact.runtime ===
      "hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1"
  },
  { id: "status-implemented", pass: artifact.status === "implemented" },
  {
    id: "enforcement-intent-ready",
    pass: artifact.checks?.enforcementIntentReady === true
  },
  {
    id: "enforcement-plan-ready",
    pass: artifact.checks?.enforcementPlanReady === true
  },
  {
    id: "adoption-report-ready",
    pass: artifact.checks?.adoptionReportReady === true
  },
  {
    id: "quality-gate-shape-declared",
    pass:
      artifact.checks?.qualityGateShapeDeclared === true &&
      artifact.enforcementImplementation?.qualityGateShape?.status === "required"
  },
  {
    id: "required-checks-carried-forward",
    pass:
      artifact.checks?.requiredChecksCarriedForward === true &&
      artifact.enforcementImplementation?.qualityGateShape?.requiredChecks?.length >= 5
  },
  {
    id: "enforcement-points-carried-forward",
    pass: artifact.checks?.enforcementPointsCarriedForward === true
  },
  {
    id: "enforcement-rules-carried-forward",
    pass: artifact.checks?.enforcementRulesCarriedForward === true
  },
  {
    id: "future-phase-requirements-declared",
    pass: artifact.checks?.futurePhaseRequirementsDeclared === true
  },
  {
    id: "fail-closed-conditions-declared",
    pass:
      artifact.checks?.failClosedConditionsDeclared === true &&
      artifact.enforcementImplementation?.failClosedConditions?.length >= 7
  },
  {
    id: "implementation-only",
    pass: artifact.safetyBoundary?.implementationOnly === true
  },
  { id: "no-patch-applied", pass: artifact.safetyBoundary?.patchApplied === false },
  { id: "no-branch-created", pass: artifact.safetyBoundary?.branchCreated === false },
  { id: "no-push", pass: artifact.safetyBoundary?.pushed === false },
  { id: "no-merge", pass: artifact.safetyBoundary?.merged === false },
  { id: "no-pr-opened", pass: artifact.safetyBoundary?.prOpened === false },
  {
    id: "artifacts-exist",
    pass:
      exists("hermes/agentic-workflow/run-v3/quality-gate-enforcement-implementation/v9.1.json") &&
      exists(reportPath) &&
      exists("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.md")
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
