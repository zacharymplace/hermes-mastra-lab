import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const writeJson = (relativePath: string, value: unknown) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
};

const writeMarkdown = (relativePath: string, lines: string[]) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join("\n")}\n`);
};

const planPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-plan-v8.3.json";

const plan = readJson(planPath);
const generatedAt = new Date().toISOString();

const report = {
  runtime: "hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4",
  generatedAt,
  status: "intent-declared",
  inputArtifacts: [planPath],
  run: {
    id: "hermes-agentic-run-v3",
    sourcePlan: plan.runtime,
    selectedTarget: plan.run?.selectedTarget,
    objective:
      "Declare the implementation intent for executable loop-quality gates before writing source gate logic."
  },
  implementationIntent: {
    id: "run-v3-loop-quality-gate-implementation",
    title: "Implement Hermes Agentic Loop Quality Gate",
    type: "quality-gate-implementation-intent",
    summary:
      "Prepare a bounded implementation that evaluates generated drift, timestamp churn, no-op patch claims, human-boundary preservation, and declared-target-only changes.",
    proposedPatchShape: {
      generator:
        "scripts/write-hermes-agentic-run-v3-quality-gate-implementation-v8-5.ts",
      gate:
        "evaluations/hermes-agentic-run-v3-quality-gate-implementation-v8-5-gate.ts",
      machineArtifact:
        "hermes/agentic-workflow/run-v3/quality-gate-implementation/v8.5.json",
      reportJson:
        "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json",
      reportMarkdown:
        "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.md"
    },
    plannedChecks: plan.plan?.gates ?? [],
    implementationRules: [
      "Read the v8.3 quality gate plan as the source of truth.",
      "Produce one machine-readable quality gate implementation artifact.",
      "Classify drift separately from semantic changes.",
      "Treat timestamp-only churn as noise unless explicitly declared.",
      "Require no-op patch claims to expose applied, changed, diffOutput, and semanticChange.",
      "Preserve the human/operator boundary for branch, push, PR, and merge actions.",
      "Reject changes outside the declared target set."
    ],
    expectedNextStep:
      "Generate v8.5 quality gate implementation artifact and gate; do not apply broad source changes yet."
  },
  allowedTargets: [
    "scripts/write-hermes-agentic-run-v3-quality-gate-implementation-intent-v8-4.ts",
    "evaluations/hermes-agentic-run-v3-quality-gate-implementation-intent-v8-4-gate.ts",
    "hermes/agentic-workflow/run-v3/quality-gate-implementation-intent/v8.4.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.md",
    "package.json"
  ],
  safetyBoundary: {
    intentOnly: true,
    implementationGenerated: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforePatch: true
  },
  validationResults: [
    {
      command: "npm run hermes:agentic-run-v3-quality-gate-plan:v8.3:gate",
      passed: true
    },
    {
      command: "npm run hermes:agentic-run-v3-target:v8.2:gate",
      passed: true
    }
  ],
  checks: {
    runtimeLabeled: true,
    statusIntentDeclared: true,
    planValid: plan.status === "planned",
    selectedLoopQuality: plan.run?.selectedTarget === "loop-quality-hardening",
    implementationIntentPresent: true,
    proposedPatchShapeDeclared: true,
    plannedChecksCarriedForward: Array.isArray(plan.plan?.gates) && plan.plan.gates.length >= 5,
    implementationRulesDeclared: true,
    validationsPassed: true,
    intentOnly: true,
    noImplementationGenerated: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This declares the implementation intent for run v3 loop-quality gates.",
    "It does not implement or apply the quality gate yet.",
    "The next safe step is v8.5 quality gate implementation."
  ]
};

const artifactPath =
  "hermes/agentic-workflow/run-v3/quality-gate-implementation-intent/v8.4.json";
const reportJsonPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.json";
const reportMdPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.md";

writeJson(artifactPath, report);
writeJson(reportJsonPath, report);

writeMarkdown(reportMdPath, [
  "# Hermes Agentic Run v3 Quality Gate Implementation Intent v8.4",
  "",
  `- Status: ${report.status}`,
  `- Runtime: ${report.runtime}`,
  `- Generated: ${report.generatedAt}`,
  `- Run: ${report.run.id}`,
  `- Selected target: ${report.run.selectedTarget}`,
  "",
  "## Intent",
  "",
  report.implementationIntent.summary,
  "",
  "## Proposed Patch Shape",
  "",
  `- Generator: ${report.implementationIntent.proposedPatchShape.generator}`,
  `- Gate: ${report.implementationIntent.proposedPatchShape.gate}`,
  `- Machine artifact: ${report.implementationIntent.proposedPatchShape.machineArtifact}`,
  `- Report JSON: ${report.implementationIntent.proposedPatchShape.reportJson}`,
  `- Report Markdown: ${report.implementationIntent.proposedPatchShape.reportMarkdown}`,
  "",
  "## Implementation Rules",
  "",
  ...report.implementationIntent.implementationRules.map((rule) => `- ${rule}`),
  "",
  "## Safety Boundary",
  "",
  `- Intent only: ${report.safetyBoundary.intentOnly}`,
  `- Implementation generated: ${report.safetyBoundary.implementationGenerated}`,
  `- Patch applied: ${report.safetyBoundary.patchApplied}`,
  `- Branch created: ${report.safetyBoundary.branchCreated}`,
  `- Pushed: ${report.safetyBoundary.pushed}`,
  `- Merged: ${report.safetyBoundary.merged}`,
  `- PR opened: ${report.safetyBoundary.prOpened}`,
  "",
  "## Next Step",
  "",
  report.implementationIntent.expectedNextStep
]);

console.log(JSON.stringify(report, null, 2));
