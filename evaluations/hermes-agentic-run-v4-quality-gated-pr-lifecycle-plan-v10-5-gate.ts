import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const reportPath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10.5.json";

const data = JSON.parse(fs.readFileSync(path.join(root, reportPath), "utf8"));

const requiredArtifacts = [
  "scripts/write-hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10-5.ts",
  "evaluations/hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10-5-gate.ts",
  "hermes/agentic-workflow/run-v4/pr-lifecycle-plan/v10.5.json",
  reportPath,
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10.5.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: data.runtime === "hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10.5"
  },
  {
    id: "status-planned",
    pass: data.status === "planned"
  },
  {
    id: "pr-draft-ready",
    pass: data.checks?.prDraftReady === true
  },
  {
    id: "quality-gate-present",
    pass: Boolean(data.qualityGate)
  },
  {
    id: "quality-gate-passed",
    pass: data.qualityGate?.passed === true
  },
  {
    id: "operator-commands-declared",
    pass: Array.isArray(data.prLifecyclePlan?.operatorCommands) &&
      data.prLifecyclePlan.operatorCommands.length >= 6
  },
  {
    id: "required-gates-declared",
    pass: Array.isArray(data.prLifecyclePlan?.requiredGates) &&
      data.prLifecyclePlan.requiredGates.length >= 5
  },
  {
    id: "fail-closed-conditions-declared",
    pass: Array.isArray(data.prLifecyclePlan?.failClosedConditions) &&
      data.prLifecyclePlan.failClosedConditions.length >= 5
  },
  {
    id: "plan-only",
    pass: data.safetyBoundary?.planOnly === true
  },
  {
    id: "no-branch-created",
    pass: data.safetyBoundary?.branchCreated === false
  },
  {
    id: "no-push",
    pass: data.safetyBoundary?.pushed === false
  },
  {
    id: "no-merge",
    pass: data.safetyBoundary?.merged === false
  },
  {
    id: "no-pr-opened",
    pass: data.safetyBoundary?.prOpened === false
  },
  {
    id: "human-approval-required",
    pass: data.safetyBoundary?.humanApprovalRequiredForGitHubActions === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((file) => fs.existsSync(path.join(root, file)))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
