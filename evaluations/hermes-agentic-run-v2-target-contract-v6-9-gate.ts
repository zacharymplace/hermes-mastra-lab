import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.json"
    ),
    "utf8"
  )
);

const requiredArtifacts = [
  "hermes/agentic-workflow/run-v2/target-contract-v6.9.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.json",
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-target-contract-v6.9.md"
];

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-agentic-run-v2-target-contract-v6.9"
  },
  {
    id: "status-contracted",
    pass: report.status === "contracted"
  },
  {
    id: "selector-chose-next-run",
    pass: report.checks?.selectorChoseNextRun === true
  },
  {
    id: "source-run-complete",
    pass: report.checks?.sourceRunComplete === true
  },
  {
    id: "ledger-has-entry",
    pass: report.checks?.ledgerHasEntry === true
  },
  {
    id: "target-declared",
    pass: report.checks?.targetDeclared === true
  },
  {
    id: "allowed-targets-declared",
    pass: report.checks?.allowedTargetsDeclared === true
  },
  {
    id: "disallowed-targets-declared",
    pass: report.checks?.disallowedTargetsDeclared === true
  },
  {
    id: "human-approval-required",
    pass: report.checks?.humanApprovalRequired === true
  },
  {
    id: "no-auto-push",
    pass: report.checks?.noAutoPush === true
  },
  {
    id: "no-auto-merge",
    pass: report.checks?.noAutoMerge === true
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
