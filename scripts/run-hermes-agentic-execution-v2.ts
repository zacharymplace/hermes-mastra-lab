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

const plan = readJson("hermes/agentic-workflow/v1.json");
const snapshot = readJson("sentra/snapshot.json");

const patchCandidate = {
  runtime: "hermes-agentic-patch-candidate-v2",
  generatedAt: new Date().toISOString(),
  selectedProject: plan.selectedProject,
  intent:
    "Convert Hermes Agentic Workflow v1 from planning-only into controlled execution reporting.",
  proposedFiles: [
    "scripts/run-hermes-agentic-execution-v2.ts",
    "evaluations/hermes-agentic-execution-v2-gate.ts",
    "hermes/agentic-workflow/executions/latest.json",
    "reports/agentic-workflow/hermes-agentic-execution-v2.json",
    "reports/agentic-workflow/patches/latest.md"
  ],
  safetyBoundary: {
    autoMerge: false,
    autoPush: false,
    requiresHumanApproval: true,
    externalSideEffects: false
  },
  selectedContext: {
    projectId: snapshot.projectPrioritization?.selectedProject?.id ?? null,
    projectName: snapshot.projectPrioritization?.selectedProject?.name ?? null,
    projectScore: snapshot.projectPrioritization?.selectedProject?.score ?? null
  }
};

const patchMarkdown = [
  "# Hermes Agentic Execution v2 Patch Candidate",
  "",
  "## Intent",
  "",
  patchCandidate.intent,
  "",
  "## Selected project",
  "",
  `- ${patchCandidate.selectedContext.projectName}`,
  `- Score: ${patchCandidate.selectedContext.projectScore}`,
  "",
  "## Proposed files",
  "",
  ...patchCandidate.proposedFiles.map((file) => `- \`${file}\``),
  "",
  "## Safety boundary",
  "",
  `- Auto-merge: ${patchCandidate.safetyBoundary.autoMerge}`,
  `- Auto-push: ${patchCandidate.safetyBoundary.autoPush}`,
  `- Human approval required: ${patchCandidate.safetyBoundary.requiresHumanApproval}`,
  `- External side effects: ${patchCandidate.safetyBoundary.externalSideEffects}`,
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/patches/latest.md"),
  patchMarkdown
);

const validationResults = [
  run("npm run check"),
  run("npm run mastra:check")
];

const report = {
  runtime: "hermes-agentic-execution-v2",
  generatedAt: new Date().toISOString(),
  status: validationResults.every((result) => result.passed)
    ? "ready-for-human-approval"
    : "blocked",
  inputArtifacts: [
    "hermes/agentic-workflow/v1.json",
    "sentra/snapshot.json"
  ],
  outputArtifacts: [
    "reports/agentic-workflow/patches/latest.md",
    "reports/agentic-workflow/hermes-agentic-execution-v2.json",
    "hermes/agentic-workflow/executions/latest.json"
  ],
  patchCandidate,
  validationResults,
  checks: {
    selectedProjectIsAgenticWorkflow:
      patchCandidate.selectedContext.projectId === "hermes-agentic-workflow",
    patchCandidateWritten: fs.existsSync(
      path.join(root, "reports/agentic-workflow/patches/latest.md")
    ),
    validationRan: validationResults.length >= 2,
    validationsPassed: validationResults.every((result) => result.passed),
    humanApprovalRequired: patchCandidate.safetyBoundary.requiresHumanApproval === true,
    noAutoMerge: patchCandidate.safetyBoundary.autoMerge === false,
    noAutoPush: patchCandidate.safetyBoundary.autoPush === false
  },
  notes: [
    "This is the first controlled Hermes agentic execution loop.",
    "It creates a patch candidate, runs validations, writes a report, and stops before merge.",
    "Human approval remains required before any merge or release action."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/executions/latest.json"),
  JSON.stringify(report, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/hermes-agentic-execution-v2.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Execution v2",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## Patch candidate",
  "",
  "- `reports/agentic-workflow/patches/latest.md`",
  "",
  "## Validation",
  "",
  ...validationResults.map(
    (result) => `- \`${result.command}\`: ${result.passed ? "PASS" : "FAIL"}`
  ),
  "",
  "## Approval",
  "",
  `Human approval required: ${report.checks.humanApprovalRequired}`,
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/hermes-agentic-execution-v2.md"),
  md
);

console.log(JSON.stringify(report, null, 2));

if (report.status !== "ready-for-human-approval") {
  process.exit(1);
}
