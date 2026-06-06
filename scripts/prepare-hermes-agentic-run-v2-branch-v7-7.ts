import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const approvalPath = path.join(root, "hermes/agentic-workflow/approvals/run-v2-branch-prepare-v7.7.json");
const prDraftPath = path.join(root, "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-draft-v7.6.json");

const outJson = path.join(root, "hermes/agentic-workflow/run-v2/branch-prep/v7.7.json");
const reportJson = path.join(root, "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-branch-prepare-v7.7.json");
const reportMd = path.join(root, "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-branch-prepare-v7.7.md");

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function run(command: string) {
  return execSync(command, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function existsBranch(branch: string) {
  try {
    run(`git rev-parse --verify ${branch}`);
    return true;
  } catch {
    return false;
  }
}

const approval = readJson(approvalPath);
const prDraft = readJson(prDraftPath);

if (approval.approved !== true) {
  throw new Error("Run v2 branch prepare v7.7 requires explicit approval.");
}

if (prDraft.status !== "drafted-for-human-review") {
  throw new Error("Run v2 PR draft v7.6 is not ready.");
}

const branchName = prDraft.prDraft?.branchName ?? "hermes/agentic-run-v2-pr-draft-v7-6";
const beforeBranch = run("git branch --show-current");
const beforeStatus = run("git status --short --branch");
const existedBefore = existsBranch(branchName);

if (existedBefore) {
  run(`git switch ${branchName}`);
} else {
  run(`git switch -c ${branchName}`);
}

const afterBranch = run("git branch --show-current");
const afterStatus = run("git status --short --branch");

const report = {
  runtime: "hermes-agentic-run-v2-branch-prepare-v7.7",
  generatedAt: new Date().toISOString(),
  status: "ready-for-human-review",
  inputArtifacts: [
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-draft-v7.6.json",
    "hermes/agentic-workflow/approvals/run-v2-branch-prepare-v7.7.json"
  ],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v2/branch-prep/v7.7.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-branch-prepare-v7.7.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-branch-prepare-v7.7.md"
  ],
  approval,
  branch: {
    requested: branchName,
    before: beforeBranch,
    after: afterBranch,
    existedBefore,
    prepared: afterBranch === branchName,
    command: existedBefore ? `git switch ${branchName}` : `git switch -c ${branchName}`
  },
  gitStatus: {
    before: beforeStatus,
    after: afterStatus
  },
  safetyBoundary: {
    localBranchOnly: true,
    pushed: false,
    prOpened: false,
    merged: false,
    externalSideEffects: false,
    humanOperatorRequiredForPushAndPr: true
  },
  checks: {
    runtimeLabeled: true,
    approvalGranted: approval.approved === true,
    reviewerCaptured: Boolean(approval.reviewer),
    reasonCaptured: Boolean(approval.reason),
    sourcePrDraftReady: prDraft.status === "drafted-for-human-review",
    branchPrepared: afterBranch === branchName,
    branchNameMatches: afterBranch === branchName,
    localBranchOnly: true,
    notPushed: true,
    prNotOpened: true,
    noMerge: true,
    humanOperatorRequiredForPushAndPr: true
  },
  notes: [
    "This prepares a local branch for Hermes agentic run v2 after explicit approval.",
    "It does not push the branch.",
    "It does not create a GitHub PR.",
    "The next safe step is operator-controlled push and draft PR creation."
  ]
};

fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.mkdirSync(path.dirname(reportJson), { recursive: true });

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(reportJson, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(
  reportMd,
  [
    "# Hermes Agentic Run v2 Branch Prepare v7.7",
    "",
    `- Status: ${report.status}`,
    `- Branch: ${branchName}`,
    `- Before: ${beforeBranch}`,
    `- After: ${afterBranch}`,
    `- Existing branch: ${String(existedBefore)}`,
    "",
    "## Safety",
    "",
    "- Local branch only.",
    "- No push.",
    "- No PR opened.",
    "- No merge.",
    "- Human operator required for GitHub lifecycle actions.",
    "",
    "## Checks",
    "",
    ...Object.entries(report.checks).map(([key, value]) => `- ${key}: ${value}`)
  ].join("\n") + "\n"
);

console.log(JSON.stringify(report, null, 2));
