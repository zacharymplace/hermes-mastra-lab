import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const report = JSON.parse(
  fs.readFileSync(
    path.join(
      root,
      "reports/agentic-workflow/source-patches/diffs/hermes-diff-validation.json"
    ),
    "utf8"
  )
);

const diffExists = fs.existsSync(
  path.join(
    root,
    "reports/agentic-workflow/source-patches/diffs/hermes-source-patch.diff"
  )
);

const checks = [
  {
    id: "runtime-labeled",
    pass: report.runtime === "hermes-diff-validation-v1"
  },
  {
    id: "status-passed",
    pass: report.status === "passed"
  },
  {
    id: "diff-generated",
    pass: report.checks?.diffGenerated === true && diffExists
  },
  {
    id: "touched-paths-present",
    pass: report.checks?.touchedPathsPresent === true
  },
  {
    id: "allowed-paths-only",
    pass: report.checks?.allowedPathsOnly === true
  },
  {
    id: "disallowed-paths-absent",
    pass: report.checks?.disallowedPathsAbsent === true
  },
  {
    id: "proposal-no-push",
    pass: report.checks?.proposalNoPush === true
  },
  {
    id: "proposal-no-auto-merge",
    pass: report.checks?.proposalNoAutoMerge === true
  },
  {
    id: "apply-no-push",
    pass: report.checks?.applyNoPush === true
  },
  {
    id: "apply-no-auto-merge",
    pass: report.checks?.applyNoAutoMerge === true
  },
  {
    id: "source-patch-approved",
    pass: report.checks?.sourcePatchWasApproved === true
  }
];

const passed = checks.every((check) => check.pass);

console.log(JSON.stringify({ passed, checks }, null, 2));

if (!passed) {
  process.exit(1);
}
