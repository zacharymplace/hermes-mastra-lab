import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function writeJson(filePath: string, data: unknown) {
  const fullPath = path.join(root, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + "\n");
}

function run(command: string) {
  execSync(command, { cwd: root, stdio: "pipe", encoding: "utf8" });
}

const runtime = "hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4";
const generatedAt = new Date().toISOString();

const proposalPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3.json";
const validationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2.json";

const proposal = readJson(proposalPath);
const validation = readJson(validationPath);

const validationResults = [
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-wiring-proposal:v9.3:gate",
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

for (const result of validationResults) {
  run(result.command);
}

const wiringProposal = proposal.wiringProposal;
const requiredGateOutputs = wiringProposal.requiredGateOutputs ?? [];
const wiringTargets = wiringProposal.wiringTargets ?? [];
const failClosedPolicy = wiringProposal.failClosedPolicy ?? [];

const artifact = {
  runtime,
  generatedAt,
  status: "intent-declared",
  inputArtifacts: [proposalPath, validationPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-wiring-intent/v9.4.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceWiringProposal: "hermes-agentic-run-v3-quality-gate-wiring-proposal-v9.3",
    sourceEnforcementValidation: "hermes-agentic-run-v3-quality-gate-enforcement-validation-v9.2"
  },
  wiringIntent: {
    id: "run-v3-quality-gate-wiring-intent-v9.4",
    title: "Hermes Agentic Loop Quality Gate Wiring Intent",
    type: "quality-gate-wiring-intent",
    summary:
      "Declare the bounded implementation intent for wiring validated qualityGate enforcement into future Hermes agentic workflow artifacts.",
    proposedPatchShape: {
      generator:
        "scripts/write-hermes-agentic-run-v3-quality-gate-wiring-implementation-v9-5.ts",
      gate:
        "evaluations/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9-5-gate.ts",
      machineArtifact:
        "hermes/agentic-workflow/run-v3/quality-gate-wiring-implementation/v9.5.json",
      reportJson:
        "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.json",
      reportMarkdown:
        "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-implementation-v9.5.md"
    },
    wiringScope: wiringTargets.map((target: any) => ({
      phase: target.phase,
      target: target.target,
      required: target.required,
      patchNow: false,
      intent: target.wiring
    })),
    requiredGateOutputs,
    failClosedPolicy,
    implementationRules: [
      "Read v9.3 wiring proposal as the source of truth.",
      "Do not broadly rewrite existing workflow scripts in v9.4.",
      "Declare wiring intent before modifying future patch/apply generators.",
      "Future source-patch-apply artifacts must include complete qualityGate status before readiness.",
      "Future source-patch-validation artifacts must fail closed when qualityGate is missing, failed, null, or incomplete.",
      "Future branch preparation must confirm generated drift is clean or declared.",
      "Future PR draft, post-merge ledger, and run-index artifacts must carry qualityGate status."
    ],
    expectedNextStep:
      "Generate v9.5 quality gate wiring implementation artifact and gate; do not perform a broad source rewrite."
  },
  safetyBoundary: {
    intentOnly: true,
    broadSourceRewrite: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforePatch: true
  },
  validationResults,
  checks: {
    runtimeLabeled: true,
    statusIntentDeclared: true,
    wiringProposalReady: proposal.status === "proposed",
    enforcementValidationReady: validation.status === "validated",
    proposedPatchShapeDeclared: true,
    wiringScopeDeclared: wiringTargets.length >= 5,
    requiredGateOutputsCarriedForward: requiredGateOutputs.length >= 5,
    failClosedPolicyCarriedForward: failClosedPolicy.length >= 3,
    implementationRulesDeclared: true,
    validationsPassed: validationResults.every((result) => result.passed),
    intentOnly: true,
    noBroadSourceRewrite: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This declares wiring intent for qualityGate enforcement.",
    "It does not modify future workflow scripts yet.",
    "The next safe step is v9.5 wiring implementation."
  ]
};

const machinePath =
  "hermes/agentic-workflow/run-v3/quality-gate-wiring-intent/v9.4.json";
const reportJsonPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4.json";
const reportMarkdownPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-wiring-intent-v9.4.md";

writeJson(machinePath, artifact);
writeJson(reportJsonPath, artifact);

const md = [
  "# Hermes Agentic Run v3 Quality Gate Wiring Intent v9.4",
  "",
  `- Runtime: ${runtime}`,
  `- Generated: ${generatedAt}`,
  `- Status: ${artifact.status}`,
  `- Source proposal: ${artifact.run.sourceWiringProposal}`,
  `- Source validation: ${artifact.run.sourceEnforcementValidation}`,
  "",
  "## Intent",
  "",
  artifact.wiringIntent.summary,
  "",
  "## Wiring Scope",
  "",
  ...artifact.wiringIntent.wiringScope.map(
    (target: any) =>
      `- ${target.phase}: ${target.intent} (${target.target})`
  ),
  "",
  "## Required Gate Outputs",
  "",
  ...requiredGateOutputs.map((field: string) => `- ${field}`),
  "",
  "## Fail-Closed Policy",
  "",
  ...failClosedPolicy.map((rule: string) => `- ${rule}`),
  "",
  "## Safety",
  "",
  "- Intent only.",
  "- No broad source rewrite.",
  "- No patch applied.",
  "- No branch created.",
  "- No push, PR, merge, or lifecycle action.",
  "",
  "## Next Step",
  "",
  artifact.wiringIntent.expectedNextStep,
  ""
].join("\n");

fs.mkdirSync(path.dirname(path.join(root, reportMarkdownPath)), {
  recursive: true
});
fs.writeFileSync(path.join(root, reportMarkdownPath), md);

console.log(JSON.stringify(artifact, null, 2));
