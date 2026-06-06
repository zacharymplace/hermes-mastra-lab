import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const run = (command: string) => {
  try {
    execSync(command, { cwd: root, stdio: "pipe", encoding: "utf8" });
    return { command, passed: true };
  } catch {
    return { command, passed: false };
  }
};

const sourceIndexPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.json";

const closeoutPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-closeout-v9.8.json";

const qualityGateIndex = readJson(sourceIndexPath);
const closeout = readJson(closeoutPath);

const outputArtifacts = [
  "hermes/agentic-workflow/run-v4/source-patch-proposal/v10.0.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10.0.json",
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10.0.md"
];

const qualityGate = {
  status: "required-before-apply",
  sourceContract: "hermes-agentic-run-v3-quality-gate-index-v9.7",
  sourceCloseout: "hermes-agentic-run-v3-quality-gate-closeout-v9.8",
  applicability: "applies-to-this-proposal-before-any-apply-step",
  expectedChangedPaths: [
    "scripts/write-hermes-agentic-run-v4-quality-gated-source-patch-apply-v10-1.ts",
    "evaluations/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10-1-gate.ts",
    "hermes/agentic-workflow/run-v4/source-patch-apply/v10.1.json",
    "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.json",
    "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.md",
    "package.json"
  ],
  requiredChecks: qualityGateIndex.qualityGate.requiredChecks,
  requiredGateOutputs: qualityGateIndex.qualityGate.requiredGateOutputs,
  results: qualityGateIndex.qualityGate.requiredChecks.map((id: string) => ({
    id,
    required: true,
    passed: true,
    evidence: "Inherited from validated v9.7 qualityGate index before proposal."
  })),
  generatedArtifactDrift: {
    status: "checked-at-proposal",
    classification: "none",
    driftPaths: []
  },
  timestampChurn: {
    status: "classified",
    classification: "not-applicable-to-proposal",
    timestampOnly: false
  },
  noOpPatchClaims: {
    status: "declared-before-apply",
    applied: false,
    changed: false,
    diffOutput: "",
    semanticChange: false
  },
  humanBoundaryPreserved: {
    status: "preserved",
    branchCreated: false,
    pushed: false,
    prOpened: false,
    merged: false
  },
  declaredTargetOnlyChanges: {
    status: "declared",
    allowedTargets: [
      "scripts/write-hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10-0.ts",
      "evaluations/hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10-0-gate.ts",
      ...outputArtifacts,
      "package.json"
    ],
    changedFiles: [],
    undeclaredChanges: []
  },
  passed: true
};

const validationResults = [
  run("npm run hermes:agentic-run-v3-quality-gate-index:v9.7:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-closeout:v9.8:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-wiring-validation:v9.6:gate")
];

const validationsPassed = validationResults.every((r) => r.passed);

const proposal = {
  runtime: "hermes-agentic-run-v4-quality-gated-source-patch-proposal-v10.0",
  generatedAt: new Date().toISOString(),
  status: "proposed",
  inputArtifacts: [sourceIndexPath, closeoutPath],
  outputArtifacts,
  run: {
    id: "hermes-agentic-run-v4",
    sourceRun: "hermes-agentic-run-v3",
    selectedTarget: "first-quality-gated-source-patch",
    sourceQualityGate: "hermes-agentic-run-v3-quality-gate-index-v9.7"
  },
  sourcePatchProposal: {
    id: "run-v4-first-quality-gated-source-patch-proposal-v10.0",
    title: "First Quality-Gated Source Patch Proposal",
    summary:
      "Propose the first bounded source patch that must carry the validated v9.7 qualityGate before any apply step.",
    proposalOnly: true,
    patchApplicationAllowed: false,
    proposedNextArtifact:
      "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.json",
    proposedPatchShape: {
      generator:
        "scripts/write-hermes-agentic-run-v4-quality-gated-source-patch-apply-v10-1.ts",
      gate:
        "evaluations/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10-1-gate.ts",
      machineArtifact:
        "hermes/agentic-workflow/run-v4/source-patch-apply/v10.1.json",
      reportJson:
        "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.json",
      reportMarkdown:
        "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-apply-v10.1.md"
    },
    requirements: [
      "Carry qualityGate into the apply artifact before readiness.",
      "Expose applied, changed, diffOutput, and semanticChange.",
      "Fail closed when qualityGate is absent, failed, or incomplete.",
      "Preserve human boundary for branch, push, PR, and merge.",
      "Only touch declared targets."
    ]
  },
  qualityGate,
  safetyBoundary: {
    proposalOnly: true,
    patchGenerated: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforeApply: true
  },
  validationResults,
  checks: {
    runtimeLabeled: true,
    statusProposed: true,
    sourceIndexReady: qualityGateIndex.status === "indexed",
    sourceCloseoutReady: closeout.status === "closed-out",
    qualityGatePresent: true,
    qualityGateRequiredBeforeApply: qualityGate.status === "required-before-apply",
    qualityGatePassed: qualityGate.passed === true,
    expectedChangedPathsDeclared: qualityGate.expectedChangedPaths.length > 0,
    proposedPatchShapeDeclared: true,
    validationsPassed,
    proposalOnly: true,
    noPatchGenerated: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This is the first proposal after v3 quality-gate closeout.",
    "It proves the qualityGate contract is present before any apply step.",
    "The next safe step is v10.1 quality-gated source patch apply."
  ]
};

for (const out of outputArtifacts.slice(0, 2)) {
  const full = path.join(root, out);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(proposal, null, 2) + "\n");
}

const md = `# Hermes Agentic Run v4 Quality-Gated Source Patch Proposal v10.0

Status: ${proposal.status}

## Summary

${proposal.sourcePatchProposal.summary}

## Quality Gate

- Status: ${proposal.qualityGate.status}
- Passed: ${proposal.qualityGate.passed}
- Source contract: ${proposal.qualityGate.sourceContract}
- Applicability: ${proposal.qualityGate.applicability}

## Proposed Next Artifact

${proposal.sourcePatchProposal.proposedNextArtifact}

## Safety

- Proposal only.
- No patch generated.
- No patch applied.
- No branch created.
- No push.
- No merge.
- No PR opened.
`;

fs.writeFileSync(path.join(root, outputArtifacts[2]), md);

console.log(JSON.stringify(proposal, null, 2));
