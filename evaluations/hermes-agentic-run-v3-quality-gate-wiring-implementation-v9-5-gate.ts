import fs from "node:fs";
import path from "node:path";

type Check = {
  id: string;
  pass: boolean;
};

const root = process.cwd();

const reportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.json";

const artifact = JSON.parse(fs.readFileSync(path.join(root, reportPath), "utf8"));

const exists = (filePath: string) => fs.existsSync(path.join(root, filePath));

const checks: Check[] = [
  {
    id: "runtime-labeled",
    pass: artifact.runtime === "hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5"
  },
  {
    id: "status-implemented",
    pass: artifact.status === "implemented"
  },
  {
    id: "wiring-intent-ready",
    pass: artifact.checks?.wiringIntentReady === true
  },
  {
    id: "enforcement-validation-ready",
    pass: artifact.checks?.enforcementValidationReady === true
  },
  {
    id: "enforcement-implementation-ready",
    pass: artifact.checks?.enforcementImplementationReady === true
  },
  {
    id: "quality-gate-shape-carried-forward",
    pass: artifact.checks?.qualityGateShapeCarriedForward === true
  },
  {
    id: "required-gate-outputs-carried-forward",
    pass: artifact.checks?.requiredGateOutputsCarriedForward === true
  },
  {
    id: "wired-phases-declared",
    pass: artifact.checks?.wiredPhasesDeclared === true
  },
  {
    id: "fail-closed-policy-carried-forward",
    pass: artifact.checks?.failClosedPolicyCarriedForward === true
  },
  {
    id: "reusable-contract-declared",
    pass: artifact.checks?.reusableContractDeclared === true
  },
  {
    id: "validations-passed",
    pass: artifact.checks?.validationsPassed === true
  },
  {
    id: "implementation-only",
    pass: artifact.safetyBoundary?.implementationOnly === true
  },
  {
    id: "no-broad-source-rewrite",
    pass: artifact.safetyBoundary?.broadSourceRewrite === false
  },
  {
    id: "no-patch-applied",
    pass: artifact.safetyBoundary?.patchApplied === false
  },
  {
    id: "no-branch-created",
    pass: artifact.safetyBoundary?.branchCreated === false
  },
  {
    id: "no-push",
    pass: artifact.safetyBoundary?.pushed === false
  },
  {
    id: "no-merge",
    pass: artifact.safetyBoundary?.merged === false
  },
  {
    id: "no-pr-opened",
    pass: artifact.safetyBoundary?.prOpened === false
  },
  {
    id: "artifacts-exist",
    pass:
      exists("hermes/agentic-workflow/run-v3/quality-gate-wiring-implementation/v9.5.json") &&
      exists(reportPath) &&
      exists(
        "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.md"
      )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
