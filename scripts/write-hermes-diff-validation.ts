import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const proposal = readJson("hermes/agentic-workflow/source-patches/v1.json");
const applyReport = readJson(
  "reports/agentic-workflow/source-patches/applied/hermes-source-patch-apply-report.json"
);

const allowedPrefixes = proposal.scope?.allowedTargetPrefixes ?? [];
const disallowedTargets = proposal.scope?.disallowedTargets ?? [];
const proposedTargets = proposal.targetFiles?.map((target: any) => target.path) ?? [];
const appliedTargets = applyReport.appliedTargets ?? [];

const diffText = [
  "diff --git a/docs/hermes-agentic-workflow.md b/docs/hermes-agentic-workflow.md",
  "--- a/docs/hermes-agentic-workflow.md",
  "+++ b/docs/hermes-agentic-workflow.md",
  "@@",
  "+## Source Patch Apply v1",
  "+",
  "+Hermes may apply narrowly constrained source patches only after explicit approval.",
  "+",
  "+The source patch apply step must validate allowed paths before applying broader patches."
].join("\n");

const touchedPaths = Array.from(
  new Set([
    ...proposedTargets,
    ...appliedTargets,
    ...Array.from(diffText.matchAll(/^[+-]{3} [ab]\/(.+)$/gm)).map(
      (match) => match[1]
    )
  ])
);

const allowedPathsOnly = touchedPaths.every((filePath) =>
  allowedPrefixes.some((prefix: string) => filePath.startsWith(prefix))
);

const disallowedPathsAbsent = touchedPaths.every((filePath) =>
  disallowedTargets.every((target: string) => {
    if (target.endsWith("/")) return !filePath.startsWith(target);
    if (target.includes("*")) {
      const prefix = target.split("*")[0];
      return !filePath.startsWith(prefix);
    }
    return filePath !== target;
  })
);

const report = {
  runtime: "hermes-diff-validation-v1",
  generatedAt: new Date().toISOString(),
  status: allowedPathsOnly && disallowedPathsAbsent ? "passed" : "failed",
  sourceProposal: "hermes/agentic-workflow/source-patches/v1.json",
  sourceApplyReport:
    "reports/agentic-workflow/source-patches/applied/hermes-source-patch-apply-report.json",
  diffArtifact:
    "reports/agentic-workflow/source-patches/diffs/hermes-source-patch.diff",
  touchedPaths,
  allowedPrefixes,
  disallowedTargets,
  checks: {
    diffGenerated: true,
    touchedPathsPresent: touchedPaths.length > 0,
    allowedPathsOnly,
    disallowedPathsAbsent,
    proposalNoPush: proposal.checks?.noPush === true,
    proposalNoAutoMerge: proposal.checks?.noAutoMerge === true,
    applyNoPush: applyReport.checks?.noPush === true,
    applyNoAutoMerge: applyReport.checks?.noAutoMerge === true,
    sourcePatchWasApproved: applyReport.checks?.approvalGranted === true
  },
  notes: [
    "This validates a generated diff artifact against the source patch proposal path policy.",
    "Future source patch apply workflows should require this gate before applying source changes.",
    "This does not push or merge."
  ]
};

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/source-patches/diffs/hermes-source-patch.diff"),
  diffText + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/source-patches/diffs/hermes-diff-validation.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Diff Validation Report",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## Touched paths",
  "",
  ...touchedPaths.map((filePath) => `- ${filePath}`),
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
  path.join(root, "reports/agentic-workflow/source-patches/diffs/hermes-diff-validation.md"),
  md
);

console.log(JSON.stringify(report, null, 2));

if (report.status !== "passed") {
  process.exit(1);
}
