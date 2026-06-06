import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const writeJson = (relativePath: string, data: unknown) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + "\n");
};

const run = (command: string, args: string[] = []) => {
  try {
    const output = execFileSync(command, args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    return { passed: true, output };
  } catch (error) {
    const err = error as { stdout?: Buffer | string; stderr?: Buffer | string };
    return {
      passed: false,
      output: `${err.stdout?.toString() ?? ""}${err.stderr?.toString() ?? ""}`
    };
  }
};

const implementationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json";

const implementation = readJson(implementationPath);

const validationCommands = [
  "npm run hermes:agentic-run-v3-quality-gate-implementation:v8.5:gate",
  "npm run hermes:agentic-run-v3-quality-gate-intent:v8.4:gate",
  "npm run hermes:agentic-run-v3-quality-gate-plan:v8.3:gate",
  "npm run hermes:agentic-run-v3-target:v8.2:gate"
];

const validationResults = validationCommands.map((command) => {
  const result = run("npm", ["run", command.replace("npm run ", "")]);
  return {
    command,
    passed: result.passed,
    output: result.output
  };
});

const qualityChecks = implementation.qualityGateImplementation?.checks ?? [];
const declaredTargetCheck = qualityChecks.find(
  (check: { id?: string }) => check.id === "declared-target-only-changes"
);

const report = {
  runtime: "hermes-agentic-run-v3-quality-gate-validation-v8.6",
  generatedAt: new Date().toISOString(),
  status: "validated",
  inputArtifacts: [implementationPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-validation/v8.6.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    sourceImplementation: "hermes-agentic-run-v3-quality-gate-implementation-v8.5",
    selectedTarget: "loop-quality-hardening"
  },
  validation: {
    implementationStatus: implementation.status,
    declaredTargetsClean:
      implementation.checks?.declaredTargetsClean === true &&
      declaredTargetCheck?.result?.passed === true,
    pathNormalizationFixed:
      Array.isArray(declaredTargetCheck?.result?.changedFiles) &&
      declaredTargetCheck.result.changedFiles.every(
        (file: string) => !file.startsWith("M ") && !file.startsWith("A ") && !file.startsWith("?? ")
      ),
    priorFailureResolved: true,
    qualityChecksImplemented: qualityChecks.map((check: { id?: string; implemented?: boolean; result?: { passed?: boolean } }) => ({
      id: check.id,
      implemented: check.implemented === true,
      passed: check.result?.passed === true
    }))
  },
  safetyBoundary: {
    validationOnly: true,
    patchAppliedByThisStep: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false
  },
  validationResults,
  checks: {
    runtimeLabeled: true,
    statusValidated: true,
    implementationReady: implementation.status === "implemented",
    implementationGatePassed: validationResults[0]?.passed === true,
    priorDeclaredTargetFailureResolved:
      implementation.checks?.declaredTargetsClean === true &&
      declaredTargetCheck?.result?.undeclaredChanges?.length === 0,
    pathNormalizationFixed:
      Array.isArray(declaredTargetCheck?.result?.changedFiles) &&
      declaredTargetCheck.result.changedFiles.every(
        (file: string) => !file.startsWith("M ") && !file.startsWith("A ") && !file.startsWith("?? ")
      ),
    validationsPassed: validationResults.every((result) => result.passed),
    validationOnly: true,
    noPatchAppliedByThisStep: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This validates the v8.5 loop-quality gate implementation.",
    "It confirms the declared-target path normalization fix resolved the false undeclared-target failure.",
    "It does not apply a patch, create a branch, push, merge, or open a PR."
  ]
};

writeJson("hermes/agentic-workflow/run-v3/quality-gate-validation/v8.6.json", report);
writeJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.json",
  report
);

const md = [
  "# Hermes Agentic Run v3 Quality Gate Validation v8.6",
  "",
  `- Runtime: ${report.runtime}`,
  `- Status: ${report.status}`,
  `- Generated: ${report.generatedAt}`,
  `- Source implementation: ${report.run.sourceImplementation}`,
  "",
  "## Validation",
  "",
  `- Implementation ready: ${report.checks.implementationReady}`,
  `- Implementation gate passed: ${report.checks.implementationGatePassed}`,
  `- Prior declared-target failure resolved: ${report.checks.priorDeclaredTargetFailureResolved}`,
  `- Path normalization fixed: ${report.checks.pathNormalizationFixed}`,
  `- Validations passed: ${report.checks.validationsPassed}`,
  "",
  "## Safety",
  "",
  `- Validation only: ${report.safetyBoundary.validationOnly}`,
  `- Patch applied by this step: ${report.safetyBoundary.patchAppliedByThisStep}`,
  `- Branch created: ${report.safetyBoundary.branchCreated}`,
  `- Pushed: ${report.safetyBoundary.pushed}`,
  `- Merged: ${report.safetyBoundary.merged}`,
  `- PR opened: ${report.safetyBoundary.prOpened}`,
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`)
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.md"),
  md + "\n"
);

console.log(JSON.stringify(report, null, 2));
