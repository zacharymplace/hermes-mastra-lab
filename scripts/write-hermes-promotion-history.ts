import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const promotion = readJson("reports/promotions/hermes-promotion-v1.json");
const sentraSnapshot = readJson("sentra/snapshot.json");
const weeklyReview = readJson("sentra/reviews/weekly/current.json");

const ledgerPath = path.join(root, "hermes/promotions/history/events.jsonl");
const reportJsonPath = path.join(
  root,
  "reports/promotions/history/hermes-promotion-history.json"
);
const reportMdPath = path.join(
  root,
  "reports/promotions/history/hermes-promotion-history.md"
);

fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });

const existingEvents = fs.existsSync(ledgerPath)
  ? fs
      .readFileSync(ledgerPath, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
  : [];

const event = {
  type: "hermes.promotion",
  id: `${promotion.runtime}:${promotion.generatedAt}`,
  generatedAt: promotion.generatedAt,
  recordedAt: new Date().toISOString(),
  status: promotion.status,
  recommendation: {
    title: promotion.recommendation?.title ?? null,
    score: promotion.recommendation?.score ?? null,
    verdict: promotion.recommendation?.verdict ?? null
  },
  review: {
    approved: promotion.review?.approved ?? null,
    reviewer: promotion.review?.reviewer ?? null,
    reason: promotion.review?.reason ?? null
  },
  sourceContext: {
    topPriority: sentraSnapshot.topPriority?.title ?? null,
    snapshotArtifact: "sentra/snapshot.json",
    promotionInputArtifact: promotion.inputArtifact
  },
  linkedArtifacts: {
    promotionJson: "reports/promotions/hermes-promotion-v1.json",
    promotionMarkdown: "reports/promotions/hermes-promotion-v1.md",
    weeklyReview: "sentra/reviews/weekly/current.json"
  }
};

const alreadyExists = existingEvents.some((item) => item.id === event.id);
const events = alreadyExists ? existingEvents : [...existingEvents, event];

fs.writeFileSync(
  ledgerPath,
  events.map((item) => JSON.stringify(item)).join("\n") + "\n"
);

const promotedEvents = events.filter((item) => item.status === "promoted");
const heldEvents = events.filter((item) => item.status === "held");

const scores = events
  .map((item) => item.recommendation?.score)
  .filter((score) => typeof score === "number");

const averageScore =
  scores.length > 0
    ? Math.round(
        (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100
      ) / 100
    : null;

const report = {
  runtime: "hermes-promotion-history-ledger-v1",
  generatedAt: new Date().toISOString(),
  ledgerArtifact: "hermes/promotions/history/events.jsonl",
  eventCount: events.length,
  promotedCount: promotedEvents.length,
  heldCount: heldEvents.length,
  averageScore,
  latestEvent: events.at(-1),
  linkedOperatingReview: {
    artifact: "sentra/reviews/weekly/current.json",
    runtime: weeklyReview.runtime,
    status: weeklyReview.status
  },
  checks: {
    hasEvents: events.length > 0,
    latestEventRecorded: events.at(-1)?.id === event.id,
    latestPromotionLinked:
      events.at(-1)?.linkedArtifacts?.promotionJson ===
      "reports/promotions/hermes-promotion-v1.json",
    reviewerCaptured: Boolean(events.at(-1)?.review?.reviewer),
    scoreCaptured: typeof events.at(-1)?.recommendation?.score === "number",
    topPriorityCaptured: Boolean(events.at(-1)?.sourceContext?.topPriority)
  },
  events
};

fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2) + "\n");

const lines = [
  "# Hermes Promotion History",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  `Event count: ${report.eventCount}`,
  `Promoted: ${report.promotedCount}`,
  `Held: ${report.heldCount}`,
  `Average score: ${report.averageScore}`,
  "",
  "## Latest event",
  "",
  `- Status: ${event.status}`,
  `- Recommendation: ${event.recommendation.title}`,
  `- Score: ${event.recommendation.score}`,
  `- Verdict: ${event.recommendation.verdict}`,
  `- Reviewer: ${event.review.reviewer}`,
  `- Top priority: ${event.sourceContext.topPriority}`,
  "",
  "## Events",
  "",
  ...events.map(
    (item, index) =>
      `- ${index + 1}. ${item.status}: ${item.recommendation?.title} (${item.recommendation?.score})`
  ),
  ""
];

fs.writeFileSync(reportMdPath, lines.join("\n"));

console.log(JSON.stringify(report, null, 2));
