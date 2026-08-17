import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function readJsonl(relativePath: string) {
  return fs
    .readFileSync(path.join(root, relativePath), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line, index) => ({
      index: index + 1,
      ...JSON.parse(line)
    }));
}

function readText(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const snapshot = readJson("sentra/snapshot.json");
const promotion = readJson("reports/promotions/hermes-promotion-v1.json");
const ledgerReport = readJson("reports/ledger/sentra-ledger-report.json");
const ledgerEvents = readJsonl("sentra/ledger/events.jsonl");
const packageJson = readJson("package.json");

const topPriority = snapshot.topPriority;
const staleRisks = snapshot.staleRisks ?? [];

// Each candidate is checked against real repository state instead of being
// reported as permanently outstanding. A candidate that becomes true simply
// drops out of nextPriorities on the next run.
const priorityCandidates = [
  {
    id: "promotion-history-ledger",
    title: "Promotion History Ledger",
    why: "Promotion decisions should accumulate as a durable, queryable operating history.",
    desiredOutcome:
      "Append each Hermes promotion result into a promotion history ledger with status, score, reviewer, and linked artifacts.",
    isComplete: (
      packageJson.scripts?.["hermes:promotion:v1:check"] ?? ""
    ).includes("hermes:promotion-history")
  },
  {
    id: "multi-project-prioritization",
    title: "Multi-project Prioritization",
    why: "Sentra should choose between multiple active projects instead of only operating Hermes Mastra Lab.",
    desiredOutcome:
      "Rank active projects and generate promotion inputs from the highest-value project context.",
    isComplete: Boolean(snapshot.projectPrioritization?.selectedProject)
  },
  {
    id: "weekly-review-feedback",
    title: "Weekly Review Feedback",
    why: "Weekly reviews should update priorities and stale risks instead of only reporting them.",
    desiredOutcome:
      "Convert review outcomes into proposed updates for sentra/priorities/current.json.",
    isComplete:
      fs.existsSync(
        path.join(root, "scripts/write-sentra-priority-proposal.ts")
      ) &&
      fs.existsSync(path.join(root, "scripts/apply-sentra-priority-proposal.ts"))
  },
  {
    id: "promotion-ledger-multi-source",
    title: "Promotion Ledger Multi-Source",
    why: "The promotion history ledger only reads the single hardcoded hermes-promotion-v1.json artifact, so it would silently miss any future Hermes promotion workflow version.",
    desiredOutcome:
      "Generalize the ledger writer to discover and append events from every Hermes promotion artifact, not just hermes-promotion-v1.json.",
    isComplete: !readText(
      "scripts/write-hermes-promotion-history.ts"
    ).includes('"reports/promotions/hermes-promotion-v1.json"')
  },
  {
    id: "operating-loop-ci-coverage",
    title: "Operating Loop CI Coverage",
    why: "CI only runs npm run check and npm run mastra:check, neither of which exercises the Sentra/Hermes promotion and ledger loop, so a regression there would go unnoticed.",
    desiredOutcome:
      "Wire the Sentra/Hermes operating loop (context, promotion, ledger) into a script CI already runs.",
    isComplete:
      /sentra:|hermes:promotion/.test(packageJson.scripts?.check ?? "") ||
      /sentra:|hermes:promotion/.test(
        packageJson.scripts?.["mastra:check"] ?? ""
      )
  },
  {
    id: "agentic-workflow-run-closeout",
    title: "Hermes Agentic Workflow Run Closeout",
    why: "Multi-project prioritization selected Hermes Agentic Workflow as the top project, but its run-v4 PR lifecycle has been tracking-ready with no branch, push, or PR across multiple cycles, and no closeout artifact has been produced.",
    desiredOutcome:
      "Produce the proposed post-merge ledger (or an explicit closeout decision) for run-v4 so the top-priority project stops stalling.",
    isComplete: fs.existsSync(
      path.join(
        root,
        "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-post-merge-ledger-v10.7.json"
      )
    )
  }
];

const completedPriorities = priorityCandidates
  .filter((candidate) => candidate.isComplete)
  .map((candidate) => ({ id: candidate.id, title: candidate.title }));

const nextPriorities = priorityCandidates
  .filter((candidate) => !candidate.isComplete)
  .map((candidate, index) => ({
    id: candidate.id,
    rank: index + 1,
    title: candidate.title,
    why: candidate.why,
    desiredOutcome: candidate.desiredOutcome
  }));

const review = {
  runtime: "sentra-weekly-review-v1",
  generatedAt: new Date().toISOString(),
  period: {
    label: "current-operating-cycle",
    source: "sentra/ledger/events.jsonl"
  },
  status: "complete",
  summary:
    "Sentra generated operating context, Hermes consumed the promotion input, a promotion decision was produced, and the operating ledger linked the cycle artifacts.",
  evidence: {
    snapshot: {
      runtime: snapshot.runtime,
      activeProjects: snapshot.activeProjects?.length ?? 0,
      topPriority: topPriority?.title ?? null
    },
    promotion: {
      runtime: promotion.runtime,
      status: promotion.status,
      recommendation: promotion.recommendation?.title ?? null,
      score: promotion.recommendation?.score ?? null
    },
    ledger: {
      runtime: ledgerReport.runtime,
      eventCount: ledgerReport.eventCount,
      latestEvent: ledgerReport.latestEvent?.type ?? null
    }
  },
  outcomes: [
    {
      id: "sentra-context-loop",
      status: "complete",
      summary:
        "Sentra context now produces a snapshot and promotion input from projects, decisions, reviews, and priorities."
    },
    {
      id: "hermes-promotion-loop",
      status: promotion.status === "promoted" ? "complete" : "needs-review",
      summary:
        "Hermes promotion workflow consumed Sentra input and produced auditable promotion artifacts."
    },
    {
      id: "operating-ledger",
      status: ledgerReport.checks?.hasEvents ? "complete" : "needs-review",
      summary:
        "Sentra ledger links operating events to snapshot and promotion artifacts."
    }
  ],
  risks: staleRisks.map((risk: string, index: number) => ({
    id: `risk-${index + 1}`,
    status: "watch",
    summary: risk
  })),
  completedPriorities,
  nextPriorities,
  ledgerEvents,
  notes: [
    "This review is generated from operating artifacts on every run.",
    "It closes the loop from ledger to review.",
    "nextPriorities is computed from real repository state, not a fixed list — completed items drop off automatically."
  ]
};

const jsonPath = path.join(root, "sentra/reviews/weekly/current.json");
const reportJsonPath = path.join(root, "reports/reviews/sentra-weekly-review.json");
const reportMdPath = path.join(root, "reports/reviews/sentra-weekly-review.md");

fs.writeFileSync(jsonPath, JSON.stringify(review, null, 2) + "\n");
fs.writeFileSync(reportJsonPath, JSON.stringify(review, null, 2) + "\n");

const lines = [
  "# Sentra Weekly Review",
  "",
  `Generated: ${review.generatedAt}`,
  `Status: ${review.status}`,
  "",
  "## Summary",
  "",
  review.summary,
  "",
  "## Evidence",
  "",
  `- Snapshot: ${review.evidence.snapshot.runtime}`,
  `- Promotion: ${review.evidence.promotion.status} — ${review.evidence.promotion.recommendation}`,
  `- Ledger events: ${review.evidence.ledger.eventCount}`,
  "",
  "## Outcomes",
  "",
  ...review.outcomes.map((item) => `- ${item.id} (${item.status}): ${item.summary}`),
  "",
  "## Risks",
  "",
  ...review.risks.map((item) => `- ${item.id} (${item.status}): ${item.summary}`),
  "",
  "## Completed priorities",
  "",
  ...(completedPriorities.length > 0
    ? completedPriorities.map((item) => `- ${item.title}`)
    : ["- None yet."]),
  "",
  "## Next priorities",
  "",
  ...review.nextPriorities.map(
    (item) => `- ${item.rank}. ${item.title}: ${item.why}`
  ),
  "",
  "## Notes",
  "",
  ...review.notes.map((note) => `- ${note}`),
  ""
];

fs.writeFileSync(reportMdPath, lines.join("\n"));

console.log(JSON.stringify(review, null, 2));
