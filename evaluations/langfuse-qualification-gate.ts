import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/langfuse-qualification.json"), "utf8")
);

const requiredStages = [
  "core",
  "native",
  "parallel",
  "human-review",
  "suspend",
  "resume",
  "qualification"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "langfuse-qualification-local-contract"
  },
  {
    id: "no-network-mode",
    pass: report.mode === "local-deterministic-no-network"
  },
  {
    id: "trace-id-present",
    pass: Boolean(report.traceId)
  },
  {
    id: "required-stage-coverage",
    pass: requiredStages.every((stage) =>
      report.events?.some((event: any) => event.stage === stage)
    )
  },
  {
    id: "artifacts-linked",
    pass: report.events?.every((event: any) =>
      event.outputArtifact && event.metadata?.artifactExists === true
    )
  },
  {
    id: "suspend-and-review-traced",
    pass:
      report.events?.some((event: any) => event.stage === "suspend" && event.status === "suspended") &&
      report.events?.some((event: any) => event.stage === "human-review" && event.status === "approved")
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
