import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const readJson = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

const run = (command: string) =>
  execSync(command, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();

const ensureDir = (p: string) => fs.mkdirSync(path.dirname(path.join(root, p)), { recursive: true });

const writeJson = (p: string, value: unknown) => {
  ensureDir(p);
  fs.writeFileSync(path.join(root, p), JSON.stringify(value, null, 2) + "\n");
};

const writeMd = (p: string, lines: string[]) => {
  ensureDir(p);
  fs.writeFileSync(path.join(root, p), lines.join("\n") + "\n");
};

const enforcementValidationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.json";
const enforcementImplementationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.json";

const validation = readJson(enforcementValidationPath);
const implementation = readJson(enforcementImplementationPath);

const validationCommands = [
  "npm run hermes:agentic-run-v3-quality-gate-enforcement-validation:v9.2:gate",
  "npm run hermes:agentic-run-v3-quality-gate-enforcement-implementation:v9.1:gate",
  "npm run hermes:agentic-run-v3-quality-gate-enforcement-intent:v9.0:gate"
];

const validationResults = validationCommands.map((command) => {
  try {
    run(command);
    return { command, passed: true };
  } catch {
    return { command, passed: false };
  }
});

const generatedAt = new Date().toISOString();

const requiredGateOutputs =
  validation.validation?.requiredOutputFields ??
  implementation.enforcementImplementation?.qualityGateShape
    ? Object.keys(implementation.enforcementImplementation.qualityGateShape)
    : [];

const futurePhaseRequirements =
  validation.validation?.futurePhaseRequirements ??
  implementation.enforcementImplementation?.futurePhaseRequirements ??
  [];

const wiringTargets = [
  {
    phase: "source-patch-proposal",
    target: "future source patch proposal generators",
    wiring: "Add qualityGate.applicability and expectedChangedPaths metadata.",
    required: true,
    patchNow: false
  },
  {
    phase: "source-patch-apply",
    target: "future source patch apply generators",
    wiring: "Add complete qualityGate status before ready-for-human-review.",
    required: true,
    patchNow: false
  },
  {
    phase: "source-patch-validation",
    target: "future source patch validation gates",
    wiring: "Fail closed when qualityGate is missing, failed, null, or incomplete.",
    required: true,
    patchNow: false
  },
  {
    phase: "branch-prepare",
    target: "future branch preparation artifacts",
    wiring: "Require clean or declared generated drift before branch preparation.",
    required: true,
    patchNow: false
  },
  {
    phase: "pr-draft",
    target: "future PR draft artifacts",
    wiring: "Include qualityGate status in PR draft validation metadata.",
    required: true,
    patchNow: false
  },
  {
    phase: "post-merge-ledger",
    target: "future post-merge ledger entries",
    wiring: "Record qualityGate status with post-merge validation results.",
    required: true,
    patchNow: false
  },
  {
    phase: "run-index",
    target: "future run index artifacts",
    wiring: "Expose qualityGate status as durable run-level state.",
    required: true,
    patchNow: false
  }
];

const output = {
  runtime: "hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3",
  generatedAt,
  status: "proposed",
  inputArtifacts: [enforcementValidationPath, enforcementImplementationPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-wiring-proposal/v9.3.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceEnforcementValidation: "hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2",
    sourceEnforcementImplementation: "hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1"
  },
  wiringProposal: {
    id: "run-v3-quality-gate-wiring-proposal-v9.3",
    title: "Hermes Agentic Loop Quality Gate Wiring Proposal",
    summary:
      "Proposes the exact future workflow phases where the validated qualityGate shape should be wired before any broad source rewrite.",
    requiredGateOutputs,
    futurePhaseRequirements,
    wiringTargets,
    failClosedPolicy: [
      "Future source-patch-validation gates fail when qualityGate is required and absent.",
      "Future source-patch-validation gates fail when qualityGate.passed is false or null.",
      "Future readiness reports fail when required qualityGate output fields are missing.",
      "Future apply reports fail when applied, changed, diffOutput, or semanticChange are missing.",
      "Future branch preparation fails when generated drift is neither clean nor declared."
    ],
    proposedNextStep: {
      id: "run-v3-quality-gate-wiring-intent-v9.4",
      title: "Quality Gate Wiring Intent v9.4",
      summary:
        "Declare a bounded wiring intent before modifying future patch/apply generators or gates."
    }
  },
  safetyBoundary: {
    proposalOnly: true,
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
    statusProposed: true,
    enforcementValidationReady: validation.status === "validated",
    enforcementImplementationReady: implementation.status === "implemented",
    requiredGateOutputsPresent: requiredGateOutputs.length >= 9,
    futurePhaseRequirementsPresent: futurePhaseRequirements.length >= 7,
    wiringTargetsDeclared: wiringTargets.length >= 7,
    failClosedPolicyDeclared: true,
    validationsPassed: validationResults.every((r) => r.passed),
    proposalOnly: true,
    noBroadSourceRewrite: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This proposes where qualityGate enforcement should be wired.",
    "It does not modify future workflow scripts yet.",
    "The next safe step is v9.4 wiring intent."
  ]
};

writeJson("hermes/agentic-workflow/run-v3/quality-gate-wiring-proposal/v9.3.json", output);
writeJson("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.json", output);

writeMd("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.md", [
  "# Hermes Agentic Run v3 Quality Gate Wiring Proposal v9.3",
  "",
  `- Runtime: ${output.runtime}`,
  `- Status: ${output.status}`,
  `- Generated: ${output.generatedAt}`,
  "",
  "## Summary",
  "",
  output.wiringProposal.summary,
  "",
  "## Wiring Targets",
  "",
  ...wiringTargets.flatMap((target) => [
    `### ${target.phase}`,
    "",
    `- Target: ${target.target}`,
    `- Wiring: ${target.wiring}`,
    `- Required: ${target.required}`,
    `- Patch now: ${target.patchNow}`,
    ""
  ]),
  "## Fail-Closed Policy",
  "",
  ...output.wiringProposal.failClosedPolicy.map((rule) => `- ${rule}`),
  "",
  "## Safety",
  "",
  "- Proposal only.",
  "- No broad source rewrite.",
  "- No patch applied.",
  "- No branch created.",
  "- No push, PR, merge, or GitHub lifecycle action.",
  "",
  "## Next",
  "",
  `- ${output.wiringProposal.proposedNextStep.id}: ${output.wiringProposal.proposedNextStep.summary}`
]);

console.log(JSON.stringify(output, null, 2));
