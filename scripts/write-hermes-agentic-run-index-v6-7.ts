import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function exists(relativePath: string) {
  return fs.existsSync(path.join(root, relativePath));
}

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function run(command: string) {
  try {
    const output = execSync(command, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    return { command, passed: true, output };
  } catch (error: any) {
    return {
      command,
      passed: false,
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`
    };
  }
}

const artifacts = [
  {
    id: "v1-workflow-plan",
    phase: "plan",
    path: "hermes/agentic-workflow/v1.json",
    required: true
  },
  {
    id: "v2-execution",
    phase: "execute",
    path: "reports/agentic-workflow/hermes-agentic-execution-v2.json",
    required: true
  },
  {
    id: "v3-patch-apply",
    phase: "patch",
    path: "reports/agentic-workflow/hermes-agentic-patch-apply-v3.json",
    required: true
  },
  {
    id: "v4-pr-draft",
    phase: "pr-draft",
    path: "reports/agentic-workflow/pr-drafts/hermes-agentic-pr-draft-v4-report.json",
    required: true
  },
  {
    id: "v5-branch-prepare",
    phase: "branch",
    path: "reports/agentic-workflow/branch-prep/hermes-agentic-branch-prepare-v5.json",
    required: true
  },
  {
    id: "v6-operator-boundary",
    phase: "operator-boundary",
    path: "reports/agentic-workflow/operator-boundary/hermes-agentic-operator-boundary-v6.json",
    required: true
  },
  {
    id: "v6.5-pr-lifecycle",
    phase: "pr-lifecycle",
    path: "reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.json",
    required: true
  },
  {
    id: "v6.6-post-merge-ledger",
    phase: "post-merge-ledger",
    path: "reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.json",
    required: true
  },
  {
    id: "sentra-ledger",
    phase: "operating-memory",
    path: "sentra/ledger/post-merge-validation.json",
    required: true
  }
];

const indexedArtifacts = artifacts.map((artifact) => {
  const present = exists(artifact.path);
  const parsed = present ? readJson(artifact.path) : null;

  return {
    ...artifact,
    present,
    runtime: parsed?.runtime ?? null,
    status: parsed?.status ?? null,
    generatedAt: parsed?.generatedAt ?? parsed?.updatedAt ?? null
  };
});

const lifecycle = exists("reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.json")
  ? readJson("reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.json")
  : null;

const postMerge = exists("reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.json")
  ? readJson("reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.json")
  : null;

const validationResults = [
  run("npm run hermes:agentic-pr-lifecycle:v6.5:gate"),
  run("npm run hermes:post-merge-ledger:v6.6:gate")
];

const requiredPresent = indexedArtifacts
  .filter((artifact) => artifact.required)
  .every((artifact) => artifact.present);

const validationsPassed = validationResults.every((result) => result.passed);
const merged = lifecycle?.lifecycleState === "merged";
const ledgerRecorded = postMerge?.status === "recorded";

const runIndex = {
  runtime: "hermes-agentic-run-index-v6.7",
  generatedAt: new Date().toISOString(),
  status:
    requiredPresent && validationsPassed && merged && ledgerRecorded
      ? "complete"
      : "incomplete",
  run: {
    id: "hermes-agentic-workflow-v1-through-v6.7",
    selectedProjectId: "hermes-agentic-workflow",
    selectedProjectName: "Hermes Agentic Workflow",
    startPhase: "plan",
    endPhase: "post-merge-ledger",
    currentState:
      requiredPresent && validationsPassed && merged && ledgerRecorded
        ? "completed-and-recorded"
        : "needs-review"
  },
  artifacts: indexedArtifacts,
  lifecycle: {
    prNumber: lifecycle?.prNumber ?? null,
    prUrl: lifecycle?.pr?.url ?? null,
    lifecycleState: lifecycle?.lifecycleState ?? null,
    mergedAt: lifecycle?.pr?.mergedAt ?? null,
    mergeCommit: lifecycle?.pr?.mergeCommit?.oid ?? null,
    branchStatus: lifecycle?.observations?.postMergeBranchStatus ?? null
  },
  ledger: {
    entryId: postMerge?.entry?.id ?? null,
    totalEntries: postMerge?.ledgerSummary?.totalEntries ?? null,
    recorded: ledgerRecorded
  },
  validationResults: validationResults.map((result) => ({
    command: result.command,
    passed: result.passed
  })),
  checks: {
    runtimeLabeled: true,
    requiredArtifactsPresent: requiredPresent,
    validationsPassed,
    lifecycleMerged: merged,
    postMergeLedgerRecorded: ledgerRecorded,
    runStateComplete:
      requiredPresent && validationsPassed && merged && ledgerRecorded,
    prLinked: Boolean(lifecycle?.pr?.url),
    ledgerLinked: Boolean(postMerge?.entry?.id)
  },
  notes: [
    "This index ties together the Hermes agentic workflow chain from v1 through v6.6.",
    "It gives Hermes one durable artifact for run-level status.",
    "Future work can use this as the source for selecting the next agentic step."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/run-index/v6.7.json"),
  JSON.stringify(runIndex, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.json"),
  JSON.stringify(runIndex, null, 2) + "\n"
);

const md = [
  "# Hermes Agentic Run Index v6.7",
  "",
  `Generated: ${runIndex.generatedAt}`,
  `Status: ${runIndex.status}`,
  `Run state: ${runIndex.run.currentState}`,
  "",
  "## Run",
  "",
  `- ID: \`${runIndex.run.id}\``,
  `- Project: ${runIndex.run.selectedProjectName}`,
  `- Start phase: ${runIndex.run.startPhase}`,
  `- End phase: ${runIndex.run.endPhase}`,
  "",
  "## Lifecycle",
  "",
  `- PR: #${runIndex.lifecycle.prNumber}`,
  `- URL: ${runIndex.lifecycle.prUrl}`,
  `- State: ${runIndex.lifecycle.lifecycleState}`,
  `- Merged at: ${runIndex.lifecycle.mergedAt}`,
  `- Merge commit: ${runIndex.lifecycle.mergeCommit}`,
  `- Branch status: ${runIndex.lifecycle.branchStatus}`,
  "",
  "## Artifacts",
  "",
  ...runIndex.artifacts.map(
    (artifact) =>
      `- ${artifact.present ? "✅" : "❌"} ${artifact.id} — \`${artifact.path}\``
  ),
  "",
  "## Validation",
  "",
  ...runIndex.validationResults.map(
    (result) => `- \`${result.command}\`: ${result.passed ? "PASS" : "FAIL"}`
  ),
  "",
  "## Notes",
  "",
  ...runIndex.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/run-index/hermes-agentic-run-index-v6.7.md"),
  md
);

console.log(JSON.stringify(runIndex, null, 2));

if (runIndex.status !== "complete") {
  process.exit(1);
}
