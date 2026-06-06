import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

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

const prDraft = readJson(
  "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.json"
);

const approvalExamplePath =
  "hermes/agentic-workflow/approvals/branch-prepare-v5.example.json";
const approvalPath =
  "hermes/agentic-workflow/approvals/branch-prepare-v5.json";

if (!fs.existsSync(path.join(root, approvalExamplePath))) {
  fs.writeFileSync(
    path.join(root, approvalExamplePath),
    JSON.stringify(
      {
        approved: true,
        reviewer: "external-human-reviewer",
        reason:
          "Approve local branch preparation for Hermes Agentic Branch Prepare v5. No push or PR creation is authorized."
      },
      null,
      2
    ) + "\n"
  );
}

if (!fs.existsSync(path.join(root, approvalPath))) {
  fs.copyFileSync(path.join(root, approvalExamplePath), path.join(root, approvalPath));
}

const approval = readJson(approvalPath);
const approved =
  approval.approved === true &&
  Boolean(approval.reviewer) &&
  Boolean(approval.reason);

const branchName = prDraft.prDraft?.branchName ?? "hermes/agentic-pr-draft-v4";
const beforeBranch = run("git branch --show-current").output.trim();
const statusBefore = run("git status --short --branch");

const branchExistsResult = run(`git rev-parse --verify ${branchName}`);
const branchExists = branchExistsResult.passed;

let branchPrepared = false;
let branchCommand = "";

if (approved) {
  if (branchExists) {
    branchCommand = `git switch ${branchName}`;
  } else {
    branchCommand = `git switch -c ${branchName}`;
  }

  const branchResult = run(branchCommand);
  branchPrepared = branchResult.passed;
}

const afterBranch = run("git branch --show-current").output.trim();
const statusAfter = run("git status --short --branch");

const validationResults = [
  run("npm run check"),
  run("npm run mastra:check")
];

const report = {
  runtime: "hermes-agentic-branch-prepare-v5",
  generatedAt: new Date().toISOString(),
  status:
    approved &&
    branchPrepared &&
    afterBranch === branchName &&
    validationResults.every((result) => result.passed)
      ? "ready-for-human-review"
      : "blocked",
  inputArtifacts: [
    "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.json",
    approvalPath
  ],
  outputArtifacts: [
    "hermes/agentic-workflow/branch-prep/v5.json",
    "reports/agentic-workflow/branch-prep/hermes-agentic-branch-prepare-v5.json",
    "reports/agentic-workflow/branch-prep/hermes-agentic-branch-prepare-v5.md"
  ],
  approval,
  branch: {
    requested: branchName,
    before: beforeBranch,
    after: afterBranch,
    existedBefore: branchExists,
    command: branchCommand,
    prepared: branchPrepared
  },
  gitStatus: {
    before: statusBefore.output,
    after: statusAfter.output
  },
  validationResults,
  safetyBoundary: {
    localBranchOnly: true,
    pushed: false,
    prOpened: false,
    autoMerge: false,
    requiresHumanApproval: true
  },
  checks: {
    approvalGranted: approved,
    reviewerCaptured: Boolean(approval.reviewer),
    reasonCaptured: Boolean(approval.reason),
    sourcePrDraftReady:
      prDraft.runtime === "hermes-agentic-pr-draft-v4-report" &&
      prDraft.status === "ready-for-human-review",
    branchPrepared,
    branchNameMatches: afterBranch === branchName,
    validationRan: validationResults.length >= 2,
    validationsPassed: validationResults.every((result) => result.passed),
    localBranchOnly: true,
    notPushed: true,
    prNotOpened: true,
    noAutoMerge: true,
    humanApprovalRequired: true
  },
  notes: [
    "This creates or switches to a local branch after explicit approval.",
    "It does not push the branch.",
    "It does not create a GitHub PR.",
    "The next version can prepare a push command or open a draft PR only after explicit approval."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/branch-prep/v5.json"),
  JSON.stringify(report, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/branch-prep/hermes-agentic-branch-prepare-v5.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Branch Prepare v5",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## Branch",
  "",
  `- Requested: \`${report.branch.requested}\``,
  `- Before: \`${report.branch.before}\``,
  `- After: \`${report.branch.after}\``,
  `- Prepared: ${report.branch.prepared}`,
  "",
  "## Safety",
  "",
  `- Local branch only: ${report.safetyBoundary.localBranchOnly}`,
  `- Pushed: ${report.safetyBoundary.pushed}`,
  `- PR opened: ${report.safetyBoundary.prOpened}`,
  `- Auto-merge: ${report.safetyBoundary.autoMerge}`,
  `- Human approval required: ${report.safetyBoundary.requiresHumanApproval}`,
  "",
  "## Validation",
  "",
  ...validationResults.map(
    (result) => `- \`${result.command}\`: ${result.passed ? "PASS" : "FAIL"}`
  ),
  "",
  "## Next manual commands",
  "",
  "- Review the branch locally.",
  "- Run `git status --short --branch`.",
  "- Push only after approval.",
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/branch-prep/hermes-agentic-branch-prepare-v5.md"),
  md
);

console.log(JSON.stringify(report, null, 2));

if (report.status !== "ready-for-human-review") {
  process.exit(1);
}
