import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const approvalPath = "hermes/agentic-workflow/approvals/patch-apply.json";
const approvalExamplePath =
  "hermes/agentic-workflow/approvals/patch-apply.example.json";

if (!fs.existsSync(path.join(root, approvalPath))) {
  fs.copyFileSync(
    path.join(root, approvalExamplePath),
    path.join(root, approvalPath)
  );
}

const approval = readJson(approvalPath);
const executionReport = readJson(
  "reports/agentic-workflow/hermes-agentic-execution-report.json"
);

const allowedTargets = [
  "reports/agentic-workflow/applied/hermes-agentic-applied-patch.md",
  "reports/agentic-workflow/applied/hermes-agentic-patch-apply-report.json",
  "reports/agentic-workflow/applied/hermes-agentic-patch-apply-report.md"
];

const approved =
  approval.approved === true &&
  executionReport.status === "ready-for-human-approval" &&
  executionReport.checks?.approvalRequired === true &&
  executionReport.checks?.safeScopeDefined === true;

const appliedPatchMd = [
  "# Hermes Agentic Applied Patch",
  "",
  "## Status",
  "",
  approved ? "Applied within constrained artifact-only scope." : "Held.",
  "",
  "## Scope",
  "",
  "- Writes only agentic workflow apply artifacts.",
  "- Does not modify source runtime logic.",
  "- Does not merge.",
  "- Does not push.",
  "- Requires explicit approval artifact.",
  "",
  "## Approval",
  "",
  `- Approved: ${approval.approved}`,
  `- Reviewer: ${approval.reviewer}`,
  `- Reason: ${approval.reason}`,
  "",
  "## Source execution report",
  "",
  "- reports/agentic-workflow/hermes-agentic-execution-report.json",
  ""
].join("\n");

if (approved) {
  fs.writeFileSync(
    path.join(root, "reports/agentic-workflow/applied/hermes-agentic-applied-patch.md"),
    appliedPatchMd
  );
}

const report = {
  runtime: "hermes-agentic-patch-apply-v1",
  generatedAt: new Date().toISOString(),
  status: approved ? "applied" : "held",
  approvalArtifact: approvalPath,
  sourceExecutionReport: "reports/agentic-workflow/hermes-agentic-execution-report.json",
  allowedTargets,
  approval,
  checks: {
    approvalGranted: approval.approved === true,
    reviewerCaptured: Boolean(approval.reviewer),
    reasonCaptured: Boolean(approval.reason),
    sourceReadyForApproval:
      executionReport.status === "ready-for-human-approval",
    sourceRequiresApproval:
      executionReport.checks?.approvalRequired === true,
    safeScopeConfirmed:
      executionReport.checks?.safeScopeDefined === true,
    constrainedTargetsOnly: allowedTargets.every((target) =>
      target.startsWith("reports/agentic-workflow/applied/")
    ),
    noAutoMerge: true,
    noPush: true,
    patchApplied: approved
  },
  notes: [
    "This is the first constrained patch apply step for Hermes agentic workflow.",
    "It applies only artifact-level outputs after approval.",
    "It does not merge or push changes.",
    "Future versions can apply constrained source patches after stronger diff validation."
  ]
};

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/applied/hermes-agentic-patch-apply-report.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Patch Apply Report",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## Approval",
  "",
  `- Approved: ${approval.approved}`,
  `- Reviewer: ${approval.reviewer}`,
  `- Reason: ${approval.reason}`,
  "",
  "## Checks",
  "",
  ...Object.entries(report.checks).map(([key, value]) => `- ${key}: ${value}`),
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/applied/hermes-agentic-patch-apply-report.md"),
  md
);

console.log(JSON.stringify(report, null, 2));

if (!approved) {
  process.exit(1);
}
