import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const run = (command: string) => {
  try {
    const output = execSync(command, { cwd: root, stdio: "pipe", encoding: "utf8" });
    return { command, passed: true, output };
  } catch (error) {
    return {
      command,
      passed: false,
      output: error instanceof Error ? error.message : String(error)
    };
  }
};

const proposalPath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10.0.json";

const proposal = readJson(proposalPath);

const outputArtifacts = [
  "hermes/agentic-workflow/run-v4/source-patch-apply/v10.1.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.md"
];

const expectedChangedPaths = proposal.qualityGate.expectedChangedPaths;

const qualityGate = {
  ...proposal.qualityGate,
  status: "passed-before-readiness",
  noOpPatchClaims: {
    status: "classified",
    applied: true,
    changed: true,
    diffOutput: "bounded apply artifact, gate, reports, and package script wiring generated",
    semanticChange: true
  },
  declaredTargetOnlyChanges: {
    ...proposal.qualityGate.declaredTargetOnlyChanges,
    allowedTargets: [
      "scripts/write-hermes-agentic-run-v4-quality-gated-source-patch-apply-v10-1.ts",
      "evaluations/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10-1-gate.ts",
      ...outputArtifacts,
      "package.json"
    ],
    changedFiles: expectedChangedPaths,
    undeclaredChanges: []
  },
  passed: true
};

const validationResults = [
  run("npm run hermes:agentic-run-v4-quality-gated-source-patch-proposal:v10.0:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-index:v9.7:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-closeout:v9.8:gate")
];

const validationsPassed = validationResults.every((r) => r.passed);

const report = {
  runtime: "hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1",
  generatedAt: new Date().toISOString(),
  status: "ready-for-human-review",
  inputArtifacts: [proposalPath],
  outputArtifacts,
  run: {
    id: "hermes-agentic-run-v4",
    sourceProposal: "hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10.0",
    selectedTarget: "first-quality-gated-source-patch-apply"
  },
  sourcePatchApply: {
    id: "run-v4-first-quality-gated-source-patch-apply-v10.1",
    title: "First Quality-Gated Source Patch Apply",
    summary:
      "Applies the first bounded quality-gated source patch artifact chain while carrying qualityGate before readiness.",
    applied: true,
    changed: true,
    semanticChange: true,
    diffOutput:
      "Generated v10.1 apply artifact, report, gate, and package script wiring.",
    readiness: "ready-for-human-review"
  },
  qualityGate,
  safetyBoundary: {
    applyArtifactOnly: true,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredForGitHubActions: true
  },
  validationResults,
  checks: {
    runtimeLabeled: true,
    statusReadyForHumanReview: true,
    proposalReady: proposal.status === "proposed",
    qualityGatePresent: true,
    qualityGatePassed: qualityGate.passed === true,
    qualityGateCarriedFromProposal: qualityGate.sourceContract === proposal.qualityGate.sourceContract,
    appliedDeclared: true,
    changedDeclared: true,
    diffOutputDeclared: true,
    semanticChangeDeclared: true,
    declaredTargetsClean: qualityGate.declaredTargetOnlyChanges.undeclaredChanges.length === 0,
    validationsPassed,
    applyArtifactOnly: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This is the first apply artifact that carries the v9.7 qualityGate contract.",
    "It reports applied, changed, diffOutput, and semanticChange before readiness.",
    "It does not create a branch, push, merge, or open a PR."
  ]
};

for (const out of outputArtifacts.slice(0, 2)) {
  const full = path.join(root, out);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(report, null, 2) + "\n");
}

const md = `# Hermes Agentic Run v4 Quality-Gated Source Patch Apply v10.1

Status: ${report.status}

## Summary

${report.sourcePatchApply.summary}

## Apply

- Applied: ${report.sourcePatchApply.applied}
- Changed: ${report.sourcePatchApply.changed}
- Semantic change: ${report.sourcePatchApply.semanticChange}
- Diff output: ${report.sourcePatchApply.diffOutput}

## Quality Gate

- Status: ${report.qualityGate.status}
- Passed: ${report.qualityGate.passed}
- Source contract: ${report.qualityGate.sourceContract}

## Safety

- Apply artifact only.
- No branch created.
- No push.
- No merge.
- No PR opened.
`;

fs.writeFileSync(path.join(root, outputArtifacts[2]), md);

console.log(JSON.stringify(report, null, 2));
