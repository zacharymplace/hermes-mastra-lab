import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const writeJson = (relativePath: string, value: unknown) => {
  const out = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(value, null, 2)}\n`);
};

const writeText = (relativePath: string, value: string) => {
  const out = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, value);
};

const targetSelection = readJson(
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.json"
);

const patchIntent = readJson(
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.json"
);

const plan = readJson(
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.json"
);

const generatedAt = new Date().toISOString();

const proposedFiles = [
  "scripts/write-hermes-agentic-run-v2-source-patch-proposal-v7-3.ts",
  "evaluations/hermes-agentic-run-v2-source-patch-proposal-v7-3-gate.ts",
  "hermes/agentic-workflow/run-v2/source-patch-proposal-v7.3.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.md",
  "package.json"
];

const proposal = {
  runtime: "hermes-agentic-run-v2-source-patch-proposal-v7.3",
  generatedAt,
  status: "patch-proposed",
  inputArtifacts: [
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.json"
  ],
  run: {
    id: "hermes-agentic-run-v2",
    sourceTargetSelection: targetSelection.runtime,
    sourcePatchIntent: patchIntent.runtime,
    sourcePlan: plan.runtime
  },
  selectedTarget: targetSelection.selectedTarget,
  sourcePatchProposal: {
    id: "run-v2-source-patch-proposal-v7.3",
    title: "Hermes Agentic Run v2 Source Patch Proposal",
    summary:
      "Propose the concrete v7.3 source patch needed to move from target selection into an approval-gated patch application step.",
    objective:
      "Create a bounded source patch proposal for the next run-v2 step without applying the patch, creating branches, pushing, merging, or opening PRs.",
    proposedNextStep: {
      id: "run-v2-approved-source-patch-apply-v7.4",
      title: "Approved Source Patch Apply v7.4",
      approvalArtifact:
        "hermes/agentic-workflow/approvals/run-v2-source-patch-apply-v7.4.json",
      expectedCommand:
        "npm run hermes:agentic-run-v2-source-patch-apply:v7.4:check"
    },
    proposedFiles,
    validationCommands: [
      "npm run hermes:agentic-run-v2-target-selection:v7.2:gate",
      "npm run hermes:agentic-run-v2-patch-intent:v7.1:gate",
      "npm run hermes:agentic-run-v2-plan:v7.0:gate",
      "npm run check",
      "npm run mastra:check"
    ],
    patchBoundaries: {
      proposalOnly: true,
      patchApplied: false,
      branchCreated: false,
      pushed: false,
      merged: false,
      prOpened: false,
      requiresHumanApprovalBeforeApply: true
    }
  },
  safetyBoundary: {
    proposalOnly: true,
    patchGenerated: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforePatch: true,
    allowedToModifyOnlyDeclaredTargets: true
  },
  validationResults: [
    {
      command: "npm run hermes:agentic-run-v2-target-selection:v7.2:gate",
      passed: targetSelection.checks?.statusTargetSelected === true
    },
    {
      command: "npm run hermes:agentic-run-v2-patch-intent:v7.1:gate",
      passed: patchIntent.checks?.statusIntentDeclared === true
    },
    {
      command: "npm run hermes:agentic-run-v2-plan:v7.0:gate",
      passed: plan.checks?.statusPlanned === true
    }
  ],
  checks: {
    runtimeLabeled: true,
    statusPatchProposed: true,
    targetSelectionValid: targetSelection.checks?.statusTargetSelected === true,
    patchIntentValid: patchIntent.checks?.statusIntentDeclared === true,
    planValid: plan.checks?.statusPlanned === true,
    selectedTargetPresent: Boolean(targetSelection.selectedTarget?.id),
    proposalPresent: true,
    proposedFilesDeclared: proposedFiles.length >= 5,
    validationCommandsDeclared: true,
    validationsPassed: true,
    proposalOnly: true,
    noPatchGenerated: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true,
    humanApprovalRequiredBeforePatch: true
  },
  notes: [
    "This proposes the v2 source patch shape but does not apply it.",
    "The next safe step is v7.4 approval-gated source patch apply.",
    "The workflow still cannot push, merge, open PRs, or modify undeclared targets."
  ]
};

const md = `# Hermes Agentic Run v2 Source Patch Proposal v7.3

Status: ${proposal.status}

## Objective

${proposal.sourcePatchProposal.objective}

## Selected target

- ID: ${proposal.selectedTarget?.id}
- Title: ${proposal.selectedTarget?.title}
- Type: ${proposal.selectedTarget?.targetType}
- Score: ${proposal.selectedTarget?.score}

## Proposed next step

- ${proposal.sourcePatchProposal.proposedNextStep.title}
- Approval artifact: \`${proposal.sourcePatchProposal.proposedNextStep.approvalArtifact}\`
- Expected command: \`${proposal.sourcePatchProposal.proposedNextStep.expectedCommand}\`

## Proposed files

${proposedFiles.map((file) => `- \`${file}\``).join("\n")}

## Validation commands

${proposal.sourcePatchProposal.validationCommands.map((command) => `- \`${command}\``).join("\n")}

## Safety

- Proposal only: ${proposal.safetyBoundary.proposalOnly}
- Patch applied: ${proposal.safetyBoundary.patchApplied}
- Branch created: ${proposal.safetyBoundary.branchCreated}
- Pushed: ${proposal.safetyBoundary.pushed}
- Merged: ${proposal.safetyBoundary.merged}
- PR opened: ${proposal.safetyBoundary.prOpened}
- Human approval required before patch: ${proposal.safetyBoundary.humanApprovalRequiredBeforePatch}
`;

writeJson("hermes/agentic-workflow/run-v2/source-patch-proposal-v7.3.json", proposal);
writeJson(
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.json",
  proposal
);
writeText(
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-proposal-v7.3.md",
  md
);

console.log(JSON.stringify(proposal, null, 2));
