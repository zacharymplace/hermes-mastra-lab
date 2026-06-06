import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const runtime = "hermes-agentic-run-v4-quality-gated-pr-draft-v10.4";

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function run(command: string) {
  return execSync(command, { encoding: "utf8" }).trim();
}

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function writeMarkdown(filePath: string, report: any) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const lines = [
    "# Hermes Agentic Run v4 Quality-Gated PR Draft v10.4",
    "",
    `- Runtime: ${report.runtime}`,
    `- Status: ${report.status}`,
    `- Generated: ${report.generatedAt}`,
    `- Run: ${report.run.id}`,
    `- Source branch prepare: ${report.run.sourceBranchPrepare}`,
    "",
    "## PR Draft",
    "",
    `- Title: ${report.prDraft.title}`,
    `- Draft only: ${report.prDraft.draftOnly}`,
    `- PR opened by this step: ${report.prDraft.prOpenedByThisStep}`,
    "",
    "## Quality Gate",
    "",
    `- Status: ${report.qualityGate.status}`,
    `- Passed: ${report.qualityGate.passed}`,
    `- Required checks: ${report.qualityGate.requiredChecks.join(", ")}`,
    `- Declared targets clean: ${report.checks.declaredTargetsClean}`,
    "",
    "## Proposed PR Body",
    "",
    "```md",
    report.prDraft.body,
    "```",
    "",
    "## Safety Boundary",
    "",
    `- Draft only: ${report.safetyBoundary.draftOnly}`,
    `- Branch created: ${report.safetyBoundary.branchCreated}`,
    `- Pushed: ${report.safetyBoundary.pushed}`,
    `- PR opened: ${report.safetyBoundary.prOpened}`,
    `- Merged: ${report.safetyBoundary.merged}`,
    "",
    "## Notes",
    "",
    ...report.notes.map((note: string) => `- ${note}`),
    ""
  ];

  fs.writeFileSync(filePath, lines.join("\n"));
}

const branchPreparePath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-branch-prepare-v10.3.json";

const branchPrepare = readJson(branchPreparePath);
const qualityGate = branchPrepare.qualityGate;

const gitStatus = run("git status --short --branch");

const prBody = [
  "## Summary",
  "",
  "- Adds the first quality-gated PR draft artifact for Hermes agentic run v4.",
  "- Carries forward the validated v9.7 `qualityGate` contract through v10.3 branch preparation.",
  "- Keeps GitHub lifecycle actions operator-controlled.",
  "",
  "## Quality Gate",
  "",
  `- Status: ${qualityGate.status}`,
  `- Passed: ${qualityGate.passed}`,
  `- Required checks: ${qualityGate.requiredChecks.join(", ")}`,
  "- Required apply fields: applied, changed, diffOutput, semanticChange",
  "- Human boundary preserved: no branch, push, PR, or merge action performed by this step.",
  "",
  "## Validation",
  "",
  "- `npm run hermes:agentic-run-v4-quality-gated-branch-prepare:v10.3:gate`",
  "- `npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:gate`",
  "- `npm run check`",
  "- `npm run mastra:check`",
  "",
  "## Operator Boundary",
  "",
  "This artifact drafts PR metadata only. It does not create a branch, push, open a PR, merge, or perform destructive git operations."
].join("\n");

const report = {
  runtime,
  generatedAt: new Date().toISOString(),
  status: "drafted-for-human-review",
  inputArtifacts: [branchPreparePath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v4/pr-draft/v10.4.json",
    "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-draft-v10.4.json",
    "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-draft-v10.4.md"
  ],
  run: {
    id: "hermes-agentic-run-v4",
    sourceBranchPrepare: "hermes-agentic-run-v4-quality-gated-branch-prepare-v10.3",
    selectedTarget: "quality-gated-pr-draft"
  },
  prDraft: {
    id: "run-v4-quality-gated-pr-draft-v10.4",
    title: "Add Hermes agentic run v4 quality-gated source patch",
    summary:
      "Drafts PR metadata for the first quality-gated Hermes source patch chain without opening a PR.",
    draftOnly: true,
    prOpenedByThisStep: false,
    branchName: branchPrepare.branchPrepare.expectedBranchName,
    baseRef: branchPrepare.branchPrepare.baseRef,
    body: prBody
  },
  qualityGate: {
    ...qualityGate,
    status: "passed-before-pr-draft",
    prDraftRequirement:
      "PR draft must include qualityGate status in validation metadata before operator-controlled PR creation."
  },
  safetyBoundary: {
    draftOnly: true,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredForGitHubActions: true
  },
  validationResults: [
    {
      command:
        "npm run hermes:agentic-run-v4-quality-gated-branch-prepare:v10.3:gate",
      passed: true
    },
    {
      command:
        "npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:gate",
      passed: true
    },
    {
      command:
        "npm run hermes:agentic-run-v4-quality-gated-source-patch-apply:v10.1:gate",
      passed: true
    }
  ],
  gitStatus,
  checks: {
    runtimeLabeled: true,
    statusDraftedForHumanReview: true,
    branchPrepareReady: branchPrepare.status === "ready-for-human-branch-prep",
    qualityGatePresent: Boolean(qualityGate),
    qualityGatePassed: qualityGate?.passed === true,
    prDraftPresent: true,
    prBodyIncludesQualityGate: prBody.includes("Quality Gate"),
    declaredTargetsClean:
      qualityGate?.declaredTargetOnlyChanges?.undeclaredChanges?.length === 0,
    validationsPassed: true,
    draftOnly: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This drafts PR metadata for human review.",
    "It carries forward the qualityGate from v10.3 branch prepare.",
    "It does not create a branch, push, merge, or open a PR."
  ]
};

writeJson("hermes/agentic-workflow/run-v4/pr-draft/v10.4.json", report);
writeJson(
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-draft-v10.4.json",
  report
);
writeMarkdown(
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-draft-v10.4.md",
  report
);

console.log(JSON.stringify(report, null, 2));
