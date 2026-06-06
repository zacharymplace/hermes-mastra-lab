import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const writeJson = (relativePath: string, value: unknown) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
};

const writeMd = (relativePath: string, lines: string[]) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join("\n")}\n`);
};

const runV2Index = readJson(
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-index-v8.0.json"
);

const ledger = readJson("sentra/ledger/post-merge-validation.json");

const scoreCandidate = (signals: Record<string, number>) => {
  const gross =
    signals.strategicFit * 5 +
    signals.learningValue * 4 +
    signals.operatingLeverage * 5 +
    signals.riskReduction * 4 +
    signals.autonomyLeverage * 5;

  const effortPenalty = signals.effort * 3;

  return {
    gross,
    effortPenalty,
    final: gross - effortPenalty
  };
};

const candidates = [
  {
    id: "loop-quality-hardening",
    title: "Harden Agentic Loop Quality",
    summary:
      "Add explicit quality gates for generated artifact drift, stale timestamps, and no-op source patch claims before starting another patch loop.",
    signals: {
      strategicFit: 5,
      learningValue: 5,
      operatingLeverage: 5,
      riskReduction: 5,
      autonomyLeverage: 4,
      effort: 2
    },
    risks: [
      "Could slow forward motion if overbuilt",
      "Needs to stay focused on practical failure modes"
    ]
  },
  {
    id: "sentra-os-extraction",
    title: "Extract Sentra OS",
    summary:
      "Begin separating Sentra into a portable operating layer for project priorities, ledgers, reviews, and agent-readable context.",
    signals: {
      strategicFit: 5,
      learningValue: 4,
      operatingLeverage: 5,
      riskReduction: 4,
      autonomyLeverage: 4,
      effort: 4
    },
    risks: [
      "Extraction may freeze immature contracts",
      "Could split attention before loop quality is hardened"
    ]
  },
  {
    id: "observability-contract",
    title: "Add Agentic Observability Contract",
    summary:
      "Define stable trace fields for Hermes agentic runs so Mastra and Langfuse integration can measure real workflow behavior.",
    signals: {
      strategicFit: 5,
      learningValue: 5,
      operatingLeverage: 4,
      riskReduction: 4,
      autonomyLeverage: 4,
      effort: 3
    },
    risks: [
      "May be premature if run quality semantics are still loose"
    ]
  },
  {
    id: "run-v3-repeat-cycle",
    title: "Start Another Full Agentic Run",
    summary:
      "Start run v3 immediately using the completed run v2 index as context.",
    signals: {
      strategicFit: 4,
      learningValue: 4,
      operatingLeverage: 4,
      riskReduction: 3,
      autonomyLeverage: 5,
      effort: 3
    },
    risks: [
      "Could repeat the same artifact chain without improving the system",
      "May compound generated drift"
    ]
  }
].map((candidate) => {
  const scoring = scoreCandidate(candidate.signals);
  return {
    ...candidate,
    scoring,
    score: scoring.final
  };
}).sort((a, b) => b.score - a.score);

const selected = candidates[0];

const report = {
  runtime: "hermes-agentic-run-v3-selector-v8.1",
  generatedAt: new Date().toISOString(),
  status: "selected",
  inputArtifacts: [
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-index-v8.0.json",
    "sentra/ledger/post-merge-validation.json"
  ],
  context: {
    runV2Status: runV2Index.status,
    runV2State: runV2Index.run?.currentState,
    runV2LatestLedgerEntry: runV2Index.run?.latestLedgerEntryId,
    ledgerEntries: ledger.entries?.length ?? 0
  },
  selected,
  rankedCandidates: candidates,
  recommendation: {
    nextAction:
      "Create a run v3 target contract for loop-quality hardening before any source patch proposal.",
    rationale: [
      "Run v2 is complete and recorded.",
      "The next highest-leverage step is improving loop quality before repeating the workflow.",
      "This reduces generated drift and no-op patch risk while preserving the human boundary."
    ],
    proposedNextArtifact:
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.json"
  },
  safetyBoundary: {
    selectorOnly: true,
    patchGenerated: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  checks: {
    runtimeLabeled: true,
    runV2IndexComplete: runV2Index.status === "complete",
    ledgerHasEntries: (ledger.entries?.length ?? 0) >= 2,
    candidatesRanked: candidates.length >= 3,
    selectedCandidatePresent: Boolean(selected?.id),
    recommendationPresent: true,
    selectorOnly: true,
    noPatchGenerated: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This selector turns completed run v2 into the next operating decision.",
    "It selects loop-quality hardening as the safest high-leverage run v3 direction.",
    "The next step should be a target contract, not a patch."
  ]
};

writeJson("hermes/agentic-workflow/run-v3/selector/v8.1.json", report);
writeJson("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-selector-v8.1.json", report);

writeMd("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-selector-v8.1.md", [
  "# Hermes Agentic Run v3 Selector v8.1",
  "",
  `- Runtime: ${report.runtime}`,
  `- Status: ${report.status}`,
  `- Selected: ${selected.title}`,
  `- Score: ${selected.score}`,
  `- Run v2 state: ${report.context.runV2State}`,
  `- Latest ledger entry: ${report.context.runV2LatestLedgerEntry}`,
  "",
  "## Recommendation",
  "",
  report.recommendation.nextAction,
  "",
  "## Ranked Candidates",
  "",
  ...candidates.map(
    (candidate, index) =>
      `${index + 1}. ${candidate.title} — ${candidate.score}: ${candidate.summary}`
  ),
  "",
  "## Safety",
  "",
  "- Selector only.",
  "- No patch generated.",
  "- No patch applied.",
  "- No branch created.",
  "- No push, PR, or merge.",
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`)
]);

console.log(JSON.stringify(report, null, 2));
