import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function exists(relativePath: string) {
  return fs.existsSync(path.join(root, relativePath));
}

const runIndexPath = "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.json";
const ledgerPath = "sentra/ledger/post-merge-validation.json";
const prioritizationPath = "reports/priorities/sentra-project-prioritization.json";

const runIndex = readJson(runIndexPath);
const ledger = readJson(ledgerPath);
const prioritization = exists(prioritizationPath)
  ? readJson(prioritizationPath)
  : null;

const candidates = [
  {
    id: "agentic-next-run",
    title: "Start Next Agentic Run",
    summary:
      "Use the completed v1-v6.7 run index to start a second controlled agentic workflow cycle.",
    signals: {
      strategicFit: 5,
      learningValue: 5,
      operatingLeverage: 5,
      riskReduction: 4,
      autonomyLeverage: 5,
      effort: 3
    },
    risks: [
      "Could repeat the same artifact loop without adding autonomy",
      "Needs clearer target selection before applying more repo changes"
    ]
  },
  {
    id: "agentic-loop-improvement",
    title: "Improve Current Agentic Loop",
    summary:
      "Tighten the current loop by adding stronger target selection, stale artifact cleanup, and generated-file policy.",
    signals: {
      strategicFit: 5,
      learningValue: 4,
      operatingLeverage: 5,
      riskReduction: 5,
      autonomyLeverage: 4,
      effort: 2
    },
    risks: [
      "May over-polish the workflow before testing another real run"
    ]
  },
  {
    id: "sentra-os-extraction",
    title: "Extract Sentra OS",
    summary:
      "Begin separating Sentra from the lab into a portable operating layer with projects, priorities, ledgers, reviews, and context.",
    signals: {
      strategicFit: 5,
      learningValue: 4,
      operatingLeverage: 5,
      riskReduction: 4,
      autonomyLeverage: 4,
      effort: 4
    },
    risks: [
      "Extraction before the second agentic run may freeze immature contracts",
      "Could split attention across repos too early"
    ]
  }
];

function score(candidate: any) {
  const s = candidate.signals;
  const gross =
    s.strategicFit * 4 +
    s.learningValue * 3 +
    s.operatingLeverage * 4 +
    s.riskReduction * 3 +
    s.autonomyLeverage * 4;

  const effortPenalty = s.effort * 2;

  return {
    gross,
    effortPenalty,
    final: gross - effortPenalty
  };
}

const rankedCandidates = candidates
  .map((candidate) => ({
    ...candidate,
    scoring: score(candidate),
    score: score(candidate).final
  }))
  .sort((a, b) => b.score - a.score);

const selected = rankedCandidates[0];

const selector = {
  runtime: "hermes-agentic-next-run-selector-v6.8",
  generatedAt: new Date().toISOString(),
  status: "selected",
  inputArtifacts: [
    runIndexPath,
    ledgerPath,
    prioritizationPath
  ],
  context: {
    runIndexStatus: runIndex.status,
    runState: runIndex.run?.currentState,
    latestLedgerEntry:
      ledger.entries?.[ledger.entries.length - 1]?.id ?? null,
    priorSelectedProject:
      prioritization?.selectedProject?.id ?? null
  },
  selected,
  rankedCandidates,
  recommendation: {
    nextAction:
      selected.id === "agentic-next-run"
        ? "Create a second controlled agentic run using the v6.7 run index as completed operating context."
        : selected.id === "agentic-loop-improvement"
          ? "Patch the current agentic loop with stronger target selection and generated artifact cleanup policy."
          : "Create the first Sentra OS extraction branch from existing contracts and ledgers.",
    rationale: [
      "The v1-v6.7 chain is complete and recorded.",
      "The system now needs either another run or a tighter loop before extraction.",
      "The highest score should drive the next terminal push."
    ]
  },
  checks: {
    runtimeLabeled: true,
    runIndexComplete: runIndex.status === "complete",
    ledgerHasEntry: Array.isArray(ledger.entries) && ledger.entries.length > 0,
    candidatesRanked: rankedCandidates.length === candidates.length,
    selectedCandidatePresent: Boolean(selected?.id),
    recommendationPresent: true
  },
  notes: [
    "This selector turns the completed agentic run into the next operating decision.",
    "It prevents Hermes from blindly continuing the same sequence.",
    "It creates a deterministic bridge between completed work and the next run."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/next-run/v6.8.json"),
  JSON.stringify(selector, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/next-run/hermes-agentic-next-run-selector-v6.8.json"),
  JSON.stringify(selector, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Next-Run Selector v6.8",
  "",
  `Generated: ${selector.generatedAt}`,
  `Status: ${selector.status}`,
  "",
  "## Selected",
  "",
  `- ID: \`${selected.id}\``,
  `- Title: ${selected.title}`,
  `- Score: ${selected.score}`,
  `- Summary: ${selected.summary}`,
  "",
  "## Recommended next action",
  "",
  selector.recommendation.nextAction,
  "",
  "## Ranked candidates",
  "",
  ...rankedCandidates.map(
    (candidate, index) =>
      `${index + 1}. **${candidate.title}** — ${candidate.score}`
  ),
  "",
  "## Context",
  "",
  `- Run index status: ${selector.context.runIndexStatus}`,
  `- Run state: ${selector.context.runState}`,
  `- Latest ledger entry: ${selector.context.latestLedgerEntry}`,
  `- Prior selected project: ${selector.context.priorSelectedProject}`,
  "",
  "## Notes",
  "",
  ...selector.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/next-run/hermes-agentic-next-run-selector-v6.8.md"),
  md
);

console.log(JSON.stringify(selector, null, 2));

if (selector.status !== "selected") {
  process.exit(1);
}
