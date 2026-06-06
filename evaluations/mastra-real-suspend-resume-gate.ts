import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const report = JSON.parse(
  fs.readFileSync(path.join(root, "reports/mastra-real-suspend-resume.json"), "utf8")
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "mastra-real-suspend-resume-qualification"
  },
  {
    id: "real-api-mode",
    pass: report.mode === "local-real-mastra-api"
  },
  {
    id: "real-suspend-confirmed",
    pass: report.checks?.usedRealSuspend === true
  },
  {
    id: "suspended-before-review",
    pass: report.suspendedBeforeReview === true && report.startStatus === "suspended"
  },
  {
    id: "resume-outcome-classified",
    pass: ["success", "blocked"].includes(report.resumeStatus)
  },
  {
    id: "snapshot-blocker-detected-if-blocked",
    pass:
      report.resumeStatus === "blocked"
        ? report.checks?.requiresSnapshotPersistence === true
        : true
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
