import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const reportPath = path.join(root, "reports/langfuse-sdk-emission-spike.json");

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

const checks = [
  {
    id: "credentials-present",
    pass: Boolean(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY)
  },
  {
    id: "sdk-emission-mode",
    pass: report.mode === "sdk-emission"
  },
  {
    id: "events-emitted",
    pass: report.emittedEvents === report.attemptedEvents && report.emittedEvents >= 7
  },
  {
    id: "artifacts-linked",
    pass: report.artifactsLinked === true
  },
  {
    id: "trace-id-present",
    pass: Boolean(report.traceId)
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify(
  {
    passed,
    traceId: report.traceId,
    mode: report.mode,
    attemptedEvents: report.attemptedEvents,
    emittedEvents: report.emittedEvents,
    checks,
    nextManualCheck:
      passed
        ? "Open Langfuse and verify the trace, stages, metadata, and artifact references are visible."
        : "Set LANGFUSE_PUBLIC_KEY and LANGFUSE_SECRET_KEY, rerun npm run langfuse:sdk-spike, then rerun this verifier."
  },
  null,
  2
));

if (!passed) {
  process.exit(1);
}
