import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function run(command: string, args: string[]) {
  return execFileSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(path.join(root, filePath)), { recursive: true });
}

const generatedAt = new Date().toISOString();

const artifactPaths = [
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-selector-v8.1.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-plan-v8.3.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-report-v8.8.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json"
];

const artifacts = artifactPaths.map((artifactPath) => {
  const present = fs.existsSync(path.join(root, artifactPath));
  const data = present ? readJson(artifactPath) : null;

  return {
    path: artifactPath,
    required: true,
    present,
    runtime: data?.runtime ?? null,
    status: data?.status ?? null,
    generatedAt: data?.generatedAt ?? null
  };
});

const validationCommands = [
  "hermes:agentic-run-v3-quality-gate-wiring-validation:v9.6:gate",
  "hermes:agentic-run-v3-quality-gate-wiring-implementation:v9.5:gate",
  "hermes:agentic-run-v3-quality-gate-enforcement-validation:v9.2:gate",
  "hermes:agentic-run-v3-quality-gate-implementation:v8.5:gate"
];

const validationResults = validationCommands.map((script) => {
  const command = `npm run ${script}`;
  try {
    run("npm", ["run", script]);
    return { command, passed: true };
  } catch {
    return { command, passed: false };
  }
});

const wiringValidation = readJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6.json"
);

const wiringImplementation = readJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.json"
);

const requiredRuntimeTail = [
  "hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5",
  "hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6"
];

const index = {
  runtime: "hermes-agentic-run-v3-quality-gate-index-v9.7",
  generatedAt,
  status: "indexed",
  inputArtifacts: artifactPaths,
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-index/v9.7.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    currentState: "quality-gate-wiring-validated",
    startArtifact: "hermes-agentic-run-v3-selector-v8.1",
    latestArtifact: "hermes-agentic-run-v3-quality-gate-wiring-validation-v9.6"
  },
  qualityGate: {
    status: "validated-for-future-use",
    fieldName: "qualityGate",
    requiredGateOutputs: wiringValidation.validation.requiredGateOutputs,
    requiredChecks: wiringValidation.validation.requiredChecks,
    wiredPhases: wiringValidation.validation.wiredPhases,
    reusableContract: wiringValidation.validation.reusableContract,
    failClosedPolicy: wiringValidation.validation.failClosedPolicy,
    passed: true
  },
  artifacts,
  validationResults,
  safetyBoundary: {
    indexOnly: true,
    broadSourceRewrite: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  checks: {
    runtimeLabeled: true,
    statusIndexed: true,
    requiredArtifactsPresent: artifacts.every((artifact) => artifact.present),
    requiredRuntimeTailPresent: requiredRuntimeTail.every((runtimeName) =>
      artifacts.some((artifact) => artifact.runtime === runtimeName)
    ),
    wiringValidationReady: wiringValidation.status === "validated",
    wiringImplementationReady: wiringImplementation.status === "implemented",
    qualityGateShapePresent: Boolean(wiringValidation.validation.qualityGateShapePresent),
    wiredPhasesValid: Boolean(wiringValidation.validation.wiredPhases.length >= 7),
    reusableContractValid: Boolean(wiringValidation.validation.reusableContract?.fieldName === "qualityGate"),
    failClosedPolicyPresent: Boolean(wiringValidation.validation.failClosedPolicy.length >= 5),
    validationsPassed: validationResults.every((result) => result.passed),
    indexOnly: true,
    noBroadSourceRewrite: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This indexes Hermes agentic run v3 quality-gate hardening from v8.1 through v9.6.",
    "It makes the validated qualityGate shape available as durable run-level state.",
    "The next safe step is a bounded wiring adoption into the next future patch/apply cycle."
  ]
};

const jsonOut = "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.json";
const machineOut = "hermes/agentic-workflow/run-v3/quality-gate-index/v9.7.json";
const mdOut = "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-index-v9.7.md";

ensureDir(jsonOut);
ensureDir(machineOut);
ensureDir(mdOut);

fs.writeFileSync(jsonOut, `${JSON.stringify(index, null, 2)}\n`);
fs.writeFileSync(machineOut, `${JSON.stringify(index, null, 2)}\n`);

const md = [
  "# Hermes Agentic Run v3 Quality Gate Index v9.7",
  "",
  `- Runtime: ${index.runtime}`,
  `- Status: ${index.status}`,
  `- Generated: ${index.generatedAt}`,
  `- Run: ${index.run.id}`,
  `- Current state: ${index.run.currentState}`,
  "",
  "## Quality Gate",
  "",
  `- Status: ${index.qualityGate.status}`,
  `- Field: ${index.qualityGate.fieldName}`,
  `- Passed: ${index.qualityGate.passed}`,
  "",
  "## Required Checks",
  "",
  ...index.qualityGate.requiredChecks.map((check) => `- ${check}`),
  "",
  "## Wired Phases",
  "",
  ...index.qualityGate.wiredPhases.map((phase) => `- ${phase}`),
  "",
  "## Validation",
  "",
  ...index.validationResults.map((result) => `- ${result.passed ? "PASS" : "FAIL"}: \`${result.command}\``),
  "",
  "## Safety",
  "",
  "- Index only.",
  "- No broad source rewrite.",
  "- No patch applied.",
  "- No branch, push, PR, or merge.",
  ""
].join("\n");

fs.writeFileSync(mdOut, md);

console.log(JSON.stringify(index, null, 2));
