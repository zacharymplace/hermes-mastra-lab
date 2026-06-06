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

const validationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-validation-v8.6.json";

const implementationPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json";

const validation = readJson(validationPath);
const implementation = readJson(implementationPath);

const validationCommands = [
  "npm run hermes:agentic-run-v3-quality-gate-validation:v8.6:gate",
  "npm run hermes:agentic-run-v3-quality-gate-implementation:v8.5:gate"
];

const validationResults = validationCommands.map((command) => {
  const result = run("npm", ["run", command.replace("npm run ", "")]);

  return {
    command,
    passed: result.passed,
    output: result.output
  };
});

const report = {
  runtime: "hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7",
  generatedAt: new Date().toISOString(),
  status: "contracted",
  inputArtifacts: [validationPath, implementationPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-adoption-contract/v8.7.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceValidation: "hermes-agentic-run-v3-quality-gate-validation-v8.6",
    sourceImplementation: "hermes-agentic-run-v3-quality-gate-implementation-v8.5"
  },
  adoptionContract: {
    id: "run-v3-quality-gate-adoption-contract",
    title: "Hermes Agentic Loop Quality Gate Adoption Contract",
    purpose:
      "Require future Hermes agentic patch/apply steps to run the loop-quality gate before claiming readiness.",
    appliesToFuturePhases: [
      "patch-intent",
      "target-selection",
      "source-patch-proposal",
      "source-patch-apply",
      "source-patch-validation",
      "branch-prepare",
      "pr-draft",
      "pr-lifecycle",
      "post-merge-ledger",
      "run-index"
    ],
    requiredBeforePatchApply: [
      "generated-artifact-drift",
      "stale-timestamp-churn",
      "no-op-patch-claims",
      "human-boundary-preservation",
      "declared-target-only-changes"
    ],
    adoptionRules: [
      "Every future source patch proposal must declare whether it is subject to the loop-quality gate.",
      "Every future source patch apply step must include quality gate status before reporting readiness.",
      "Patch apply reports must include applied, changed, diffOutput, and semanticChange fields.",
      "Timestamp-only changes must be classified separately from semantic changes.",
      "Generated artifact drift must be either committed as a declared output or restored before final clean state.",
      "Branch, push, PR creation, and merge remain operator-controlled unless a later explicit contract changes that boundary.",
      "Changed paths must be compared against declared targets before a patch is considered clean."
    ],
    proposedNextStep: {
      id: "run-v3-quality-gate-adoption-report-v8.8",
      title: "Quality Gate Adoption Report v8.8",
      summary:
        "Generate an adoption report showing where the v8.7 contract is now required in the Hermes agentic loop."
    }
  },
  safetyBoundary: {
    contractOnly: true,
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
    statusContracted: true,
    validationReady: validation.status === "validated",
    implementationReady: implementation.status === "implemented",
    qualityGateValidated: validation.checks?.statusValidated === true,
    priorFailureResolved:
      validation.checks?.priorDeclaredTargetFailureResolved === true,
    adoptionRulesDeclared: true,
    futurePhasesDeclared: true,
    requiredChecksDeclared: true,
    validationsPassed: validationResults.every((result) => result.passed),
    contractOnly: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This contract moves the v8.5/v8.6 quality gate from validated artifact to future loop requirement.",
    "It does not apply a patch, create a branch, push, merge, or open a PR.",
    "The next safe step is v8.8 quality gate adoption report."
  ]
};

writeJson(
  "hermes/agentic-workflow/run-v3/quality-gate-adoption-contract/v8.7.json",
  report
);

writeJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.json",
  report
);

const md = [
  "# Hermes Agentic Run v3 Quality Gate Adoption Contract v8.7",
  "",
  `- Runtime: ${report.runtime}`,
  `- Status: ${report.status}`,
  `- Generated: ${report.generatedAt}`,
  `- Source validation: ${report.run.sourceValidation}`,
  `- Source implementation: ${report.run.sourceImplementation}`,
  "",
  "## Adoption Rules",
  "",
  ...report.adoptionContract.adoptionRules.map((rule) => `- ${rule}`),
  "",
  "## Required Checks Before Patch Apply",
  "",
  ...report.adoptionContract.requiredBeforePatchApply.map((check) => `- ${check}`),
  "",
  "## Safety",
  "",
  `- Contract only: ${report.safetyBoundary.contractOnly}`,
  `- Patch applied: ${report.safetyBoundary.patchApplied}`,
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
  path.join(
    root,
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-adoption-contract-v8.7.md"
  ),
  md + "\n"
);

console.log(JSON.stringify(report, null, 2));
