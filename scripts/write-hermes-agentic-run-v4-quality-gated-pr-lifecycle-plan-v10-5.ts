import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
}

function run(command: string) {
  return execSync(command, { cwd: root, encoding: "utf8" }).trim();
}

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + "\n");
}

function writeMd(file: string, data: any) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });

  const md = [
    "# Hermes Agentic Run v4 Quality-Gated PR Lifecycle Plan v10.5",
    "",
    `- Runtime: ${data.runtime}`,
    `- Status: ${data.status}`,
    `- Generated: ${data.generatedAt}`,
    `- Run: ${data.run.id}`,
    `- Source PR draft: ${data.run.sourcePrDraft}`,
    "",
    "## Lifecycle Plan",
    "",
    `- Branch: \`${data.prLifecyclePlan.branchName}\``,
    `- Base: \`${data.prLifecyclePlan.baseRef}\``,
    `- Mode: ${data.prLifecyclePlan.mode}`,
    "",
    "## Operator Commands",
    "",
    ...data.prLifecyclePlan.operatorCommands.map((cmd: string) => `- \`${cmd}\``),
    "",
    "## Required Gates",
    "",
    ...data.prLifecyclePlan.requiredGates.map((gate: string) => `- \`${gate}\``),
    "",
    "## Fail-Closed Conditions",
    "",
    ...data.prLifecyclePlan.failClosedConditions.map((item: string) => `- ${item}`),
    "",
    "## Safety Boundary",
    "",
    `- Plan only: ${data.safetyBoundary.planOnly}`,
    `- Branch created: ${data.safetyBoundary.branchCreated}`,
    `- Pushed: ${data.safetyBoundary.pushed}`,
    `- PR opened: ${data.safetyBoundary.prOpened}`,
    `- Merged: ${data.safetyBoundary.merged}`,
    "",
    "## Checks",
    "",
    ...Object.entries(data.checks).map(([key, value]) => `- ${key}: ${value}`),
    ""
  ].join("\n");

  fs.writeFileSync(path.join(root, file), md);
}

const prDraftPath =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-draft-v10.4.json";

const prDraft = readJson(prDraftPath);

const outMachine = "hermes/agentic-workflow/run-v4/pr-lifecycle-plan/v10.5.json";
const outJson =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10.5.json";
const outMd =
  "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10.5.md";

const branchName = prDraft.prDraft.branchName;
const baseRef = prDraft.prDraft.baseRef;

const validationResults = [
  {
    command: "npm run hermes:agentic-run-v4-quality-gated-pr-draft:v10.4:gate",
    passed: true
  },
  {
    command: "npm run hermes:agentic-run-v4-quality-gated-branch-prepare:v10.3:gate",
    passed: true
  },
  {
    command: "npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:gate",
    passed: true
  }
];

for (const result of validationResults) {
  run(result.command);
}

const gitStatus = run("git status --short --branch");

const data = {
  runtime: "hermes-agentic-run-v4-quality-gated-pr-lifecycle-plan-v10.5",
  generatedAt: new Date().toISOString(),
  status: "planned",
  inputArtifacts: [prDraftPath],
  outputArtifacts: [outMachine, outJson, outMd],
  run: {
    id: "hermes-agentic-run-v4",
    sourcePrDraft: "hermes-agentic-run-v4-quality-gated-pr-draft-v10.4",
    selectedTarget: "quality-gated-pr-lifecycle-plan"
  },
  prLifecyclePlan: {
    id: "run-v4-quality-gated-pr-lifecycle-plan-v10.5",
    title: "Quality-Gated PR Lifecycle Plan",
    summary:
      "Plans the operator-controlled branch, push, and PR lifecycle for the first quality-gated Hermes source patch chain without performing GitHub actions.",
    mode: "operator-controlled-plan",
    branchName,
    baseRef,
    prTitle: prDraft.prDraft.title,
    operatorCommands: [
      `git switch -c ${branchName}`,
      "npm run hermes:agentic-run-v4-quality-gated-pr-draft:v10.4:check",
      "npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:check",
      "npm run check",
      "npm run mastra:check",
      "git status --short --branch",
      `git push -u origin ${branchName}`,
      `gh pr create --base ${baseRef} --head ${branchName} --title "Add Hermes agentic run v4 quality-gated source patch" --body-file reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-draft-v10.4.md`
    ],
    requiredGates: [
      "npm run hermes:agentic-run-v4-quality-gated-pr-draft:v10.4:gate",
      "npm run hermes:agentic-run-v4-quality-gated-branch-prepare:v10.3:gate",
      "npm run hermes:agentic-run-v4-quality-gated-source-patch-validation:v10.2:gate",
      "npm run check",
      "npm run mastra:check"
    ],
    failClosedConditions: [
      "Do not create a branch if qualityGate is missing, failed, null, or incomplete.",
      "Do not push if generated artifact drift is undeclared.",
      "Do not open a PR if required apply fields are missing.",
      "Do not open a PR if changed paths are outside declared targets.",
      "Do not merge from this lifecycle plan.",
      "Keep branch creation, push, PR creation, and merge operator-controlled."
    ],
    lifecycleActionsPerformedByThisStep: {
      branchCreated: false,
      pushed: false,
      prOpened: false,
      merged: false
    },
    proposedNextArtifact:
      "reports/agentic-workflow/run-v4/hermes-agentic-run-v4-quality-gated-pr-lifecycle-v10.6.json"
  },
  qualityGate: {
    ...prDraft.qualityGate,
    status: "passed-before-pr-lifecycle-plan",
    prLifecycleRequirement:
      "PR lifecycle plan must carry qualityGate status before operator-controlled branch, push, and PR creation."
  },
  safetyBoundary: {
    planOnly: true,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredForGitHubActions: true
  },
  validationResults,
  gitStatus,
  checks: {
    runtimeLabeled: true,
    statusPlanned: true,
    prDraftReady: prDraft.status === "drafted-for-human-review",
    qualityGatePresent: Boolean(prDraft.qualityGate),
    qualityGatePassed: prDraft.qualityGate?.passed === true,
    operatorCommandsDeclared: true,
    requiredGatesDeclared: true,
    failClosedConditionsDeclared: true,
    planOnly: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This plans the quality-gated PR lifecycle for operator execution.",
    "It does not create a branch, push, merge, or open a PR.",
    "The next safe step is v10.6 quality-gated PR lifecycle tracking."
  ]
};

writeJson(outMachine, data);
writeJson(outJson, data);
writeMd(outMd, data);

console.log(JSON.stringify(data, null, 2));
