import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function run(command: string) {
  try {
    const output = execSync(command, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    return { command, passed: true, output };
  } catch (error: any) {
    return {
      command,
      passed: false,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`
    };
  }
}

function readJsonOutput(command: string) {
  const result = run(command);
  if (!result.passed) return { result, json: null };

  try {
    return { result, json: JSON.parse(result.output) };
  } catch {
    return { result, json: null };
  }
}

const prNumber = process.env.HERMES_PR_NUMBER ?? "1";

const pr = readJsonOutput(
  `gh pr view ${prNumber} --json number,state,isDraft,url,headRefName,baseRefName,mergedAt,closedAt,mergeCommit,author,title,statusCheckRollup --jq '.'`
);

const checks = run(`gh pr checks ${prNumber}`);
const remoteBranch = pr.json?.headRefName
  ? run(`git ls-remote --heads origin ${pr.json.headRefName}`)
  : { command: "git ls-remote", passed: false, output: "" };

const lifecycleState =
  pr.json?.mergedAt
    ? "merged"
    : pr.json?.state === "CLOSED"
      ? "closed-unmerged"
      : pr.json?.state === "OPEN"
        ? pr.json?.isDraft
          ? "open-draft"
          : "open-ready"
        : "unknown";

const branchDeleted =
  lifecycleState === "merged" ? !remoteBranch.passed : false;

const postMergeBranchStatus =
  lifecycleState === "merged"
    ? branchDeleted
      ? "deleted"
      : "still-present"
    : "not-applicable";

const report = {
  runtime: "hermes-agentic-pr-lifecycle-v6.5",
  generatedAt: new Date().toISOString(),
  status: pr.result.passed ? "tracked" : "blocked",
  prNumber: Number(prNumber),
  lifecycleState,
  pr: pr.json,
  observations: {
    prDetected: pr.result.passed,
    checksCommandPassed: checks.passed,
    remoteBranchDetected: remoteBranch.passed,
    branchDeleted,
    postMergeBranchStatus,
    postMergeBranchStatusObserved: Boolean(pr.json?.headRefName),
    merged: Boolean(pr.json?.mergedAt),
    closed: Boolean(pr.json?.closedAt),
    draft: Boolean(pr.json?.isDraft)
  },
  checks: {
    runtimeLabeled: true,
    prDetected: pr.result.passed,
    lifecycleStateComputed: lifecycleState !== "unknown",
    checksCaptured: checks.output.length > 0 || checks.passed,
    mergeStatusCaptured:
      "mergedAt" in (pr.json ?? {}) &&
      "closedAt" in (pr.json ?? {}),
    branchStatusCaptured: Boolean(pr.json?.headRefName),
    postMergeBranchStatusObserved: Boolean(pr.json?.headRefName),
    postMergeBranchDeletedOrStillOpen:
      lifecycleState === "merged" ? branchDeleted === true : true
  },
  raw: {
    prViewCommand: pr.result.command,
    prViewOutput: pr.result.output,
    checksCommand: checks.command,
    checksOutput: checks.output,
    remoteBranchCommand: remoteBranch.command,
    remoteBranchOutput: remoteBranch.output
  },
  notes: [
    "This tracks the PR lifecycle after Hermes prepares branch/PR artifacts.",
    "It distinguishes open, draft, merged, and closed-unmerged states.",
    "It records whether the remote branch still exists after merge as an observation, not as a hard failure."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/pr-lifecycle/v6.5.json"),
  JSON.stringify(report, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic PR Lifecycle v6.5",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  `PR: #${report.prNumber}`,
  `Lifecycle state: ${report.lifecycleState}`,
  "",
  "## PR",
  "",
  `- Title: ${report.pr?.title ?? "unknown"}`,
  `- URL: ${report.pr?.url ?? "unknown"}`,
  `- Base: ${report.pr?.baseRefName ?? "unknown"}`,
  `- Head: ${report.pr?.headRefName ?? "unknown"}`,
  `- State: ${report.pr?.state ?? "unknown"}`,
  `- Draft: ${report.pr?.isDraft ?? "unknown"}`,
  `- Merged at: ${report.pr?.mergedAt ?? "not merged"}`,
  `- Closed at: ${report.pr?.closedAt ?? "not closed"}`,
  "",
  "## Observations",
  "",
  `- PR detected: ${report.observations.prDetected}`,
  `- Checks command passed: ${report.observations.checksCommandPassed}`,
  `- Remote branch detected: ${report.observations.remoteBranchDetected}`,
  `- Branch deleted: ${report.observations.branchDeleted}`,
  `- Post-merge branch status: ${report.observations.postMergeBranchStatus}`,
  `- Merged: ${report.observations.merged}`,
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.md"),
  md
);

console.log(JSON.stringify(report, null, 2));

if (report.status !== "tracked") {
  process.exit(1);
}
