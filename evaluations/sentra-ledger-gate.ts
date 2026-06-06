import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/ledger/sentra-ledger-report.json"), "utf8")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "sentra-operating-ledger-v1"
  },
  {
    id: "events-present",
    pass: report.checks?.hasEvents === true
  },
  {
    id: "snapshot-linked",
    pass: report.checks?.hasSnapshotLink === true
  },
  {
    id: "promotion-linked",
    pass: report.checks?.hasPromotionLink === true
  },
  {
    id: "latest-event-current",
    pass: report.checks?.latestEventIsSentraContext === true
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
