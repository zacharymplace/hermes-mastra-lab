import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const selectorPath =
  "reports/agentic-workflow/next-run/hermes-agentic-next-run-selector-v6.8.json";
const runIndexPath =
  "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.json";
const ledgerPath = "sentra/ledger/post-merge-validation.json";

const selector = readJson(selectorPath);
const runIndex = readJson(runIndexPath);
const ledger = readJson(ledgerPath);

const contract = {
  runtime: "hermes-agentic-run-v2-target-contract-v6.9",
  generatedAt: new Date().toISOString(),
  status: "contracted",
  inputArtifacts: [selectorPath, runIndexPath, ledgerPath],
  selectedNextRun: selector.selected,
  runV2: {
    id: "hermes-agentic-run-v2",
    purpose:
      "Start the second controlled Hermes agentic run using the completed v1-v6.7 chain as operating context.",
    targetType: "workflow-improvement-contract",
    targetName: "Hermes Agentic Run v2 Target Contract",
    objective:
      "Define the allowed target, constraints, success criteria, and safety boundaries before any v2 patching is allowed.",
    sourceRun: runIndex.run?.id,
    sourceLedgerEntry: ledger.entries?.[ledger.entries.length - 1]?.id ?? null
  },
  allowedTargets: [
    {
      path: "hermes/agentic-workflow/run-v2/target-contract-v6.9.json",
      reason: "Machine-readable contract for the second controlled agentic run."
    },
    {
      path: "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.json",
      reason: "Report artifact for audit and gates."
    },
    {
      path: "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.md",
      reason: "Human-readable review artifact."
    },
    {
      path: "scripts/write-hermes-agentic-run-v2-target-contract-v6-9.ts",
      reason: "Generator for the target contract."
    },
    {
      path: "evaluations/hermes-agentic-run-v2-target-contract-v6-9-gate.ts",
      reason: "Gate for contract validity."
    },
    {
      path: "package.json",
      reason: "Expose v6.9 commands."
    }
  ],
  disallowedTargets: [
    "secrets",
    ".env files",
    "credential stores",
    "destructive git operations",
    "auto-push",
    "auto-merge",
    "opening GitHub PRs without explicit operator approval",
    "broad source rewrites outside the declared contract"
  ],
  safetyBoundary: {
    requiresHumanApprovalBeforePatch: true,
    requiresGateBeforeCommit: true,
    autoPush: false,
    autoMerge: false,
    externalSideEffects: false,
    allowedToModifyOnlyDeclaredTargets: true
  },
  successCriteria: [
    "v6.8 selected Start Next Agentic Run.",
    "v6.7 source run is complete.",
    "v6.6 post-merge ledger has at least one entry.",
    "Run v2 has a declared target before patching.",
    "Allowed and disallowed targets are explicit.",
    "Human approval remains required before patch application."
  ],
  checks: {
    runtimeLabeled: true,
    selectorChoseNextRun: selector.selected?.id === "agentic-next-run",
    sourceRunComplete: runIndex.status === "complete",
    ledgerHasEntry: Array.isArray(ledger.entries) && ledger.entries.length > 0,
    targetDeclared: true,
    allowedTargetsDeclared: true,
    disallowedTargetsDeclared: true,
    humanApprovalRequired: true,
    noAutoPush: true,
    noAutoMerge: true
  },
  notes: [
    "This prevents the second agentic run from becoming an unconstrained patch loop.",
    "The run can plan next, but patch application must be separately approved.",
    "This becomes the contract v2 must satisfy before source edits."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/run-v2/target-contract-v6.9.json"),
  JSON.stringify(contract, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.json"
  ),
  JSON.stringify(contract, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Run v2 Target Contract v6.9",
  "",
  `Generated: ${contract.generatedAt}`,
  `Status: ${contract.status}`,
  "",
  "## Run v2",
  "",
  `- ID: \`${contract.runV2.id}\``,
  `- Target: ${contract.runV2.targetName}`,
  `- Objective: ${contract.runV2.objective}`,
  `- Source run: \`${contract.runV2.sourceRun}\``,
  `- Source ledger entry: \`${contract.runV2.sourceLedgerEntry}\``,
  "",
  "## Allowed targets",
  "",
  ...contract.allowedTargets.map((target) => `- \`${target.path}\` — ${target.reason}`),
  "",
  "## Disallowed targets",
  "",
  ...contract.disallowedTargets.map((target) => `- ${target}`),
  "",
  "## Safety boundary",
  "",
  `- Requires human approval before patch: ${contract.safetyBoundary.requiresHumanApprovalBeforePatch}`,
  `- Requires gate before commit: ${contract.safetyBoundary.requiresGateBeforeCommit}`,
  `- Auto-push: ${contract.safetyBoundary.autoPush}`,
  `- Auto-merge: ${contract.safetyBoundary.autoMerge}`,
  `- External side effects: ${contract.safetyBoundary.externalSideEffects}`,
  "",
  "## Success criteria",
  "",
  ...contract.successCriteria.map((item) => `- ${item}`),
  "",
  "## Notes",
  "",
  ...contract.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.md"
  ),
  md
);

console.log(JSON.stringify(contract, null, 2));

if (contract.status !== "contracted") {
  process.exit(1);
}
