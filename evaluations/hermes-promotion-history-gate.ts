import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(root, "reports/promotions/history/hermes-promotion-history.json"),
    "utf8"
  )
);

const ledgerExists = fs.existsSync(
  path.join(root, "hermes/promotions/history/events.jsonl")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-promotion-history-ledger-v1"
  },
  {
    id: "ledger-exists",
    pass: ledgerExists
  },
  {
    id: "events-present",
    pass: report.checks?.hasEvents === true
  },
  {
    id: "latest-event-recorded",
    pass: report.checks?.latestEventRecorded === true
  },
  {
    id: "promotion-linked",
    pass: report.checks?.latestPromotionLinked === true
  },
  {
    id: "reviewer-captured",
    pass: report.checks?.reviewerCaptured === true
  },
  {
    id: "score-captured",
    pass: report.checks?.scoreCaptured === true
  },
  {
    id: "top-priority-captured",
    pass: report.checks?.topPriorityCaptured === true
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
