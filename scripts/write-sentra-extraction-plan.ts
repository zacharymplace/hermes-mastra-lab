import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

const prioritization = readJson("reports/priorities/sentra-project-prioritization.json");
const snapshot = readJson("sentra/snapshot.json");
const selectedProject = prioritization.selectedProject;

const isSentraOs = selectedProject?.id === "sentra-os";

const plan = {
  runtime: "sentra-os-extraction-planner-v1",
  generatedAt: new Date().toISOString(),
  sourceArtifact: "reports/priorities/sentra-project-prioritization.json",
  selectedProject: {
    id: selectedProject.id,
    name: selectedProject.name,
    score: selectedProject.score,
    summary: selectedProject.summary,
    nextAction: selectedProject.nextAction
  },
  objective: isSentraOs
    ? "Extract the reusable Sentra operating layer from Hermes Mastra Lab into a portable Sentra OS structure."
    : `Create an execution plan for ${selectedProject.name}.`,
  thesis:
    "Sentra should become the operating context layer that selects, plans, reviews, and updates work before Hermes promotes decisions.",
  milestones: [
    {
      id: "sentra-contracts",
      title: "Define Sentra contracts",
      outcome:
        "Document the canonical shapes for projects, decisions, reviews, priorities, snapshots, ledgers, and promotion inputs.",
      deliverables: [
        "docs/sentra-contracts.md",
        "sentra/contracts/*.schema.json"
      ]
    },
    {
      id: "portable-generator",
      title: "Extract portable generators",
      outcome:
        "Move Sentra context, review, ledger, priority rewrite, and project prioritization generators behind stable script contracts.",
      deliverables: [
        "scripts/sentra-context.ts",
        "scripts/sentra-weekly-review.ts",
        "scripts/sentra-priority-rewrite.ts",
        "scripts/sentra-project-prioritize.ts"
      ]
    },
    {
      id: "operating-loop",
      title: "Create operating loop command",
      outcome:
        "Provide one command that runs context generation, promotion input generation, ledger report, weekly review, and priority proposal.",
      deliverables: [
        "npm run sentra:operating-loop",
        "evaluations/sentra-operating-loop-gate.ts"
      ]
    },
    {
      id: "extraction-readiness",
      title: "Gate extraction readiness",
      outcome:
        "Verify the Sentra OS extraction is reversible, artifact-backed, and does not leak Hermes-specific runtime logic.",
      deliverables: [
        "reports/plans/sentra-os-extraction-plan.json",
        "reports/plans/sentra-os-extraction-plan.md",
        "evaluations/sentra-extraction-plan-gate.ts"
      ]
    }
  ],
  dependencies: [
    {
      id: "stable-lab-loop",
      status: "satisfied",
      summary:
        "Hermes Mastra Lab has working context, promotion, ledger, review, priority rewrite, and project prioritization flows."
    },
    {
      id: "domain-boundary",
      status: "watch",
      summary:
        "Sentra OS must not absorb Hermes promotion logic or Mastra runtime-specific orchestration details."
    },
    {
      id: "schema-discipline",
      status: "needed",
      summary:
        "Extraction should add schemas or contract docs before moving logic across repos."
    }
  ],
  risks: [
    {
      id: "premature-extraction",
      severity: "medium",
      mitigation:
        "Extract contracts and generators first; defer app/UI/runtime expansion."
    },
    {
      id: "duplicated-logic",
      severity: "medium",
      mitigation:
        "Keep Hermes-specific promotion logic in Hermes and Sentra context logic in Sentra."
    },
    {
      id: "framework-creep",
      severity: "medium",
      mitigation:
        "Keep Sentra plain TypeScript and artifact-first unless a runtime proves necessary."
    }
  ],
  successCriteria: [
    "Sentra OS can generate snapshot and promotion input from its own project/decision/review/priority files.",
    "Hermes can consume Sentra OS output without knowing Sentra internals.",
    "The extraction has contract docs or schemas.",
    "The operating loop remains reproducible with npm scripts.",
    "No Mastra-specific logic is required inside Sentra OS."
  ],
  nextAction:
    "Add Sentra contracts and schemas before creating or extracting a separate Sentra OS repo.",
  checks: {
    selectedProjectIsSentraOs: isSentraOs,
    objectivePresent: true,
    milestonesPresent: true,
    dependenciesPresent: true,
    risksPresent: true,
    successCriteriaPresent: true,
    nextActionPresent: true
  },
  notes: [
    "This translates multi-project prioritization into an extraction plan.",
    "It does not create the Sentra OS repo yet.",
    "The next push should define Sentra contracts and schemas."
  ]
};

fs.writeFileSync(
  path.join(root, "sentra/plans/sentra-os-extraction.json"),
  JSON.stringify(plan, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/plans/sentra-os-extraction-plan.json"),
  JSON.stringify(plan, null, 2) + "\n"
);

const lines = [
  "# Sentra OS Extraction Plan",
  "",
  `Generated: ${plan.generatedAt}`,
  "",
  "## Selected project",
  "",
  `**${plan.selectedProject.name}** — ${plan.selectedProject.score}`,
  "",
  plan.selectedProject.summary,
  "",
  "## Objective",
  "",
  plan.objective,
  "",
  "## Thesis",
  "",
  plan.thesis,
  "",
  "## Milestones",
  "",
  ...plan.milestones.flatMap((item) => [
    `### ${item.title}`,
    "",
    item.outcome,
    "",
    "Deliverables:",
    ...item.deliverables.map((deliverable) => `- ${deliverable}`),
    ""
  ]),
  "## Dependencies",
  "",
  ...plan.dependencies.map(
    (item) => `- ${item.id} (${item.status}): ${item.summary}`
  ),
  "",
  "## Risks",
  "",
  ...plan.risks.map(
    (item) => `- ${item.id} (${item.severity}): ${item.mitigation}`
  ),
  "",
  "## Success criteria",
  "",
  ...plan.successCriteria.map((item) => `- ${item}`),
  "",
  "## Next action",
  "",
  plan.nextAction,
  ""
];

fs.writeFileSync(
  path.join(root, "reports/plans/sentra-os-extraction-plan.md"),
  lines.join("\n")
);

console.log(JSON.stringify(plan, null, 2));
