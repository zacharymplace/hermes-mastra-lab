import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();

const readJson = (p: string) =>
  JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

const writeJson = (p: string, value: unknown) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(value, null, 2) + "\n");
};

const writeMd = (p: string, content: string) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
};

const run = (command: string, args: string[]) => {
  try {
    execFileSync(command, args, { cwd: root, stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
};

const generatedAt = new Date().toISOString();

const adoption = readJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.json"
);

const implementation = readJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json"
);

const validation = readJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.json"
);

const outJson = "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-report-v8.8.json";
const outMd = "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-report-v8.8.md";
const machine = "hermes/agentic-workflow/run-v3/quality-gate-adoption-report/v8.8.json";

const validationResults = [
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-adoption:v8.7:gate",
    passed: run("npm", ["run", "hermes:agentic-run-v3-quality-gate-adoption:v8.7:gate"])
  },
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-validation:v8.6:gate",
    passed: run("npm", ["run", "hermes:agentic-run-v3-quality-gate-validation:v8.6:gate"])
  },
  {
    command: "npm run hermes:agentic-run-v3-quality-gate-implementation:v8.5:gate",
    passed: run("npm", ["run", "hermes:agentic-run-v3-quality-gate-implementation:v8.5:gate"])
  }
];

const futurePhases =
  adoption.adoptionContract?.appliesToFuturePhases ?? [];

const requiredChecks =
  adoption.adoptionContract?.requiredBeforePatchApply ?? [];

const adoptionRules =
  adoption.adoptionContract?.adoptionRules ?? [];

const qualityChecks =
  validation.validation?.qualityChecksImplemented ?? [];

const checks = {
  runtimeLabeled: true,
  statusReported: true,
  adoptionContractReady: adoption.status === "contracted",
  implementationReady: implementation.status === "implemented",
  validationReady: validation.status === "validated",
  requiredChecksDeclared: requiredChecks.length >= 5,
  futurePhasesDeclared: futurePhases.length >= 5,
  adoptionRulesDeclared: adoptionRules.length >= 5,
  qualityChecksValidated: qualityChecks.every((check: any) => check.implemented === true && check.passed === true),
  validationsPassed: validationResults.every((result) => result.passed),
  reportOnly: true,
  noPatchApplied: true,
  noBranchCreated: true,
  noPush: true,
  noMerge: true,
  noPrOpened: true
};

const report = {
  runtime: "hermes-agentic-run-v3-quality-gate-adoption-report-v8.8",
  generatedAt,
  status: "reported",
  inputArtifacts: [
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json"
  ],
  outputArtifacts: [machine, outJson, outMd],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceAdoptionContract: "hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7",
    sourceValidation: "hermes-agentic-run-v3-quality-gate-validation-v8.6",
    sourceImplementation: "hermes-agentic-run-v3-quality-gate-implementation-v8.5"
  },
  adoptionReport: {
    id: "run-v3-quality-gate-adoption-report-v8.8",
    title: "Hermes Agentic Loop Quality Gate Adoption Report",
    summary: "Reports where the validated loop-quality gate is now required in future Hermes agentic workflow phases.",
    requiredBeforePatchApply: requiredChecks,
    appliesToFuturePhases: futurePhases,
    adoptionRules,
    validatedChecks: qualityChecks,
    nextRecommendedStep: {
      id: "run-v3-quality-gate-enforcement-plan-v8.9",
      title: "Quality Gate Enforcement Plan v8.9",
      summary: "Define how future patch/apply scripts will call and enforce the adopted loop-quality gate."
    }
  },
  safetyBoundary: {
    reportOnly: true,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  validationResults,
  checks,
  notes: [
    "This report makes v8.7 adoption visible as an operating artifact.",
    "It does not enforce the gate yet; it reports the adoption surface.",
    "The next safe step is v8.9 enforcement planning."
  ]
};

writeJson(machine, report);
writeJson(outJson, report);

writeMd(
  outMd,
  `# Hermes Agentic Run v3 Quality Gate Adoption Report v8.8

- Runtime: ${report.runtime}
- Status: ${report.status}
- Generated: ${generatedAt}
- Run: ${report.run.id}
- Selected target: ${report.run.selectedTarget}

## Required Before Patch Apply

${requiredChecks.map((id: string) => `- ${id}`).join("\n")}

## Applies To Future Phases

${futurePhases.map((phase: string) => `- ${phase}`).join("\n")}

## Adoption Rules

${adoptionRules.map((rule: string) => `- ${rule}`).join("\n")}

## Validation

${validationResults.map((result) => `- ${result.passed ? "PASS" : "FAIL"}: \`${result.command}\``).join("\n")}

## Safety

- Report only.
- No patch applied.
- No branch created.
- No push.
- No merge.
- No PR opened.

## Next

${report.adoptionReport.nextRecommendedStep.summary}
`
);

console.log(JSON.stringify(report, null, 2));
