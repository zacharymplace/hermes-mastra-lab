import fs from "node:fs";

const artifactPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0.json";

const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const exists = (p: string) => fs.existsSync(p);

const checks = [
  {
    id: "runtime-labeled",
    pass:
      artifact.runtime ===
      "hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0",
  },
  { id: "status-intent-declared", pass: artifact.status === "intent-declared" },
  { id: "enforcement-plan-ready", pass: artifact.checks.enforcementPlanReady },
  { id: "adoption-report-ready", pass: artifact.checks.adoptionReportReady },
  {
    id: "proposed-patch-shape-declared",
    pass: artifact.checks.proposedPatchShapeDeclared,
  },
  {
    id: "implementation-scope-declared",
    pass: artifact.checks.implementationScopeDeclared,
  },
  {
    id: "enforcement-rules-carried-forward",
    pass: artifact.checks.enforcementRulesCarriedForward,
  },
  {
    id: "required-gate-outputs-carried-forward",
    pass: artifact.checks.requiredGateOutputsCarriedForward,
  },
  {
    id: "enforcement-points-carried-forward",
    pass: artifact.checks.enforcementPointsCarriedForward,
  },
  { id: "validations-passed", pass: artifact.checks.validationsPassed },
  { id: "intent-only", pass: artifact.checks.intentOnly },
  {
    id: "no-implementation-generated",
    pass: artifact.checks.noImplementationGenerated,
  },
  { id: "no-patch-applied", pass: artifact.checks.noPatchApplied },
  { id: "no-branch-created", pass: artifact.checks.noBranchCreated },
  { id: "no-push", pass: artifact.checks.noPush },
  { id: "no-merge", pass: artifact.checks.noMerge },
  { id: "no-pr-opened", pass: artifact.checks.noPrOpened },
  {
    id: "artifacts-exist",
    pass: [
      "hermes/agentic-workflow/run-v3/quality-gate-enforcement-intent/v9.0.json",
      artifactPath,
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0.md",
    ].every(exists),
  },
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
