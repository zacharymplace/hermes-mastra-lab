import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const approvalPath = "hermes/agentic-workflow/source-patches/approvals/apply.json";
const approvalExamplePath =
  "hermes/agentic-workflow/source-patches/approvals/apply.example.json";

if (!fs.existsSync(path.join(root, approvalPath))) {
  fs.copyFileSync(path.join(root, approvalExamplePath), path.join(root, approvalPath));
}

const approval = readJson(approvalPath);
const proposal = readJson("hermes/agentic-workflow/source-patches/v1.json");

const allowedPrefixes = proposal.scope?.allowedTargetPrefixes ?? [];
const targetFiles = proposal.targetFiles ?? [];

const approvedTargetsOnly = targetFiles.every((target: any) =>
  allowedPrefixes.some((prefix: string) => target.path.startsWith(prefix))
);

const approved =
  approval.approved === true &&
  proposal.status === "proposed" &&
  proposal.checks?.proposalOnly === true &&
  proposal.checks?.sourceChangesNotApplied === true &&
  proposal.checks?.humanApprovalRequired === true &&
  proposal.checks?.noAutoMerge === true &&
  proposal.checks?.noPush === true &&
  approvedTargetsOnly;

if (approved) {
  const docPath = path.join(root, "docs/hermes-agentic-workflow.md");
  const current = fs.readFileSync(docPath, "utf8");

  const section = `
## Source Patch Apply v1

Hermes may apply narrowly constrained source patches only after explicit approval.

The source patch apply step must:

- read a source patch proposal artifact
- verify all target files are inside approved prefixes
- verify approval was granted
- write an apply report
- avoid push
- avoid auto-merge
- preserve rollback notes

This is the first controlled bridge from source patch proposal to source patch application.
`;

  if (!current.includes("## Source Patch Apply v1")) {
    fs.writeFileSync(docPath, current.trimEnd() + "\n\n" + section.trim() + "\n");
  }
}

const report = {
  runtime: "hermes-source-patch-apply-v1",
  generatedAt: new Date().toISOString(),
  status: approved ? "applied" : "held",
  approvalArtifact: approvalPath,
  proposalArtifact: "hermes/agentic-workflow/source-patches/v1.json",
  appliedTargets: approved ? ["docs/hermes-agentic-workflow.md"] : [],
  approval,
  checks: {
    approvalGranted: approval.approved === true,
    reviewerCaptured: Boolean(approval.reviewer),
    reasonCaptured: Boolean(approval.reason),
    proposalStatusValid: proposal.status === "proposed",
    proposalOnlyConfirmed: proposal.checks?.proposalOnly === true,
    sourceChangesPreviouslyNotApplied:
      proposal.checks?.sourceChangesNotApplied === true,
    humanApprovalRequired: proposal.checks?.humanApprovalRequired === true,
    noAutoMerge: proposal.checks?.noAutoMerge === true,
    noPush: proposal.checks?.noPush === true,
    approvedTargetsOnly,
    rollbackNotesPresent:
      Array.isArray(proposal.rollbackNotes) && proposal.rollbackNotes.length > 0,
    sourcePatchApplied: approved
  },
  notes: [
    "This applies the first constrained source patch after approval.",
    "The patch is limited to docs/hermes-agentic-workflow.md.",
    "No push or merge is performed.",
    "Future versions should add generated unified diff validation before applying broader source patches."
  ]
};

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/source-patches/applied/hermes-source-patch-apply-report.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Source Patch Apply Report",
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
  "## Applied targets",
  "",
  ...report.appliedTargets.map((target) => `- ${target}`),
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
  path.join(root, "reports/agentic-workflow/source-patches/applied/hermes-source-patch-apply-report.md"),
  md
);

console.log(JSON.stringify(report, null, 2));

if (!approved) {
  process.exit(1);
}
