import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const artifactPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.json";

const artifact = JSON.parse(fs.readFileSync(path.join(root, artifactPath), "utf8"));

const exists = (p: string) => fs.existsSync(path.join(root, p));

const checks = [
  { id: "runtime-labeled", pass: artifact.runtime === "hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3" },
  { id: "status-proposed", pass: artifact.status === "proposed" },
  { id: "enforcement-validation-ready", pass: artifact.checks?.enforcementValidationReady === true },
  { id: "enforcement-implementation-ready", pass: artifact.checks?.enforcementImplementationReady === true },
  { id: "required-gate-outputs-present", pass: artifact.checks?.requiredGateOutputsPresent === true },
  { id: "future-phase-requirements-present", pass: artifact.checks?.futurePhaseRequirementsPresent === true },
  { id: "wiring-targets-declared", pass: artifact.checks?.wiringTargetsDeclared === true },
  { id: "fail-closed-policy-declared", pass: artifact.checks?.failClosedPolicyDeclared === true },
  { id: "validations-passed", pass: artifact.checks?.validationsPassed === true },
  { id: "proposal-only", pass: artifact.checks?.proposalOnly === true },
  { id: "no-broad-source-rewrite", pass: artifact.checks?.noBroadSourceRewrite === true },
  { id: "no-patch-applied", pass: artifact.checks?.noPatchApplied === true },
  { id: "no-branch-created", pass: artifact.checks?.noBranchCreated === true },
  { id: "no-push", pass: artifact.checks?.noPush === true },
  { id: "no-merge", pass: artifact.checks?.noMerge === true },
  { id: "no-pr-opened", pass: artifact.checks?.noPrOpened === true },
  {
    id: "artifacts-exist",
    pass:
      exists("hermes/agentic-workflow/run-v3/quality-gate-wiring-proposal/v9.3.json") &&
      exists("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.json") &&
      exists("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.md")
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
