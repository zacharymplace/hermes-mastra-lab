import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

const lifecyclePath = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-lifecycle-v7.8.json"
);

const outMachine = path.join(
  root,
  "hermes/agentic-workflow/run-v2/post-merge/v7.9.json"
);

const outJson = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-post-merge-ledger-v7.9.json"
);

const outMd = path.join(
  root,
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-post-merge-ledger-v7.9.md"
);

const sentraLedgerPath = path.join(root, "sentra/ledger/post-merge-validation.json");

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
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

const lifecycle = readJson(lifecyclePath);
const existingLedger = fs.existsSync(sentraLedgerPath)
  ? readJson(sentraLedgerPath)
  : { runtime: "sentra-post-merge-validation-ledger", entries: [] };

const validationResults = [
  run("npm run hermes:agentic-run-v2-pr-lifecycle:v7.8:gate"),
  run("npm run hermes:agentic-run-v2-source-patch-validation:v7.5:gate"),
  run("npm run check"),
  run("npm run mastra:check")
];

const generatedAt = new Date().toISOString();

const entry = {
  id: "pr-2-run-v2-post-merge-v7.9",
  generatedAt,
  sourceRuntime: "hermes-agentic-run-v2-post-merge-ledger-v7.9",
  runId: "hermes-agentic-run-v2",
  prNumber: lifecycle.prNumber,
  prUrl: lifecycle.pr?.url,
  title: lifecycle.pr?.title,
  lifecycleState: lifecycle.lifecycleState,
  mergedAt: lifecycle.pr?.mergedAt,
  closedAt: lifecycle.pr?.closedAt,
  mergeCommit: lifecycle.pr?.mergeCommit?.oid,
  branchName: lifecycle.pr?.headRefName,
  baseRefName: lifecycle.pr?.baseRefName,
  checks: {
    lifecycleMerged: lifecycle.lifecycleState === "merged",
    lifecycleTracked: lifecycle.status === "tracked",
    postMergeValidationRan: validationResults.length > 0,
    postMergeValidationPassed: validationResults.every((result) => result.passed),
    mergeCommitCaptured: Boolean(lifecycle.pr?.mergeCommit?.oid),
    prUrlCaptured: Boolean(lifecycle.pr?.url),
    branchStatusCaptured: Boolean(lifecycle.observations?.postMergeBranchStatusObserved)
  },
  validationResults: validationResults.map(({ command, passed }) => ({ command, passed })),
  notes: [
    "Run v2 PR lifecycle was tracked after merge.",
    "Post-merge validation ran against main.",
    "This entry makes Hermes agentic run v2 durable in Sentra."
  ]
};

const entries = Array.isArray(existingLedger.entries)
  ? existingLedger.entries.filter((item: any) => item.id !== entry.id)
  : [];

entries.push(entry);

const sentraLedger = {
  runtime: "sentra-post-merge-validation-ledger",
  generatedAt,
  status: "recorded",
  entries
};

const report = {
  runtime: "hermes-agentic-run-v2-post-merge-ledger-v7.9",
  generatedAt,
  status: "recorded",
  inputArtifacts: [
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-pr-lifecycle-v7.8.json"
  ],
  outputArtifacts: [
    "sentra/ledger/post-merge-validation.json",
    "hermes/agentic-workflow/run-v2/post-merge/v7.9.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-post-merge-ledger-v7.9.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-post-merge-ledger-v7.9.md"
  ],
  entry,
  ledgerSummary: {
    totalEntries: sentraLedger.entries.length,
    latestEntryId: entry.id
  },
  checks: {
    runtimeLabeled: true,
    lifecycleMerged: entry.checks.lifecycleMerged,
    lifecycleTracked: entry.checks.lifecycleTracked,
    validationRan: entry.checks.postMergeValidationRan,
    validationPassed: entry.checks.postMergeValidationPassed,
    ledgerEntryWritten: true,
    mergeCommitCaptured: entry.checks.mergeCommitCaptured,
    prUrlCaptured: entry.checks.prUrlCaptured,
    branchStatusCaptured: entry.checks.branchStatusCaptured
  },
  notes: [
    "This is the post-merge durability layer for Hermes agentic run v2.",
    "It records PR lifecycle, merge metadata, and validation results into Sentra.",
    "Future run selection can use this ledger as operating memory."
  ]
};

fs.mkdirSync(path.dirname(outMachine), { recursive: true });
fs.mkdirSync(path.dirname(outJson), { recursive: true });
fs.mkdirSync(path.dirname(sentraLedgerPath), { recursive: true });

fs.writeFileSync(sentraLedgerPath, JSON.stringify(sentraLedger, null, 2) + "\n");
fs.writeFileSync(outMachine, JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

fs.writeFileSync(
  outMd,
  [
    "# Hermes Agentic Run v2 Post-Merge Ledger v7.9",
    "",
    `- Runtime: ${report.runtime}`,
    `- Status: ${report.status}`,
    `- PR: #${entry.prNumber}`,
    `- Lifecycle: ${entry.lifecycleState}`,
    `- Merge commit: ${entry.mergeCommit}`,
    `- Ledger entry: ${entry.id}`,
    "",
    "## Validation",
    "",
    ...entry.validationResults.map(
      (result) => `- ${result.passed ? "PASS" : "FAIL"}: \`${result.command}\``
    ),
    "",
    "## Safety",
    "",
    "- Post-merge validation only.",
    "- No branch creation.",
    "- No push.",
    "- No PR creation.",
    "- No merge.",
    ""
  ].join("\n")
);

console.log(JSON.stringify(report, null, 2));

if (!report.checks.validationPassed) {
  process.exit(1);
}
