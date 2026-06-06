import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/next-run/hermes-agentic-next-run-selector-v6.8.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/next-run/v6.8.json",
  "reports/agentic-workflow/next-run/hermes-agentic-next-run-selector-v6.8.json",
  "reports/agentic-workflow/next-run/hermes-agentic-next-run-selector-v6.8.md"
];

const validSelections = [
  "agentic-next-run",
  "agentic-loop-improvement",
  "sentra-os-extraction"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-next-run-selector-v6.8"
  },
  {
    id: "status-selected",
    pass: report.status === "selected"
  },
  {
    id: "run-index-complete",
    pass: report.checks?.runIndexComplete === true
  },
  {
    id: "ledger-has-entry",
    pass: report.checks?.ledgerHasEntry === true
  },
  {
    id: "candidates-ranked",
    pass: report.checks?.candidatesRanked === true
  },
  {
    id: "selected-candidate-valid",
    pass: validSelections.includes(report.selected?.id)
  },
  {
    id: "recommendation-present",
    pass: report.checks?.recommendationPresent === true
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
