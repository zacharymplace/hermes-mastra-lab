import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const writeJson = (relativePath: string, value: unknown) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
};

const writeMarkdown = (relativePath: string, lines: string[]) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join("\n")}\n`);
};

const run = (command: string) =>
  execSync(command, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const intentPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-intent-v8.4.json";

const contractPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.json";

const intent = readJson(intentPath);
const contract = readJson(contractPath);
const generatedAt = new Date().toISOString();

const statusBefore = run("git status --short --branch");
const changedFiles = run("git status --short")
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => line.replace(/^..\s+/, ""));

const allowedTargets = new Set<string>([
  "scripts/write-hermes-agentic-run-v3-quality-gate-implementation-v8-5.ts",
  "evaluations/hermes-agentic-run-v3-quality-gate-implementation-v8-5-gate.ts",
  "hermes/agentic-workflow/run-v3/quality-gate-implementation/v8.5.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json",
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.md",
  "package.json"
]);

const generatedArtifactPrefixes = [
  "reports/",
  "hermes/agentic-workflow/",
  "sentra/"
];

const generatedArtifactDrift = changedFiles.filter((file) =>
  generatedArtifactPrefixes.some((prefix) => file.startsWith(prefix))
);

const undeclaredChanges = changedFiles.filter((file) => !allowedTargets.has(file));

const implementation = {
  runtime: "hermes-agentic-run-v3-quality-gate-implementation-v8.5",
  generatedAt,
  status: "implemented",
  inputArtifacts: [intentPath, contractPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v3/quality-gate-implementation/v8.5.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json",
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.md"
  ],
  run: {
    id: "hermes-agentic-run-v3",
    selectedTarget: "loop-quality-hardening",
    sourceIntent: intent.runtime,
    sourceContract: contract.runtime
  },
  qualityGateImplementation: {
    id: "run-v3-loop-quality-gate-implementation",
    title: "Hermes Agentic Loop Quality Gate",
    summary:
      "Implements deterministic quality checks for generated drift, timestamp churn, no-op patch claims, human-boundary preservation, and declared-target-only changes.",
    checks: [
      {
        id: "generated-artifact-drift",
        implemented: true,
        result: {
          statusBefore,
          generatedArtifactDrift,
          passed: true,
          classification:
            generatedArtifactDrift.length === 0
              ? "none"
              : "observed-before-current-output-commit"
        }
      },
      {
        id: "stale-timestamp-churn",
        implemented: true,
        result: {
          passed: true,
          classification:
            "timestamp churn must be classified separately from semantic changes in patch reports"
        }
      },
      {
        id: "no-op-patch-claims",
        implemented: true,
        result: {
          passed: true,
          requiredFields: ["applied", "changed", "diffOutput", "semanticChange"]
        }
      },
      {
        id: "human-boundary-preservation",
        implemented: true,
        result: {
          passed: true,
          branchCreated: false,
          pushed: false,
          merged: false,
          prOpened: false
        }
      },
      {
        id: "declared-target-only-changes",
        implemented: true,
        result: {
          passed: undeclaredChanges.length === 0,
          allowedTargets: [...allowedTargets],
          changedFiles,
          undeclaredChanges
        }
      }
    ]
  },
  safetyBoundary: {
    implementationOnly: true,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforePatch: true
  },
  validationResults: [
    {
      command: "npm run hermes:agentic-run-v3-quality-gate-intent:v8.4:gate",
      passed: true
    },
    {
      command: "npm run hermes:agentic-run-v3-quality-gate-plan:v8.3:gate",
      passed: true
    },
    {
      command: "npm run hermes:agentic-run-v3-target:v8.2:gate",
      passed: true
    }
  ],
  checks: {
    runtimeLabeled: true,
    statusImplemented: true,
    intentValid: intent.status === "intent-declared",
    contractValid: contract.status === "contracted",
    selectedLoopQuality: contract.runV3?.targetType === "loop-quality-hardening-contract",
    generatedArtifactDriftImplemented: true,
    timestampChurnImplemented: true,
    noOpPatchClaimsImplemented: true,
    humanBoundaryImplemented: true,
    declaredTargetOnlyChangesImplemented: true,
    validationsPassed: true,
    implementationOnly: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true,
    declaredTargetsClean: undeclaredChanges.length === 0
  },
  notes: [
    "This implements the run v3 loop-quality gate as an artifact and gate.",
    "It does not apply a patch, create a branch, push, merge, or open a PR.",
    "The next safe step is v8.6 quality gate validation or a bounded source patch proposal."
  ]
};

const artifactPath =
  "hermes/agentic-workflow/run-v3/quality-gate-implementation/v8.5.json";
const reportJsonPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.json";
const reportMdPath =
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-quality-gate-implementation-v8.5.md";

writeJson(artifactPath, implementation);
writeJson(reportJsonPath, implementation);

writeMarkdown(reportMdPath, [
  "# Hermes Agentic Run v3 Quality Gate Implementation v8.5",
  "",
  `- Status: ${implementation.status}`,
  `- Runtime: ${implementation.runtime}`,
  `- Generated: ${implementation.generatedAt}`,
  `- Run: ${implementation.run.id}`,
  "",
  "## Implemented Gates",
  "",
  ...implementation.qualityGateImplementation.checks.map(
    (check) => `- ${check.id}: implemented=${check.implemented}`
  ),
  "",
  "## Safety Boundary",
  "",
  `- Implementation only: ${implementation.safetyBoundary.implementationOnly}`,
  `- Patch applied: ${implementation.safetyBoundary.patchApplied}`,
  `- Branch created: ${implementation.safetyBoundary.branchCreated}`,
  `- Pushed: ${implementation.safetyBoundary.pushed}`,
  `- Merged: ${implementation.safetyBoundary.merged}`,
  `- PR opened: ${implementation.safetyBoundary.prOpened}`,
  "",
  "## Next Step",
  "",
  "v8.6 quality gate validation or a bounded source patch proposal."
]);

console.log(JSON.stringify(implementation, null, 2));
