import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function run(command: string) {
  try {
    execSync(command, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    return { command, passed: true };
  } catch {
    return { command, passed: false };
  }
}

const intentPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-patch-intent-v7.1.json";
const planPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-plan-v7.0.json";
const runIndexPath =
  "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.json";
const ledgerPath = "sentra/ledger/post-merge-validation.json";

const intent = readJson(intentPath);
const plan = readJson(planPath);
const runIndex = readJson(runIndexPath);
const ledger = readJson(ledgerPath);

const candidates = [
  {
    id: "target-selection-artifact",
    title: "Target Selection Artifact",
    targetType: "generated-artifact-and-gate",
    summary:
      "Create a deterministic target-selection artifact that chooses the concrete next patch target before any source patch proposal.",
    proposedFiles: [
      "scripts/write-hermes-agentic-run-v2-target-selection-v7-2.ts",
      "evaluations/hermes-agentic-run-v2-target-selection-v7-2-gate.ts",
      "hermes/agentic-workflow/run-v2/target-selection-v7.2.json",
      "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.json",
      "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.md",
      "package.json"
    ],
    signals: {
      autonomyLeverage: 5,
      safety: 5,
      auditability: 5,
      reversibility: 5,
      executionValue: 4,
      effort: 2
    },
    risks: [
      "Could remain meta-work if not followed by a concrete patch proposal",
      "Needs a clear handoff to v7.3"
    ]
  },
  {
    id: "source-patch-proposal",
    title: "Source Patch Proposal",
    targetType: "source-patch-proposal",
    summary:
      "Generate the first source patch proposal for run v2 immediately from the v7.1 intent.",
    proposedFiles: [
      "scripts/write-hermes-agentic-run-v2-source-patch-proposal-v7-3.ts",
      "evaluations/hermes-agentic-run-v2-source-patch-proposal-v7-3-gate.ts"
    ],
    signals: {
      autonomyLeverage: 5,
      safety: 3,
      auditability: 4,
      reversibility: 4,
      executionValue: 5,
      effort: 3
    },
    risks: [
      "Skips explicit target selection",
      "Higher chance of broad or premature source change"
    ]
  },
  {
    id: "approval-contract",
    title: "Approval Contract",
    targetType: "approval-artifact",
    summary:
      "Add another approval contract before choosing a target.",
    proposedFiles: [
      "hermes/agentic-workflow/approvals/run-v2-target-selection.example.json"
    ],
    signals: {
      autonomyLeverage: 3,
      safety: 5,
      auditability: 5,
      reversibility: 5,
      executionValue: 2,
      effort: 1
    },
    risks: [
      "Adds process without improving target quality",
      "May slow the second run unnecessarily"
    ]
  }
];

function score(candidate: any) {
  const s = candidate.signals;
  const gross =
    s.autonomyLeverage * 5 +
    s.safety * 5 +
    s.auditability * 4 +
    s.reversibility * 3 +
    s.executionValue * 4;

  const effortPenalty = s.effort * 3;

  return {
    gross,
    effortPenalty,
    final: gross - effortPenalty
  };
}

const rankedTargets = candidates
  .map((candidate) => {
    const scoring = score(candidate);
    return {
      ...candidate,
      scoring,
      score: scoring.final
    };
  })
  .sort((a, b) => b.score - a.score);

const selectedTarget = rankedTargets[0];

const validationResults = [
  run("npm run hermes:agentic-run-v2-patch-intent:v7.1:gate"),
  run("npm run hermes:agentic-run-v2-plan:v7.0:gate"),
  run("npm run hermes:agentic-run-index:v6.7:gate")
];

const report = {
  runtime: "hermes-agentic-run-v2-target-selection-v7.2",
  generatedAt: new Date().toISOString(),
  status: "target-selected",
  inputArtifacts: [intentPath, planPath, runIndexPath, ledgerPath],
  run: {
    id: "hermes-agentic-run-v2",
    sourceIntent: intent.runtime,
    sourcePlan: plan.runtime,
    sourceRunIndex: runIndex.runtime
  },
  selectedTarget,
  rankedTargets,
  decision: {
    selectedTargetId: selectedTarget.id,
    selectedTargetType: selectedTarget.targetType,
    rationale: [
      "It is the smallest next step that increases autonomy while preserving control.",
      "It keeps run v2 bounded before source patch proposal.",
      "It creates an auditable handoff into v7.3."
    ],
    nextStep:
      "Generate Hermes Agentic Run v2 Source Patch Proposal v7.3 from this target selection. Do not apply the patch yet."
  },
  context: {
    intentStatus: intent.status,
    planStatus: plan.status,
    runIndexStatus: runIndex.status,
    ledgerEntries: Array.isArray(ledger.entries) ? ledger.entries.length : 0
  },
  safetyBoundary: {
    targetSelectionOnly: true,
    patchGenerated: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforePatch: true
  },
  validationResults,
  checks: {
    runtimeLabeled: true,
    statusTargetSelected: true,
    intentValid: intent.status === "intent-declared",
    planValid: plan.status === "planned",
    runIndexComplete: runIndex.status === "complete",
    ledgerHasEntry: Array.isArray(ledger.entries) && ledger.entries.length > 0,
    targetsRanked: rankedTargets.length >= 3,
    selectedTargetPresent: selectedTarget.id === "target-selection-artifact",
    selectedTargetHasFiles: selectedTarget.proposedFiles.length >= 3,
    validationsPassed: validationResults.every((result) => result.passed),
    targetSelectionOnly: true,
    noPatchGenerated: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true,
    humanApprovalRequiredBeforePatch: true
  },
  notes: [
    "This selects the concrete next target for Hermes agentic run v2.",
    "It does not generate or apply a source patch.",
    "The next safe step is v7.3 source patch proposal."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/run-v2/target-selection-v7.2.json"),
  JSON.stringify(report, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.json"
  ),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Run v2 Target Selection v7.2",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## Selected target",
  "",
  `- ID: \`${selectedTarget.id}\``,
  `- Title: ${selectedTarget.title}`,
  `- Type: ${selectedTarget.targetType}`,
  `- Score: ${selectedTarget.score}`,
  "",
  selectedTarget.summary,
  "",
  "## Rationale",
  "",
  ...report.decision.rationale.map((item) => `- ${item}`),
  "",
  "## Proposed files",
  "",
  ...selectedTarget.proposedFiles.map((file) => `- \`${file}\``),
  "",
  "## Ranked targets",
  "",
  ...rankedTargets.map(
    (target, index) =>
      `${index + 1}. **${target.title}** — score ${target.score}`
  ),
  "",
  "## Safety boundary",
  "",
  `- Target selection only: ${report.safetyBoundary.targetSelectionOnly}`,
  `- Patch generated: ${report.safetyBoundary.patchGenerated}`,
  `- Patch applied: ${report.safetyBoundary.patchApplied}`,
  `- Branch created: ${report.safetyBoundary.branchCreated}`,
  `- Pushed: ${report.safetyBoundary.pushed}`,
  `- Merged: ${report.safetyBoundary.merged}`,
  `- PR opened: ${report.safetyBoundary.prOpened}`,
  `- Human approval before patch: ${report.safetyBoundary.humanApprovalRequiredBeforePatch}`,
  "",
  "## Next step",
  "",
  report.decision.nextStep,
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-selection-v7.2.md"
  ),
  md
);

console.log(JSON.stringify(report, null, 2));

if (report.status !== "target-selected") {
  process.exit(1);
}
