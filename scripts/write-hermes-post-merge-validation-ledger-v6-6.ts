import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

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

const lifecycle = readJson(
  "reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.json"
);

const validationResults = [
  run("npm run check"),
  run("npm run mastra:check"),
  run("npm run hermes:agentic-pr-lifecycle:v6.5:gate")
];

const ledgerPath = "sentra/ledger/post-merge-validation.json";
const ledgerFullPath = path.join(root, ledgerPath);

const existingLedger = fs.existsSync(ledgerFullPath)
  ? readJson(ledgerPath)
  : {
      runtime: "sentra-post-merge-validation-ledger",
      entries: []
    };

const entry = {
  id: `pr-${lifecycle.prNumber}-post-merge-v6.6`,
  generatedAt: new Date().toISOString(),
  sourceRuntime: "hermes-post-merge-validation-ledger-v6.6",
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
    postMergeValidationRan: validationResults.length === 3,
    postMergeValidationPassed: validationResults.every((result) => result.passed),
    mergeCommitCaptured: Boolean(lifecycle.pr?.mergeCommit?.oid),
    prUrlCaptured: Boolean(lifecycle.pr?.url)
  },
  validationResults: validationResults.map((result) => ({
    command: result.command,
    passed: result.passed
  })),
  notes: [
    "PR lifecycle was tracked after merge.",
    "Post-merge validation ran against main.",
    "This entry makes the merged agentic workflow result durable in Sentra."
  ]
};

const entries = [
  ...existingLedger.entries.filter((item: any) => item.id !== entry.id),
  entry
];

const ledger = {
  runtime: "sentra-post-merge-validation-ledger",
  updatedAt: entry.generatedAt,
  entries
};

fs.writeFileSync(ledgerFullPath, JSON.stringify(ledger, null, 2) + "\n");

const report = {
  runtime: "hermes-post-merge-validation-ledger-v6.6",
  generatedAt: entry.generatedAt,
  status:
    entry.checks.lifecycleMerged &&
    entry.checks.lifecycleTracked &&
    entry.checks.postMergeValidationPassed
      ? "recorded"
      : "blocked",
  inputArtifacts: [
    "reports/agentic-workflow/pr-lifecycle/hermes-agentic-pr-lifecycle-v6.5.json"
  ],
  outputArtifacts: [
    ledgerPath,
    "hermes/agentic-workflow/post-merge/v6.6.json",
    "reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.json",
    "reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.md"
  ],
  entry,
  ledgerSummary: {
    totalEntries: ledger.entries.length,
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
    prUrlCaptured: entry.checks.prUrlCaptured
  },
  notes: [
    "This is the post-merge durability layer for Hermes agentic workflow results.",
    "It records PR lifecycle, merge metadata, and validation results into Sentra.",
    "Future Sentra prioritization can use this ledger as operating memory."
  ]
};

fs.writeFileSync(
  path.join(root, "hermes/agentic-workflow/post-merge/v6.6.json"),
  JSON.stringify(report, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.json"),
  JSON.stringify(report, null, 2) + "\n"
);

const md = [
  "# Hermes Post-Merge Validation Ledger v6.6",
  "",
  `Generated: ${report.generatedAt}`,
  `Status: ${report.status}`,
  "",
  "## PR",
  "",
  `- PR: #${entry.prNumber}`,
  `- Title: ${entry.title}`,
  `- URL: ${entry.prUrl}`,
  `- Lifecycle: ${entry.lifecycleState}`,
  `- Merged at: ${entry.mergedAt}`,
  `- Merge commit: ${entry.mergeCommit}`,
  "",
  "## Validation",
  "",
  ...entry.validationResults.map(
    (result) => `- \`${result.command}\`: ${result.passed ? "PASS" : "FAIL"}`
  ),
  "",
  "## Ledger",
  "",
  `- Path: \`${ledgerPath}\``,
  `- Total entries: ${ledger.entries.length}`,
  `- Latest entry: \`${entry.id}\``,
  "",
  "## Notes",
  "",
  ...report.notes.map((note) => `- ${note}`),
  ""
].join("\n");

fs.writeFileSync(
  path.join(root, "reports/agentic-workflow/post-merge/hermes-post-merge-validation-ledger-v6.6.md"),
  md
);

console.log(JSON.stringify(report, null, 2));

if (report.status !== "recorded") {
  process.exit(1);
}
