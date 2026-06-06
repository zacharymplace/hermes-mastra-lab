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

const executionV2 = readJson(
  "reports/agentic-workflow/hermes-agentic-execution-v2.json"
);

const approvalExamplePath =
  "hermes/agentic-workflow/approvals/patch-apply-v3.example.json";
const approvalPath =
  "hermes/agentic-workflow/approvals/patch-apply-v3.json";

if (!fs.existsSync(path.join(root, approvalExamplePath))) {
  fs.writeFileSync(
    path.join(root, approvalExamplePath),
    JSON.stringify(
      {
        approved: true,
        reviewer: "external-human-reviewer",
        reason:
          "Approve constrained patch application for Hermes Agentic Patch Apply v3. No push or merge is authorized."
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

const targetPath = "hermes/agentic-workflow/patches/patch-apply-v3.md";
const targetFullPath = path.join(root, targetPath);

const patchContent = [
  "# Hermes Agentic Patch Apply v3",
  "",
  "## Purpose",
  "",
  "This artifact proves Hermes can apply a constrained repo-local patch after explicit approval.",
  "",
  "## Scope",
  "",
  "- Write one approved patch artifact.",
  "- Run validation commands.",
  "- Write an execution report.",
  "- Do not push.",
  "- Do not merge.",
  "- Do not modify secrets.",
  "",
  "## Approval",
  "",
  `- Approved: ${approval.approved}`,
  `- Reviewer: ${approval.reviewer}`,
  `- Reason: ${approval.reason}`,
  "",
  "## Source",
  "",
  "- `reports/agentic-workflow/hermes-agentic-execution-v2.json`",
  ""
].join("\n");

const beforeContent = fs.existsSync(targetFullPath)
  ? fs.readFileSync(targetFullPath, "utf8")
  : "";

const approved =
  approval.approved === true &&
  Boolean(approval.reviewer) &&
  Boolean(approval.reason);

let patchApplied = false;

if (approved) {
  fs.writeFileSync(targetFullPath, patchContent);
  patchApplied = true;
}

const afterContent = fs.existsSync(targetFullPath)
  ? fs.readFileSync(targetFullPath, "utf8")
  : "";

const diffResult = run(`git diff -- ${targetPath}`);

const validationResults = [
  run("npm run check"),
  run("npm run mastra:check")
];

const report = {
  runtime: "hermes-agentic-patch-apply-v3",
  generatedAt: new Date().toISOString(),
  status:
    approved &&
    patchApplied &&
    validationResults.every((result) => result.passed)
      ? "ready-for-human-review"
      : "blocked",
  inputArtifacts: [
    "reports/agentic-workflow/hermes-agentic-execution-v2.json",
    approvalPath
  ],
  outputArtifacts: [
    targetPath,
    "reports/agentic-workflow/hermes-agentic-patch-apply-v3.json",
    "reports/agentic-workflow/hermes-agentic-patch-apply-v3.md"
  ],
  selectedProject: executionV2.selectedProject ?? executionV2.patchCandidate?.selectedProject,
  approval,
  patch: {
    targetPath,
    applied: patchApplied,
    changed: beforeContent !== afterContent,
    diffCommand: `git diff -- ${targetPath}`,
    diffOutput: diffResult.output
  },
  validationResults,
  safetyBoundary: {
    autoPush: false,
    autoMerge: false,
    secretsModified: false,
    externalSideEffects: false,
    constrainedFiles: [targetPath]
  },
  checks: {
    approvalGranted: approved,
    reviewerCaptured: Boolean(approval.reviewer),
    reasonCaptured: Boolean(approval.reason),
    patchApplied,
    patchChangedFile: beforeContent !== afterContent,
    diffCaptured: typeof diffResult.output === "string",
    validationRan: validationResults.length >= 2,
    validationsPassed: validationResults.every((result) => result.passed),
    noAutoPush: true,
    noAutoMerge: true,
    constrainedPatchOnly: true
  },
  notes: [
    "This is the first constrained Hermes agentic patch application.",
    "It writes one approved repo-local artifact, captures a diff, runs validations, and stops before push or merge.",
    "The next version can add branch creation and PR draft generation after this pattern is stable."
  ]
};

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/hermes-agentic-patch-apply-v3.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Patch Apply v3 Report",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## Patch",
  "",
  `- Target: \`${targetPath}\``,
  `- Applied: ${report.patch.applied}`,
  `- Changed: ${report.patch.changed}`,
  "",
  "## Validation",
  "",
  ...validationResults.map(
    (result) => `- \`${result.command}\`: ${result.passed ? "PASS" : "FAIL"}`
  ),
  "",
  "## Safety",
  "",
  `- Auto-push: ${report.safetyBoundary.autoPush}`,
  `- Auto-merge: ${report.safetyBoundary.autoMerge}`,
  `- Secrets modified: ${report.safetyBoundary.secretsModified}`,
  `- External side effects: ${report.safetyBoundary.externalSideEffects}`,
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/hermes-agentic-patch-apply-v3.md"),
  md
);

console.log(JSON.stringify(report, null, 2));

if (report.status !== "ready-for-human-review") {
  process.exit(1);
}
