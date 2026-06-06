import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ledgerPath = path.join(root, "sentra/ledger/events.jsonl");
const snapshotPath = path.join(root, "sentra/snapshot.json");
const promotionPath = path.join(root, "reports/promotions/hermes-promotion-v1.json");
const outJsonPath = path.join(root, "reports/ledger/sentra-ledger-report.json");
const outMdPath = path.join(root, "reports/ledger/sentra-ledger-report.md");

function readJsonIfExists(relativePath: string) {
  const fullPath = path.join(root, relativePath);
  return fs.existsSync(fullPath)
    ? JSON.parse(fs.readFileSync(fullPath, "utf8"))
    : null;
}

const events = fs
  .readFileSync(ledgerPath, "utf8")
  .split("\n")
  .filter(Boolean)
  .map((line, index) => ({
    index: index + 1,
    ...JSON.parse(line)
  }));

const snapshot = readJsonIfExists("sentra/snapshot.json");
const promotion = readJsonIfExists("reports/promotions/hermes-promotion-v1.json");

const report = {
  runtime: "sentra-operating-ledger-v1",
  generatedAt: new Date().toISOString(),
  ledgerArtifact: "sentra/ledger/events.jsonl",
  eventCount: events.length,
  latestEvent: events.at(-1),
  linkedArtifacts: {
    snapshot: {
      artifact: "sentra/snapshot.json",
      exists: Boolean(snapshot),
      runtime: snapshot?.runtime ?? null,
      generatedAt: snapshot?.generatedAt ?? null
    },
    promotion: {
      artifact: "reports/promotions/hermes-promotion-v1.json",
      exists: Boolean(promotion),
      runtime: promotion?.runtime ?? null,
      status: promotion?.status ?? null,
      generatedAt: promotion?.generatedAt ?? null
    }
  },
  checks: {
    hasEvents: events.length >= 3,
    hasSnapshotLink: Boolean(snapshot),
    hasPromotionLink: Boolean(promotion),
    latestEventIsSentraContext:
      events.at(-1)?.type === "sentra.context.v1"
  },
  events
};

fs.mkdirSync(path.dirname(outJsonPath), { recursive: true });
fs.writeFileSync(outJsonPath, JSON.stringify(report, null, 2) + "\n");

const lines = [
  "# Sentra Operating Ledger Report",
  "",
  `Generated: ${report.generatedAt}`,
  "",
  `Event count: ${report.eventCount}`,
  "",
  "## Linked artifacts",
  "",
  `- Snapshot: ${report.linkedArtifacts.snapshot.exists}`,
  `- Promotion: ${report.linkedArtifacts.promotion.exists}`,
  "",
  "## Events",
  "",
  ...events.map((event) => `- ${event.index}. ${event.type}: ${event.summary}`),
  ""
];

fs.writeFileSync(outMdPath, lines.join("\n"));

console.log(JSON.stringify(report, null, 2));
