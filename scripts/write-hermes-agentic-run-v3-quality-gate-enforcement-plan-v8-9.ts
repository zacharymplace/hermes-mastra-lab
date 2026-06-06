import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const runtime = "hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9";
const generatedAt = new Date().toISOString();

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function run(command: string) {
  try {
    execSync(command, { stdio: "pipe" });
    return { command, passed: true };
  } catch {
    return { command, passed: false };
  }
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function writeMarkdown(filePath: string, report: any) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const lines = [
    "# Hermes Agentic Run v3 Quality Gate Enforcement Plan v8.9",
    "",
    `- Runtime: ${report.runtime}`,
    `- Status: ${report.status}`,
    `- Generated: ${report.generatedAt}`,
    `- Run: ${report.run.id}`,
    `- Selected target: ${report.run.selectedTarget}`,
    "",
    "## Enforcement Points",
    "",
    ...report.enforcementPlan.enforcementPoints.map(
      (point: any) =>
        `- ${point.phase}: ${point.requirement}`
    ),
    "",
    "## Required Gate Outputs",
    "",
    ...report.enforcementPlan.requiredGateOutputs.map(
      (field: string) => `- ${field}`
    ),
    "",
    "## Rules",
    "",
    ...report.enforcementPlan.enforcementRules.map(
      (rule: string) => `- ${rule}`
    ),
    "",
    "## Validation",
    "",
    ...report.validationResults.map(
      (result: any) =>
        `- ${result.passed ? "PASS" : "FAIL"}: \`${result.command}\``
    ),
    "",
    "## Safety",
    "",
    `- Plan only: ${report.safetyBoundary.planOnly}`,
    `- Patch applied: ${report.safetyBoundary.patchApplied}`,
    `- Branch created: ${report.safetyBoundary.branchCreated}`,
    `- Pushed: ${report.safetyBoundary.pushed}`,
    `- Merged: ${report.safetyBoundary.merged}`,
    `- PR opened: ${report.safetyBoundary.prOpened}`,
    ""
  ];

  fs.writeFileSync(filePath, lines.join("\n"));
}

const adoptionReportPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-report-v8.8.json";

const adoptionContractPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.json";

const adoptionReport = readJson(adoptionReportPath);
const adoptionContract = readJson(adoptionContractPath);

const validationResults = [
  run("npm run hermes:agentic-run-v3-quality-gate-adoption-report:v8.8:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-adoption:v8.7:gate"),
  run("npm run hermes:agentic-run-v3-quality-gate-validation:v8.6:gate")
];

const requiredGateOutputs = [
  "qualityGate.status",
  "qualityGate.requiredChecks",
  "qualityGate.results",
  "qualityGate.generatedArtifactDrift",
  "qualityGate.timestampChurn",
  "qualityGate.noOpPatchClaims",
  "qualityGate.humanBoundaryPreserved",
  "qualityGate.declaredTargetOnlyChanges",
  "qualityGate.passed"
];

const enforcementPoints = [
  {
    phase: "source-patch-proposal",
    requirement:
      "Declare whether the proposed patch is subject to the loop-quality gate and list expected changed paths."
  },
  {
    phase: "source-patch-apply",
    requirement:
      "Run or reference the loop-quality gate before reporting ready-for-human-review."
  },
  {
    phase: "source-patch-validation",
    requirement:
      "Fail validation when gate status is missing, failed, or timestamp/no-op drift is unclassified."
  },
  {
    phase: "branch-prepare",
    requirement:
      "Confirm generated drift is clean or intentionally declared before preparing a branch."
  },
  {
    phase: "pr-draft",
    requirement:
      "Include loop-quality gate status in PR draft metadata and validation section."
  },
  {
    phase: "post-merge-ledger",
    requirement:
      "Record quality gate status with post-merge validation results."
  },
  {
    phase: "run-index",
    requirement:
      "Expose quality gate status as part of durable run-level state."
  }
];

const enforcementRules = [
  "Future patch/apply steps must fail closed when quality gate status is absent.",
  "Patch apply reports must include applied, changed, diffOutput, and semanticChange.",
  "Timestamp-only changes must be classified as noise unless explicitly justified.",
  "Generated artifact drift must be committed as declared output or restored before clean-state claims.",
  "Changed paths must be compared against declared targets before readiness.",
  "Branch, push, PR creation, and merge remain operator-controlled.",
  "The enforcement plan is not itself a source patch application."
];

const report = {
  runtime,
  generatedAt,
  status: "planned",
  inputArtifacts: [adoptionReportPath, adoptionContractPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-enforcement-plan/v8.9.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceAdoptionReport:
      "hermes-agentic-run-v3-quality-gate-adoption-report-v8.8",
    sourceAdoptionContract:
      "hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7"
  },
  enforcementPlan: {
    id: "run-v3-quality-gate-enforcement-plan-v8.9",
    title: "Hermes Agentic Loop Quality Gate Enforcement Plan",
    summary:
      "Defines how future Hermes patch/apply and lifecycle scripts must call or reference the adopted loop-quality gate before claiming readiness.",
    requiredBeforePatchApply:
      adoptionReport.adoptionReport.requiredBeforePatchApply,
    appliesToFuturePhases:
      adoptionReport.adoptionReport.appliesToFuturePhases,
    enforcementPoints,
    requiredGateOutputs,
    enforcementRules,
    proposedNextStep: {
      id: "run-v3-quality-gate-enforcement-intent-v9.0",
      title: "Quality Gate Enforcement Intent v9.0",
      summary:
        "Declare the bounded implementation intent for wiring quality gate enforcement into future patch/apply scripts."
    }
  },
  safetyBoundary: {
    planOnly: true,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  validationResults,
  checks: {
    runtimeLabeled: runtime === "hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9",
    statusPlanned: true,
    adoptionReportReady: adoptionReport.status === "reported",
    adoptionContractReady: adoptionContract.status === "contracted",
    requiredChecksCarriedForward:
      adoptionReport.adoptionReport.requiredBeforePatchApply.length >= 5,
    futurePhasesCarriedForward:
      adoptionReport.adoptionReport.appliesToFuturePhases.length >= 5,
    enforcementPointsDeclared: enforcementPoints.length >= 5,
    requiredGateOutputsDeclared: requiredGateOutputs.length >= 5,
    enforcementRulesDeclared: enforcementRules.length >= 5,
    validationsPassed: validationResults.every((result) => result.passed),
    planOnly: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This turns quality gate adoption into an enforcement plan.",
    "It does not modify future patch/apply scripts yet.",
    "The next safe step is v9.0 enforcement implementation intent."
  ]
};

writeJson(
  "hermes/agentic-workflow/run-v3/quality-gate-enforcement-plan/v8.9.json",
  report
);

writeJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.json",
  report
);

writeMarkdown(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-enforcement-plan-v8.9.md",
  report
);

console.log(JSON.stringify(report, null, 2));
