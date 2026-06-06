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

const planPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.json";
const contractPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.json";
const nextRunPath =
  "reports/agentic-workflow/next-run/hermes-agentic-next-run-selector-v6.8.json";

const plan = readJson(planPath);
const contract = readJson(contractPath);
const nextRun = readJson(nextRunPath);

const validationResults = [
  run("npm run hermes:agentic-run-v2-plan:v7.0:gate"),
  run("npm run hermes:agentic-run-v2-target:v6.9:gate"),
  run("npm run hermes:agentic-next-run:v6.8:gate")
];

const intent = {
  runtime: "hermes-agentic-run-v2-patch-intent-v7.1",
  generatedAt: new Date().toISOString(),
  status: "intent-declared",
  inputArtifacts: [planPath, contractPath, nextRunPath],
  run: {
    id: "hermes-agentic-run-v2",
    sourcePlan: "hermes-agentic-run-v2-plan-v7.0",
    selectedNextRun: nextRun.selected?.id ?? null
  },
  patchIntent: {
    id: "run-v2-target-selection-improvement",
    title: "Improve Hermes Agentic Run v2 Target Selection",
    type: "source-patch-intent",
    summary:
      "Prepare the second agentic run to select concrete patch targets from completed run history, selector output, and Sentra ledger state before generating any patch.",
    problem:
      "The v2 plan identifies target-selection improvement, but the repo still needs a bounded patch intent artifact before any source patch proposal.",
    proposedPatchShape: {
      generator:
        "scripts/write-hermes-agentic-run-v2-target-selection-v7-2.ts",
      gate:
        "evaluations/hermes-agentic-run-v2-target-selection-v7-2-gate.ts",
      machineArtifact:
        "hermes/agentic-workflow/run-v2/target-selection-v7.2.json",
      reportJson:
        "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.json",
      reportMarkdown:
        "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.md"
    },
    targetSelectionInputs: [
      "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.json",
      "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.json",
      "sentra/ledger/post-merge-validation.json",
      "reports/agentic-workflow/next-run/hermes-agentic-next-run-selector-v6.8.json"
    ],
    targetSelectionRules: [
      "Prefer the smallest patch that increases autonomy without reducing human control.",
      "Prefer generated artifacts and gates before source rewrites.",
      "Do not modify secrets, environment files, credentials, or destructive git behavior.",
      "Do not push, merge, or open PRs inside the workflow.",
      "Require explicit approval before patch application."
    ],
    expectedNextStep:
      "Generate v7.2 target-selection artifact and gate; do not apply a patch yet."
  },
  allowedTargets: [
    "scripts/write-hermes-agentic-run-v2-patch-intent-v7-1.ts",
    "evaluations/hermes-agentic-run-v2-patch-intent-v7-1-gate.ts",
    "hermes/agentic-workflow/run-v2/patch-intent-v7.1.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.md",
    "package.json"
  ],
  safetyBoundary: {
    intentOnly: true,
    patchGenerated: false,
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
    statusIntentDeclared: true,
    planValid: plan.status === "planned",
    contractValid: contract.status === "contracted",
    nextRunSelected: nextRun.selected?.id === "agentic-next-run",
    patchIntentPresent: true,
    proposedPatchShapeDeclared: true,
    targetSelectionRulesDeclared: true,
    validationsPassed: validationResults.every((result) => result.passed),
    intentOnly: true,
    noPatchGenerated: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true,
    humanApprovalRequiredBeforePatch: true
  },
  notes: [
    "This declares the v2 patch intent but does not generate or apply a patch.",
    "The next safe step is v7.2 target selection.",
    "Patch application remains blocked until a later approval-gated step."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/run-v2/patch-intent-v7.1.json"),
  JSON.stringify(intent, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.json"
  ),
  JSON.stringify(intent, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Run v2 Patch Intent v7.1",
  "",
  `Generated: ${intent.generatedAt}`,
  `Status: ${intent.status}`,
  "",
  "## Intent",
  "",
  `- ID: \`${intent.patchIntent.id}\``,
  `- Title: ${intent.patchIntent.title}`,
  `- Type: ${intent.patchIntent.type}`,
  `- Summary: ${intent.patchIntent.summary}`,
  "",
  "## Problem",
  "",
  intent.patchIntent.problem,
  "",
  "## Proposed patch shape",
  "",
  `- Generator: \`${intent.patchIntent.proposedPatchShape.generator}\``,
  `- Gate: \`${intent.patchIntent.proposedPatchShape.gate}\``,
  `- Machine artifact: \`${intent.patchIntent.proposedPatchShape.machineArtifact}\``,
  `- Report JSON: \`${intent.patchIntent.proposedPatchShape.reportJson}\``,
  `- Report Markdown: \`${intent.patchIntent.proposedPatchShape.reportMarkdown}\``,
  "",
  "## Target-selection rules",
  "",
  ...intent.patchIntent.targetSelectionRules.map((rule) => `- ${rule}`),
  "",
  "## Safety boundary",
  "",
  `- Intent only: ${intent.safetyBoundary.intentOnly}`,
  `- Patch generated: ${intent.safetyBoundary.patchGenerated}`,
  `- Patch applied: ${intent.safetyBoundary.patchApplied}`,
  `- Branch created: ${intent.safetyBoundary.branchCreated}`,
  `- Pushed: ${intent.safetyBoundary.pushed}`,
  `- Merged: ${intent.safetyBoundary.merged}`,
  `- PR opened: ${intent.safetyBoundary.prOpened}`,
  `- Human approval before patch: ${intent.safetyBoundary.humanApprovalRequiredBeforePatch}`,
  "",
  "## Expected next step",
  "",
  intent.patchIntent.expectedNextStep,
  "",
  "## Notes",
  "",
  ...intent.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.md"
  ),
  md
);

console.log(JSON.stringify(intent, null, 2));

if (intent.status !== "intent-declared") {
  process.exit(1);
}
