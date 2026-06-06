import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/langfuse-sdk-emission-spike.json"), "utf8")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "langfuse-sdk-emission-spike"
  },
  {
    id: "valid-mode",
    pass: ["dry-run", "sdk-emission"].includes(report.mode)
  },
  {
    id: "trace-id-present",
    pass: Boolean(report.traceId)
  },
  {
    id: "events-attempted",
    pass: report.attemptedEvents >= 7
  },
  {
    id: "dry-run-safe-or-emitted",
    pass:
      report.mode === "dry-run"
        ? report.emittedEvents === 0 && Boolean(report.skippedReason)
        : report.emittedEvents === report.attemptedEvents
  },
  {
    id: "artifacts-linked",
    pass: report.artifactsLinked === true
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
