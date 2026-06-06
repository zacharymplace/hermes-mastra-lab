import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/operator-boundary/hermes-agentic-operator-boundary-v6.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/operator-boundary/v6.json",
  "reports/agentic-workflow/operator-boundary/hermes-agentic-operator-boundary-v6.json",
  "reports/agentic-workflow/operator-boundary/hermes-agentic-operator-boundary-v6.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-operator-boundary-v6"
  },
  {
    id: "status-documented",
    pass: report.status === "documented"
  },
  {
    id: "remote-branch-detected",
    pass: report.checks?.remoteBranchDetected === true
  },
  {
    id: "pr-detected",
    pass: report.checks?.prDetected === true
  },
  {
    id: "workflow-push-separated",
    pass:
      report.semantics?.workflowDidPush === false &&
      report.semantics?.operatorDidPush === true
  },
  {
    id: "workflow-pr-separated",
    pass:
      report.semantics?.workflowOpenedPr === false &&
      report.semantics?.operatorOpenedPr === true
  },
  {
    id: "human-boundary-preserved",
    pass: report.checks?.humanBoundaryPreserved === true
  },
  {
    id: "artifacts-exist",
    pass: requiredArtifacts.every((artifact) =>
      fs.existsSync(path.join(root, artifact))
    )
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
