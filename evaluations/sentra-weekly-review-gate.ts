import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const review = JSON.parse(
  fs.readFileSync(path.join(root, "sentra/reviews/weekly/current.json"), "utf8")
);

const reportExists = fs.existsSync(
  path.join(root, "reports/reviews/sentra-weekly-review.md")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: review.runtime === "sentra-weekly-review-v1"
  },
  {
    id: "status-complete",
    pass: review.status === "complete"
  },
  {
    id: "snapshot-evidence-present",
    pass: Boolean(review.evidence?.snapshot?.runtime)
  },
  {
    id: "promotion-evidence-present",
    pass: review.evidence?.promotion?.status === "promoted"
  },
  {
    id: "ledger-evidence-present",
    pass: review.evidence?.ledger?.eventCount >= 3
  },
  {
    id: "outcomes-present",
    pass: Array.isArray(review.outcomes) && review.outcomes.length >= 3
  },
  {
    id: "next-priorities-present",
    pass: Array.isArray(review.nextPriorities) && review.nextPriorities.length >= 3
  },
  {
    id: "report-written",
    pass: reportExists
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
