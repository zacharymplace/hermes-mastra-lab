import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

// Discover every Hermes promotion workflow's report, not just v1, so a
// future hermes-promotion-v2 (or later) is picked up automatically instead
// of silently missing the ledger.
const promotionsDir = path.join(root, "reports/promotions");
const promotionFilePattern = /^hermes-promotion-v\d+\.json$/;

const promotionArtifacts = fs
  .readdirSync(promotionsDir)
  .filter((name) => promotionFilePattern.test(name))
  .sort();

if (promotionArtifacts.length === 0) {
  throw new Error(
    `No Hermes promotion artifacts found in ${path.relative(
      root,
      promotionsDir
    )} matching ${promotionFilePattern}`
  );
}

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

const newEvents: any[] = [];

for (const fileName of promotionArtifacts) {
  const promotionJsonArtifact = `reports/promotions/${fileName}`;
  const promotionMarkdownArtifact = promotionJsonArtifact.replace(
    /\.json$/,
    ".md"
  );
  const promotion = readJson(promotionJsonArtifact);

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
      promotionInputArtifact: promotion.inputArtifact ?? null
    },
    linkedArtifacts: {
      promotionJson: promotionJsonArtifact,
      promotionMarkdown: promotionMarkdownArtifact,
      weeklyReview: "sentra/reviews/weekly/current.json"
    }
  };

  const alreadyRecorded =
    existingEvents.some((item) => item.id === event.id) ||
    newEvents.some((item) => item.id === event.id);

  if (!alreadyRecorded) {
    newEvents.push(event);
  }
}

const events = [...existingEvents, ...newEvents];

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

const latestEvent = events.at(-1);

const report = {
  runtime: "hermes-promotion-history-ledger-v1",
  generatedAt: new Date().toISOString(),
  ledgerArtifact: "hermes/promotions/history/events.jsonl",
  sourceArtifacts: promotionArtifacts.map(
    (fileName) => `reports/promotions/${fileName}`
  ),
  eventCount: events.length,
  promotedCount: promotedEvents.length,
  heldCount: heldEvents.length,
  averageScore,
  latestEvent,
  linkedOperatingReview: {
    artifact: "sentra/reviews/weekly/current.json",
    runtime: weeklyReview.runtime,
    status: weeklyReview.status
  },
  checks: {
    hasEvents: events.length > 0,
    latestEventRecorded: promotionArtifacts
      .map((fileName) => `reports/promotions/${fileName}`)
      .includes(latestEvent?.linkedArtifacts?.promotionJson),
    latestPromotionLinked: Boolean(
      latestEvent?.linkedArtifacts?.promotionJson &&
        fs.existsSync(
          path.join(root, latestEvent.linkedArtifacts.promotionJson)
        )
    ),
    reviewerCaptured: Boolean(latestEvent?.review?.reviewer),
    scoreCaptured: typeof latestEvent?.recommendation?.score === "number",
    topPriorityCaptured: Boolean(latestEvent?.sourceContext?.topPriority)
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
  "## Source artifacts",
  "",
  ...report.sourceArtifacts.map((artifact) => `- ${artifact}`),
  "",
  "## Latest event",
  "",
  `- Status: ${latestEvent.status}`,
  `- Recommendation: ${latestEvent.recommendation.title}`,
  `- Score: ${latestEvent.recommendation.score}`,
  `- Verdict: ${latestEvent.recommendation.verdict}`,
  `- Reviewer: ${latestEvent.review.reviewer}`,
  `- Top priority: ${latestEvent.sourceContext.topPriority}`,
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
