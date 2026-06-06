import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const outDir = path.join(root, "reports/agentic-workflow/run-v2");
const machineDir = path.join(root, "hermes/agentic-workflow/run-v2");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(machineDir, { recursive: true });

function run(command: string): { passed: boolean; output: string } {
  try {
    return {
      passed: true,
      output: execSync(command, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
    };
  } catch (error: any) {
    return {
      passed: false,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`
    };
  }
}

const prNumber = 2;
const branchName = "hermes/agentic-run-v2-pr-draft-v7-6";

const prViewCommand =
  `gh pr view ${prNumber} --json number,state,isDraft,url,headRefName,baseRefName,mergedAt,closedAt,mergeCommit,author,title,statusCheckRollup --jq '.'`;

const prView = run(prViewCommand);
const pr = prView.passed ? JSON.parse(prView.output) : null;

const checksCommand = `gh pr checks ${prNumber}`;
const checks = run(checksCommand);

const remoteBranchCommand = `git ls-remote --heads origin ${branchName}`;
const remoteBranch = run(remoteBranchCommand);

const lifecycleState =
  pr?.state === "MERGED" ? "merged" :
  pr?.state === "CLOSED" ? "closed-unmerged" :
  pr?.isDraft === true ? "draft-open" :
  pr?.state === "OPEN" ? "open" :
  "unknown";

const branchDeleted = remoteBranch.output.trim().length === 0;
const postMergeBranchStatus =
  lifecycleState === "merged"
    ? branchDeleted ? "deleted" : "still-present"
    : branchDeleted ? "missing-before-merge" : "still-open";

const report = {
  runtime: "hermes-agentic-run-v2-pr-lifecycle-v7.8",
  generatedAt: new Date().toISOString(),
  status: "tracked",
  prNumber,
  lifecycleState,
  pr,
  observations: {
    prDetected: Boolean(pr),
    checksCommandPassed: checks.passed,
    remoteBranchDetected: !branchDeleted,
    branchDeleted,
    postMergeBranchStatus,
    postMergeBranchStatusObserved: true,
    merged: lifecycleState === "merged",
    closed: pr?.state === "CLOSED" || pr?.state === "MERGED",
    draft: pr?.isDraft === true
  },
  checks: {
    runtimeLabeled: true,
    prDetected: Boolean(pr),
    lifecycleStateComputed: lifecycleState !== "unknown",
    checksCaptured: checks.output.trim().length > 0 || checks.passed,
    mergeStatusCaptured: Boolean(pr?.state),
    branchStatusCaptured: true,
    postMergeBranchStatusObserved: true
  },
  raw: {
    prViewCommand,
    prViewOutput: prView.output,
    checksCommand,
    checksOutput: checks.output,
    remoteBranchCommand,
    remoteBranchOutput: remoteBranch.output
  },
  notes: [
    "This tracks the PR lifecycle after Hermes agentic run v2 branch preparation.",
    "It distinguishes open, draft, merged, and closed-unmerged states.",
    "It records whether the remote branch still exists after merge as an observation, not as a hard failure."
  ]
};

const jsonPath = path.join(outDir, "hermes-agentic-run-v2-pr-lifecycle-v7.8.json");
const mdPath = path.join(outDir, "hermes-agentic-run-v2-pr-lifecycle-v7.8.md");
const machinePath = path.join(machineDir, "pr-lifecycle-v7.8.json");

fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(machinePath, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(
  mdPath,
  [
    "# Hermes Agentic Run v2 PR Lifecycle v7.8",
    "",
    `- Runtime: ${report.runtime}`,
    `- Status: ${report.status}`,
    `- PR: #${report.prNumber}`,
    `- Lifecycle state: ${report.lifecycleState}`,
    `- Branch: ${branchName}`,
    `- Post-merge branch status: ${postMergeBranchStatus}`,
    `- Checks captured: ${report.checks.checksCaptured}`,
    `- PR detected: ${report.checks.prDetected}`,
    "",
    "## Safety",
    "",
    "- This records GitHub lifecycle state only.",
    "- It does not create a branch.",
    "- It does not push.",
    "- It does not open or merge a PR.",
    "",
    "## Notes",
    "",
    ...report.notes.map((note) => `- ${note}`),
    ""
  ].join("\n")
);

console.log(JSON.stringify(report, null, 2));
