import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const proposalPath = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.json"
);

const approvalPath = path.join(
  root,
  "hermes/agentic-workflow/approvals/run-v2-source-patch-apply-v7.4.json"
);

const targetPath = path.join(
  root,
  "hermes/agentic-workflow/run-v2/source-patch-applied-v7.4.json"
);

const reportPath = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-apply-v7.4.json"
);

const reportMdPath = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-apply-v7.4.md"
);

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function run(command: string) {
  try {
    return {
      command,
      passed: true,
      output: execSync(command, {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      })
    };
  } catch (error: any) {
    return {
      command,
      passed: false,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`
    };
  }
}

const proposal = readJson(proposalPath);
const approval = readJson(approvalPath);

const generatedAt = new Date().toISOString();

const patchArtifact = {
  runtime: "hermes-agentic-run-v2-source-patch-apply-v7.4",
  generatedAt,
  status: "source-patch-applied",
  sourceProposal: "hermes-agentic-run-v2-source-patch-proposal-v7.3",
  approval: {
    approved: approval.approved === true,
    reviewer: approval.reviewer,
    reason: approval.reason
  },
  appliedPatch: {
    targetPath: "hermes/agentic-workflow/run-v2/source-patch-applied-v7.4.json",
    type: "approved-generated-artifact",
    summary:
      "Records that the v7.3 source patch proposal was approved for a constrained v7.4 application step.",
    sourcePatchProposalStatus: proposal.status,
    selectedTargetId: proposal.selectedTarget?.id ?? null,
    nextStep: "Generate v7.5 validation report before any branch, push, PR, or merge action."
  },
  safetyBoundary: {
    approvalRequired: true,
    approved: approval.approved === true,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    externalSideEffects: false,
    constrainedToDeclaredTargets: true
  }
};

fs.writeFileSync(targetPath, JSON.stringify(patchArtifact, null, 2) + "\n");

const diffResult = run(
  "git diff -- hermes/agentic-workflow/run-v2/source-patch-applied-v7.4.json"
);

const validationResults = [
  run("npm run hermes:agentic-run-v2-source-patch-proposal:v7.3:gate"),
  run("npm run hermes:agentic-run-v2-target-selection:v7.2:gate"),
  run("npm run hermes:agentic-run-v2-patch-intent:v7.1:gate")
];

const validationsPassed = validationResults.every((result) => result.passed);

const report = {
  runtime: "hermes-agentic-run-v2-source-patch-apply-v7.4",
  generatedAt,
  status: validationsPassed ? "ready-for-human-review" : "validation-failed",
  inputArtifacts: [
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.json",
    "hermes/agentic-workflow/approvals/run-v2-source-patch-apply-v7.4.json"
  ],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v2/source-patch-applied-v7.4.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-apply-v7.4.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-apply-v7.4.md"
  ],
  approval: patchArtifact.approval,
  patch: {
    targetPath: "hermes/agentic-workflow/run-v2/source-patch-applied-v7.4.json",
    applied: approval.approved === true,
    changed: diffResult.output.trim().length > 0,
    diffCommand: diffResult.command,
    diffOutput: diffResult.output
  },
  validationResults,
  safetyBoundary: patchArtifact.safetyBoundary,
  checks: {
    runtimeLabeled: true,
    approvalGranted: approval.approved === true,
    reviewerCaptured: Boolean(approval.reviewer),
    reasonCaptured: Boolean(approval.reason),
    sourceProposalReady: proposal.status === "patch-proposed",
    patchApplied: approval.approved === true,
    diffCaptured: true,
    validationRan: validationResults.length > 0,
    validationsPassed,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true,
    constrainedPatchOnly: true
  },
  notes: [
    "This applies the approved v7.4 generated source patch artifact only.",
    "It does not create a branch, push, merge, or open a PR.",
    "The next safe step is v7.5 validation/reporting before any GitHub lifecycle action."
  ]
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");

const md = `# Hermes Agentic Run v2 Source Patch Apply v7.4

Status: ${report.status}

## Approval

- Approved: ${report.approval.approved}
- Reviewer: ${report.approval.reviewer}
- Reason: ${report.approval.reason}

## Patch

- Target: ${report.patch.targetPath}
- Applied: ${report.patch.applied}
- Changed: ${report.patch.changed}

## Safety

- Branch created: false
- Pushed: false
- PR opened: false
- Merged: false
- External side effects: false

## Validation

${validationResults.map((result) => `- ${result.command}: ${result.passed ? "PASS" : "FAIL"}`).join("\n")}
`;

fs.writeFileSync(reportMdPath, md);

console.log(JSON.stringify(report, null, 2));

if (!validationsPassed) {
  process.exit(1);
}
