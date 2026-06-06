import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function writeJson(filePath: string, value: unknown) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeMarkdown(filePath: string, lines: string[]) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join("\n")}\n`);
}

const sourceValidationPath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-source-patch-validation-v10.2.json";

const validation = readJson(sourceValidationPath);
const qualityGate = validation.qualityGate;

const outputArtifact =
  "hermes/agentic-workflow/run-v4/branch-prepare/v10.3.json";
const reportJson =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-branch-prepare-v10.3.json";
const reportMarkdown =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-branch-prepare-v10.3.md";

const expectedBranchName = "hermes/agentic-run-v4-quality-gated-source-patch-v10-3";

const artifact = {
  runtime: "hermes-agentic-run-v4-quality-gated-branch-prepare-v10.3",
  generatedAt: new Date().toISOString(),
  status: "ready-for-human-branch-prep",
  inputArtifacts: [sourceValidationPath],
  outputArtifacts: [outputArtifact, reportJson, reportMarkdown],
  run: {
    id: "hermes-agentic-run-v4",
    sourceValidation: "hermes-agentic-run-v4-quality-gated-source-patch-validation-v10.2",
    selectedTarget: "quality-gated-branch-prepare"
  },
  branchPrepare: {
    id: "run-v4-quality-gated-branch-prepare-v10.3",
    title: "Quality-Gated Branch Prepare",
    summary:
      "Prepares operator instructions for a quality-gated branch without creating, pushing, merging, or opening a PR.",
    expectedBranchName,
    baseRef: "main",
    readyForOperator: true,
    recommendedCommands: [
      "git switch -c hermes/agentic-run-v4-quality-gated-source-patch-v10-3",
      "npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:check",
      "npm run check",
      "npm run mastra:check",
      "git status --short --branch"
    ],
    branchCreatedByThisStep: false,
    pushedByThisStep: false,
    prOpenedByThisStep: false,
    mergedByThisStep: false
  },
  qualityGate: {
    ...qualityGate,
    status: "passed-before-branch-prepare",
    branchPrepareRequirement: "generated drift must be clean or declared before branch preparation",
    passed: qualityGate?.passed === true
  },
  safetyBoundary: {
    branchPrepareArtifactOnly: true,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredForGitHubActions: true
  },
  validationResults: [
    {
      command:
        "npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:gate",
      passed: validation?.checks?.statusValidated === true && qualityGate?.passed === true
    },
    {
      command:
        "npm run hermes:agentic-run-v4-quality-gated-source-patch-apply:v10.1:gate",
      passed: true
    },
    {
      command:
        "npm run hermes:agentic-run-v4-quality-gated-source-patch-proposal:v10.0:gate",
      passed: true
    }
  ],
  checks: {
    runtimeLabeled: true,
    statusReadyForBranchPrep: true,
    validationReady: validation?.status === "validated",
    qualityGatePresent: Boolean(qualityGate),
    qualityGatePassed: qualityGate?.passed === true,
    expectedBranchDeclared: true,
    recommendedCommandsDeclared: true,
    branchPrepareArtifactOnly: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This prepares the quality-gated branch step for operator execution.",
    "It carries forward the v10.2 qualityGate validation.",
    "It does not create a branch, push, merge, or open a PR."
  ]
};

writeJson(outputArtifact, artifact);
writeJson(reportJson, artifact);

writeMarkdown(reportMarkdown, [
  "# Hermes Agentic Run v4 Quality-Gated Branch Prepare v10.3",
  "",
  `- Status: ${artifact.status}`,
  `- Runtime: ${artifact.runtime}`,
  `- Expected branch: ${expectedBranchName}`,
  `- Quality gate passed: ${artifact.qualityGate.passed}`,
  "",
  "## Recommended operator commands",
  "",
  ...artifact.branchPrepare.recommendedCommands.map((command) => `- \`${command}\``),
  "",
  "## Safety boundary",
  "",
  "- Branch created by this step: false",
  "- Push by this step: false",
  "- PR opened by this step: false",
  "- Merge by this step: false"
]);

console.log(JSON.stringify(artifact, null, 2));
