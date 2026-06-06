import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "reports/langfuse-otel-smoke.json");

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "langfuse-otel-smoke-test"
  },
  {
    id: "status-completed",
    pass: report.status === "completed"
  },
  {
    id: "manual-ui-verification-required",
    pass: report.manualVerificationRequired === true
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
