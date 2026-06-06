import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const snapshot = readJson("sentra/snapshot.json");
const prioritization = readJson("reports/priorities/sentra-project-prioritization.json");

const selectedProject = prioritization.selectedProject;

const executionPlan = {
  id: "hermes-agentic-workflow-v1",
  title: "Hermes Agentic Workflow v1",
  selectedProject: {
    id: selectedProject.id,
    name: selectedProject.name,
    score: selectedProject.score,
    nextAction: selectedProject.nextAction
  },
  objective:
    "Create the first safe Hermes execution loop that converts Sentra-selected work into a bounded plan, patch proposal, checks, and report without merging automatically.",
  scope: {
    mode: "repo-local",
    autonomy: "semi-autonomous",
    mergePolicy: "human-approval-required",
    allowedActions: [
      "read Sentra-selected project context",
      "write execution plan artifact",
      "write patch proposal artifact",
      "define validation commands",
      "write execution report"
    ],
    disallowedActions: [
      "auto-merge",
      "push without review",
      "modify secrets",
      "perform external side effects",
      "hide domain logic inside framework code"
    ]
  },
  steps: [
    {
      id: "read-context",
      action: "Read Sentra snapshot and selected project.",
      output: "Selected project context is available to Hermes."
    },
    {
      id: "plan",
      action: "Generate a bounded execution plan.",
      output: "reports/agentic-workflow/hermes-agentic-execution-plan.json"
    },
    {
      id: "patch-proposal",
      action: "Generate a patch proposal rather than directly applying broad repo changes.",
      output: "reports/agentic-workflow/hermes-agentic-patch-proposal.md"
    },
    {
      id: "checks",
      action: "Define validation commands required before approval.",
      output: "npm run check && npm run mastra:check"
    },
    {
      id: "report",
      action: "Write execution report with status, risks, checks, and approval requirement.",
      output: "reports/agentic-workflow/hermes-agentic-execution-report.json"
    }
  ],
  validationCommands: [
    "npm run check",
    "npm run mastra:check"
  ],
  approvalRequired: true,
  successCriteria: [
    "A selected Sentra project is used as execution input.",
    "Hermes creates a bounded execution plan.",
    "Hermes creates a patch proposal artifact.",
    "Hermes defines validation commands.",
    "Hermes writes an execution report.",
    "Human approval remains required before merge."
  ]
};

const patchProposal = [
  "# Hermes Agentic Workflow Patch Proposal",
  "",
  "## Intent",
  "",
  "Introduce the first safe execution loop for Hermes.",
  "",
  "## Proposed behavior",
  "",
  "- Read Sentra-selected project context.",
  "- Generate a bounded execution plan.",
  "- Generate a patch proposal artifact.",
  "- Define validation commands.",
  "- Write an execution report.",
  "- Stop before merge.",
  "",
  "## Safety boundary",
  "",
  "- No automatic merge.",
  "- No secret modification.",
  "- No external side effects.",
  "- No push without human approval.",
  "",
  "## Selected project",
  "",
  `- ${selectedProject.name}`,
  `- Score: ${selectedProject.score}`,
  `- Next action: ${selectedProject.nextAction}`,
  ""
].join("\n");

const report = {
  runtime: "hermes-agentic-workflow-v1",
  generatedAt: new Date().toISOString(),
  status: "ready-for-human-approval",
  inputArtifacts: [
    "sentra/snapshot.json",
    "reports/priorities/sentra-project-prioritization.json"
  ],
  outputArtifacts: [
    "reports/agentic-workflow/hermes-agentic-execution-plan.json",
    "reports/agentic-workflow/hermes-agentic-patch-proposal.md",
    "reports/agentic-workflow/hermes-agentic-execution-report.json"
  ],
  selectedProject: executionPlan.selectedProject,
  executionPlan,
  checks: {
    selectedProjectIsAgenticWorkflow: selectedProject.id === "hermes-agentic-workflow",
    executionPlanWritten: true,
    patchProposalWritten: true,
    validationCommandsDefined: executionPlan.validationCommands.length >= 2,
    approvalRequired: executionPlan.approvalRequired === true,
    safeScopeDefined:
      executionPlan.scope.mergePolicy === "human-approval-required" &&
      executionPlan.scope.disallowedActions.includes("auto-merge")
  },
  notes: [
    "This is the first Hermes agentic workflow artifact.",
    "It intentionally stops before applying broad changes or merging.",
    "The next version can add a constrained patch application step after approval."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/v1.json"),
  JSON.stringify(executionPlan, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/hermes-agentic-execution-plan.json"),
  JSON.stringify(executionPlan, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/hermes-agentic-patch-proposal.md"),
  patchProposal
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/hermes-agentic-execution-report.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Execution Report",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## Selected project",
  "",
  `- ${selectedProject.name}`,
  `- Score: ${selectedProject.score}`,
  `- Next action: ${selectedProject.nextAction}`,
  "",
  "## Validation commands",
  "",
  ...executionPlan.validationCommands.map((cmd) => `- \`${cmd}\``),
  "",
  "## Safety",
  "",
  `- Approval required: ${report.checks.approvalRequired}`,
  `- Safe scope defined: ${report.checks.safeScopeDefined}`,
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/hermes-agentic-execution-report.md"),
  md
);

console.log(JSON.stringify(report, null, 2));

if (report.status !== "ready-for-human-approval") {
  process.exit(1);
}
