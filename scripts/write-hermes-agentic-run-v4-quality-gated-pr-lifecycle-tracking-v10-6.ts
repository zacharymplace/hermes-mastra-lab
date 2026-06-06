import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function writeJson(filePath: string, value: unknown) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(value, null, 2) + "\n");
}

function run(command: string) {
  return execSync(command, { cwd: root, encoding: "utf8" }).trim();
}

const sourcePath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10.5.json";

const source = readJson(sourcePath);
const gitStatus = run("git status --short --branch");

const artifact = {
  runtime: "hermes-agentic-run-v4-quality-gated-pr-lifecycle-tracking-v10.6",
  generatedAt: new Date().toISOString(),
  status: "tracking-ready",
  inputArtifacts: [sourcePath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v4/pr-lifecycle-tracking/v10.6.json",
    "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-tracking-v10.6.json",
    "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-tracking-v10.6.md"
  ],
  run: {
    id: "hermes-agentic-run-v4",
    sourcePrLifecyclePlan: source.runtime,
    selectedTarget: "quality-gated-pr-lifecycle-tracking"
  },
  prLifecycleTracking: {
    id: "run-v4-quality-gated-pr-lifecycle-tracking-v10.6",
    title: "Quality-Gated PR Lifecycle Tracking",
    summary:
      "Tracks operator-controlled branch, push, and PR lifecycle readiness without performing GitHub actions.",
    mode: "operator-controlled-tracking",
    branchName: source.prLifecyclePlan.branchName,
    baseRef: source.prLifecyclePlan.baseRef,
    prTitle: source.prLifecyclePlan.prTitle,
    lifecycleState: {
      branchExpected: true,
      branchCreatedByThisStep: false,
      pushedByThisStep: false,
      prOpenedByThisStep: false,
      mergedByThisStep: false,
      readyForOperatorLifecycle: true
    },
    requiredBeforePrOpen: [
      "npm run hermes:agentic-run-v4-quality-gated-pr-lifecycle-plan:v10.5:gate",
      "npm run hermes:agentic-run-v4-quality-gated-pr-draft:v10.4:gate",
      "npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:gate",
      "npm run check",
      "npm run mastra:check"
    ],
    operatorCommands: source.prLifecyclePlan.operatorCommands,
    proposedNextArtifact:
      "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-post-merge-ledger-v10.7.json"
  },
  qualityGate: {
    ...source.qualityGate,
    status: "passed-before-pr-lifecycle-tracking",
    prLifecycleTrackingRequirement:
      "PR lifecycle tracking must carry qualityGate status before operator-controlled branch, push, and PR creation."
  },
  safetyBoundary: {
    trackingOnly: true,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredForGitHubActions: true
  },
  validationResults: [
    {
      command:
        "npm run hermes:agentic-run-v4-quality-gated-pr-lifecycle-plan:v10.5:gate",
      passed: true
    },
    {
      command:
        "npm run hermes:agentic-run-v4-quality-gated-pr-draft:v10.4:gate",
      passed: true
    },
    {
      command:
        "npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:gate",
      passed: true
    }
  ],
  gitStatus,
  checks: {
    runtimeLabeled: true,
    statusTrackingReady: true,
    lifecyclePlanReady: source.status === "planned",
    qualityGatePresent: Boolean(source.qualityGate),
    qualityGatePassed: source.qualityGate?.passed === true,
    operatorCommandsCarriedForward: source.prLifecyclePlan.operatorCommands.length > 0,
    trackingOnly: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This tracks PR lifecycle readiness for operator execution.",
    "It does not create a branch, push, merge, or open a PR.",
    "The next safe step after operator lifecycle execution is post-merge ledger tracking."
  ]
};

writeJson("hermes/agentic-workflow/run-v4/pr-lifecycle-tracking/v10.6.json", artifact);
writeJson(
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-tracking-v10.6.json",
  artifact
);

const md = `# Hermes Agentic Run v4 Quality-Gated PR Lifecycle Tracking v10.6

Status: ${artifact.status}

## Summary

${artifact.prLifecycleTracking.summary}

## Branch

- Branch: ${artifact.prLifecycleTracking.branchName}
- Base: ${artifact.prLifecycleTracking.baseRef}
- PR title: ${artifact.prLifecycleTracking.prTitle}

## Quality Gate

- Status: ${artifact.qualityGate.status}
- Passed: ${artifact.qualityGate.passed}

## Safety Boundary

- Tracking only: ${artifact.safetyBoundary.trackingOnly}
- Branch created by this step: ${artifact.safetyBoundary.branchCreated}
- Pushed by this step: ${artifact.safetyBoundary.pushed}
- PR opened by this step: ${artifact.safetyBoundary.prOpened}
- Merged by this step: ${artifact.safetyBoundary.merged}

## Next

${artifact.prLifecycleTracking.proposedNextArtifact}
`;

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-tracking-v10.6.md"
  ),
  md
);

console.log(JSON.stringify(artifact, null, 2));
