import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function run(command: string) {
  try {
    const output = execSync(command, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    return { command, passed: true, output };
  } catch (error: any) {
    return {
      command,
      passed: false,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`
    };
  }
}

const contractPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.json";
const selectorPath =
  "reports/agentic-workflow/next-run/hermes-agentic-next-run-selector-v6.8.json";
const runIndexPath =
  "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.json";
const ledgerPath = "sentra/ledger/post-merge-validation.json";

const contract = readJson(contractPath);
const selector = readJson(selectorPath);
const runIndex = readJson(runIndexPath);
const ledger = readJson(ledgerPath);

const validationResults = [
  run("npm run hermes:agentic-run-v2-target:v6.9:gate"),
  run("npm run hermes:agentic-next-run:v6.8:gate"),
  run("npm run hermes:agentic-run-index:v6.7:gate")
];

const plan = {
  runtime: "hermes-agentic-run-v2-plan-v7.0",
  generatedAt: new Date().toISOString(),
  status: "planned",
  inputArtifacts: [contractPath, selectorPath, runIndexPath, ledgerPath],
  run: {
    id: "hermes-agentic-run-v2",
    sourceRun: contract.runV2?.sourceRun,
    sourceLedgerEntry: contract.runV2?.sourceLedgerEntry,
    selectedNextRun: selector.selected?.id,
    objective:
      "Execute the second controlled Hermes agentic run by improving target selection and preparing a bounded patch proposal without applying source edits."
  },
  plan: {
    mode: "repo-local",
    autonomy: "semi-autonomous",
    phase: "planning-only",
    patchApplicationAllowed: false,
    branchCreationAllowed: false,
    pushAllowed: false,
    mergeAllowed: false,
    externalSideEffectsAllowed: false,
    steps: [
      {
        id: "load-context",
        action:
          "Read v6.9 target contract, v6.8 selector, v6.7 run index, and Sentra post-merge ledger.",
        output: "Run v2 planning context is available."
      },
      {
        id: "confirm-contract",
        action:
          "Verify that v6.9 selected the second controlled agentic run and declared target boundaries.",
        output: "Contract gate passes before planning proceeds."
      },
      {
        id: "define-patch-intent",
        action:
          "Define the next patch intent as target-selection improvement, not broad source modification.",
        output: "Patch intent can be reviewed before any source edit."
      },
      {
        id: "declare-validation",
        action:
          "Declare validation commands required before any v2 patch apply step.",
        output: "Validation commands are explicit and reusable."
      },
      {
        id: "stop-before-patch",
        action:
          "Stop at a plan artifact. Do not apply patches, create branches, push, merge, or open PRs.",
        output: "Human review remains required before v2 patching."
      }
    ],
    patchIntent: {
      id: "run-v2-target-selection-improvement",
      title: "Improve Hermes Agentic Run v2 Target Selection",
      summary:
        "Use completed run history, selector output, and Sentra ledger entries to pick a concrete next patch target before any source patch is generated.",
      proposedNextArtifact:
        "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.json"
    },
    validationCommands: [
      "npm run hermes:agentic-run-v2-target:v6.9:gate",
      "npm run hermes:agentic-next-run:v6.8:gate",
      "npm run hermes:agentic-run-index:v6.7:gate",
      "npm run check",
      "npm run mastra:check"
    ],
    approvalRequiredBeforePatch: true
  },
  context: {
    contractStatus: contract.status,
    selectorChoice: selector.selected?.id,
    runIndexStatus: runIndex.status,
    runIndexState: runIndex.run?.currentState,
    ledgerEntries: ledger.entries?.length ?? 0
  },
  safetyBoundary: {
    planningOnly: true,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforePatch: true
  },
  validationResults: validationResults.map((result) => ({
    command: result.command,
    passed: result.passed
  })),
  checks: {
    runtimeLabeled: true,
    statusPlanned: true,
    contractValid: contract.status === "contracted",
    selectorChoseNextRun: selector.selected?.id === "agentic-next-run",
    sourceRunComplete: runIndex.status === "complete",
    ledgerHasEntry: Array.isArray(ledger.entries) && ledger.entries.length > 0,
    validationRan: validationResults.length === 3,
    validationsPassed: validationResults.every((result) => result.passed),
    planningOnly: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true,
    humanApprovalRequiredBeforePatch: true
  },
  notes: [
    "This begins Hermes agentic run v2 without applying any source patch.",
    "The next artifact should be a v7.1 patch intent, not a patch apply.",
    "The run remains bounded by the v6.9 target contract."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/run-v2/plan-v7.0.json"),
  JSON.stringify(plan, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.json"),
  JSON.stringify(plan, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Run v2 Plan v7.0",
  "",
  `Generated: ${plan.generatedAt}`,
  `Status: ${plan.status}`,
  "",
  "## Objective",
  "",
  plan.run.objective,
  "",
  "## Plan",
  "",
  `- Mode: ${plan.plan.mode}`,
  `- Autonomy: ${plan.plan.autonomy}`,
  `- Phase: ${plan.plan.phase}`,
  `- Patch application allowed: ${plan.plan.patchApplicationAllowed}`,
  `- Branch creation allowed: ${plan.plan.branchCreationAllowed}`,
  `- Push allowed: ${plan.plan.pushAllowed}`,
  `- Merge allowed: ${plan.plan.mergeAllowed}`,
  "",
  "## Steps",
  "",
  ...plan.plan.steps.map((step) => `- **${step.id}**: ${step.action}`),
  "",
  "## Patch intent",
  "",
  `- ID: \`${plan.plan.patchIntent.id}\``,
  `- Title: ${plan.plan.patchIntent.title}`,
  `- Summary: ${plan.plan.patchIntent.summary}`,
  `- Proposed next artifact: \`${plan.plan.patchIntent.proposedNextArtifact}\``,
  "",
  "## Validation commands",
  "",
  ...plan.plan.validationCommands.map((command) => `- \`${command}\``),
  "",
  "## Safety boundary",
  "",
  `- Planning only: ${plan.safetyBoundary.planningOnly}`,
  `- Patch applied: ${plan.safetyBoundary.patchApplied}`,
  `- Branch created: ${plan.safetyBoundary.branchCreated}`,
  `- Pushed: ${plan.safetyBoundary.pushed}`,
  `- Merged: ${plan.safetyBoundary.merged}`,
  `- PR opened: ${plan.safetyBoundary.prOpened}`,
  `- Human approval before patch: ${plan.safetyBoundary.humanApprovalRequiredBeforePatch}`,
  "",
  "## Notes",
  "",
  ...plan.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.md"),
  md
);

console.log(JSON.stringify(plan, null, 2));

if (plan.status !== "planned") {
  process.exit(1);
}
