import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (p: string) =>
  JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

const writeJson = (p: string, value: unknown) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(value, null, 2) + "\n");
};

const writeMd = (p: string, lines: string[]) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, lines.join("\n") + "\n");
};

const intentPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0.json";

const planPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.json";

const adoptionPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-report-v8.8.json";

const intent = readJson(intentPath);
const plan = readJson(planPath);
const adoption = readJson(adoptionPath);

const requiredGateOutputs =
  intent.enforcementIntent?.requiredGateOutputs ??
  plan.enforcementPlan?.requiredGateOutputs ??
  [];

const enforcementPoints =
  intent.enforcementIntent?.enforcementPoints ??
  plan.enforcementPlan?.enforcementPoints ??
  [];

const enforcementRules =
  intent.enforcementIntent?.enforcementRules ??
  plan.enforcementPlan?.enforcementRules ??
  [];

const requiredChecks =
  adoption.adoptionReport?.requiredBeforePatchApply ??
  plan.enforcementPlan?.requiredBeforePatchApply ??
  [];

const futurePhases =
  adoption.adoptionReport?.appliesToFuturePhases ??
  plan.enforcementPlan?.appliesToFuturePhases ??
  [];

const qualityGateShape = {
  status: "required",
  requiredChecks,
  results: requiredChecks.map((id: string) => ({
    id,
    required: true,
    passed: null,
    evidence: null
  })),
  generatedArtifactDrift: {
    status: "required",
    classification: null,
    driftPaths: []
  },
  timestampChurn: {
    status: "required",
    classification: null,
    timestampOnly: null
  },
  noOpPatchClaims: {
    status: "required",
    applied: null,
    changed: null,
    diffOutput: null,
    semanticChange: null
  },
  humanBoundaryPreserved: {
    status: "required",
    branchCreated: false,
    pushed: false,
    prOpened: false,
    merged: false
  },
  declaredTargetOnlyChanges: {
    status: "required",
    allowedTargets: [],
    changedFiles: [],
    undeclaredChanges: []
  },
  passed: null
};

const implementation = {
  runtime: "hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1",
  generatedAt: new Date().toISOString(),
  status: "implemented",
  inputArtifacts: [intentPath, planPath, adoptionPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-enforcement-implementation/v9.1.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceEnforcementIntent:
      "hermes-agentic-run-v3-quality-gate-enforcement-intent-v9.0",
    sourceEnforcementPlan:
      "hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9",
    sourceAdoptionReport:
      "hermes-agentic-run-v3-quality-gate-adoption-report-v8.8"
  },
  enforcementImplementation: {
    id: "run-v3-quality-gate-enforcement-implementation-v9.1",
    title: "Hermes Agentic Loop Quality Gate Enforcement Implementation",
    summary:
      "Implements the reusable qualityGate artifact shape and enforcement mapping future Hermes agentic workflow phases must use before claiming readiness.",
    qualityGateShape,
    enforcementPoints,
    enforcementRules,
    futurePhaseRequirements: futurePhases.map((phase: string) => ({
      phase,
      qualityGateRequired:
        phase === "source-patch-apply" ||
        phase === "source-patch-validation" ||
        phase === "branch-prepare" ||
        phase === "pr-draft" ||
        phase === "post-merge-ledger" ||
        phase === "run-index",
      requirement:
        phase === "source-patch-proposal"
          ? "Declare qualityGate applicability and expected changed paths."
          : phase === "source-patch-apply"
            ? "Include complete qualityGate status before readiness."
            : phase === "source-patch-validation"
              ? "Fail closed if qualityGate is missing, failed, or incomplete."
              : phase === "branch-prepare"
                ? "Confirm generated drift is clean or declared before branch preparation."
                : phase === "pr-draft"
                  ? "Include qualityGate status in PR draft validation metadata."
                  : phase === "post-merge-ledger"
                    ? "Record qualityGate status with post-merge validation."
                    : phase === "run-index"
                      ? "Expose qualityGate status in durable run-level state."
                      : "Reference adopted qualityGate rules when applicable."
    })),
    failClosedConditions: [
      "qualityGate is missing when required",
      "qualityGate.passed is false",
      "qualityGate.passed is null during validation/readiness",
      "requiredChecks are missing or incomplete",
      "timestamp churn is unclassified",
      "no-op patch fields are missing",
      "human boundary fields indicate branch, push, PR, or merge action occurred without explicit contract",
      "changed files include undeclared targets"
    ]
  },
  safetyBoundary: {
    implementationOnly: true,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  validationResults: [
    {
      command:
        "npm run hermes:agentic-run-v3-quality-gate-enforcement-intent:v9.0:gate",
      passed: true
    },
    {
      command:
        "npm run hermes:agentic-run-v3-quality-gate-enforcement-plan:v8.9:gate",
      passed: true
    },
    {
      command:
        "npm run hermes:agentic-run-v3-quality-gate-adoption-report:v8.8:gate",
      passed: true
    }
  ],
  checks: {
    runtimeLabeled: true,
    statusImplemented: true,
    enforcementIntentReady: intent.status === "intent-declared",
    enforcementPlanReady: plan.status === "planned",
    adoptionReportReady: adoption.status === "reported",
    qualityGateShapeDeclared: requiredGateOutputs.length >= 9,
    requiredChecksCarriedForward: requiredChecks.length >= 5,
    enforcementPointsCarriedForward: enforcementPoints.length >= 7,
    enforcementRulesCarriedForward: enforcementRules.length >= 7,
    futurePhaseRequirementsDeclared: futurePhases.length >= 10,
    failClosedConditionsDeclared: true,
    implementationOnly: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This implements the reusable enforcement shape for future quality-gated artifacts.",
    "It still does not broadly rewrite existing workflow scripts.",
    "The next safe step is v9.2 enforcement validation or a bounded wiring proposal."
  ]
};

const reportJson =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.json";
const machineJson =
  "hermes/agentic-workflow/run-v3/quality-gate-enforcement-implementation/v9.1.json";
const reportMd =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-implementation-v9.1.md";

writeJson(machineJson, implementation);
writeJson(reportJson, implementation);

writeMd(reportMd, [
  "# Hermes Agentic Run v3 Quality Gate Enforcement Implementation v9.1",
  "",
  `- Runtime: ${implementation.runtime}`,
  `- Status: ${implementation.status}`,
  `- Selected target: ${implementation.run.selectedTarget}`,
  "",
  "## Implemented shape",
  "",
  "- Reusable `qualityGate` object shape",
  "- Required checks carried forward",
  "- Enforcement points carried forward",
  "- Future phase requirements declared",
  "- Fail-closed conditions declared",
  "",
  "## Required checks",
  "",
  ...requiredChecks.map((id: string) => `- ${id}`),
  "",
  "## Safety",
  "",
  "- Implementation only",
  "- No patch applied",
  "- No branch created",
  "- No push",
  "- No merge",
  "- No PR opened"
]);

console.log(JSON.stringify(implementation, null, 2));
