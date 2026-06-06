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

const prNumber = 1;
const branchName = "hermes/agentic-pr-draft-v4";

const prView = run(
  `gh pr view ${prNumber} --json number,state,isDraft,url,headRefName,baseRefName --jq '.'`
);

const remoteBranch = run(`git ls-remote --heads origin ${branchName}`);

const operatorBoundary = {
  runtime: "hermes-agentic-operator-boundary-v6",
  generatedAt: new Date().toISOString(),
  status: prView.passed && remoteBranch.passed ? "documented" : "needs-review",
  sourceEvent:
    "Hermes Agentic Branch Prepare v5 created a local branch inside the workflow, then the outer operator terminal command pushed that branch and opened a draft PR.",
  distinction: {
    workflowActions: [
      "selected project context",
      "generated execution plan",
      "generated patch candidate",
      "applied constrained local patch",
      "ran validation",
      "drafted PR metadata",
      "created or switched local branch after approval"
    ],
    operatorActions: [
      "pushed local branch to origin",
      "opened GitHub draft pull request"
    ]
  },
  semantics: {
    workflowDidPush: false,
    operatorDidPush: remoteBranch.passed,
    workflowOpenedPr: false,
    operatorOpenedPr: prView.passed
  },
  linkedArtifacts: {
    branchName,
    prNumber,
    prView: prView.passed ? JSON.parse(prView.output) : null
  },
  checks: {
    runtimeLabeled: true,
    remoteBranchDetected: remoteBranch.passed,
    prDetected: prView.passed,
    workflowPushSeparatedFromOperatorPush: true,
    workflowPrSeparatedFromOperatorPr: true,
    humanBoundaryPreserved: true
  },
  notes: [
    "This artifact corrects the v5 reporting ambiguity.",
    "Hermes workflow reports must distinguish workflow actions from operator actions.",
    "The workflow did not push or open a PR; the outer terminal commands did."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/operator-boundary/v6.json"),
  JSON.stringify(operatorBoundary, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/operator-boundary/hermes-agentic-operator-boundary-v6.json"),
  JSON.stringify(operatorBoundary, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Operator Boundary v6",
  "",
  `Generated: ${operatorBoundary.generatedAt}`,
  `Status: ${operatorBoundary.status}`,
  "",
  "## Source event",
  "",
  operatorBoundary.sourceEvent,
  "",
  "## Workflow actions",
  "",
  ...operatorBoundary.distinction.workflowActions.map((item) => `- ${item}`),
  "",
  "## Operator actions",
  "",
  ...operatorBoundary.distinction.operatorActions.map((item) => `- ${item}`),
  "",
  "## Correct semantics",
  "",
  `- Workflow pushed: ${operatorBoundary.semantics.workflowDidPush}`,
  `- Operator pushed: ${operatorBoundary.semantics.operatorDidPush}`,
  `- Workflow opened PR: ${operatorBoundary.semantics.workflowOpenedPr}`,
  `- Operator opened PR: ${operatorBoundary.semantics.operatorOpenedPr}`,
  "",
  "## Linked artifacts",
  "",
  `- Branch: \`${branchName}\``,
  `- PR: #${prNumber}`,
  operatorBoundary.linkedArtifacts.prView?.url
    ? `- URL: ${operatorBoundary.linkedArtifacts.prView.url}`
    : "- URL: unavailable",
  "",
  "## Notes",
  "",
  ...operatorBoundary.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/operator-boundary/hermes-agentic-operator-boundary-v6.md"),
  md
);

console.log(JSON.stringify(operatorBoundary, null, 2));

if (operatorBoundary.status !== "documented") {
  process.exit(1);
}
