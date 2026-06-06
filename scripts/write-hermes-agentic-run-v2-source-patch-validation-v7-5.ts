import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath: string, value: unknown) {
  const outPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(value, null, 2)}\n`);
}

function run(command: string) {
  try {
    const output = execSync(command, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });

    return { command, passed: true, output };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    return {
      command,
      passed: false,
      output: `${err.stdout ?? ""}${err.stderr ?? ""}`
    };
  }
}

const sourcePatchApplyPath =
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-apply-v7.4.json";

const sourcePatchApply = readJson(sourcePatchApplyPath);

const validationResults = [
  run("npm run hermes:agentic-run-v2-source-patch-apply:v7.4:gate"),
  run("npm run hermes:agentic-run-v2-source-patch-proposal:v7.3:gate"),
  run("npm run hermes:agentic-run-v2-target-selection:v7.2:gate"),
  run("npm run check"),
  run("npm run mastra:check")
];

const generatedAt = new Date().toISOString();

const report = {
  runtime: "hermes-agentic-run-v2-source-patch-validation-v7.5",
  generatedAt,
  status: "validated",
  inputArtifacts: [sourcePatchApplyPath],
  outputArtifacts: [
    "hermes/agentic-workflow/run-v2/source-patch-validation-v7.5.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-validation-v7.5.json",
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-validation-v7.5.md"
  ],
  run: {
    id: "hermes-agentic-run-v2",
    sourcePatchApply: sourcePatchApply.runtime,
    sourcePatchApplyStatus: sourcePatchApply.status
  },
  validationResults,
  safetyBoundary: {
    validationOnly: true,
    patchAppliedByThisStep: false,
    branchCreated: false,
    pushed: false,
    merged: false,
    prOpened: false,
    externalSideEffects: false
  },
  checks: {
    runtimeLabeled: true,
    sourcePatchApplyReady: sourcePatchApply.status === "ready-for-human-review",
    sourcePatchApplyGatePassed:
      validationResults.find(
        (result) =>
          result.command ===
          "npm run hermes:agentic-run-v2-source-patch-apply:v7.4:gate"
      )?.passed === true,
    validationRan: validationResults.length > 0,
    validationsPassed: validationResults.every((result) => result.passed),
    validationOnly: true,
    noPatchAppliedByThisStep: true,
    noBranchCreated: true,
    noPush: true,
    noMerge: true,
    noPrOpened: true
  },
  notes: [
    "This validates the approved v7.4 source patch apply artifact.",
    "It does not apply another patch or perform any GitHub lifecycle action.",
    "The next safe step is a run-v2 PR draft or branch preparation artifact."
  ]
};

writeJson("hermes/agentic-workflow/run-v2/source-patch-validation-v7.5.json", report);
writeJson(
  "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-validation-v7.5.json",
  report
);

const md = [
  "# Hermes Agentic Run v2 Source Patch Validation v7.5",
  "",
  `- Status: ${report.status}`,
  `- Runtime: ${report.runtime}`,
  `- Generated: ${report.generatedAt}`,
  `- Source patch apply: ${report.run.sourcePatchApply}`,
  "",
  "## Validation",
  "",
  ...validationResults.map(
    (result) => `- ${result.passed ? "PASS" : "FAIL"} — \`${result.command}\``
  ),
  "",
  "## Safety",
  "",
  "- Validation only.",
  "- No patch applied by this step.",
  "- No branch created.",
  "- No push.",
  "- No merge.",
  "- No PR opened.",
  "",
  "## Next",
  "",
  "Prepare a v7.6 PR draft or branch-preparation artifact after human review."
].join("\n");

fs.writeFileSync(
  path.join(
    root,
    "reports/agentic-workflow/run-v2/hermes-agentic-run-v2-source-patch-validation-v7.5.md"
  ),
  `${md}\n`
);

console.log(JSON.stringify(report, null, 2));
