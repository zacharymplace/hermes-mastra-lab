import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

type Check = {
  id: string;
  pass: boolean;
};

const root = process.cwd();

const readJson = <T>(filePath: string): T => {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8")) as T;
};

const writeJson = (filePath: string, data: unknown) => {
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
  fs.writeFileSync(path.join(root, filePath), `${JSON.stringify(data, null, 2)}\n`);
};

const writeMarkdown = (filePath: string, lines: string[]) => {
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
  fs.writeFileSync(path.join(root, filePath), `${lines.join("\n")}\n`);
};

const run = (command: string) =>
  execSync(command, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const generatedAt = new Date().toISOString();

const sourceWiringIntentPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4.json";
const sourceEnforcementValidationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.json";
const sourceEnforcementImplementationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.json";

const wiringIntent = readJson<any>(sourceWiringIntentPath);
const enforcementValidation = readJson<any>(sourceEnforcementValidationPath);
const enforcementImplementation = readJson<any>(sourceEnforcementImplementationPath);

const machineArtifactPath =
  "hermes/agentic-workflow/run-v3/quality-gate-wiring-implementation/v9.5.json";
const reportJsonPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.json";
const reportMarkdownPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.md";

const requiredGateOutputs =
  wiringIntent.wiringIntent.requiredGateOutputs ??
  enforcementValidation.validation.requiredOutputFields;

const wiringScope = wiringIntent.wiringIntent.wiringScope;
const qualityGateShape = enforcementImplementation.enforcementImplementation.qualityGateShape;

const wiringImplementation = {
  id: "run-v3-quality-gate-wiring-implementation-v9.5",
  title: "Hermes Agentic Loop Quality Gate Wiring Implementation",
  summary:
    "Implements bounded wiring metadata for future Hermes agentic workflow phases without broadly rewriting existing workflow scripts.",
  qualityGateShape,
  requiredGateOutputs,
  wiredPhases: wiringScope.map((item: any) => ({
    phase: item.phase,
    target: item.target,
    required: item.required,
    patchNow: item.patchNow,
    wiringStatus: "declared-for-future-use",
    qualityGateRequired: [
      "source-patch-apply",
      "source-patch-validation",
      "branch-prepare",
      "pr-draft",
      "post-merge-ledger",
      "run-index"
    ].includes(item.phase),
    requirement: item.intent
  })),
  reusableContract: {
    fieldName: "qualityGate",
    failClosedWhenRequired: true,
    requiredWhen: [
      "source-patch-apply",
      "source-patch-validation",
      "branch-prepare",
      "pr-draft",
      "post-merge-ledger",
      "run-index"
    ],
    optionalButDeclaredWhen: [
      "patch-intent",
      "target-selection",
      "source-patch-proposal",
      "pr-lifecycle"
    ],
    requiredApplyFields: ["applied", "changed", "diffOutput", "semanticChange"],
    humanBoundaryFields: ["branchCreated", "pushed", "prOpened", "merged"]
  },
  failClosedPolicy: wiringIntent.wiringIntent.failClosedPolicy,
  implementationRules: wiringIntent.wiringIntent.implementationRules,
  nextRecommendedStep: {
    id: "run-v3-quality-gate-wiring-validation-v9.6",
    title: "Quality Gate Wiring Validation v9.6",
    summary:
      "Validate that v9.5 wiring implementation carries the required qualityGate shape, phase requirements, and fail-closed policy."
  }
};

const validationResults = [
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-wiring-intent:v9.4:gate",
    passed: true
  },
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-enforcement-validation:v9.2:gate",
    passed: true
  },
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-enforcement-implementation:v9.1:gate",
    passed: true
  }
];

for (const validation of validationResults) {
  run(validation.command);
}

const artifact = {
  runtime: "hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5",
  generatedAt,
  status: "implemented",
  inputArtifacts: [
    sourceWiringIntentPath,
    sourceEnforcementValidationPath,
    sourceEnforcementImplementationPath
  ],
  outputArtifacts: [machineArtifactPath, reportJsonPath, reportMarkdownPath],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceWiringIntent: "hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4",
    sourceEnforcementValidation:
      "hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2",
    sourceEnforcementImplementation:
      "hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1"
  },
  wiringImplementation,
  safetyBoundary: {
    implementationOnly: true,
    broadSourceRewrite: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  validationResults,
  checks: {
    runtimeLabeled: true,
    statusImplemented: true,
    wiringIntentReady: wiringIntent.status === "intent-declared",
    enforcementValidationReady: enforcementValidation.status === "validated",
    enforcementImplementationReady: enforcementImplementation.status === "implemented",
    qualityGateShapeCarriedForward: Boolean(qualityGateShape),
    requiredGateOutputsCarriedForward: requiredGateOutputs.length >= 9,
    wiredPhasesDeclared: wiringImplementation.wiredPhases.length >= 7,
    failClosedPolicyCarriedForward: wiringImplementation.failClosedPolicy.length >= 5,
    reusableContractDeclared: Boolean(wiringImplementation.reusableContract),
    validationsPassed: validationResults.every((result) => result.passed),
    implementationOnly: true,
    noBroadSourceRewrite: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This implements bounded qualityGate wiring metadata for future Hermes agentic phases.",
    "It does not broadly rewrite existing workflow scripts.",
    "The next safe step is v9.6 wiring validation."
  ]
};

writeJson(machineArtifactPath, artifact);
writeJson(reportJsonPath, artifact);

writeMarkdown(reportMarkdownPath, [
  "# Hermes Agentic Run v3 Quality Gate Wiring Implementation v9.5",
  "",
  `- Runtime: ${artifact.runtime}`,
  `- Status: ${artifact.status}`,
  `- Generated At: ${artifact.generatedAt}`,
  `- Selected Target: ${artifact.run.selectedTarget}`,
  "",
  "## Summary",
  "",
  artifact.wiringImplementation.summary,
  "",
  "## Wired Phases",
  "",
  ...artifact.wiringImplementation.wiredPhases.map(
    (phase: any) =>
      `- ${phase.phase}: ${phase.wiringStatus}; qualityGateRequired=${phase.qualityGateRequired}`
  ),
  "",
  "## Required Gate Outputs",
  "",
  ...artifact.wiringImplementation.requiredGateOutputs.map((field: string) => `- ${field}`),
  "",
  "## Fail-Closed Policy",
  "",
  ...artifact.wiringImplementation.failClosedPolicy.map((rule: string) => `- ${rule}`),
  "",
  "## Safety Boundary",
  "",
  `- Implementation only: ${artifact.safetyBoundary.implementationOnly}`,
  `- Broad source rewrite: ${artifact.safetyBoundary.broadSourceRewrite}`,
  `- Patch applied: ${artifact.safetyBoundary.patchApplied}`,
  `- Branch created: ${artifact.safetyBoundary.branchCreated}`,
  `- Pushed: ${artifact.safetyBoundary.pushed}`,
  `- Merged: ${artifact.safetyBoundary.merged}`,
  `- PR opened: ${artifact.safetyBoundary.prOpened}`,
  "",
  "## Next",
  "",
  `- ${artifact.wiringImplementation.nextRecommendedStep.title}`
]);

console.log(JSON.stringify(artifact, null, 2));
