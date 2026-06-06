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

    return {
      command,
      passed: true,
      output
    };
  } catch (error: any) {
    return {
      command,
      passed: false,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`
    };
  }
}

const patchApply = readJson(
  "reports/agentic-workflow/hermes-agentic-patch-apply-v3.json"
);

const selectedProject =
  patchApply.selectedProject ?? patchApply.patchCandidate?.selectedProject;

const branchName = "hermes/agentic-pr-draft-v4";
const title = "Add Hermes agentic PR draft v4";

const body = [
  "# Summary",
  "",
  "Adds the next safe step in the Hermes agentic execution chain: a PR draft artifact.",
  "",
  "This does not push a branch and does not open a GitHub PR.",
  "",
  "## Chain",
  "",
  "- Sentra selected Hermes Agentic Workflow.",
  "- Hermes generated an execution plan.",
  "- Hermes generated a patch candidate.",
  "- Hermes applied one constrained approved patch.",
  "- Hermes ran validation.",
  "- Hermes now drafts PR metadata for human review.",
  "",
  "## Safety",
  "",
  "- No auto-push.",
  "- No auto-merge.",
  "- No automatic PR creation.",
  "- Human approval remains required.",
  "",
  "## Validation",
  "",
  "- `npm run check`",
  "- `npm run mastra:check`",
  "",
  "## Selected project",
  "",
  `- ${selectedProject?.name ?? "unknown"}`,
  `- Score: ${selectedProject?.score ?? "unknown"}`,
  ""
].join("\n");

const prDraft = {
  runtime: "hermes-agentic-pr-draft-v4",
  generatedAt: new Date().toISOString(),
  status: "drafted-for-human-review",
  sourceArtifact: "reports/agentic-workflow/hermes-agentic-patch-apply-v3.json",
  branchName,
  title,
  body,
  selectedProject,
  commandsForHuman: [
    `git switch -c ${branchName}`,
    "git status --short",
    "npm run hermes:agentic-pr-draft:v4:check",
    `gh pr create --draft --title "${title}" --body-file reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4.md`
  ],
  safetyBoundary: {
    branchCreated: false,
    pushed: false,
    prOpened: false,
    autoMerge: false,
    requiresHumanApproval: true
  }
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/pr-drafts/v4.json"),
  JSON.stringify(prDraft, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4.json"),
  JSON.stringify(prDraft, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4.md"),
  body
);

const validationResults = [
  run("npm run check"),
  run("npm run mastra:check")
];

const report = {
  runtime: "hermes-agentic-pr-draft-v4-report",
  generatedAt: new Date().toISOString(),
  status: validationResults.every((result) => result.passed)
    ? "ready-for-human-review"
    : "blocked",
  inputArtifacts: [
    "reports/agentic-workflow/hermes-agentic-patch-apply-v3.json"
  ],
  outputArtifacts: [
    "hermes/agentic-workflow/pr-drafts/v4.json",
    "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4.json",
    "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4.md",
    "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.json",
    "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.md"
  ],
  prDraft,
  validationResults,
  checks: {
    sourcePatchApplyReady:
      patchApply.runtime === "hermes-agentic-patch-apply-v3" &&
      patchApply.status === "ready-for-human-review",
    selectedProjectPresent: Boolean(selectedProject?.id),
    draftWritten: true,
    bodyWritten: true,
    validationRan: validationResults.length >= 2,
    validationsPassed: validationResults.every((result) => result.passed),
    branchNotCreated: prDraft.safetyBoundary.branchCreated === false,
    notPushed: prDraft.safetyBoundary.pushed === false,
    prNotOpened: prDraft.safetyBoundary.prOpened === false,
    noAutoMerge: prDraft.safetyBoundary.autoMerge === false,
    humanApprovalRequired:
      prDraft.safetyBoundary.requiresHumanApproval === true
  },
  notes: [
    "This drafts PR metadata only.",
    "It does not create a branch, push, or open a GitHub PR.",
    "The next version can create a local branch after explicit approval."
  ]
};

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const reportMd = [
  "# Hermes Agentic PR Draft v4 Report",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## Draft",
  "",
  `- Branch: \`${branchName}\``,
  `- Title: ${title}`,
  "",
  "## Safety",
  "",
  `- Branch created: ${report.checks.branchNotCreated === false}`,
  `- Pushed: ${report.checks.notPushed === false}`,
  `- PR opened: ${report.checks.prNotOpened === false}`,
  `- Auto-merge: ${report.checks.noAutoMerge === false}`,
  `- Human approval required: ${report.checks.humanApprovalRequired}`,
  "",
  "## Validation",
  "",
  ...validationResults.map(
    (result) => `- \`${result.command}\`: ${result.passed ? "PASS" : "FAIL"}`
  ),
  "",
  "## Human commands",
  "",
  ...prDraft.commandsForHuman.map((command) => `- \`${command}\``),
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.md"),
  reportMd
);

console.log(JSON.stringify(report, null, 2));

if (report.status !== "ready-for-human-review") {
  process.exit(1);
}
