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

const snapshot = readJson("sentra/snapshot.json");
const promotion = readJson("reports/promotions/hermes-promotion-v1.json");
const ledgerReport = readJson("reports/ledger/sentra-ledger-report.json");
const ledgerEvents = readJsonl("sentra/ledger/events.jsonl");

const topPriority = snapshot.topPriority;
const staleRisks = snapshot.staleRisks ?? [];

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
  nextPriorities: [
    {
      id: "promotion-history-ledger",
      rank: 1,
      title: "Promotion History Ledger",
      why: "Promotion decisions should accumulate as a durable, queryable operating history.",
      desiredOutcome:
        "Append each Hermes promotion result into a promotion history ledger with status, score, reviewer, and linked artifacts."
    },
    {
      id: "multi-project-prioritization",
      rank: 2,
      title: "Multi-project Prioritization",
      why:
        "Sentra should choose between multiple active projects instead of only operating Hermes Mastra Lab.",
      desiredOutcome:
        "Rank active projects and generate promotion inputs from the highest-value project context."
    },
    {
      id: "weekly-review-feedback",
      rank: 3,
      title: "Weekly Review Feedback",
      why:
        "Weekly reviews should update priorities and stale risks instead of only reporting them.",
      desiredOutcome:
        "Convert review outcomes into proposed updates for sentra/priorities/current.json."
    }
  ],
  ledgerEvents,
  notes: [
    "This is the first Sentra weekly review generated from operating artifacts.",
    "It closes the loop from ledger to review.",
    "The next step is feeding review recommendations back into priorities."
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
