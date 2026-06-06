import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (filePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));

const ensureDir = (filePath: string) => {
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
};

const writeJson = (filePath: string, data: unknown) => {
  ensureDir(filePath);
  fs.writeFileSync(path.join(root, filePath), `${JSON.stringify(data, null, 2)}\n`);
};

const writeMd = (filePath: string, lines: string[]) => {
  ensureDir(filePath);
  fs.writeFileSync(path.join(root, filePath), `${lines.join("\n")}\n`);
};

const sourceValidationPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-validation-v7.5.json";

const sourceValidation = readJson(sourceValidationPath);
const generatedAt = new Date().toISOString();

const prDraft = {
  runtime: "hermes-agentic-run-v2-pr-draft-v7.6",
  generatedAt,
  status: "drafted-for-human-review",
  inputArtifacts: [sourceValidationPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v2/pr-draft-v7.6.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-draft-v7.6.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-draft-v7.6.md"
  ],
  run: {
    id: "hermes-agentic-run-v2",
    sourceValidation: sourceValidation.runtime,
    sourceValidationStatus: sourceValidation.status
  },
  prDraft: {
    branchName: "hermes/agentic-run-v2-pr-draft-v7-6",
    title: "Add Hermes agentic run v2 source patch validation v7.5",
    body: [
      "# Summary",
      "",
      "Adds the validated v2 source patch application chain through v7.5.",
      "",
      "This PR draft artifact does not create a branch, push, open a PR, or merge.",
      "",
      "## Chain",
      "",
      "- v6.9 target contract",
      "- v7.0 run v2 plan",
      "- v7.1 patch intent",
      "- v7.2 target selection",
      "- v7.3 source patch proposal",
      "- v7.4 approval-gated source patch apply",
      "- v7.5 source patch validation",
      "- v7.6 PR draft metadata",
      "",
      "## Validation",
      "",
      "- `npm run hermes:agentic-run-v2-source-patch-validation:v7.5:gate`",
      "- `npm run check`",
      "- `npm run mastra:check`",
      "",
      "## Safety",
      "",
      "- No auto-branch.",
      "- No auto-push.",
      "- No automatic PR creation.",
      "- No auto-merge.",
      "- Human operator remains responsible for GitHub lifecycle actions."
    ].join("\n"),
    commandsForHuman: [
      "git switch -c hermes/agentic-run-v2-pr-draft-v7-6",
      "npm run hermes:agentic-run-v2-pr-draft:v7.6:check",
      "git add .",
      "git commit -m \"Add Hermes agentic run v2 PR draft v7.6\"",
      "git push origin hermes/agentic-run-v2-pr-draft-v7-6",
      "gh pr create --draft --base main --head hermes/agentic-run-v2-pr-draft-v7-6 --title \"Add Hermes agentic run v2 PR draft v7.6\" --body-file reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-draft-v7.6.md"
    ]
  },
  safetyBoundary: {
    prDraftOnly: true,
    branchCreated: false,
    pushed: false,
    prOpened: false,
    merged: false,
    externalSideEffects: false,
    humanApprovalRequiredForGithubActions: true
  },
  checks: {
    runtimeLabeled: true,
    sourceValidationReady: sourceValidation.status === "validated",
    prDraftWritten: true,
    bodyWritten: true,
    commandsDeclared: true,
    prDraftOnly: true,
    noBranchCreated: true,
    noPush: true,
    noPrOpened: true,
    noMerge: true,
    humanApprovalRequiredForGithubActions: true
  },
  notes: [
    "This drafts PR metadata only.",
    "It does not create a branch, push, open a PR, or merge.",
    "The next safe step is operator-approved branch preparation or manual PR creation."
  ]
};

writeJson("hermes/agentic-workflow/run-v2/pr-draft-v7.6.json", prDraft);
writeJson(
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-draft-v7.6.json",
  prDraft
);

writeMd("reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-draft-v7.6.md", [
  "# Hermes Agentic Run v2 PR Draft v7.6",
  "",
  `- Status: ${prDraft.status}`,
  `- Runtime: ${prDraft.runtime}`,
  `- Generated: ${prDraft.generatedAt}`,
  `- Branch: ${prDraft.prDraft.branchName}`,
  `- Title: ${prDraft.prDraft.title}`,
  "",
  "## PR Body",
  "",
  prDraft.prDraft.body,
  "",
  "## Human Commands",
  "",
  ...prDraft.prDraft.commandsForHuman.map((command) => `- \`${command}\``),
  "",
  "## Safety",
  "",
  `- Branch created: ${prDraft.safetyBoundary.branchCreated}`,
  `- Pushed: ${prDraft.safetyBoundary.pushed}`,
  `- PR opened: ${prDraft.safetyBoundary.prOpened}`,
  `- Merged: ${prDraft.safetyBoundary.merged}`
]);

console.log(JSON.stringify(prDraft, null, 2));
