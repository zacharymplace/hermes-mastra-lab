import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/contracts/sentra-contracts.json"), "utf8")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "sentra-contracts-v1"
  },
  {
    id: "contract-report-passed",
    pass: report.passed === true
  },
  {
    id: "all-schemas-present",
    pass: report.schemaCount >= 8
  },
  {
    id: "project-contract-valid",
    pass: report.checks?.some((check: any) => check.id === "project-contract" && check.pass === true)
  },
  {
    id: "snapshot-contract-valid",
    pass: report.checks?.some((check: any) => check.id === "snapshot-contract" && check.pass === true)
  },
  {
    id: "promotion-input-contract-valid",
    pass: report.checks?.some((check: any) => check.id === "promotion-input-contract" && check.pass === true)
  },
  {
    id: "plan-contract-valid",
    pass: report.checks?.some((check: any) => check.id === "plan-contract" && check.pass === true)
  },
  {
    id: "docs-present",
    pass: fs.existsSync(path.join(root, "docs/sentra-contracts.md"))
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
