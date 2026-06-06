import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/mastra-promotion-v3.json"), "utf8")
);

const closed = new Set(report.closedBlockers ?? []);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "mastra-promotion-report-v3"
  },
  {
    id: "controlled-use-decision",
    pass: report.decision === "promote-for-controlled-use"
  },
  {
    id: "score-threshold",
    pass: report.score?.percentage >= 85
  },
  {
    id: "observability-qualified",
    pass:
      report.evidence?.langfuse?.sdkMode === "sdk-emission" &&
      report.evidence?.langfuse?.artifactsLinked === true
  },
  {
    id: "persistence-qualified",
    pass: report.evidence?.suspendResume?.persistenceQualified === true
  },
  {
    id: "external-human-qualified",
    pass:
      report.evidence?.suspendResume?.externalHumanInputQualified === true
  },
  {
    id: "failure-recovery-qualified",
    pass: report.evidence?.failureRecovery?.qualified === true
  },
  {
    id: "major-blockers-closed",
    pass:
      closed.has("real-langfuse-sdk") &&
      closed.has("snapshot-persistence") &&
      closed.has("external-human-input") &&
      closed.has("failure-recovery")
  },
  {
    id: "guardrails-present",
    pass:
      Array.isArray(report.guardrails) &&
      report.guardrails.some((item: string) =>
        item.includes("domain logic")
      )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
