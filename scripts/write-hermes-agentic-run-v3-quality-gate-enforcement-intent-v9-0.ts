import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const readJson = (p: string) =>
  JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

const writeJson = (p: string, data: unknown) => {
  fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });
  fs.writeFileSync(path.join(root, p), JSON.stringify(data, null, 2) + "\n");
};

const run = (command: string) => {
  try {
    execSync(command, { cwd: root, stdio: "pipe", encoding: "utf8" });
    return true;
  } catch {
    return false;
  }
};

const generatedAt = new Date().toISOString();

const enforcementPlanPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.json";
const adoptionReportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-report-v8.8.json";

const enforcementPlan = readJson(enforcementPlanPath);
const adoptionReport = readJson(adoptionReportPath);

const validationResults = [
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-enforcement-plan:v8.9:gate",
    passed: run("npm run hermes:agentic-run-v3-quality-gate-enforcement-plan:v8.9:gate"),
  },
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-adoption-report:v8.8:gate",
    passed: run("npm run hermes:agentic-run-v3-quality-gate-adoption-report:v8.8:gate"),
  },
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-adoption:v8.7:gate",
    passed: run("npm run hermes:agentic-run-v3-quality-gate-adoption:v8.7:gate"),
  },
];

const intent = {
  id: "run-v3-quality-gate-enforcement-intent-v9.0",
  title: "Hermes Agentic Loop Quality Gate Enforcement Intent",
  type: "quality-gate-enforcement-implementation-intent",
  summary:
    "Declare the bounded implementation intent for wiring quality gate enforcement into future Hermes agentic patch/apply and lifecycle scripts.",
  proposedPatchShape: {
    generator:
      "scripts/write-hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9-1.ts",
    gate:
      "evaluations/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9-1-gate.ts",
    machineArtifact:
      "hermes/agentic-workflow/run-v3/quality-gate-enforcement-implementation/v9.1.json",
    reportJson:
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.json",
    reportMarkdown:
      "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.md",
  },
  implementationScope: [
    "Create a reusable qualityGate object shape for future agentic run artifacts.",
    "Require future source-patch-proposal artifacts to declare qualityGate applicability.",
    "Require future source-patch-apply artifacts to include qualityGate status before readiness.",
    "Require future source-patch-validation artifacts to fail closed when gate status is absent or failed.",
    "Carry qualityGate status into PR draft, post-merge ledger, and run-index artifacts.",
  ],
  enforcementRules:
    enforcementPlan.enforcementPlan?.enforcementRules ??
    adoptionReport.adoptionReport?.adoptionRules ??
    [],
  requiredGateOutputs:
    enforcementPlan.enforcementPlan?.requiredGateOutputs ?? [],
  enforcementPoints:
    enforcementPlan.enforcementPlan?.enforcementPoints ?? [],
  expectedNextStep:
    "Generate v9.1 quality gate enforcement implementation artifact and gate; do not broadly rewrite workflow scripts yet.",
};

const artifact = {
  runtime: "hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0",
  generatedAt,
  status: "intent-declared",
  inputArtifacts: [enforcementPlanPath, adoptionReportPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-enforcement-intent/v9.0.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0.md",
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceEnforcementPlan:
      "hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9",
    sourceAdoptionReport:
      "hermes-agentic-run-v3-quality-gate-adoption-report-v8.8",
  },
  enforcementIntent: intent,
  safetyBoundary: {
    intentOnly: true,
    implementationGenerated: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforePatch: true,
  },
  validationResults,
  checks: {
    runtimeLabeled: true,
    statusIntentDeclared: true,
    enforcementPlanReady: enforcementPlan.status === "planned",
    adoptionReportReady: adoptionReport.status === "reported",
    proposedPatchShapeDeclared: Boolean(intent.proposedPatchShape.generator),
    implementationScopeDeclared: intent.implementationScope.length >= 5,
    enforcementRulesCarriedForward: intent.enforcementRules.length >= 5,
    requiredGateOutputsCarriedForward: intent.requiredGateOutputs.length >= 5,
    enforcementPointsCarriedForward: intent.enforcementPoints.length >= 5,
    validationsPassed: validationResults.every((result) => result.passed),
    intentOnly: true,
    noImplementationGenerated: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true,
  },
  notes: [
    "This declares the implementation intent for v9.1 quality gate enforcement.",
    "It does not wire enforcement into future scripts yet.",
    "The next safe step is v9.1 enforcement implementation.",
  ],
};

writeJson(
  "hermes/agentic-workflow/run-v3/quality-gate-enforcement-intent/v9.0.json",
  artifact,
);
writeJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0.json",
  artifact,
);

const md = [
  "# Hermes Agentic Run v3 Quality Gate Enforcement Intent v9.0",
  "",
  `- Runtime: ${artifact.runtime}`,
  `- Status: ${artifact.status}`,
  `- Generated: ${artifact.generatedAt}`,
  "",
  "## Purpose",
  "",
  intent.summary,
  "",
  "## Proposed v9.1 Patch Shape",
  "",
  `- Generator: \`${intent.proposedPatchShape.generator}\``,
  `- Gate: \`${intent.proposedPatchShape.gate}\``,
  `- Machine artifact: \`${intent.proposedPatchShape.machineArtifact}\``,
  `- Report JSON: \`${intent.proposedPatchShape.reportJson}\``,
  `- Report Markdown: \`${intent.proposedPatchShape.reportMarkdown}\``,
  "",
  "## Implementation Scope",
  "",
  ...intent.implementationScope.map((item) => `- ${item}`),
  "",
  "## Required Gate Outputs",
  "",
  ...intent.requiredGateOutputs.map((item: string) => `- \`${item}\``),
  "",
  "## Safety Boundary",
  "",
  "- Intent only.",
  "- No implementation generated.",
  "- No patch applied.",
  "- No branch created.",
  "- No push.",
  "- No merge.",
  "- No PR opened.",
  "",
  "## Next Step",
  "",
  intent.expectedNextStep,
  "",
].join("\n");

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0.md",
  ),
  md,
);

console.log(JSON.stringify(artifact, null, 2));
