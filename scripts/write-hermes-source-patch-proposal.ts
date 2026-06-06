import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const executionReport = readJson(
  "reports/agentic-workflow/hermes-agentic-execution-report.json"
);

const prioritization = readJson(
  "reports/priorities/sentra-project-prioritization.json"
);

const selectedProject = prioritization.selectedProject;

const targetFiles = [
  {
    path: "docs/hermes-agentic-workflow.md",
    changeType: "modify",
    reason:
      "Document the next safe transition from artifact-only patch apply to source patch proposal."
  },
  {
    path: "hermes/agentic-workflow/source-patches/v1.json",
    changeType: "create",
    reason:
      "Store the proposed source patch contract as a durable Hermes artifact."
  }
];

const proposal = {
  runtime: "hermes-source-patch-proposal-v1",
  generatedAt: new Date().toISOString(),
  status: "proposed",
  sourceExecutionReport:
    "reports/agentic-workflow/hermes-agentic-execution-report.json",
  selectedProject: {
    id: selectedProject.id,
    name: selectedProject.name,
    score: selectedProject.score,
    nextAction: selectedProject.nextAction
  },
  objective:
    "Generate a source-code patch proposal without applying source changes, pushing, or merging.",
  scope: {
    mode: "proposal-only",
    appliesSourceChanges: false,
    requiresHumanApprovalBeforeApply: true,
    noAutoMerge: true,
    noPush: true,
    allowedTargetPrefixes: [
      "docs/",
      "hermes/agentic-workflow/source-patches/",
      "reports/agentic-workflow/source-patches/"
    ],
    disallowedTargets: [
      ".env",
      ".env.*",
      "node_modules/",
      "package-lock.json unless dependency changes are explicitly approved",
      "secrets",
      "credentials"
    ]
  },
  targetFiles,
  proposedChanges: [
    {
      target: "docs/hermes-agentic-workflow.md",
      summary:
        "Add Source Patch Proposal v1 section describing proposal-only behavior, required approval, checks, and rollback notes.",
      expectedOutcome:
        "The agentic workflow documentation explains how Hermes proposes source changes safely before applying them."
    },
    {
      target: "hermes/agentic-workflow/source-patches/v1.json",
      summary:
        "Create durable source patch proposal contract for future apply step.",
      expectedOutcome:
        "Future source patch apply workflow can read a structured proposal artifact."
    }
  ],
  validationCommands: [
    "npm run hermes:source-patch-proposal:gate",
    "npm run check",
    "npm run mastra:check"
  ],
  rollbackNotes: [
    "Do not apply source changes if proposal target files fall outside allowed prefixes.",
    "Delete generated source patch proposal artifacts if proposal is rejected.",
    "Restore docs/hermes-agentic-workflow.md before commit if documentation change is not approved."
  ],
  checks: {
    selectedProjectIsAgenticWorkflow:
      selectedProject.id === "hermes-agentic-workflow",
    executionReportReady:
      executionReport.status === "ready-for-human-approval",
    proposalOnly: true,
    sourceChangesNotApplied: true,
    humanApprovalRequired: true,
    noAutoMerge: true,
    noPush: true,
    targetFilesDeclared: targetFiles.length >= 2,
    validationCommandsDeclared: true,
    rollbackNotesDeclared: true
  },
  notes: [
    "This is the first Hermes source patch proposal.",
    "It does not apply source changes.",
    "It prepares the contract needed for a later constrained source patch apply workflow."
  ]
};

const jsonPath =
  "reports/agentic-workflow/source-patches/hermes-source-patch-proposal.json";
const mdPath =
  "reports/agentic-workflow/source-patches/hermes-source-patch-proposal.md";
const durablePath = "hermes/agentic-workflow/source-patches/v1.json";

fs.writeFileSync(path.join(root, jsonPath), JSON.stringify(proposal, null, 2) + "\n");
fs.writeFileSync(path.join(root, durablePath), JSON.stringify(proposal, null, 2) + "\n");

const md = [
  "# Hermes Source Patch Proposal v1",
  "",
  `Generated: ${proposal.generatedAt}`,
  `Status: ${proposal.status}`,
  "",
  "## Objective",
  "",
  proposal.objective,
  "",
  "## Selected project",
  "",
  `- ${proposal.selectedProject.name}`,
  `- Score: ${proposal.selectedProject.score}`,
  `- Next action: ${proposal.selectedProject.nextAction}`,
  "",
  "## Target files",
  "",
  ...proposal.targetFiles.map(
    (file) => `- ${file.path} (${file.changeType}): ${file.reason}`
  ),
  "",
  "## Proposed changes",
  "",
  ...proposal.proposedChanges.map(
    (change) =>
      `- ${change.target}: ${change.summary} Expected outcome: ${change.expectedOutcome}`
  ),
  "",
  "## Validation commands",
  "",
  ...proposal.validationCommands.map((command) => `- \`${command}\``),
  "",
  "## Rollback notes",
  "",
  ...proposal.rollbackNotes.map((note) => `- ${note}`),
  "",
  "## Safety",
  "",
  `- Proposal only: ${proposal.checks.proposalOnly}`,
  `- Source changes applied: ${!proposal.checks.sourceChangesNotApplied}`,
  `- Human approval required: ${proposal.checks.humanApprovalRequired}`,
  `- No auto-merge: ${proposal.checks.noAutoMerge}`,
  `- No push: ${proposal.checks.noPush}`,
  ""
].join("\n");

fs.writeFileSync(path.join(root, mdPath), md);

console.log(JSON.stringify(proposal, null, 2));

if (proposal.status !== "proposed") {
  process.exit(1);
}
