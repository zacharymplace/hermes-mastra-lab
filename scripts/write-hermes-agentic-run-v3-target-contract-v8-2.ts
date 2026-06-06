import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const writeJson = (relativePath: string, value: unknown) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
};

const writeMd = (relativePath: string, lines: string[]) => {
  const fullPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, `${lines.join("\n")}\n`);
};

const selector = readJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-selector-v8.1.json"
);

const selected = selector.selected;

const report = {
  runtime: "hermes-agentic-run-v3-target-contract-v8.2",
  generatedAt: new Date().toISOString(),
  status: "contracted",
  inputArtifacts: [
    "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-selector-v8.1.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-index-v8.0.json",
    "sentra/ledger/post-merge-validation.json"
  ],
  selectedRunV3Target: selected,
  runV3: {
    id: "hermes-agentic-run-v3",
    purpose:
      "Harden the Hermes agentic loop before starting another broad patch cycle.",
    targetType: "loop-quality-hardening-contract",
    targetName: "Hermes Agentic Run v3 Loop Quality Contract",
    objective:
      "Define required quality checks for generated drift, stale timestamp churn, no-op patch claims, and human-boundary preservation before run v3 can propose source changes.",
    sourceRun: "hermes-agentic-run-v2",
    sourceSelector: "hermes-agentic-run-v3-selector-v8.1"
  },
  qualityGates: [
    {
      id: "generated-artifact-drift",
      name: "Generated Artifact Drift",
      requirement:
        "Generated reports must not leave unstaged drift after validation unless explicitly committed as a declared output.",
      failureMode:
        "Running checks rewrites report artifacts and leaves the repo dirty."
    },
    {
      id: "stale-timestamp-churn",
      name: "Stale Timestamp Churn",
      requirement:
        "Timestamp-only rewrites must be classified separately from semantic changes.",
      failureMode:
        "Repeated commands create noisy commits that only update generatedAt fields."
    },
    {
      id: "no-op-patch-claims",
      name: "No-op Patch Claims",
      requirement:
        "Patch apply reports must distinguish changed=true from applied=true.",
      failureMode:
        "A patch step claims success even when no meaningful file diff exists."
    },
    {
      id: "human-boundary-preservation",
      name: "Human Boundary Preservation",
      requirement:
        "Workflow artifacts may prepare metadata, but branch push, PR creation, and merge remain operator-controlled.",
      failureMode:
        "The workflow reports or performs GitHub lifecycle actions as if autonomous."
    },
    {
      id: "declared-target-only-changes",
      name: "Declared Target Only Changes",
      requirement:
        "Run v3 may only modify files declared in the active contract or approval artifact.",
      failureMode:
        "Patch logic edits broad source files outside the declared target set."
    }
  ],
  allowedTargets: [
    {
      path: "scripts/write-hermes-agentic-run-v3-target-contract-v8-2.ts",
      reason: "Generator for the v8.2 loop quality contract."
    },
    {
      path: "evaluations/hermes-agentic-run-v3-target-contract-v8-2-gate.ts",
      reason: "Gate for contract validity."
    },
    {
      path: "hermes/agentic-workflow/run-v3/target-contract/v8.2.json",
      reason: "Machine-readable contract artifact."
    },
    {
      path: "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.json",
      reason: "Audit report artifact."
    },
    {
      path: "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.md",
      reason: "Human-readable review artifact."
    },
    {
      path: "package.json",
      reason: "Expose v8.2 commands."
    }
  ],
  disallowedTargets: [
    "secrets",
    ".env files",
    "credential stores",
    "destructive git operations",
    "auto-push",
    "auto-merge",
    "auto PR creation",
    "broad source rewrites outside declared targets",
    "timestamp-only commits without semantic justification"
  ],
  successCriteria: [
    "v8.1 selected loop-quality hardening.",
    "Run v2 index is complete.",
    "Sentra post-merge ledger has at least two entries.",
    "Quality gates are explicit and testable.",
    "Allowed and disallowed targets are explicit.",
    "Run v3 remains contract-only before any patch proposal."
  ],
  safetyBoundary: {
    contractOnly: true,
    patchGenerated: false,
    patchApplied: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    humanApprovalRequiredBeforePatch: true
  },
  checks: {
    runtimeLabeled: true,
    selectorChoseLoopQuality: selected?.id === "loop-quality-hardening",
    targetDeclared: true,
    qualityGatesDeclared: true,
    generatedDriftGateDeclared: true,
    timestampChurnGateDeclared: true,
    noOpPatchGateDeclared: true,
    humanBoundaryGateDeclared: true,
    declaredTargetsGateDeclared: true,
    allowedTargetsDeclared: true,
    disallowedTargetsDeclared: true,
    contractOnly: true,
    noPatchGenerated: true,
    noPatchApplied: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This contract prevents run v3 from becoming another unconstrained artifact loop.",
    "The selected target is loop-quality hardening, not another full patch cycle.",
    "The next safe step is a v8.3 quality-gate plan or patch intent."
  ]
};

writeJson("hermes/agentic-workflow/run-v3/target-contract/v8.2.json", report);
writeJson(
  "reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.json",
  report
);

writeMd("reports/agentic-workflow/run-v3/hermes-agentic-run-v3-target-contract-v8.2.md", [
  "# Hermes Agentic Run v3 Target Contract v8.2",
  "",
  `- Runtime: ${report.runtime}`,
  `- Status: ${report.status}`,
  `- Target: ${report.runV3.targetName}`,
  `- Objective: ${report.runV3.objective}`,
  "",
  "## Quality Gates",
  "",
  ...report.qualityGates.map(
    (gate) =>
      `- ${gate.name}: ${gate.requirement} Failure mode: ${gate.failureMode}`
  ),
  "",
  "## Safety Boundary",
  "",
  "- Contract only.",
  "- No patch generated.",
  "- No patch applied.",
  "- No branch created.",
  "- No push, PR, or merge.",
  "- Human approval required before patching.",
  "",
  "## Next Step",
  "",
  "Create v8.3 quality-gate plan or patch intent."
]);

console.log(JSON.stringify(report, null, 2));
